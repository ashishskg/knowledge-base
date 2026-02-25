Java 8 Interview Examples (Functional Interfaces and Core Concepts)

---




## Table of Contents

- [1. Functional Interfaces (Built-in)](#1-functional-interfaces-built-in)
  - [1.1 Function\<T, R>](#1-1-function-t-r)
  - [1.2 Predicate\<T>](#1-2-predicate-t)
  - [1.3 Consumer\<T>](#1-3-consumer-t)
  - [1.4 Supplier\<T>](#1-4-supplier-t)
  - [1.5 BiFunction\<T, U, R>](#1-5-bifunction-t-u-r)
  - [1.6 UnaryOperator\<T> and BinaryOperator\<T>](#1-6-unaryoperator-t-and-binaryoperator-t)
- [2. Custom Functional Interface](#2-custom-functional-interface)
- [3. Default and Static Methods in Interface](#3-default-and-static-methods-in-interface)
- [4. Lambda Expressions](#4-lambda-expressions)
- [5. Method References](#5-method-references)
- [6. Constructor References](#6-constructor-references)
- [7. Streams Basics](#7-streams-basics)
- [8. map vs flatMap](#8-map-vs-flatmap)
- [9. Collectors Examples](#9-collectors-examples)
- [10. Optional Basics](#10-optional-basics)
  - [10.1 Optional with map and flatMap](#10-1-optional-with-map-and-flatmap)
- [11. Parallel Streams](#11-parallel-streams)
- [12. Date and Time API](#12-date-and-time-api)
- [13. CompletableFuture](#13-completablefuture)
- [14. Nashorn (JavaScript Engine)](#14-nashorn-javascript-engine)
- [15. Base64 Encoding](#15-base64-encoding)
- [16. More Java 8 Examples with Output (20)](#16-more-java-8-examples-with-output-20)
  - [16.1 Convert List to Map (id -> name)](#16-1-convert-list-to-map-id-name)
  - [16.2 Convert Map to List (values)](#16-2-convert-map-to-list-values)
  - [16.3 Remove duplicate characters from a string](#16-3-remove-duplicate-characters-from-a-string)
  - [16.4 Remove duplicate words](#16-4-remove-duplicate-words)
  - [16.5 Reverse a string](#16-5-reverse-a-string)
  - [16.6 Reverse each word in a sentence](#16-6-reverse-each-word-in-a-sentence)
  - [16.7 flatMap example](#16-7-flatmap-example)
  - [16.8 map() example](#16-8-map-example)
  - [16.9 Find first element](#16-9-find-first-element)
  - [16.10 Filter and count](#16-10-filter-and-count)
  - [16.11 Sort ascending](#16-11-sort-ascending)
  - [16.12 Sort descending](#16-12-sort-descending)
  - [16.13 Group by](#16-13-group-by)
  - [16.14 Partition by predicate](#16-14-partition-by-predicate)
  - [16.15 Sum using reduce](#16-15-sum-using-reduce)
  - [16.16 Remove nulls](#16-16-remove-nulls)
  - [16.17 Frequency map](#16-17-frequency-map)
  - [16.18 Check all match](#16-18-check-all-match)
  - [16.19 Nth highest number (3rd)](#16-19-nth-highest-number-3rd)
  - [16.20 Tricky: parallel stream order](#16-20-tricky-parallel-stream-order)
- [17. Common Interview Notes](#17-common-interview-notes)


---

## 1. Functional Interfaces (Built-in)

### 1.1 Function\<T, R>

```java
Function<String, Integer> lengthFn = s -> s.length();
int len = lengthFn.apply("java8");
```

### 1.2 Predicate\<T>

```java
Predicate<Integer> isEven = n -> n % 2 == 0;
boolean ok = isEven.test(10);
```

### 1.3 Consumer\<T>

```java
Consumer<String> printer = s -> System.out.println(s);
printer.accept("Hello");
```

### 1.4 Supplier\<T>

```java
Supplier<UUID> uuidSupplier = () -> UUID.randomUUID();
UUID id = uuidSupplier.get();
```

### 1.5 BiFunction\<T, U, R>

```java
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
int sum = add.apply(2, 3);
```

### 1.6 UnaryOperator\<T> and BinaryOperator\<T>

```java
UnaryOperator<String> trim = s -> s.trim();
BinaryOperator<Integer> max = (a, b) -> a > b ? a : b;
```

## 2. Custom Functional Interface

```java
@FunctionalInterface
public interface Converter<F, T> {
  T convert(F from);
}

Converter<String, Integer> toInt = Integer::valueOf;
int value = toInt.convert("42");
```

## 3. Default and Static Methods in Interface

```java
public interface Logger {
  default void info(String msg) { System.out.println("INFO: " + msg); }
  static Logger noop() { return msg -> {}; }
  void log(String msg);
}
```

## 4. Lambda Expressions

```java
List<String> names = Arrays.asList("Ava", "Ben", "Chris");
names.forEach(n -> System.out.println(n));
```

## 5. Method References

```java
List<String> names = Arrays.asList("Ava", "Ben");
names.forEach(System.out::println);
```

## 6. Constructor References

```java
Supplier<List<String>> listSupplier = ArrayList::new;
List<String> list = listSupplier.get();
```

## 7. Streams Basics

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> evens = nums.stream()
  .filter(n -> n % 2 == 0)
  .collect(Collectors.toList());
```

## 8. map vs flatMap

```java
List<List<String>> data = Arrays.asList(
  Arrays.asList("a", "b"),
  Arrays.asList("c")
);
List<String> flat = data.stream()
  .flatMap(List::stream)
  .collect(Collectors.toList());
```

## 9. Collectors Examples

```java
Map<String, Long> countByCity = users.stream()
  .collect(Collectors.groupingBy(User::getCity, Collectors.counting()));

String joined = names.stream().collect(Collectors.joining(", "));
```

## 10. Optional Basics

```java
Optional<String> opt = Optional.of("value");
String v = opt.orElse("default");
```

### 10.1 Optional with map and flatMap

```java
Optional<User> userOpt = Optional.of(user);
String email = userOpt.map(User::getEmail).orElse("n/a");
```

## 11. Parallel Streams

```java
long count = nums.parallelStream().filter(n -> n > 2).count();
```

## 12. Date and Time API

```java
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plusWeeks(1);
Duration d = Duration.between(Instant.now(), Instant.now().plusSeconds(5));
```

## 13. CompletableFuture

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "data")
  .thenApply(String::toUpperCase);
String result = future.join();
```

## 14. Nashorn (JavaScript Engine)

```java
ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
engine.eval("print('hello')");
```

## 15. Base64 Encoding

```java
String encoded = Base64.getEncoder().encodeToString("hello".getBytes());
byte[] decoded = Base64.getDecoder().decode(encoded);
```

## 16. More Java 8 Examples with Output (20)

### 16.1 Convert List to Map (id -> name)

```java
List<User> users = Arrays.asList(
  new User(1, "Ava"),
  new User(2, "Ben")
);
Map<Integer, String> idToName = users.stream()
  .collect(Collectors.toMap(User::getId, User::getName));
System.out.println(idToName);
// Output: {1=Ava, 2=Ben}
```

### 16.2 Convert Map to List (values)

```java
Map<Integer, String> map = new HashMap<>();
map.put(1, "A");
map.put(2, "B");
List<String> values = new ArrayList<>(map.values());
System.out.println(values);
// Output: [A, B]
```

### 16.3 Remove duplicate characters from a string

```java
String input = "banana";
String unique = input.chars()
  .distinct()
  .mapToObj(c -> String.valueOf((char) c))
  .collect(Collectors.joining());
System.out.println(unique);
// Output: ban
```

### 16.4 Remove duplicate words

```java
String s = "java java spring boot spring";
String result = Arrays.stream(s.split("\\s+"))
  .distinct()
  .collect(Collectors.joining(" "));
System.out.println(result);
// Output: java spring boot
```

### 16.5 Reverse a string

```java
String s = "hello";
String reversed = new StringBuilder(s).reverse().toString();
System.out.println(reversed);
// Output: olleh
```

### 16.6 Reverse each word in a sentence

```java
String s = "java spring";
String reversedWords = Arrays.stream(s.split("\\s+"))
  .map(w -> new StringBuilder(w).reverse().toString())
  .collect(Collectors.joining(" "));
System.out.println(reversedWords);
// Output: avaj gnirps
```

### 16.7 flatMap example

```java
List<List<Integer>> list = Arrays.asList(
  Arrays.asList(1, 2),
  Arrays.asList(3, 4)
);
List<Integer> flat = list.stream().flatMap(List::stream).collect(Collectors.toList());
System.out.println(flat);
// Output: [1, 2, 3, 4]
```

### 16.8 map() example

```java
List<String> names = Arrays.asList("ava", "ben");
List<String> upper = names.stream().map(String::toUpperCase).collect(Collectors.toList());
System.out.println(upper);
// Output: [AVA, BEN]
```

### 16.9 Find first element

```java
List<Integer> nums = Arrays.asList(10, 20, 30);
int first = nums.stream().findFirst().orElse(-1);
System.out.println(first);
// Output: 10
```

### 16.10 Filter and count

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
long count = nums.stream().filter(n -> n > 2).count();
System.out.println(count);
// Output: 3
```

### 16.11 Sort ascending

```java
List<Integer> nums = Arrays.asList(4, 1, 3);
List<Integer> sorted = nums.stream().sorted().collect(Collectors.toList());
System.out.println(sorted);
// Output: [1, 3, 4]
```

### 16.12 Sort descending

```java
List<Integer> nums = Arrays.asList(4, 1, 3);
List<Integer> sorted = nums.stream().sorted(Comparator.reverseOrder()).collect(Collectors.toList());
System.out.println(sorted);
// Output: [4, 3, 1]
```

### 16.13 Group by

```java
List<User> users = Arrays.asList(
  new User(1, "A", "NY"),
  new User(2, "B", "SF"),
  new User(3, "C", "NY")
);
Map<String, List<User>> byCity = users.stream()
  .collect(Collectors.groupingBy(User::getCity));
System.out.println(byCity.keySet());
// Output: [NY, SF]
```

### 16.14 Partition by predicate

```java
Map<Boolean, List<Integer>> parts = nums.stream()
  .collect(Collectors.partitioningBy(n -> n % 2 == 0));
System.out.println(parts.get(true));
// Output: [2, 4]
```

### 16.15 Sum using reduce

```java
int sum = nums.stream().reduce(0, Integer::sum);
System.out.println(sum);
// Output: 15
```

### 16.16 Remove nulls

```java
List<String> list = Arrays.asList("A", null, "B");
List<String> cleaned = list.stream().filter(Objects::nonNull).collect(Collectors.toList());
System.out.println(cleaned);
// Output: [A, B]
```

### 16.17 Frequency map

```java
List<String> items = Arrays.asList("a", "b", "a");
Map<String, Long> freq = items.stream()
  .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
System.out.println(freq);
// Output: {a=2, b=1}
```

### 16.18 Check all match

```java
boolean allEven = Arrays.asList(2, 4, 6).stream().allMatch(n -> n % 2 == 0);
System.out.println(allEven);
// Output: true
```

### 16.19 Nth highest number (3rd)

```java
List<Integer> nums = Arrays.asList(9, 1, 5, 3, 7);
int third = nums.stream()
  .sorted(Comparator.reverseOrder())
  .skip(2)
  .findFirst()
  .orElse(-1);
System.out.println(third);
// Output: 5
```

### 16.20 Tricky: parallel stream order

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
nums.parallelStream().forEach(System.out::print);
System.out.println();
nums.parallelStream().forEachOrdered(System.out::print);
System.out.println();
// Output: first line order is not guaranteed, second line is 12345
```

## 17. Common Interview Notes

- Functional interfaces have exactly one abstract method.
- @FunctionalInterface is optional but recommended.
- Streams are lazy; terminal operations trigger execution.
- parallelStream uses ForkJoinPool common pool.
