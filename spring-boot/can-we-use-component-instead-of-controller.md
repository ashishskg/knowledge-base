Can We Use @Component Instead of @Controller?

Short Answer
- Yes, technically it will be a Spring bean and can handle requests if you also use
  request mapping annotations, but it is not recommended.

Why Not Recommended
- @Controller is a specialized stereotype used by Spring MVC to detect web components.
- It improves readability and tooling support.
- It enables MVC-specific behavior (like view resolution) more clearly.

Best Practice
- Use @Controller for MVC controllers.
- Use @RestController for REST APIs.
- Use @Component for non-web beans.
