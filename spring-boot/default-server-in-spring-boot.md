Default Server in Spring Boot

Answer
- The default embedded server in Spring Boot is Tomcat.

Details
- Spring Boot starters bring in `spring-boot-starter-tomcat` by default.
- You can switch to Jetty or Undertow by excluding Tomcat and adding the desired starter.

Example (Gradle)
```
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web") {
    exclude(group = "org.springframework.boot", module = "spring-boot-starter-tomcat")
  }
  implementation("org.springframework.boot:spring-boot-starter-jetty")
}
```
