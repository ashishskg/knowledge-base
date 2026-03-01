# Scalability and Performance

## Index

- [Vertical vs horizontal scaling](#vertical-vs-horizontal-scaling)
- [Load balancing](#load-balancing)
- [Stateless services and sessions](#stateless-services-and-sessions)
- [Back-of-the-envelope capacity](#back-of-the-envelope-capacity)
- [Caching strategies](#caching-strategies)
- [See also](#see-also)

---

## Vertical vs horizontal scaling

- **Vertical (scale up):** Bigger machine (more CPU, RAM, disk). Simpler; hits hardware limits and single point of failure.
- **Horizontal (scale out):** More machines; traffic and data spread across them. Requires statelessness (or external session store), load balancing, and often partitioning (sharding). Preferred for large-scale and availability.

For interviews: prefer horizontal for API and workers; use vertical as a stepping stone or for single-node DBs when sharding is not yet needed.

---

## Load balancing

Distribute client requests across multiple instances.

- **L4 (transport):** By IP and port; fast, no application awareness. Good for TLS termination and simple routing.
- **L7 (application):** By URL, headers, cookies; enables sticky sessions, routing to different backends. Use when you need path-based or cookie-based routing.

**Strategies:** Round-robin, least connections, weighted. **Sticky sessions:** Same client to same server (e.g. by cookie); use when local state exists or you want to pin to a cache. Prefer stateless + shared cache so you can avoid stickiness.

---

## Stateless services and sessions

**Stateless:** No in-memory session; each request can be handled by any instance. Scale by adding instances; use external store (Redis, DB) for session or user state. Preferred for APIs and workers.

**Stateful:** Server holds session state. Requires sticky routing or consistent hashing; complicates failover and scaling. Use only when necessary (e.g. some real-time or in-memory caches); otherwise push state to a store.

---

## Back-of-the-envelope capacity

Rough estimates for interviews (adjust assumptions as given):

- **Users and QPS:** e.g. 10M DAU, 10 requests per user per day → ~1.2K QPS average; peak 3–5x → ~5K QPS. Writes often 10–20% of reads.
- **Storage:** e.g. 100M orders, 1 KB per order → 100 GB; add indexes and replication (e.g. 3x) → ~300 GB per replica.
- **Bandwidth:** e.g. 5K QPS, 10 KB response → 50 MB/s ≈ 400 Mbps.

Use these to justify: “We need on the order of X machines for API,” “We need a DB that can do Y reads/sec,” “We’ll cache to reduce DB load by Z%.”

---

## Caching strategies

| Strategy | Description | Use when |
|----------|-------------|----------|
| **Read-through** | App reads cache; on miss, load from DB and populate cache | General read caching |
| **Write-through** | Write to cache and DB together | Need cache and DB in sync |
| **Write-back** | Write to cache; async flush to DB | High write throughput, accept risk |
| **Cache-aside** | App manages cache and DB; on miss load and insert into cache | Full control over invalidation |

**Invalidation:** TTL, explicit delete on write, or event-based. For interview: “We cache product by ID with 5 min TTL; on product update we invalidate that key.”

---

## See also

- [Data_And_Storage](Data_And_Storage.md) — caching layer and sharding.
- [Reliability_And_Resilience](Reliability_And_Resilience.md) — failover and health checks.
- [Example_Ecommerce_System](Example_Ecommerce_System.md) — scaling catalog and checkout.
