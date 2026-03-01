# Part 4: Subqueries and CTEs

**Input data:** [00-Sample-Data.md](00-Sample-Data.md).

---

## 4.1 Scalar Subquery (Single Value)

Returns one row and one column. Used in SELECT, WHERE, HAVING.

**Input:** `employees`. Company AVG(salary) = 615000/9 ≈ 68333.

**Query:**
```sql
-- Employees earning above company average
SELECT emp_name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```
**Output:** Rows with salary > 68333: Alice (95000), David (88000), Grace (82000), Bob (72000), Carol (68000) — 5 rows.

---

**Query:**
```sql
-- In SELECT
SELECT emp_name, salary,
       salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees;
```
**Output:** All 9 rows; extra column diff_from_avg = salary − 68333 (positive for above avg, negative for below).

---

## 4.2 Row Subquery (Single Row, Multiple Columns)

**Input:** `employees`. Subquery returns one (dept_id, MAX(salary)) — e.g. (10, 95000).

**Query:**
```sql
SELECT * FROM employees
WHERE (dept_id, salary) = (
    SELECT dept_id, MAX(salary) FROM employees GROUP BY dept_id LIMIT 1
);
```
**Output:** Depends on which group is first; typically one row (e.g. Alice in dept 10 with 95000). *Note: LIMIT 1 without ORDER BY is non-deterministic.*

---

## 4.3 IN / NOT IN with Subquery

**Input:** `employees`; then `customers`, `orders`.

**Query:**
```sql
-- Employees in departments that have more than 5 people
SELECT * FROM employees
WHERE dept_id IN (SELECT dept_id FROM employees GROUP BY dept_id HAVING COUNT(*) > 5);
```
**Output:** Empty (no department has > 5 employees).

---

**Query:**
```sql
-- Customers who never ordered
SELECT * FROM customers
WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL);
```
**Output:** Customer 4 (Delta Co) only.

---

## 4.4 EXISTS / NOT EXISTS

Often better for performance than IN when checking existence.

**Input:** `customers`, `orders`; then `departments`, `employees`.

**Query:**
```sql
-- Customers who have at least one order
SELECT * FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);
```
**Output:** Customers 1, 2, 3 (Acme, Beta, Gamma) — 3 rows.

---

**Query:**
```sql
-- Departments with no employees
SELECT * FROM departments d
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.dept_id);
```
**Output:** Empty (every department has at least one employee; Ivy has dept_id NULL so she’s not in any department row).

---

## 4.5 Correlated Subquery

References outer query. Runs once per row of outer query.

**Input:** `employees`. Dept 10 avg ≈ 78333, dept 20 = 66000, dept 30 = 65000.

**Query:**
```sql
-- Employees earning more than their department average
SELECT e.emp_name, e.salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(salary) FROM employees WHERE dept_id = e.dept_id
);
```
**Output:** Alice (95k > 78k), David (88k > 66k), Grace (82k > 65k). Excludes Ivy (NULL dept). Typically 3 rows.

---

## 4.6 Common Table Expressions (CTEs) — WITH

Named temporary result set for the duration of the query. Improves readability and supports recursion.

**Input:** `employees`.

**Query (Simple CTE):**
```sql
WITH dept_summary AS (
    SELECT dept_id, COUNT(*) AS cnt, AVG(salary) AS avg_sal
    FROM employees
    GROUP BY dept_id
)
SELECT e.emp_name, e.salary, d.avg_sal
FROM employees e
JOIN dept_summary d ON e.dept_id = d.dept_id
WHERE e.salary > d.avg_sal;
```
**Output:** Employees whose salary is above their department average (e.g. Alice, David, Grace) with their dept avg_sal.

---

**Input:** `orders`, `customers`. Orders with total_amount > 1000: order 103 (1200).

**Query:**
```sql
WITH high_value_orders AS (
    SELECT order_id, customer_id, total_amount
    FROM orders
    WHERE total_amount > 1000
),
customer_totals AS (
    SELECT customer_id, SUM(total_amount) AS total
    FROM high_value_orders
    GROUP BY customer_id
)
SELECT c.customer_name, ct.total
FROM customers c
JOIN customer_totals ct ON c.customer_id = ct.customer_id
ORDER BY ct.total DESC;
```
**Output:** Beta Inc | 1200 (only customer with an order > 1000).

---

## 4.7 Recursive CTE

For hierarchies (e.g. manager chain, tree paths).

**Input:** `employees`. Top-level: Alice (1), David (4), Grace (7); then their reports.

**Query:**
```sql
WITH RECURSIVE emp_hierarchy AS (
    -- Anchor: top-level managers
    SELECT emp_id, emp_name, manager_id, 1 AS level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: subordinates
    SELECT e.emp_id, e.emp_name, e.manager_id, h.level + 1
    FROM employees e
    JOIN emp_hierarchy h ON e.manager_id = h.emp_id
)
SELECT * FROM emp_hierarchy ORDER BY level, emp_id;
```
**Output:** Level 1: Alice, David, Grace, Ivy. Level 2: Bob, Carol (under Alice), Eve, Frank (under David), Henry (under Grace). 9 rows total.

---

**Next:** [05-Window-Functions.md](05-Window-Functions.md) — Window functions
