Java 8 Interview Examples (Functional Interfaces and Core Concepts)

Functional Interfaces (Built-in)

Function<T, R>
```
Function<String, Integer> lengthFn = s -> s.length();
int len = lengthFn.apply("java8");
```

Predicate<T>
```
Predicate<Integer> isEven = n -> n % 2 == 0;
boolean ok = isEven.test(10);
```

Consumer<T>
```
Consumer<String> printer = s -> System.out.println(s);
printer.accept("Hello");
```

Supplier<T>
```
Supplier<UUID> uuidSupplier = () -> UUID.randomUUID();
UUID id = uuidSupplier.get();
```

BiFunction<T, U, R>
```
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
int sum = add.apply(2, 3);
```

UnaryOperator<T> and BinaryOperator<T>
```
UnaryOperator<String> trim = s -> s.trim();
BinaryOperator<Integer> max = (a, b) -> a > b ? a : b;
```

Custom Functional Interface
```
@FunctionalInterface
public interface Converter<F, T> {
  T convert(F from);
}

Converter<String, Integer> toInt = Integer::valueOf;
int value = toInt.convert("42");
```

Default and Static Methods in Interface
```
public interface Logger {
  default void info(String msg) { System.out.println("INFO: " + msg); }
  static Logger noop() { return msg -> {}; }
  void log(String msg);
}
```

Lambda Expressions
```
List<String> names = Arrays.asList("Ava", "Ben", "Chris");
names.forEach(n -> System.out.println(n));
```

Method References
```
List<String> names = Arrays.asList("Ava", "Ben");
names.forEach(System.out::println);
```

Constructor References
```
Supplier<List<String>> listSupplier = ArrayList::new;
List<String> list = listSupplier.get();
```

Streams Basics
```
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> evens = nums.stream()
  .filter(n -> n % 2 == 0)
  .collect(Collectors.toList());
```

Map vs FlatMap
```
List<List<String>> data = Arrays.asList(
  Arrays.asList("a", "b"),
  Arrays.asList("c")
);
List<String> flat = data.stream()
  .flatMap(List::stream)
  .collect(Collectors.toList());
```

Collectors Examples
```
Map<String, Long> countByCity = users.stream()
  .collect(Collectors.groupingBy(User::getCity, Collectors.counting()));

String joined = names.stream().collect(Collectors.joining(", "));
```

Optional Basics
```
Optional<String> opt = Optional.of("value");
String v = opt.orElse("default");
```

Optional with map and flatMap
```
Optional<User> userOpt = Optional.of(user);
String email = userOpt.map(User::getEmail).orElse("n/a");
```

Parallel Streams
```
long count = nums.parallelStream().filter(n -> n > 2).count();
```

Date and Time API
```
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plusWeeks(1);
Duration d = Duration.between(Instant.now(), Instant.now().plusSeconds(5));
```

CompletableFuture
```
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "data")
  .thenApply(String::toUpperCase);
String result = future.join();
```

Nashorn (JavaScript Engine)
```
ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
engine.eval("print('hello')");
```

Base64 Encoding
```
String encoded = Base64.getEncoder().encodeToString("hello".getBytes());
byte[] decoded = Base64.getDecoder().decode(encoded);
```

More Java 8 Examples with Output (20)

1) Convert List to Map (id -> name)
```
List<User> users = Arrays.asList(
  new User(1, "Ava"),
  new User(2, "Ben")
);
Map<Integer, String> idToName = users.stream()
  .collect(Collectors.toMap(User::getId, User::getName));
System.out.println(idToName);
// Output: {1=Ava, 2=Ben}
```

2) Convert Map to List (values)
```
Map<Integer, String> map = new HashMap<>();
map.put(1, "A");
map.put(2, "B");
List<String> values = new ArrayList<>(map.values());
System.out.println(values);
// Output: [A, B]
```

3) Remove duplicate characters from a string
```
String input = "banana";
String unique = input.chars()
  .distinct()
  .mapToObj(c -> String.valueOf((char) c))
  .collect(Collectors.joining());
System.out.println(unique);
// Output: ban
```

4) Remove duplicate words
```
String s = "java java spring boot spring";
String result = Arrays.stream(s.split("\\s+"))
  .distinct()
  .collect(Collectors.joining(" "));
System.out.println(result);
// Output: java spring boot
```

5) Reverse a string
```
String s = "hello";
String reversed = new StringBuilder(s).reverse().toString();
System.out.println(reversed);
// Output: olleh
```

6) Reverse each word in a sentence
```
String s = "java spring";
String reversedWords = Arrays.stream(s.split("\\s+"))
  .map(w -> new StringBuilder(w).reverse().toString())
  .collect(Collectors.joining(" "));
System.out.println(reversedWords);
// Output: avaj gnirps
```

7) flatMap example
```
List<List<Integer>> list = Arrays.asList(
  Arrays.asList(1, 2),
  Arrays.asList(3, 4)
);
List<Integer> flat = list.stream().flatMap(List::stream).collect(Collectors.toList());
System.out.println(flat);
// Output: [1, 2, 3, 4]
```

8) map() example
```
List<String> names = Arrays.asList("ava", "ben");
List<String> upper = names.stream().map(String::toUpperCase).collect(Collectors.toList());
System.out.println(upper);
// Output: [AVA, BEN]
```

9) Find first element
```
List<Integer> nums = Arrays.asList(10, 20, 30);
int first = nums.stream().findFirst().orElse(-1);
System.out.println(first);
// Output: 10
```

10) Filter and count
```
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
long count = nums.stream().filter(n -> n > 2).count();
System.out.println(count);
// Output: 3
```

11) Sort ascending
```
List<Integer> nums = Arrays.asList(4, 1, 3);
List<Integer> sorted = nums.stream().sorted().collect(Collectors.toList());
System.out.println(sorted);
// Output: [1, 3, 4]
```

12) Sort descending
```
List<Integer> nums = Arrays.asList(4, 1, 3);
List<Integer> sorted = nums.stream().sorted(Comparator.reverseOrder()).collect(Collectors.toList());
System.out.println(sorted);
// Output: [4, 3, 1]
```

13) Group by
```
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

14) Partition by predicate
```
Map<Boolean, List<Integer>> parts = nums.stream()
  .collect(Collectors.partitioningBy(n -> n % 2 == 0));
System.out.println(parts.get(true));
// Output: [2, 4]
```

15) Sum using reduce
```
int sum = nums.stream().reduce(0, Integer::sum);
System.out.println(sum);
// Output: 15
```

16) Remove nulls
```
List<String> list = Arrays.asList("A", null, "B");
List<String> cleaned = list.stream().filter(Objects::nonNull).collect(Collectors.toList());
System.out.println(cleaned);
// Output: [A, B]
```

17) Frequency map
```
List<String> items = Arrays.asList("a", "b", "a");
Map<String, Long> freq = items.stream()
  .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
System.out.println(freq);
// Output: {a=2, b=1}
```

18) Check all match
```
boolean allEven = Arrays.asList(2, 4, 6).stream().allMatch(n -> n % 2 == 0);
System.out.println(allEven);
// Output: true
```

19) Nth highest number (3rd)
```
List<Integer> nums = Arrays.asList(9, 1, 5, 3, 7);
int third = nums.stream()
  .sorted(Comparator.reverseOrder())
  .skip(2)
  .findFirst()
  .orElse(-1);
System.out.println(third);
// Output: 5
```

20) Tricky: parallel stream order
```
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
nums.parallelStream().forEach(System.out::print);
System.out.println();
nums.parallelStream().forEachOrdered(System.out::print);
System.out.println();
// Output: first line order is not guaranteed, second line is 12345
```

Common Interview Notes
- Functional interfaces have exactly one abstract method.
- @FunctionalInterface is optional but recommended.
- Streams are lazy; terminal operations trigger execution.
- parallelStream uses ForkJoinPool common pool.
