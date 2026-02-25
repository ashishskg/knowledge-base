# JPA mapping annotations (User ↔ Address): `@OneToOne`, `@OneToMany`, `@ManyToOne`, `cascade`, `mappedBy` + SQL examples

This doc explains common JPA relationship annotations using **two entities**: `User` and `Address`.

Assumptions:
- JPA provider: Hibernate (common in Spring Boot)
- DB: MySQL (AWS RDS/Aurora) or Oracle (examples note differences)

---

## Table of Contents

- [1) Key concepts you must know](#1-key-concepts-you-must-know)
  - [1.1 Owning side vs inverse side](#1-1-owning-side-vs-inverse-side)
  - [1.2 `mappedBy`](#1-2-mappedby)
  - [1.3 `cascade`](#1-3-cascade)
  - [1.4 `fetch` (LAZY vs EAGER)](#1-4-fetch-lazy-vs-eager)
  - [1.5 Orphan removal](#1-5-orphan-removal)
- [2) Option A (recommended in most business apps): `User` has **many** `Address` records](#2-option-a-recommended-in-most-business-apps-user-has-many-address-records)
  - [2.1 Mapping: `@OneToMany` + `@ManyToOne`](#2-1-mapping-onetomany-manytoone)
    - [`UserEntity` (inverse side)](#userentity-inverse-side)
    - [`AddressEntity` (owning side)](#addressentity-owning-side)
  - [2.2 What tables are created?](#2-2-what-tables-are-created)
  - [2.3 What SQL queries will be created? (typical Hibernate behavior)](#2-3-what-sql-queries-will-be-created-typical-hibernate-behavior)
    - [Case 1: Persist user + addresses (with `cascade = ALL`)](#case-1-persist-user-addresses-with-cascade-all)
    - [Case 2: Load user only](#case-2-load-user-only)
    - [Case 3: Access lazy addresses](#case-3-access-lazy-addresses)
    - [Case 4: N+1 issue](#case-4-n-1-issue)
    - [Case 5: Remove an address (with `orphanRemoval = true`)](#case-5-remove-an-address-with-orphanremoval-true)
- [3) Option B: `@OneToOne` (User has exactly one Address)](#3-option-b-onetoone-user-has-exactly-one-address)
  - [3.1 Unidirectional `@OneToOne` (owning side has FK)](#3-1-unidirectional-onetoone-owning-side-has-fk)
  - [3.2 Bidirectional `@OneToOne` using `mappedBy`](#3-2-bidirectional-onetoone-using-mappedby)
- [4) Common mapping annotations you’ll see](#4-common-mapping-annotations-you-ll-see)
  - [`@JoinColumn`](#joincolumn)
  - [`@JoinTable`](#jointable)
  - [`@OrderBy`](#orderby)
  - [`@BatchSize` (Hibernate-specific)](#batchsize-hibernate-specific)
- [5) Primary key ID generation in production (MySQL vs Oracle)](#5-primary-key-id-generation-in-production-mysql-vs-oracle)
  - [5.1 Common strategies](#5-1-common-strategies)
    - [`GenerationType.IDENTITY`](#generationtype-identity)
    - [`GenerationType.SEQUENCE`](#generationtype-sequence)
    - [UUID (application-generated)](#uuid-application-generated)
  - [5.2 Recommendations](#5-2-recommendations)
    - [MySQL (AWS RDS/Aurora MySQL)](#mysql-aws-rds-aurora-mysql)
    - [Oracle](#oracle)
    - [Avoid relying on `GenerationType.AUTO` in production](#avoid-relying-on-generationtype-auto-in-production)
- [6) Identity provider choice (AWS MySQL managed DB and Oracle)](#6-identity-provider-choice-aws-mysql-managed-db-and-oracle)
  - [6.1 Recommended default on AWS: Amazon Cognito](#6-1-recommended-default-on-aws-amazon-cognito)
  - [6.2 Enterprise SSO: integrate with existing IdP (Okta / Azure AD / Ping)](#6-2-enterprise-sso-integrate-with-existing-idp-okta-azure-ad-ping)
  - [6.3 Self-managed / on-prem style: Keycloak](#6-3-self-managed-on-prem-style-keycloak)
  - [6.4 For service-to-service on AWS: IAM roles + JWT/OIDC (or mTLS)](#6-4-for-service-to-service-on-aws-iam-roles-jwt-oidc-or-mtls)
  - [6.5 Oracle-specific environments](#6-5-oracle-specific-environments)
- [Quick recommendation](#quick-recommendation)


---




## 1) Key concepts you must know

### 1.1 Owning side vs inverse side
- **Owning side**: the side that contains the **foreign key** (or the join table) and controls the relationship in the database.
- **Inverse side**: uses `mappedBy` to point to the owning side field.

Rule:
- `mappedBy` is written on the **inverse side**.

### 1.2 `mappedBy`
- `mappedBy = "user"` means: “this collection/property is mapped by the `user` field on the other entity”.
- It avoids an extra join table for a bidirectional association and prevents both sides from trying to own the FK.

### 1.3 `cascade`
Controls what happens to the child entity when you persist/remove/merge the parent.

Common cascade types:
- `CascadeType.PERSIST`: when parent is persisted, persist child
- `CascadeType.MERGE`: when parent is merged, merge child
- `CascadeType.REMOVE`: when parent is removed, remove child
- `CascadeType.ALL`: all of the above

Important:
- Cascade is **not** the same as DB `ON DELETE CASCADE`.
- Cascade affects operations performed by the **EntityManager**, not what the database does by itself.

### 1.4 `fetch` (LAZY vs EAGER)
- `FetchType.LAZY`: association is loaded only when accessed (often default for collections).
- `FetchType.EAGER`: association is loaded immediately.

Rule of thumb:
- Prefer `LAZY` for most relationships to avoid unexpected large queries.

### 1.5 Orphan removal
- `orphanRemoval = true` means: if you remove a child from the parent collection, JPA will delete it.
- Useful in parent-owned aggregates.

---

## 2) Option A (recommended in most business apps): `User` has **many** `Address` records

This is most realistic: users can have multiple addresses (home, office, etc.).

### 2.1 Mapping: `@OneToMany` + `@ManyToOne`

#### `UserEntity` (inverse side)
```java
@Entity
@Table(name = "users")
public class UserEntity {

  @Id
  private String id;

  @Column(nullable = false)
  private String name;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<AddressEntity> addresses = new ArrayList<>();

  public void addAddress(AddressEntity address) {
    addresses.add(address);
    address.setUser(this);
  }

  public void removeAddress(AddressEntity address) {
    addresses.remove(address);
    address.setUser(null);
  }
}
```

#### `AddressEntity` (owning side)
```java
@Entity
@Table(name = "addresses")
public class AddressEntity {

  @Id
  private String id;

  @Column(nullable = false)
  private String line1;

  @Column(nullable = false)
  private String city;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private UserEntity user;

  public void setUser(UserEntity user) {
    this.user = user;
  }
}
```

Why `AddressEntity` is the owning side:
- It has the FK column `addresses.user_id`.

Why `mappedBy = "user"` is on `UserEntity.addresses`:
- The collection is mapped by the `user` field on `AddressEntity`.

### 2.2 What tables are created?

**users**
- `id` (PK)
- `name`

**addresses**
- `id` (PK)
- `line1`
- `city`
- `user_id` (FK → users.id)

### 2.3 What SQL queries will be created? (typical Hibernate behavior)

#### Case 1: Persist user + addresses (with `cascade = ALL`)
Pseudo code:
```java
var user = new UserEntity("u1", "Ashish");
user.addAddress(new AddressEntity("a1", "Line1", "Pune"));
user.addAddress(new AddressEntity("a2", "Line2", "Mumbai"));
entityManager.persist(user);
```

Typical SQL (order may vary):
```sql
insert into users (id, name) values ('u1', 'Ashish');
insert into addresses (id, line1, city, user_id) values ('a1','Line1','Pune','u1');
insert into addresses (id, line1, city, user_id) values ('a2','Line2','Mumbai','u1');
```

#### Case 2: Load user only
```java
UserEntity u = em.find(UserEntity.class, "u1");
```
SQL:
```sql
select u.id, u.name from users u where u.id = 'u1';
```

If `addresses` is `LAZY`, no address query happens until you access it.

#### Case 3: Access lazy addresses
```java
u.getAddresses().size();
```
SQL:
```sql
select a.id, a.line1, a.city, a.user_id from addresses a where a.user_id = 'u1';
```

#### Case 4: N+1 issue
If you load many users and then loop `user.getAddresses()` for each, Hibernate can run 1 query for users + N queries for addresses.

Fix options:
- Fetch join query
- Batch size
- Entity graph

Example fetch join:
```java
select distinct u from UserEntity u left join fetch u.addresses where u.id in :ids
```

#### Case 5: Remove an address (with `orphanRemoval = true`)
```java
user.removeAddress(address);
```
SQL:
```sql
delete from addresses where id = 'a1';
```

If you remove the user with cascade remove:
```java
em.remove(user);
```
SQL:
```sql
delete from addresses where user_id = 'u1';
delete from users where id = 'u1';
```

---

## 3) Option B: `@OneToOne` (User has exactly one Address)

This is less common for real-world “address” but useful to understand.

### 3.1 Unidirectional `@OneToOne` (owning side has FK)

```java
@Entity
@Table(name = "users")
public class UserEntity {

  @Id
  private String id;

  @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "address_id", nullable = false, unique = true)
  private AddressEntity address;
}

@Entity
@Table(name = "addresses")
public class AddressEntity {
  @Id
  private String id;
  private String line1;
  private String city;
}
```

Tables:
- `users.address_id` FK → `addresses.id`

SQL on persist:
```sql
insert into addresses (id, line1, city) values ('a1','Line1','Pune');
insert into users (id, address_id) values ('u1','a1');
```

### 3.2 Bidirectional `@OneToOne` using `mappedBy`

Owning side (FK holder): User

```java
@OneToOne
@JoinColumn(name = "address_id")
private AddressEntity address;
```

Inverse side:
```java
@OneToOne(mappedBy = "address")
private UserEntity user;
```

---

## 4) Common mapping annotations you’ll see

### `@JoinColumn`
Defines the FK column.

### `@JoinTable`
Used when the relationship is stored in a separate join table (often `@ManyToMany`, sometimes unidirectional `@OneToMany`).

### `@OrderBy`
Sorts a collection when loaded.

```java
@OneToMany(mappedBy = "user")
@OrderBy("createdAt desc")
private List<AddressEntity> addresses;
```

### `@BatchSize` (Hibernate-specific)
Helps reduce N+1 by loading collections in batches.

---

## 5) Primary key ID generation in production (MySQL vs Oracle)

JPA ID generation is one of the most important production decisions because it affects:
- insert performance and batching
- portability across databases
- future scaling (multi-writer, sharding)

### 5.1 Common strategies

#### `GenerationType.IDENTITY`
- DB generates the ID on insert.
- Typically maps to MySQL `AUTO_INCREMENT`.

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

Pros:
- simple

Cons:
- Hibernate can’t pre-allocate IDs, which can reduce insert batching efficiency

#### `GenerationType.SEQUENCE`
- Uses a database sequence.
- Most common/efficient on Oracle.

```java
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
@SequenceGenerator(
  name = "user_seq",
  sequenceName = "USER_SEQ",
  allocationSize = 50
)
private Long id;
```

Pros:
- very efficient inserts
- supports pre-allocation (`allocationSize`) which helps batching

Cons:
- requires sequence management
- IDs may have gaps (normal and usually acceptable)

#### UUID (application-generated)
Instead of using `@GeneratedValue`, you can generate IDs in the app.

```java
@Id
private String id = java.util.UUID.randomUUID().toString();
```

Pros:
- good for distributed systems (no DB call required to generate ID)

Cons:
- larger indexes; purely random UUIDs can impact index locality (mitigate with time-ordered UUID/ULID patterns)

### 5.2 Recommendations

#### MySQL (AWS RDS/Aurora MySQL)
- If you want simplicity: use **`IDENTITY`** (`AUTO_INCREMENT`) with `BIGINT`.
- If you expect distributed writes / sharding: prefer **UUID** (or time-ordered IDs).

#### Oracle
- Prefer **`SEQUENCE`** with a reasonable `allocationSize` (often 50 or 100).

#### Avoid relying on `GenerationType.AUTO` in production
`AUTO` lets the provider choose and can behave differently across MySQL vs Oracle.

---

## 6) Identity provider choice (AWS MySQL managed DB and Oracle)

Your database choice (AWS managed MySQL vs Oracle) **does not decide** your application identity provider. Identity providers are about:
- authenticating users/services
- issuing tokens (OAuth2/OIDC)
- managing users, SSO, MFA, roles

### 6.1 Recommended default on AWS: Amazon Cognito
Choose **Amazon Cognito** when:
- you want a managed IdP on AWS
- you need OIDC/OAuth2, user pools, MFA, hosted UI
- you want minimal ops

Spring Boot integration: `spring-boot-starter-oauth2-resource-server` with JWT.

### 6.2 Enterprise SSO: integrate with existing IdP (Okta / Azure AD / Ping)
Choose this when:
- company already has a standard (most enterprises do)
- you need SAML/OIDC SSO

### 6.3 Self-managed / on-prem style: Keycloak
Choose **Keycloak** when:
- you need full control and self-hosting
- hybrid/on-prem or multi-cloud

### 6.4 For service-to-service on AWS: IAM roles + JWT/OIDC (or mTLS)
If the “users” are actually microservices:
- consider AWS IAM, IRSA on EKS, and short-lived credentials
- or use OIDC tokens between services

### 6.5 Oracle-specific environments
If you’re in Oracle ecosystem:
- Oracle has offerings (Oracle Identity Cloud Service in many orgs)
- but if you’re on AWS and just using Oracle DB, Cognito/Okta/AzureAD still make sense.

---

## Quick recommendation
- **If you are on AWS and don’t have an enterprise IdP**: use **Amazon Cognito**.
- **If the company already uses SSO**: use that IdP (Okta/Azure AD/etc.) and configure Spring Boot as a resource server.
- **If you need self-hosted**: Keycloak.
