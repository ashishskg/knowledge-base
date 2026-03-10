## Oracle Database — Complete Enterprise Guide

---

## 0. How to Use This Guide

- **Audience**:
  - Beginners learning SQL and relational concepts.
  - Backend developers building enterprise systems on Oracle.
  - Senior engineers and DBAs tuning performance.
  - Architects designing scalable, highly available Oracle-based platforms.
- **Scope**:
  - Fundamentals → intermediate → advanced → enterprise patterns.
  - Strong focus on **indexing**, **joins**, **analytics (incl. DENSE_RANK)**, **performance**, and **PL/SQL**.
- **Companion**:
  - Use this together with application-level guides (Java 8 / Java 21, concurrency, caching) when designing end-to-end systems.

---

## 1. Database Fundamentals

### 1.1 What is a database?

**Definition**  
A database is an organized collection of data, stored and accessed electronically. An **RDBMS** (Relational Database Management System) like **Oracle** stores data in tables with rows and columns, enforcing relationships and constraints.

**Why it is needed**
- Centralize data storage for applications.
- Ensure **consistency**, **integrity**, **durability**, and **concurrency**.
- Provide powerful querying (SQL) and transactional guarantees.

### 1.2 RDBMS vs NoSQL

| Aspect            | RDBMS (Oracle)                            | NoSQL (e.g., MongoDB, Cassandra)              |
|-------------------|-------------------------------------------|-----------------------------------------------|
| Data model        | Relational (tables, rows, columns)        | Document, key-value, wide-column, graph       |
| Schema            | Fixed schema, enforced constraints        | Flexible / schema-less                        |
| Joins             | Supported (SQL JOINs)                     | Limited / app-side joins                      |
| Transactions      | Strong ACID                               | Often tunable (eventual consistency, etc.)    |
| Use cases         | OLTP, financials, ERP, strong consistency | Big data, high write throughput, flexibility  |

Enterprise reality:
- Oracle is typically used as **system-of-record** (SoR) for critical data (banking ledger, orders).
- NoSQL may be used as **cache** or for analytics/observability alongside Oracle.

### 1.3 ACID properties

**Definition**  
ACID = **Atomicity**, **Consistency**, **Isolation**, **Durability**.

- **Atomicity**: All operations in a transaction succeed or none do.
- **Consistency**: Transactions move the DB from one valid state to another, preserving constraints.
- **Isolation**: Concurrent transactions do not see each other's partial results.
- **Durability**: Once committed, changes survive failures.

Oracle implementation:
- Redo logs, undo segments, and locking ensure ACID.

### 1.4 Data integrity

Enforced via:
- **Constraints**: `PRIMARY KEY`, `UNIQUE`, `FOREIGN KEY`, `CHECK`, `NOT NULL`.
- **Triggers** and **PL/SQL** for complex rules.

Example:

```sql
CREATE TABLE accounts (
  account_id    NUMBER PRIMARY KEY,
  customer_id   NUMBER NOT NULL,
  balance       NUMBER(15,2) CHECK (balance >= 0),
  status        VARCHAR2(10) CHECK (status IN ('ACTIVE','CLOSED'))
);
```

### 1.5 Transaction management & isolation levels

Oracle default isolation: **READ COMMITTED** (statement-level consistency).

Isolation levels supported:
- `READ COMMITTED` (default)
- `SERIALIZABLE`
- `READ ONLY`

Example:

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

Oracle uses **multi-version read consistency** using undo segments, so readers do not block writers and vice versa (in most cases).

### 1.6 CAP theorem & placement of Oracle

CAP: Consistency, Availability, Partition tolerance — in a distributed system you can strongly favor only two at a time.

- Typical Oracle deployments (single primary with sync/async replicas) favor **Consistency + Availability** in a LAN, with partial behavior under partitions (HA techniques).

### 1.7 OLTP vs OLAP

| Aspect   | OLTP (Online Transaction Processing)      | OLAP (Online Analytical Processing)          |
|----------|-------------------------------------------|----------------------------------------------|
| Workload | Many small transactions (CRUD)           | Fewer, large aggregations & reports          |
| Schema   | Normalized                               | Star/snowflake, denormalized for queries     |
| Example  | Banking core system                      | Data warehouse / BI reports                  |

Oracle supports both via:
- OLTP schemas + indexes for row-based access.
- Oracle Data Warehouse / partitioning / materialized views for OLAP.

**Interview questions**
- Explain ACID with Oracle-specific examples.
- How does Oracle provide read consistency?
- When would you choose OLTP vs OLAP schema designs?

---

## 2. Oracle Database Architecture

### 2.1 High-level components

Text diagram:

```text
           +----------------------+
           |      Oracle DB       |
           |   (Datafiles, CF, RL)|
           +----------+-----------+
                      ^
                      |
           +----------+-----------+
           |    Oracle Instance   |
           |  SGA + Background    |
           |  Processes (DBWR...) |
           +----------+-----------+
                      ^
                      |
            Client sessions (PGA)
```

**Oracle Instance**
- Combination of **SGA** (System Global Area) + **background processes**.

**Oracle Database**
- Physical files: **datafiles**, **control files**, **redo log files**, **archive logs**.

### 2.2 Memory structures

- **SGA (System Global Area)**:
  - Shared across all sessions.
  - Components:
    - **Shared pool** (library cache, dictionary cache).
    - **Database buffer cache** (data blocks).
    - **Redo log buffer**.
    - **Large pool**, **Java pool**, etc.

- **PGA (Program Global Area)**:
  - Per-server process memory.
  - Contains session-level info, sort area, cursor state.

### 2.3 Background processes

Key processes:

- **DBWR** (Database Writer)
  - Writes dirty buffers from buffer cache to datafiles.

- **LGWR** (Log Writer)
  - Writes redo entries from redo log buffer to online redo log files.

- **SMON** (System Monitor)
  - Instance recovery (rolling forward/rolling back after crash).
  - Maintains temporary segments.

- **PMON** (Process Monitor)
  - Cleans up after failed user processes.
  - Frees resources.

- **CKPT** (Checkpoint)
  - Signals DBWR to write dirty buffers at checkpoints.
  - Updates control file and datafile headers.

- **ARCn** (Archiver)
  - Copies online redo logs to archive destinations when they are full.

### 2.4 Data storage components

- **Tablespace**
  - Logical storage unit; contains segments (tables, indexes).

- **Datafile**
  - Physical file on disk that stores actual data blocks.

- **Control file**
  - Contains metadata (database name, SCN, file locations).

- **Redo log**
  - Records all changes to data (for recovery).

- **Archive log**
  - Copy of redo logs when database is in ARCHIVELOG mode; used for point-in-time recovery.

**Interview questions**
- Explain SGA vs PGA.
- What does LGWR do? When does it write?
- What is a tablespace vs a datafile?

---

## 3. Oracle Data Types

### 3.1 Character types

| Type      | Description                               | When to use                                      |
|-----------|-------------------------------------------|--------------------------------------------------|
| `CHAR(n)` | Fixed-length, padded with spaces          | Fixed-size codes (e.g. country codes)           |
| `VARCHAR2(n)` | Variable-length, up to n bytes/chars | Most general text columns                        |
| `NCHAR`, `NVARCHAR2` | Unicode fixed/var length     | NLS/unicode specific requirements                |

Best practice:
- Prefer `VARCHAR2` for most text data; use `CHAR` only for truly fixed-length codes.

### 3.2 Numeric types

| Type     | Description                                 | When to use                         |
|----------|---------------------------------------------|-------------------------------------|
| `NUMBER(p,s)` | Arbitrary precision up to 38 digits   | Monetary, IDs, counts               |
| `FLOAT`  | Approximate numeric (mapped to NUMBER)     | Rare; use NUMBER for precision      |

Example:

```sql
salary NUMBER(10,2); -- up to 99999999.99
```

### 3.3 Date and time types

| Type                          | Description                                 |
|-------------------------------|---------------------------------------------|
| `DATE`                        | Date + time to seconds                      |
| `TIMESTAMP`                  | Date + time with fractional seconds         |
| `TIMESTAMP WITH TIME ZONE`   | Includes time zone offset                   |

Best practice:
- For global systems, use `TIMESTAMP WITH TIME ZONE` or store UTC and track zone in separate column.

### 3.4 LOB types

| Type   | Description                             |
|--------|-----------------------------------------|
| `CLOB` | Character large object                  |
| `BLOB` | Binary large object                     |
| `NCLOB` | Unicode CLOB                           |

Use for:
- Large text (CLOB) or binary data (BLOB) like documents, images, large JSON.

**Interview questions**
- Difference between CHAR and VARCHAR2?
- When would you choose `TIMESTAMP WITH TIME ZONE`?

---

## 4. SQL Basics (All Keywords)

### 4.1 DDL – Data Definition Language

**CREATE**

```sql
CREATE TABLE customers (
  customer_id NUMBER PRIMARY KEY,
  name        VARCHAR2(100) NOT NULL,
  created_at  DATE DEFAULT SYSDATE
);
```

**ALTER**

```sql
ALTER TABLE customers ADD email VARCHAR2(200);
```

**DROP**

```sql
DROP TABLE customers;
```

**TRUNCATE** (DANGEROUS, fast remove all rows, cannot rollback)

```sql
TRUNCATE TABLE customers;
```

**RENAME**

```sql
RENAME customers TO customers_old;
```

**COMMENT**

```sql
COMMENT ON COLUMN customers.email IS 'Customer primary email address';
```

### 4.2 DML – Data Manipulation Language

**INSERT**

```sql
INSERT INTO customers(customer_id, name, email)
VALUES (1, 'Alice', 'alice@example.com');
```

**UPDATE**

```sql
UPDATE customers
SET email = 'alice@newdomain.com'
WHERE customer_id = 1;
```

**DELETE**

```sql
DELETE FROM customers WHERE customer_id = 1;
```

**MERGE** (upsert)

```sql
MERGE INTO customers c
USING (SELECT 1 id, 'Alice' name FROM dual) src
  ON (c.customer_id = src.id)
WHEN MATCHED THEN
  UPDATE SET c.name = src.name
WHEN NOT MATCHED THEN
  INSERT (customer_id, name) VALUES (src.id, src.name);
```

### 4.3 DCL – Data Control Language

**GRANT**

```sql
GRANT SELECT, INSERT ON customers TO app_user;
```

**REVOKE**

```sql
REVOKE INSERT ON customers FROM app_user;
```

### 4.4 TCL – Transaction Control Language

**COMMIT**

```sql
COMMIT;
```

**ROLLBACK**

```sql
ROLLBACK;
```

**SAVEPOINT**

```sql
SAVEPOINT before_update;
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
ROLLBACK TO SAVEPOINT before_update;
```

Common mistakes:
- Using `TRUNCATE` when you expect to be able to rollback.
- Forgetting `WHERE` in UPDATE/DELETE.

---

## 5. SELECT Statement (Deep Guide)

### 5.1 Basic structure

```sql
SELECT [DISTINCT] col_list
FROM   table_list
WHERE  conditions
GROUP BY group_columns
HAVING group_conditions
ORDER BY order_columns;
```

**WHERE** filters rows before grouping.  
**HAVING** filters groups after grouping.

Example:

```sql
SELECT c.customer_id,
       COUNT(o.order_id) AS order_count,
       SUM(o.amount)     AS total_amount
FROM   customers c
JOIN   orders o ON o.customer_id = c.customer_id
WHERE  o.status = 'COMPLETED'
GROUP BY c.customer_id
HAVING SUM(o.amount) > 1000
ORDER BY total_amount DESC;
```

---

## 6. SQL OPERATORS

### 6.1 Comparison

- `=`, `!=`, `<>`, `>`, `<`, `>=`, `<=`

### 6.2 Logical

- `AND`, `OR`, `NOT`

### 6.3 Special

- `IN`, `BETWEEN`, `LIKE`, `EXISTS`, `ANY`, `ALL`

Examples:

```sql
SELECT * FROM accounts
WHERE status IN ('ACTIVE','PENDING')
  AND balance BETWEEN 1000 AND 5000
  AND account_name LIKE 'VIP%';
```

```sql
SELECT * FROM orders o
WHERE EXISTS (SELECT 1 FROM order_items i
              WHERE i.order_id = o.order_id
                AND i.product_id = 123);
```

Performance:
- `EXISTS` often more efficient than `IN` with correlated predicates.

---

## 7. JOINS (Deep Guide)

### 7.1 Types of joins

| Join      | Definition                                             |
|-----------|--------------------------------------------------------|
| INNER     | Rows with matching keys in both tables                |
| LEFT      | All left table rows + matched right rows              |
| RIGHT     | All right table rows + matched left rows              |
| FULL      | All rows from both, matched where possible            |
| CROSS     | Cartesian product (every row from A with every from B)|
| SELF      | Join a table to itself                                |

Text diagram for INNER JOIN:

```text
Customers (C)            Orders (O)
------------            ------------
customer_id             order_id
...                     customer_id

C INNER JOIN O ON C.customer_id = O.customer_id
=> only customers that have orders
```

Example:

```sql
-- INNER JOIN
SELECT c.customer_id, c.name, o.order_id, o.amount
FROM   customers c
JOIN   orders o ON c.customer_id = o.customer_id;

-- LEFT JOIN (customers without orders included)
SELECT c.customer_id, c.name, o.order_id, o.amount
FROM   customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id;
```

Performance considerations:
- Ensure join columns are **indexed** (typically primary or foreign keys).
- Avoid joining large tables without selectivity or filters.

Common mistakes:
- Using `LEFT JOIN` but filtering right table in WHERE (turns it into INNER JOIN logically):

```sql
-- WRONG if you want all customers, even without orders
SELECT ...
FROM customers c
LEFT JOIN orders o ON ...
WHERE o.status = 'COMPLETED';

-- Correct
WHERE (o.status = 'COMPLETED' OR o.order_id IS NULL);
```

---

## 8. SUBQUERIES

### 8.1 Single-row subquery

```sql
SELECT * FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

### 8.2 Multi-row subquery

```sql
SELECT * FROM employees
WHERE department_id IN (
  SELECT department_id FROM departments WHERE location_id = 1700
);
```

### 8.3 Correlated subquery

```sql
SELECT e.employee_id, e.salary
FROM   employees e
WHERE  e.salary > (
  SELECT AVG(e2.salary)
  FROM   employees e2
  WHERE  e2.department_id = e.department_id
);
```

Performance:
- Correlated subqueries can be expensive; often replaced with analytic functions or joins.

---

## 9. AGGREGATE FUNCTIONS

### 9.1 COUNT, SUM, AVG, MIN, MAX

```sql
SELECT COUNT(*)        AS total_orders,
       SUM(amount)     AS total_amount,
       AVG(amount)     AS avg_amount,
       MIN(amount)     AS min_amount,
       MAX(amount)     AS max_amount
FROM   orders
WHERE  status = 'COMPLETED';
```

### 9.2 GROUP BY and HAVING

```sql
SELECT customer_id,
       COUNT(*) AS order_count,
       SUM(amount) AS total_amount
FROM   orders
GROUP BY customer_id
HAVING SUM(amount) > 1000
ORDER BY total_amount DESC;
```

Best practices:
- Only include grouped or aggregated columns in SELECT when using GROUP BY.

---

## 10. ANALYTICAL FUNCTIONS

### 10.1 Definition

Analytic (window) functions compute aggregates **over a window** of rows relative to the current row, without collapsing rows like GROUP BY.

Key syntax:

```sql
function_name(...) OVER (
  PARTITION BY partition_expr
  ORDER BY order_expr
  [ROWS/RANGE window_clause]
)
```

### 10.2 Common analytic functions

| Function      | Description                               |
|---------------|-------------------------------------------|
| `ROW_NUMBER`  | Unique row number in partition            |
| `RANK`        | Rank with gaps on ties                    |
| `DENSE_RANK`  | Rank without gaps on ties                 |
| `LAG`         | Value from previous row                   |
| `LEAD`        | Value from next row                       |
| `NTILE(n)`    | Divide partition into n buckets           |
| `FIRST_VALUE` | First value in window                     |
| `LAST_VALUE`  | Last value in window                      |

### 10.3 Example: DENSE_RANK

```sql
SELECT customer_id,
       SUM(amount) AS total_amount,
       DENSE_RANK() OVER (ORDER BY SUM(amount) DESC) AS revenue_rank
FROM   orders
GROUP BY customer_id
ORDER BY revenue_rank;
```

Use case:
- Find **top N customers** by revenue, where customers with equal revenue share the same rank.

### 10.4 Example: LAG / LEAD

```sql
SELECT account_id,
       txn_date,
       amount,
       LAG(amount)  OVER (PARTITION BY account_id ORDER BY txn_date) AS prev_amount,
       LEAD(amount) OVER (PARTITION BY account_id ORDER BY txn_date) AS next_amount
FROM   transactions;
```

Enterprise usage:
- Trend analysis, time-series comparisons, fraud detection.

Performance:
- Analytic functions often outperform correlated subqueries due to single-pass processing.

---

## 11. INDEXES

### 11.1 Definition

An **index** is a separate data structure (typically a **B-tree** or **bitmap**) that allows faster row lookup by key, at the cost of extra storage and maintenance on DML.

### 11.2 Types

| Type           | Description                                              | Use case                                        |
|----------------|----------------------------------------------------------|-------------------------------------------------|
| B-tree index   | Balanced tree on one/more columns                        | OLTP, high-cardinality columns                  |
| Bitmap index   | Bitmaps for each distinct value                          | Read-heavy OLAP, low-cardinality columns        |
| Composite      | Index on multiple columns                                | Multi-column search patterns                    |
| Unique index   | Enforces uniqueness                                      | Candidate keys, natural keys                    |

### 11.3 Examples

```sql
-- Single-column B-tree
CREATE INDEX idx_orders_customer ON orders(customer_id);

-- Composite index
CREATE INDEX idx_orders_cust_status ON orders(customer_id, status);

-- Bitmap index (only on read-heavy, low-DML tables)
CREATE BITMAP INDEX idx_orders_status ON orders(status);
```

Internal working (simplified):
- B-tree index stores **sorted key values** and rowids; lookups traverse from root → leaf.

Performance considerations:
- Improve **SELECT** performance (especially equality and range queries).
- **Slow down inserts/updates/deletes**, because index maintenance is required.
- Too many indexes can hurt OLTP performance.

Best practices:
- Index **foreign keys**, frequently used WHERE columns, and JOIN keys.
- Avoid indexing columns with extremely low selectivity (e.g., status with 2 values) using B-tree; consider bitmap for read-mostly DW.

Common mistakes:
- Creating indexes without analyzing query patterns.
- Using bitmap indexes on OLTP tables with heavy DML (can cause locking issues).

---

## 12. VIEWS

### 12.1 Simple and complex views

**View**: Logical abstraction over a SELECT query.

```sql
CREATE VIEW active_customers AS
SELECT customer_id, name
FROM   customers
WHERE  status = 'ACTIVE';
```

Complex view: joins, aggregations, subqueries.

### 12.2 Materialized views

**Materialized view**: Physical copy of query result, refreshed periodically.

```sql
CREATE MATERIALIZED VIEW mv_daily_revenue
BUILD IMMEDIATE
REFRESH FAST ON COMMIT
AS
SELECT order_date, SUM(amount) AS total_amount
FROM   orders
GROUP BY order_date;
```

Use cases:
- Precomputed aggregates for reporting.
- Offloading expensive queries from OLTP tables.

---

## 13. PL/SQL: Stored Procedures, Functions, Packages

### 13.1 PL/SQL basics

PL/SQL = Oracle’s procedural extension to SQL.

Structure:

```sql
DECLARE
  v_counter NUMBER := 0;
BEGIN
  v_counter := v_counter + 1;
  DBMS_OUTPUT.PUT_LINE('Counter: ' || v_counter);
END;
/
```

### 13.2 Stored procedures & functions

```sql
CREATE OR REPLACE PROCEDURE transfer_amount (
  p_from_account IN NUMBER,
  p_to_account   IN NUMBER,
  p_amount       IN NUMBER
) AS
BEGIN
  UPDATE accounts SET balance = balance - p_amount WHERE account_id = p_from_account;
  UPDATE accounts SET balance = balance + p_amount WHERE account_id = p_to_account;
END;
/
```

```sql
CREATE OR REPLACE FUNCTION get_balance (
  p_account_id IN NUMBER
) RETURN NUMBER AS
  v_balance NUMBER;
BEGIN
  SELECT balance INTO v_balance FROM accounts WHERE account_id = p_account_id;
  RETURN v_balance;
END;
/
```

### 13.3 Packages

```sql
CREATE OR REPLACE PACKAGE account_pkg AS
  PROCEDURE transfer_amount(p_from_account NUMBER, p_to_account NUMBER, p_amount NUMBER);
  FUNCTION  get_balance(p_account_id NUMBER) RETURN NUMBER;
END account_pkg;
/
```

Use cases:
- Encapsulate business logic in the database.
- Provide stable APIs to applications.

Best practices:
- Keep logic cohesive and testable.
- Avoid too much business logic in PL/SQL if you need portability across DB vendors.

---

## 14. TRIGGERS

### 14.1 Types

| Timing   | Level       |
|----------|-------------|
| BEFORE   | ROW / STATEMENT |
| AFTER    | ROW / STATEMENT |

### 14.2 Example: Row-level BEFORE INSERT

```sql
CREATE OR REPLACE TRIGGER bi_accounts
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
  IF :NEW.account_id IS NULL THEN
    SELECT accounts_seq.NEXTVAL INTO :NEW.account_id FROM dual;
  END IF;
END;
/
```

Use cases:
- Auto-populate IDs (though sequences/defaults are often better).
- Audit logging (but consider performance).

Common mistakes:
- Complex logic in triggers causing unexpected side effects.

---

## 15. PERFORMANCE TUNING

### 15.1 Execution plans

Use `EXPLAIN PLAN`:

```sql
EXPLAIN PLAN FOR
SELECT * FROM orders WHERE customer_id = 123;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

Read:
- Access paths (INDEX RANGE SCAN, FULL TABLE SCAN).
- Join methods (NESTED LOOPS, HASH JOIN, MERGE JOIN).

### 15.2 Query optimization

- Ensure predicate columns are indexed.
- Avoid functions on indexed columns (unless using function-based indexes).
- Use **bind variables** to avoid parsing overhead.

### 15.3 Partitioning

- Horizontal splitting of large tables based on key (e.g., range by date).
- Improves manageability, pruning, parallelism.

```sql
CREATE TABLE orders_part (
  order_id    NUMBER,
  order_date  DATE,
  ...
)
PARTITION BY RANGE (order_date) (
  PARTITION p2024q1 VALUES LESS THAN (TO_DATE('2024-04-01','YYYY-MM-DD')),
  PARTITION p2024q2 VALUES LESS THAN (TO_DATE('2024-07-01','YYYY-MM-DD'))
);
```

### 15.4 Parallel queries

```sql
ALTER SESSION ENABLE PARALLEL QUERY;
SELECT /*+ PARALLEL(o,4) */ COUNT(*) FROM orders o;
```

Tools:
- `EXPLAIN PLAN`, `DBMS_XPLAN`.
- SQL Trace (10046), TKPROF.
- AWR (Automatic Workload Repository).

---

## 16. ORACLE SECURITY

### 16.1 Users, roles, privileges

```sql
CREATE USER app_user IDENTIFIED BY "StrongP@ssw0rd";
GRANT CREATE SESSION TO app_user;
GRANT SELECT, INSERT ON accounts TO app_user;
```

Roles:

```sql
CREATE ROLE app_role;
GRANT SELECT, INSERT ON accounts TO app_role;
GRANT app_role TO app_user;
```

### 16.2 Encryption

- Transparent Data Encryption (TDE) for data at rest.
- Network encryption (SQL*Net).

Best practices:
- Principle of least privilege.
- Separate schema owners from application runtime users.

---

## 17. ORACLE TRANSACTIONS & LOCKING

### 17.1 COMMIT, ROLLBACK, SAVEPOINT

Already covered in TCL; here emphasize:
- Commit groups related changes.
- Savepoints for partial rollback.

### 17.2 Locking & deadlocks

- Row-level locks acquired on DML.
- Deadlock: circular wait between sessions; Oracle detects and kills one transaction.

Avoid:
- Updating same rows in different orders across transactions.
- Holding locks for long-running transactions.

---

## 18. DATABASE DESIGN

### 18.1 Normalization vs denormalization

Normalization (1NF, 2NF, 3NF, BCNF):
- Removes redundancy, avoids anomalies.

Denormalization:
- Introduces redundancy for performance (e.g., pre-joined tables, aggregates).

### 18.2 Schema design & ER diagrams

Text ER example (banking):

```text
CUSTOMER (customer_id PK) 1 --- * ACCOUNT (account_id PK, customer_id FK)
ACCOUNT 1 --- * TRANSACTION (txn_id PK, account_id FK)
```

Enterprise strategies:
- For OLTP: normalized, clear relationships, indexes.
- For reporting: star schema, fact / dimension tables.

---

## 19. ORACLE BACKUP AND RECOVERY

### 19.1 RMAN (Recovery Manager)

Use RMAN for:
- Full and incremental backups.
- Point-in-time recovery.
- Automating backup strategies.

Example (conceptual):

```bash
rman target /
RMAN> BACKUP DATABASE PLUS ARCHIVELOG;
```

Point-in-time recovery: restore to SCN or time using archived logs.

---

## 20. ENTERPRISE DATABASE ARCHITECTURE

### 20.1 Partitioning, sharding, replication

- **Partitioning**: within a single database for large tables.
- **Sharding**: horizontal split across multiple databases (Oracle Sharding).
- **Replication**: Data Guard (physical standby), GoldenGate (logical replication).

### 20.2 High availability

- Oracle RAC (Real Application Clusters) for node-level HA.
- Data Guard for disaster recovery.

### 20.3 Data warehouses

- Large fact tables, partitioned by date.
- Materialized views, parallel queries.

Examples in banking:
- Real-time transactional core system (OLTP).
- Daily data warehouse for risk & reporting (OLAP).

---

## 21. REAL PROJECT EXAMPLES (High-Level Sketches)

### 21.1 Banking transaction system

- Core tables: ACCOUNTS, TRANSACTIONS, CUSTOMERS.
- Heavy use of:
  - B-tree indexes on account_id, txn_date.
  - Partitioning on txn_date.
  - Analytic functions for statements and balances.

### 21.2 Order management system

- Orders, Order_Items, Customers, Inventory.
- Materialized views for daily sales, top products.
- Indexes on status, customer_id, product_id.

---

## 22. ORACLE INTERVIEW QUESTIONS (Sample)

### 22.1 Beginner

- What is a primary key and foreign key?
- Difference between DELETE and TRUNCATE?
- What is a transaction? When do you use COMMIT and ROLLBACK?

### 22.2 Intermediate

- Explain the difference between INNER JOIN and LEFT JOIN with examples.
- How does Oracle implement read consistency?
- What is an index? When would you not create one?
- Explain ROW_NUMBER vs RANK vs DENSE_RANK.

### 22.3 Advanced / 10+ years

- Explain Oracle’s SGA and PGA and how they affect performance.
- How do you analyze and tune a slow query using EXPLAIN PLAN and AWR?
- When would you use partitioning? Give concrete examples.
- How do you design an index strategy for a high-throughput OLTP system?

### 22.4 Architect-level

- Design a multi-region banking system using Oracle (primary/standby, sharding, caching).
- Compare putting business logic in PL/SQL vs application layer (Java/Spring).
- Discuss tradeoffs of normalization vs denormalization in a mixed OLTP/OLAP workload.

### 22.5 Practical SQL interview patterns (analytics & ranking)

#### 22.5.1 Second highest employee salary (overall)

**Definition**  
Find the employee(s) who have the second highest salary in the entire company.

**Approach 1 — Analytic function (`DENSE_RANK`)**

```sql
SELECT employee_id,
       first_name,
       last_name,
       salary
FROM (
  SELECT e.*,
         DENSE_RANK() OVER (ORDER BY salary DESC) AS salary_rank
  FROM   employees e
)
WHERE salary_rank = 2;
```

- `DENSE_RANK` assigns rank 1 to the highest salary, rank 2 to the second distinct salary, etc.
- If multiple employees share the same second-highest salary, all are returned.

**Approach 2 — Subquery (less flexible)**

```sql
SELECT *
FROM   employees
WHERE  salary = (
  SELECT MAX(salary)
  FROM   employees
  WHERE  salary < (SELECT MAX(salary) FROM employees)
);
```

**Performance considerations**
- Ensure an index on `salary` if the table is large and this query is frequent:

```sql
CREATE INDEX idx_emp_salary ON employees(salary);
```

#### 22.5.2 Second highest salary per department

**Definition**  
For each department, return the employee(s) with the second highest salary in that department.

**Analytic solution (recommended)**

```sql
SELECT department_id,
       employee_id,
       first_name,
       last_name,
       salary
FROM (
  SELECT e.*,
         DENSE_RANK() OVER (
           PARTITION BY department_id
           ORDER BY salary DESC
         ) AS salary_rank
  FROM   employees e
)
WHERE salary_rank = 2
ORDER BY department_id, salary DESC;
```

**Internal working**
- The analytic clause partitions rows by `department_id`.
- Within each partition, rows are ordered by `salary DESC`.
- `DENSE_RANK` assigns ranks per department; rows with the second distinct salary get `salary_rank = 2`.

**Indexes**
- A composite index on `(department_id, salary)` helps:

```sql
CREATE INDEX idx_emp_dept_salary ON employees(department_id, salary);
```

#### 22.5.3 Other common ranking interview tasks

- **Top N earners per department**:

```sql
SELECT *
FROM (
  SELECT e.*,
         DENSE_RANK() OVER (
           PARTITION BY department_id
           ORDER BY salary DESC
         ) AS rnk
  FROM   employees e
)
WHERE rnk <= 3;  -- top 3 per department
```

- **Nth highest salary overall** (parameterized):

```sql
-- For N = 3 (third highest)
SELECT *
FROM (
  SELECT e.*,
         DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM   employees e
)
WHERE rnk = 3;
```

**Typical interview questions**
- Write a query to find the second highest salary overall and per department.  
- Explain the difference between `RANK` and `DENSE_RANK` in this context.  
- How would you index the employees table to support these ranking queries efficiently?

---

## 23. ORACLE SQL CHEATSHEET (Quick Reference)

### 23.1 Joins

```sql
SELECT ... FROM a JOIN b ON a.id = b.id;
SELECT ... FROM a LEFT JOIN b ON a.id = b.id;
```

### 23.2 Aggregates & analytics

```sql
SELECT col, COUNT(*), SUM(x) FROM t GROUP BY col;

SELECT col,
       ROW_NUMBER() OVER (PARTITION BY grp ORDER BY val) AS rn
FROM   t;

SELECT col,
       DENSE_RANK() OVER (ORDER BY metric DESC) AS rnk
FROM   t;
```

### 23.3 Index hints (use sparingly)

```sql
SELECT /*+ INDEX(t idx_t_col) */ * FROM t WHERE col = :b1;
```

### 23.4 Subqueries & EXISTS

```sql
SELECT * FROM t WHERE col IN (SELECT col FROM u);
SELECT * FROM t WHERE EXISTS (SELECT 1 FROM u WHERE u.col = t.col);
```

### 23.5 PL/SQL skeleton

```sql
CREATE OR REPLACE PROCEDURE my_proc IS
BEGIN
  -- body
END my_proc;
/
```

Use this guide as your **end-to-end Oracle reference** from fundamentals to enterprise architecture and performance tuning. For daily work, keep the cheatsheet and sections on indexing, joins, analytics, and PL/SQL close at hand. 

