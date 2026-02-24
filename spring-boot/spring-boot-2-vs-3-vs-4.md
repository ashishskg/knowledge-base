Spring Boot 2 vs 3 vs 4 Differences

Java Baseline
- Spring Boot 2: Java 8/11 (2.7 supports 8+)
- Spring Boot 3: Java 17 minimum
- Spring Boot 4: expected Java 21 minimum (not widely released yet)

Spring Framework Version
- Spring Boot 2: Spring Framework 5.x
- Spring Boot 3: Spring Framework 6.x
- Spring Boot 4: expected Spring Framework 7.x

Jakarta EE Namespace
- Spring Boot 2: javax.*
- Spring Boot 3/4: jakarta.* (major breaking change)

Observability
- Spring Boot 2: Micrometer + Spring Cloud Sleuth (legacy)
- Spring Boot 3: Micrometer Tracing + OpenTelemetry default path
- Spring Boot 4: expected to continue the Boot 3 model with improvements

Native Image Support
- Spring Boot 2: experimental / limited
- Spring Boot 3: first-class GraalVM native support
- Spring Boot 4: expected improvements in AOT and startup

Security
- Spring Boot 2: older Spring Security defaults
- Spring Boot 3: Spring Security 6, new DSL, more secure defaults
- Spring Boot 4: expected further tightening

Dependency Ecosystem
- Spring Boot 2: compatible with javax-based libraries
- Spring Boot 3/4: requires jakarta-compatible libraries

Summary
- Boot 2: stable for legacy javax stacks
- Boot 3: current mainstream for new work (Java 17 + Jakarta)
- Boot 4: upcoming; plan for Java 21 and updated dependencies
