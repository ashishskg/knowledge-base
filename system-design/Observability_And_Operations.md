# Observability and Operations

## Index

- [Logs, metrics, and traces](#logs-metrics-and-traces)
- [Health checks](#health-checks)
- [Dashboards and alerting](#dashboards-and-alerting)
- [Deployment strategies](#deployment-strategies)
- [Rollbacks and feature flags](#rollbacks-and-feature-flags)
- [See also](#see-also)

---

## Logs, metrics, and traces

- **Logs:** Structured (JSON) with level, timestamp, service, request_id, and message. Use for debugging and audit; avoid logging PII or secrets. Centralize (e.g. ELK, Loki, cloud logging) and retain per policy.
- **Metrics:** Numeric values over time: latency (p50/p95/p99), throughput (QPS), error rate, saturation (CPU, queue depth). Export to Prometheus, StatsD, or cloud metrics; aggregate by service, endpoint, and status.
- **Traces:** Request flow across services (trace_id, span_id, parent_id). Use for latency breakdown and finding bottlenecks. Correlate with logs via trace_id.

Design so every request has a request_id (and optionally trace_id) propagated across services and logged; this is essential for debugging and for interview discussions.

---

## Health checks

- **Liveness:** “Is the process up?” — simple check; fail → restart. Do not depend on DB or downstream.
- **Readiness:** “Can this instance accept traffic?” — include DB and critical dependencies. Fail → remove from load balancer until ready.

Use readiness to avoid sending traffic to instances that cannot serve (e.g. during startup or when DB is unreachable). Expose on a dedicated port/path (e.g. `/health/ready`).

---

## Dashboards and alerting

- **Dashboards:** Key metrics per service: latency, errors, throughput, dependency health. One screen per service or flow (e.g. “Checkout” with API, DB, payment gateway).
- **Alerting:** Alert on SLO breaches (e.g. error rate &gt; 1%, p99 &gt; 500 ms) and on symptoms (e.g. “payment gateway errors spiking”). Avoid alerting only on cause; prefer “users are affected” and then drill down. Define runbooks for common alerts.

---

## Deployment strategies

| Strategy | Description | Use when |
|----------|-------------|----------|
| **Rolling** | Replace instances gradually | Default; minimal risk |
| **Blue/green** | Two full environments; switch traffic at once | Fast rollback; need double capacity |
| **Canary** | Send small % traffic to new version; increase if healthy | Reduce blast radius of bad deploy |

Design for zero-downtime: backward-compatible DB and API changes; drain connections before shutdown; use readiness to stop receiving traffic before process exit.

---

## Rollbacks and feature flags

- **Rollback:** Ability to revert to previous version quickly. Automated (e.g. revert last deploy) or manual. Ensure DB migrations are backward compatible so old version still works after a rollback.
- **Feature flags:** Toggle features without deploy. Use for canary, A/B tests, or killing a feature without rollback. Store in config or feature-flag service; avoid flags that pile up forever.

---

## See also

- [Reliability_And_Resilience](Reliability_And_Resilience.md) — availability and failure handling.
- [Security_And_Multi_Tenancy](Security_And_Multi_Tenancy.md) — audit logging.
- [Example_Ecommerce_System](Example_Ecommerce_System.md) — operational concerns for checkout.
