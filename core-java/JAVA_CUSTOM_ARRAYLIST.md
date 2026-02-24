# How to Create Custom ArrayList — Complete Guide

Guide to creating a custom `ArrayList` implementation from scratch, understanding internal mechanics, and implementing all required methods.

---

## 1. Introduction

A custom `ArrayList` is a resizable array-based implementation of the `List` interface. We'll build it step-by-step, implementing core methods and understanding how Java's `ArrayList` works internally.

**Key concepts:**
- **Dynamic resizing** — grows when capacity is exceeded
- **Array-based storage** — uses an internal array to store elements
- **Index-based access** — O(1) for get/set operations
- **Amortized O(1) add** — adding at the end is O(1) amortized

---

## 2. Basic structure

### 2.1 Class skeleton

```java
import java.util.*;

public class CustomArrayList<E> implements List<E> {
    private static final int DEFAULT_CAPACITY = 10;
    private Object[] elements;  // Use Object[] to support generics
    private int size;           // Current number of elements
    
    public CustomArrayList() {
        this(DEFAULT_CAPACITY);
    }
    
    public CustomArrayList(int initialCapacity) {
        if (initialCapacity < 0) {
            throw new IllegalArgumentException("Capacity cannot be negative");
        }
        this.elements = new Object[initialCapacity];
        this.size = 0;
    }
    
    public CustomArrayList(Collection<? extends E> c) {
        this.elements = c.toArray();
        this.size = elements.length;
    }
}
```

**Explanation:**
- **`Object[] elements`** — internal array (can't use `E[]` due to Java generics erasure)
- **`int size`** — tracks current number of elements (not array length)
- **Constructors** — default (capacity 10), with capacity, and from collection

---

## 3. Core methods implementation

### 3.1 size, isEmpty, clear

```java
@Override
public int size() {
    return size;
}

@Override
public boolean isEmpty() {
    return size == 0;
}

@Override
public void clear() {
    for (int i = 0; i < size; i++) {
        elements[i] = null;  // Help GC
    }
    size = 0;
}
```

**Output examples:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
System.out.println(list.size());      // 0
System.out.println(list.isEmpty());    // true
list.add("a");
System.out.println(list.size());      // 1
list.clear();
System.out.println(list.isEmpty());   // true
```

---

### 3.2 get, set

```java
@Override
@SuppressWarnings("unchecked")
public E get(int index) {
    checkIndex(index);
    return (E) elements[index];
}

@Override
@SuppressWarnings("unchecked")
public E set(int index, E element) {
    checkIndex(index);
    E oldValue = (E) elements[index];
    elements[index] = element;
    return oldValue;
}

private void checkIndex(int index) {
    if (index < 0 || index >= size) {
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
}
```

**Output examples:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("apple");
list.add("banana");
String item = list.get(0);           // "apple"
String old = list.set(1, "mango");  // old = "banana", list = [apple, mango]
```

---

### 3.3 add (append and insert)

```java
@Override
public boolean add(E element) {
    ensureCapacity(size + 1);
    elements[size++] = element;
    return true;
}

@Override
public void add(int index, E element) {
    checkIndexForAdd(index);  // Allows index == size
    ensureCapacity(size + 1);
    System.arraycopy(elements, index, elements, index + 1, size - index);
    elements[index] = element;
    size++;
}

private void checkIndexForAdd(int index) {
    if (index < 0 || index > size) {
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
}
```

**Output examples:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("a");              // [a]
list.add("b");              // [a, b]
list.add(1, "x");           // [a, x, b]
```

---

### 3.4 ensureCapacity (resize when needed)

```java
private void ensureCapacity(int minCapacity) {
    if (minCapacity > elements.length) {
        int newCapacity = Math.max(elements.length * 2, minCapacity);
        elements = Arrays.copyOf(elements, newCapacity);
    }
}
```

**Explanation:**
- **Growth strategy:** Double the capacity when full (e.g., 10 → 20 → 40)
- **`Arrays.copyOf`** — creates a new larger array and copies elements
- **Amortized O(1)** — occasional O(n) resize is amortized over many O(1) adds

**Example:**
```java
CustomArrayList<Integer> list = new CustomArrayList<>(2);
list.add(1);  // capacity = 2
list.add(2);  // capacity = 2
list.add(3);  // capacity = 4 (doubled), elements copied
```

---

### 3.5 remove (by index and by object)

```java
@Override
@SuppressWarnings("unchecked")
public E remove(int index) {
    checkIndex(index);
    E removed = (E) elements[index];
    int numMoved = size - index - 1;
    if (numMoved > 0) {
        System.arraycopy(elements, index + 1, elements, index, numMoved);
    }
    elements[--size] = null;  // Help GC
    return removed;
}

@Override
public boolean remove(Object o) {
    int index = indexOf(o);
    if (index >= 0) {
        remove(index);
        return true;
    }
    return false;
}
```

**Output examples:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("a");
list.add("b");
list.add("c");
String removed = list.remove(1);     // removed = "b", list = [a, c]
boolean removed2 = list.remove("a");  // removed2 = true, list = [c]
```

---

### 3.6 indexOf, lastIndexOf, contains

```java
@Override
public int indexOf(Object o) {
    if (o == null) {
        for (int i = 0; i < size; i++) {
            if (elements[i] == null) {
                return i;
            }
        }
    } else {
        for (int i = 0; i < size; i++) {
            if (o.equals(elements[i])) {
                return i;
            }
        }
    }
    return -1;
}

@Override
public int lastIndexOf(Object o) {
    if (o == null) {
        for (int i = size - 1; i >= 0; i--) {
            if (elements[i] == null) {
                return i;
            }
        }
    } else {
        for (int i = size - 1; i >= 0; i--) {
            if (o.equals(elements[i])) {
                return i;
            }
        }
    }
    return -1;
}

@Override
public boolean contains(Object o) {
    return indexOf(o) >= 0;
}
```

**Output examples:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("a");
list.add("b");
list.add("a");
int first = list.indexOf("a");      // 0
int last = list.lastIndexOf("a");    // 2
boolean has = list.contains("b");    // true
```

---

### 3.7 addAll, removeAll, retainAll

```java
@Override
public boolean addAll(Collection<? extends E> c) {
    return addAll(size, c);
}

@Override
public boolean addAll(int index, Collection<? extends E> c) {
    checkIndexForAdd(index);
    Object[] a = c.toArray();
    int numNew = a.length;
    if (numNew == 0) {
        return false;
    }
    ensureCapacity(size + numNew);
    int numMoved = size - index;
    if (numMoved > 0) {
        System.arraycopy(elements, index, elements, index + numNew, numMoved);
    }
    System.arraycopy(a, 0, elements, index, numNew);
    size += numNew;
    return true;
}

@Override
public boolean removeAll(Collection<?> c) {
    boolean modified = false;
    for (int i = size - 1; i >= 0; i--) {
        if (c.contains(elements[i])) {
            remove(i);
            modified = true;
        }
    }
    return modified;
}

@Override
public boolean retainAll(Collection<?> c) {
    boolean modified = false;
    for (int i = size - 1; i >= 0; i--) {
        if (!c.contains(elements[i])) {
            remove(i);
            modified = true;
        }
    }
    return modified;
}
```

**Output examples:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("a");
list.add("b");
list.addAll(List.of("c", "d"));        // [a, b, c, d]
list.removeAll(List.of("b", "c"));     // [a, d]
list.retainAll(List.of("a", "x"));      // [a]
```

---

### 3.8 containsAll

```java
@Override
public boolean containsAll(Collection<?> c) {
    for (Object o : c) {
        if (!contains(o)) {
            return false;
        }
    }
    return true;
}
```

---

### 3.9 toArray

```java
@Override
public Object[] toArray() {
    return Arrays.copyOf(elements, size);
}

@Override
@SuppressWarnings("unchecked")
public <T> T[] toArray(T[] a) {
    if (a.length < size) {
        return (T[]) Arrays.copyOf(elements, size, a.getClass());
    }
    System.arraycopy(elements, 0, a, 0, size);
    if (a.length > size) {
        a[size] = null;
    }
    return a;
}
```

**Output examples:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("a");
list.add("b");
Object[] arr1 = list.toArray();                    // [a, b]
String[] arr2 = list.toArray(new String[0]);      // [a, b]
```

---

### 3.10 subList

```java
@Override
public List<E> subList(int fromIndex, int toIndex) {
    if (fromIndex < 0 || toIndex > size || fromIndex > toIndex) {
        throw new IndexOutOfBoundsException();
    }
    return new SubList(this, fromIndex, toIndex);
}

// Inner class for subList
private class SubList extends AbstractList<E> {
    private final CustomArrayList<E> parent;
    private final int offset;
    private int size;
    
    SubList(CustomArrayList<E> parent, int fromIndex, int toIndex) {
        this.parent = parent;
        this.offset = fromIndex;
        this.size = toIndex - fromIndex;
    }
    
    @Override
    public E get(int index) {
        checkIndex(index);
        return parent.get(offset + index);
    }
    
    @Override
    public int size() {
        return size;
    }
    
    // Implement other methods similarly...
}
```

---

## 4. Iterator implementation

### 4.1 Basic iterator

```java
@Override
public Iterator<E> iterator() {
    return new Itr();
}

private class Itr implements Iterator<E> {
    int cursor = 0;
    int lastRet = -1;
    
    @Override
    public boolean hasNext() {
        return cursor != size;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public E next() {
        if (cursor >= size) {
            throw new NoSuchElementException();
        }
        lastRet = cursor;
        return (E) elements[cursor++];
    }
    
    @Override
    public void remove() {
        if (lastRet < 0) {
            throw new IllegalStateException();
        }
        CustomArrayList.this.remove(lastRet);
        cursor = lastRet;
        lastRet = -1;
    }
}
```

**Usage:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("a");
list.add("b");
for (String s : list) {
    System.out.println(s);  // a, then b
}
```

---

### 4.2 ListIterator

```java
@Override
public ListIterator<E> listIterator() {
    return new ListItr(0);
}

@Override
public ListIterator<E> listIterator(int index) {
    checkIndexForAdd(index);
    return new ListItr(index);
}

private class ListItr extends Itr implements ListIterator<E> {
    ListItr(int index) {
        cursor = index;
    }
    
    @Override
    public boolean hasPrevious() {
        return cursor != 0;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public E previous() {
        if (cursor == 0) {
            throw new NoSuchElementException();
        }
        cursor--;
        lastRet = cursor;
        return (E) elements[cursor];
    }
    
    @Override
    public int nextIndex() {
        return cursor;
    }
    
    @Override
    public int previousIndex() {
        return cursor - 1;
    }
    
    @Override
    public void set(E e) {
        if (lastRet < 0) {
            throw new IllegalStateException();
        }
        CustomArrayList.this.set(lastRet, e);
    }
    
    @Override
    public void add(E e) {
        int i = cursor;
        CustomArrayList.this.add(i, e);
        cursor = i + 1;
        lastRet = -1;
    }
}
```

---

## 5. Complete implementation example

### 5.1 Full CustomArrayList class

```java
import java.util.*;
import java.util.function.Consumer;

public class CustomArrayList<E> extends AbstractList<E> implements List<E> {
    private static final int DEFAULT_CAPACITY = 10;
    private Object[] elements;
    private int size;
    
    public CustomArrayList() {
        this(DEFAULT_CAPACITY);
    }
    
    public CustomArrayList(int initialCapacity) {
        if (initialCapacity < 0) {
            throw new IllegalArgumentException("Capacity cannot be negative");
        }
        this.elements = new Object[initialCapacity];
        this.size = 0;
    }
    
    public CustomArrayList(Collection<? extends E> c) {
        this.elements = c.toArray();
        this.size = elements.length;
    }
    
    @Override
    public int size() {
        return size;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public E get(int index) {
        checkIndex(index);
        return (E) elements[index];
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public E set(int index, E element) {
        checkIndex(index);
        E oldValue = (E) elements[index];
        elements[index] = element;
        return oldValue;
    }
    
    @Override
    public boolean add(E element) {
        ensureCapacity(size + 1);
        elements[size++] = element;
        return true;
    }
    
    @Override
    public void add(int index, E element) {
        checkIndexForAdd(index);
        ensureCapacity(size + 1);
        System.arraycopy(elements, index, elements, index + 1, size - index);
        elements[index] = element;
        size++;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public E remove(int index) {
        checkIndex(index);
        E removed = (E) elements[index];
        int numMoved = size - index - 1;
        if (numMoved > 0) {
            System.arraycopy(elements, index + 1, elements, index, numMoved);
        }
        elements[--size] = null;
        return removed;
    }
    
    @Override
    public int indexOf(Object o) {
        if (o == null) {
            for (int i = 0; i < size; i++) {
                if (elements[i] == null) {
                    return i;
                }
            }
        } else {
            for (int i = 0; i < size; i++) {
                if (o.equals(elements[i])) {
                    return i;
                }
            }
        }
        return -1;
    }
    
    private void ensureCapacity(int minCapacity) {
        if (minCapacity > elements.length) {
            int newCapacity = Math.max(elements.length * 2, minCapacity);
            elements = Arrays.copyOf(elements, newCapacity);
        }
    }
    
    private void checkIndex(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }
    }
    
    private void checkIndexForAdd(int index) {
        if (index < 0 || index > size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }
    }
}
```

---

## 6. Testing the custom ArrayList

### 6.1 Basic operations test

```java
public class CustomArrayListTest {
    public static void main(String[] args) {
        CustomArrayList<String> list = new CustomArrayList<>();
        
        // Add
        list.add("apple");
        list.add("banana");
        list.add(1, "mango");
        System.out.println(list);  // [apple, mango, banana]
        
        // Get
        System.out.println(list.get(0));  // apple
        
        // Set
        list.set(1, "berry");
        System.out.println(list);  // [apple, berry, banana]
        
        // Remove
        list.remove(0);
        System.out.println(list);  // [berry, banana]
        
        // Size
        System.out.println(list.size());  // 2
    }
}
```

---

## 7. Advanced features

### 7.1 trimToSize (reduce capacity to size)

```java
public void trimToSize() {
    if (size < elements.length) {
        elements = Arrays.copyOf(elements, size);
    }
}
```

**Usage:**
```java
CustomArrayList<String> list = new CustomArrayList<>(100);
list.add("a");
list.trimToSize();  // capacity = 1
```

---

### 7.2 ensureCapacity (public method)

```java
public void ensureCapacity(int minCapacity) {
    if (minCapacity > elements.length) {
        int newCapacity = Math.max(elements.length * 2, minCapacity);
        elements = Arrays.copyOf(elements, newCapacity);
    }
}
```

---

### 7.3 replaceAll (Java 8)

```java
@Override
@SuppressWarnings("unchecked")
public void replaceAll(java.util.function.UnaryOperator<E> operator) {
    Objects.requireNonNull(operator);
    for (int i = 0; i < size; i++) {
        elements[i] = operator.apply((E) elements[i]);
    }
}
```

**Usage:**
```java
CustomArrayList<String> list = new CustomArrayList<>();
list.add("apple");
list.add("banana");
list.replaceAll(String::toUpperCase);
// [APPLE, BANANA]
```

---

### 7.4 sort (Java 8)

```java
@Override
@SuppressWarnings("unchecked")
public void sort(Comparator<? super E> c) {
    Arrays.sort((E[]) elements, 0, size, c);
}
```

**Usage:**
```java
CustomArrayList<Integer> list = new CustomArrayList<>();
list.add(3);
list.add(1);
list.add(2);
list.sort(Comparator.naturalOrder());
// [1, 2, 3]
```

---

## 8. Performance considerations

### 8.1 Time complexity

| Operation | Time Complexity |
|-----------|-----------------|
| `get(int index)` | O(1) |
| `set(int index, E)` | O(1) |
| `add(E)` | O(1) amortized |
| `add(int index, E)` | O(n) |
| `remove(int index)` | O(n) |
| `remove(Object)` | O(n) |
| `indexOf(Object)` | O(n) |
| `contains(Object)` | O(n) |

---

### 8.2 Space complexity

- **O(n)** — stores n elements in an array
- **Amortized growth** — doubles capacity when full, so average space overhead is small

---

## 9. Common pitfalls and solutions

### 9.1 Generic array creation

**Problem:** Can't create `E[]` directly due to type erasure.

**Solution:** Use `Object[]` and cast when retrieving:
```java
private Object[] elements;  // Not E[]

@SuppressWarnings("unchecked")
public E get(int index) {
    return (E) elements[index];
}
```

---

### 9.2 Index bounds checking

**Problem:** Forgetting to check bounds leads to `ArrayIndexOutOfBoundsException`.

**Solution:** Always validate indices:
```java
private void checkIndex(int index) {
    if (index < 0 || index >= size) {
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
    }
}
```

---

### 9.3 Capacity vs size

**Problem:** Confusing array length (capacity) with number of elements (size).

**Solution:** Always track `size` separately:
```java
private Object[] elements;  // capacity = elements.length
private int size;           // actual number of elements
```

---

## 10. Quick reference

| Feature | Implementation |
|---------|----------------|
| **Storage** | `Object[] elements` |
| **Size tracking** | `int size` |
| **Default capacity** | 10 |
| **Growth strategy** | Double when full |
| **Add at end** | `elements[size++] = element` |
| **Insert at index** | `System.arraycopy` to shift elements |
| **Remove** | `System.arraycopy` to shift elements back |
| **Get/Set** | Direct array access `elements[index]` |

---

This guide covers creating a custom `ArrayList` from scratch, implementing core methods, understanding internal mechanics, and handling edge cases. The implementation follows similar patterns to Java's standard `ArrayList`.
