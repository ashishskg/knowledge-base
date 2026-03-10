# Trade-offs and Principles

## Index

- [CAP theorem](#cap-theorem)
- [Consistency models](#consistency-models)
- [Latency, durability, and cost](#latency-durability-and-cost)
- [Design principles](#design-principles)
- [Migration and evolution](#migration-and-evolution)
- [See also](#see-also)

---

## CAP theorem

In a distributed system under network partition, you cannot have all three at once:

- **Consistency:** Every read sees the latest write.
- **Availability:** Every request receives a response (no timeout).
- **Partition tolerance:** System continues despite network partitions.

In practice, partitions occur, so you choose between **CP** (consistency + partition tolerance: reject requests or block when partition prevents consistency) and **AP** (availability + partition tolerance: serve possibly stale data). Design per use case: payments and inventory often CP or strong consistency; feeds and recommendations often AP with eventual consistency.

---

## Consistency models

| Model | Description | Example |
|------|-------------|---------|
| **Strong** | Read sees latest committed write | Single-leader DB, read from primary |
| **Eventual** | Replicas converge over time; read may be stale | Cached catalog, feed |
| **Read-your-writes** | User sees their own writes immediately | Session, profile after update |
| **Causal** | Ordering of related operations preserved | Chat, comments |

Choose based on product needs: “Order total must be strongly consistent; product recommendations can be eventual.” Call out in interviews: “We use strong consistency for checkout; we use eventual consistency for the product search index.”

---

## Latency, durability, and cost

- **Latency vs durability:** Synchronous replication gives durability but adds latency; async replication reduces latency but risk of loss on failover. Use sync for critical writes (e.g. payment confirmation); async for high-throughput or non-critical data.
- **Latency vs consistency:** Strong consistency often implies more round-trips or coordination; eventual consistency can reduce latency. Trade off explicitly per operation.
- **Cost:** More replicas, more regions, and stricter SLAs increase cost. Call out: “We use multi-AZ for 99.9%; we do not go multi-region for cost reasons unless we need DR.”

---

## Design principles

- **KISS (Keep It Simple):** Prefer the simplest design that meets requirements. Avoid unnecessary services or patterns.
- **YAGNI (You Aren’t Gonna Need It):** Do not add flexibility or components “for the future” until you have a concrete need. Design for today with clear extension points.
- **Strangler fig (migration):** Replace a legacy system gradually by routing new behavior to the new system and migrating data or traffic incrementally. Avoid big-bang rewrites.

In interviews: “We start with a monolith and split only when we have a clear scaling or team boundary”; “We use a single DB and introduce read replicas when read load justifies it.”

---

## Migration and evolution

- **Backward compatibility:** API and DB schema changes should not break existing clients. Version APIs or add optional fields; keep old fields until clients migrate.
- **Strangler pattern:** New functionality in new services; gradually move traffic and data from old to new. Use feature flags or routing to control rollout.
- **Data migration:** Dual-write to old and new store during transition; backfill historical data; switch reads to new store; stop dual-write. Plan for rollback (e.g. read from old store if new store has issues).

---

## See also

- [Data_And_Storage](Data_And_Storage.md) — replication and consistency.
- [Reliability_And_Resilience](Reliability_And_Resilience.md) — availability and failure handling.
- [Architecture_Styles_And_Patterns](Architecture_Styles_And_Patterns.md) — when to add complexity.
