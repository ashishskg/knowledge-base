JpaRepository vs CrudRepository

Definition
- CrudRepository: basic CRUD operations (save, findById, delete, count).
- JpaRepository: extends CrudRepository and adds JPA-specific features.

Key Differences
- JpaRepository adds paging and sorting (via PagingAndSortingRepository).
- JpaRepository adds batch operations like saveAll and flush.
- JpaRepository provides methods like findAll(Pageable) and findAll(Sort).
- CrudRepository is more lightweight and generic.

When to Use
- Use CrudRepository for simple CRUD in non-JPA or minimal JPA use.
- Use JpaRepository for full JPA features, pagination, sorting, and performance tuning.

Example
```
public interface UserCrudRepo extends CrudRepository<User, Long> {}

public interface UserJpaRepo extends JpaRepository<User, Long> {}
```

JpaRepository with Paging Example
```
public interface UserJpaRepo extends JpaRepository<User, Long> {
  Page<User> findByActiveTrue(Pageable pageable);
}

// Usage
Page<User> page = userJpaRepo.findByActiveTrue(PageRequest.of(0, 10, Sort.by("name")));
```

CrudRepository with Custom Finder and @Query Example
```
public interface UserCrudRepo extends CrudRepository<User, Long> {
  List<User> findByEmailContainingIgnoreCase(String keyword);

  @Query("select u from User u where u.status = :status")
  List<User> findByStatus(@Param("status") String status);
}
```
