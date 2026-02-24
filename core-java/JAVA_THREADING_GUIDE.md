# Java Threading Guide

A single reference for Java threading: classic APIs (Thread, Runnable, Executor, join, synchronization, deadlock), Java 21 virtual threads and structured concurrency, senior-level interview Q&A, and Spring Boot integration. All examples use **Java 21** and include **Output** or behavior where applicable.

**Audience:** Developers preparing for senior-level interviews or adopting Java 21 concurrency.  
**Prerequisites:** Java 21; Spring Boot 3.x for the web section.

---

## 1. Introduction

This guide covers:

- **Basics:** Thread class, Runnable, join, thread lifecycle.
- **Concurrency:** synchronized, volatile, ReentrantLock, race conditions, deadlock.
- **Executors:** Thread pools, Callable/Future, invokeAll/invokeAny.
- **Java 21:** Virtual threads, structured concurrency, and when they help.
- **Advanced:** CompletableFuture, CountDownLatch, CyclicBarrier, Phaser, ThreadLocal vs ScopedValue.
- **Interview:** Q&A with code for 11+ years experience.
- **Spring Boot:** Enabling virtual threads in a web application.

Cross-references: [JAVA_21_FEATURES_GUIDE.md](JAVA_21_FEATURES_GUIDE.md) (virtual threads, ScopedValue), [JAVA_CONCURRENTHASHMAP_GUIDE.md](JAVA_CONCURRENTHASHMAP_GUIDE.md) (concurrent collections).

---

## 2. Core concepts (simple examples)

### 2.1 Thread class: extend Thread vs pass Runnable

**Extending Thread:** Override `run()`. Call `start()` to run on a new thread; calling `run()` directly runs on the current thread.

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Running in " + Thread.currentThread().getName());
    }
}
MyThread t = new MyThread();
t.start();  // new thread
// t.run(); // would run in caller thread
t.join();
```

**Output:** `Running in Thread-0` (or similar).

**Passing Runnable:** Prefer this so the class can extend something else; same `start()`/`run()` semantics.

```java
Thread t = new Thread(() -> System.out.println("Hello from " + Thread.currentThread().getName()));
t.start();
t.join();
```

**Output:** `Hello from Thread-0`

### 2.2 Runnable and lambda

```java
Runnable r = () -> System.out.println("Lambda runnable");
new Thread(r).start();
Thread.ofVirtual().start(r);
```

**Output:** Two lines (order may vary): one from a platform thread, one from a virtual thread.

### 2.3 join() – wait for thread to finish

```java
var list = new java.util.concurrent.CopyOnWriteArrayList<String>();
Thread t1 = new Thread(() -> { list.add("A"); });
Thread t2 = new Thread(() -> { list.add("B"); });
t1.start();
t2.start();
t1.join();
t2.join();
System.out.println(list);
```

**Output:** `[A, B]` (order may vary). Without `join()`, the main thread might print before A or B is added.

### 2.4 Thread lifecycle (brief)

- **NEW** – created, not started.
- **RUNNABLE** – may be running or ready.
- **BLOCKED** – waiting for monitor (e.g. synchronized).
- **WAITING / TIMED_WAITING** – wait(), join(sleep), sleep().
- **TERMINATED** – run() finished.

---

## 3. Synchronization and shared state

### 3.1 synchronized (method and block)

Shared counter without sync can lose updates (race). With sync, increments are serialized.

**Without sync (racy):**

```java
class Counter {
    private int count;
    void inc() { count++; }
    int get() { return count; }
}
Counter c = new Counter();
Thread t1 = new Thread(() -> { for (int i = 0; i < 10000; i++) c.inc(); });
Thread t2 = new Thread(() -> { for (int i = 0; i < 10000; i++) c.inc(); });
t1.start(); t2.start(); t1.join(); t2.join();
System.out.println(c.get());  // often less than 20000
```

**Output:** Often something like `15234` (lost updates).

**With synchronized:**

```java
class SyncCounter {
    private int count;
    synchronized void inc() { count++; }
    synchronized int get() { return count; }
}
SyncCounter c = new SyncCounter();
Thread t1 = new Thread(() -> { for (int i = 0; i < 10000; i++) c.inc(); });
Thread t2 = new Thread(() -> { for (int i = 0; i < 10000; i++) c.inc(); });
t1.start(); t2.start(); t1.join(); t2.join();
System.out.println(c.get());
```

**Output:** `20000`

### 3.2 volatile – visibility only

`volatile` guarantees visibility across threads but not atomicity of read-modify-write.

```java
volatile boolean flag = true;
// Thread 1: flag = false;
// Thread 2: while (flag) { }  // sees update
// But: count++ with volatile count is still racy; use AtomicInteger or synchronized.
```

### 3.3 ReentrantLock – lock/unlock and tryLock

```java
var lock = new java.util.concurrent.locks.ReentrantLock();
lock.lock();
try {
    System.out.println("Holding lock");
} finally {
    lock.unlock();
}
// tryLock with timeout (avoids deadlock risk)
if (lock.tryLock(1, java.util.concurrent.TimeUnit.SECONDS)) {
    try {
        System.out.println("Acquired with tryLock");
    } finally {
        lock.unlock();
    }
}
```

**Output:**
```
Holding lock
Acquired with tryLock
```

### 3.4 wait() and notify()

Use `wait()` / `notify()` (or `notifyAll()`) for condition waiting inside a synchronized block. The thread releases the monitor and wakes when another thread calls notify.

```java
Object lock = new Object();
var list = new java.util.ArrayList<String>();
Thread producer = new Thread(() -> {
    synchronized (lock) {
        list.add("item");
        lock.notify();
    }
});
Thread consumer = new Thread(() -> {
    synchronized (lock) {
        while (list.isEmpty()) {
            try { lock.wait(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }
        System.out.println(list.remove(0));
    }
});
consumer.start();
Thread.sleep(50);
producer.start();
producer.join();
consumer.join();
```

**Output:** `item`

### 3.5 Race condition – before and after fix

Same counter example as above: without sync you get a race (wrong total); with sync or AtomicInteger you get the correct total.

---

## 4. Deadlock

### 4.1 What is deadlock

**Deadlock** means two or more threads are blocked forever, each holding a resource the other needs. Four conditions (all must hold):

1. **Mutual exclusion** – only one thread can hold the resource.
2. **Hold and wait** – thread holds at least one resource and waits for another.
3. **No preemption** – resources cannot be forcibly taken.
4. **Circular wait** – there is a cycle in the “wait-for” graph (e.g. T1 waits for T2, T2 waits for T1).

### 4.2 Classic deadlock example

Two locks, two threads acquiring in opposite order:

```java
Object lockA = new Object();
Object lockB = new Object();
Thread t1 = new Thread(() -> {
    synchronized (lockA) {
        try { Thread.sleep(10); } catch (InterruptedException e) {}
        synchronized (lockB) { System.out.println("T1"); }
    }
});
Thread t2 = new Thread(() -> {
    synchronized (lockB) {
        try { Thread.sleep(10); } catch (InterruptedException e) {}
        synchronized (lockA) { System.out.println("T2"); }
    }
});
t1.start();
t2.start();
t1.join(2000);
t2.join(2000);
// If deadlock occurs, neither "T1" nor "T2" prints; both threads block.
```

**Behavior:** T1 holds A and wants B; T2 holds B and wants A. They can block indefinitely (deadlock).

### 4.3 How to avoid deadlock

- **Lock ordering:** Always acquire locks in the same global order (e.g. always lock A then B). Then no circular wait.
- **tryLock with timeout:** If you cannot get the second lock in time, release the first and retry or abort.

```java
var lock1 = new java.util.concurrent.locks.ReentrantLock();
var lock2 = new java.util.concurrent.locks.ReentrantLock();
// Both threads: acquire lock1 then lock2 (same order) – no deadlock.
Thread t1 = new Thread(() -> {
    lock1.lock();
    try {
        lock2.lock();
        try {
            System.out.println("T1 done");
        } finally { lock2.unlock(); }
    } finally { lock1.unlock(); }
});
Thread t2 = new Thread(() -> {
    lock1.lock();
    try {
        lock2.lock();
        try {
            System.out.println("T2 done");
        } finally { lock2.unlock(); }
    } finally { lock1.unlock(); }
});
t1.start(); t2.start(); t1.join(); t2.join();
```

**Output:**
```
T1 done
T2 done
```

### 4.4 Detection

Use a thread dump to see blocked threads and which locks they hold/wait for: `jstack <pid>` or kill -3. Look for “deadlock” in the output.

---

## 5. Executors and thread pools (old way)

### 5.1 ExecutorService – fixed thread pool

```java
ExecutorService exec = Executors.newFixedThreadPool(2);
exec.submit(() -> System.out.println("Task 1"));
exec.submit(() -> System.out.println("Task 2"));
exec.shutdown();
exec.awaitTermination(5, TimeUnit.SECONDS);
```

**Output:**
```
Task 1
Task 2
```
(order may vary)

### 5.2 Callable and Future

```java
ExecutorService exec = Executors.newFixedThreadPool(1);
Future<Integer> f = exec.submit(() -> 1 + 2);
System.out.println(f.get(2, TimeUnit.SECONDS));
exec.shutdown();
```

**Output:** `3`

### 5.3 invokeAll and invokeAny

```java
ExecutorService exec = Executors.newFixedThreadPool(2);
List<Callable<String>> tasks = List.of(
    () -> "A",
    () -> "B",
    () -> "C"
);
List<Future<String>> futures = exec.invokeAll(tasks);
for (Future<String> fu : futures) {
    System.out.println(fu.get());
}
String first = exec.invokeAny(tasks);
System.out.println("First: " + first);
exec.shutdown();
```

**Output:** Prints A, B, C, then `First: A` (or B or C – any one).

### 5.4 Thread pool types

| Type | Creation | When to use |
|------|----------|-------------|
| Fixed | `newFixedThreadPool(n)` | Bounded concurrency; stable workload. |
| Cached | `newCachedThreadPool()` | Many short-lived tasks; threads reused, idle threads reclaimed. |
| Single | `newSingleThreadExecutor()` | Sequential execution, one task at a time. |

---

## 6. Java 21: Virtual threads and structured concurrency

### 6.1 Virtual threads – concept

**Virtual threads** (JEP 444) are lightweight; the JVM maps many virtual threads onto few platform (carrier) threads. Blocking a virtual thread (e.g. I/O) does not block a platform thread. Ideal for high-concurrency, I/O-bound workloads (APIs, DB calls).

### 6.2 Creating and using virtual threads

```java
Thread.ofVirtual().start(() -> System.out.println("Virtual: " + Thread.currentThread().getName()));
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    exec.submit(() -> System.out.println("From executor"));
}
```

**Output:** Two lines, one from a virtual thread, one from the executor’s virtual thread.

### 6.3 When to use virtual threads

- **Use for:** I/O-bound work, “thread-per-request” style, many concurrent blocking calls (DB, HTTP). No need to cap “thread” count like with a fixed pool.
- **Not for:** Purely CPU-bound parallelism (use platform threads or parallel streams); or when you already have a tuned reactive stack and don’t need to change.

### 6.4 Structured concurrency – StructuredTaskScope

Treat multiple concurrent subtasks as one unit: if one fails, others are cancelled; caller waits for all.

```java
try (var scope = new java.util.concurrent.StructuredTaskScope.ShutdownOnFailure()) {
    var f1 = scope.fork(() -> "result1");
    var f2 = scope.fork(() -> "result2");
    scope.join();
    scope.throwIfFailed();
    System.out.println(f1.resultNow() + " " + f2.resultNow());
}
```

**Output:** `result1 result2`  
**Behavior:** If either fork throws, the other is cancelled and the exception is propagated.

### 6.5 Old way vs Java 21

| Aspect | Old (platform thread pool) | Java 21 (virtual threads) |
|--------|----------------------------|---------------------------|
| Run task | `new Thread(r).start()` or `ExecutorService.submit(r)` | `Thread.ofVirtual().start(r)` or `Executors.newVirtualThreadPerTaskExecutor()` |
| Pool size | Must tune (e.g. 200); blocking ties up a thread | Effectively unlimited; blocking is cheap |
| Scale | Limited by pool size | Scale to millions of concurrent tasks |
| Code style | Same blocking code | Same blocking code; no API change |

---

## 7. Advanced topics (interview-style)

### 7.1 CompletableFuture

Chain async work with `thenApply`, `thenCompose`, `allOf`:

```java
CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> b = a.thenApply(s -> s + " World");
CompletableFuture<String> c = b.thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "!"));
System.out.println(c.get());

CompletableFuture<String> d = CompletableFuture.supplyAsync(() -> "D");
CompletableFuture<String> e = CompletableFuture.supplyAsync(() -> "E");
CompletableFuture<Void> all = CompletableFuture.allOf(c, d, e);
all.join();
System.out.println(c.get() + " " + d.get() + " " + e.get());
```

**Output:** `Hello World!` then `Hello World! D E` (order of D/E may vary).

### 7.2 CountDownLatch – wait for N completions

```java
int n = 3;
CountDownLatch latch = new CountDownLatch(n);
for (int i = 0; i < n; i++) {
    int id = i;
    new Thread(() -> {
        System.out.println("Done " + id);
        latch.countDown();
    }).start();
}
latch.await();
System.out.println("All done");
```

**Output:** Three “Done 0/1/2” lines (order may vary), then `All done`.

### 7.3 CyclicBarrier – start N tasks together

```java
int n = 2;
CyclicBarrier barrier = new CyclicBarrier(n, () -> System.out.println("Barrier opened"));
for (int i = 0; i < n; i++) {
    int id = i;
    new Thread(() -> {
        try {
            System.out.println("Waiting " + id);
            barrier.await();
            System.out.println("Running " + id);
        } catch (Exception e) { throw new RuntimeException(e); }
    }).start();
}
Thread.sleep(500);
```

**Output:** “Waiting 0”, “Waiting 1”, “Barrier opened”, “Running 0”, “Running 1” (order may vary).

### 7.4 Phaser (brief)

`Phaser` is a reusable barrier with phases: parties register, arrive, and can deregister. Useful for multi-phase parallel algorithms.

```java
Phaser phaser = new Phaser(2);
new Thread(() -> {
    System.out.println("A at phase " + phaser.getPhase());
    phaser.arriveAndAwaitAdvance();
    System.out.println("A after phase 0");
}).start();
new Thread(() -> {
    phaser.arriveAndAwaitAdvance();
    System.out.println("B after phase 0");
}).start();
Thread.sleep(500);
```

**Output:** “A at phase 0”, then “A after phase 0” and “B after phase 0” (order may vary).

### 7.5 ThreadLocal and ScopedValue (Java 21)

**ThreadLocal:** Per-thread storage. With virtual threads you can have millions of threads, so ThreadLocal can lead to large memory use or “leaks” if not cleaned up. Prefer **ScopedValue** (Java 21) for scoped, inheritable context that works well with virtual threads. See [JAVA_21_FEATURES_GUIDE.md](JAVA_21_FEATURES_GUIDE.md) for ScopedValue examples.

### 7.6 Concurrent collections

- **ConcurrentHashMap** – thread-safe map; use `compute`, `merge` for atomic updates. See [JAVA_CONCURRENTHASHMAP_GUIDE.md](JAVA_CONCURRENTHASHMAP_GUIDE.md).
- **BlockingQueue** – `put`/`take` for producer-consumer; e.g. `LinkedBlockingQueue`, `ArrayBlockingQueue`.

---

## 8. Interview Q&A (11+ years level)

### Q1: Difference between synchronized and ReentrantLock?

- **synchronized:** Language keyword; automatic unlock; no fairness guarantee; no tryLock.
- **ReentrantLock:** Explicit lock/unlock (in finally); can be fair; `tryLock()` and `tryLock(timeout)` to avoid deadlock; multiple `Condition` objects per lock. Use ReentrantLock when you need tryLock or fairness.

### Q2: How would you design a thread-safe cache?

Use **ConcurrentHashMap** with atomic compute: e.g. `map.computeIfAbsent(key, k -> expensiveCompute(k))`. For eviction and richer behavior, use **Caffeine** or **Guava Cache** (thread-safe by design).

### Q3: Why don’t virtual threads replace reactive (e.g. WebFlux) in all cases?

- Virtual threads make **blocking** I/O scalable; you keep a simple blocking style. Reactive is **non-blocking** and can be better when you need backpressure, or when the whole stack is already reactive. Use virtual threads for “blocking-style” scaling; use reactive when you need its model or existing reactive integrations.

### Q4: How to avoid deadlock in a payment transfer (two accounts)?

Use **lock ordering**: e.g. always lock the account with the smaller ID first (or use a global order). Then no circular wait.

```java
void transfer(Account from, Account to, int amount) {
    Object first = from.id < to.id ? from : to;
    Object second = from.id < to.id ? to : from;
    synchronized (first) {
        synchronized (second) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

### Q5: ExecutorService (platform) vs virtual thread executor – when to use which?

- **Platform pool:** When you need a fixed cap (e.g. limit DB connections), or CPU-bound parallelism with a small number of threads.
- **Virtual thread executor:** For I/O-bound, “thread-per-request” or many concurrent blocking calls; no need to size the pool for concurrency.

### Q6: How does join() work internally?

Conceptually the current thread enters a wait state until the target thread terminates. The JVM typically uses wait/notify (or similar) on the Thread object: when the target thread ends, it notifies waiters. Implementation detail; for interviews, “current thread blocks until the other thread finishes” is enough.

---

## 9. Spring Boot with Java 21 virtual threads

### 9.1 Enable virtual threads

**Spring Boot 3.2+** supports virtual threads for the embedded server (Tomcat/Jetty). In `application.properties`:

```properties
spring.threads.virtual.enabled=true
```

Or in `application.yml`:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

No code change in controllers or services: each request can run on a virtual thread instead of a platform thread from the server pool.

### 9.2 What it does

- Request handling runs on virtual threads; you can have many more concurrent requests without increasing the server’s platform thread pool.
- Blocking I/O in your code (DB, HTTP client) no longer ties up a scarce platform thread; the JVM schedules other virtual threads on the carrier pool.
- Same blocking style (e.g. `RestTemplate`, JPA); no need to switch to WebFlux unless you want reactive semantics.

### 9.3 When to use

- **Use:** Services with many concurrent blocking I/O calls (DB, HTTP), “thread-per-request” style, and Spring Boot 3.2+ on Java 21.
- **Optional:** Keep platform threads if you have a small, well-tuned pool and low concurrency, or if you rely on a reactive stack and don’t want to mix.

### 9.4 Minimal example (conceptual)

Controller and service stay blocking; only configuration changes:

```java
@RestController
public class MyController {
    private final MyService service;
    @GetMapping("/data")
    public String data() {
        return service.fetch();  // blocking call; runs on virtual thread if enabled
    }
}
```

With `spring.threads.virtual.enabled=true`, each request can run on a virtual thread, allowing many more concurrent requests without changing pool size.

---

## 10. Quick reference table

| Topic | Old / classic | Java 21 | Note |
|-------|----------------|---------|------|
| Run task | `new Thread(r).start()` or `ExecutorService.submit(r)` | `Thread.ofVirtual().start(r)` or `newVirtualThreadPerTaskExecutor()` | Virtual threads scale to millions |
| Blocking I/O | Ties up a platform thread; limit pool size | Cheap; use virtual threads | Prefer virtual threads for I/O-bound |
| Coordinate subtasks | Manual Future + get, or CompletableFuture | `StructuredTaskScope` (join, throwIfFailed) | Structured concurrency, no orphans |
| Per-request context | ThreadLocal | ScopedValue | ScopedValue better with virtual threads |
| Sync | synchronized, ReentrantLock | Same | No change in Java 21 |
| Deadlock avoid | Lock ordering, tryLock(timeout) | Same | Same |
| Thread pool | newFixedThreadPool(n), etc. | newVirtualThreadPerTaskExecutor() for I/O | Use virtual executor for high-concurrency I/O |

All examples in this guide target **Java 21**. For more on virtual threads and ScopedValue, see [JAVA_21_FEATURES_GUIDE.md](JAVA_21_FEATURES_GUIDE.md).
