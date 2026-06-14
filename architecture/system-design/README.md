# System Design & Architecture — Interview Guide (15+ Years)

A multi-file guide to **system design** and **software architecture** for senior and principal-level interview preparation. Each document covers core concepts or a full worked example with diagrams and trade-offs.

## Index

- [Concepts](#concepts)
- [Examples](#examples)
- [How to use this guide](#how-to-use-this-guide)

---

## Concepts

| Topic | Document | Summary |
|-------|----------|---------|
| [Concepts overview](Concepts_Overview.md) | Concepts_Overview.md | System design vs architecture, main components, high-level flow |
| [Requirements & NFRs](Requirements_And_NFRs.md) | Requirements_And_NFRs.md | Functional vs non-functional, SLAs/SLOs/SLIs, scoping for interviews |
| [Architecture styles & patterns](Architecture_Styles_And_Patterns.md) | Architecture_Styles_And_Patterns.md | Monolith, microservices, layered, event-driven, CQRS |
| [Data & storage](Data_And_Storage.md) | Data_And_Storage.md | Modeling, SQL vs NoSQL, sharding, replication, caching |
| [Scalability & performance](Scalability_And_Performance.md) | Scalability_And_Performance.md | Horizontal scaling, load balancing, capacity estimates, caching strategies |
| [Reliability & resilience](Reliability_And_Resilience.md) | Reliability_And_Resilience.md | Failures, retries, circuit breakers, idempotency, availability |
| [Security & multi-tenancy](Security_And_Multi_Tenancy.md) | Security_And_Multi_Tenancy.md | AuthN/AuthZ, encryption, multi-tenancy, rate limiting |
| [Observability & operations](Observability_And_Operations.md) | Observability_And_Operations.md | Logs, metrics, tracing, deployment, rollbacks |
| [Trade-offs & principles](Tradeoffs_And_Principles.md) | Tradeoffs_And_Principles.md | CAP, consistency models, design principles |

---

## Examples

| Example | Document | What you design |
|---------|----------|-----------------|
| [Microservices architecture (detailed)](Example_Microservices_Architecture.md) | Example_Microservices_Architecture.md | Every component: API Gateway, registry, config, services, DB per service, message broker, BFF, mesh, observability |
| [Database architecture (relational vs non-relational)](Database_Architecture_Examples.md) | Database_Architecture_Examples.md | Two examples: (1) relational — order management, replication, sharding; (2) non-relational — document catalog + key-value sessions |
| [E-commerce system](Example_Ecommerce_System.md) | Example_Ecommerce_System.md | Catalog, cart, checkout, orders, payments, inventory |
| [Social network feed](Example_Social_Network_Feed.md) | Example_Social_Network_Feed.md | Newsfeed/timeline, fan-out on write vs read |
| [Chat / messaging](Example_Chat_Messaging_System.md) | Example_Chat_Messaging_System.md | 1:1 and group chat, real-time delivery, history |
| [File storage & CDN](Example_File_Storage_And_CDN.md) | Example_File_Storage_And_CDN.md | Upload, object storage, CDN, access control |

---

## How to use this guide

1. **Interview prep:** Read [Concepts_Overview](Concepts_Overview.md) first, then dive into concept docs for weak areas. Use the example docs as end-to-end design practice (requirements → diagram → data → scale → reliability).
2. **Quick reference:** Use this README as the index; each concept doc has an Index section at the top for in-file navigation.
3. **Cross-links:** Example docs reference the concept docs (e.g. "See [Data_And_Storage](Data_And_Storage.md) for sharding strategies").

All content is language- and stack-agnostic; apply the ideas to any cloud or on-prem environment.
