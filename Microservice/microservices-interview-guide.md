## Microservices Interview Guide (Beginner → Architect)

This file provides practical interview questions and system design prompts aligned with real production expectations.

---

## 1. Beginner Questions

### Concepts
- What is a microservice?
- Microservices vs monolith: key differences?
- What is a Pod/Deployment/Service in Kubernetes (high level)?
- What is an API Gateway and why do we need it?

### Practical
- How do services communicate?
- What is REST vs gRPC?

---

## 2. Intermediate Questions

### Architecture & patterns
- Explain service discovery. How does Kubernetes do it?
- Explain circuit breaker, retry, timeout. Why do we need all three?
- What is the Saga pattern? Choreography vs orchestration?
- Explain CQRS. When is it a good fit?
- What is event-driven architecture and what problems does it solve?

### Data
- Why “database per service”? What are alternatives?
- How do you avoid distributed transactions?
- What is eventual consistency and how does it impact UX?

### Kubernetes
- Readiness vs liveness probes.
- Rolling updates and rollback strategy.

---

## 3. Senior Developer Questions

### Reliability engineering
- Design resilience for Order → Payment call chain. How do you prevent cascading failures?
- How do you implement idempotency for `POST /orders`?
- How do you handle retries safely for non-idempotent operations?
- What’s the difference between “at least once delivery” and “exactly once effects”?

### Observability
- How do you design structured logging across services?
- What metrics do you track for each API? (RED)
- How do you use tracing to find latency bottlenecks?

### Performance & scaling
- When do you scale vertically vs horizontally?
- How do you scale consumers (Kafka consumer groups)?
- How do you handle backpressure?

### Security
- JWT validation: where should it happen (gateway vs service)?
- How would you implement mTLS between services?
- Secrets management best practices in Kubernetes.

---

## 4. Architect Questions

### System design prompts

1) **Design an e-commerce platform**
- Services: user, catalog, order, payment, shipping, notifications
- Databases per service
- Messaging backbone
- SLOs: p95 latency, availability targets
- Deployment: Kubernetes + multi-region

2) **Design a fintech payments system**
- Idempotent APIs
- Fraud scoring
- Strong audit trail
- Regulatory logging and encryption

3) **Multi-tenant SaaS platform**
- Tenant isolation model (namespace, DB schema, encryption keys)
- Rate limits per tenant
- Data residency requirements

### Architecture trade-offs
- Service mesh vs “gateway + libraries”: when and why?
- Monorepo vs multirepo microservices at enterprise scale.
- How do you avoid a distributed monolith?

### Platform requirements
- GitOps rollout model
- Progressive delivery (canary, blue/green)
- Policy-as-code (admission control)
- Supply chain security (SBOM, signing, scanning)

---

## 5. “Deep Dive” Questions (Common in Senior Loops)

- How do you guarantee message ordering? When do you need it?
- Outbox pattern: what problem does it solve?
- What is the difference between synchronous composition vs async choreography for workflows?
- How do you manage versioning of APIs and events?

---

## 6. Quick Answer Frameworks (Useful in interviews)

### Reliability checklist

```text
Timeouts -> Retries (bounded) -> Circuit breaker -> Bulkhead -> Fallback (if safe)
```

### Observability checklist

```text
Metrics (RED) + Logs (structured) + Traces (end-to-end) + Correlation IDs
```

### Microservices “do’s”

```text
Clear boundaries + owned data + independent deploy + automation + platform maturity
```

