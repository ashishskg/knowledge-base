# Oracle PL/SQL Scripts — Documentation Index

This folder contains **topic-wise documentation** for the Oracle PL/SQL scripts in the parent directory (`Oracle DB Query/`). Each document describes a concept, includes a diagram, and lists the related scripts with purpose, code references, and example output.

**Full index:** [INDEX.md](INDEX.md) — all documents and every heading in one place with direct links.

## Index

- [Topics](#topics)
- [Script location](#script-location)
- [Prerequisites](#prerequisites)

---

## Topics

| Topic | Document | Scripts covered |
|-------|----------|-----------------|
| **Queries, indexing, joins & interview guide** | [Oracle_Queries_And_Interview_Guide.md](Oracle_Queries_And_Interview_Guide.md) | N/A (reference only: basic/advanced SQL, joins, indexing, 15+ yrs interview Q&A) |
| Associative arrays | [Associative_Arrays.md](Associative_Arrays.md) | Associative_array01–07 |
| Cursors | [Cursors.md](Cursors.md) | cursor_01, cursor_with_*_01–04, cursor_rowtype_03, cursor_table_rowtype_03, cursor_with_records_02, cursor_attributes |
| Procedures | [Procedures.md](Procedures.md) | procedure_01, procedure_02_new_line, INCREASE_SALARIES2, call_proceedure |
| Exceptions | [Exceptions.md](Exceptions.md) | exceptions, exception_non_predefined |
| Composite datatypes | [Composite_Datatypes.md](Composite_Datatypes.md) | composite_datatype1, composite_dateype2–4 |
| Varrays | [Varrays.md](Varrays.md) | varray1–3 |
| Nested tables / collections in tables | [Collections_In_Tables.md](Collections_In_Tables.md) | table_example1–3, stroing_collection_*, storing_collections_* |
| Sequences | [Sequences.md](Sequences.md) | sequence1–2 |
| DML and records | [DML_And_Records.md](DML_And_Records.md) | dml_operations, dml_with_records, select_database_sql |

## Script location

All `.sql` scripts live in the **parent directory** of this `docs/` folder:

- **Path:** `Oracle DB Query/*.sql` (same folder as this `docs` folder)
- Run scripts in SQL*Plus, SQLcl, or any Oracle client. Use `SET SERVEROUTPUT ON` when the script uses `DBMS_OUTPUT`.

## Prerequisites

Most scripts assume the Oracle **HR** sample schema (tables such as `EMPLOYEES`, `DEPARTMENTS`). Some procedures and examples use `employees_copy` or other copy tables; create them as described in the topic docs or in the script comments.
