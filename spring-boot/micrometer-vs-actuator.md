Micrometer vs Actuator (User Microservice Example)

Difference
- Micrometer: metrics facade/library that instruments your code and records metrics.
- Actuator: Spring Boot module that exposes operational endpoints (health, info, metrics, etc.).

How They Work Together
- Micrometer collects metrics (timers, counters, gauges).
- Actuator exposes those metrics at endpoints like `/actuator/metrics` or `/actuator/prometheus`.
- A registry (e.g., Prometheus) exports metrics to a backend.

Typical Setup
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
        include: "health,info,metrics,prometheus"
```

What Micrometer Contains (Conceptual)
- Core API (MeterRegistry, Counter, Timer, Gauge)
- Instrumentation annotations (@Timed, @Counted, @Observed)
- Built-in JVM/system metrics
- Registry integrations (Prometheus, Datadog, CloudWatch, etc.)

Example (User Service)
```
@Service
public class UserService {
  @Timed(value = "user.create.time")
  public User createUser(User user) {
    return userRepository.save(user);
  }
}
```
