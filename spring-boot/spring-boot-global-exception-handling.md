# Spring Boot: custom exceptions + global exception handling (example)

Goal: define **custom exceptions** in your service layer and convert them into consistent HTTP error responses globally using `@RestControllerAdvice`.

---

## 1) Standard error response model

Example `ApiError`:

```java
public record ApiError(
    String code,
    String message,
    Object details,
    String traceId
) {}
```

Suggested fields:
- `code`: stable machine-readable code like `USER_NOT_FOUND`, `EMAIL_ALREADY_EXISTS`
- `message`: human-friendly message
- `details`: optional object (field validation errors, extra context)
- `traceId`: request correlation id for debugging

---

## 2) Custom exceptions

```java
public class NotFoundException extends RuntimeException {
  public NotFoundException(String message) { super(message); }
}

public class ConflictException extends RuntimeException {
  public ConflictException(String message) { super(message); }
}
```

Service usage examples:
- `throw new NotFoundException("User not found: " + userId);`
- `throw new ConflictException("Email already exists: " + email);`
- `throw new ConflictException("Order cannot be cancelled in status=" + status);`

---

## 3) Global exception handler (`@RestControllerAdvice`)

This is where you map exceptions to:
- HTTP status code
- `ApiError` body

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(NotFoundException.class)
  public ResponseEntity<ApiError> handleNotFound(NotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ApiError("NOT_FOUND", ex.getMessage(), null, traceId()));
  }

  @ExceptionHandler(ConflictException.class)
  public ResponseEntity<ApiError> handleConflict(ConflictException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ApiError("CONFLICT", ex.getMessage(), null, traceId()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
    var errors = ex.getBindingResult().getFieldErrors().stream()
        .collect(Collectors.groupingBy(
            FieldError::getField,
            LinkedHashMap::new,
            Collectors.mapping(FieldError::getDefaultMessage, Collectors.toList())
        ));

    Map<String, Object> details = Map.of("fieldErrors", errors);

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ApiError("VALIDATION_ERROR", "Invalid request", details, traceId()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ApiError("INTERNAL_ERROR", "Unexpected error", null, traceId()));
  }

  private String traceId() {
    return null;
  }
}
```

Notes:
- Replace `traceId()` with your actual implementation (commonly from MDC: `MDC.get("traceId")`, or your tracing system).
- If you use Spring Security, add handlers for authentication/authorization failures (401/403).
- Don’t leak internal exception details in production error messages.
