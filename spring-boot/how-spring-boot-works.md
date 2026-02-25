# How Spring Boot Works




## Table of Contents

- [High-Level Flow](#high-level-flow)
- [Key Concepts](#key-concepts)
- [Core Annotations](#core-annotations)
- [Minimal Example](#minimal-example)
- [What Happens at Startup (Simplified)](#what-happens-at-startup-simplified)


---

## High-Level Flow

1. The app starts from a class annotated with `@SpringBootApplication`.
2. Spring Boot auto-configures beans based on classpath and properties.
3. It starts an embedded server (Tomcat by default).
4. The application context is created, beans are wired, and endpoints are exposed.

## Key Concepts

- **Auto-configuration**: detects dependencies and configures defaults.
- **Starter dependencies**: curated sets of libraries to enable features quickly.
- **Embedded server**: no external app server required.
- **Actuator**: production-ready endpoints for health and metrics.

## Core Annotations

- `@SpringBootApplication`: combines `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`.
- `@EnableAutoConfiguration`: turns on auto-config based on classpath.
- `@ComponentScan`: finds beans in your package.
- `@RestController`: builds REST endpoints.

## Minimal Example

```java
@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }
}
```

## What Happens at Startup (Simplified)

1. `SpringApplication` prepares the environment.
2. Auto-configuration classes run conditionally (if a class/property exists).
3. Bean definitions are created and wired.
4. Embedded server is started and routes are registered.
