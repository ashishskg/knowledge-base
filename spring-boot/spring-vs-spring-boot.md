Spring vs Spring Boot

Definition
- Spring: core framework for building Java apps (IoC, DI, AOP, MVC, Data, Security)
- Spring Boot: opinionated extension of Spring that auto-configures and ships defaults

Setup and Configuration
- Spring: manual setup of starters, beans, XML/Java config, and server setup
- Spring Boot: auto-configuration, embedded server, minimal boilerplate

Dependency Management
- Spring: you manage versions directly
- Spring Boot: BOM manages compatible versions for you

Server
- Spring: you typically deploy to an external app server
- Spring Boot: embedded Tomcat/Jetty/Undertow by default, runnable jar

Configuration Style
- Spring: explicit @Configuration and bean definitions
- Spring Boot: convention-over-configuration with sensible defaults

Production Readiness
- Spring: add Actuator manually and wire metrics
- Spring Boot: Actuator + health checks + metrics built in

Use Cases
- Spring: fine-grained control, legacy systems, custom frameworks
- Spring Boot: microservices, rapid development, cloud-native apps

Summary
- Spring is the foundation
- Spring Boot is Spring with auto-configuration and defaults for faster delivery
