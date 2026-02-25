Java 21 Structured Concurrency and Virtual Threads
==================================================

> For a full concurrency overview (threads, locks, executors, CompletableFuture, etc.), also see `JAVA_THREADING_GUIDE.md`.

---




## Table of Contents

- [1. Important Notes](#1-important-notes)
- [2. What Is Structured Concurrency?](#2-what-is-structured-concurrency)
  - [2.1 Key Types (Java 21 Preview)](#2-1-key-types-java-21-preview)
- [3. StructuredTaskScope Example (Simple Java App)](#3-structuredtaskscope-example-simple-java-app)
  - [3.1 How to Run (Preview in Java 21)](#3-1-how-to-run-preview-in-java-21)
- [4. Virtual Threads (Simple Java App)](#4-virtual-threads-simple-java-app)
- [5. Spring Boot Service Layer Usage (Virtual Threads)](#5-spring-boot-service-layer-usage-virtual-threads)
  - [5.1 Enable virtual threads (Spring Boot 3.2+)](#5-1-enable-virtual-threads-spring-boot-3-2)
  - [5.2 Service layer example](#5-2-service-layer-example)
  - [5.3 Controller example](#5-3-controller-example)
- [6. Using StructuredTaskScope in a Service (Preview)](#6-using-structuredtaskscope-in-a-service-preview)
- [7. Summary (How to Position This in Interviews)](#7-summary-how-to-position-this-in-interviews)


---

## 1. Important Notes

- There is no class named `StructuredJobState` in Java 21.
- The structured concurrency API is `StructuredTaskScope` (JEP 453, preview).
- Task state is available via `StructuredTaskScope.Subtask.State`.

---

## 2. What Is Structured Concurrency?

Structured concurrency lets you fork multiple tasks and join them as a unit,
so errors and cancellation are handled in a controlled scope instead of being orphaned.

### 2.1 Key Types (Java 21 Preview)

- `StructuredTaskScope`: lifecycle for a group of tasks.
- `StructuredTaskScope.ShutdownOnFailure`: cancels all tasks on first failure.
- `StructuredTaskScope.Subtask`: handle to a forked task.
- `StructuredTaskScope.Subtask.State`: `RUNNING`, `SUCCESS`, `FAILED`, `CANCELLED`.

---

## 3. StructuredTaskScope Example (Simple Java App)

```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
  StructuredTaskScope.Subtask<String> userTask =
    scope.fork(() -> loadUser("1"));
  StructuredTaskScope.Subtask<Integer> orderTask =
    scope.fork(() -> loadOrderCount("1"));

  scope.join();           // wait for all
  scope.throwIfFailed();  // propagate error if any

  String user = userTask.get();
  Integer orders = orderTask.get();
  System.out.println(user + " -> " + orders);
}
```

**Output (example)**

```text
User(id=1) -> 5
```

### 3.1 How to Run (Preview in Java 21)

- Compile:

```bash
javac --release 21 --enable-preview Main.java
```

- Run:

```bash
java --enable-preview Main
```

---

## 4. Virtual Threads (Simple Java App)

```java
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
  Future<String> f1 = executor.submit(() -> loadUser("1"));
  Future<Integer> f2 = executor.submit(() -> loadOrderCount("1"));
  System.out.println(f1.get() + " -> " + f2.get());
}
```

---

## 5. Spring Boot Service Layer Usage (Virtual Threads)

### 5.1 Enable virtual threads (Spring Boot 3.2+)

`application.yml`:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

### 5.2 Service layer example

```java
@Service
public class UserService {
  public String loadUser(String id) {
    // blocking call (DB, HTTP) can be OK with virtual threads
    return "User(id=" + id + ")";
  }
}
```

### 5.3 Controller example

```java
@RestController
public class UserController {
  private final UserService service;

  public UserController(UserService service) {
    this.service = service;
  }

  @GetMapping("/user/{id}")
  public String getUser(@PathVariable String id) {
    return service.loadUser(id);
  }
}
```

---

## 6. Using StructuredTaskScope in a Service (Preview)

```java
@Service
public class UserProfileService {
  public UserProfile loadProfile(String id) throws Exception {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
      var userTask = scope.fork(() -> loadUser(id));
      var ordersTask = scope.fork(() -> loadOrders(id));
      scope.join();
      scope.throwIfFailed();
      return new UserProfile(userTask.get(), ordersTask.get());
    }
  }
}
```

---

## 7. Summary (How to Position This in Interviews)

- Use `StructuredTaskScope` for **structured concurrency** (preview feature in Java 21).
- Use **virtual threads** when you need scalable blocking I/O (e.g., many DB/HTTP calls).
- In Spring Boot, enable virtual threads via `spring.threads.virtual.enabled=true`.
- Combine this document with `JAVA_THREADING_GUIDE.md` when explaining your concurrency approach in production services.
