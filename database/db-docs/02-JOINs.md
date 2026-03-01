# Part 2: JOINs — Complete Reference

JOINs combine rows from two or more tables based on a related column. Master these for any relational database role.

**Input data:** [00-Sample-Data.md](00-Sample-Data.md) (employees, departments, orders, order_items, products, customers).

---

## 2.1 INNER JOIN

Returns only rows where there is a match in **both** tables.

**Syntax:**
```sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;
```

**Example — Employees with their department:**

**Input:** `employees`, `departments` (sample data). Employee 9 (Ivy) has dept_id NULL, so she is excluded.

**Query:**
```sql
SELECT e.emp_id, e.emp_name, e.salary, d.dept_name, d.location
FROM employees e
INNER JOIN departments d ON e.dept_id = d.dept_id;
```

**Output:**

| emp_id | emp_name | salary | dept_name | location |
|--------|----------|--------|-----------|----------|
| 1 | Alice | 95000 | Sales | NYC |
| 2 | Bob | 72000 | Sales | NYC |
| 3 | Carol | 68000 | Sales | NYC |
| 4 | David | 88000 | IT | Boston |
| 5 | Eve | 55000 | IT | Boston |
| 6 | Frank | 55000 | IT | Boston |
| 7 | Grace | 82000 | HR | Chicago |
| 8 | Henry | 48000 | HR | Chicago |

(8 rows; Ivy excluded.)

---

**Example — Orders with customer and items:**

**Input:** `orders`, `customers`, `order_items`.

**Query:**
```sql
SELECT o.order_id, o.order_date, c.customer_name, oi.quantity, oi.unit_price
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id;
```

**Output:** One row per order item, with order date and customer name, e.g.:

| order_id | order_date | customer_name | quantity | unit_price |
|----------|------------|---------------|----------|------------|
| 101 | 2024-01-05 | Acme Corp | 2 | 50.00 |
| 101 | 2024-01-05 | Acme Corp | 1 | 150.00 |
| 102 | 2024-02-10 | Acme Corp | 3 | 60.00 |
| 103 | 2024-01-15 | Beta Inc | 1 | 1200.00 |
| 104 | 2024-03-01 | Gamma LLC | 1 | 95.00 |
| 105 | 2024-03-12 | Beta Inc | 5 | 90.00 |

(6 rows.)

---

**Example — Multiple conditions in ON:**

**Input:** `employees` (self-join). Only employees with a manager in the same department match.

**Query:**
```sql
SELECT e.emp_name, m.emp_name AS manager_name
FROM employees e
INNER JOIN employees m ON e.manager_id = m.emp_id AND e.dept_id = m.dept_id;
```

**Output:**

| emp_name | manager_name |
|----------|--------------|
| Bob | Alice |
| Carol | Alice |
| Eve | David |
| Frank | David |
| Henry | Grace |

(5 rows.)

---

## 2.2 LEFT JOIN (LEFT OUTER JOIN)

Returns **all** rows from the left table and matching rows from the right. Non-matches get NULL on the right.

**Syntax:**
```sql
SELECT columns
FROM table1
LEFT JOIN table2 ON table1.column = table2.column;
```

**Example — All employees, with department if exists:**

**Input:** `employees`, `departments`.

**Query:**
```sql
SELECT e.emp_id, e.emp_name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id;
```

**Output:** 9 rows. First 8 have dept_name; row for Ivy has dept_name NULL.

| emp_id | emp_name | dept_name |
|--------|----------|-----------|
| 1 | Alice | Sales |
| … | … | … |
| 9 | Ivy | NULL |

---

**Example — Find employees without a department:**

**Query:**
```sql
SELECT e.emp_id, e.emp_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id
WHERE d.dept_id IS NULL;
```

**Output:**

| emp_id | emp_name |
|--------|----------|
| 9 | Ivy |

---

**Example — All customers and their order count (including zero orders):**

**Input:** `customers`, `orders`. Customer 4 has no orders.

**Query:**
```sql
SELECT c.customer_id, c.customer_name, COUNT(o.order_id) AS order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name;
```

**Output:**

| customer_id | customer_name | order_count |
|-------------|---------------|-------------|
| 1 | Acme Corp | 2 |
| 2 | Beta Inc | 2 |
| 3 | Gamma LLC | 1 |
| 4 | Delta Co | 0 |

---

## 2.3 RIGHT JOIN (RIGHT OUTER JOIN)

Returns all rows from the **right** table and matching rows from the left. (Less common; often rewritten as LEFT JOIN by swapping tables.)

**Input:** `employees`, `departments`.

**Query:**
```sql
SELECT e.emp_name, d.dept_name
FROM departments d
RIGHT JOIN employees e ON e.dept_id = d.dept_id;
-- Same as: FROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id
```

**Output:** Same as LEFT JOIN above — 9 rows; Ivy has dept_name NULL.

---

## 2.4 FULL OUTER JOIN

Returns all rows from both tables. Matches are combined; non-matches get NULL on the other side.  
*(MySQL does not support FULL OUTER JOIN; use UNION of LEFT and RIGHT or emulate with UNION.)*

**Input:** `employees`, `departments`. One employee (Ivy) has no dept; all departments have employees.

**Query (PostgreSQL / SQL Server):**
```sql
SELECT e.emp_name, d.dept_name
FROM employees e
FULL OUTER JOIN departments d ON e.dept_id = d.dept_id;
```

**Output:** 9 rows from employees (Ivy with dept_name NULL); no “orphan” departments in this sample, so no extra department-only rows.

---

**MySQL workaround:**
```sql
SELECT e.emp_name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.dept_id
UNION
SELECT e.emp_name, d.dept_name
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.dept_id;
```

---

## 2.5 CROSS JOIN

Cartesian product: every row of table1 with every row of table2. No ON clause.

**Input:** `employees` (9 rows), `departments` (3 rows).

**Query:**
```sql
SELECT e.emp_name, d.dept_name
FROM employees e
CROSS JOIN departments d;
```

**Output:** 9 × 3 = 27 rows (every employee paired with every department).

---

**Use case — Generate date series or combinations:**

**Query:**
```sql
SELECT a.id, b.id
FROM (SELECT 1 AS id UNION SELECT 2 UNION SELECT 3) a
CROSS JOIN (SELECT 1 AS id UNION SELECT 2) b;
```

**Output:** 6 rows: (1,1), (1,2), (2,1), (2,2), (3,1), (3,2).

---

## 2.6 SELF JOIN

A table is joined to itself (usually with different aliases). Common for hierarchies (e.g. employee → manager).

**Example — Employee and manager:**

**Input:** `employees` (self-join).

**Query:**
```sql
SELECT e.emp_name AS employee, m.emp_name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id;
```

**Output:** 9 rows. Alice, David, Grace, Ivy have manager NULL; others show manager name (e.g. Bob → Alice).

---

**Example — Find employees earning more than their manager:**

**Query:**
```sql
SELECT e.emp_name, e.salary AS emp_sal, m.salary AS mgr_sal
FROM employees e
INNER JOIN employees m ON e.manager_id = m.emp_id
WHERE e.salary > m.salary;
```

**Output:** No rows in sample (no subordinate earns more than manager). With different data you’d see (emp_name, emp_sal, mgr_sal).

---

**Example — Find colleagues (same department):**

**Query:**
```sql
SELECT a.emp_name, b.emp_name AS colleague
FROM employees a
INNER JOIN employees b ON a.dept_id = b.dept_id AND a.emp_id < b.emp_id;
```

**Output:** Pairs: (Bob, Carol), (Eve, Frank), etc. — one row per pair to avoid duplicates.

---

## 2.7 Join with USING (when column names match)

When join keys have the same name in both tables:

**Input:** `employees`, `departments`.

**Query:**
```sql
SELECT e.emp_name, d.dept_name
FROM employees e
INNER JOIN departments d USING (dept_id);
```

**Output:** Same as INNER JOIN example in 2.1 — 8 rows (emp_name, dept_name).

---

## 2.8 Natural JOIN

Database matches columns with the same name. **Use with caution** — can cause unexpected matches.

**Input:** `employees`, `departments` (shared column: dept_id).

**Query:**
```sql
SELECT * FROM employees NATURAL JOIN departments;
```

**Output:** Same as INNER JOIN on dept_id — 8 rows; one dept_id column.

---

## 2.9 Join with Subquery

**Input:** `employees`. Subquery returns (dept_id, avg_sal) per department.

**Query:**
```sql
SELECT e.emp_name, sub.avg_sal
FROM employees e
INNER JOIN (
    SELECT dept_id, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY dept_id
) sub ON e.dept_id = sub.dept_id
WHERE e.salary > sub.avg_sal;
```

**Output:** Employees earning above their department average, e.g. Alice, David, Grace (above avg); Bob, Carol, Eve, Frank, Henry (below avg) excluded. Exact rows depend on AVG per dept.

---

## 2.10 Anti-Join (NOT IN / NOT EXISTS / LEFT JOIN ... NULL)

**Rows in A that have no match in B.**

**Using LEFT JOIN + NULL:**

**Input:** `customers`, `orders`. Customer 4 (Delta Co) has no orders.

**Query:**
```sql
SELECT c.*
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id IS NULL;
```

**Output:**

| customer_id | customer_name | city | country |
|-------------|---------------|-----|---------|
| 4 | Delta Co | NYC | USA |

---

**Using NOT EXISTS:** (same input)

**Query:**
```sql
SELECT c.*
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id
);
```

**Output:** Same — customer 4 only.

---

**Using NOT IN:** (same input)

**Query:**
```sql
SELECT * FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL);
```

**Output:** Same — customer 4 only.

---

## 2.11 Semi-Join (EXISTS / IN)

**Rows in A that have at least one match in B.**

**Input:** `customers`, `orders`.

**Query:**
```sql
SELECT c.*
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id
);
```

**Output:** Customers 1 (Acme), 2 (Beta), 3 (Gamma) — those who have at least one order. Customer 4 excluded.

---

## Summary Table

| Join Type      | Returns                                              |
|----------------|------------------------------------------------------|
| INNER JOIN     | Only matching rows from both tables                  |
| LEFT JOIN      | All left + matching right (NULL where no match)      |
| RIGHT JOIN     | All right + matching left                            |
| FULL OUTER     | All from both (NULL where no match)                  |
| CROSS JOIN     | Every combination of rows                            |
| SELF JOIN      | Same table with different aliases                    |

---

**Next:** [03-GROUP-BY-and-Aggregations.md](03-GROUP-BY-and-Aggregations.md) — GROUP BY
