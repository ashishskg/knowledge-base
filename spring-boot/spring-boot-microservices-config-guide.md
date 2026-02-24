Spring Boot 3/4 Microservices Configuration Guide

This document shows how to configure common microservice capabilities in Spring Boot 3.x and
Spring Boot 4.x. It highlights the key annotations and provides practical examples.

Notes
- Spring Boot 4 is not widely released at the time of writing. The examples below follow
  Spring Boot 3.x style that should carry forward to 4.x with minimal changes.
- Use the Spring Cloud 2023.x (or newer) BOM for Boot 3.x. Check compatibility for Boot 4.

-------------------------------------------------------------------------
Centralized Config with Spring Cloud
-------------------------------------------------------------------------

Concept
Centralized configuration lets services fetch external properties (from Git, Vault, etc.)
and refresh them without rebuilding the service.

Key Annotations
- @SpringBootApplication: main entrypoint
- @RefreshScope: refreshes bean properties on /actuator/refresh
- @ConfigurationProperties: maps external config to typed objects

Dependencies (Gradle)
```
dependencies {
  implementation("org.springframework.cloud:spring-cloud-starter-config")
  implementation("org.springframework.boot:spring-boot-starter-actuator")
}
```

Config Server (example)
application.yml
```
server:
  port: 8888
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-org/config-repo
```

Config Server main class
```
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
  public static void main(String[] args) {
    SpringApplication.run(ConfigServerApplication.class, args);
  }
}
```

Config Client (example)
application.yml
```
spring:
  application:
    name: orders-service
  config:
    import: "optional:configserver:http://localhost:8888"
management:
  endpoints:
    web:
      exposure:
        include: "refresh,health,info"
```

Config-bound properties
```
@ConfigurationProperties(prefix = "orders")
public record OrdersConfig(int maxPageSize, String region) {}
```

Use @RefreshScope to reload values
```
@RestController
@RefreshScope
public class OrdersController {
  private final OrdersConfig config;

  public OrdersController(OrdersConfig config) {
    this.config = config;
  }

  @GetMapping("/config")
  public OrdersConfig config() {
    return config;
  }
}
```

-------------------------------------------------------------------------
Spring Security with Okta
-------------------------------------------------------------------------

Concept
Use Okta as the Identity Provider and configure the service as an OAuth2 Resource Server.

Key Annotations
- @EnableWebSecurity: enables web security
- @Bean SecurityFilterChain: security configuration
- @EnableMethodSecurity: enables @PreAuthorize and @PostAuthorize
- @PreAuthorize: method-level access control

Dependencies (Gradle)
```
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
}
```

application.yml (resource server)
```
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://dev-123456.okta.com/oauth2/default
```

Security configuration
```
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/actuator/**").permitAll()
        .anyRequest().authenticated()
      )
      .oauth2ResourceServer(oauth2 -> oauth2.jwt())
      .build();
  }
}
```

Method-level security example
```
@RestController
public class ProfileController {

  @GetMapping("/profile")
  @PreAuthorize("hasAuthority('SCOPE_profile.read')")
  public Map<String, String> profile() {
    return Map.of("status", "ok");
  }
}
```

-------------------------------------------------------------------------
Resilience: Resilience4j (circuit breakers, retries, bulkheads)
-------------------------------------------------------------------------

Concept
Protect services from cascading failures using circuit breakers and retries.

Key Annotations
- @CircuitBreaker: opens circuit on failures
- @Retry: retries failed calls
- @Bulkhead: limits concurrent calls
- @TimeLimiter: limits execution time

Dependencies (Gradle)
```
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-aop")
  implementation("io.github.resilience4j:resilience4j-spring-boot3")
}
```

application.yml
```
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        slidingWindowSize: 10
        failureRateThreshold: 50
  retry:
    instances:
      paymentService:
        maxAttempts: 3
        waitDuration: 200ms
  bulkhead:
    instances:
      paymentService:
        maxConcurrentCalls: 10
```

Service example
```
@Service
public class PaymentClient {

  @CircuitBreaker(name = "paymentService", fallbackMethod = "fallback")
  @Retry(name = "paymentService")
  @Bulkhead(name = "paymentService")
  public String charge() {
    // call remote system
    return "ok";
  }

  private String fallback(Exception ex) {
    return "fallback";
  }
}
```

-------------------------------------------------------------------------
Feign Client: Spring Cloud OpenFeign vs WebClient
-------------------------------------------------------------------------

Concept
Feign offers declarative HTTP clients. WebClient is a programmable reactive client.

Key Annotations
- @EnableFeignClients: enables Feign
- @FeignClient: declares HTTP client interface

Dependencies (Gradle)
```
dependencies {
  implementation("org.springframework.cloud:spring-cloud-starter-openfeign")
  implementation("org.springframework.boot:spring-boot-starter-webflux")
}
```

Enable Feign
```
@SpringBootApplication
@EnableFeignClients
public class OrdersApplication {
  public static void main(String[] args) {
    SpringApplication.run(OrdersApplication.class, args);
  }
}
```

Feign client example
```
@FeignClient(name = "inventory", url = "http://localhost:8082")
public interface InventoryClient {

  @GetMapping("/inventory/{sku}")
  InventoryResponse getInventory(@PathVariable String sku);
}
```

WebClient example
```
@Service
public class InventoryWebClient {
  private final WebClient webClient;

  public InventoryWebClient(WebClient.Builder builder) {
    this.webClient = builder.baseUrl("http://localhost:8082").build();
  }

  public Mono<InventoryResponse> getInventory(String sku) {
    return webClient.get()
      .uri("/inventory/{sku}", sku)
      .retrieve()
      .bodyToMono(InventoryResponse.class);
  }
}
```

-------------------------------------------------------------------------
Observability: Micrometer + Prometheus
-------------------------------------------------------------------------

Concept
Micrometer collects metrics, Prometheus scrapes them. Grafana visualizes them.

Key Annotations
- @Timed: custom timing for methods
- @Counted: custom counters
- @Observed: span + metrics for a method

Dependencies (Gradle)
```
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  runtimeOnly("io.micrometer:micrometer-registry-prometheus")
}
```

application.yml
```
management:
  endpoints:
    web:
      exposure:
        include: "health,info,prometheus"
  metrics:
    tags:
      application: orders-service
```

Custom metrics example
```
@Service
public class OrderService {

  @Timed(value = "orders.create.time")
  public String createOrder() {
    return "ok";
  }
}
```

Prometheus scrape config
```
scrape_configs:
  - job_name: "orders-service"
    metrics_path: "/actuator/prometheus"
    static_configs:
      - targets: ["host.docker.internal:8080"]
```

Grafana
1. Add Prometheus as a data source.
2. Import a Spring Boot dashboard (e.g. 4701) or build custom panels.

-------------------------------------------------------------------------
Quick Checklist
-------------------------------------------------------------------------
- Add correct Spring Cloud BOM for Boot 3.x/4.x.
- Expose needed actuator endpoints.
- Use @ConfigurationProperties for typed config.
- Secure endpoints with OAuth2 Resource Server for Okta.
- Apply Resilience4j annotations to remote calls.
- Choose Feign (declarative) or WebClient (reactive) per service needs.
- Export Prometheus metrics and visualize with Grafana.
