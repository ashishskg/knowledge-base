# Database SQL & Interview Guide

A single reference for SQL concepts, keywords, joins, ranking, subqueries, procedures, MySQL vs Oracle differences, partitioning and indexing, and senior-level database interview Q&A. All examples use **Employee** and **Department** with sample outputs.

---

## 1. Introduction

This guide covers:

- **SQL fundamentals:** SELECT, FROM, WHERE, JOINs, GROUP BY, HAVING, aggregates (MIN, MAX, SUM, AVG, COUNT), DISTINCT, ORDER BY, LIMIT/OFFSET-FETCH.
- **Example schema:** Employee and Department; all examples reuse this schema.
- **Ranking:** ROW_NUMBER, RANK, DENSE_RANK, NTILE.
- **Subqueries:** scalar, IN, EXISTS, correlated.
- **Procedures:** MySQL and Oracle examples.
- **DELETE vs TRUNCATE,** partition, index.
- **Interview Q&A:** 2nd salary by department, N+1, nth row, index/partition.

**Audience:** Developers preparing for database/SQL interviews (11+ years) or needing a MySQL/Oracle comparison.

---

### 1.1 Example schema: Employee and Department

**Department:** id, name, location  
**Employee:** id, name, salary, department_id, hire_date, manager_id (for self-join examples)

**MySQL:**

```sql
CREATE TABLE department (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  location VARCHAR(100)
);

CREATE TABLE employee (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  salary DECIMAL(10,2),
  department_id INT,
  hire_date DATE,
  manager_id INT,
  FOREIGN KEY (department_id) REFERENCES department(id),
  FOREIGN KEY (manager_id) REFERENCES employee(id)
);

INSERT INTO department (id, name, location) VALUES
(1, 'Engineering', 'NY'),
(2, 'Sales', 'LA'),
(3, 'HR', 'NY');

INSERT INTO employee (id, name, salary, department_id, hire_date, manager_id) VALUES
(1, 'Alice', 90000, 1, '2020-01-15', NULL),
(2, 'Bob', 85000, 1, '2019-06-01', 1),
(3, 'Carol', 70000, 2, '2021-03-10', NULL),
(4, 'Dave', 95000, 1, '2018-02-20', 1),
(5, 'Eve', 72000, 2, '2020-11-01', 3),
(6, 'Frank', 68000, 2, '2022-01-05', 3);
```

**Oracle:**

```sql
CREATE TABLE department (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100),
  location VARCHAR2(100)
);

CREATE SEQUENCE dept_seq START WITH 1 INCREMENT BY 1;
-- Use dept_seq.NEXTVAL for inserts

CREATE TABLE employee (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100),
  salary NUMBER(10,2),
  department_id NUMBER,
  hire_date DATE,
  manager_id NUMBER,
  CONSTRAINT fk_dept FOREIGN KEY (department_id) REFERENCES department(id),
  CONSTRAINT fk_mgr FOREIGN KEY (manager_id) REFERENCES employee(id)
);

CREATE SEQUENCE emp_seq START WITH 1 INCREMENT BY 1;
-- Use emp_seq.NEXTVAL for inserts
```

**Output (sample data):** department: (1, Engineering, NY), (2, Sales, LA), (3, HR, NY); employee: 6 rows with salaries and department_id 1 or 2.

---

## 2. SQL keywords and clauses (with examples)

### 2.1 SELECT, FROM, WHERE

List all columns; then filter by department_id.

**MySQL / Oracle (same):**

```sql
SELECT * FROM employee;
SELECT id, name, salary, department_id FROM employee WHERE department_id = 1;
```

**Output (WHERE department_id = 1):**

| id | name  | salary | department_id |
|----|-------|--------|---------------|
| 1  | Alice | 90000  | 1             |
| 2  | Bob   | 85000  | 1             |
| 4  | Dave  | 95000  | 1             |

### 2.2 DISTINCT

Unique department_id from employees.

```sql
SELECT DISTINCT department_id FROM employee ORDER BY department_id;
```

**Output:** 1, 2 (HR has no employees in sample data).

### 2.3 ORDER BY

ASC, DESC; multiple columns.

```sql
SELECT name, salary FROM employee ORDER BY salary DESC, name ASC;
```

**Output:** Dave 95000, Alice 90000, Bob 85000, Eve 72000, Carol 70000, Frank 68000.

### 2.4 LIMIT (MySQL) vs FETCH / ROWNUM (Oracle)

First 5 employees by salary.

**MySQL:**

```sql
SELECT name, salary FROM employee ORDER BY salary DESC LIMIT 5;
```

**Oracle (12c+):**

```sql
SELECT name, salary FROM employee ORDER BY salary DESC FETCH FIRST 5 ROWS ONLY;
```

**Oracle (older, using ROWNUM):**

```sql
SELECT name, salary FROM (
  SELECT name, salary, ROWNUM rn FROM (
    SELECT name, salary FROM employee ORDER BY salary DESC
  ) WHERE ROWNUM <= 5
);
```

**Output:** Top 5 rows: Dave, Alice, Bob, Eve, Carol.

### 2.5 Aggregate functions: COUNT, SUM, AVG, MIN, MAX

With GROUP BY department_id.

```sql
SELECT department_id,
       COUNT(*) AS emp_count,
       SUM(salary) AS total_sal,
       AVG(salary) AS avg_sal,
       MIN(salary) AS min_sal,
       MAX(salary) AS max_sal
FROM employee
GROUP BY department_id;
```

**Output:**

| department_id | emp_count | total_sal | avg_sal | min_sal | max_sal |
|---------------|-----------|-----------|---------|---------|---------|
| 1             | 3         | 270000    | 90000   | 85000   | 95000   |
| 2             | 3         | 210000    | 70333   | 68000   | 72000   |

### 2.6 GROUP BY and HAVING

**Why HAVING is used:** WHERE filters **rows** before aggregation. HAVING filters **groups** after GROUP BY and aggregation. You cannot use aggregate functions (e.g. COUNT, SUM) in WHERE, because those values exist only per group. So to filter by “departments with more than 2 employees” you use HAVING COUNT(*) > 2.

**Rule: GROUP BY and SELECT** – In standard SQL, every column in SELECT must either (1) appear in GROUP BY, or (2) be inside an aggregate (COUNT, SUM, AVG, MIN, MAX, etc.). Otherwise the DB cannot know which value to show per group. Example: `SELECT department_id, COUNT(*) ... GROUP BY department_id` is valid; `SELECT name, COUNT(*) ... GROUP BY department_id` is invalid (name is not in GROUP BY and not aggregated).

Departments with more than 2 employees:

```sql
SELECT department_id, COUNT(*) AS cnt
FROM employee
GROUP BY department_id
HAVING COUNT(*) > 2;
```

**Output:** department_id 1 (cnt 3), department_id 2 (cnt 3).

### 2.7 CASE / WHEN

Salary band as a conditional column.

```sql
SELECT name, salary,
  CASE
    WHEN salary >= 90000 THEN 'High'
    WHEN salary >= 70000 THEN 'Mid'
    ELSE 'Low'
  END AS salary_band
FROM employee
ORDER BY salary DESC;
```

**Output:** Dave High, Alice High, Bob Mid, Eve Mid, Carol Mid, Frank Low.

---

## 3. Join operations

### 3.1 INNER JOIN

Employees with department name.

```sql
SELECT e.id, e.name, e.salary, d.name AS dept_name
FROM employee e
INNER JOIN department d ON e.department_id = d.id
ORDER BY e.salary DESC;
```

**Output:** Each employee row with dept_name (Engineering or Sales).

### 3.2 LEFT JOIN

All departments with employee count (including 0).

```sql
SELECT d.id, d.name, COUNT(e.id) AS emp_count
FROM department d
LEFT JOIN employee e ON d.id = e.department_id
GROUP BY d.id, d.name;
```

**Output:** Engineering 3, Sales 3, HR 0.

### 3.3 RIGHT JOIN

All employees and their department (right = employee if we flip; usually LEFT is preferred for “all from left”).

```sql
SELECT e.name, d.name AS dept_name
FROM department d
RIGHT JOIN employee e ON d.id = e.department_id;
```

**Output:** All 6 employees with dept_name.

### 3.4 FULL OUTER JOIN

**Oracle (native):**

```sql
SELECT e.name, d.name AS dept_name
FROM employee e
FULL OUTER JOIN department d ON e.department_id = d.id;
```

**MySQL (workaround with UNION):**

```sql
SELECT e.name, d.name AS dept_name
FROM employee e
LEFT JOIN department d ON e.department_id = d.id
UNION
SELECT NULL, d.name
FROM department d
LEFT JOIN employee e ON d.id = e.department_id
WHERE e.id IS NULL;
```

### 3.5 CROSS JOIN

Every employee with every department (rare; use for combinations).

```sql
SELECT e.name, d.name AS dept_name FROM employee e CROSS JOIN department d;
```

**Output:** 6 × 3 = 18 rows.

### 3.6 SELF JOIN

Employee and their manager (using manager_id).

```sql
SELECT e.name AS employee, m.name AS manager
FROM employee e
LEFT JOIN employee m ON e.manager_id = m.id
ORDER BY e.name;
```

**Output:** Alice NULL, Bob Alice, Carol NULL, Dave Alice, Eve Carol, Frank Carol.

---

## 4. Ranking and window functions

**Note:** MySQL 8+ and Oracle support window functions with the same standard syntax.

### 4.1 ROW_NUMBER, RANK, DENSE_RANK

Rank employees by salary within department.

```sql
SELECT name, department_id, salary,
  ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn,
  RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) AS rk,
  DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dr
FROM employee
ORDER BY department_id, salary DESC;
```

**Output (sample):** In dept 1: Dave 1,1,1; Alice 2,2,2; Bob 3,3,3. In dept 2: Eve 1,1,1; Carol 2,2,2; Frank 3,3,3. (RANK and DENSE_RANK differ when there are ties.)

### 4.2 NTILE

Divide employees into 2 buckets by salary.

```sql
SELECT name, salary, NTILE(2) OVER (ORDER BY salary DESC) AS bucket
FROM employee;
```

**Output:** First 3 rows bucket 1, next 3 bucket 2.

---

## 5. Subqueries

### 5.1 Scalar subquery

Employee(s) with maximum salary.

```sql
SELECT name, salary FROM employee
WHERE salary = (SELECT MAX(salary) FROM employee);
```

**Output:** Dave, 95000.

### 5.2 IN subquery

Employees in departments located in 'NY'.

```sql
SELECT e.name, e.salary FROM employee e
WHERE e.department_id IN (SELECT id FROM department WHERE location = 'NY');
```

**Output:** Alice, Bob, Dave (Engineering is in NY).

### 5.3 EXISTS

Departments that have at least one employee.

```sql
SELECT d.id, d.name FROM department d
WHERE EXISTS (SELECT 1 FROM employee e WHERE e.department_id = d.id);
```

**Output:** Engineering, Sales.

### 5.4 Correlated subquery

Employees earning more than their department average.

```sql
SELECT e.name, e.salary, e.department_id
FROM employee e
WHERE e.salary > (
  SELECT AVG(e2.salary) FROM employee e2 WHERE e2.department_id = e.department_id
);
```

**Output:** Dave (95000 > 90000), Carol (70000 > 70333 approx – adjust data if needed so exactly “above avg” for clarity), etc.

---

## 6. Procedures (and functions)

**Procedure vs function:** A **stored procedure** performs actions and can return result sets via OUT parameters or cursors; it does not return a single value like a function. A **function** returns a scalar or table value and is used in expressions.

### 6.1 MySQL: Get employees by department_id

```sql
DELIMITER //
CREATE PROCEDURE GetEmployeesByDept(IN p_dept_id INT)
BEGIN
  SELECT id, name, salary, department_id
  FROM employee
  WHERE department_id = p_dept_id
  ORDER BY salary DESC;
END //
DELIMITER ;

-- Call:
CALL GetEmployeesByDept(1);
```

**Output:** All employees in department 1.

### 6.2 Oracle: Get employees by department_id (OUT cursor)

```sql
CREATE OR REPLACE PROCEDURE GetEmployeesByDept(
  p_dept_id IN employee.department_id%TYPE,
  p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
  OPEN p_cursor FOR
    SELECT id, name, salary, department_id
    FROM employee
    WHERE department_id = p_dept_id
    ORDER BY salary DESC;
END;
/

-- Call from SQL*Plus or app: bind p_cursor and fetch from it.
```

---

## 7. DELETE vs TRUNCATE

| Aspect        | DELETE                    | TRUNCATE                |
|---------------|---------------------------|-------------------------|
| Scope         | Can delete specific rows (WHERE) | Entire table only       |
| Triggers      | Fire                      | Usually do not fire     |
| Rollback      | Possible (in transaction) | Depends on DB; in Oracle often not rollbackable |
| Identity/seq  | Does not reset            | Resets (e.g. AUTO_INCREMENT, sequence) |
| Speed         | Slower (row-by-row log)   | Faster (deallocates data) |
| Locking       | Row-level                 | Table-level (DDL in Oracle) |

**Examples:**

```sql
-- Delete one row
DELETE FROM employee WHERE id = 1;

-- Truncate entire table (no WHERE; use with caution)
TRUNCATE TABLE employee;   -- MySQL
TRUNCATE TABLE employee;   -- Oracle (DDL, commits implicitly in many setups)
```

---

## 8. Partition and index

### 8.1 Partition

**What it is:** A table is split into physical segments (partitions) by a key (range, list, or hash). Queries that filter by the partition key can prune partitions and improve performance. Useful for large tables and range-based maintenance (e.g. drop old partition by date).

**When to use:** Large table; queries filter by partition column (e.g. hire_date); archival (drop partition for old data).

**Example – range partition by hire_date (MySQL):**

```sql
CREATE TABLE employee_part (
  id INT, name VARCHAR(100), salary DECIMAL(10,2), department_id INT, hire_date DATE,
  PRIMARY KEY (id, hire_date)
)
PARTITION BY RANGE (YEAR(hire_date)) (
  PARTITION p2018 VALUES LESS THAN (2019),
  PARTITION p2019 VALUES LESS THAN (2020),
  PARTITION p2020 VALUES LESS THAN (2021),
  PARTITION p2021 VALUES LESS THAN (2022),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**Oracle (range):**

```sql
CREATE TABLE employee_part (
  id NUMBER, name VARCHAR2(100), salary NUMBER(10,2), department_id NUMBER, hire_date DATE,
  PRIMARY KEY (id, hire_date)
)
PARTITION BY RANGE (hire_date) (
  PARTITION p2018 VALUES LESS THAN (DATE '2019-01-01'),
  PARTITION p2019 VALUES LESS THAN (DATE '2020-01-01'),
  PARTITION p_future VALUES LESS THAN (MAXVALUE)
);
```

### 8.2 Index

**What it is:** A structure (typically B-tree) that speeds up lookups on one or more columns.

**Why indexes are used:** Without an index, the database must do a **full table scan** (read every row) to find rows matching a WHERE, JOIN, or ORDER BY. An index stores sorted (or hash) keys and pointers to rows, so the engine can locate matching rows in O(log n) or O(1) time instead of scanning the whole table. That reduces I/O and CPU and improves **read** performance. Indexes are used for: fast lookups (WHERE column = value), range scans (WHERE column BETWEEN), joins (ON column), and sorted output (ORDER BY column).

**When to use:** Columns in WHERE, JOIN, ORDER BY. **When to avoid:** Very small tables; columns with few distinct values (low selectivity); heavy write workload without read benefit (each insert/update must maintain the index).

**Examples:**

```sql
-- Single column
CREATE INDEX idx_emp_dept ON employee(department_id);
CREATE INDEX idx_emp_salary ON employee(salary);

-- Composite (e.g. for WHERE dept + ORDER BY salary)
CREATE INDEX idx_emp_dept_sal ON employee(department_id, salary);
```

**MySQL / Oracle:** Syntax same for basic B-tree index; check DB docs for partial/function-based indexes.

### 8.3 Database performance: read and write

**Improving read performance:**

- **Indexes:** Add indexes on columns used in WHERE, JOIN, and ORDER BY; use composite indexes when queries filter/sort by multiple columns (left prefix matters in B-tree).
- **Query tuning:** Avoid SELECT \*; use covering indexes where possible; reduce unnecessary JOINs and subqueries; use EXPLAIN/execution plans to find full scans and missing indexes.
- **Connection pooling:** Reuse connections instead of opening a new one per request; reduces connection overhead.
- **Caching:** Application-level cache (e.g. Redis) or query result cache for hot, read-heavy data.
- **Read replicas:** Offload read traffic to replicas; master handles writes.

**Improving write performance:**

- **Batch inserts/updates:** Use bulk INSERT/UPDATE instead of row-by-row in a loop; fewer round-trips and transaction commits.
- **Minimize indexes on write-heavy tables:** Each index adds cost on INSERT/UPDATE/DELETE; keep only indexes that clearly help reads.
- **Avoid unnecessary triggers and constraints** on hot write paths if they are not required.
- **Partitioning:** Can improve write throughput by spreading data and reducing lock contention (e.g. partition by date).

**Principles to follow:**

- **Normalization:** Avoid redundant data; reduce update anomalies; denormalize only when read performance justifies it and you manage consistency.
- **Index strategy:** Index for actual query patterns; measure with EXPLAIN and slow-query logs; avoid over-indexing on write-heavy tables.
- **Transaction scope:** Keep transactions short; do not hold connections during external I/O or user input.
- **Connection and connection pooling:** Use a pool with sensible min/max size; avoid leaking connections.
- **Monitor and measure:** Use slow-query logs, execution plans, and metrics (throughput, latency) to guide tuning.

---

## 9. Interview Q&A (11+ years)

### Q1: Second-highest salary by department_id

**Answer:** Use DENSE_RANK (or subquery: second MAX per department).

**Using DENSE_RANK (MySQL 8 / Oracle):**

```sql
SELECT name, department_id, salary
FROM (
  SELECT name, department_id, salary,
         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dr
  FROM employee
) t
WHERE dr = 2;
```

**Output:** Second-highest in each department: e.g. Alice (dept 1), Carol (dept 2).

**Using subquery (no window; works everywhere):**

```sql
SELECT e.name, e.department_id, e.salary
FROM employee e
WHERE e.salary = (
  SELECT MAX(e2.salary) FROM employee e2
  WHERE e2.department_id = e.department_id
  AND e2.salary < (SELECT MAX(salary) FROM employee WHERE department_id = e.department_id)
);
```

### Q2: N+1 problem – what is it and how to solve?

**What it is:** One query loads a list (e.g. departments); then N queries (one per row) load a related collection (e.g. employees per department). Total 1 + N queries.

**Solutions:**

1. **Single query with JOIN:** Load departments and employees in one query; build the object graph in code or use a ResultSet mapper.
2. **Batch fetch (IN clause):** After loading departments, load all employees for those department IDs in one query: `SELECT * FROM employee WHERE department_id IN (1, 2, 3)`.
3. **JOIN FETCH in JPA:** `SELECT d FROM Department d LEFT JOIN FETCH d.employees` so employees are loaded in the same query.

**Pseudo-SQL for “all departments with employees”:**

```sql
SELECT d.id, d.name, e.id AS emp_id, e.name AS emp_name
FROM department d
LEFT JOIN employee e ON e.department_id = d.id
ORDER BY d.id, e.id;
```

### Q3: Get nth row (e.g. 5th highest salary)

**MySQL:**

```sql
SELECT name, salary FROM employee ORDER BY salary DESC LIMIT 1 OFFSET 4;
```

**Oracle (12c+):**

```sql
SELECT name, salary FROM employee ORDER BY salary DESC OFFSET 4 ROWS FETCH NEXT 1 ROW ONLY;
```

**Using ROW_NUMBER (both):**

```sql
SELECT name, salary FROM (
  SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn FROM employee
) t WHERE rn = 5;
```

### Q4: DELETE vs TRUNCATE

See **§7**. Summary: DELETE is row-wise, supports WHERE, triggers fire, rollback; TRUNCATE is full-table, no WHERE, resets identity, faster, often DDL.

### Q5: When to use an index?

Use on columns used in WHERE, JOIN conditions, and ORDER BY. Avoid on very small tables or when writes dominate and reads do not benefit. Consider composite index for (dept_id, salary) when filtering by dept and sorting by salary.

### Q6: When to use partition?

Use for large tables when queries filter by partition key (e.g. date range) or when you need to maintain/archive by dropping or moving partitions (e.g. drop last year’s partition).

---

## 10. Quick reference tables

### 10.1 SQL keyword summary

| Keyword / Clause | Purpose | Example (one line) |
|------------------|---------|--------------------|
| SELECT          | Choose columns | SELECT name, salary FROM employee |
| FROM            | Source table(s) | FROM employee e |
| WHERE           | Filter rows | WHERE department_id = 1 |
| DISTINCT        | Unique values | SELECT DISTINCT department_id |
| ORDER BY        | Sort | ORDER BY salary DESC |
| GROUP BY        | Aggregate by key | GROUP BY department_id |
| HAVING          | Filter groups | HAVING COUNT(*) > 2 |
| LIMIT / FETCH   | Top n rows | LIMIT 5 / FETCH FIRST 5 ROWS ONLY |
| COUNT/SUM/AVG/MIN/MAX | Aggregates | COUNT(*), MAX(salary) |
| CASE WHEN       | Conditional expression | CASE WHEN salary >= 90k THEN 'High' |
| JOIN            | Combine tables | INNER JOIN department d ON e.department_id = d.id |

### 10.2 Join types

| Join type   | Description | When to use |
|------------|-------------|-------------|
| INNER JOIN | Rows matching in both | Default when you only want matches |
| LEFT JOIN  | All left + matching right | Keep all from left (e.g. all departments, count employees) |
| RIGHT JOIN | All right + matching left | Keep all from right; often rewritten as LEFT |
| FULL OUTER | All from both, match where exists | Need “all from both” (Oracle native; MySQL via UNION) |
| CROSS JOIN | Cartesian product | All combinations (rare) |
| SELF JOIN  | Table joined to itself | Hierarchy (e.g. employee → manager) |

### 10.3 MySQL vs Oracle (selected differences)

| Feature | MySQL | Oracle |
|---------|--------|--------|
| Limit rows | LIMIT n OFFSET m | FETCH FIRST n ROWS ONLY OFFSET m ROWS (12c+); or ROWNUM in subquery |
| Auto-increment | AUTO_INCREMENT | SEQUENCE + trigger or IDENTITY (12c+) |
| String concat | CONCAT(a, b) | a \|\| b or CONCAT(a, b) |
| Top n | LIMIT n | FETCH FIRST n ROWS ONLY or ROWNUM |
| Procedure result set | SELECT in procedure; CALL returns result set | OUT SYS_REFCURSOR; client fetches |
| Default date | CURRENT_DATE, NOW() | SYSDATE, CURRENT_DATE |
| TRUNCATE | TRUNCATE TABLE t; | TRUNCATE TABLE t; (DDL) |

---

All examples in this guide use the **Employee** and **Department** schema defined in §1.1. For more on list/map usage in Java with data from DBs, see [JAVA_LIST_GUIDE.md](JAVA_LIST_GUIDE.md) and [JAVA_HASHMAP_GUIDE.md](JAVA_HASHMAP_GUIDE.md).
