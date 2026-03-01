# Part 5: Window Functions

Window functions compute over a set of rows related to the current row **without** collapsing rows (unlike GROUP BY).

**Input data:** [00-Sample-Data.md](00-Sample-Data.md).

---

## 5.1 OVER () — Whole Partition

**Input:** `employees`.

**Query:**
```sql
SELECT emp_name, salary, AVG(salary) OVER () AS company_avg
FROM employees;
```
**Output:** 9 rows; each row has emp_name, salary, and same company_avg (≈ 68333) on every row.

---

**Query:**
```sql
SELECT emp_name, dept_id, salary,
       SUM(salary) OVER () AS total_payroll,
       ROUND(100.0 * salary / SUM(salary) OVER (), 2) AS pct_of_total
FROM employees;
```
**Output:** 9 rows; total_payroll = 615000 on every row; pct_of_total is each employee’s share (e.g. Alice ≈ 15.45).

---

## 5.2 PARTITION BY

Split into groups; window is within each partition.

**Input:** `employees`.

**Query:**
```sql
-- Department average next to each row
SELECT emp_name, dept_id, salary,
       AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
FROM employees;
```
**Output:** 9 rows; dept_avg repeats per dept (e.g. dept 10: 78333, 78333, 78333; dept 20: 66000, 66000, 66000).

---

**Query:**
```sql
-- Rank within department
SELECT emp_name, dept_id, salary,
       RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_salary_rank
FROM employees;
```
**Output:** Within each dept: rank 1 = highest salary (Alice 1, David 1, Grace 1), then 2, 3. Ivy (NULL dept) gets rank 1 in her partition.

---

## 5.3 ORDER BY in Window

Defines order within the window (for running totals, row number, etc.).

**Input:** `employees`.

**Query:**
```sql
-- Running total of salary by hire_date
SELECT emp_name, hire_date, salary,
       SUM(salary) OVER (ORDER BY hire_date) AS running_total
FROM employees;
```
**Output:** Rows ordered by hire_date; running_total accumulates (e.g. David 88000, then 88000+95000, then +72000, … up to 615000).

---

**Query:**
```sql
-- By department
SELECT emp_name, dept_id, hire_date, salary,
       SUM(salary) OVER (PARTITION BY dept_id ORDER BY hire_date) AS dept_running_total
FROM employees;
```
**Output:** Per dept, running total by hire_date (e.g. dept 10: Alice 95000, Bob 167000, Carol 235000).

---

## 5.4 ROW_NUMBER, RANK, DENSE_RANK

- **ROW_NUMBER()** — unique 1, 2, 3…
- **RANK()** — ties get same rank, gap after tie
- **DENSE_RANK()** — ties get same rank, no gap

**Input:** `employees`. Eve and Frank both have 55000 (tie).

**Query:**
```sql
SELECT emp_name, salary,
       ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,
       RANK() OVER (ORDER BY salary DESC) AS rk,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS dr
FROM employees;
```
**Output:** rn 1–9 unique; for salary 55000 (Eve, Frank): rk 6, 7 (gap); dr 6, 6 (no gap).

---

## 5.5 LAG / LEAD

Access previous/next row.

**Input:** `employees` (ordered by hire_date).

**Query:**
```sql
SELECT emp_name, hire_date, salary,
       LAG(salary) OVER (ORDER BY hire_date) AS prev_salary,
       LEAD(salary) OVER (ORDER BY hire_date) AS next_salary
FROM employees;
```
**Output:** First row: prev_salary NULL, next_salary = next row’s salary. Last row: lead NULL. Middle rows: prev = previous row’s salary, lead = next row’s salary.

---

## 5.6 FIRST_VALUE / LAST_VALUE

**Input:** `employees`.

**Query:**
```sql
SELECT emp_name, dept_id, salary,
       FIRST_VALUE(emp_name) OVER (PARTITION BY dept_id ORDER BY salary DESC) AS top_earner_in_dept
FROM employees;
```
**Output:** In each dept, top_earner_in_dept is the name of the highest-paid (e.g. dept 10: Alice on all 3 rows; dept 20: David on all 3; dept 30: Grace on both).

---

## 5.7 NTILE — Buckets

**Input:** `employees` (9 rows). NTILE(4) splits into 4 buckets.

**Query:**
```sql
SELECT emp_name, salary,
       NTILE(4) OVER (ORDER BY salary) AS quartile
FROM employees;
```
**Output:** Quartile 1: lowest salaries (e.g. 3 rows); 2, 3, 4: next buckets. Distribution may be 3,2,2,2 or similar depending on DB.

---

**Next:** [06-Complex-Queries.md](06-Complex-Queries.md) — Complex queries
