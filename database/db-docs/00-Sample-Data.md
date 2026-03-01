# Sample Data (Input for All Examples)

All query examples in this documentation use the following sample data. Refer to this for **Input** when not repeated in a section.

---

## employees

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

## departments

| dept_id | dept_name | location |
|---------|-----------|----------|
| 10 | Sales | NYC |
| 20 | IT | Boston |
| 30 | HR | Chicago |

---

## customers

| customer_id | customer_name | city | country |
|-------------|---------------|-----|---------|
| 1 | Acme Corp | NYC | USA |
| 2 | Beta Inc | Boston | USA |
| 3 | Gamma LLC | Chicago | USA |
| 4 | Delta Co | NYC | USA |

---

## orders

| order_id | customer_id | order_date | total_amount | status |
|----------|-------------|------------|--------------|--------|
| 101 | 1 | 2024-01-05 | 250.00 | Paid |
| 102 | 1 | 2024-02-10 | 180.00 | Paid |
| 103 | 2 | 2024-01-15 | 1200.00 | Paid |
| 104 | 3 | 2024-03-01 | 95.00 | Pending |
| 105 | 2 | 2024-03-12 | 450.00 | Paid |

---

## order_items

| item_id | order_id | product_id | quantity | unit_price |
|---------|----------|------------|----------|------------|
| 1 | 101 | 1 | 2 | 50.00 |
| 2 | 101 | 2 | 1 | 150.00 |
| 3 | 102 | 1 | 3 | 60.00 |
| 4 | 103 | 3 | 1 | 1200.00 |
| 5 | 104 | 2 | 1 | 95.00 |
| 6 | 105 | 1 | 5 | 90.00 |

---

## products

| product_id | product_name | category_id | unit_price |
|------------|--------------|-------------|------------|
| 1 | Widget A | 1 | 75.00 |
| 2 | Widget B | 1 | 150.00 |
| 3 | Gadget X | 2 | 1200.00 |

---

**Note:** Customer 4 (Delta Co) has no orders. Employee 9 (Ivy) has `dept_id` NULL. Use [00-Sample-Data.md](00-Sample-Data.md) as **Input** for any example unless a section overrides it.
