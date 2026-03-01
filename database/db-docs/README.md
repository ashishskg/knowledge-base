# Relational Database Documentation — 15 Years Experience

Section-wise reference for **JOINs**, **GROUP BY**, and **complex SQL** on relational databases (PostgreSQL, MySQL, SQL Server, Oracle).

**Every query in Parts 1–6 includes sample Input and Output** based on the shared [00-Sample-Data.md](00-Sample-Data.md).

---

## Contents

| Part | File | Topics |
|------|------|--------|
| 0 | [00-Sample-Data.md](00-Sample-Data.md) | **Sample data (input for all examples)** — employees, departments, orders, customers, products, order_items |
| 1 | [01-SQL-Fundamentals.md](01-SQL-Fundamentals.md) | Schema, SELECT, WHERE, ORDER BY, LIMIT, basic aggregates |
| 2 | [02-JOINs.md](02-JOINs.md) | INNER, LEFT, RIGHT, FULL, CROSS, SELF, anti-join, semi-join |
| 3 | [03-GROUP-BY-and-Aggregations.md](03-GROUP-BY-and-Aggregations.md) | GROUP BY, HAVING, ROLLUP, CUBE, conditional aggregation |
| 4 | [04-Subqueries-and-CTEs.md](04-Subqueries-and-CTEs.md) | Scalar/row/correlated subqueries, IN/EXISTS, CTEs, recursive CTE |
| 5 | [05-Window-Functions.md](05-Window-Functions.md) | OVER, PARTITION BY, RANK, LAG/LEAD, running totals |
| 6 | [06-Complex-Queries.md](06-Complex-Queries.md) | Top-N per group, pivots, hierarchies, cohorts, multi-step reports |
| 7 | [07-Indexes-and-Performance.md](07-Indexes-and-Performance.md) | When indexes help, execution plans |

---

## Sample Schema

All examples use the same logical schema:

- **employees** (emp_id, emp_name, dept_id, manager_id, hire_date, salary)
- **departments** (dept_id, dept_name, location)
- **orders** (order_id, customer_id, order_date, total_amount, status)
- **order_items** (item_id, order_id, product_id, quantity, unit_price)
- **products** (product_id, product_name, category_id, unit_price)
- **customers** (customer_id, customer_name, city, country)

Defined in full in **01-SQL-Fundamentals.md**.

---

## Dialect Notes

- **LIMIT / OFFSET** — MySQL, PostgreSQL. SQL Server: `OFFSET ... ROWS FETCH NEXT ... ROWS ONLY`.
- **FULL OUTER JOIN** — Not in MySQL; use `UNION` of LEFT and RIGHT (see 02-JOINs.md).
- **STRING_AGG** — PostgreSQL. MySQL: `GROUP_CONCAT`.
- **FILTER** — PostgreSQL (and some others). Others: use `CASE` inside aggregates.
- **DATE_TRUNC** — PostgreSQL. MySQL: `DATE_FORMAT` or `YEAR()/MONTH()`; SQL Server: `DATEPART` / date ranges.
- **EXTRACT(YEAR FROM ...)** — Standard; supported in PostgreSQL, Oracle, etc. MySQL: `YEAR(...)`.

---

## Quick Lookup

- **All JOIN types with examples** → [02-JOINs.md](02-JOINs.md)
- **GROUP BY and HAVING** → [03-GROUP-BY-and-Aggregations.md](03-GROUP-BY-and-Aggregations.md)
- **Complex patterns (Top-N, pivot, cohort)** → [06-Complex-Queries.md](06-Complex-Queries.md)
