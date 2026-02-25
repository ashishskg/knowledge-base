# Oracle SQL: Basic & Advanced Queries, Indexing, Joins & Interview Guide (15+ Years)

This document provides basic and advanced query examples with sample input/output, indexing and join examples, and senior-level Oracle interview Q&A.

---

## Table of contents

1. [Sample data (input)](#1-sample-data-input)
2. [Basic queries with input/output](#2-basic-queries-with-inputoutput)
3. [Advanced queries with input/output](#3-advanced-queries-with-inputoutput)
4. [Joins with examples and output](#4-joins-with-examples-and-output)
5. [Indexing: types, examples, and usage](#5-indexing-types-examples-and-usage)
6. [Interview Q&A (15 years experience)](#6-interview-qa-15-years-experience)

---

## 1. Sample data (input)

Assume the following minimal schema and data for examples (HR-style).

**EMPLOYEES (subset)**

| EMPLOYEE_ID | FIRST_NAME | LAST_NAME | SALARY | DEPARTMENT_ID | HIRE_DATE  | JOB_ID   |
|-------------|------------|-----------|--------|---------------|------------|----------|
| 100         | Steven     | King      | 24000  | 90            | 17-JUN-03  | AD_PRES  |
| 101         | Neena      | Kochhar   | 17000  | 90            | 21-SEP-89  | AD_VP    |
| 102         | Lex        | De Haan   | 17000  | 90            | 13-JAN-93  | AD_VP    |
| 103         | Alexander  | Hunold    | 9000   | 60            | 03-JAN-90  | IT_PROG  |
| 104         | Bruce      | Ernst     | 6000   | 60            | 21-MAY-91  | IT_PROG  |
| 105         | David      | Austin    | 4800   | 60            | 25-JUN-97  | IT_PROG  |
| 106         | Valli      | Pataballa | 4800   | 60            | 05-FEB-98  | IT_PROG  |
| 107         | Diana      | Lorentz   | 4200   | 60            | 07-FEB-99  | IT_PROG  |
| 108         | Nancy      | Greenberg | 12000  | 100           | 17-AUG-94  | FI_MGR   |
| 109         | Daniel     | Faviet    | 9000   | 100           | 16-AUG-94  | FI_ACCOUNT |
| 110         | John       | Chen      | 8200   | 100           | 28-SEP-97  | FI_ACCOUNT |

**DEPARTMENTS**

| DEPARTMENT_ID | DEPARTMENT_NAME | MANAGER_ID |
|---------------|-----------------|------------|
| 60            | IT              | 103        |
| 90            | Executive       | 100        |
| 100           | Finance         | 108        |

**JOBS**

| JOB_ID     | JOB_TITLE        | MIN_SALARY | MAX_SALARY |
|------------|------------------|------------|------------|
| AD_PRES    | President        | 20000      | 40000      |
| AD_VP      | Administration Vice President | 15000 | 30000 |
| IT_PROG    | Programmer       | 4000       | 10000      |
| FI_MGR     | Finance Manager  | 8200       | 16000      |
| FI_ACCOUNT | Accountant       | 4200       | 9000       |

---

## 2. Basic queries with input/output

### 2.1 Simple SELECT with WHERE and ORDER BY

**Query:**

```sql
SELECT employee_id, first_name, last_name, salary, department_id
FROM   employees
WHERE  department_id = 60
ORDER BY salary DESC;
```

**Output:**

| EMPLOYEE_ID | FIRST_NAME | LAST_NAME | SALARY | DEPARTMENT_ID |
|-------------|------------|-----------|--------|---------------|
| 103         | Alexander  | Hunold    | 9000   | 60             |
| 104         | Bruce     | Ernst     | 6000   | 60             |
| 105         | David     | Austin    | 4800   | 60             |
| 106         | Valli     | Pataballa | 4800   | 60             |
| 107         | Diana     | Lorentz   | 4200   | 60             |

---

### 2.2 Aggregation: COUNT, SUM, AVG, MIN, MAX

**Query:**

```sql
SELECT department_id,
       COUNT(*)        AS emp_count,
       SUM(salary)     AS total_sal,
       ROUND(AVG(salary), 2) AS avg_sal,
       MIN(salary)     AS min_sal,
       MAX(salary)     AS max_sal
FROM   employees
GROUP BY department_id
ORDER BY department_id;
```

**Output:**

| DEPARTMENT_ID | EMP_COUNT | TOTAL_SAL | AVG_SAL | MIN_SAL | MAX_SAL |
|---------------|-----------|------------|---------|---------|---------|
| 60            | 5         | 28800      | 5760    | 4200    | 9000    |
| 90            | 3         | 58000      | 19333.33| 17000   | 24000   |
| 100           | 3         | 29200      | 9733.33 | 8200    | 12000   |

---

### 2.3 HAVING (filter on aggregates)

**Query:**

```sql
SELECT department_id, COUNT(*) AS cnt, SUM(salary) AS total
FROM   employees
GROUP BY department_id
HAVING COUNT(*) >= 3 AND SUM(salary) > 25000
ORDER BY total DESC;
```

**Output:**

| DEPARTMENT_ID | CNT | TOTAL  |
|---------------|-----|--------|
| 90            | 3   | 58000  |
| 60            | 5   | 28800  |
| 100           | 3   | 29200  |

---

### 2.4 DISTINCT and IN

**Query:**

```sql
SELECT DISTINCT job_id
FROM   employees
WHERE  department_id IN (60, 100)
ORDER BY job_id;
```

**Output:**

| JOB_ID     |
|------------|
| FI_ACCOUNT |
| FI_MGR     |
| IT_PROG    |

---

## 3. Advanced queries with input/output

### 3.1 Subquery in WHERE (single value)

**Query:** Employees earning more than the average salary of the IT department.

```sql
SELECT employee_id, first_name, last_name, salary, department_id
FROM   employees
WHERE  salary > (SELECT AVG(salary) FROM employees WHERE department_id = 60)
ORDER BY salary;
```

**Output (example):**

| EMPLOYEE_ID | FIRST_NAME | LAST_NAME | SALARY | DEPARTMENT_ID |
|-------------|------------|-----------|--------|---------------|
| 107         | Diana      | Lorentz   | 4200   | 60            |
| 105         | David      | Austin    | 4800   | 60            |
| 106         | Valli      | Pataballa | 4800   | 60            |
| 104         | Bruce      | Ernst     | 6000   | 60            |
| 109         | Daniel     | Faviet    | 9000   | 100           |
| 103         | Alexander  | Hunold    | 9000   | 60            |
| 110         | John       | Chen      | 8200   | 100           |
| 108         | Nancy      | Greenberg | 12000  | 100           |
| 101         | Neena      | Kochhar   | 17000  | 90            |
| 102         | Lex        | De Haan   | 17000  | 90            |
| 100         | Steven     | King      | 24000  | 90            |

*(Only rows with salary > 5760; exact set depends on full data.)*

---

### 3.2 Correlated subquery

**Query:** Employees whose salary is greater than the average salary in their own department.

```sql
SELECT e.employee_id, e.first_name, e.last_name, e.salary, e.department_id
FROM   employees e
WHERE  e.salary > (SELECT AVG(i.salary) FROM employees i WHERE i.department_id = e.department_id)
ORDER BY e.department_id, e.salary;
```

**Output (conceptual):** One row per employee who is above their department average (e.g. Steven, Neena, Lex in 90; Alexander, Bruce in 60; Nancy, Daniel, John in 100).

---

### 3.3 CTE (Common Table Expression / WITH clause)

**Query:** Department total salary and rank by total salary.

```sql
WITH dept_totals AS (
  SELECT department_id, SUM(salary) AS total_sal
  FROM   employees
  GROUP BY department_id
)
SELECT d.department_id, d.department_name, t.total_sal,
       DENSE_RANK() OVER (ORDER BY t.total_sal DESC) AS sal_rank
FROM   dept_totals t
JOIN   departments d ON d.department_id = t.department_id
ORDER BY sal_rank;
```

**Output:**

| DEPARTMENT_ID | DEPARTMENT_NAME | TOTAL_SAL | SAL_RANK |
|---------------|-----------------|-----------|----------|
| 90            | Executive       | 58000     | 1        |
| 100           | Finance         | 29200     | 2        |
| 60            | IT              | 28800     | 3        |

---

### 3.4 Analytic functions: ROW_NUMBER, RANK, DENSE_RANK

**Query:**

```sql
SELECT employee_id, first_name, last_name, salary, department_id,
       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rn,
       RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) AS rk,
       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dr
FROM   employees
WHERE  department_id IN (60, 90);
```

**Output (example):**

| EMPLOYEE_ID | FIRST_NAME | LAST_NAME | SALARY | DEPT_ID | RN | RK | DR |
|-------------|------------|-----------|--------|---------|----|----|-----|
| 103         | Alexander  | Hunold    | 9000   | 60      | 1  | 1  | 1   |
| 104         | Bruce      | Ernst     | 6000   | 60      | 2  | 2  | 2   |
| 105         | David      | Austin    | 4800   | 60      | 3  | 3  | 3   |
| 106         | Valli      | Pataballa | 4800   | 60      | 4  | 3  | 3   |
| 107         | Diana      | Lorentz   | 4200   | 60      | 5  | 5  | 4   |
| 100         | Steven     | King      | 24000  | 90      | 1  | 1  | 1   |
| 101         | Neena      | Kochhar   | 17000  | 90      | 2  | 2  | 2   |
| 102         | Lex        | De Haan   | 17000  | 90      | 3  | 2  | 2   |

---

### 3.5 LAG / LEAD

**Query:** Previous and next salary within department (by hire_date).

```sql
SELECT employee_id, first_name, salary, department_id, hire_date,
       LAG(salary)  OVER (PARTITION BY department_id ORDER BY hire_date) AS prev_sal,
       LEAD(salary) OVER (PARTITION BY department_id ORDER BY hire_date) AS next_sal
FROM   employees
WHERE  department_id = 60
ORDER BY department_id, hire_date;
```

**Output (example):**

| EMPLOYEE_ID | FIRST_NAME | SALARY | DEPARTMENT_ID | HIRE_DATE | PREV_SAL | NEXT_SAL |
|-------------|------------|--------|---------------|-----------|----------|----------|
| 103         | Alexander  | 9000   | 60            | 03-JAN-90 | (null)   | 6000     |
| 104         | Bruce      | 6000   | 60            | 21-MAY-91 | 9000     | 4800     |
| 105         | David      | 4800   | 60            | 25-JUN-97 | 6000     | 4800     |
| 106         | Valli      | 4800   | 60            | 05-FEB-98 | 4800     | 4200     |
| 107         | Diana      | 4200   | 60            | 07-FEB-99 | 4800     | (null)   |

---

## 4. Joins with examples and output

### 4.1 INNER JOIN

**Query:** Employees with department name.

```sql
SELECT e.employee_id, e.first_name, e.last_name, e.salary, d.department_name
FROM   employees e
INNER JOIN departments d ON e.department_id = d.department_id
ORDER BY e.department_id, e.salary DESC;
```

**Output:**

| EMPLOYEE_ID | FIRST_NAME | LAST_NAME | SALARY | DEPARTMENT_NAME |
|-------------|------------|-----------|--------|-----------------|
| 103         | Alexander  | Hunold    | 9000   | IT              |
| 104         | Bruce      | Ernst     | 6000   | IT              |
| 105         | David      | Austin    | 4800   | IT              |
| 106         | Valli      | Pataballa | 4800   | IT              |
| 107         | Diana      | Lorentz   | 4200   | IT              |
| 100         | Steven     | King      | 24000  | Executive       |
| 101         | Neena      | Kochhar   | 17000  | Executive       |
| 102         | Lex        | De Haan   | 17000  | Executive       |
| 108         | Nancy      | Greenberg | 12000  | Finance         |
| 109         | Daniel     | Faviet    | 9000   | Finance         |
| 110         | John       | Chen      | 8200   | Finance         |

---

### 4.2 LEFT OUTER JOIN

**Query:** All departments and their employees (departments with no employees still appear).

```sql
SELECT d.department_id, d.department_name, e.employee_id, e.first_name, e.last_name
FROM   departments d
LEFT JOIN employees e ON e.department_id = d.department_id
ORDER BY d.department_id, e.employee_id;
```

**Output (conceptual):** Every department row; employee columns NULL for departments with no employees.

---

### 4.3 RIGHT OUTER JOIN

**Query:** All employees and their department (employees with no department still appear).

```sql
SELECT e.employee_id, e.first_name, d.department_id, d.department_name
FROM   employees e
RIGHT JOIN departments d ON e.department_id = d.department_id
ORDER BY d.department_id, e.employee_id;
```

*(With the sample data this returns the same set as INNER JOIN because every employee has a department. Right join is useful when the “right” table is the one that must appear in full.)*

---

### 4.4 FULL OUTER JOIN

**Query:** All employees and all departments; match where possible.

```sql
SELECT e.employee_id, e.first_name, e.department_id AS emp_dept,
       d.department_id AS dept_id, d.department_name
FROM   employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id
ORDER BY NVL(e.department_id, d.department_id);
```

**Output:** All rows from both sides; one side’s columns NULL where no match.

---

### 4.5 Self-join (employee and manager)

**Query:** Employee and manager names (assuming manager_id points to EMPLOYEE_ID).

```sql
SELECT e.employee_id, e.first_name || ' ' || e.last_name AS employee_name,
       m.employee_id AS manager_id, m.first_name || ' ' || m.last_name AS manager_name
FROM   employees e
LEFT JOIN employees m ON e.manager_id = m.employee_id
ORDER BY e.employee_id;
```

**Output (example):** Each employee with their manager’s ID and name; manager columns NULL for top-level (e.g. King).

---

### 4.6 CROSS JOIN

**Query:** Cartesian product (each department with each job from a small set).

```sql
SELECT d.department_name, j.job_title
FROM   (SELECT DISTINCT department_name FROM departments WHERE ROWNUM <= 2) d
CROSS JOIN (SELECT job_title FROM jobs WHERE ROWNUM <= 2) j;
```

**Output:** 2 × 2 = 4 rows (every combination of the two department names and two job titles).

---

## 5. Indexing: types, examples, and usage

### 5.1 When to use indexes

- **Use:** Columns in `WHERE`, `JOIN`, `ORDER BY`, `GROUP BY`; high selectivity (many distinct values).
- **Avoid (or use sparingly):** Very small tables; columns updated very frequently; low-cardinality columns (e.g. gender) unless combined in composite indexes.

### 5.2 B-tree index (default)

**Create:**

```sql
-- Single column
CREATE INDEX idx_emp_dept ON employees(department_id);

-- Composite (order matters: equality first, then range)
CREATE INDEX idx_emp_dept_sal ON employees(department_id, salary);

-- Unique
CREATE UNIQUE INDEX idx_emp_email ON employees(email);
```

**Example query using index:**

```sql
-- Can use idx_emp_dept or idx_emp_dept_sal
SELECT * FROM employees WHERE department_id = 60;

-- Composite: good for department_id + salary range
SELECT * FROM employees WHERE department_id = 60 AND salary BETWEEN 4000 AND 8000;
```

**Check usage (conceptual):**

```sql
EXPLAIN PLAN FOR
SELECT * FROM employees WHERE department_id = 60;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
-- Look for INDEX RANGE SCAN on idx_emp_dept (or similar).
```

### 5.3 Bitmap index

**When:** Low-cardinality columns (e.g. status, region) in DW/read-heavy environments.

```sql
CREATE BITMAP INDEX idx_emp_job_bm ON employees(job_id);
```

**Note:** Not suitable for OLTP with heavy concurrent DML; consider bitmap join indexes in DW.

### 5.4 Function-based index (FBI)

**When:** Predicate or join uses a function on the column.

```sql
CREATE INDEX idx_emp_upper_name ON employees(UPPER(last_name));

-- Query can use the index
SELECT * FROM employees WHERE UPPER(last_name) = 'KING';
```

### 5.5 Partitioned index

**When:** Table is partitioned; local indexes align with partitions (easier maintenance, partition pruning); global indexes can span partitions.

```sql
-- Local index (one per partition)
CREATE INDEX idx_emp_dept_local ON employees(department_id) LOCAL;

-- Global index
CREATE INDEX idx_emp_id_global ON employees(employee_id) GLOBAL;
```

*Note: Oracle does not support true partial indexes (e.g. WHERE clause on index). Use partitioning or function-based indexes to target subsets where appropriate.*

### 5.6 Invisible index

**When:** Test dropping an index without actually dropping it.

```sql
ALTER INDEX idx_emp_dept INVISIBLE;
-- Optimizer ignores it; can revert with VISIBLE.
ALTER INDEX idx_emp_dept VISIBLE;
```

---

## 6. Interview Q&A (15 years experience)

### Architecture & instance

**Q: Explain the Oracle architecture: SGA, PGA, background processes.**  
**A:** **SGA** (shared): database buffer cache, redo log buffer, shared pool (library cache, data dictionary cache), large pool, etc. **PGA** (per process): session memory, sort/hash areas, cursor state. **Background processes:** PMON (process monitor), SMON (system monitor), DBWn (database writer), LGWR (log writer), CKPT (checkpoint), ARCn (archiver in ARCHIVELOG), etc. RAC adds LMS, LMD, LCK, etc.

**Q: Difference between logical and physical reads?**  
**A:** **Logical read:** block read from buffer cache (may trigger physical read if not in cache). **Physical read:** block read from disk into buffer cache. High physical reads can indicate missing indexes, small buffer cache, or full table scans.

**Q: What is checkpoint and why does it matter?**  
**A:** Checkpoint is when DBWn writes dirty buffers to data files so that instance recovery (redo application) need not go back beyond the last checkpoint. Reduces recovery time and can improve performance by reducing dirty buffers.

---

### SQL tuning & execution plans

**Q: How do you approach tuning a slow query?**  
**A:** (1) Get execution plan (`DBMS_XPLAN.DISPLAY_CURSOR` or AWR). (2) Find high cost or high buffer gets / disk reads. (3) Look for full table scans on large tables, inappropriate join methods, wrong index usage. (4) Consider indexing, rewriting (e.g. avoid function on indexed column), hints, statistics, partitioning. (5) Use bind variables to avoid hard parsing.

**Q: Explain join methods: Nested Loops, Hash Join, Sort-Merge.**  
**A:** **Nested Loops:** For each row from outer table, probe inner (often with index). Good when outer is small and inner is indexed. **Hash Join:** Build hash table on smaller side, probe with larger; good for large sets without good index. **Sort-Merge:** Sort both sides on join key, merge; good when data is already sorted or when no index.

**Q: What are bind variables and why use them?**  
**A:** Placeholders (e.g. `:dept_id`) so the same SQL text is reused; avoids hard parse and reduces latch contention in shared pool. Without bind variables, every new literal value creates a new cursor.

---

### Indexing & statistics

**Q: When would you not use an index?**  
**A:** Very small tables; columns with very low cardinality and no composite use; columns under heavy DML; when the optimizer chooses FTS because a large fraction of the table is selected (e.g. > ~10–20% of blocks).

**Q: How do you maintain statistics for the optimizer?**  
**A:** Use `DBMS_STATS`: `GATHER_TABLE_STATS`, `GATHER_SCHEMA_STATS`, or `GATHER_DATABASE_STATS`. Prefer incremental and concurrent where applicable. Set appropriate preferences (estimate_percent, cascade, method_opt). Schedule during maintenance windows.

**Q: What is histogram and when is it used?**  
**A:** Histogram stores distribution of column values so the optimizer can estimate selectivity for equality and range predicates on skewed data. Use when column is used in WHERE and distribution is non-uniform.

---

### Partitioning

**Q: Types of partitioning and when to use each?**  
**A:** **Range:** time-based or numeric ranges (e.g. by month). **List:** discrete values (e.g. region). **Hash:** even distribution, no range semantics. **Composite:** e.g. range-list, range-hash. Use for manageability (drop/archive old partitions), partition pruning, and parallel operations.

**Q: What is partition pruning and partition-wise join?**  
**A:** **Pruning:** optimizer eliminates partitions that cannot contain rows for the predicate (e.g. `WHERE date_col >= :d` in range partition). **Partition-wise join:** join partitions with same partition key locally, reducing data movement in RAC or Exadata.

---

### PL/SQL & performance

**Q: Bulk operations in PL/SQL?**  
**A:** Use `FORALL` with `BULK COLLECT` to reduce context switches between SQL and PL/SQL. Set `LIMIT` on `BULK COLLECT` (e.g. 100–1000) to avoid excessive PGA. Use bulk bind for DML (INSERT/UPDATE/DELETE) in loops.

**Q: How do you avoid “ORA-01722: invalid number” and similar in dynamic SQL?**  
**A:** Use bind variables in dynamic SQL (`EXECUTE IMMEDIATE ... USING ...`) instead of concatenating values. Validate and convert types (e.g. `TO_NUMBER`) in a controlled way with exception handling.

---

### Concurrency & locking

**Q: Difference between blocking and deadlock?**  
**A:** **Blocking:** one session holds a lock another session needs; the other waits. **Deadlock:** two or more sessions wait for each other’s locks; Oracle detects and rolls back one transaction (ORA-00060).

**Q: How do you find blocking sessions?**  
**A:** Query `V$LOCK`, `V$SESSION`, and `V$LOCKED_OBJECT`; or use `DBMS_LOCK`/`DBA_BLOCKERS`-style views. Identify holder and waiter chains and what object/row is locked.

---

### Backup, recovery & RAC

**Q: Difference between ARCHIVELOG and NOARCHIVELOG?**  
**A:** **ARCHIVELOG:** redo logs are archived; can recover to any point in time (with backups). **NOARCHIVELOG:** only consistent backup and restore; no point-in-time recovery. Production usually uses ARCHIVELOG.

**Q: What is RAC and what problems does it solve?**  
**A:** Real Application Clusters: multiple instances share one database (storage). Provides high availability (failover) and scalability (more nodes). Challenges: global cache coordination (GCS), instance recovery, and design for concurrent access (e.g. sequence caching, hot blocks).

---

### Design & best practices

**Q: How would you design a high-volume logging/audit table?**  
**A:** Partition by time (range), use minimal indexes, consider compression and read-only partitions. Optionally use asynchronous commit or write to a queue and bulk insert. Archive or purge old partitions.

**Q: Explain read consistency and undo.**  
**A:** Oracle uses undo segments to reconstruct older versions of blocks so queries see a consistent view (no dirty read). Long-running queries may need more undo retention; “ORA-01555 snapshot too old” means required undo was overwritten.

---

## See also

- [Associative_Arrays.md](Associative_Arrays.md) — PL/SQL collections
- [Cursors.md](Cursors.md) — cursor usage
- [README.md](README.md) — index of all topic docs
