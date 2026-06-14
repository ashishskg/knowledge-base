## Spring Boot Microservices Example (Java 21, Spring Boot 3)

This file provides a pragmatic reference implementation blueprint for:
- **User Service**
- **Order Service**

It focuses on clean layering, DTOs, REST APIs, and inter-service communication using **RestClient** (and notes for OpenFeign).

---

## 1. Architecture (Example)

```text
Client
  |
  v
API Gateway (optional for local dev)
  |
  +----------------------+
  |                      |
  v                      v
User Service         Order Service
  |                      |
  v                      v
User DB              Order DB
```

---

## 2. Project Structure (Both Services)

```text
src/main/java/com/example/<service>/
  controller/
  service/
  repository/
  dto/
  domain/
src/main/resources/
  application.yml
```

### Best practices
- Keep controllers thin; business logic in services.
- Use DTOs for API boundaries (don’t expose entities).
- Validate inputs (`jakarta.validation`) at the edge.

---

## 3. User Service

### 3.1 APIs

- `POST /users`
- `GET /users/{id}`

### 3.2 DTOs (Java 21 records)

```java
package com.example.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
        @NotBlank String name,
        @Email String email
) {}

public record UserResponse(
        long id,
        String name,
        String email
) {}
```

### 3.3 Service layer

```java
package com.example.users.service;

import com.example.users.dto.CreateUserRequest;
import com.example.users.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class UserService {
    private final AtomicLong idGen = new AtomicLong(1000);
    private final ConcurrentHashMap<Long, UserResponse> store = new ConcurrentHashMap<>();

    public UserResponse create(CreateUserRequest req) {
        long id = idGen.incrementAndGet();
        var user = new UserResponse(id, req.name(), req.email());
        store.put(id, user);
        return user;
    }

    public UserResponse get(long id) {
        var user = store.get(id);
        if (user == null) throw new IllegalArgumentException("User not found: " + id);
        return user;
    }
}
```

### 3.4 Controller

```java
package com.example.users.controller;

import com.example.users.dto.CreateUserRequest;
import com.example.users.dto.UserResponse;
import com.example.users.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public UserResponse create(@Valid @RequestBody CreateUserRequest req) {
        return service.create(req);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable long id) {
        return service.get(id);
    }
}
```

### 3.5 `application.yml` (minimal)

```yaml
server:
  port: 8081
spring:
  application:
    name: user-service
```

---

## 4. Order Service

### 4.1 APIs

- `POST /orders`
- `GET /orders/{id}`

### 4.2 DTOs

```java
package com.example.orders.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateOrderRequest(
        long userId,
        @NotBlank String productId,
        @Min(1) int quantity
) {}

public record OrderResponse(
        long id,
        long userId,
        String productId,
        int quantity,
        String userEmail,   // enriched via User Service call
        String status
) {}
```

### 4.3 Inter-service communication with RestClient

Create a `RestClient` bean:

```java
package com.example.orders.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class HttpClientsConfig {
    @Bean
    RestClient userServiceClient(@Value("${services.user.base-url}") String baseUrl) {
        return RestClient.builder().baseUrl(baseUrl).build();
    }
}
```

User Service client wrapper:

```java
package com.example.orders.service;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class UserServiceClient {
    private final RestClient client;

    public UserServiceClient(RestClient userServiceClient) {
        this.client = userServiceClient;
    }

    public UserDto getUser(long id) {
        return client.get()
                .uri("/users/{id}", id)
                .retrieve()
                .body(UserDto.class);
    }

    public record UserDto(long id, String name, String email) {}
}
```

### 4.4 Order service layer

```java
package com.example.orders.service;

import com.example.orders.dto.CreateOrderRequest;
import com.example.orders.dto.OrderResponse;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {
    private final AtomicLong idGen = new AtomicLong(2000);
    private final ConcurrentHashMap<Long, OrderResponse> store = new ConcurrentHashMap<>();
    private final UserServiceClient users;

    public OrderService(UserServiceClient users) {
        this.users = users;
    }

    public OrderResponse create(CreateOrderRequest req) {
        long id = idGen.incrementAndGet();
        var user = users.getUser(req.userId());
        var order = new OrderResponse(
                id,
                req.userId(),
                req.productId(),
                req.quantity(),
                user.email(),
                "CREATED"
        );
        store.put(id, order);
        return order;
    }

    public OrderResponse get(long id) {
        var order = store.get(id);
        if (order == null) throw new IllegalArgumentException("Order not found: " + id);
        return order;
    }
}
```

### 4.5 Controller

```java
package com.example.orders.controller;

import com.example.orders.dto.CreateOrderRequest;
import com.example.orders.dto.OrderResponse;
import com.example.orders.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest req) {
        return service.create(req);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable long id) {
        return service.get(id);
    }
}
```

### 4.6 `application.yml`

```yaml
server:
  port: 8082
spring:
  application:
    name: order-service

services:
  user:
    base-url: http://localhost:8081   # for local; in K8s use http://user-service
```

---

## 5. OpenFeign alternative (enterprise note)

OpenFeign is useful when you want:
- typed clients
- integrated load balancing and resilience (when paired with Spring Cloud)

Trade-offs:
- adds Spring Cloud dependencies and operational coupling

---

## 6. Best practices

- **Timeouts first** for any inter-service call.
- **Idempotency keys** for POSTs that can be retried.
- Propagate correlation IDs and trace context.
- Prefer async messaging for workflows that can be eventual consistent.

---

## 7. Common mistakes

- Chatty sync calls (N+1 service calls).
- No timeouts/retries strategy.
- Tight coupling via shared DTOs and shared DB.

---

## 8. Enterprise use cases

- API composition: Order service enriches data by calling User service.
- Event-driven enrichment: Order publishes event; other services update projections.

---

## Interview questions

- RestClient vs WebClient vs OpenFeign: when and why?
- How do you make inter-service calls resilient?
- How do you prevent cascading failure from a slow dependency?

