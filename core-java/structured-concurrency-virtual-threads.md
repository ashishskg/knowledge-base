Java 21 Structured Concurrency and Virtual Threads

Important Note
- There is no class named `StructuredJobState` in Java 21.
- The structured concurrency API is `StructuredTaskScope` (JEP 453, preview).
- Task state is available via `StructuredTaskScope.Subtask.State`.

What Is Structured Concurrency?
Structured concurrency lets you fork multiple tasks and join them as a unit,
so errors/cancellation are handled in a controlled scope.

Key Types (Java 21 Preview)
- StructuredTaskScope: lifecycle for a group of tasks
- StructuredTaskScope.ShutdownOnFailure: cancels all tasks on first failure
- StructuredTaskScope.Subtask: handle to a forked task
- StructuredTaskScope.Subtask.State: RUNNING, SUCCESS, FAILED, CANCELLED

How to Use (Simple Java App)
```
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

Output (example)
```
User(id=1) -> 5
```

How to Run (Preview in Java 21)
- Compile: `javac --release 21 --enable-preview Main.java`
- Run: `java --enable-preview Main`

Virtual Threads (Simple Java App)
```
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
  Future<String> f1 = executor.submit(() -> loadUser("1"));
  Future<Integer> f2 = executor.submit(() -> loadOrderCount("1"));
  System.out.println(f1.get() + " -> " + f2.get());
}
```

Spring Boot Service Layer Usage (Virtual Threads)

1) Enable virtual threads (Spring Boot 3.2+)
application.yml
```
spring:
  threads:
    virtual:
      enabled: true
```

2) Service layer example
```
@Service
public class UserService {
  public String loadUser(String id) {
    // blocking call (DB, HTTP) can be OK with virtual threads
    return "User(id=" + id + ")";
  }
}
```

3) Controller example
```
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

Using StructuredTaskScope in a Service (Preview)
```
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

Summary
- Use StructuredTaskScope for structured concurrency (preview in Java 21).
- Use virtual threads for scalable blocking I/O.
- In Spring Boot, enable virtual threads via `spring.threads.virtual.enabled=true`.
