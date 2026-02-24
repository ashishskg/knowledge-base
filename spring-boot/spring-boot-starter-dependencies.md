Spring Boot Starter Dependencies

Definition
Starter dependencies are curated sets of libraries that enable a feature with minimal setup.
They manage transitive dependencies and versions for you.

Common Starters
- spring-boot-starter-web: REST + MVC + embedded Tomcat
- spring-boot-starter-webflux: reactive stack + Netty
- spring-boot-starter-data-jpa: JPA + Hibernate + JDBC
- spring-boot-starter-security: Spring Security
- spring-boot-starter-actuator: health, metrics, and monitoring endpoints
- spring-boot-starter-validation: Bean Validation (Jakarta)
- spring-boot-starter-test: testing libraries (JUnit, Mockito, etc.)

Example (Maven)
```
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
</dependencies>
```

Example (Gradle)
```
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
}
```
