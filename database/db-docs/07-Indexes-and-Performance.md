# Part 7: Indexes and Query Performance

Brief reference for writing efficient queries and understanding indexes. Index examples use the same schema as [00-Sample-Data.md](00-Sample-Data.md) (employees, orders, order_items, etc.); there are no query result outputs in this part.

---

## 7.1 When Indexes Help

- **WHERE** and **JOIN ON** columns
- **ORDER BY** and **GROUP BY** columns
- **DISTINCT**
- Covering index: index includes all columns needed by the query (index-only scan)

---

## 7.2 Index Types (varies by DB)

- **B-tree** — default; good for `=`, `<`, `>`, `BETWEEN`, `ORDER BY`
- **Hash** — mainly equality (e.g. PostgreSQL)
- **GIN/GiST** — full-text, arrays, JSON (PostgreSQL)

---

## 7.3 Index and JOINs

- Index **foreign keys** and columns used in **JOIN ON**
- Composite index: order of columns matters (left-prefix rule in MySQL)

```sql
CREATE INDEX idx_emp_dept ON employees(dept_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

---

## 7.4 Index and GROUP BY / ORDER BY

- Index on `(dept_id, salary)` can help `GROUP BY dept_id` and `ORDER BY dept_id, salary`

---

## 7.5 What Hurts Performance

- Functions on indexed columns: `WHERE YEAR(date_col) = 2024` — index often not used
- Prefer: `WHERE date_col >= '2024-01-01' AND date_col < '2025-01-01'`
- `OR` with different columns — consider UNION
- `NOT IN` / `<>` with subqueries — watch for NULLs and execution plans
- Large `SELECT *` when only few columns needed

---

## 7.6 EXPLAIN / Execution Plans

- **PostgreSQL:** `EXPLAIN (ANALYZE, BUFFERS) SELECT ...`
- **MySQL:** `EXPLAIN SELECT ...`
- **SQL Server:** Include actual execution plan or `SET SHOWPLAN_TEXT ON`

Use these to see index usage, full table scans, and costly operations.

---

**Back to:** [README.md](README.md)
