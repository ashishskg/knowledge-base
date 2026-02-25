# Spring Boot CRUD: Service, Controller, Repository — Unit & Integration Tests

A complete example of a Spring Boot 3.x CRUD application (Java 21) with **unit tests** for Service, Controller, and Repository, plus **integration tests** that run the full stack or slices.

---

## Table of Contents

- [1. Project setup and dependencies](#1-project-setup-and-dependencies)
  - [Maven (pom.xml) — relevant parts](#maven-pom-xml-relevant-parts)
  - [application-test.yml (optional, for integration tests)](#application-test-yml-optional-for-integration-tests)
- [2. Application structure](#2-application-structure)
- [3. Testing annotations reference](#3-testing-annotations-reference)
- [4. Entity](#4-entity)
- [5. Repository](#5-repository)
- [6. Service](#6-service)
- [7. Controller (REST API)](#7-controller-rest-api)
- [8. Unit tests](#8-unit-tests)
  - [8.1 Unit tests: ProductService](#8-1-unit-tests-productservice)
  - [8.2 Unit tests: ProductController](#8-2-unit-tests-productcontroller)
  - [8.3 Unit tests: ProductRepository](#8-3-unit-tests-productrepository)
- [9. Integration tests](#9-integration-tests)
  - [9.1 Repository integration: @DataJpaTest](#9-1-repository-integration-datajpatest)
  - [9.2 Full API integration: @SpringBootTest + MockMvc](#9-2-full-api-integration-springboottest-mockmvc)
  - [9.3 Full API integration: @SpringBootTest + TestRestTemplate](#9-3-full-api-integration-springboottest-testresttemplate)
- [10. Test layout summary](#10-test-layout-summary)
- [11. Running tests](#11-running-tests)
- [12. Quick reference](#12-quick-reference)


---




## 1. Project setup and dependencies

### Maven (pom.xml) — relevant parts

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

`spring-boot-starter-test` brings JUnit 5, Mockito, AssertJ, and MockMvc.

### application-test.yml (optional, for integration tests)

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
```

---

## 2. Application structure

```
src/main/java/com/example/demo/
├── entity/
│   └── Product.java
├── repository/
│   └── ProductRepository.java
├── service/
│   └── ProductService.java
├── controller/
│   └── ProductController.java
└── DemoApplication.java
```

---

## 3. Testing annotations reference

Quick reference for the annotations used in this guide.

| Annotation | Package | Purpose |
|------------|----------|---------|
| **@ExtendWith(MockitoExtension.class)** | `org.junit.jupiter.api.extension` / `org.mockito.junit.jupiter` | Enables Mockito in JUnit 5: initializes `@Mock` and `@InjectMocks` fields and runs Mockito's validation. Use on **unit tests** that use mocks (e.g. service tests). |
| **@Mock** | `org.mockito` | Creates a **mock** (fake) instance of the annotated field type. Default behaviour: methods return `null`/`0`/`false` unless stubbed with `when(...).thenReturn(...)`. Use for dependencies you want to isolate (e.g. repository in service tests). |
| **@InjectMocks** | `org.mockito` | Creates an instance of the **class under test** and injects all `@Mock` (and `@Spy`) fields into it (via constructor or setter). Use on the service/component you are testing. |
| **@MockBean** | `org.springframework.boot.test.mock.mockito` | Like `@Mock`, but for **Spring context** tests: registers the mock as a bean so the context injects it. Use in `@WebMvcTest`, `@SpringBootTest`, etc., when you want to replace a real bean with a mock. |
| **@BeforeEach** | `org.junit.jupiter.api` | Method runs **before each** `@Test` in the class. Use for common setup (e.g. creating a fresh instance or resetting data). |
| **@Nested** | `org.junit.jupiter.api` | Marks an **inner class** that contains tests. Nested classes get their own `@BeforeEach` lifecycle. Use to group tests by feature or method (e.g. "findAll", "create") and keep names readable. |
| **@DisplayName** | `org.junit.jupiter.api` | Human-readable **label** for the test class or method in reports and IDEs. Use to describe the scenario (e.g. "when not exists returns 404") instead of relying only on the method name. |
| **@Test** | `org.junit.jupiter.api` | Marks a method as a **test**. JUnit runs each `@Test` method; failures are reported per method. |
| **@WebMvcTest(Controller.class)** | `org.springframework.boot.test.autoconfigure.web.servlet` | **Slice test**: loads only the web layer and the specified controller(s). No full context, no real service/repository. Use for **controller unit tests** with MockMvc and `@MockBean` for the service. |
| **@DataJpaTest** | `org.springframework.boot.test.autoconfigure.orm.jpa` | **Slice test**: loads only JPA and repositories, with an in-memory DB. Use to test repository interfaces (save, find, delete) without the rest of the app. |
| **@SpringBootTest** | `org.springframework.boot.test.context` | Starts the **full application context** (or with `webEnvironment` only the parts you need). Use for **integration tests** that need real beans and optionally a real HTTP server. |
| **@AutoConfigureMockMvc** | `org.springframework.boot.test.autoconfigure.web.servlet` | Configures **MockMvc** in a `@SpringBootTest` so you can perform HTTP requests without starting a real server. Use with `@SpringBootTest` for full-stack API tests. |
| **@ActiveProfiles("test")** | `org.springframework.test.context` | Activates the **Spring profile** (e.g. `test`) for the test. Use to load `application-test.yml` so tests use an in-memory DB or test-specific config. |
| **@Tag("integration")** | `org.junit.jupiter.api` | **Tags** the test (e.g. `"integration"`) so you can run a subset: `mvn test -Dgroups=integration`. Use to separate slow or environment-dependent tests. |
| **@Autowired** | `org.springframework.beans.factory.annotation` | In tests: injects a bean from the test context (e.g. `MockMvc`, `ObjectMapper`, `ProductRepository`). Use in `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest`. |
| **@LocalServerPort** | `org.springframework.boot.test.web.server` | In `@SpringBootTest(webEnvironment = RANDOM_PORT)`: injects the port number the server is listening on. Use with `TestRestTemplate` to build the base URL. |

---

## 4. Entity

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    public Product() {}

    public Product(String name, String description, Double price) {
        this.name = name;
        this.description = description;
        this.price = price;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(id, product.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
```

---

## 5. Repository

```java
package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);
}
```

---

## 6. Service

```java
package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Product> findByNameContaining(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    @Transactional
    public Product create(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (product.getPrice() == null || product.getPrice() < 0) {
            throw new IllegalArgumentException("Price must be non-negative");
        }
        return productRepository.save(product);
    }

    @Transactional
    public Optional<Product> update(Long id, Product updates) {
        return productRepository.findById(id)
                .map(existing -> {
                    if (updates.getName() != null && !updates.getName().isBlank()) {
                        existing.setName(updates.getName());
                    }
                    if (updates.getDescription() != null) {
                        existing.setDescription(updates.getDescription());
                    }
                    if (updates.getPrice() != null && updates.getPrice() >= 0) {
                        existing.setPrice(updates.getPrice());
                    }
                    return productRepository.save(existing);
                });
    }

    @Transactional
    public boolean deleteById(Long id) {
        if (!productRepository.existsById(id)) {
            return false;
        }
        productRepository.deleteById(id);
        return true;
    }
}
```

---

## 7. Controller (REST API)

```java
package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getAll(@RequestParam(required = false) String name) {
        if (name != null && !name.isBlank()) {
            return productService.findByNameContaining(name);
        }
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        try {
            Product created = productService.create(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return productService.update(id, product)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return productService.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}
```

---

## 8. Unit tests

Unit tests use **mocks** and do **not** start the Spring context (or use a minimal slice). They run fast and isolate a single class.

---

### 8.1 Unit tests: ProductService

Mock `ProductRepository`; assert service logic (return values, exceptions, and that repository methods were called as expected).

```java
package com.example.demo.service;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Enables Mockito for JUnit 5: initializes @Mock and @InjectMocks, runs validation after each test.
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    // Fake ProductRepository; no real DB. Stub with when(...).thenReturn(...), verify with verify(...).
    @Mock
    private ProductRepository productRepository;

    // Real ProductService with the mock repository injected (via constructor).
    @InjectMocks
    private ProductService productService;

    private Product product;

    // Runs before every @Test in this class. Use for common setup.
    @BeforeEach
    void setUp() {
        product = new Product("Laptop", "Gaming laptop", 999.99);
        product.setId(1L);
    }

    // Groups tests for findAll; shows "findAll" in reports. Nested class has its own lifecycle.
    @Nested
    @DisplayName("findAll")
    class FindAll {
        @Test
        void returnsAllProducts() {
            when(productRepository.findAll()).thenReturn(List.of(product));

            List<Product> result = productService.findAll();

            assertThat(result).hasSize(1).first().extracting(Product::getName).isEqualTo("Laptop");
            verify(productRepository).findAll();
        }
    }

    @Nested
    @DisplayName("findById")
    class FindById {  // display name used in IDE and test reports
        @Test
        void whenExists_returnsProduct() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));

            Optional<Product> result = productService.findById(1L);

            assertThat(result).isPresent().get().extracting(Product::getId).isEqualTo(1L);
            verify(productRepository).findById(1L);
        }

        @Test
        void whenNotExists_returnsEmpty() {
            when(productRepository.findById(999L)).thenReturn(Optional.empty());

            Optional<Product> result = productService.findById(999L);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("create")
    class Create {
        @Test
        void validProduct_savesAndReturns() {
            Product toSave = new Product("Mouse", "Wireless", 29.99);
            when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
                Product p = inv.getArgument(0);
                p.setId(2L);
                return p;
            });

            Product result = productService.create(toSave);

            assertThat(result.getId()).isEqualTo(2L);
            assertThat(result.getName()).isEqualTo("Mouse");
            ArgumentCaptor<Product> captor = ArgumentCaptor.forClass(Product.class);
            verify(productRepository).save(captor.capture());
            assertThat(captor.getValue().getPrice()).isEqualTo(29.99);
        }

        @Test
        void blankName_throwsIllegalArgumentException() {
            Product invalid = new Product("  ", "Desc", 10.0);

            assertThatThrownBy(() -> productService.create(invalid))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("name");
            verify(productRepository, never()).save(any());
        }

        @Test
        void negativePrice_throwsIllegalArgumentException() {
            Product invalid = new Product("Valid", "Desc", -1.0);

            assertThatThrownBy(() -> productService.create(invalid))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Price");
            verify(productRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("update")
    class Update {
        @Test
        void whenExists_updatesAndReturns() {
            when(productRepository.findById(1L)).thenReturn(Optional.of(product));
            when(productRepository.save(any(Product.class))).thenReturn(product);
            Product updates = new Product();
            updates.setName("Laptop Pro");
            updates.setPrice(1299.99);

            Optional<Product> result = productService.update(1L, updates);

            assertThat(result).isPresent();
            assertThat(product.getName()).isEqualTo("Laptop Pro");
            assertThat(product.getPrice()).isEqualTo(1299.99);
            verify(productRepository).save(product);
        }

        @Test
        void whenNotExists_returnsEmpty() {
            when(productRepository.findById(999L)).thenReturn(Optional.empty());
            Product updates = new Product();
            updates.setName("X");

            Optional<Product> result = productService.update(999L, updates);

            assertThat(result).isEmpty();
            verify(productRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("deleteById")
    class DeleteById {
        @Test
        void whenExists_deletesAndReturnsTrue() {
            when(productRepository.existsById(1L)).thenReturn(true);
            doNothing().when(productRepository).deleteById(1L);

            boolean result = productService.deleteById(1L);

            assertThat(result).isTrue();
            verify(productRepository).deleteById(1L);
        }

        @Test
        void whenNotExists_returnsFalse() {
            when(productRepository.existsById(999L)).thenReturn(false);

            boolean result = productService.deleteById(999L);

            assertThat(result).isFalse();
            verify(productRepository, never()).deleteById(any());
        }
    }
}
```

---

### 8.2 Unit tests: ProductController

Use **MockMvc** with **mocked** `ProductService` (no Spring context or use `@WebMvcTest`). Verify HTTP status, response body, and that the service was called correctly.

```java
package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.example.demo.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Loads only web layer + ProductController; no full context, no real service/repository. Fast controller tests.
@WebMvcTest(ProductController.class)
class ProductControllerTest {

    // Injected by Spring test context: use to perform GET/POST/PUT/DELETE and assert status/body.
    @Autowired
    private MockMvc mockMvc;

    // For serializing request bodies to JSON (e.g. in POST/PUT).
    @Autowired
    private ObjectMapper objectMapper;

    // Mock bean replacing real ProductService in the context; controller uses this fake.
    @MockBean
    private ProductService productService;

    private final Product product = createProduct(1L, "Laptop", "Gaming", 999.99);

    private static Product createProduct(Long id, String name, String desc, double price) {
        var p = new Product(name, desc, price);
        p.setId(id);
        return p;
    }

    @Nested
    @DisplayName("GET /api/products")
    class GetAll {
        @Test
        void returnsListOfProducts() throws Exception {
            when(productService.findAll()).thenReturn(List.of(product));

            mockMvc.perform(get("/api/products"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].name").value("Laptop"));

            verify(productService).findAll();
        }

        @Test
        void withNameParam_callsFindByNameContaining() throws Exception {
            when(productService.findByNameContaining("lap")).thenReturn(List.of(product));

            mockMvc.perform(get("/api/products").param("name", "lap"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));

            verify(productService).findByNameContaining("lap");
        }
    }

    @Nested
    @DisplayName("GET /api/products/{id}")
    class GetById {
        @Test
        void whenExists_returns200AndBody() throws Exception {
            when(productService.findById(1L)).thenReturn(Optional.of(product));

            mockMvc.perform(get("/api/products/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1))
                    .andExpect(jsonPath("$.name").value("Laptop"));

            verify(productService).findById(1L);
        }

        @Test
        void whenNotExists_returns404() throws Exception {
            when(productService.findById(999L)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/products/999"))
                    .andExpect(status().isNotFound());

            verify(productService).findById(999L);
        }
    }

    @Nested
    @DisplayName("POST /api/products")
    class Create {
        @Test
        void validBody_returns201AndProduct() throws Exception {
            Product toCreate = new Product("Mouse", "Wireless", 29.99);
            Product created = createProduct(2L, "Mouse", "Wireless", 29.99);
            when(productService.create(any(Product.class))).thenReturn(created);

            mockMvc.perform(post("/api/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(toCreate)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(2))
                    .andExpect(jsonPath("$.name").value("Mouse"));

            verify(productService).create(any(Product.class));
        }

        @Test
        void invalidBody_returns400() throws Exception {
            when(productService.create(any(Product.class)))
                    .thenThrow(new IllegalArgumentException("Product name is required"));

            mockMvc.perform(post("/api/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"name\":\"\",\"price\":10}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/products/{id}")
    class Update {
        @Test
        void whenExists_returns200AndBody() throws Exception {
            Product updates = new Product();
            updates.setName("Laptop Pro");
            when(productService.update(eq(1L), any(Product.class))).thenReturn(Optional.of(product));

            mockMvc.perform(put("/api/products/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updates)))
                    .andExpect(status().isOk());

            verify(productService).update(eq(1L), any(Product.class));
        }

        @Test
        void whenNotExists_returns404() throws Exception {
            when(productService.update(eq(999L), any(Product.class))).thenReturn(Optional.empty());

            mockMvc.perform(put("/api/products/999")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"name\":\"X\"}"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/products/{id}")
    class Delete {
        @Test
        void whenExists_returns204() throws Exception {
            when(productService.deleteById(1L)).thenReturn(true);

            mockMvc.perform(delete("/api/products/1"))
                    .andExpect(status().isNoContent());

            verify(productService).deleteById(1L);
        }

        @Test
        void whenNotExists_returns404() throws Exception {
            when(productService.deleteById(999L)).thenReturn(false);

            mockMvc.perform(delete("/api/products/999"))
                    .andExpect(status().isNotFound());
        }
    }
}
```

---

### 8.3 Unit tests: ProductRepository

A Spring Data JPA repository is an **interface**; the implementation is generated at runtime. You cannot unit test it with mocks (there is no logic to mock). The standard approach is to test the repository in isolation with **`@DataJpaTest`**: it starts only the JPA slice and an in-memory database (e.g. H2), so we exercise the real repository implementation without the full application. Many teams call this the “repository unit test” even though it is technically a narrow integration test.

The test class below covers all repository methods: **save**, **findById**, **findAll**, **findByNameContainingIgnoreCase**, **existsById**, and **deleteById**.

```java
package com.example.demo.repository;

import com.example.demo.entity.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

// JPA slice only: in-memory DB + repositories. No web layer, no full app. Use to test repository methods.
@DataJpaTest
class ProductRepositoryTest {

    // Real repository implementation (Spring Data) against the test DB.
    @Autowired
    private ProductRepository productRepository;

    @Nested
    @DisplayName("save and findById")
    class SaveAndFindById {
        @Test
        void save_persistsEntityAndReturnsWithId() {
            Product product = new Product("Keyboard", "Mechanical", 89.99);
            Product saved = productRepository.save(product);

            assertThat(saved.getId()).isNotNull();
            assertThat(saved.getName()).isEqualTo("Keyboard");
        }

        @Test
        void findById_whenExists_returnsProduct() {
            Product saved = productRepository.save(new Product("Laptop", "Gaming", 999.99));

            Optional<Product> found = productRepository.findById(saved.getId());

            assertThat(found).isPresent();
            assertThat(found.get().getName()).isEqualTo("Laptop");
            assertThat(found.get().getPrice()).isEqualTo(999.99);
        }

        @Test
        void findById_whenNotExists_returnsEmpty() {
            Optional<Product> found = productRepository.findById(99999L);
            assertThat(found).isEmpty();
        }
    }

    @Nested
    @DisplayName("findAll")
    class FindAll {
        @Test
        void findAll_returnsAllSavedProducts() {
            productRepository.save(new Product("A", "Desc A", 1.0));
            productRepository.save(new Product("B", "Desc B", 2.0));

            List<Product> all = productRepository.findAll();

            assertThat(all).hasSize(2);
            assertThat(all).extracting(Product::getName).containsExactlyInAnyOrder("A", "B");
        }

        @Test
        void findAll_whenEmpty_returnsEmptyList() {
            List<Product> all = productRepository.findAll();
            assertThat(all).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByNameContainingIgnoreCase")
    class FindByNameContaining {
        @Test
        void returnsMatchingProducts_ignoringCase() {
            productRepository.save(new Product("Laptop", "Gaming", 999.99));
            productRepository.save(new Product("LAPTOP Bag", "Bag", 49.99));
            productRepository.save(new Product("Mouse", "Wireless", 29.99));

            List<Product> found = productRepository.findByNameContainingIgnoreCase("lap");

            assertThat(found).hasSize(2);
            assertThat(found).extracting(Product::getName)
                    .containsExactlyInAnyOrder("Laptop", "LAPTOP Bag");
        }

        @Test
        void whenNoMatch_returnsEmptyList() {
            productRepository.save(new Product("Laptop", "Gaming", 999.99));

            List<Product> found = productRepository.findByNameContainingIgnoreCase("xyz");

            assertThat(found).isEmpty();
        }
    }

    @Nested
    @DisplayName("existsById")
    class ExistsById {
        @Test
        void whenExists_returnsTrue() {
            Product saved = productRepository.save(new Product("X", "Y", 1.0));
            assertThat(productRepository.existsById(saved.getId())).isTrue();
        }

        @Test
        void whenNotExists_returnsFalse() {
            assertThat(productRepository.existsById(99999L)).isFalse();
        }
    }

    @Nested
    @DisplayName("deleteById")
    class DeleteById {
        @Test
        void whenExists_removesEntity() {
            Product product = productRepository.save(new Product("ToDelete", "Desc", 10.0));
            Long id = product.getId();

            productRepository.deleteById(id);

            assertThat(productRepository.findById(id)).isEmpty();
            assertThat(productRepository.existsById(id)).isFalse();
        }

        @Test
        void whenNotExists_doesNotThrow() {
            productRepository.deleteById(99999L);
            // no exception; deleteById is a no-op if entity does not exist
        }
    }
}
```

**Note:** `@DataJpaTest` uses an embedded or configured test database (e.g. H2 with `spring.datasource.url=jdbc:h2:mem:...`). Add `@AutoConfigureTestDatabase(replace = Replace.NONE)` if you want to use a real test DB instead of the default in-memory one.

---

## 9. Integration tests

Integration tests start (part of) the Spring context and use a real or in-memory database. They verify that layers work together.

---

### 9.1 Repository integration: @DataJpaTest

The **repository** is tested with a real JPA context and an in-memory DB using `@DataJpaTest`. The full test class is in **section 8.3** (ProductRepositoryTest). That same test serves as the repository “unit” test and as the repository integration slice: it loads only JPA and the repository, no web layer or full application context.

---

### 9.2 Full API integration: @SpringBootTest + MockMvc

Starts the **full application context** (including Controller, Service, Repository) and uses an in-memory H2 database. Tests the HTTP API end-to-end.

```java
package com.example.demo.controller;

import com.example.demo.entity.Product;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Full application context (all beans). Use for end-to-end API tests.
@SpringBootTest
// Enables MockMvc so we can call endpoints without starting a real HTTP server.
@AutoConfigureMockMvc
// Loads application-test.yml (e.g. in-memory H2 DB) for this test.
@ActiveProfiles("test")
class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("CRUD flow: create -> get -> update -> get -> delete -> get 404")  // human-readable label in reports
    void fullCrudFlow() throws Exception {
        // CREATE
        Product create = new Product("Integration Product", "Description", 100.0);
        ResultActions createResult = mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Integration Product"))
                .andExpect(jsonPath("$.price").value(100.0));

        String json = createResult.andReturn().getResponse().getContentAsString();
        long id = objectMapper.readTree(json).get("id").asLong();

        // GET by id
        mockMvc.perform(get("/api/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Integration Product"));

        // UPDATE
        Product update = new Product();
        update.setName("Updated Name");
        update.setPrice(200.0);
        mockMvc.perform(put("/api/products/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.price").value(200.0));

        // GET list (optional: check it appears)
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // DELETE
        mockMvc.perform(delete("/api/products/{id}", id))
                .andExpect(status().isNoContent());

        // GET by id -> 404
        mockMvc.perform(get("/api/products/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST with invalid body returns 400")
    void create_invalid_returns400() throws Exception {
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"price\":-1}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET non-existent id returns 404")
    void getById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/products/99999"))
                .andExpect(status().isNotFound());
    }
}
```

**Note:** `@ActiveProfiles("test")` loads `application-test.yml` so the test uses an in-memory H2 DB. Ensure the profile exists and JPA is set to create/drop schema if needed.

---

### 9.3 Full API integration: @SpringBootTest + TestRestTemplate

Alternative to MockMvc: real HTTP calls to a randomly assigned port. Useful when you want to test the app as a real server (e.g. security filters, full stack).

```java
package com.example.demo.controller;

import com.example.demo.entity.Product;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// Full context + real server on a random port (avoids conflicts). Use TestRestTemplate for real HTTP calls.
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ProductControllerRestTemplateIntegrationTest {

    // Injected with the actual port the server is listening on.
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl() {
        return "http://localhost:" + port + "/api/products";
    }

    @Test
    @DisplayName("GET /api/products returns 200 and list")
    void getAll_returns200AndList() {
        ResponseEntity<List<Product>> response = restTemplate.exchange(
                baseUrl(),
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Product>>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    @DisplayName("POST valid product returns 201 with body")
    void create_valid_returns201() {
        Product product = new Product("RestTemplate Product", "Desc", 50.0);
        ResponseEntity<Product> response = restTemplate.postForEntity(baseUrl(), product, Product.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("RestTemplate Product");
    }

    @Test
    @DisplayName("GET by non-existent id returns 404")
    void getById_notFound_returns404() {
        ResponseEntity<Product> response = restTemplate.getForEntity(baseUrl() + "/99999", Product.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
```

**Maven:** for `RANDOM_PORT` you need:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

No extra dependency; `spring-boot-starter-test` includes it. For `TestRestTemplate` with `RANDOM_PORT`, ensure you have `spring-boot-starter-web` (you do).

---

## 10. Test layout summary

| Layer       | Unit test                          | Integration test                          |
|------------|-------------------------------------|-------------------------------------------|
| **Service**  | `ProductServiceTest` (mock repo)    | Covered by full API integration           |
| **Controller** | `ProductControllerTest` (@WebMvcTest, mock service) | `ProductControllerIntegrationTest` (MockMvc + real DB), or TestRestTemplate |
| **Repository** | `ProductRepositoryTest` (@DataJpaTest, section 7.3) | Same test: repository integration slice |

---

## 11. Running tests

```bash
# All tests
./mvnw test

# Only unit (exclude *Integration* and *RepositoryTest if you tag them)
./mvnw test -Dtest=*Test

# Only integration (if you use @Tag("integration"))
./mvnw test -Dgroups=integration
```

Optional: tag integration tests and run separately:

```java
@SpringBootTest
@Tag("integration")
class ProductControllerIntegrationTest { ... }
```

```bash
./mvnw test -Dgroups=integration
```

---

## 12. Quick reference

- **Unit tests:** Mock dependencies (`@Mock`, `@MockBean`), no DB, no full context (or `@WebMvcTest` for controller).
- **Repository:** Use `@DataJpaTest` + H2 (or test DB) for integration.
- **Full API:** Use `@SpringBootTest` + `@AutoConfigureMockMvc` + `@ActiveProfiles("test")` for end-to-end HTTP + DB, or `TestRestTemplate` with `RANDOM_PORT`.

All examples use **Java 21** and **Spring Boot 3.x**.
