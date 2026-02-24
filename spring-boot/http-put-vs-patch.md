HTTP PUT vs PATCH

Definition
- PUT: Replace the full resource with the provided representation.
- PATCH: Partially update a resource with only the changed fields.

Idempotency
- PUT is idempotent (same request repeated yields same result).
- PATCH can be idempotent, but it is not guaranteed by default.

Typical Use
- PUT: update all fields or create/replace at a known URL.
- PATCH: update specific fields (e.g., only status or name).

Example
PUT /users/123
Body: { "id": 123, "name": "Alex", "email": "a@x.com" }

PATCH /users/123
Body: { "email": "new@x.com" }

Spring Boot Annotation Example
```
@RestController
@RequestMapping("/users")
public class UserController {

  @PutMapping("/{id}")
  public User replaceUser(@PathVariable Long id, @RequestBody User user) {
    // Replace full resource
    return userService.replace(id, user);
  }

  @PatchMapping("/{id}")
  public User updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
    // Partial update
    return userService.patch(id, updates);
  }
}
```

Service Layer Example
```
@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public User replace(Long id, User user) {
    user.setId(id);
    return userRepository.save(user);
  }

  public User patch(Long id, Map<String, Object> updates) {
    User existing = userRepository.findById(id)
      .orElseThrow(() -> new RuntimeException("User not found"));
    if (updates.containsKey("name")) {
      existing.setName((String) updates.get("name"));
    }
    if (updates.containsKey("email")) {
      existing.setEmail((String) updates.get("email"));
    }
    return userRepository.save(existing);
  }
}
```

Repository Layer Example
```
public interface UserRepository extends JpaRepository<User, Long> {}
```
