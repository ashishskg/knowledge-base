# Requirements and Non-Functional Requirements (NFRs)

## Index

- [Functional vs non-functional requirements](#functional-vs-non-functional-requirements)
- [Turning vague prompts into clear requirements](#turning-vague-prompts-into-clear-requirements)
- [NFR categories](#nfr-categories)
- [SLAs, SLOs, and SLIs](#slas-slos-and-slis)
- [Example: e-commerce NFRs](#example-e-commerce-nfrs)
- [See also](#see-also)

---

## Functional vs non-functional requirements

**Functional requirements** describe what the system does: features, user flows, and behaviors. Examples: “User can add items to cart,” “User can search products by keyword,” “Order is created and payment is charged on checkout.”

**Non-functional requirements (NFRs)** describe how the system performs or behaves: availability, latency, throughput, durability, consistency, security, and cost. Examples: “API p99 latency &lt; 200 ms,” “System available 99.9%,” “Payment data encrypted at rest and in transit.”

In system design interviews, you are expected to clarify both. Often the interviewer gives a vague prompt (“Design an e-commerce site”); you propose scope (which features first) and explicit NFRs (scale, latency, availability) so your design has clear targets.

---

## Turning vague prompts into clear requirements

For senior-level interviews, show that you can drive scope and constraints.

1. **Clarify scope:** Which features are in scope for this exercise? (e.g. browse + search + cart + checkout + order history; returns and reviews out of scope.)
2. **Scale:** Order-of-magnitude numbers: DAU, reads/sec, writes/sec, data volume (e.g. 10M users, 100K QPS read, 10K QPS write, 100M orders).
3. **Latency:** What matters? (e.g. product page &lt; 200 ms p99, checkout can be 500 ms.)
4. **Availability:** Target? (e.g. 99.9% = ~8.7 h downtime/year.)
5. **Consistency:** Where is strong consistency required? (e.g. inventory and payment; product catalog can be eventually consistent.)
6. **Security & compliance:** PCI for payments? PII handling? Multi-tenancy?

Write down 2–3 sentences of “We’re designing for …” and refer back when making trade-offs (e.g. “We accepted eventual consistency on the feed to hit latency targets”).

---

## NFR categories

| Category | Examples | Interview use |
|----------|----------|----------------|
| **Availability** | 99.9%, 99.99% | Drives replication, failover, redundancy. |
| **Latency** | p50/p95/p99 ms | Drives caching, async processing, DB indexing. |
| **Throughput** | QPS, messages/sec | Drives horizontal scaling, partitioning, queues. |
| **Durability** | No data loss on failure | Drives replication, WAL, backups. |
| **Consistency** | Strong vs eventual | Drives choice of DB, caching, and messaging. |
| **Security** | Auth, encryption, compliance | Drives auth layer, TLS, secret management, isolation. |
| **Cost** | Budget, cost per request | Drives choice of storage, region, reserved capacity. |

---

## SLAs, SLOs, and SLIs

- **SLI (Service Level Indicator):** A measurable metric (e.g. “percentage of requests with latency &lt; 200 ms”).
- **SLO (Service Level Objective):** Target for an SLI (e.g. “99% of requests &lt; 200 ms”).
- **SLA (Service Level Agreement):** Contract with users; usually includes SLOs and consequences if missed (e.g. credits). Internally you often track SLOs; SLAs are what you promise externally.

In design discussions, “we need 99.9% availability” is an SLO; “we’ll measure availability as (successful requests / total requests) per month” is the SLI.

---

## Example: e-commerce NFRs

| NFR | Example target | Design implication |
|-----|----------------|--------------------|
| Availability | 99.9% | Multi-AZ, health checks, failover, idempotent retries. |
| Read latency | p99 &lt; 200 ms | Cache product/catalog, CDN for static assets, DB indexes. |
| Write latency | Checkout p99 &lt; 500 ms | Async for non-critical path (e.g. email); DB and payment gateway tuned. |
| Throughput | 10K checkout QPS | Stateless checkout service, DB sharding by order_id or user_id, queue for post-checkout jobs. |
| Consistency | Strong for inventory & payment | Use transactions or saga for order+inventory+payment; eventual for recommendations. |
| Durability | No loss of orders/payments | WAL, replication, backups; idempotent payment retries. |
| Security | PCI for payment, PII protected | Isolate payment flow; encrypt PII at rest and in transit; authz on every request. |

These become the criteria you reference when choosing DB type, caching, sync vs async, and replication strategy. See [Example_Ecommerce_System](Example_Ecommerce_System.md) for how they apply in a full design.

---

## See also

- [Concepts_Overview](Concepts_Overview.md) — components of system design.
- [Example_Ecommerce_System](Example_Ecommerce_System.md) — full e-commerce design with requirements.
- [Tradeoffs_And_Principles](Tradeoffs_And_Principles.md) — consistency vs availability, CAP.
