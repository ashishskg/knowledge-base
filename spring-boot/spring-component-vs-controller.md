# Spring: difference between `@Component` and `@Controller`

## What both have in common
- Both are **Spring-managed beans**.
- Both are discovered via **component scanning** (e.g., `@SpringBootApplication` triggers scanning under its package).
- Both support dependency injection (constructor injection recommended).

---

## `@Component`

### What it means
- `@Component` is a **generic stereotype**: “this class is a Spring bean”.
- Use it for classes that are **not specifically web controllers**.

### Typical usage
- Utility/services that don’t fit a specific stereotype
- Adapters/clients (e.g., calling other services)
- Parsers/validators
- Background jobs (depending on scheduling setup)

### Example
```java
@Component
public class PriceCalculator {
  public double total(double unitPrice, int qty) {
    return unitPrice * qty;
  }
}
```

---

## `@Controller`

### What it means
- `@Controller` is a **web MVC stereotype**.
- It marks the class as a Spring MVC controller that handles HTTP requests.

### Key behavior
- Methods typically return:
  - A **view name** (for MVC pages), or
  - Data objects when combined with `@ResponseBody`

In REST APIs you usually use **`@RestController`** (see below).

### Example (MVC style)
```java
@Controller
public class PageController {

  @GetMapping("/home")
  public String homePage() {
    return "home"; // view name
  }
}
```

---

## `@RestController` (important for APIs)

### What it means
- `@RestController` = `@Controller` + `@ResponseBody`
- Every handler method returns data that is **serialized to JSON** (by default), rather than a view.

### Example (REST API)
```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

  @GetMapping("/{id}")
  public User get(@PathVariable String id) {
    return userService.getById(id);
  }
}
```

---

## How Spring treats them internally
- `@Controller` is itself a specialization of `@Component`.
  - So a `@Controller` **is** a bean, but with additional semantics for Spring MVC.

---

## When to use what (rule of thumb)
- Use **`@RestController`** for REST endpoints.
- Use **`@Controller`** for server-rendered MVC pages.
- Use **`@Component`** for generic beans.
- Prefer more specific stereotypes when appropriate:
  - `@Service` for business logic
  - `@Repository` for persistence/DAO (also enables exception translation)

---

## Common pitfalls
- Using `@Component` for controllers: it becomes a bean, but Spring MVC may not map endpoints as expected unless it’s a controller stereotype.
- Using `@Controller` when you expect JSON: you might return a view name accidentally; use `@RestController` (or `@ResponseBody`).
