## Jakarta APIs + Spring Boot + Java 21 — Enterprise & Architect Guide

---

## 0. Scope and Architectural Positioning

This guide assumes:
- Java 21 + Spring Boot 3.x (Jakarta namespaces).
- Hibernate as the JPA provider.
- Spring MVC for REST (JAX‑RS is discussed as an alternative).

You’ll learn:
- Deep JPA mapping patterns and pitfalls.
- Transactions (propagation, isolation, boundaries).
- Validation at scale (API boundaries, nested graphs).
- Security annotations and integration with Spring Security.
- Performance tuning: N+1, batching, caching, connection pools.
- Real microservice patterns (User, Order, Payment).
- Java 21 integration: records, virtual threads, structured concurrency.

For a quick start, see `Jakarta-Beginner-Guide.md`.

---

## 1. Jakarta EE and Spring Boot in Enterprise Systems

### 1.1 Why architects still care about Jakarta APIs

**Definition**  
Jakarta APIs are the standardized contracts for key backend concerns (persistence, validation, transactions, servlet model, security annotations).

**Why needed**
- Enable consistent architecture across teams.
- Reduce “framework lock-in” at API boundaries.
- Provide shared language for design reviews and troubleshooting (e.g., entity lifecycle, validation graphs).

**Enterprise use case**
- Large organizations often mix: Spring Boot services + a few Jakarta EE runtimes + shared libraries. Understanding Jakarta specs helps unify design.

---

## 2. Jakarta Architecture Overview (Enterprise View)

### 2.1 How Spring Boot integrates with Jakarta layers

```text
HTTP Request
  -> Spring MVC / Servlet container
      -> Request binding (Jackson)
      -> Validation (jakarta.validation via Hibernate Validator)
      -> Service layer (transactions)
      -> Repository (Spring Data JPA)
      -> JPA provider (Hibernate)
      -> JDBC + connection pool (HikariCP)
      -> Database
```

**Performance-critical boundaries**
- Validation (large object graphs)
- Transaction boundaries and locking
- ORM mapping and fetch plans
- Connection pool sizing

---

## 3. Jakarta Validation in Enterprise APIs

### 3.1 Internal working

- Spring triggers validation:
  - On controller arguments annotated with `@Valid`.
  - On method parameters if method validation is enabled.
- Hibernate Validator:
  - Builds a constraint metadata model.
  - Validates object graph recursively when `@Valid` is used.

### 3.2 Best practices

- Validate at boundaries: controllers, message consumers.
- Prefer **DTO validation** over validating JPA entities directly.
- Use validation groups for different contexts (create vs update).

### 3.3 Common mistakes

- Validating entities (causes persistence/lifecycle coupling).
- Excessive nested validation (can become expensive).
- Treating validation as authorization (it is not).

### 3.4 Enterprise use cases

- API gateway DTO validation.
- Strict contract validation in banking/fintech where invalid requests must be rejected deterministically.

### 3.5 Interview questions

- How do you validate nested objects in Spring Boot?
- What’s the difference between validation and authorization?

---

## 4. Custom Validation at Scale

### 4.1 Design patterns

- Keep validators deterministic and fast.
- If validation needs DB access, consider:
  - service-layer validation (not Bean Validation), or
  - caching reference data (country codes, product codes) in-memory.

Example: `@CountryCode` is in beginner guide; at enterprise scale:
- Use a reference table + cache refresh + validator uses cached set.

---

## 5. Jakarta Lifecycle Annotations in Production

### 5.1 `@PostConstruct` / `@PreDestroy` in microservices

Best practices:
- Keep `@PostConstruct` lightweight; don’t block startup on slow networks.
- For heavy initialization, use async warmup with readiness probes.

Common mistake:
- Calling remote services in `@PostConstruct` causing startup deadlocks/outages.

---

## 6. Dependency Injection: CDI vs Spring DI

### 6.1 Enterprise guideline

- In Spring Boot, standardize on:
  - Constructor injection
  - `@Component`, `@Service`, `@Repository`
  - `@Qualifier` / `@Primary` for selection

CDI (`@Inject`, `@Named`, scopes) is useful to understand but avoid mixing styles without a clear reason.

Interview questions:
- Explain self-invocation issue with proxies and `@Transactional`.
- `@Inject` vs `@Autowired`—what changes in testing and configuration?

---

## 7. JPA Deep Guide (ORM Concepts + Internals)

### 7.1 Entity lifecycle (practical)

Entity states:
- **Transient**: new object, not tracked.
- **Managed/Persistent**: attached to persistence context (1st-level cache).
- **Detached**: was managed, now not in current persistence context.
- **Removed**: marked for deletion.

Persistence context:
- Maintains identity map (same row → same object instance).
- Flushes changes at transaction boundaries or flush events.

### 7.2 Core annotations recap (with architectural intent)

- `@Entity`: indicates a persistent class.
- `@Table`: maps to table name and constraints.
- `@Id`, `@GeneratedValue`: identity and key strategy.
- `@Column`: nullability, length, column mapping.
- `@Enumerated(EnumType.STRING)`: stable enum persistence.
- `@Embedded` / `@Embeddable`: value objects.

### 7.3 Internal working (Hibernate)

- Hibernate translates:
  - Entity mapping metadata -> SQL generation
  - Entity state changes -> dirty checking -> update statements
- Fetch strategies determine whether it generates:
  - extra SELECTs (lazy)
  - JOINs (eager or join fetch)

Performance considerations:
- Dirty checking cost increases with entity graph size.
- Large persistence contexts can become memory-heavy.

---

## 8. JPA Relationships and Mapping (Enterprise)

### 8.1 Relationship annotations

- `@OneToOne`
- `@OneToMany`
- `@ManyToOne`
- `@ManyToMany`

Supporting:
- `@JoinColumn`, `@JoinTable`
- `mappedBy`
- `cascade = ...`
- `fetch = FetchType.LAZY/EAGER`
- `orphanRemoval = true`

### 8.2 Owning side vs inverse side (critical)

**Definition**
- The **owning side** is the side that contains the foreign key mapping (`@JoinColumn`).
- The inverse side uses `mappedBy` and does not own the FK.

**Why it matters**
- Updates must be applied on the owning side to persist relationship changes.

### 8.3 Example: User ↔ Address (OneToOne)

```java
@Entity
class UserEntity {
    @Id @GeneratedValue
    Long id;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id") // owning side
    AddressEntity address;
}

@Entity
class AddressEntity {
    @Id @GeneratedValue
    Long id;

    String line1;
    String city;
}
```

### 8.4 Example: Department ↔ Employee (OneToMany / ManyToOne)

```java
@Entity
class DepartmentEntity {
    @Id @GeneratedValue
    Long id;

    String name;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    List<EmployeeEntity> employees = new ArrayList<>();
}

@Entity
class EmployeeEntity {
    @Id @GeneratedValue
    Long id;

    String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id") // owning side
    DepartmentEntity department;
}
```

Best practices:
- Default relationships to `LAZY`.
- Use DTOs for API responses; avoid exposing entities directly.

Common mistakes:
- `EAGER` on collections leading to huge join explosions.
- Bi-directional relationships without proper JSON handling (infinite recursion).

### 8.5 What SQL Hibernate generates (high-level)

- `@ManyToOne(fetch = LAZY)`:
  - loads FK column; resolves entity on access (proxy) → additional SELECT.
- `JOIN FETCH` in JPQL:
  - instructs Hibernate to load associations in one query.

### 8.6 Deep dive: `mappedBy`, `@JoinColumn`, `cascade`, `orphanRemoval`, `fetch` and SQL

Take the two mappings:

```java
@Entity
class UserEntity {
    @Id @GeneratedValue
    Long id;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id") // owning side, FK in users.address_id
    AddressEntity address;
}

@Entity
class DepartmentEntity {
    @Id @GeneratedValue
    Long id;

    String name;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    List<EmployeeEntity> employees = new ArrayList<>();
}

@Entity
class EmployeeEntity {
    @Id @GeneratedValue
    Long id;

    String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id") // owning side, FK in employees.department_id
    DepartmentEntity department;
}
```

#### 8.6.1 `@JoinColumn` and owning side

- `@JoinColumn(name = "address_id")` on `UserEntity.address`:
  - Tells JPA the FK column is `users.address_id`.
  - This side **owns** the relationship – Hibernate updates `address_id` when you assign a new address.

Persisting a user with address:

```java
UserEntity user = new UserEntity();
user.setAddress(new AddressEntity("line1", "city"));
userRepo.save(user);
```

Typical SQL:

```sql
insert into addresses (line1, city, id) values ('line1','city', 1);
insert into users (address_id, id) values (1, 10);
```

Without `@JoinColumn`:
- Hibernate chooses a default (e.g. `address_id`) but you have less control.
- On the wrong side, you can end up with extra join tables or broken updates.

#### 8.6.2 `mappedBy` and inverse side

- `mappedBy = "department"` on `DepartmentEntity.employees`:
  - Says “`EmployeeEntity.department` is the owner; don’t create another FK”.
  - `employees.department_id` holds the foreign key.

Adding employees:

```java
DepartmentEntity it = new DepartmentEntity();
it.setName("IT");

EmployeeEntity alice = new EmployeeEntity();
alice.setName("Alice");
alice.setDepartment(it);

it.getEmployees().add(alice);
deptRepo.save(it);
```

SQL:

```sql
insert into departments (name, id) values ('IT', 100);
insert into employees (name, department_id, id) values ('Alice', 100, 200);
```

**Best practice**: For `@OneToMany`, let the `@ManyToOne` side own the FK and use `mappedBy` only on the collection side.

#### 8.6.3 `cascade = CascadeType.ALL`

On both associations:

- Persists/deletes children when the parent is persisted/deleted.
- `userRepo.save(user)` persists `AddressEntity`.
- `deptRepo.delete(dept)` deletes corresponding `EmployeeEntity` rows.

Pros:
- Simple aggregate management (root controls children).

Cons:
- Can accidentally delete large graphs if applied too broadly.

#### 8.6.4 `orphanRemoval = true`

- If you remove a child from the association, Hibernate **deletes** it.

Example – OneToMany:

```java
dept.getEmployees().remove(alice);
// on flush/commit:
-- delete from employees where id = 200;
```

Example – OneToOne:

```java
user.setAddress(null);
// on flush/commit:
-- delete from addresses where id = 1;
-- update users set address_id = null where id = 10;
```

Use only when the child truly **cannot exist without** the parent (owned value/child entity).

#### 8.6.5 `fetch = FetchType.LAZY` vs `EAGER`

One-to-one `address`:

- `LAZY`:
  - First query loads user only:

```sql
select u.id, u.address_id, u.name from users u where u.id = 10;
```

  - Access `user.getAddress()` triggers:

```sql
select a.id, a.line1, a.city from addresses a where a.id = ?;
```

- `EAGER`:
  - Hibernate may join addresses immediately:

```sql
select u.id, u.address_id, u.name, a.id, a.line1, a.city
from users u
left outer join addresses a on u.address_id = a.id
where u.id = 10;
```

Collections:
- Always prefer `LAZY` and **explicitly fetch** when needed:

```java
@Query("select distinct d from DepartmentEntity d left join fetch d.employees")
List<DepartmentEntity> findAllWithEmployees();
```

SQL:

```sql
select distinct d.id, d.name, e.id, e.name, e.department_id
from departments d
left outer join employees e on e.department_id = d.id;
```

#### 8.6.6 N+1 vs join fetch table

| Scenario | Mapping | Access pattern | SQL |
|----------|---------|----------------|-----|
| Load all departments, then iterate `getEmployees()` | `@OneToMany` LAZY | N+1 (`1` for depts + `N` for employees) | many `select ... from employees where department_id = ?` |
| Load with fetch join | `@OneToMany` LAZY + JPQL `join fetch` | 1 query | single join query, more rows |

Architectural rule:
- Default to **LAZY** mappings.
- Use **fetch join or projections** for specific read use cases to avoid N+1.


---

## 9. EntityManager, JPQL, Criteria, and Spring Data JPA

### 9.1 `@PersistenceContext`

**Definition**
- Injects `EntityManager` tied to current persistence context.

```java
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

@Repository
class UserQueryRepository {
    @PersistenceContext
    EntityManager em;
}
```

### 9.2 JPQL basics

```java
List<UserEntity> users = em.createQuery(
    "select u from UserEntity u where u.email like :prefix",
    UserEntity.class
).setParameter("prefix", "a%")
 .getResultList();
```

### 9.3 Criteria API (when used)

Use Criteria when building dynamic queries safely; otherwise prefer JPQL or Spring Data specifications.

### 9.4 Spring Data JPA internals

- Generates implementations for repository interfaces.
- Supports derived queries: `findByEmail(...)`.
- Under the hood uses `EntityManager` and query parsing.

Performance consideration:
- Derived query methods are convenient but can hide expensive fetch patterns. Use explicit queries when needed.

Interview questions:
- Explain persistence context and 1st-level cache.
- JPQL vs native SQL—when to use each?

---

## 10. Transactions (Spring vs Jakarta)

### 10.1 ACID and transaction boundaries in microservices

Best practice:
- Keep transaction boundaries **inside a single service**.
- Avoid distributed transactions for microservices; use outbox/saga patterns.

### 10.2 Propagation and isolation (Spring)

Common propagation modes:
- `REQUIRED` (default)
- `REQUIRES_NEW`
- `MANDATORY`

Isolation:
- Typically DB-managed, but configurable for some use cases.

Common mistake:
- Long transactions spanning remote calls.

Interview questions:
- How does `REQUIRES_NEW` behave?
- Explain why transactions should not include HTTP calls.

---

## 11. Jakarta REST (JAX‑RS) in Spring Boot (Enterprise Position)

### 11.1 Spring MVC vs JAX‑RS

Guideline:
- Use Spring MVC in Spring Boot unless you deliberately use Jersey.

Architectural decision factors:
- Existing JAX‑RS ecosystem/libraries
- Standardization requirements
- Team skillset and operational maturity

---

## 12. Servlet model and request lifecycle (what architects should know)

Key idea:
- Spring MVC is built on top of the servlet container (Tomcat/Jetty).
- Threading model matters (Java 21 virtual threads can improve concurrency for blocking handlers).

---

## 13. Jakarta Security annotations + Spring Security

### 13.1 Annotations

- `@RolesAllowed`
- `@PermitAll`
- `@DenyAll`

Enterprise guidance:
- Enforce authZ in one consistent place:
  - method security (annotations) + centralized policy
  - avoid mixing controller-level and service-level rules inconsistently

Common mistakes:
- Using `@RolesAllowed` without enabling method security in Spring Security.

---

## 14. Jakarta with Spring Boot (Enterprise Integration Checklist)

### 14.1 Validation

- Use `@Valid` at controller boundary.
- Use standard error responses (problem details).

### 14.2 Persistence

- Entities: keep minimal, avoid business logic sprawl.
- Use repositories for access; use service layer for rules.

### 14.3 Transactions

- Service-layer `@Transactional`.
- Keep transactions short; avoid remote calls inside.

---

## 15. Jakarta + Java 21 Modern Features

### 15.1 Records for DTOs

```java
record CreateOrderRequest(String productId, int quantity) {}
record OrderDto(long id, String status) {}
```

### 15.2 Virtual threads in Spring Boot

- Enable:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

Use case:
- Many concurrent blocking calls (DB + HTTP) with simpler programming model.

### 15.3 Structured concurrency (preview)

- Use `StructuredTaskScope` for parallel subcalls in one request.
- See `Java21-Concurrency-Guide.md`.

---

## 16. Enterprise Architecture Patterns

### 16.1 Microservices architecture

```text
API Gateway
  -> UserService (DB)
  -> OrderService (DB)
  -> PaymentService (DB/external)
```

Patterns:
- **Repository pattern** (data access abstraction)
- **DTO pattern** (avoid exposing entities)
- **Transaction boundaries** at service layer
- **DDD** (bounded contexts, aggregates)

---

## 17. Performance Optimization (JPA/Hibernate)

### 17.1 N+1 query problem

**Definition**
- One query loads parents, then N queries load children lazily.

Mitigations:
- `JOIN FETCH` for specific use cases.
- Batch fetching configuration.
- DTO queries for read models.

### 17.2 Lazy loading pitfalls

- Lazy loading outside transaction causes exceptions.
- Fix by:
  - fetch in service layer before returning DTO
  - or use explicit queries and DTO projection

### 17.3 Batch fetching and write performance

- Batch inserts/updates reduce round trips.
- Use JDBC batching with Hibernate configuration and careful flushing.

### 17.4 Caching

- 1st-level cache: persistence context.
- 2nd-level cache: shared across sessions (use selectively).
- Query cache: rarely used; requires careful invalidation.

### 17.5 Connection pools

- HikariCP default for Spring Boot.
- Size based on DB capacity and service concurrency.

Interview questions:
- Explain N+1 and how to fix it.
- What is the first-level cache in JPA?

---

## 18. Real Enterprise Examples (Skeletons)

### 18.1 User management

- Validation: registration DTO with `@Email`, `@NotBlank`, `@Valid`.
- Persistence: `UserEntity` with unique email index.
- Transactions: `registerUser` is transactional.

### 18.2 Order processing

- Entity relationships: Order → OrderItems (OneToMany).
- DTO projections for read endpoints.

### 18.3 Payment service

- Transaction boundary around payment record + outbox event.
- External call separated from DB transaction (saga/outbox).

---

## 19. Jakarta API Interview Questions (All Levels)

### 19.1 Beginner

- What is Jakarta EE? What changed from `javax`?
- What does `@Valid` do?
- Difference between `@NotNull`, `@NotEmpty`, `@NotBlank`?

### 19.2 Intermediate

- Explain entity lifecycle states (transient/managed/detached).
- What causes N+1? How do you fix it?
- Difference between `LAZY` and `EAGER`?
- How do Spring Data repositories work?

### 19.3 Senior developer / 10+ years

- Explain persistence context and dirty checking cost.
- Design transaction boundaries for complex workflows.
- Explain `cascade` and `orphanRemoval` and when they are dangerous.

### 19.4 Architect

- Design a scalable microservices architecture using JPA safely (read models vs write models).
- Discuss DB consistency vs event-driven patterns (outbox, sagas).
- When to cache at application layer vs DB vs distributed cache?

---

## 20. Cheat Sheet (Enterprise)

### 20.1 Validation

- Boundary validation: `@Valid @RequestBody`
- Nested: `@Valid` on nested fields
- Custom: `@Constraint(validatedBy=...)`

### 20.2 JPA mapping

- Prefer `LAZY` for relationships.
- Always model ownership correctly (`mappedBy` vs `@JoinColumn`).
- Use DTOs, avoid exposing entities.

### 20.3 Transactions

- Service layer `@Transactional`.
- Keep transactions short; avoid remote calls inside.
- Use outbox pattern for reliable events.

---

This guide is intentionally “enterprise-shaped”: it focuses on the decisions and pitfalls that matter when systems scale (performance, transaction boundaries, mapping correctness, and service architecture). For basics and annotation lists, see `Jakarta-Beginner-Guide.md`.

