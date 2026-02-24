# Java 8 Stream API & Interview Examples

A single reference for Java 8 Stream API usage, collection conversions, general interview-style problems, and string operations—each with code and explicit output.

**Typical imports:**
```java
import java.util.*;
import java.util.stream.*;
import java.util.function.*;
```

---

## 1. Stream API essentials (with output)

### 1.1 filter, map, flatMap

```java
List<String> list = List.of("apple", "banana", "apricot", "berry");
List<String> filtered = list.stream()
        .filter(s -> s.startsWith("a"))
        .collect(Collectors.toList());
// filtered = [apple, apricot]

List<Integer> lengths = list.stream()
        .map(String::length)
        .collect(Collectors.toList());
// lengths = [5, 6, 7, 5]

List<List<Integer>> nested = List.of(List.of(1, 2), List.of(3, 4), List.of(5));
List<Integer> flat = nested.stream()
        .flatMap(List::stream)
        .collect(Collectors.toList());
// flat = [1, 2, 3, 4, 5]
```

**Output:** `filtered = [apple, apricot]`, `lengths = [5, 6, 7, 5]`, `flat = [1, 2, 3, 4, 5]`

---

### 1.2 distinct, sorted, limit, skip

```java
List<Integer> list = List.of(3, 1, 2, 1, 3);
List<Integer> distinct = list.stream().distinct().collect(Collectors.toList());
List<Integer> sorted = list.stream().sorted().collect(Collectors.toList());
List<Integer> limited = list.stream().limit(2).collect(Collectors.toList());
List<Integer> skipped = list.stream().skip(2).collect(Collectors.toList());
```

**Output:** `distinct = [3, 1, 2]`, `sorted = [1, 1, 2, 3, 3]`, `limited = [3, 1]`, `skipped = [2, 1, 3]`

---

### 1.3 reduce (with and without identity)

```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
Optional<Integer> sumOpt = list.stream().reduce(Integer::sum);
Integer sumWithIdentity = list.stream().reduce(0, Integer::sum);
Optional<Integer> product = list.stream().reduce((a, b) -> a * b);
```

**Output:** `sumOpt = Optional[15]`, `sumWithIdentity = 15`, `product = Optional[120]`

---

### 1.4 collect: toList, toSet, toMap, joining, groupingBy, partitioningBy

```java
List<String> list = List.of("a", "b", "c");
List<String> toList = list.stream().collect(Collectors.toList());
Set<String> toSet = list.stream().collect(Collectors.toSet());
Map<String, Integer> toMap = list.stream()
        .collect(Collectors.toMap(Function.identity(), String::length));
String joined = list.stream().collect(Collectors.joining(", "));

List<String> words = List.of("apple", "banana", "apricot");
Map<Character, List<String>> byFirst = words.stream()
        .collect(Collectors.groupingBy(s -> s.charAt(0)));
Map<Boolean, List<Integer>> evensOdds = List.of(1, 2, 3, 4, 5).stream()
        .collect(Collectors.partitioningBy(n -> n % 2 == 0));
```

**Output:** `toList = [a, b, c]`, `toSet = [a, b, c]`, `toMap = {a=1, b=1, c=1}`, `joined = "a, b, c"`, `byFirst = {a=[apple, apricot], b=[banana]}`, `evensOdds = {false=[1, 3, 5], true=[2, 4]}`

---

### 1.5 Optional: findFirst, findAny, max, min

```java
List<String> list = List.of("a", "bb", "ccc", "dd");
Optional<String> first = list.stream().filter(s -> s.length() > 1).findFirst();
Optional<String> any = list.stream().filter(s -> s.length() > 1).findAny();
Optional<String> maxLen = list.stream().max(Comparator.comparingInt(String::length));
Optional<String> minLen = list.stream().min(Comparator.comparingInt(String::length));
```

**Output:** `first = Optional[bb]`, `any = Optional[bb]` (or another length>1), `maxLen = Optional[ccc]`, `minLen = Optional[a]`

---

### 1.6 Primitive streams: IntStream.range, mapToInt, sum

```java
List<Integer> range = IntStream.range(0, 5).boxed().collect(Collectors.toList());
int sum = IntStream.range(1, 6).sum();
List<String> words = List.of("a", "bb", "ccc");
int totalChars = words.stream().mapToInt(String::length).sum();
```

**Output:** `range = [0, 1, 2, 3, 4]`, `sum = 15`, `totalChars = 6`

---

## 2. Conversions (with output)

### 2.1 List → Map (element as key, index as value)

```java
List<String> list = List.of("apple", "banana", "mango");
Map<String, Integer> indexMap = IntStream.range(0, list.size())
        .boxed()
        .collect(Collectors.toMap(list::get, i -> i));
```

**Output:** `{apple=0, banana=1, mango=2}`

---

### 2.2 List → Map with duplicate-key merge

```java
List<String> list = List.of("a", "b", "a", "c", "b");
Map<String, Long> count = list.stream()
        .collect(Collectors.toMap(Function.identity(), v -> 1L, Long::sum));
```

**Output:** `{a=2, b=2, c=1}`

---

### 2.3 Map → List (keys, values, entries, keys sorted by value)

```java
Map<String, Integer> map = new HashMap<>(Map.of("apple", 30, "banana", 10, "mango", 20));
List<String> keys = new ArrayList<>(map.keySet());
List<Integer> values = new ArrayList<>(map.values());
List<String> keysByValue = map.entrySet().stream()
        .sorted(Map.Entry.comparingByValue())
        .map(Map.Entry::getKey)
        .collect(Collectors.toList());
```

**Output:** `keys = [apple, banana, mango]` (order may vary), `values = [30, 10, 20]`, `keysByValue = [banana, mango, apple]`

---

### 2.4 flatMap: list of lists → single list; string → words/chars

```java
List<List<Integer>> lists = List.of(List.of(1, 2), List.of(3, 4), List.of(5));
List<Integer> flat = lists.stream().flatMap(List::stream).collect(Collectors.toList());

String sentence = "hello world";
List<String> words = Arrays.stream(sentence.split("\\s+")).collect(Collectors.toList());
List<String> chars = sentence.chars()
        .mapToObj(c -> String.valueOf((char) c))
        .collect(Collectors.toList());
```

**Output:** `flat = [1, 2, 3, 4, 5]`, `words = [hello, world]`, `chars = [h, e, l, l, o,  , w, o, r, l, d]`

---

## 3. General interview examples (with output)

### 3.1 Count frequency (list and string)

```java
List<String> list = List.of("a", "b", "a", "c", "b", "a");
Map<String, Long> freqList = list.stream()
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
// {a=3, b=2, c=1}

String s = "hello";
Map<Character, Long> freqStr = s.chars()
        .mapToObj(c -> (char) c)
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
// {h=1, e=1, l=2, o=1}
```

**Output:** `freqList = {a=3, b=2, c=1}`, `freqStr = {h=1, e=1, l=2, o=1}`

---

### 3.2 First non-repeated character

```java
List<String> list = List.of("a", "b", "a", "c", "b");
Optional<String> first = list.stream()
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
        .entrySet().stream()
        .filter(e -> e.getValue() == 1)
        .map(Map.Entry::getKey)
        .findFirst();
```

**Output:** `Optional[c]`

---

### 3.3 Sort by frequency then by value

```java
List<String> list = List.of("a", "b", "a", "c", "b", "a");
Map<String, Long> freq = list.stream()
        .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
List<String> sorted = list.stream()
        .distinct()
        .sorted(Comparator.comparing(freq::get).reversed().thenComparing(Function.identity()))
        .collect(Collectors.toList());
```

**Output:** `[a, b, c]` (a=3, b=2, c=1)

---

### 3.4 Two lists → Map

```java
List<String> keys = List.of("a", "b", "c");
List<Integer> values = List.of(1, 2, 3);
Map<String, Integer> map = IntStream.range(0, keys.size())
        .boxed()
        .collect(Collectors.toMap(keys::get, values::get));
```

**Output:** `{a=1, b=2, c=3}`

---

### 3.5 Chunk list into sublists of size n

```java
List<Integer> list = List.of(1, 2, 3, 4, 5, 6);
int chunkSize = 2;
List<List<Integer>> chunks = IntStream.range(0, (list.size() + chunkSize - 1) / chunkSize)
        .mapToObj(i -> list.subList(i * chunkSize, Math.min((i + 1) * chunkSize, list.size())))
        .collect(Collectors.toList());
```

**Output:** `[[1, 2], [3, 4], [5, 6]]`

---

### 3.6 Remove duplicates preserving order

```java
List<String> list = List.of("a", "b", "a", "c", "b");
List<String> distinct = list.stream().distinct().collect(Collectors.toList());
```

**Output:** `[a, b, c]`

---

### 3.7 Second largest / nth element

```java
List<Integer> list = List.of(5, 2, 8, 1, 9);
Optional<Integer> secondLargest = list.stream()
        .sorted(Comparator.reverseOrder())
        .skip(1)
        .findFirst();
```

**Output:** `Optional[8]`

---

### 3.8 Partition by predicate (evens/odds)

```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
Map<Boolean, List<Integer>> partition = list.stream()
        .collect(Collectors.partitioningBy(n -> n % 2 == 0));
List<Integer> evens = partition.get(true);   // [2, 4]
List<Integer> odds = partition.get(false);   // [1, 3, 5]
```

**Output:** `evens = [2, 4]`, `odds = [1, 3, 5]`

---

### 3.9 Group anagrams

```java
List<String> words = List.of("eat", "tea", "tan", "ate", "nat", "bat");
Map<String, List<String>> anagrams = words.stream()
        .collect(Collectors.groupingBy(word -> {
            char[] chars = word.toCharArray();
            Arrays.sort(chars);
            return new String(chars);
        }));
```

**Output:** `{aet=[eat, tea, ate], ant=[tan, nat], abt=[bat]}`

---

### 3.10 Two Sum (indices)

```java
int[] nums = {2, 7, 11, 15};
int target = 9;
Map<Integer, Integer> map = new HashMap<>();
int[] result = {-1, -1};
for (int i = 0; i < nums.length; i++) {
    int complement = target - nums[i];
    if (map.containsKey(complement)) {
        result[0] = map.get(complement);
        result[1] = i;
        break;
    }
    map.put(nums[i], i);
}
// result = [0, 1]
```

**Output:** `result = [0, 1]` (indices of 2 and 7)

---

### 3.11 Merge two maps (sum values for same key)

```java
Map<String, Integer> map1 = new HashMap<>(Map.of("a", 1, "b", 2));
Map<String, Integer> map2 = new HashMap<>(Map.of("b", 3, "c", 4));
Map<String, Integer> merged = Stream.concat(map1.entrySet().stream(), map2.entrySet().stream())
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, Integer::sum));
```

**Output:** `{a=1, b=5, c=4}`

---

## 4. String operations (with output)

### 4.1 Search: contains, indexOf, lastIndexOf, stream findFirst

```java
String text = "hello world";
boolean has = text.contains("world");           // true
int first = text.indexOf("o");                  // 4
int last = text.lastIndexOf("o");               // 7

List<String> words = Arrays.asList("apple", "banana", "apricot");
Optional<String> firstStartsWithA = words.stream()
        .filter(w -> w.startsWith("a"))
        .findFirst();
```

**Output:** `has = true`, `first = 4`, `last = 7`, `firstStartsWithA = Optional[apple]`

---

### 4.2 Replace: replace, replaceAll, replaceFirst

```java
String s = "hello world";
String r1 = s.replace("l", "L");           // "heLLo worLd"
String r2 = s.replaceAll("l+", "L");       // "heLo worLd"
String r3 = s.replaceFirst("l+", "L");     // "heLo world"
```

**Output:** `r1 = "heLLo worLd"`, `r2 = "heLo worLd"`, `r3 = "heLo world"`

---

### 4.3 Word reverse (reverse each word in sentence)

```java
String sentence = "hello world";
String reversed = Arrays.stream(sentence.split("\\s+"))
        .map(word -> new StringBuilder(word).reverse().toString())
        .collect(Collectors.joining(" "));
```

**Output:** `"olleh dlrow"`

---

### 4.4 Find word: first/last occurrence, all indices

```java
String text = "the cat and the dog";
String word = "the";
int firstIdx = text.indexOf(word);                    // 0
int lastIdx = text.lastIndexOf(word);                 // 12

List<Integer> allIndices = new ArrayList<>();
int from = 0;
while ((from = text.indexOf(word, from)) != -1) {
    allIndices.add(from);
    from += word.length();
}
// allIndices = [0, 12]
```

**Output:** `firstIdx = 0`, `lastIdx = 12`, `allIndices = [0, 12]`

---

### 4.5 Palindrome: check if string is palindrome

```java
String s = "racecar";
boolean isPalindrome = s.equals(new StringBuilder(s).reverse().toString());
// true

// Using two pointers
boolean isPal = true;
for (int i = 0, j = s.length() - 1; i < j; i++, j--) {
    if (s.charAt(i) != s.charAt(j)) {
        isPal = false;
        break;
    }
}
// isPal = true
```

**Output:** `isPalindrome = true`, `isPal = true`

---

### 4.6 Palindrome: list palindromic substrings (short example)

```java
String s = "aba";
List<String> palindromes = new ArrayList<>();
for (int i = 0; i < s.length(); i++) {
    for (int j = i + 1; j <= s.length(); j++) {
        String sub = s.substring(i, j);
        if (sub.equals(new StringBuilder(sub).reverse().toString())) {
            palindromes.add(sub);
        }
    }
}
// ["a", "b", "a", "aba"]
```

**Output:** `["a", "b", "a", "aba"]`

---

### 4.7 Permutation: check if two strings are permutations

```java
String a = "listen";
String b = "silent";
boolean arePermutations = a.length() == b.length() &&
        a.chars().sorted().boxed().collect(Collectors.toList())
                .equals(b.chars().sorted().boxed().collect(Collectors.toList()));
```

**Output:** `arePermutations = true`

---

### 4.8 Permutation: generate all permutations of a string

```java
public static List<String> permutations(String s) {
    if (s.length() <= 1) return Collections.singletonList(s);
    List<String> result = new ArrayList<>();
    for (int i = 0; i < s.length(); i++) {
        String rest = s.substring(0, i) + s.substring(i + 1);
        for (String perm : permutations(rest)) {
            result.add(s.charAt(i) + perm);
        }
    }
    return result;
}
// permutations("ab") -> [ab, ba]
```

**Output:** `permutations("ab") = [ab, ba]`

---

## 5. Quick reference table

| Problem type | Main Stream / API |
|--------------|-------------------|
| List → Map (index) | `IntStream.range().boxed().collect(Collectors.toMap(list::get, i -> i))` |
| List → Map (duplicate merge) | `Collectors.toMap(..., v -> 1L, Long::sum)` |
| Map → List (keys sorted by value) | `entrySet().stream().sorted(comparingByValue()).map(getKey).collect(Collectors.toList())` |
| flatMap (nested lists) | `list.stream().flatMap(List::stream)` |
| Count frequency | `Collectors.groupingBy(Function.identity(), Collectors.counting())` |
| Partition | `Collectors.partitioningBy(predicate)` |
| Group anagrams | `groupingBy(word -> sortedChars(word))` |
| Word reverse in sentence | `Arrays.stream(split).map(sb::reverse).join(" ")` |
| Palindrome check | `s.equals(new StringBuilder(s).reverse().toString())` |
| Two strings permutations | Compare sorted char lists |
| Permutations of string | Recursion: fix one char, permute rest, prepend |

---

All examples use **Java 8** syntax (`Collectors.toList()`, `Function.identity()`, etc.) and include explicit output.
