# Part 3: GROUP BY and Aggregations

GROUP BY collapses rows into groups and lets you apply aggregate functions per group. Essential for reporting and analytics.

**Input data:** [00-Sample-Data.md](00-Sample-Data.md).

---

## 3.1 Basic GROUP BY

**Rule:** Every non-aggregated column in SELECT must appear in GROUP BY.

**Input:** `employees` (sample data).

**Query:**
```sql
-- Count employees per department
SELECT dept_id, COUNT(*) AS emp_count
FROM employees
GROUP BY dept_id;
```
**Output:**

| dept_id | emp_count |
|---------|-----------|
| 10 | 3 |
| 20 | 3 |
| 30 | 2 |
| NULL | 1 |

---

**Query:**
```sql
-- Sum salary per department
SELECT dept_id, SUM(salary) AS total_salary, AVG(salary) AS avg_salary
FROM employees
GROUP BY dept_id;
```
**Output:**

| dept_id | total_salary | avg_salary |
|---------|--------------|------------|
| 10 | 235000 | 78333.33… |
| 20 | 198000 | 66000.00 |
| 30 | 130000 | 65000.00 |
| NULL | 45000 | 45000.00 |

---

**Query:**
```sql
-- With department name (join then group)
SELECT d.dept_name, COUNT(e.emp_id) AS emp_count, SUM(e.salary) AS total_sal
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id, d.dept_name;
```
**Output:**

| dept_name | emp_count | total_sal |
|-----------|-----------|-----------|
| Sales | 3 | 235000 |
| IT | 3 | 198000 |
| HR | 2 | 130000 |

---

## 3.2 HAVING — Filter on Aggregates

WHERE filters rows **before** grouping; HAVING filters **after** grouping.

**Input:** `employees`.

**Query:**
```sql
-- Departments with more than 5 employees
SELECT dept_id, COUNT(*) AS cnt
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 5;
```
**Output:** Empty (no department has more than 5 employees in sample data).

---

**Query:**
```sql
-- Departments where total salary > 500000
SELECT dept_id, SUM(salary) AS total
FROM employees
GROUP BY dept_id
HAVING SUM(salary) > 500000;
```
**Output:** Empty (max total_salary is 235000 for dept 10).

---

**Query:**
```sql
-- Combine WHERE and HAVING
SELECT dept_id, AVG(salary) AS avg_sal
FROM employees
WHERE hire_date >= '2020-01-01'
GROUP BY dept_id
HAVING AVG(salary) > 60000;
```
**Output:** Departments with 2020+ hires and avg salary (of those hires) > 60000. Sample data: dept 10 only (Carol 68000).

| dept_id | avg_sal   |
|---------|-----------|
| 10      | 68000.00  |

---

## 3.3 GROUP BY Multiple Columns

Creates one group per unique combination of the grouped columns.

**Input:** `employees`; then `orders`, `order_items`, `customers`, `products`.

**Query:**
```sql
-- Count by department and year hired
SELECT dept_id, EXTRACT(YEAR FROM hire_date) AS hire_year, COUNT(*) AS cnt
FROM employees
GROUP BY dept_id, EXTRACT(YEAR FROM hire_date);
```
**Output:** One row per (dept_id, year), e.g. (10, 2018, 1), (10, 2019, 1), (10, 2020, 1), (20, 2017, 1), (20, 2021, 2), (30, 2019, 1), (30, 2022, 1), (NULL, 2023, 1).

---

**Query:**
```sql
-- Sales by customer and product category
SELECT c.customer_id, p.category_id, SUM(oi.quantity * oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN customers c ON o.customer_id = c.customer_id
JOIN products p ON oi.product_id = p.product_id
GROUP BY c.customer_id, p.category_id;
```
**Output:** One row per (customer_id, category_id) with total revenue, e.g. (1, 1), (1, 2), (2, 1), (2, 2), (3, 1) with respective sums.

---

## 3.4 Aggregate Functions in Detail

| Function   | Purpose                    | Ignores NULL? |
|-----------|----------------------------|----------------|
| COUNT(*)  | Count all rows             | No             |
| COUNT(col)| Count non-NULL in col      | Yes            |
| SUM(col)  | Sum of values              | Yes            |
| AVG(col)  | Average                    | Yes            |
| MIN(col)  | Minimum                    | Yes            |
| MAX(col)  | Maximum                    | Yes            |

**Input:** `employees`.

**Query:**
```sql
-- COUNT variants
SELECT dept_id,
       COUNT(*) AS total_rows,
       COUNT(manager_id) AS has_manager,
       COUNT(DISTINCT manager_id) AS unique_managers
FROM employees
GROUP BY dept_id;
```
**Output (example):**

| dept_id | total_rows | has_manager | unique_managers |
|---------|------------|-------------|-----------------|
| 10 | 3 | 2 | 1 |
| 20 | 3 | 2 | 1 |
| 30 | 2 | 1 | 1 |
| NULL | 1 | 0 | 0 |

---

**Query (PostgreSQL):**
```sql
SELECT dept_id, STRING_AGG(emp_name, ', ' ORDER BY emp_name) AS employees
FROM employees
GROUP BY dept_id;
```
**Output (example):** dept 10 → "Alice, Bob, Carol"; dept 20 → "David, Eve, Frank"; dept 30 → "Grace, Henry"; NULL → "Ivy".

**Query (MySQL):** Use `GROUP_CONCAT(emp_name ORDER BY emp_name)` — same idea.

---

## 3.5 ROLLUP — Subtotals and Grand Total

Adds extra rows for subtotals and grand total (grouping sets).

**Input:** `employees`.

**Query:**
```sql
-- Subtotal per dept + grand total
SELECT dept_id, COUNT(*) AS cnt, SUM(salary) AS total_sal
FROM employees
GROUP BY ROLLUP(dept_id);
```
**Output:** One row per dept_id (10, 20, 30, NULL) with cnt and total_sal, plus one row with dept_id NULL for grand total (9, 615000).

---

**Query:**
```sql
-- Multiple dimensions
SELECT dept_id, EXTRACT(YEAR FROM hire_date) AS yr, COUNT(*)
FROM employees
GROUP BY ROLLUP(dept_id, EXTRACT(YEAR FROM hire_date));
```
**Output:** Rows per (dept_id, yr), subtotals per dept_id (yr NULL), and one grand total (both NULL).

---

## 3.6 CUBE — All Combinations

All possible grouping combinations (PostgreSQL, SQL Server; MySQL limited).

**Input:** `employees`.

**Query:**
```sql
SELECT dept_id, EXTRACT(YEAR FROM hire_date) AS yr, COUNT(*)
FROM employees
GROUP BY CUBE(dept_id, EXTRACT(YEAR FROM hire_date));
```
**Output:** Rows for (dept_id, yr), (dept_id only), (yr only), and () grand total.

---

## 3.7 GROUPING SETS — Explicit Sets

Specify exactly which grouping sets you want.

**Input:** `employees`.

**Query:**
```sql
SELECT dept_id, EXTRACT(YEAR FROM hire_date) AS yr, COUNT(*)
FROM employees
GROUP BY GROUPING SETS (
    (dept_id),
    (EXTRACT(YEAR FROM hire_date)),
    (dept_id, EXTRACT(YEAR FROM hire_date)),
    ()
);
```
**Output:** Union of: groups by dept_id only (yr NULL), by yr only (dept_id NULL), by (dept_id, yr), and one row for () grand total.

---

## 3.8 Conditional Aggregation (CASE inside SUM/COUNT)

**Input:** `employees`.

**Query:**
```sql
-- Count by condition
SELECT dept_id,
       COUNT(*) AS total,
       SUM(CASE WHEN salary > 50000 THEN 1 ELSE 0 END) AS high_earners,
       SUM(CASE WHEN hire_date >= '2020-01-01' THEN 1 ELSE 0 END) AS new_hire_count
FROM employees
GROUP BY dept_id;
```
**Output (example):** Each row: dept_id, total, count with salary>50000, count with hire_date>=2020. E.g. dept 10: total 3, high_earners 3, new_hire_count 1.

---

**Query:**
```sql
-- Pivot-like: sum of salary by salary band
SELECT dept_id,
       SUM(CASE WHEN salary < 40000 THEN salary ELSE 0 END) AS low_sal,
       SUM(CASE WHEN salary BETWEEN 40000 AND 70000 THEN salary ELSE 0 END) AS mid_sal,
       SUM(CASE WHEN salary > 70000 THEN salary ELSE 0 END) AS high_sal
FROM employees
GROUP BY dept_id;
```
**Output (example):** dept 10: low_sal 0, mid_sal 68000 (Carol), high_sal 167000 (Alice+Bob). dept 20: mid_sal 110000 (Eve+Frank), high_sal 88000 (David). etc.

---

## 3.9 Filtered Aggregates (FILTER clause — PostgreSQL, some others)

**Input:** `employees`.

**Query:**
```sql
SELECT dept_id,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE salary > 50000) AS high_earners,
       AVG(salary) FILTER (WHERE hire_date >= '2020-01-01') AS avg_sal_new_hire
FROM employees
GROUP BY dept_id;
```
**Output:** Same logical result as conditional aggregation above: total, high_earners count, avg salary of 2020+ hires per dept (NULL if none).

---

## 3.10 GROUP BY with JOINs — Common Patterns

**Input:** `customers`, `orders`, `order_items`; then `products`, `order_items`.

**Query:**
```sql
-- Revenue per customer
SELECT c.customer_id, c.customer_name, SUM(oi.quantity * oi.unit_price) AS revenue
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY c.customer_id, c.customer_name;
```
**Output:** One row per customer who has orders: customer_id, customer_name, total revenue (e.g. Acme ~430, Beta ~1650, Gamma 95).

---

**Query:**
```sql
-- Top products by quantity sold
SELECT p.product_name, SUM(oi.quantity) AS total_qty
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.product_name
ORDER BY total_qty DESC
LIMIT 10;
```
**Output:** Product names with total quantity (e.g. Widget A 2+3+5=10, Widget B 1+1=2, Gadget X 1).

---

**Next:** [04-Subqueries-and-CTEs.md](04-Subqueries-and-CTEs.md) — Subqueries and CTEs
