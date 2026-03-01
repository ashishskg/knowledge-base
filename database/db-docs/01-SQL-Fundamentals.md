# Relational Database Documentation — 15 Years Experience

## Part 1: SQL Fundamentals

This document covers core SQL concepts used in relational databases (MySQL, PostgreSQL, SQL Server, Oracle).

**Input data:** All examples use the sample tables from [00-Sample-Data.md](00-Sample-Data.md).

---

### 1.1 Sample Schema (Used Throughout)

```sql
-- Employees
CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(100),
    dept_id INT,
    manager_id INT,
    hire_date DATE,
    salary DECIMAL(10,2)
);

-- Departments
CREATE TABLE departments (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100),
    location VARCHAR(100)
);

-- Orders
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(20)
);

-- Order Items
CREATE TABLE order_items (
    item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10,2)
);

-- Products
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    category_id INT,
    unit_price DECIMAL(10,2)
);

-- Customers
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100)
);
```

---

### 1.2 Basic SELECT

**Input:** Table `employees` — see [00-Sample-Data.md](00-Sample-Data.md).

**Query:**
```sql
-- All columns
SELECT * FROM employees;
```
**Output:**

| emp_id | emp_name | dept_id | manager_id | hire_date  | salary |
|--------|----------|---------|------------|------------|--------|
| 1 | Alice | 10 | NULL | 2018-01-15 | 95000 |
| 2 | Bob | 10 | 1 | 2019-03-20 | 72000 |
| 3 | Carol | 10 | 1 | 2020-06-10 | 68000 |
| 4 | David | 20 | NULL | 2017-11-01 | 88000 |
| 5 | Eve | 20 | 4 | 2021-02-14 | 55000 |
| 6 | Frank | 20 | 4 | 2021-02-14 | 55000 |
| 7 | Grace | 30 | NULL | 2019-07-22 | 82000 |
| 8 | Henry | 30 | 7 | 2022-01-05 | 48000 |
| 9 | Ivy | NULL | NULL | 2023-04-01 | 45000 |

---

**Query:**
```sql
-- Specific columns
SELECT emp_id, emp_name, salary FROM employees;
```
**Output:**

| emp_id | emp_name | salary |
|--------|----------|--------|
| 1 | Alice | 95000 |
| 2 | Bob | 72000 |
| 3 | Carol | 68000 |
| 4 | David | 88000 |
| 5 | Eve | 55000 |
| 6 | Frank | 55000 |
| 7 | Grace | 82000 |
| 8 | Henry | 48000 |
| 9 | Ivy | 45000 |

---

**Query:**
```sql
-- With alias
SELECT emp_name AS name, salary * 12 AS annual_salary FROM employees;
```
**Output:**

| name | annual_salary |
|------|---------------|
| Alice | 1140000 |
| Bob | 864000 |
| Carol | 816000 |
| David | 1056000 |
| Eve | 660000 |
| Frank | 660000 |
| Grace | 984000 |
| Henry | 576000 |
| Ivy | 540000 |

---

**Query:**
```sql
-- DISTINCT
SELECT DISTINCT dept_id FROM employees;
```
**Output:**

| dept_id |
|---------|
| 10 |
| 20 |
| 30 |
| NULL |

---

**Query:**
```sql
-- Expressions
SELECT emp_name, salary, salary * 0.1 AS bonus FROM employees;
```
**Output:**

| emp_name | salary | bonus |
|----------|--------|-------|
| Alice | 95000 | 9500.00 |
| Bob | 72000 | 7200.00 |
| Carol | 68000 | 6800.00 |
| David | 88000 | 8800.00 |
| Eve | 55000 | 5500.00 |
| Frank | 55000 | 5500.00 |
| Grace | 82000 | 8200.00 |
| Henry | 48000 | 4800.00 |
| Ivy | 45000 | 4500.00 |

---

### 1.3 WHERE Clause

**Input:** Table `employees` — see [00-Sample-Data.md](00-Sample-Data.md).

**Query:**
```sql
-- Equality
SELECT * FROM employees WHERE dept_id = 10;
```
**Output:**

| emp_id | emp_name | dept_id | manager_id | hire_date  | salary |
|--------|----------|---------|------------|------------|--------|
| 1 | Alice | 10 | NULL | 2018-01-15 | 95000 |
| 2 | Bob | 10 | 1 | 2019-03-20 | 72000 |
| 3 | Carol | 10 | 1 | 2020-06-10 | 68000 |

---

**Query:**
```sql
-- Comparison
SELECT * FROM employees WHERE salary > 50000;
```
**Output:** All rows except Henry (48000) and Ivy (45000) — 7 rows.

---

**Query:**
```sql
SELECT * FROM employees WHERE hire_date >= '2020-01-01';
```
**Output:** Carol, Eve, Frank, Henry, Ivy — 5 rows (hire_date 2020 or later).

---

**Query:**
```sql
-- IN
SELECT * FROM employees WHERE dept_id IN (10, 20, 30);
```
**Output:** All employees except Ivy (dept_id NULL) — 8 rows.

---

**Query:**
```sql
-- BETWEEN
SELECT * FROM employees WHERE salary BETWEEN 40000 AND 60000;
```
**Output:** Eve (55000), Frank (55000), Henry (48000), Ivy (45000) — 4 rows.

---

**Query:**
```sql
-- LIKE
SELECT * FROM employees WHERE emp_name LIKE 'J%';
```
**Output:** No rows (no names start with J in sample data).

**Query:**
```sql
SELECT * FROM employees WHERE emp_name LIKE '%son';
```
**Output:** No rows. *(Example: with name "Johnson" you’d get that row.)*

---

**Query:**
```sql
-- NULL
SELECT * FROM employees WHERE manager_id IS NULL;
```
**Output:** Alice, David, Grace, Ivy — 4 rows.

**Query:**
```sql
SELECT * FROM employees WHERE manager_id IS NOT NULL;
```
**Output:** Bob, Carol, Eve, Frank, Henry — 5 rows.

---

**Query:**
```sql
-- AND / OR
SELECT * FROM employees WHERE dept_id = 10 AND salary > 50000;
```
**Output:** Alice (95000), Bob (72000), Carol (68000) — 3 rows.

**Query:**
```sql
SELECT * FROM employees WHERE dept_id = 10 OR dept_id = 20;
```
**Output:** All in Sales (10) or IT (20) — 6 rows.

---

### 1.4 ORDER BY

**Input:** Table `employees` — see [00-Sample-Data.md](00-Sample-Data.md).

**Query:**
```sql
-- Single column ASC (default)
SELECT * FROM employees ORDER BY emp_name;
```
**Output:** Rows in name order: Alice, Bob, Carol, David, Eve, Frank, Grace, Henry, Ivy.

---

**Query:**
```sql
-- DESC
SELECT * FROM employees ORDER BY salary DESC;
```
**Output:** Alice (95000), David (88000), Grace (82000), Bob (72000), Carol (68000), Eve (55000), Frank (55000), Henry (48000), Ivy (45000).

---

**Query:**
```sql
-- Multiple columns
SELECT * FROM employees ORDER BY dept_id ASC, salary DESC;
```
**Output:** By dept_id (10, 20, 30, NULL), then by salary DESC within each dept.

---

**Query:**
```sql
-- By expression
SELECT emp_name, salary FROM employees ORDER BY salary * 12 DESC;
```
**Output:** Same order as salary DESC (annual salary order).

---

**Query:**
```sql
-- NULLS FIRST/LAST (PostgreSQL)
SELECT * FROM employees ORDER BY manager_id NULLS LAST;
```
**Output:** Rows with manager_id first, then NULLs last.

---

### 1.5 LIMIT / OFFSET (Pagination)

**Input:** Table `employees` (9 rows) — see [00-Sample-Data.md](00-Sample-Data.md).

**Query:**
```sql
-- Top N
SELECT * FROM employees ORDER BY salary DESC LIMIT 10;
```
**Output:** All 9 rows (fewer than 10), ordered by salary DESC.

---

**Query:**
```sql
-- Pagination: page 2, 10 per page
SELECT * FROM employees ORDER BY emp_id LIMIT 10 OFFSET 10;
```
**Output:** Empty (only 9 rows; offset 10 skips all).

---

**Query:** *(SQL Server)*
```sql
SELECT * FROM employees ORDER BY emp_id OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;
```
**Output:** Empty for same reason.

---

### 1.6 Aggregate Functions

**Input:** Table `employees` (9 rows) — see [00-Sample-Data.md](00-Sample-Data.md).

**Query:**
```sql
SELECT COUNT(*) FROM employees;
```
**Output:**

| count |
|-------|
| 9 |

---

**Query:**
```sql
SELECT COUNT(manager_id) FROM employees;  -- excludes NULLs
```
**Output:** 5 (only non-NULL manager_id).

---

**Query:**
```sql
SELECT COUNT(DISTINCT dept_id) FROM employees;
```
**Output:** 4 (10, 20, 30, NULL).

---

**Query:**
```sql
SELECT SUM(salary) FROM employees;
```
**Output:** 615000.

---

**Query:**
```sql
SELECT AVG(salary) FROM employees;
```
**Output:** 68333.33… (615000/9).

---

**Query:**
```sql
SELECT MIN(salary), MAX(salary) FROM employees;
```
**Output:** 45000 | 95000.

---

**Next:** [02-JOINs.md](02-JOINs.md) — JOINs
