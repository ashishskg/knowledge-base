# Part 6: Complex Queries — Section-Wise Examples

Real-world patterns combining JOINs, GROUP BY, subqueries, CTEs, and window functions.

**Input data:** [00-Sample-Data.md](00-Sample-Data.md).

---

## 6.1 Top-N Per Group

**Requirement:** Top 3 highest-paid employees per department.

**Input:** `employees`.

**Query (window function — recommended):**
```sql
WITH ranked AS (
    SELECT emp_id, emp_name, dept_id, salary,
           DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk
    FROM employees
)
SELECT emp_id, emp_name, dept_id, salary, rk
FROM ranked
WHERE rk <= 3;
```
**Output:** Up to 3 per dept: dept 10 → Alice(1), Bob(2), Carol(3); dept 20 → David, Eve, Frank; dept 30 → Grace, Henry; NULL → Ivy. (All 9 rows, since each group has ≤3.)

---

**Query (correlated subquery):**
```sql
SELECT e.emp_name, e.dept_id, e.salary
FROM employees e
WHERE (
    SELECT COUNT(DISTINCT e2.salary)
    FROM employees e2
    WHERE e2.dept_id = e.dept_id AND e2.salary >= e.salary
) <= 3
ORDER BY e.dept_id, e.salary DESC;
```
**Output:** Same set of rows (top 3 by salary per dept).

---

## 6.2 Running Totals and Moving Averages

**Input:** `orders`.

**Query (running total by date):**
```sql
SELECT order_date,
       total_amount,
       SUM(total_amount) OVER (ORDER BY order_date) AS running_total
FROM orders;
```
**Output:** 5 rows by order_date: 2024-01-05 → 250, running 250; 2024-01-15 → 1200, running 1450; 2024-02-10 → 180, running 1630; 2024-03-01 → 95, running 1725; 2024-03-12 → 450, running 2175.

---

**Query (7-day moving average):**
```sql
SELECT order_date,
       AVG(total_amount) OVER (
           ORDER BY order_date
           ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS moving_avg_7
FROM orders;
```
**Output:** Each row: order_date, total_amount, average of that row and up to 6 previous (by date). With 5 rows, first row = 250, then (250+1200)/2, etc.

---

## 6.3 Gap and Island Problems

**Find gaps in consecutive IDs or dates.**  
**Input:** `orders` (order_id 101–105, no gaps).

**Query:**
```sql
WITH ordered AS (
    SELECT order_id, order_date,
           order_id - ROW_NUMBER() OVER (ORDER BY order_id) AS grp
    FROM orders
)
SELECT MIN(order_id) AS range_start, MAX(order_id) AS range_end, COUNT(*) AS cnt
FROM ordered
GROUP BY grp;
```
**Output:** One “island”: range_start 101, range_end 105, cnt 5. (If IDs were 101,102,105,106 you’d get two islands: 101–102 and 105–106.)

---

## 6.4 Pivot (Rows to Columns)

**Department as columns, count of employees.**  
**Input:** `employees`.

**Query:**
```sql
SELECT
    COUNT(CASE WHEN dept_id = 10 THEN 1 END) AS dept_10,
    COUNT(CASE WHEN dept_id = 20 THEN 1 END) AS dept_20,
    COUNT(CASE WHEN dept_id = 30 THEN 1 END) AS dept_30
FROM employees;
```
**Output:** One row: dept_10 = 3, dept_20 = 3, dept_30 = 2. (Ivy with NULL dept not counted in these columns.)

---

**Query (PostgreSQL FILTER):**
```sql
SELECT
    COUNT(*) FILTER (WHERE dept_id = 10) AS dept_10,
    COUNT(*) FILTER (WHERE dept_id = 20) AS dept_20,
    COUNT(*) FILTER (WHERE dept_id = 30) AS dept_30
FROM employees;
```
**Output:** Same: 3, 3, 2.

---

## 6.5 Unpivot (Columns to Rows)

**Multiple metric columns into one row per metric.**  
**Input:** Table with emp_id, salary, bonus, commission (sample `employees` has salary only; assume bonus/commission exist for illustration).

**Query:**
```sql
SELECT emp_id, 'salary' AS metric, salary AS value FROM employees
UNION ALL
SELECT emp_id, 'bonus', bonus FROM employees
UNION ALL
SELECT emp_id, 'commission', commission FROM employees;
```
**Output:** For each emp_id: 3 rows (salary, bonus, commission). If bonus/commission columns don’t exist, add them or use a different table.

---

## 6.6 Hierarchical Queries (Manager Chain)

**Full path from employee to root (recursive CTE).**  
**Input:** `employees` (manager_id: Alice/David/Grace/Ivy = NULL; Bob,Carol→1; Eve,Frank→4; Henry→7).

**Query:**
```sql
WITH RECURSIVE hierarchy AS (
    SELECT emp_id, emp_name, manager_id, 1 AS level,
           CAST(emp_name AS VARCHAR(500)) AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    SELECT e.emp_id, e.emp_name, e.manager_id, h.level + 1,
           h.path || ' > ' || e.emp_name
    FROM employees e
    JOIN hierarchy h ON e.manager_id = h.emp_id
)
SELECT * FROM hierarchy ORDER BY level, emp_id;
```
**Output:** Level 1: Alice, David, Grace, Ivy (path = name). Level 2: Bob (Alice > Bob), Carol (Alice > Carol), Eve (David > Eve), Frank (David > Frank), Henry (Grace > Henry).

---

## 6.7 Duplicate Detection and Deduplication

**Input:** `employees` (no duplicate name+dept in sample; Eve and Frank same dept but different names).

**Query (find duplicates by name + dept):**
```sql
SELECT emp_name, dept_id, COUNT(*)
FROM employees
GROUP BY emp_name, dept_id
HAVING COUNT(*) > 1;
```
**Output:** Empty (no duplicate emp_name, dept_id). If you had two “Eve” in dept 20, you’d get one row: Eve, 20, 2.

---

**Query (keep one row per emp_name, dept_id — min emp_id):**
```sql
DELETE FROM employees
WHERE emp_id NOT IN (
    SELECT MIN(emp_id) FROM employees GROUP BY emp_name, dept_id
);
```
**Output:** No rows deleted with current data. With duplicates, all but the row with minimum emp_id per (emp_name, dept_id) would be deleted.

---

## 6.8 Compare Periods (YoY, MoM)

**Revenue this year vs last year.**  
**Input:** `orders` (all 2024 in sample).

**Query:**
```sql
WITH yearly AS (
    SELECT EXTRACT(YEAR FROM order_date) AS yr,
           SUM(total_amount) AS revenue
    FROM orders
    GROUP BY EXTRACT(YEAR FROM order_date)
)
SELECT curr.yr,
       curr.revenue AS current_revenue,
       prev.revenue AS prev_revenue,
       curr.revenue - prev.revenue AS change
FROM yearly curr
LEFT JOIN yearly prev ON prev.yr = curr.yr - 1;
```
**Output:** One row: yr 2024, current_revenue 2175, prev_revenue NULL (no 2023 data), change NULL. With 2023 orders you’d see 2024 vs 2023.

---

## 6.9 Customer Cohort / Retention

**First order date per customer, then count orders per cohort and period.**  
**Input:** `orders`. First order: Acme 2024-01-05, Beta 2024-01-15, Gamma 2024-03-01.

**Query:**
```sql
WITH first_order AS (
    SELECT customer_id, MIN(order_date) AS first_date
    FROM orders
    GROUP BY customer_id
),
cohort_data AS (
    SELECT o.customer_id,
           fo.first_date,
           EXTRACT(YEAR FROM fo.first_date) AS cohort_yr,
           EXTRACT(MONTH FROM fo.first_date) AS cohort_mo,
           EXTRACT(YEAR FROM o.order_date) AS order_yr,
           EXTRACT(MONTH FROM o.order_date) AS order_mo
    FROM orders o
    JOIN first_order fo ON o.customer_id = fo.customer_id
)
SELECT cohort_yr, cohort_mo, order_yr, order_mo,
       COUNT(DISTINCT customer_id) AS customers
FROM cohort_data
GROUP BY cohort_yr, cohort_mo, order_yr, order_mo
ORDER BY 1, 2, 3, 4;
```
**Output:** One row per (cohort_yr, cohort_mo, order_yr, order_mo) with customer count, e.g. (2024, 1, 2024, 1): 2; (2024, 1, 2024, 2): 1; (2024, 1, 2024, 3): 1; (2024, 3, 2024, 3): 1; etc.

---

## 6.10 Multi-Step Reporting with CTEs

**Department summary + comparison to company average.**  
**Input:** `employees`, `departments`. Company avg ≈ 68333.

**Query:**
```sql
WITH dept_stats AS (
    SELECT dept_id,
           COUNT(*) AS emp_count,
           SUM(salary) AS total_sal,
           AVG(salary) AS avg_sal
    FROM employees
    GROUP BY dept_id
),
company_avg AS (
    SELECT AVG(salary) AS company_avg_sal FROM employees
)
SELECT d.dept_name, ds.emp_count, ds.avg_sal,
       ca.company_avg_sal,
       ds.avg_sal - ca.company_avg_sal AS diff_from_company
FROM departments d
JOIN dept_stats ds ON d.dept_id = ds.dept_id
CROSS JOIN company_avg ca;
```
**Output:** 3 rows (Sales, IT, HR). Each: dept_name, emp_count, avg_sal, company_avg_sal (same on all), diff_from_company (e.g. Sales +10000, IT -2333, HR -3333). NULL dept not in departments so not shown.

---

## 6.11 Complex JOIN + Aggregation + HAVING

**Customers whose total order amount is in top 10%.**  
**Input:** `orders`, `customers`. Totals: Beta 1650, Acme 430, Gamma 95. NTILE(10) with 3 rows: 1st bucket = Beta.

**Query:**
```sql
WITH customer_revenue AS (
    SELECT o.customer_id, SUM(o.total_amount) AS total
    FROM orders o
    GROUP BY o.customer_id
),
percentile AS (
    SELECT customer_id, total,
           NTILE(10) OVER (ORDER BY total DESC) AS tenth
    FROM customer_revenue
)
SELECT c.customer_name, p.total
FROM customers c
JOIN percentile p ON c.customer_id = p.customer_id
WHERE p.tenth = 1;
```
**Output:** Beta Inc | 1650 (only customer in top decile when 3 customers).

---

## 6.12 Conditional Aggregation Across Multiple Dimensions

**Count and sum by department and salary band.**  
**Input:** `employees`.

**Query:**
```sql
SELECT dept_id,
       COUNT(*) AS total,
       SUM(CASE WHEN salary < 40000 THEN 1 ELSE 0 END) AS low,
       SUM(CASE WHEN salary BETWEEN 40000 AND 70000 THEN 1 ELSE 0 END) AS mid,
       SUM(CASE WHEN salary > 70000 THEN 1 ELSE 0 END) AS high,
       SUM(CASE WHEN salary < 40000 THEN salary ELSE 0 END) AS low_sal_sum,
       SUM(CASE WHEN salary > 70000 THEN salary ELSE 0 END) AS high_sal_sum
FROM employees
GROUP BY dept_id;
```
**Output:** Per dept_id: total 3,3,2,1; low/mid/high counts (e.g. dept 10: 0 low, 1 mid Carol, 2 high Alice+Bob); low_sal_sum, high_sal_sum (dept 10: 0, 167000).

---

## 6.13 Multi-Table Report with Filters

**Monthly revenue by product category, only paid orders.**  
**Input:** `orders` (exclude Pending), `order_items`, `products`. Paid: 101, 102, 103, 105. Order 104 Pending excluded.

**Query:**  
*(PostgreSQL: `DATE_TRUNC('month', ...)`. MySQL: `DATE_FORMAT(order_date, '%Y-%m')`.)*
```sql
SELECT DATE_TRUNC('month', o.order_date) AS month,
       p.category_id,
       SUM(oi.quantity * oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
WHERE o.status = 'Paid'
GROUP BY DATE_TRUNC('month', o.order_date), p.category_id
ORDER BY 1, 2;
```
**Output:** Rows like: 2024-01: category 1 (250+150+60 from 101,102), category 2 (1200 from 103); 2024-02: category 1 only; 2024-03: category 1 (450 from 105).

---

## 6.14 Existence Checks with Multiple Criteria

**Customers who ordered product A but never product B.**  
**Input:** product_id 1 = Widget A, 2 = Widget B. Acme: 101,102 (items 1,2 and 1); Beta: 103 (3), 105 (1); Gamma: 104 (2). So Acme ordered both 1 and 2; Beta only 3 and 1 (no 2); Gamma only 2.

**Query:**
```sql
SELECT c.customer_id, c.customer_name
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.customer_id = c.customer_id AND oi.product_id = 1  -- product A
)
AND NOT EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.customer_id = c.customer_id AND oi.product_id = 2  -- product B
);
```
**Output:** Beta Inc only (ordered product 1, never 2). Acme ordered both; Gamma ordered only 2.

---

## 6.15 Self-Join for Comparison

**Pairs of employees in same department with similar salary (within 10%).**  
**Input:** `employees`. Eve and Frank both 55000 (0% diff); Bob 72000, Carol 68000 ≈ 5.6% diff.

**Query:**
```sql
SELECT a.emp_name AS emp1, b.emp_name AS emp2, a.dept_id,
       a.salary AS sal1, b.salary AS sal2
FROM employees a
JOIN employees b ON a.dept_id = b.dept_id AND a.emp_id < b.emp_id
WHERE ABS(a.salary - b.salary) <= 0.1 * GREATEST(a.salary, b.salary);
```
**Output:** Eve | Frank | 20 | 55000 | 55000 (same salary); Bob | Carol | 10 | 72000 | 68000 (within 10%). Other pairs exceed 10%.

---

**Next:** [07-Indexes-and-Performance.md](07-Indexes-and-Performance.md) — Indexes and performance
