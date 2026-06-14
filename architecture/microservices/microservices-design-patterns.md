## Microservices Design Patterns (Beginner → Enterprise)

This guide explains the most important microservice patterns with diagrams, internal workings, pros/cons, and production guidance.

---

## 1. API Gateway Pattern

### 1.1 Definition
Single entry point that routes requests to internal services and applies cross-cutting concerns.

### 1.2 Why it exists
- Centralizes authentication, rate limiting, routing, and request shaping.
- Reduces duplication across services.

### 1.3 Internal working
- Gateway validates token (OAuth2/JWT), applies policies, forwards to service via discovery/DNS.
- Can do protocol translation (HTTP ↔ gRPC), caching, and retries (carefully).

### 1.4 Diagram

```text
Client
  |
  v
API Gateway
  |---------|-----------|
  v         v           v
UserSvc   OrderSvc   PaymentSvc
```

### 1.5 Code/config example (Spring Cloud Gateway snippet)

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user
          uri: http://user-service
          predicates:
            - Path=/users/**
        - id: order
          uri: http://order-service
          predicates:
            - Path=/orders/**
```

### 1.6 Best practices
- Strict timeouts, circuit breaker at the edge
- Propagate trace/correlation IDs
- Keep business logic out of gateway

### 1.7 Common mistakes
- Gateway becomes monolith (too much logic)
- No HA/auto-scaling (single point of failure)

### 1.8 Enterprise use cases
- Unified auth at the edge, DDoS/WAF integration, partner routing rules

### 1.9 Interview questions
- When would you use API Gateway vs service mesh ingress?

---

## 2. Service Discovery Pattern

### 2.1 Definition
Mechanism for services to find each other dynamically.

### 2.2 Why it exists
Service instances scale; IPs change; clients need a stable name.

### 2.3 Internal working
- Registry-based (Eureka/Consul): instances register; clients query.
- Platform-based (Kubernetes): Service DNS + endpoints; optional mesh.

### 2.4 Diagram

```text
OrderSvc ----> Service Discovery ----> PaymentSvc instances
   |                   ^
   +-- register/resolve+
```

### 2.5 Best practices
- Prefer Kubernetes service discovery if you are on Kubernetes.
- Use readiness probes so discovery does not route to unhealthy instances.

### 2.6 Common mistakes
- Using both K8s discovery and registry-based discovery without a clear reason.

---

## 3. Circuit Breaker Pattern

### 3.1 Definition
Stops calls to a failing dependency to prevent cascading failure.

### 3.2 Why it exists
In distributed systems, failures are partial. Repeated calls to a failing service amplify outages.

### 3.3 Internal working (states)

```text
CLOSED (normal) -> failures exceed threshold -> OPEN (fail fast)
OPEN -> after waitDuration -> HALF-OPEN (probe)
HALF-OPEN -> success -> CLOSED; failure -> OPEN
```

### 3.4 Diagram

```text
OrderSvc --(CB)--> PaymentSvc
   |               ^
   +-- fallback ---+
```

### 3.5 Code example (Resilience4j)

```java
@CircuitBreaker(name = "payment", fallbackMethod = "paymentFallback")
public PaymentResult pay(PaymentRequest req) { ... }
```

### 3.6 Best practices
- Combine with timeouts + bulkheads.
- Use fallback only if it’s safe and correct.

### 3.7 Common mistakes
- Retrying without backoff; retries + circuit breakers misconfigured.

---

## 4. Saga Pattern

### 4.1 Definition
A sequence of local transactions coordinated via events/commands to achieve distributed consistency.

### 4.2 Why it exists
Avoids distributed 2PC (two-phase commit) for microservices; supports eventual consistency.

### 4.3 Internal working
- **Choreography**: services publish events and react.
- **Orchestration**: a saga orchestrator sends commands and tracks state.

### 4.4 Diagram (orchestration)

```text
Saga Orchestrator
  |--CreateOrder--> OrderSvc
  |--ReserveStock-> InventorySvc
  |--Charge------> PaymentSvc
  |--Compensate--> (if any step fails)
```

### 4.5 Best practices
- Define compensating transactions.
- Ensure idempotency and exactly-once *effects* (not delivery).

### 4.6 Common mistakes
- No compensation logic; assuming events are strictly ordered and unique.

---

## 5. CQRS Pattern

### 5.1 Definition
Separate models for **commands** (writes) and **queries** (reads).

### 5.2 Why it exists
Optimizes read vs write paths independently; supports complex read projections.

### 5.3 Internal working
- Writes update the source-of-truth model.
- Events feed read models (denormalized projections).

### 5.4 Diagram

```text
Client -> Command API -> Write Model -> Event Bus -> Read Model -> Query API -> Client
```

### 5.5 Best practices
- Use CQRS where read patterns are very different from write patterns.
- Keep eventual consistency explicit in UX and SLAs.

### 5.6 Common mistakes
- Overusing CQRS (unnecessary complexity).

---

## 6. Event-Driven Architecture (EDA)

### 6.1 Definition
Services communicate by publishing and consuming events.

### 6.2 Why it exists
Loose coupling, scalable async processing, auditability.

### 6.3 Internal working
- Topics/queues, consumer groups, replay, schema evolution.

### 6.4 Diagram

```text
OrderSvc -> (OrderCreated) -> Kafka Topic -> PaymentSvc, ShippingSvc, AnalyticsSvc
```

### 6.5 Best practices
- Schema registry + versioned events
- Outbox pattern to avoid dual-write issues

---

## 7. Bulkhead Pattern

### 7.1 Definition
Isolate resources (threads, pools, queues) so one failure doesn’t sink the entire system.

### 7.2 Diagram

```text
OrderSvc
  |-- pool A --> Payment
  |-- pool B --> Inventory
```

### 7.3 Best practices
- Separate connection pools and thread pools per dependency.

---

## 8. Strangler Pattern

### 8.1 Definition
Gradually replace parts of a monolith with microservices.

### 8.2 Diagram

```text
Client -> Gateway -> NewSvc (migrated paths)
                 -> Monolith (remaining paths)
```

### 8.3 Best practices
- Route by functionality, not by “layers”.
- Use shared auth and consistent observability during transition.

---

## 9. Pros/Cons Summary Table

| Pattern | Good for | Main risk |
|--------|----------|-----------|
| API Gateway | unified edge control | gateway monolith |
| Discovery | dynamic scaling | inconsistent resolution |
| Circuit breaker | resilience | wrong thresholds, hidden failures |
| Saga | distributed consistency | complex compensation |
| CQRS | read-heavy systems | eventual consistency complexity |
| EDA | decoupling, async | ordering, duplicates, schema drift |
| Bulkhead | blast radius control | operational overhead |
| Strangler | migration | dual-running complexity |

---

## 10. Interview Questions (All Levels)

- Explain circuit breaker states and tuning.
- Saga choreography vs orchestration: trade-offs?
- When does CQRS make sense?
- How do you ensure reliable event publishing (outbox)?

