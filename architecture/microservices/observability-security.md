## Observability & Security for Microservices (Enterprise Guide)

This file focuses on what you need to **see**, **debug**, and **protect** microservices in production.

---

## 1. Observability (Metrics, Tracing, Logging)

### 1.1 Definition

- **Metrics**: numerical time-series (latency, throughput, error rates).
- **Logs**: event records with context (structured JSON recommended).
- **Traces**: request journey across services (spans, trace IDs).

### 1.2 Why it exists

In microservices, failures are distributed and intermittent. Observability is how you:
- detect problems early,
- find root causes quickly,
- prove SLO compliance,
- reduce MTTR.

### 1.3 Internal working (practical)

```text
Service emits:
  Metrics -> Prometheus -> Grafana dashboards/alerts
  Logs    -> Fluent Bit -> Elasticsearch/Loki -> Kibana/Grafana
  Traces  -> OpenTelemetry -> Jaeger/Tempo -> trace UI
```

### 1.4 Architecture diagram

```text
             +------------------+
             |   Grafana        |
             +---+----------+---+
                 |          |
         Metrics |          | Traces (links)
                 v          v
           Prometheus     Tempo/Jaeger
                 ^
                 |
         +-------+--------+
         | OTel Collector |
         +-------+--------+
                 ^
                 |
         +-------+--------+
         | Microservices  |
         +----------------+
                 |
               Logs
                 v
         Fluent Bit / Vector
                 v
        Elasticsearch / Loki
```

---

## 2. Metrics

### Definition
Measurements describing system behavior and resource usage.

### Best practices (enterprise)
- Use RED metrics per API:
  - **Rate**: requests/sec
  - **Errors**: 5xx, business errors
  - **Duration**: latency percentiles (p95/p99)
- Use USE metrics for infrastructure:
  - **Utilization**, **Saturation**, **Errors**
- Alert on **SLO burn rate**, not raw thresholds.

### Common mistakes
- Only tracking averages (hide tail latency).
- No per-endpoint metrics.

---

## 3. Distributed Tracing (OpenTelemetry)

### Definition
Trace a request end-to-end with spans and context propagation.

### Why it exists
Most production issues are “somewhere in the chain”. Tracing identifies the slow/failing hop.

### Internal working
- Incoming request has `traceparent` header.
- Each hop creates spans.
- Export spans to collector/back-end.

### Best practices
- Always propagate trace headers.
- Add business attributes carefully (no PII).

### Common mistakes
- Sampling too aggressively (no traces during incidents).
- No trace-log correlation (logs missing trace IDs).

---

## 4. Logging (Centralized)

### Definition
Standardized, searchable logs aggregated from all services.

### Best practices
- Structured logs (JSON).
- Include: `timestamp`, `service`, `env`, `traceId`, `spanId`, `requestId`.
- Redact secrets; avoid logging JWTs and passwords.

### Common mistakes
- Logging too much at INFO (cost + noise).
- No retention policy and indexing strategy.

---

## 5. Security for Microservices

### 5.1 OAuth2 and JWT (north–south)

**Definition**
- OAuth2/OIDC for authentication.
- JWT for stateless token-based access.

**Why**
- Central identity provider (IdP) with consistent auth rules.

**Internal working**
- Client authenticates with IdP → gets JWT.
- Gateway validates token signature and claims.
- Services authorize based on scopes/roles.

**Best practices**
- Validate JWT at gateway and again at services for defense-in-depth (policy dependent).
- Rotate keys; use short-lived access tokens.

**Common mistakes**
- No token expiry handling.
- Storing long-lived secrets in code.

### 5.2 mTLS (east–west)

**Definition**
Mutual TLS for service-to-service authentication and encryption.

**Why**
Zero-trust internal networks; prevents lateral movement.

**Internal working**
- Service mesh issues certs and enforces mTLS policies.

**Best practices**
- Use service mesh for consistent mTLS and identity.
- Start in permissive mode, move to strict gradually.

### 5.3 API Gateway security

Capabilities:
- Rate limiting and throttling
- WAF integration
- Request validation
- IP allow/deny lists

### 5.4 Secrets management

Tools:
- Vault / AWS Secrets Manager
- Kubernetes Secrets for baseline

Best practice:
- Never store DB passwords in configmaps.

---

## 6. Enterprise use cases

- Banking: audit trails, immutable logs, strict token scopes, mTLS everywhere.
- SaaS multi-tenant: tenant isolation, per-tenant rate limits, per-tenant encryption keys.
- High-scale: sampling strategies, cost controls on telemetry.

---

## 7. Interview questions

### Beginner
- Difference between logs and metrics?
- What is JWT?

### Intermediate
- How do you correlate logs with traces?
- What is p95 latency and why it matters?

### Senior
- Design an SLO-based alerting strategy for microservices.
- How would you secure east–west traffic?

### Architect
- Build an enterprise observability platform for 200 services.
- Design security boundaries for multi-tenant microservices on Kubernetes.

