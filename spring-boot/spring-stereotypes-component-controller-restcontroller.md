# Spring stereotypes: `@Component`, `@Controller`, `@RestController`

This note summarizes when to use each stereotype, how they relate to each other, and a few interview-ready answers.

---

## Table of Contents

- [1. What they have in common](#1-what-they-have-in-common)
- [2. `@Component`](#2-component)
  - [2.1 What it means](#2-1-what-it-means)
  - [2.2 Typical usage](#2-2-typical-usage)
  - [2.3 Example](#2-3-example)
- [3. `@Controller`](#3-controller)
  - [3.1 What it means](#3-1-what-it-means)
  - [3.2 Behavior](#3-2-behavior)
  - [3.3 Example (MVC style)](#3-3-example-mvc-style)
- [4. `@RestController`](#4-restcontroller)
  - [4.1 What it means](#4-1-what-it-means)
  - [4.2 Example (REST API)](#4-2-example-rest-api)
- [5. Can we use `@Component` instead of `@Controller`?](#5-can-we-use-component-instead-of-controller)
- [6. How Spring treats them internally](#6-how-spring-treats-them-internally)
- [7. When to use what (rule of thumb)](#7-when-to-use-what-rule-of-thumb)
- [8. Quick example comparison](#8-quick-example-comparison)


---




## 1. What they have in common

- All three are **Spring-managed beans**.
- All are discovered via **component scanning** (e.g., `@SpringBootApplication`).
- All support dependency injection (constructor injection recommended).

Internally, `@Controller` and `@RestController` are **specializations of `@Component`**.

---

## 2. `@Component`

### 2.1 What it means

- Generic stereotype: “this class is a Spring bean”.
- Not tied to web MVC; can be used in any layer.

### 2.2 Typical usage

- Utilities and helpers.
- Adapters/clients for other systems.
- Parsers, validators, mappers.
- Background jobs (with scheduling).

### 2.3 Example

```java
@Component
public class PriceCalculator {
  public double total(double unitPrice, int qty) {
    return unitPrice * qty;
  }
}
```

---

## 3. `@Controller`

### 3.1 What it means

- **Web MVC stereotype**.
- Marks the class as a Spring MVC controller handling HTTP requests.

### 3.2 Behavior

- Methods typically return:
  - A **view name** (for server-rendered pages), or
  - Data objects when combined with `@ResponseBody`.

### 3.3 Example (MVC style)

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

## 4. `@RestController`

### 4.1 What it means

- `@RestController` = `@Controller` + `@ResponseBody`.
- Every handler method returns data that is serialized to JSON (by default).

### 4.2 Example (REST API)

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/{id}")
  public User get(@PathVariable String id) {
    return userService.getById(id);
  }
}
```

---

## 5. Can we use `@Component` instead of `@Controller`?

**Short answer:**  
Technically yes (it will be a Spring bean and can handle requests if you add `@RequestMapping` / `@GetMapping` etc.), but it is **not recommended**.

**Why not recommended:**

- `@Controller` is a **specialized stereotype** used by Spring MVC to detect web components.
- It improves **readability** and intent (“this is a web controller”).
- Tooling, metrics, and conventions generally assume proper stereotypes.

**Best practice interview answer:**

- Use **`@Controller`** for MVC controllers returning views.
- Use **`@RestController`** for REST APIs returning JSON.
- Use **`@Component`** for non-web beans.

---

## 6. How Spring treats them internally

- `@Controller` is a specialization of `@Component`.
- `@RestController` is a specialization of `@Controller` that also adds `@ResponseBody`.
- This means:
  - A `@Controller` is always a bean.
  - A `@RestController` is always both a bean and a controller.

---

## 7. When to use what (rule of thumb)

- **`@RestController`**: REST endpoints that return JSON/HTTP APIs.
- **`@Controller`**: Server-rendered MVC pages (Thymeleaf, JSP, etc.).
- **`@Component`**: Generic beans that do not fit more specific stereotypes.
- Prefer more specific stereotypes when available:
  - `@Service` for business logic.
  - `@Repository` for persistence/DAO (also enables exception translation).

---

## 8. Quick example comparison

```java
@Component
public class IdGenerator {
  public String nextId() { return UUID.randomUUID().toString(); }
}

@Controller
public class PageController {
  @GetMapping("/home")
  public String home() { return "home"; }
}

@RestController
public class GreetingController {
  @GetMapping("/api/greeting")
  public Map<String, String> greeting() {
    return Map.of("message", "hello");
  }
}
```

