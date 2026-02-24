Reactive Controller -> Service -> Repository Example (with Output)

Goal
Show an end-to-end WebFlux flow from controller to service to repository.
Each line has a short explanation and the output is shown at the end.

Example Domain
- User(id, name)
- Endpoint: GET /users/{id}

1) Repository Layer (ReactiveCrudRepository)
```
public interface UserRepository extends ReactiveCrudRepository<User, String> {
  Mono<User> findByName(String name);
}
```
Line by line:
- UserRepository extends ReactiveCrudRepository to enable non-blocking CRUD.
- findByName returns a Mono (0..1) result, not a blocking User.

2) Service Layer (business logic)
```
@Service
public class UserService {
  private final UserRepository repo;

  public UserService(UserRepository repo) {
    this.repo = repo;
  }

  public Mono<User> getById(String id) {
    return repo.findById(id)
      .switchIfEmpty(Mono.error(new RuntimeException("User not found")));
  }
}
```
Line by line:
- @Service registers the class as a Spring bean.
- The repository is injected via constructor for testability.
- getById returns a Mono<User>.
- switchIfEmpty emits an error if no user is found.

3) Controller Layer (WebFlux)
```
@RestController
@RequestMapping("/users")
public class UserController {
  private final UserService service;

  public UserController(UserService service) {
    this.service = service;
  }

  @GetMapping("/{id}")
  public Mono<ResponseEntity<User>> getUser(@PathVariable String id) {
    return service.getById(id)
      .map(ResponseEntity::ok);
  }
}
```
Line by line:
- @RestController makes this a reactive REST controller.
- @RequestMapping("/users") defines the base path.
- @GetMapping("/{id}") maps to /users/{id}.
- The method returns Mono<ResponseEntity<User>> (non-blocking).
- map(ResponseEntity::ok) converts User -> 200 OK response.

4) Sample Model
```
public record User(String id, String name) {}
```

5) Sample Output
Request:
GET /users/1

Response (200 OK)
```
{"id":"1","name":"Ava"}
```

Error Case Output
Request:
GET /users/999

Response (500)
```
{"error":"User not found"}
```

Note
In production, map errors to 404 with a ControllerAdvice or WebExceptionHandler.
