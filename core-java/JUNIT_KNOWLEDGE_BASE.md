# JUnit 5 Unit Testing Knowledge Base (Java 21)

A practical guide to writing unit tests for simple methods: with parameters, with return values, and void methods with no parameters.

---

## 1. Setup (Java 21 + JUnit 5)

### Maven (pom.xml)

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.2</version>
    <scope>test</scope>
</dependency>
```

### Gradle (build.gradle)

```groovy
testImplementation 'org.junit.jupiter:junit-jupiter:5.10.2'
```

### Module (module-info.java) — if using modules

```java
module com.example.app {
    requires org.junit.jupiter.api;
}
```

---

## 2. Methods That Accept Parameters and Return Values

**Rule:** Assert the **return value** against expected outcome for given **inputs**.

### Example class

```java
public class Calculator {

    public int add(int a, int b) {
        return a + b;
    }

    public double divide(double a, double b) {
        if (b == 0) throw new IllegalArgumentException("Cannot divide by zero");
        return a / b;
    }

    public String greet(String name) {
        if (name == null || name.isBlank()) {
            return "Hello, Guest";
        }
        return "Hello, " + name.trim();
    }
}
```

### Test class

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    @Test
    @DisplayName("add returns sum of two positive numbers")
    void add_positiveNumbers_returnsSum() {
        int result = calculator.add(2, 3);
        assertEquals(5, result);
    }

    @Test
    @DisplayName("add handles negative numbers")
    void add_negativeNumbers_returnsSum() {
        assertEquals(-5, calculator.add(-2, -3));
    }

    @Test
    @DisplayName("divide returns correct quotient")
    void divide_validInputs_returnsQuotient() {
        double result = calculator.divide(10.0, 2.0);
        assertEquals(5.0, result);
    }

    @Test
    @DisplayName("divide by zero throws IllegalArgumentException")
    void divide_byZero_throwsException() {
        Exception ex = assertThrows(IllegalArgumentException.class,
            () -> calculator.divide(10.0, 0.0));
        assertEquals("Cannot divide by zero", ex.getMessage());
    }

    @Test
    @DisplayName("greet returns personalized message for valid name")
    void greet_validName_returnsGreeting() {
        String result = calculator.greet("Alice");
        assertEquals("Hello, Alice", result);
    }

    @Test
    @DisplayName("greet returns Guest for null or blank name")
    void greet_blankName_returnsGuestGreeting() {
        assertEquals("Hello, Guest", calculator.greet(null));
        assertEquals("Hello, Guest", calculator.greet(""));
        assertEquals("Hello, Guest", calculator.greet("   "));
    }
}
```

### Assertions for return values

| Assertion | Use case |
|-----------|----------|
| `assertEquals(expected, actual)` | Exact equality (uses `equals`) |
| `assertEquals(expected, actual, delta)` | Floats/doubles with tolerance |
| `assertNotEquals(unexpected, actual)` | Value must not equal |
| `assertTrue(condition)` / `assertFalse(condition)` | Boolean return |
| `assertNull(actual)` / `assertNotNull(actual)` | Null checks |
| `assertSame(expectedRef, actualRef)` | Same object reference |
| `assertThrows(ExceptionClass, executable)` | Method must throw |

---

## 3. Methods That Return Values (No Parameters or Default Inputs)

**Rule:** Call the method and assert the **return value** (and optionally side effects).

### Example class

```java
public class IdGenerator {

    private int counter = 0;

    public String nextId() {
        return "ID-" + (++counter);
    }

    public int getCounter() {
        return counter;
    }

    public List<String> getDefaultRoles() {
        return List.of("USER", "ADMIN", "GUEST");
    }
}
```

### Test class

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class IdGeneratorTest {

    private IdGenerator idGenerator;

    @BeforeEach
    void setUp() {
        idGenerator = new IdGenerator();
    }

    @Test
    void nextId_returnsIncrementedId() {
        assertEquals("ID-1", idGenerator.nextId());
        assertEquals("ID-2", idGenerator.nextId());
        assertEquals("ID-3", idGenerator.nextId());
    }

    @Test
    void getCounter_returnsCurrentCount() {
        idGenerator.nextId();
        idGenerator.nextId();
        assertEquals(2, idGenerator.getCounter());
    }

    @Test
    void getDefaultRoles_returnsUnmodifiableList() {
        var roles = idGenerator.getDefaultRoles();
        assertEquals(3, roles.size());
        assertTrue(roles.contains("USER"));
        assertTrue(roles.contains("ADMIN"));
        assertTrue(roles.contains("GUEST"));
        assertThrows(UnsupportedOperationException.class, () -> roles.add("OTHER"));
    }
}
```

---

## 4. Void Methods With No Parameters

**Rule:** You cannot assert a return value. Assert **side effects**: state changes, interactions with dependencies, or exceptions.

### 4a. Void method that changes internal state

Assert state **before** and **after** via getters or other methods that expose state.

```java
public class Counter {

    private int value = 0;

    public void increment() {
        value++;
    }

    public void reset() {
        value = 0;
    }

    public int getValue() {
        return value;
    }
}
```

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class CounterTest {

    private Counter counter;

    @BeforeEach
    void setUp() {
        counter = new Counter();
    }

    @Test
    void increment_increasesValueByOne() {
        assertEquals(0, counter.getValue());
        counter.increment();
        assertEquals(1, counter.getValue());
        counter.increment();
        assertEquals(2, counter.getValue());
    }

    @Test
    void reset_setsValueToZero() {
        counter.increment();
        counter.increment();
        counter.reset();
        assertEquals(0, counter.getValue());
    }
}
```

### 4b. Void method that throws (no parameters)

Assert that calling the method **throws** the expected exception.

```java
public class Validator {

    public void validateNotEmpty(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Value cannot be empty");
        }
    }
}
```

```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ValidatorTest {

    private final Validator validator = new Validator();

    @Test
    void validateNotEmpty_validString_doesNotThrow() {
        assertDoesNotThrow(() -> validator.validateNotEmpty("hello"));
    }

    @Test
    void validateNotEmpty_null_throwsIllegalArgumentException() {
        var ex = assertThrows(IllegalArgumentException.class,
            () -> validator.validateNotEmpty(null));
        assertEquals("Value cannot be empty", ex.getMessage());
    }

    @Test
    void validateNotEmpty_blank_throwsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class,
            () -> validator.validateNotEmpty("   "));
    }
}
```

### 4c. Void method with dependencies (mock interactions)

Use **Mockito** to verify that a void method called a dependency as expected.

#### What are @Mock and @InjectMocks?

- **@Mock**  
  Creates a **mock object** (a fake implementation) of the annotated field’s type.  
  - The mock does nothing by default: methods return `null`, `0`, or `false` unless you use `when(...).thenReturn(...)` (stubbing).  
  - Use mocks to **isolate** the class under test from real dependencies (DB, network, etc.) and to **verify** that methods were called with the right arguments (`verify(mock, times(n)).method(...)`).  
  - Mockito creates the mock and injects it when you use `@ExtendWith(MockitoExtension.class)`.

- **@InjectMocks**  
  Marks the **class under test**. Mockito will **create an instance** of this class and inject into it all **@Mock** (and `@Spy`) fields that match the constructor parameters or setter methods.  
  - You don’t manually `new NotificationService(emailSender)`; Mockito builds the object and wires the mock `EmailSender` in.  
  - If there are multiple constructors, Mockito picks the one that allows the most dependencies to be injected (or the no-arg constructor if no mocks match).  
  - **Summary:** `@Mock` = fake dependency; `@InjectMocks` = real object under test with those fakes injected.

```java
// Service that sends a notification (void, no params from caller's view)
public class NotificationService {

    private final EmailSender emailSender;

    public NotificationService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void sendWelcomeEmail() {
        emailSender.send("user@example.com", "Welcome", "Welcome to the app!");
    }
}

public interface EmailSender {
    void send(String to, String subject, String body);
}
```

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    // @Mock: Mockito creates a fake EmailSender. No real emails sent; we control and verify calls.
    @Mock
    private EmailSender emailSender;

    // @InjectMocks: Mockito creates NotificationService and injects the mock emailSender into it.
    @InjectMocks
    private NotificationService notificationService;

    @Test
    void sendWelcomeEmail_invokesEmailSenderWithCorrectArgs() {
        notificationService.sendWelcomeEmail();

        verify(emailSender, times(1)).send(
            eq("user@example.com"),
            eq("Welcome"),
            eq("Welcome to the app!")
        );
    }

    @Test
    void sendWelcomeEmail_capturesSentSubject() {
        notificationService.sendWelcomeEmail();

        var subjectCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailSender).send(any(), subjectCaptor.capture(), any());
        assertEquals("Welcome", subjectCaptor.getValue());
    }
}
```

**Mockito dependency (Maven):**

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
```

---

## 5. Testing Static Methods

Static methods are harder to test because they are bound to the class, not to an instance you can replace. You have two main options: **mock the static call** (Mockito) or **test the behaviour without mocking** (call the real static method).

### Option A: Test the real static method (no mock)

If the static method is pure (no I/O, no global state) or uses only test-friendly state, call it and assert the result.

```java
public final class StringUtils {

    private StringUtils() {}

    public static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    public static String reverse(String s) {
        if (s == null) return null;
        return new StringBuilder(s).reverse().toString();
    }
}
```

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StringUtilsTest {

    @Test
    void isBlank_nullOrEmpty_returnsTrue() {
        assertTrue(StringUtils.isBlank(null));
        assertTrue(StringUtils.isBlank(""));
        assertTrue(StringUtils.isBlank("   "));
    }

    @Test
    void isBlank_nonBlank_returnsFalse() {
        assertFalse(StringUtils.isBlank("hello"));
    }

    @Test
    void reverse_returnsReversedString() {
        assertEquals("olleh", StringUtils.reverse("hello"));
        assertNull(StringUtils.reverse(null));
    }
}
```

### Option B: Mock the static method (Mockito inline)

When the static method talks to external systems (DB, HTTP, `System.currentTimeMillis()`, etc.), you can **mock the static call** so the test doesn’t depend on them. Use **mockito-inline** (required for static mocking).

**Maven:**

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-inline</artifactId>
    <version>5.2.0</version>
    <scope>test</scope>
</dependency>
```

**Example: class under test calls a static utility**

```java
public class OrderService {

    public String createOrderDescription(String productName, int quantity) {
        String id = IdGenerator.generateId();  // static call we want to mock
        return id + ": " + productName + " x " + quantity;
    }
}

public final class IdGenerator {
    private IdGenerator() {}
    public static String generateId() {
        return UUID.randomUUID().toString();  // unpredictable; we mock it in tests
    }
}
```

**Test: mock the static method for the duration of the test**

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Test
    void createOrderDescription_usesGeneratedId() {
        // MockedStatic must be used in a try-with-resources so the static mock is closed after the test.
        try (MockedStatic<IdGenerator> mockedIdGenerator = mockStatic(IdGenerator.class)) {
            // Stub the static method: when it's called, return a fixed value.
            mockedIdGenerator.when(IdGenerator::generateId).thenReturn("fixed-id-123");

            OrderService orderService = new OrderService();
            String result = orderService.createOrderDescription("Widget", 2);

            assertEquals("fixed-id-123: Widget x 2", result);

            // Optionally verify the static method was called exactly once.
            mockedIdGenerator.verify(IdGenerator::generateId, times(1));
        }
        // After try block, IdGenerator.generateId() behaves normally again.
    }
}
```

**Important for static mocks:**

- Use **try-with-resources** with `MockedStatic<T>` so the static mock is released after the test (avoids affecting other tests).
- Use **mockito-inline**; the standard mockito-core does not mock static methods.
- Prefer **Option A** when possible; reserve static mocking for real dependencies (time, UUID, HTTP, DB).

### Option C: Prefer instance methods (design for testability)

If you control the code, making the “static” behaviour injectable (e.g. a `IdSupplier` interface) avoids static mocking and keeps tests simple.

```java
public interface IdSupplier {
    String generateId();
}

public class OrderService {
    private final IdSupplier idSupplier;
    public OrderService(IdSupplier idSupplier) { this.idSupplier = idSupplier; }
    public String createOrderDescription(String productName, int quantity) {
        return idSupplier.generateId() + ": " + productName + " x " + quantity;
    }
}
// In tests: inject a mock or a stub that returns "fixed-id-123".
```

---

## 6. Testing Private Methods

**Recommended approach:** Do **not** test private methods in isolation. Treat them as implementation details and **test behaviour through the public API**. If you can’t trigger the logic via public methods, that logic may be dead or the design may need a small refactor (e.g. extract to a package-private or collaborator class).

If you still need to reach private code (e.g. legacy code, complex branch you can’t hit via public API), you can use one of the options below.

### Option A: Test via public methods (preferred)

Exercise the private logic by calling public methods that use it. Assert on the observable outcome (return value, state, or side effects).

```java
public class PaymentValidator {

    public ValidationResult validate(String cardNumber, String expiry) {
        if (!isValidFormat(cardNumber)) {
            return ValidationResult.invalid("Invalid card format");
        }
        if (isExpired(expiry)) {
            return ValidationResult.invalid("Card expired");
        }
        return ValidationResult.valid();
    }

    private boolean isValidFormat(String cardNumber) {
        return cardNumber != null && cardNumber.replaceAll("\\s", "").matches("\\d{13,19}");
    }

    private boolean isExpired(String expiry) {
        // "MM/YY" vs current month/year
        if (expiry == null || !expiry.matches("\\d{2}/\\d{2}")) return true;
        // ... parse and compare ...
        return false;
    }
}
```

```java
// Test private isValidFormat / isExpired indirectly via public validate()
@Test
void validate_invalidFormat_returnsInvalid() {
    var validator = new PaymentValidator();
    var result = validator.validate("123", "12/30");
    assertFalse(result.isValid());
    assertTrue(result.getMessage().contains("format"));
}

@Test
void validate_validCard_returnsValid() {
    var validator = new PaymentValidator();
    var result = validator.validate("4111111111111111", "12/30");
    assertTrue(result.isValid());
}
```

### Option B: Reflection (use sparingly)

Use reflection to invoke a private method from the test. This is brittle (breaks on rename/refactor) and couples the test to implementation.

```java
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

class PaymentValidatorTest {

    @Test
    void isValidFormat_validNumber_returnsTrue() throws Exception {
        var validator = new PaymentValidator();
        Method method = PaymentValidator.class.getDeclaredMethod("isValidFormat", String.class);
        method.setAccessible(true);

        boolean result = (boolean) method.invoke(validator, "4111111111111111");

        assertTrue(result);
    }

    @Test
    void isValidFormat_tooShort_returnsFalse() throws Exception {
        var validator = new PaymentValidator();
        Method method = PaymentValidator.class.getDeclaredMethod("isValidFormat", String.class);
        method.setAccessible(true);

        boolean result = (boolean) method.invoke(validator, "123");

        assertFalse(result);
    }
}
```

**Java 21:** For a reusable helper, you can use a generic reflection helper so you don’t repeat `getDeclaredMethod` / `setAccessible` in every test. Use only when testing via the public API is not practical.

### Option C: Package-private visibility

Put the test in the **same package** as the class under test and change the method from `private` to **package-private** (no modifier). Then the test can call the method directly.

```java
// In src/main/java/com/example/validator/PaymentValidator.java
package com.example.validator;

public class PaymentValidator {
    // Package-private: visible to test in same package
    boolean isValidFormat(String cardNumber) {
        return cardNumber != null && cardNumber.replaceAll("\\s", "").matches("\\d{13,19}");
    }
}
```

```java
// In src/test/java/com/example/validator/PaymentValidatorTest.java (same package)
package com.example.validator;

class PaymentValidatorTest {
    @Test
    void isValidFormat_validNumber_returnsTrue() {
        var validator = new PaymentValidator();
        assertTrue(validator.isValidFormat("4111111111111111"));
    }
}
```

**Maven/Gradle:** `src/test/java` uses the same package structure, so `com.example.validator` in test can access package-private members of the main source.

### Summary

| Approach | When to use |
|----------|-------------|
| **Test via public API** | Default. Keeps tests stable and focused on behaviour. |
| **Reflection** | Legacy or rare cases where you can’t hit the logic via public methods. |
| **Package-private** | When you want direct unit tests for that logic without reflection. |

Prefer **Option A**; use B or C only when necessary.

---

## 7. Summary Cheat Sheet

| Method type | What to test | Main tools |
|-------------|--------------|------------|
| **Takes params, returns value** | Return value for given inputs | `assertEquals`, `assertThrows` |
| **No params, returns value** | Return value (and any state) | `assertEquals`, `assertTrue`, `assertNotNull` |
| **Void, no params** | State change, or exception, or mock interaction | `assertEquals` on state, `assertThrows`, `assertDoesNotThrow`, Mockito `verify` |

---

## 8. Naming and structure

- **Test method names:** `methodName_scenario_expectedResult` (e.g. `divide_byZero_throwsException`).
- **One logical behavior per test.**
- Use `@BeforeEach` for common setup; keep tests independent.
- Use `@DisplayName` for readable descriptions in reports.
- Use `@Nested` to group tests by method or feature.

---

## 9. Running tests (Java 21)

```bash
# Maven
./mvnw test

# Gradle
./gradlew test
```

JUnit 5 works with Java 21 without any extra configuration. Use `var` and modern Java syntax in tests as needed.
