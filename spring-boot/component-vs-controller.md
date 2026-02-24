@Component vs @Controller

Definition
- @Component: generic stereotype for any Spring-managed bean.
- @Controller: specialized @Component for MVC controllers handling web requests.

Usage
- @Component: use for utilities, helpers, or non-web beans.
- @Controller: use for MVC endpoints (view or REST with @ResponseBody).

Key Difference
- @Controller is picked up by Spring MVC for request mapping.
- @Component is not tied to web layer semantics.

Example
```
@Component
public class IdGenerator {
  public String nextId() { return UUID.randomUUID().toString(); }
}

@Controller
public class PageController {
  @GetMapping("/home")
  public String home() { return "home"; }
}
```
