# Microservices concepts & configuration checklist (what you typically need)

This is a practical checklist of the common **concepts, tools, and configuration** used in real microservice platforms.

---

## Table of Contents

- [1) Service discovery](#1-service-discovery)
- [2) API Gateway](#2-api-gateway)
- [3) Centralized configuration](#3-centralized-configuration)
- [4) Secrets management](#4-secrets-management)
- [5) Resilience patterns](#5-resilience-patterns)
- [6) Distributed tracing](#6-distributed-tracing)
- [7) Centralized logging](#7-centralized-logging)
- [8) Metrics / monitoring / alerting](#8-metrics-monitoring-alerting)
- [9) Security (authn/authz)](#9-security-authn-authz)
- [10) Service-to-service communication](#10-service-to-service-communication)
- [11) Messaging / event streaming](#11-messaging-event-streaming)
  - [Often required extra service: Schema Registry](#often-required-extra-service-schema-registry)
- [12) Data management](#12-data-management)
- [13) Deployment platform (Kubernetes)](#13-deployment-platform-kubernetes)
- [14) CI/CD](#14-ci-cd)
- [15) Container image registry](#15-container-image-registry)
- [16) Feature flags](#16-feature-flags)
- [17) Service mesh (optional but common at scale)](#17-service-mesh-optional-but-common-at-scale)
- [18) Rate limiting and WAF (edge)](#18-rate-limiting-and-waf-edge)
- [19) Governance / platform standards](#19-governance-platform-standards)
- [Summary: “do we need any other tool/service?”](#summary-do-we-need-any-other-tool-service)


---




## 1) Service discovery
**Why**
- Services find each other without hardcoding host/ports.

**Options**
- Kubernetes DNS (often enough on K8s)
- Eureka / Consul (common outside K8s)

**Config**
- Service name (`user-service`, `order-service`)
- Registration + health checks
- Readiness/liveness endpoints

---

## 2) API Gateway
**Why**
- Single entry point for routing + security + limits.

**Options**
- Spring Cloud Gateway
- Kong / NGINX / Envoy
- AWS API Gateway

**Config**
- Routes (path/host → upstream service)
- Timeouts (connect/read)
- Retries (careful)
- Rate limiting
- Request size limits
- CORS
- Auth integration (JWT/OAuth2)

---

## 3) Centralized configuration
**Why**
- Change config per environment without rebuilding images.

**Options**
- Spring Cloud Config Server (Git-backed)
- Kubernetes ConfigMaps
- AWS SSM Parameter Store

**Config**
- Config per env (`dev`, `qa`, `prod`)
- Refresh strategy (restart vs hot refresh)
- Separation of config vs secrets

---

## 4) Secrets management
**Why**
- Protect DB passwords, tokens, signing keys.

**Options**
- AWS Secrets Manager
- HashiCorp Vault
- Kubernetes Secrets (often used, but manage encryption/rotation)

**Config**
- Rotation policies
- Least privilege access
- Audit logging

---

## 5) Resilience patterns
**Why**
- Stop cascading failures.

**Patterns/tools**
- Timeouts (mandatory)
- Retries with backoff + jitter (only for safe/idempotent calls)
- Circuit breaker (Resilience4j)
- Bulkheads (isolation)
- Rate limiting

**Config**
- Per-dependency circuit breakers
- Per-client timeout defaults
- Retry policy by endpoint type
- Fallback strategy (degrade vs fail-fast)

---

## 6) Distributed tracing
**Why**
- Trace a request across services.

**Options**
- OpenTelemetry + Jaeger/Tempo/Zipkin
- AWS X-Ray

**Config**
- Trace propagation (W3C `traceparent` or B3)
- Sampling rules (prod typically not 100%)
- Correlation IDs in logs

---

## 7) Centralized logging
**Why**
- Search logs across all services.

**Options**
- ELK/EFK
- Loki
- CloudWatch Logs

**Config**
- Structured JSON logs
- `traceId`/`requestId`
- Log level per environment
- PII masking

---

## 8) Metrics / monitoring / alerting
**Why**
- Know reliability and performance.

**Options**
- Prometheus + Grafana
- Datadog / New Relic
- CloudWatch

**Config**
- SLIs: latency (p95/p99), error rate, throughput, saturation
- SLOs + alerts (error budget)
- Dashboards per service + dependency dashboards

---

## 9) Security (authn/authz)
**Why**
- Secure external and internal calls.

**Options**
- OAuth2/OIDC IdPs: Cognito / Okta / Azure AD / Keycloak
- mTLS (often via service mesh)

**Config**
- JWT validation (issuer/JWKS/audience)
- Role/permission model
- Service-to-service auth (JWT, mTLS, SPIFFE)
- Network policies (zero trust)

---

## 10) Service-to-service communication
**Types**
- Sync: REST/gRPC
- Async: events/queues

**Config**
- Client libraries (RestClient/WebClient/Feign)
- Timeouts + circuit breaker
- Idempotency keys for creates

---

## 11) Messaging / event streaming
**Why**
- Decouple services, enable async workflows.

**Options**
- Kafka
- RabbitMQ
- AWS SQS/SNS

**Config**
- Topics/queues and retention
- Consumer groups
- Retries + DLQ
- Idempotent consumers (at-least-once delivery)

### Often required extra service: Schema Registry
If using Kafka events:
- Confluent Schema Registry (or equivalent)
- Define compatibility rules (backward/forward)

---

## 12) Data management
**Why**
- Avoid shared database coupling.

**Patterns**
- Database-per-service
- CQRS (sometimes)
- Sagas for distributed workflows

**Config**
- Migrations (Flyway/Liquibase)
- Indexes aligned with queries
- Backup/restore/DR
- Read replicas (if needed)

---

## 13) Deployment platform (Kubernetes)
**Required objects**
- Deployment
- Service
- Ingress (optional)

**Config**
- Replicas
- Rolling updates
- Resource requests/limits
- HPA (autoscaling)
- Readiness/liveness probes
- ConfigMaps/Secrets mounts

---

## 14) CI/CD
**Why**
- Repeatable builds + safe releases.

**Options**
- GitHub Actions / GitLab CI / Jenkins
- ArgoCD / Flux (GitOps)

**Config**
- Build/test/security scan
- Image build + push
- Deploy strategy: rolling / canary / blue-green
- Rollback strategy

---

## 15) Container image registry
**Why**
- Store and pull images.

**Options**
- ECR / GCR / ACR
- Docker Hub

**Config**
- Tagging strategy (semver, git sha)
- Vulnerability scanning

---

## 16) Feature flags
**Why**
- Release safely without redeploy.

**Options**
- LaunchDarkly
- Unleash

---

## 17) Service mesh (optional but common at scale)
**Why**
- Uniform mTLS, traffic policy, retries, observability.

**Options**
- Istio
- Linkerd

**Config**
- mTLS policies
- traffic shifting
- telemetry

---

## 18) Rate limiting and WAF (edge)
**Why**
- Protect against abuse.

**Options**
- Gateway rate limits
- Cloud WAF (AWS WAF)

---

## 19) Governance / platform standards
**Why**
- Consistency and speed across teams.

**Examples**
- Shared build conventions (BOMs, parent POMs)
- Templates (service skeleton)
- Standard error response and API guidelines
- Dependency and CVE management process

---

## Summary: “do we need any other tool/service?”
Common additional services beyond just running microservices:
- **Container registry**
- **Secrets manager**
- **Central logging/metrics/tracing backend** (ELK/Loki + Prometheus + Jaeger/Tempo)
- **CI/CD**
- **Message broker/stream** (Kafka/SQS) and possibly **schema registry**
- Optionally **service mesh** at larger scale
