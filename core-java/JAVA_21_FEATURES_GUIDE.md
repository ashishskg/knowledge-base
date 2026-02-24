# Java 21 Features Guide

A practical overview of **Java 21** (LTS, released September 2023) language and core library features. Each section includes a short concept explanation, code examples, and expected output or behavior.

**Assumptions:** All examples assume a **Java 21** toolchain. Features marked **Preview** require `javac --enable-preview --release 21` and `java --enable-preview` to run.

---

## 1. Introduction

Java 21 is a **Long-Term Support (LTS)** release focused on:

- **Concurrency:** Virtual threads, structured concurrency, and scoped values for scalable, maintainable concurrent code.
- **Language:** Pattern matching for `switch`, record patterns, and (in preview) unnamed patterns/variables and string templates.
- **APIs:** Sequenced collections for consistent access to first/last/reversed elements, and the Foreign Function & Memory (FFM) API for safe native interop.

This guide complements [JAVA_STREAMS_AND_INTERVIEW_EXAMPLES.md](JAVA_STREAMS_AND_INTERVIEW_EXAMPLES.md) and [JAVA_LIST_GUIDE.md](JAVA_LIST_GUIDE.md) by focusing on **Java 21–specific** features.

---

## 2. High-level feature table

| Feature | JEP | Category | Short description | Section |
|--------|-----|----------|-------------------|---------|
| Virtual Threads | 444 | Concurrency | Lightweight threads for high concurrency | §3 |
| Structured Concurrency | 453 | Concurrency | Coordinate subtasks as one unit of work | §4 |
| Scoped Values | 429 | Concurrency | Immutable, scoped context for threads | §5 |
| Sequenced Collections | 431 | Collections | First/last/reversed on List, Set, Map | §6 |
| Pattern Matching for switch | 441 | Language | Type-safe switch with patterns | §7 |
| Record Patterns | 440 | Language | Deconstruct records in switch/instanceof | §8 |
| Unnamed Patterns & Variables | 443 | Language (preview) | Use `_` to ignore values | §9 |
| String Templates | 430 | Language (preview) | String interpolation with templates | §10 |
| Foreign Function & Memory API | 442 | Interop | Safe native memory and FFI | §11 |

---

## 3. Virtual Threads (JEP 444)

### Concept

**Virtual threads** are lightweight threads managed by the JVM. Many virtual threads run on few platform (OS) threads. They are ideal for I/O-bound or high-concurrency workloads where blocking is acceptable (e.g. waiting on HTTP or DB). You get a simple thread-per-request style without the cost of millions of platform threads.

### Example 1: Simple virtual thread

```java
Thread.ofVirtual().start(() -> System.out.println("Hello from virtual thread"));
Thread.ofVirtual().name("worker-1").start(() -> System.out.println("Named virtual thread"));
```

**Output:**
```
Hello from virtual thread
Named virtual thread
```

### Example 2: Many virtual threads with ExecutorService

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = new ArrayList<>();
    for (int i = 0; i < 5; i++) {
        int id = i;
        futures.add(executor.submit(() -> "Task-" + id));
    }
    for (Future<String> f : futures) {
        System.out.println(f.get());
    }
}
```

**Output:**
```
Task-0
Task-1
Task-2
Task-3
Task-4
```

You can scale to thousands or millions of virtual threads; the JVM schedules them onto a small pool of carrier threads.

---

## 4. Structured Concurrency (JEP 453)

### Concept

**Structured concurrency** treats a set of concurrent subtasks as one unit: if one fails, others are cancelled, and the caller always waits for all subtasks to finish before continuing. `StructuredTaskScope` provides this behavior and works well with virtual threads.

### Example: ShutdownOnFailure – fetch two resources concurrently

```java
import java.util.concurrent.*;

public class StructuredConcurrencyExample {
    public static void main(String[] args) throws Exception {
        try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
            Future<String> user = scope.fork(() -> fetchUser());
            Future<String> order = scope.fork(() -> fetchOrder());
            scope.join();
            scope.throwIfFailed();
            System.out.println(user.resultNow() + " / " + order.resultNow());
        }
    }
    static String fetchUser() { return "user-1"; }
    static String fetchOrder() { return "order-42"; }
}
```

**Output:** `user-1 / order-42`

**Behavior:** If either `fetchUser()` or `fetchOrder()` throws, the other is cancelled and the exception is propagated. The scope ensures no orphaned tasks.

---

## 5. Scoped Values (JEP 429)

### Concept

**Scoped values** are immutable, inheritable values bound to a scope. They replace or complement thread-locals and work well with virtual threads: a value is visible only within the scope where it was bound and to threads created in that scope.

### Example: Bind and read a scoped value

```java
import java.lang.ScopedValue;

public class ScopedValueExample {
    private static final ScopedValue<String> USER = ScopedValue.newInstance();

    public static void main(String[] args) {
        ScopedValue.where(USER, "alice").run(() -> {
            System.out.println("Inside scope: " + USER.get());
            Thread.ofVirtual().start(() -> System.out.println("Child thread: " + USER.get())).join();
        });
        // USER.get() here would throw NoSuchElementException
        System.out.println("Outside scope: scope ended");
    }
}
```

**Output:**
```
Inside scope: alice
Child thread: alice
Outside scope: scope ended
```

**Behavior:** `USER.get()` returns `"alice"` only inside the `run` block and in the child virtual thread. Outside the scope, the binding is gone.

---

## 6. Sequenced Collections (JEP 431)

### Concept

**SequencedCollection**, **SequencedSet**, and **SequencedMap** provide a uniform way to access first/last elements and reversed views. `List`, `LinkedHashSet`, and `LinkedHashMap` implement these interfaces in Java 21.

### Example: List – getFirst, getLast, addFirst, reversed

```java
import java.util.*;

List<String> list = new ArrayList<>(List.of("b", "c"));
list.addFirst("a");
list.addLast("d");
System.out.println("First: " + list.getFirst());
System.out.println("Last: " + list.getLast());
System.out.println("Reversed: " + list.reversed());
list.removeFirst();
list.removeLast();
System.out.println("After remove first/last: " + list);
```

**Output:**
```
First: a
Last: d
Reversed: [d, c, b, a]
After remove first/last: [b, c]
```

### Example: LinkedHashMap – reversed view

```java
import java.util.SequencedMap;

LinkedHashMap<String, Integer> map = new LinkedHashMap<>(Map.of("a", 1, "b", 2, "c", 3));
SequencedMap<String, Integer> reversed = map.reversed();
System.out.println("Reversed map: " + reversed);
```

**Output:** `Reversed map: {c=3, b=2, a=1}`

---

## 7. Pattern Matching for switch (JEP 441)

### Concept

**Pattern matching for switch** allows `switch` to match on types and conditions. It replaces many `instanceof` + cast patterns and handles `null` explicitly. Pattern variables are in scope only where they are matched.

### Example: Format by type with guards and null

```java
static String format(Object obj) {
    return switch (obj) {
        case null -> "null";
        case Integer i when i > 0 -> "positive int: " + i;
        case Integer i -> "int: " + i;
        case Long l -> "long: " + l;
        case String s -> "string: " + s;
        default -> "other: " + obj;
    };
}

public static void main(String[] args) {
    System.out.println(format(1));
    System.out.println(format(-1));
    System.out.println(format("hi"));
    System.out.println(format(null));
}
```

**Output:**
```
positive int: 1
int: -1
string: hi
null
```

---

## 8. Record Patterns (JEP 440)

### Concept

**Record patterns** deconstruct records (and other types) directly in `instanceof` and `switch`, so you can bind components by position and use them in guards or in the case body.

### Example: Point quadrant with record pattern

```java
record Point(int x, int y) {}

static String quadrant(Point p) {
    return switch (p) {
        case Point(0, 0) -> "origin";
        case Point(int x, int y) when x > 0 && y > 0 -> "Q1";
        case Point(int x, int y) when x < 0 && y > 0 -> "Q2";
        case Point(int x, int y) when x < 0 && y < 0 -> "Q3";
        case Point(int x, int y) when x > 0 && y < 0 -> "Q4";
        default -> "axis";
    };
}

public static void main(String[] args) {
    for (Point p : List.of(new Point(0, 0), new Point(1, 1), new Point(-1, 2))) {
        System.out.println(p + " -> " + quadrant(p));
    }
}
```

**Output:**
```
Point[x=0, y=0] -> origin
Point[x=1, y=1] -> Q1
Point[x=-1, y=2] -> Q2
```

---

## 9. Unnamed Patterns & Variables (JEP 443, preview)

### Concept

**Unnamed patterns and variables** use `_` when you do not need to bind a value. This makes intent clear and avoids unused variable warnings. Requires `--enable-preview`.

### Example: Ignore components in switch

```java
// Requires: javac --enable-preview --release 21, java --enable-preview
record Box(String name, int value) {}

static String describe(Box b) {
    return switch (b) {
        case Box(_, 0) -> "zero value";
        case Box("secret", _) -> "secret box";
        case Box(String n, int v) -> n + ": " + v;
    };
}

public static void main(String[] args) {
    System.out.println(describe(new Box("a", 0)));
    System.out.println(describe(new Box("secret", 10)));
}
```

**Output:**
```
zero value
secret box
```

Unnamed local variables: `int _ = sideEffect();` when you only care about the side effect.

---

## 10. String Templates (JEP 430, preview)

### Concept

**String templates** provide safe, programmable string interpolation. A template is a mix of literal text and embedded expressions; a processor (e.g. `STR`) produces a string. Requires `--enable-preview`.

### Example: STR processor

```java
// Requires: javac --enable-preview --release 21, java --enable-preview
import static java.lang.StringTemplate.STR;

String name = "Java";
int version = 21;
String msg = STR."Hello, \{name} version \{version}!";
System.out.println(msg);
```

**Output:** `Hello, Java version 21!`

Expressions inside `\{...}` are evaluated and then replaced by the processor (e.g. `STR` for plain concatenation).

---

## 11. Foreign Function & Memory API (JEP 442)

### Concept

The **Foreign Function & Memory (FFM) API** offers a pure-Java, safe way to work with off-heap memory and native code. It replaces or supersedes `sun.misc.Unsafe` and reduces the need for JNI for many use cases. Memory is managed via arenas and segments with clear lifetimes.

### Example: Allocate, write, read in native memory

```java
import java.lang.foreign.*;

public class FFMExample {
    public static void main(String[] args) {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment segment = arena.allocate(ValueLayout.JAVA_INT, 4);
            segment.set(ValueLayout.JAVA_INT, 0, 42);
            int value = segment.get(ValueLayout.JAVA_INT, 0);
            System.out.println("Read back: " + value);
        }
    }
}
```

**Output:** `Read back: 42`

**Behavior:** The segment is allocated in the arena and automatically freed when the try block exits. No manual free; no use-after-free from Java side when used correctly.

---

## 12. Other improvements (brief)

- **HttpClient:** Continued improvements and stability for HTTP/2 and WebSocket.
- **Deprecations/removals:** Some legacy APIs (e.g. certain constructors or methods) are deprecated or removed; check release notes when upgrading.
- **GC:** ZGC and G1 improvements for low-latency and throughput; ZGC can be the default on some configurations.

For streams, collections, and general Java 8+ style examples, see [JAVA_STREAMS_AND_INTERVIEW_EXAMPLES.md](JAVA_STREAMS_AND_INTERVIEW_EXAMPLES.md) and [JAVA_LIST_GUIDE.md](JAVA_LIST_GUIDE.md).

---

## 13. Quick reference table

| Feature | JEP | Category | One-line usage summary |
|--------|-----|----------|------------------------|
| Virtual Threads | 444 | Concurrency | `Thread.ofVirtual().start(...)` or `Executors.newVirtualThreadPerTaskExecutor()` |
| Structured Concurrency | 453 | Concurrency | `StructuredTaskScope` (e.g. `ShutdownOnFailure`) to run and coordinate subtasks |
| Scoped Values | 429 | Concurrency | `ScopedValue.where(KEY, value).run(() -> ...)` then `KEY.get()` |
| Sequenced Collections | 431 | Collections | `list.getFirst()`, `list.getLast()`, `list.reversed()`; same idea for `SequencedMap` |
| Pattern Matching switch | 441 | Language | `switch (obj) { case Type t -> ...; case null -> ...; default -> ... }` |
| Record Patterns | 440 | Language | `case Point(int x, int y) when x > 0 -> ...` in switch or instanceof |
| Unnamed Patterns/Vars | 443 | Language (preview) | Use `_` in patterns or as variable name when value is unused |
| String Templates | 430 | Language (preview) | `STR."Text \{expr} more text"` |
| FFM API | 442 | Interop | `Arena.ofConfined()`, `arena.allocate(layout)`, `segment.get/set` |

All examples in this guide target **Java 21**. Preview features require `--enable-preview` at compile and run time.
