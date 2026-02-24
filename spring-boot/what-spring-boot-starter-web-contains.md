What spring-boot-starter-web Contains

Overview
`spring-boot-starter-web` provides the classic Spring MVC stack for REST APIs and web apps.

Key Included Modules (Typical)
- spring-web
- spring-webmvc
- spring-beans
- spring-context
- spring-aop
- spring-expression
- spring-boot
- spring-boot-autoconfigure
- spring-boot-starter
- spring-boot-starter-json (Jackson)
- spring-boot-starter-tomcat (embedded server)
- validation-api / jakarta.validation (via starter validation if present)
- logging via spring-boot-starter-logging (Logback)

What It Enables
- @RestController and @Controller endpoints
- JSON serialization with Jackson
- Embedded Tomcat server
- Default error handling and basic web configs

Note
Exact transitive dependencies can vary by Spring Boot version. Use
`mvn dependency:tree` or `gradle dependencies` to see the full list.
