# Jakarta API annotations reference (with examples)

This document is a practical reference for commonly used **Jakarta** (Jakarta EE) annotations and how they’re used in real applications.

Notes:
- Jakarta packages typically start with `jakarta.*`.
- In Spring Boot apps you’ll often use **Jakarta Validation** (`jakarta.validation.*`) and sometimes **Jakarta Persistence (JPA)** (`jakarta.persistence.*`).
- For REST APIs, Jakarta’s standard is **JAX-RS** (`jakarta.ws.rs.*`) (Spring often uses Spring MVC annotations instead).

---

## 1) Jakarta Validation (`jakarta.validation.*`) 

Used to validate request DTOs, method parameters, and entities.

### 1.1 Core validation annotations

#### `@NotNull`
```java
public record UpdateUserRequest(
    @NotNull String name
) {}
```

#### `@NotBlank` (String cannot be null/empty/whitespace)
```java
public record CreateUserRequest(
    @NotBlank(message = "name is required") String name
) {}
```

#### `@NotEmpty` (collections/arrays/strings)
```java
public record CreateOrderRequest(
    @NotEmpty(message = "items must not be empty") List<OrderItem> items
) {}
```

#### `@Size` (String/collection length)
```java
public record CreateUserRequest(
    @Size(min = 3, max = 50) String name
) {}
```

#### `@Min`, `@Max`
```java
public record OrderItem(
    @Min(1) int quantity,
    @Min(0) double unitPrice
) {}
```

#### `@Positive`, `@PositiveOrZero`, `@Negative`, `@NegativeOrZero`
```java
public record PaymentRequest(
    @Positive double amount
) {}
```

#### `@Email`
```java
public record CreateUserRequest(
    @Email(message = "email must be valid") String email
) {}
```

#### `@Pattern`
```java
public record CreateUserRequest(
    @Pattern(regexp = "^[A-Z]{2}[0-9]{6}$", message = "invalid employeeCode") String employeeCode
) {}
```

#### `@Past`, `@PastOrPresent`, `@Future`, `@FutureOrPresent`
```java
public record ScheduleRequest(
    @Future Instant runAt
) {}
```

#### `@AssertTrue`, `@AssertFalse`
```java
public record TermsRequest(
    @AssertTrue(message = "must accept terms") boolean accepted
) {}
```

### 1.2 Nested validation

#### `@Valid`
Validates nested objects/collection elements.

```java
public record OrderItem(
    @NotBlank String sku,
    @Min(1) int quantity
) {}

public record CreateOrderRequest(
    @NotEmpty List<@Valid OrderItem> items
) {}
```

### 1.3 Creating your own constraint

#### `@Constraint` + custom validator

```java
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CountryCodeValidator.class)
public @interface CountryCode {
  String message() default "invalid country code";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}

public class CountryCodeValidator implements ConstraintValidator<CountryCode, String> {
  public boolean isValid(String value, ConstraintValidatorContext context) {
    return value != null && value.matches("^[A-Z]{2}$");
  }
}
```

---

## 2) Jakarta Annotations (lifecycle) (`jakarta.annotation.*`)

These annotations are widely used across frameworks.

### `@PostConstruct`
Called after dependency injection is done.

```java
@Component
public class CacheWarmup {
  @PostConstruct
  void init() {
    // run once at startup
  }
}
```

### `@PreDestroy`
Called before bean/container is destroyed.

```java
@Component
public class ResourceHolder {
  @PreDestroy
  void shutdown() {
    // cleanup
  }
}
```

### `@Resource`
Inject by name/type in Jakarta EE; in Spring it can also work but `@Autowired` is more common.

```java
@Resource
private DataSource dataSource;
```

---

## 3) Dependency Injection (CDI) (`jakarta.inject.*`, `jakarta.enterprise.context.*`, `jakarta.enterprise.inject.*`)

CDI is the standard DI in Jakarta EE.

### `@Inject`
```java
public class UserService {
  @Inject
  UserRepository repo;
}
```

### `@Named`
Names a bean for expression language / selection.

```java
@Named("fastUserRepo")
public class FastUserRepository implements UserRepository {}
```

### Scopes (examples)
- `@ApplicationScoped` (one per app)
- `@RequestScoped` (per request)

```java
@ApplicationScoped
public class IdGenerator {
  public String newId() { return UUID.randomUUID().toString(); }
}
```

### Qualifiers
Use qualifiers when multiple implementations exist.

```java
@Qualifier
@Retention(RUNTIME)
@Target({TYPE, FIELD, PARAMETER, METHOD})
public @interface PrimaryRepo {}

@PrimaryRepo
@ApplicationScoped
public class SqlUserRepository implements UserRepository {}

public class UserService {
  @Inject
  @PrimaryRepo
  UserRepository repo;
}
```

---

## 4) Jakarta Persistence / JPA (`jakarta.persistence.*`)

Used for ORM mapping and database access.

### 4.1 Entity mapping

#### `@Entity`, `@Table`
```java
@Entity
@Table(name = "users")
public class UserEntity {
  @Id
  private String id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false, unique = true)
  private String email;
}
```

#### `@Id`, `@GeneratedValue`
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

#### `@Column`
```java
@Column(name = "created_at", nullable = false)
private Instant createdAt;
```

#### `@Enumerated`
```java
@Enumerated(EnumType.STRING)
private Status status;
```

#### `@Embedded`, `@Embeddable`
```java
@Embeddable
public class Address {
  private String line1;
  private String city;
}

@Entity
public class UserEntity {
  @Embedded
  private Address address;
}
```

### 4.2 Relationships

#### `@OneToMany`, `@ManyToOne`, `@JoinColumn`
```java
@Entity
public class OrderEntity {
  @Id
  private String id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private UserEntity user;
}

@Entity
public class UserEntity {
  @Id
  private String id;

  @OneToMany(mappedBy = "user")
  private List<OrderEntity> orders;
}
```

#### `@JoinTable` (many-to-many)
```java
@ManyToMany
@JoinTable(
  name = "user_roles",
  joinColumns = @JoinColumn(name = "user_id"),
  inverseJoinColumns = @JoinColumn(name = "role_id")
)
private Set<RoleEntity> roles;
```

### 4.3 EntityManager and queries

#### `@PersistenceContext`
```java
@PersistenceContext
private EntityManager em;
```

#### `@Query` is not Jakarta; it’s Spring Data JPA.
For pure JPA:
```java
TypedQuery<UserEntity> q = em.createQuery(
  "select u from UserEntity u where u.email = :email",
  UserEntity.class
);
q.setParameter("email", email);
var result = q.getSingleResult();
```

---

## 5) Jakarta Transactions (`jakarta.transaction.*`)

### `@Transactional`
Marks methods/classes as transactional.

```java
import jakarta.transaction.Transactional;

@Service
public class OrderService {

  @Transactional
  public OrderEntity createOrder(CreateOrderRequest req) {
    // insert order + items atomically
    return order;
  }
}
```

Notes:
- Spring also has `org.springframework.transaction.annotation.Transactional`. Both exist; many Spring projects use the Spring one.

---

## 6) JAX-RS (Jakarta REST) (`jakarta.ws.rs.*`)

This is Jakarta EE’s standard REST API framework.

### 6.1 Resource class and routing

#### `@Path`, `@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`
```java
@Path("/api/v1/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

  @GET
  @Path("/{id}")
  public UserDto get(@PathParam("id") String id) {
    return service.get(id);
  }

  @POST
  public Response create(CreateUserRequest req) {
    var created = service.create(req);
    return Response.status(Response.Status.CREATED).entity(created).build();
  }
}
```

### 6.2 Parameters
- `@PathParam` (from URL)
- `@QueryParam` (from query string)
- `@HeaderParam` (from headers)

```java
@GET
public List<OrderDto> list(
  @QueryParam("userId") String userId,
  @QueryParam("status") String status
) {
  return service.list(userId, status);
}
```

### 6.3 Exception mapping
#### `ExceptionMapper<T>`
```java
@Provider
public class NotFoundMapper implements ExceptionMapper<NotFoundException> {
  public Response toResponse(NotFoundException ex) {
    return Response.status(404).entity(Map.of("code","NOT_FOUND","message",ex.getMessage())).build();
  }
}
```

---

## 7) Servlet API (`jakarta.servlet.*`)

Used in web containers.

### `@WebServlet`
```java
@WebServlet(urlPatterns = "/hello")
public class HelloServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    resp.getWriter().write("hello");
  }
}
```

### `@WebFilter`
```java
@WebFilter(urlPatterns = "/*")
public class TraceFilter implements Filter {
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    chain.doFilter(request, response);
  }
}
```

---

## 8) Security (Jakarta EE) (`jakarta.annotation.security.*`)

Common role-based annotations.

### `@RolesAllowed`
```java
@RolesAllowed("ADMIN")
public void deleteUser(String id) {
  // only admins
}
```

### `@PermitAll`, `@DenyAll`
```java
@PermitAll
public UserDto profile() { ... }

@DenyAll
public void dangerous() { ... }
```

---

## 9) Quick mapping: where you’ll see these in Spring Boot

Even though Spring has its own annotations, modern Spring Boot uses some Jakarta APIs heavily:
- **Validation**: `jakarta.validation.*` + `@Valid`
- **Lifecycle**: `jakarta.annotation.PostConstruct`, `PreDestroy`
- **Persistence**: `jakarta.persistence.*` (if using JPA)

Spring-specific equivalents you’ll commonly see:
- `@RestController`, `@RequestMapping` (Spring MVC)
- `@Autowired` / constructor injection (Spring DI)
- `org.springframework.transaction.annotation.Transactional`

---

## 10) Practical examples (User/Order)

### Validate a request DTO
```java
public record CreateOrderRequest(
  @NotBlank String userId,
  @NotEmpty List<@Valid OrderItem> items,
  @NotBlank String currency
) {}
```

### Ensure cleanup
```java
@Component
public class Worker {
  @PostConstruct
  void start() {}

  @PreDestroy
  void stop() {}
}
```
