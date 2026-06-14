## Jakarta APIs + Spring Boot + Java 21 — Beginner Guide

---

## 1. Introduction to Jakarta EE

### 1.1 What is Jakarta EE?

**Definition**  
Jakarta EE is a set of **standard enterprise Java APIs** (specifications) for building server-side applications: web apps, REST services, persistence, validation, transactions, security, and more.

**Why it is needed**
- Provides **portable, standardized APIs** across compatible runtimes.
- Establishes common programming models (annotations, dependency injection, validation, persistence).

**Internal working (high-level)**
- Jakarta EE defines APIs; implementations are provided by frameworks/servers (e.g., Hibernate for JPA, Hibernate Validator for Validation).

### 1.2 Evolution from Java EE

**Definition**  
Java EE moved from Oracle to the Eclipse Foundation and became **Jakarta EE**. Packages migrated from `javax.*` to `jakarta.*`.

**Why it matters**
- Modern frameworks (Spring Boot 3+) have adopted `jakarta.*`.
- Your code must use `jakarta.*` types/annotations in the ecosystem.

### 1.3 Jakarta API ecosystem (what you’ll use with Spring Boot)

Common Jakarta APIs used in Spring Boot:
- **Jakarta Validation** (`jakarta.validation`): validate inputs/DTOs.
- **Jakarta Persistence (JPA)** (`jakarta.persistence`): ORM mapping (via Hibernate).
- **Jakarta Transactions** (`jakarta.transaction`): transactional boundaries (alongside Spring’s).
- **Jakarta Annotations** (`jakarta.annotation`): lifecycle annotations.
- **Jakarta Servlet** (`jakarta.servlet`): underlying HTTP container model (for Spring MVC).
- **Jakarta Security** (`jakarta.annotation.security`): role-based annotations.

### 1.4 Jakarta vs Spring

| Topic | Jakarta (spec) | Spring (framework) |
|------|------------------|--------------------|
| Role | Standard APIs | Implementation & ecosystem |
| DI | CDI (`@Inject`) | Spring DI (`@Autowired`) |
| REST | JAX-RS (`@Path`, `@GET`) | Spring MVC (`@RestController`, `@GetMapping`) |
| Persistence | JPA (`@Entity`) | Spring Data JPA (repository abstraction over JPA) |
| Transactions | JTA (`jakarta.transaction`) | Spring Tx (`org.springframework.transaction`) |

**Best practice**  
In Spring Boot apps, you typically **use Jakarta annotations where Spring integrates with them well** (Validation, JPA, lifecycle), and use Spring Web annotations for controllers.

### 1.5 Package naming and Java 21 compatibility

- **Jakarta packages**: `jakarta.*`
- **Java 21**: Fully compatible with Spring Boot 3.x + Jakarta-based APIs.

---

## 2. Jakarta Architecture Overview (with Spring Boot)

### 2.1 How Spring Boot integrates

Text diagram:

```text
Spring Boot App
  ├─ Web layer (Spring MVC / servlet container)
  ├─ Validation (Jakarta Validation + Hibernate Validator)
  ├─ Persistence (Jakarta Persistence + Hibernate)
  ├─ Transactions (Spring Tx + (optional) Jakarta Tx semantics)
  └─ Security (Spring Security + optional Jakarta security annotations)
```

### 2.2 Main Jakarta APIs (beginner view)

| API | Package | What it does in Spring Boot |
|-----|---------|-----------------------------|
| Validation | `jakarta.validation` | DTO validation on REST endpoints |
| Persistence (JPA) | `jakarta.persistence` | Entities + ORM mapping |
| Transactions | `jakarta.transaction` | Transaction boundaries (often via Spring `@Transactional`) |
| Annotations | `jakarta.annotation` | Bean lifecycle (`@PostConstruct`, `@PreDestroy`) |
| Security annotations | `jakarta.annotation.security` | Role annotations integrated via Spring Security |
| Servlet | `jakarta.servlet` | Underlying HTTP request/response model |

---

## 3. Jakarta Validation API (`jakarta.validation`)

### 3.1 What it is

**Definition**  
Declarative validation for Java objects using annotations (Bean Validation).

**Why it is needed**
- Prevent invalid data from reaching your domain/database.
- Keep validation rules close to DTO/model.

**Internal working**
- Spring invokes Hibernate Validator during request binding when `@Valid` is present.

### 3.2 Common validation annotations (what they mean)

| Annotation | Applies to | Meaning |
|----------|------------|---------|
| `@NotNull` | any | value must not be null |
| `@NotBlank` | `String` | not null, not empty, not whitespace |
| `@NotEmpty` | `String`, `Collection`, `Map`, array | size > 0 |
| `@Size(min,max)` | `String`, collections, arrays | size constraints |
| `@Min`, `@Max` | numbers | numeric range |
| `@Positive`, `@PositiveOrZero` | numbers | > 0 / >= 0 |
| `@Negative`, `@NegativeOrZero` | numbers | < 0 / <= 0 |
| `@Email` | `String` | email format |
| `@Pattern(regexp=...)` | `String` | regex match |
| `@Past`, `@PastOrPresent` | date/time | must be in past |
| `@Future`, `@FutureOrPresent` | date/time | must be in future |
| `@AssertTrue`, `@AssertFalse` | `boolean`/`Boolean` | must be true/false |

### 3.3 Nested validation with `@Valid`

**Definition**  
`@Valid` triggers validation of nested objects.

**Example: DTO validation in Spring Boot**

```java
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

record AddressDto(
    @NotBlank String line1,
    @NotBlank String city,
    @Pattern(regexp = "^[0-9]{5}$") String zip
) {}

record CreateUserRequest(
    @NotBlank @Size(max = 80) String name,
    @Email @NotBlank String email,
    @Past LocalDate dateOfBirth,
    @Valid @NotNull AddressDto address
) {}
```

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
class UserController {

    @PostMapping
    public String createUser(@Valid @RequestBody CreateUserRequest req) {
        return "ok";
    }
}
```

**Best practices**
- Validate **incoming** DTOs at the boundary (controllers).
- Keep constraints business-meaningful; avoid over-validating internal models.

**Common mistakes**
- Forgetting `@Valid` on nested objects → inner constraints not evaluated.
- Using `@NotEmpty` on `String` when `@NotBlank` is required.

**Interview questions**
- Difference between `@NotNull`, `@NotEmpty`, `@NotBlank`?
- How does Spring Boot trigger validation on request bodies?

---

## 4. Custom Validation

### 4.1 Why custom validation

**Definition**  
Custom constraints let you enforce domain rules not covered by built-ins.

**Example: Country code validator (ISO-like)**

**1) Annotation**

```java
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CountryCodeValidator.class)
public @interface CountryCode {
    String message() default "Invalid country code";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

**2) Validator**

```java
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Set;

public class CountryCodeValidator implements ConstraintValidator<CountryCode, String> {
    private static final Set<String> ALLOWED = Set.of("US", "IN", "GB", "SG");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true; // use @NotNull if required
        return ALLOWED.contains(value);
    }
}
```

**3) Usage**

```java
record SignupRequest(
    @CountryCode String country,
    @NotBlank String email
) {}
```

**Best practices**
- Separate “required” rules (`@NotNull`) from “format” rules (custom constraint).
- Keep validators fast (no DB calls inside validators for hot paths).

**Interview questions**
- How do you create a custom constraint in Jakarta Validation?
- Where should complex validation live: validator vs service?

---

## 5. Jakarta Annotations Lifecycle (`jakarta.annotation`)

### 5.1 `@PostConstruct` and `@PreDestroy`

**Definition**  
Lifecycle hooks called after dependency injection / before bean destruction.

**Why needed**
- Initialize caches, validate configuration, allocate resources.
- Cleanup resources at shutdown.

**Example: cache initialization**

```java
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

@Component
class CountryCache {
    private final ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();

    @PostConstruct
    void init() {
        map.put("US", "United States");
        map.put("IN", "India");
    }

    @PreDestroy
    void shutdown() {
        map.clear();
    }
}
```

### 5.2 `@Resource`

**Definition**  
Dependency injection by name (JSR-250 style).

**In Spring Boot**
- Works, but most teams prefer constructor injection.

**Best practices**
- Prefer constructor injection; use lifecycle hooks for non-trivial initialization only.

---

## 6. Dependency Injection (CDI basics)

> In Spring Boot, DI is typically done via Spring. CDI annotations may appear in some codebases.

### 6.1 `@Inject` and `@Named`

**Definition**
- `@Inject`: CDI injection.
- `@Named`: name a bean for injection/selection.

**Spring compatibility**
- Spring can support `@Inject` (JSR-330) in addition to `@Autowired`.

### 6.2 Scopes (CDI concepts)

| Scope | Meaning |
|------|---------|
| `@ApplicationScoped` | One instance per application |
| `@RequestScoped` | One per HTTP request |
| `@SessionScoped` | One per session |

Spring equivalents:
- `@Singleton` (default), request/session scopes exist too, but are less common in microservices.

### 6.3 `@Inject` vs `@Autowired`

| Aspect | `@Inject` | `@Autowired` |
|--------|-----------|--------------|
| Spec vs framework | Standard (JSR-330/CDI) | Spring-specific |
| Optional injection | via `Optional<T>` or `@Nullable` | supports `required=false` |
| Qualifiers | `@Named`, `@Qualifier` | `@Qualifier`, `@Primary` |

Best practice:
- Use **constructor injection** regardless of annotation.

---

## 7. Jakarta Persistence (JPA) — Basics

### 7.1 ORM concepts (beginner)

**Definition**  
JPA maps Java objects (entities) to relational tables.

**Why needed**
- Reduce boilerplate SQL for CRUD.
- Express relationships in the domain model.

**Internal working (in Spring Boot)**
- Spring Data JPA uses Hibernate (typically) to generate SQL and manage entity state.

### 7.2 Core entity annotations

```java
import jakarta.persistence.*;

@Entity
@Table(name = "users")
class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, unique = true, length = 200)
    private String email;

    protected UserEntity() {}

    public UserEntity(String name, String email) {
        this.name = name;
        this.email = email;
    }
}
```

Other annotations:
- `@Enumerated(EnumType.STRING)`
- `@Embedded` / `@Embeddable` for value objects.

**Common mistakes**
- Using `GenerationType.AUTO` without understanding the DB strategy.
- Using `EnumType.ORDINAL` (fragile) instead of `STRING`.

---

## 8. Transactions (Jakarta + Spring)

### 8.1 `@Transactional`

**Definition**  
Marks a method as transactional. In Spring Boot, `@Transactional` is typically Spring’s annotation, but Jakarta’s `jakarta.transaction.Transactional` can also be used.

**Why needed**
- Ensure atomicity and consistency of multi-step operations.

**Example**

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class UserService {
    private final UserRepository repo;

    UserService(UserRepository repo) { this.repo = repo; }

    @Transactional
    public void registerUser(String name, String email) {
        repo.save(new UserEntity(name, email));
        // more DB operations...
    }
}
```

**Best practices**
- Transaction boundary at service layer.
- Keep transactions short.

**Common mistakes**
- Calling `@Transactional` method from same class (self-invocation) without proxy involvement.

---

## 9. Jakarta REST (JAX‑RS) vs Spring MVC (Beginner)

### 9.1 JAX‑RS annotations (concept)

Jakarta REST (JAX‑RS) uses:
- `@Path`, `@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`
- `@PathParam`, `@QueryParam`, `@HeaderParam`

Spring Boot standard is Spring MVC:
- `@RestController`, `@GetMapping`, `@PostMapping`, etc.

**Enterprise guidance**
- In Spring Boot, use Spring MVC unless you run a JAX‑RS runtime (Jersey) intentionally.

Example (Spring MVC):

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
class OrderController {
    @GetMapping("/{id}")
    OrderDto get(@PathVariable long id) { return new OrderDto(id, "NEW"); }
}

record OrderDto(long id, String status) {}
```

---

## 10. Servlet API (Beginner)

### 10.1 What it is

**Definition**  
Servlet is the low-level HTTP request/response programming model.

In Spring MVC apps, you typically do not write servlets directly, but it’s useful to know what happens underneath.

Annotations:
- `@WebServlet`, `@WebFilter`

---

## 11. Jakarta Security annotations (Beginner)

Annotations:
- `@RolesAllowed`
- `@PermitAll`
- `@DenyAll`

**Spring Boot integration**
- Usually enforced by Spring Security configuration.

Example:

```java
import jakarta.annotation.security.RolesAllowed;
import org.springframework.web.bind.annotation.*;

@RestController
class AdminController {
    @GetMapping("/admin/health")
    @RolesAllowed("ADMIN")
    String health() { return "ok"; }
}
```

---

## 12. Jakarta + Java 21 modern notes (Beginner)

- Use **records** for DTOs.
- Use Java 21 language features (pattern matching) for internal logic.
- For concurrency and virtual threads, see `Java21-Concurrency-Guide.md`.

---

## 13. Beginner Interview Questions (Quick)

- What is Jakarta EE and how is it different from Spring?
- What changed from `javax.*` to `jakarta.*`?
- What does `@Valid` do in Spring Boot?
- Difference between `@NotNull`, `@NotEmpty`, `@NotBlank`?
- What is `@Entity` and how does Hibernate use it?
- What does `@Transactional` guarantee?

---

## 14. Cheat Sheet (Beginner)

### 14.1 Validation

| Category | Annotations |
|----------|------------|
| Required | `@NotNull`, `@NotBlank`, `@NotEmpty` |
| Range | `@Min`, `@Max`, `@Positive`, `@Negative` |
| Text | `@Email`, `@Pattern`, `@Size` |
| Time | `@Past`, `@Future`, `@PastOrPresent`, `@FutureOrPresent` |
| Nested | `@Valid` |

### 14.2 JPA

| Purpose | Annotations |
|--------|-------------|
| Entity mapping | `@Entity`, `@Table`, `@Column` |
| Keys | `@Id`, `@GeneratedValue` |
| Enums & embedded | `@Enumerated`, `@Embedded`, `@Embeddable` |

### 14.3 Transactions

- Spring: `org.springframework.transaction.annotation.Transactional`
- Jakarta: `jakarta.transaction.Transactional` (when used in Jakarta environments)

