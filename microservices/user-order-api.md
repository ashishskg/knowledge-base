# User & Order API (Java): how to start + endpoint design (step-by-step)




## Table of Contents

- [1) Before you write code: the step-by-step process](#1-before-you-write-code-the-step-by-step-process)
  - [Step 1 — Define the use-cases (requirements)](#step-1-define-the-use-cases-requirements)
  - [Step 2 — Identify resources and relationships](#step-2-identify-resources-and-relationships)
  - [Step 3 — Define API conventions (standards)](#step-3-define-api-conventions-standards)
  - [Step 4 — Design the contract first (endpoints + schemas)](#step-4-design-the-contract-first-endpoints-schemas)
  - [Step 5 — Define validation rules and state transitions](#step-5-define-validation-rules-and-state-transitions)
  - [Step 6 — Plan persistence and transactions](#step-6-plan-persistence-and-transactions)
  - [Step 7 — Implementation structure (Java)](#step-7-implementation-structure-java)
- [2) Resource model (example)](#2-resource-model-example)
  - [User](#user)
  - [Order](#order)
  - [OrderItem](#orderitem)
- [3) Endpoint design: User API](#3-endpoint-design-user-api)
  - [3.1 Create user](#3-1-create-user)
  - [3.2 Get user by id](#3-2-get-user-by-id)
  - [3.3 List/search users](#3-3-list-search-users)
  - [3.4 Update user (partial update)](#3-4-update-user-partial-update)
  - [3.5 Delete/deactivate user](#3-5-delete-deactivate-user)
- [4) Endpoint design: Order API](#4-endpoint-design-order-api)
  - [4.1 Create order](#4-1-create-order)
  - [4.2 Get order by id](#4-2-get-order-by-id)
  - [4.3 List orders (with filters)](#4-3-list-orders-with-filters)
  - [4.4 Cancel order (recommended as a command)](#4-4-cancel-order-recommended-as-a-command)
- [4.5 User → Orders relationship endpoint (optional)](#4-5-user-orders-relationship-endpoint-optional)
- [5) Status codes and standard error model](#5-status-codes-and-standard-error-model)
  - [Suggested status code usage](#suggested-status-code-usage)
  - [Standard error response](#standard-error-response)
- [6) Implementation outline (typical Java)](#6-implementation-outline-typical-java)
  - [Controllers (HTTP)](#controllers-http)
  - [Services (business rules)](#services-business-rules)
  - [Repositories/DAOs](#repositories-daos)
  - [Tests](#tests)


---

## 1) Before you write code: the step-by-step process

### Step 1 — Define the use-cases (requirements)
Write the actions the system must support.

**User use-cases**
- Create a user
- Get a user by id
- List/search users
- Update user details (partial update)
- Deactivate/delete user

**Order use-cases**
- Create an order for a user
- Get an order by id
- List orders (filter by user, status, date)
- Cancel an order

**Non-functional questions (decide early)**
- Authentication/authorization (public vs internal, roles)
- Id generation (UUID vs numeric)
- Pagination strategy (page/size vs cursor)
- Idempotency (especially for `POST /orders`)
- Error format (standard error response across all APIs)
- Observability (logs/metrics/traces, `traceId`)

Deliverable: a 1-page API requirements note.

---

### Step 2 — Identify resources and relationships
In REST, you model **resources** (nouns) and actions on them.

**Resources**
- `User`
- `Order`

**Relationship**
- One `User` has many `Order`s.
- An `Order` belongs to one `User`.

Deliverable: simple resource definitions and field lists.

---

### Step 3 — Define API conventions (standards)
Standardize so every endpoint behaves consistently.

**Recommended conventions**
- **Base path**: `/api/v1`
- **Collections**: plural nouns (`/users`, `/orders`)
- **JSON**: request/response content type `application/json`
- **Time format**: ISO-8601 UTC (`2026-02-18T12:05:00Z`)
- **Status codes**: consistent usage (see section 5)
- **Error model**: one JSON shape for errors

Deliverable: a short API style guide.

---

### Step 4 — Design the contract first (endpoints + schemas)
Define endpoints and JSON payloads *before* implementing.

Deliverable: endpoint list + example JSON for each.

---

### Step 5 — Define validation rules and state transitions
Examples:
- `email` must be unique per user
- `Order.status` transitions are constrained (e.g., `CREATED -> CANCELLED` allowed, `SHIPPED -> CANCELLED` not allowed)

Deliverable: validation + state machine notes.

---

### Step 6 — Plan persistence and transactions
Decide:
- Single DB vs multiple DBs (monolith vs microservices)
- Transaction boundaries (creating an order is typically transactional)

Deliverable: a minimal data design.

---

### Step 7 — Implementation structure (Java)
Recommended layering (whether you use Spring Boot or similar):
- **Controller**: HTTP boundary (DTOs, status codes)
- **Service**: business logic (rules, transitions)
- **Repository/DAO**: persistence
- **DTOs**: request/response objects (avoid leaking entity model)

Deliverable: package structure and class responsibilities.

---

## 2) Resource model (example)

### User
```json
{
  "id": "u_123",
  "name": "Ashish",
  "email": "ashish@example.com",
  "status": "ACTIVE",
  "createdAt": "2026-02-18T12:00:00Z",
  "updatedAt": "2026-02-18T12:00:00Z"
}
```

### Order
```json
{
  "id": "o_9001",
  "userId": "u_123",
  "items": [
    { "sku": "SKU-1", "quantity": 2, "unitPrice": 199.0 }
  ],
  "totalAmount": 398.0,
  "currency": "INR",
  "status": "CREATED",
  "createdAt": "2026-02-18T12:05:00Z",
  "updatedAt": "2026-02-18T12:05:00Z"
}
```

### OrderItem
```json
{ "sku": "SKU-1", "quantity": 2, "unitPrice": 199.0 }
```

---

## 3) Endpoint design: User API

Base: `/api/v1/users`

### 3.1 Create user
- **POST** `/api/v1/users`

Request:
```json
{
  "name": "Ashish",
  "email": "ashish@example.com"
}
```

Response (**201 Created**):
```json
{
  "id": "u_123",
  "name": "Ashish",
  "email": "ashish@example.com",
  "status": "ACTIVE",
  "createdAt": "2026-02-18T12:00:00Z",
  "updatedAt": "2026-02-18T12:00:00Z"
}
```

Common errors:
- **400 Bad Request**: validation failed (missing name/email)
- **409 Conflict**: email already exists

---

### 3.2 Get user by id
- **GET** `/api/v1/users/{userId}`

Response (**200 OK**) returns `User`.

Common errors:
- **404 Not Found**: unknown `userId`

---

### 3.3 List/search users
- **GET** `/api/v1/users?page=0&size=20&email=ashish@example.com`

Response (**200 OK**):
```json
{
  "items": [
    {
      "id": "u_123",
      "name": "Ashish",
      "email": "ashish@example.com",
      "status": "ACTIVE",
      "createdAt": "2026-02-18T12:00:00Z",
      "updatedAt": "2026-02-18T12:00:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 1
}
```

---

### 3.4 Update user (partial update)
- **PATCH** `/api/v1/users/{userId}`

Request:
```json
{
  "name": "Ashish Kumar",
  "status": "INACTIVE"
}
```

Response (**200 OK**) returns updated `User`.

Common errors:
- **404 Not Found**
- **409 Conflict** (if updating email to one that already exists)

---

### 3.5 Delete/deactivate user
- **DELETE** `/api/v1/users/{userId}`

Response (**204 No Content**).

Note: In many systems you do a soft-delete via status (`INACTIVE`) instead of physical deletion.

---

## 4) Endpoint design: Order API

Base: `/api/v1/orders`

### 4.1 Create order
- **POST** `/api/v1/orders`

Request:
```json
{
  "userId": "u_123",
  "items": [
    { "sku": "SKU-1", "quantity": 2, "unitPrice": 199.0 }
  ],
  "currency": "INR"
}
```

Response (**201 Created**): returns `Order` with computed `totalAmount`.

Recommended: **Idempotency** for safe retries
- Client sends `Idempotency-Key: <uuid>` header
- Server stores key -> created order result for a time window

Common errors:
- **400 Bad Request**: invalid quantities, missing fields
- **404 Not Found**: user doesn’t exist (`userId` invalid)
- **409 Conflict**: invalid state, duplicate idempotency request mismatch

---

### 4.2 Get order by id
- **GET** `/api/v1/orders/{orderId}`

Response (**200 OK**) returns `Order`.

Common errors:
- **404 Not Found**

---

### 4.3 List orders (with filters)
- **GET** `/api/v1/orders?userId=u_123&status=CREATED&page=0&size=20`

Response (**200 OK**):
```json
{
  "items": [
    {
      "id": "o_9001",
      "userId": "u_123",
      "totalAmount": 398.0,
      "currency": "INR",
      "status": "CREATED",
      "createdAt": "2026-02-18T12:05:00Z",
      "updatedAt": "2026-02-18T12:05:00Z"
    }
  ],
  "page": 0,
  "size": 20,
  "total": 1
}
```

---

### 4.4 Cancel order (recommended as a command)
Preferred approach: model it as an action.

- **POST** `/api/v1/orders/{orderId}/cancel`

Response (**200 OK**) returns updated `Order`.

Common errors:
- **404 Not Found**
- **409 Conflict**: invalid transition (e.g., order already `SHIPPED`)

---

## 4.5 User → Orders relationship endpoint (optional)
If you want a “nested resource” for readability:

- **GET** `/api/v1/users/{userId}/orders?page=0&size=20`

This is functionally similar to `GET /api/v1/orders?userId=...`.
Pick one style and standardize.

---

## 5) Status codes and standard error model

### Suggested status code usage
- **200 OK**: successful read/update/cancel
- **201 Created**: successful create
- **204 No Content**: successful delete
- **400 Bad Request**: validation failures / malformed request
- **401 Unauthorized**: missing/invalid authentication
- **403 Forbidden**: authenticated but not allowed
- **404 Not Found**: resource doesn’t exist
- **409 Conflict**: uniqueness violation, invalid state transition
- **500 Internal Server Error**: unexpected server errors

### Standard error response
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request",
  "details": [
    { "field": "email", "issue": "must be a valid email" }
  ],
  "traceId": "abcd-1234"
}
```

---

## 6) Implementation outline (typical Java)

### Controllers (HTTP)
- `UserController`
  - `POST /api/v1/users`
  - `GET /api/v1/users/{userId}`
  - `GET /api/v1/users`
  - `PATCH /api/v1/users/{userId}`
  - `DELETE /api/v1/users/{userId}`

- `OrderController`
  - `POST /api/v1/orders`
  - `GET /api/v1/orders/{orderId}`
  - `GET /api/v1/orders`
  - `POST /api/v1/orders/{orderId}/cancel`

### Services (business rules)
- `UserService`: uniqueness, lifecycle (active/inactive)
- `OrderService`: validate items, compute totals, enforce status transitions, idempotency

### Repositories/DAOs
- `UserRepository`, `OrderRepository`

### Tests
- Unit tests for services
- Controller tests for contracts (status codes + validation)
- Integration tests if you use DB
