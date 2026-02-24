What is @ComponentScan?

Definition
@ComponentScan tells Spring where to scan for beans annotated with
@Component, @Service, @Repository, and @Controller.

Default Behavior
- With @SpringBootApplication, Spring scans the current package and subpackages.

Example
```
@SpringBootApplication
@ComponentScan(basePackages = {"com.example.api", "com.example.core"})
public class Application {
  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
```

Why Use It
- To include beans outside the main package structure.
- To control which packages are scanned for faster startup.
