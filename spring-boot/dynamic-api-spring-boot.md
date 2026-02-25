# Dynamic API in Spring Boot: what it means + how to build it

“Dynamic API” can mean different things. In Java/Spring Boot, people usually mean one (or more) of these:
- **Dynamic query/filter API**: clients can filter/sort/paginate using query parameters.
- **Dynamic fields / partial updates**: clients can update only certain fields (PATCH) or request only certain fields.
- **Dynamic routing**: endpoints that capture variable path segments.
- **Schema-less payloads**: accept flexible JSON structures (use carefully).

This document shows common patterns with examples.

---

## Table of Contents

- [1) Dynamic routing (dynamic path variables)](#1-dynamic-routing-dynamic-path-variables)
  - [Example](#example)
- [2) Dynamic filtering + sorting + pagination (most common)](#2-dynamic-filtering-sorting-pagination-most-common)
  - [Goal](#goal)
  - [Recommended approach](#recommended-approach)
  - [Controller example](#controller-example)
  - [Implementation options (pick based on persistence)](#implementation-options-pick-based-on-persistence)
  - [JPA Specification sketch](#jpa-specification-sketch)
- [3) Dynamic partial updates (PATCH)](#3-dynamic-partial-updates-patch)
  - [Option A (recommended): patch DTO with nullable fields](#option-a-recommended-patch-dto-with-nullable-fields)
  - [Option B: JSON Merge Patch / JSON Patch (more “dynamic”)](#option-b-json-merge-patch-json-patch-more-dynamic)
- [4) Dynamic fields in response (field projection)](#4-dynamic-fields-in-response-field-projection)
- [5) Schema-less “dynamic JSON” request bodies (use carefully)](#5-schema-less-dynamic-json-request-bodies-use-carefully)
- [6) Practical guidance (what interviewers look for)](#6-practical-guidance-what-interviewers-look-for)
- [7) Common pitfalls](#7-common-pitfalls)


---




## 1) Dynamic routing (dynamic path variables)

### Example
```java
@RestController
@RequestMapping("/api/v1")
class DynamicRouteController {

  @GetMapping("/users/{userId}/orders/{orderId}")
  public Map<String, String> get(@PathVariable String userId, @PathVariable String orderId) {
    return Map.of("userId", userId, "orderId", orderId);
  }
}
```

Use cases:
- Nested resources: `/users/{userId}/orders/{orderId}`
- Multi-tenant APIs: `/{tenantId}/...`

---

## 2) Dynamic filtering + sorting + pagination (most common)

### Goal
Build endpoints like:
- `GET /api/v1/orders?userId=u_123&status=CREATED&minTotal=100&sort=createdAt,desc&page=0&size=20`

### Recommended approach
Keep your API predictable by:
- Whitelisting allowed filters and sort fields
- Validating query params
- Returning consistent paginated responses

### Controller example
```java
@GetMapping("/orders")
public Page<OrderDto> searchOrders(
    @RequestParam(required = false) String userId,
    @RequestParam(required = false) String status,
    @RequestParam(required = false) Double minTotal,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "createdAt,desc") String sort
) {
  // parse/validate sort, then call service
  return orderQueryService.search(userId, status, minTotal, page, size, sort);
}
```

### Implementation options (pick based on persistence)
- **Spring Data JPA Specifications** (common): build criteria dynamically.
- **QueryDSL** (more powerful for complex queries).
- **Manual SQL** (JdbcTemplate) for full control.

### JPA Specification sketch
```java
public Specification<OrderEntity> byFilters(String userId, OrderStatus status, Double minTotal) {
  return (root, query, cb) -> {
    List<Predicate> predicates = new ArrayList<>();
    if (userId != null) predicates.add(cb.equal(root.get("userId"), userId));
    if (status != null) predicates.add(cb.equal(root.get("status"), status));
    if (minTotal != null) predicates.add(cb.greaterThanOrEqualTo(root.get("totalAmount"), minTotal));
    return cb.and(predicates.toArray(new Predicate[0]));
  };
}
```

---

## 3) Dynamic partial updates (PATCH)

### Option A (recommended): patch DTO with nullable fields
This keeps a typed contract.

```java
public record UpdateUserRequest(String name, String email, UserStatus status) {}

@PatchMapping("/users/{id}")
public UserDto update(@PathVariable String id, @RequestBody UpdateUserRequest req) {
  return userService.update(id, req);
}
```

Service merges only provided fields.

Pros:
- Typed, validate-able
- Good IDE support

Cons:
- DTO changes when fields change

### Option B: JSON Merge Patch / JSON Patch (more “dynamic”)
You can accept:
- JSON Patch (RFC 6902)
- JSON Merge Patch (RFC 7396)

This is useful when you want generic patch handling, but increases complexity.

---

## 4) Dynamic fields in response (field projection)

Example:
- `GET /api/v1/users/{id}?fields=id,name`

Implementation idea:
- Validate requested fields against an allow-list
- Map DTO -> filtered map

Sketch:
```java
@GetMapping("/users/{id}")
public Map<String, Object> getUser(
    @PathVariable String id,
    @RequestParam(required = false) String fields
) {
  UserDto user = userService.get(id);
  return fieldFilter.apply(user, fields);
}
```

Caution:
- Don’t accidentally expose sensitive fields.

---

## 5) Schema-less “dynamic JSON” request bodies (use carefully)

You *can* accept arbitrary JSON like:

```java
@PostMapping("/events")
public void ingest(@RequestBody Map<String, Object> payload) {
  // schema-less processing
}
```

Use cases:
- Event ingestion endpoints
- Webhook receivers

Risks:
- Harder validation
- Harder versioning
- More runtime errors

Recommendation:
- Prefer typed DTOs for core domain APIs (User/Order)
- Use schema-less payloads only for truly flexible integrations

---

## 6) Practical guidance (what interviewers look for)

A good “dynamic API” design is not “accept anything”; it is:
- **Flexible but controlled** (allow-lists + validation)
- **Stable contracts** (versioning, backwards compatibility)
- **Secure by default** (don’t expose arbitrary field selection)
- **Performant** (indexed filters, bounded pagination, limited sort fields)

---

## 7) Common pitfalls
- Allowing clients to filter/sort by arbitrary DB fields (security + performance risk).
- Unbounded pagination (`size=100000`).
- Building SQL strings by concatenation (SQL injection).
- Returning different response shapes without versioning.
