# Data and Storage

## Index

- [Data modeling](#data-modeling)
- [Storage choices](#storage-choices)
- [Caching](#caching)
- [Horizontal partitioning (sharding)](#horizontal-partitioning-sharding)
- [Replication and consistency](#replication-and-consistency)
- [See also](#see-also)

---

## Data modeling

- **Entities and relationships:** Identify core entities (users, orders, products) and relationships (one-to-many, many-to-many). Normalize where it reduces redundancy and preserves integrity; denormalize where reads dominate and you need speed.
- **Normalization:** Reduces duplication and update anomalies; more joins and sometimes more round-trips. Use for write-heavy or strongly consistent domains.
- **Denormalization:** Duplicate data (e.g. product name in order line) to speed reads and simplify queries. Accept write amplification and consistency windows; use for read-heavy or eventually consistent views (e.g. feed, search index).

For interviews: sketch core tables or documents and call out where you denormalize and why (e.g. “We store seller name on the order for display without joining”).

---

## Storage choices

| Type | Best for | Examples |
|------|-----------|----------|
| **Relational (SQL)** | Transactions, joins, strong consistency, complex queries | PostgreSQL, MySQL, Oracle |
| **Key-value** | Simple lookup by key, sessions, counters, cache | Redis, DynamoDB (key-value mode) |
| **Document** | Flexible schema, hierarchy, good for catalogs and config | MongoDB, DynamoDB (document) |
| **Wide-column** | High write throughput, time-series, sparse columns | Cassandra, HBase |
| **Search index** | Full-text search, facets, ranking | Elasticsearch, OpenSearch |

Use the right store per bounded context: e.g. relational for orders and payments, search index for product search, key-value for session and rate limits. See [Tradeoffs_And_Principles](Tradeoffs_And_Principles.md) for CAP and consistency.

---

## Caching

- **Where:** CDN (static assets, sometimes API responses), application cache (Redis/Memcached for DB results or sessions), database buffer pool (internal).
- **Strategies:** Read-through (app reads cache; on miss, load from DB and fill cache), write-through (write to cache and DB together), write-back (write to cache, flush to DB later; faster but risk of loss).
- **Invalidation:** TTL, explicit invalidation on write, or event-driven (e.g. publish “product updated,” consumers evict cache). Stale reads are acceptable in many UIs; define how stale is acceptable.

For capacity and placement, see [Scalability_And_Performance](Scalability_And_Performance.md).

---

## Horizontal partitioning (sharding)

Split data across multiple DB instances by a partition key (e.g. `user_id`, `tenant_id`, `region`). Enables horizontal scale; complicates cross-shard queries and rebalancing.

- **By user_id:** Good when most queries are per user (e.g. “my orders”). Hot users can be isolated or sub-sharded.
- **By tenant_id:** Good for multi-tenant SaaS; can align with tenant isolation requirements.
- **By time/range:** Good for time-series or log data; old shards can be archived.

Call out: how you choose the key, how you route requests, and how you handle rebalancing or cross-shard reads (avoid or use aggregator layer).

---

## Replication and consistency

- **Leader–follower (primary–replica):** One primary for writes; replicas for reads and failover. Read-your-writes requires reading from primary or a lag-acceptable replica. Simple and common.
- **Multi-leader:** Multiple primaries (e.g. per region). Higher availability and local writes; conflict resolution and eventual consistency required.
- **Eventual consistency:** Replicas converge over time. Acceptable for feeds, recommendations, counters; not for payments or inventory without additional patterns (e.g. saga, 2PC, or compensating actions).

Strong consistency: single leader + synchronous replication (or quorum writes) and reading from primary or synced replica. See [Tradeoffs_And_Principles](Tradeoffs_And_Principles.md) for CAP and consistency models.

---

## See also

- [Scalability_And_Performance](Scalability_And_Performance.md) — caching strategies and capacity.
- [Tradeoffs_And_Principles](Tradeoffs_And_Principles.md) — CAP, consistency, durability.
- [Example_Ecommerce_System](Example_Ecommerce_System.md) — data model and storage choices for orders and catalog.
