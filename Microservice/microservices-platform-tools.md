## Microservices Platform & Tools (Enterprise Reference)

This file focuses on the **platform capabilities** you need to run microservices reliably at scale and the common tools used in Java/Spring ecosystems.

---

## 1. Service Discovery

### Definition
Mechanism for locating service instances dynamically.

### Why it exists
Instances scale up/down; IPs change; clients need stable addressing.

### Internal working
- **Kubernetes**: `Service` + endpoints + DNS.
- **Eureka/Consul**: registry where instances register; clients resolve.

### Configuration examples

Kubernetes service discovery (DNS):

```text
http://order-service   (within same namespace)
http://order-service.my-ns.svc.cluster.local
```

### Best practices
- Prefer Kubernetes-native discovery if you run on Kubernetes.
- Use readiness probes to avoid routing to unhealthy instances.

### Common mistakes
- Double discovery layers (Eureka + K8s) without a reason.

### Enterprise use cases
- Multi-tenant routing with separate namespaces; blue/green services.

---

## 2. API Gateway

### Definition
Central ingress point that applies auth/rate limiting/routing.

### Why it exists
Avoids duplicating security and policy enforcement in every service.

### Tools
- **Spring Cloud Gateway**
- Kubernetes Ingress Controller (NGINX, AWS ALB)
- API management (Apigee, Kong, Azure APIM)

### Example (Spring Cloud Gateway route)

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: order
          uri: http://order-service
          predicates:
            - Path=/orders/**
          filters:
            - RequestRateLimiter=
```

### Best practices
- Keep it stateless, scale horizontally.
- Enforce timeouts; propagate trace context.

---

## 3. Centralized Configuration

### Definition
Central place to manage config by environment (dev/stage/prod).

### Why it exists
Microservices multiply configuration. Consistency and controlled rollout become critical.

### Tools
- Spring Cloud Config
- Kubernetes ConfigMaps
- GitOps (Argo CD / Flux) as “source of truth”

### Example: ConfigMap feeding env vars

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: order-config
data:
  LOG_LEVEL: INFO
  FEATURE_X_ENABLED: "true"
```

### Best practices
- Treat config as code; version it.
- Separate secrets from config.

---

## 4. Secrets Management

### Definition
Storing and delivering sensitive data (passwords, keys) securely.

### Tools
- Kubernetes Secrets (baseline)
- HashiCorp Vault (enterprise standard)
- AWS Secrets Manager + external-secrets controller

### Example: Secret referenced by Deployment

```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: password
```

### Best practices
- Rotate secrets.
- Avoid putting secrets in Git.

---

## 5. Resilience Patterns

### Definition
Techniques to keep system stable under partial failure.

### Tools
- **Resilience4j** (circuit breaker, retry, bulkhead, rate limiter)

### Example concepts
- Timeout + retry + circuit breaker
- Bulkheads (separate pools per dependency)

### Best practices
- Prefer bounded retries with exponential backoff and jitter.
- Never retry non-idempotent operations unless you have idempotency keys.

---

## 6. Distributed Tracing

### Definition
End-to-end request tracing across services using trace/span IDs.

### Tools
- **OpenTelemetry** (instrumentation)
- Jaeger / Tempo / Zipkin (backends)

### Internal working
Propagates `traceparent` headers; each service creates spans and exports telemetry.

### Best practices
- Sample intelligently (head-based vs tail-based).
- Ensure logs include trace IDs.

---

## 7. Centralized Logging

### Definition
Aggregating logs from all services into a searchable store.

### Tools
- ELK / EFK (Elastic + Fluent Bit/Fluentd + Kibana)
- Loki + Promtail + Grafana

### Best practices
- Structured logs (JSON).
- No sensitive data in logs.

---

## 8. Monitoring (Metrics + Alerting)

### Definition
Quantitative measurement of service health (latency, errors, saturation).

### Tools
- **Prometheus** (metrics)
- **Grafana** (dashboards)
- Alertmanager (alerts)

### Best practices
- Use RED (Rate, Errors, Duration) and USE (Utilization, Saturation, Errors).
- Define SLOs per API and alert on SLO burn rate.

---

## 9. Security (Platform level)

### Definition
Authentication, authorization, network security, and supply-chain security.

### Tools
- OAuth2/OIDC (Keycloak, Okta, Cognito)
- mTLS via service mesh (Istio/Linkerd)
- Image scanning (Trivy, Grype)
- Policy as code (OPA Gatekeeper, Kyverno)

### Best practices
- Zero trust inside cluster: NetworkPolicies + mTLS where needed.
- Least privilege RBAC.

---

## 10. Kafka (Messaging Backbone)

### Definition
Distributed log for events.

### Why it exists
Decouples services and enables async processing and replay.

### Internal working
- Topics partitioned; consumer groups provide horizontal scaling.
- Offsets track consumption; replay is possible.

### Best practices
- Version event schemas; use schema registry.
- Idempotent consumers; DLQs.

---

## 11. Enterprise Platform Checklist (Minimum)

```text
Ingress/API Gateway
Service discovery (K8s DNS)
Config management (ConfigMap/GitOps)
Secrets management (Vault/Secrets Manager)
Resilience defaults (timeouts/retries/CB)
Observability (metrics/logs/traces)
Security (OIDC, RBAC, NetworkPolicies, scanning)
CI/CD + GitOps rollout
```

---

## Interview Questions

- Why is service discovery necessary? How does Kubernetes implement it?
- What is the difference between logs, metrics, and traces?
- How do you secure east–west traffic between services?
- What are the key Kafka guarantees and common pitfalls?

