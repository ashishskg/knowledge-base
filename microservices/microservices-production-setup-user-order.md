# Microservices production setup (User + Order): configurations + implementation examples

This document shows how you typically configure and implement production-grade microservices capabilities using two example services:
- `user-service`
- `order-service`

Assumptions:
- Spring Boot 3.x
- Kubernetes (EKS/GKE/AKS or self-managed)
- OAuth2/OIDC for auth
- HTTP service-to-service calls for simplicity

---

## 1) Service naming + ports (baseline)

### user-service `application.yml`
```yaml
spring:
  application:
    name: user-service
server:
  port: 8080
```

### order-service `application.yml`
```yaml
spring:
  application:
    name: order-service
server:
  port: 8080
```

---

## 2) Service discovery

### Option A (recommended on Kubernetes): Kubernetes DNS
**How it works**
- Service discovery is handled by K8s Service DNS.
- `order-service` calls `http://user-service` (Service name).

**K8s Service name**
- `user-service.default.svc.cluster.local`

**No extra discovery client required**.

### Option B (non-K8s): Eureka/Consul
If not using K8s, you configure registration + discovery clients.

---

## 3) API Gateway

### Typical responsibilities
- route `/api/users/**` → user-service
- route `/api/orders/**` → order-service
- auth at edge (optional but common)
- rate limits, request size limits

### Spring Cloud Gateway (example)
**Gateway `application.yml`**
```yaml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      httpclient:
        connect-timeout: 2000
        response-timeout: 5s
      routes:
        - id: user-service
          uri: http://user-service
          predicates:
            - Path=/api/users/**
          filters:
            - StripPrefix=1
        - id: order-service
          uri: http://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=1
```

**Production notes**
- Add rate limiting either in gateway or in WAF.
- Configure timeouts aggressively.

---

## 4) Centralized configuration

### Option A: Kubernetes ConfigMap + env vars (common)
- Keep app config in ConfigMaps
- Keep secrets in Secrets

Example `ConfigMap`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: user-service-config
data:
  APPLICATION_YML: |
    app:
      featureX: true
```

Mount as file or map to env vars.

### Option B: Spring Cloud Config / AWS SSM
Use if you want centralized config with history and environment overlays.

---

## 5) Secrets management

### Common options
- AWS Secrets Manager (recommended on AWS)
- HashiCorp Vault
- Kubernetes Secrets

Example K8s Secret:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: user-service-secrets
type: Opaque
data:
  DB_PASSWORD: <base64>
```

---

## 6) Resilience (timeouts + circuit breaker + retry)

### Key rule
- Always configure **timeouts** first.
- Add **circuit breakers** per dependency.
- Use **retries** only for idempotent calls.

### Library (Resilience4j)
**Typical dependencies**
- `resilience4j-spring-boot3`
- `spring-boot-starter-actuator`

### Example: order-service calling user-service with circuit breaker
```java
@CircuitBreaker(name = "userService", fallbackMethod = "fallbackUser")
public UserDto getUser(String userId) {
  return restClient.get().uri("/api/v1/users/{id}", userId)
      .retrieve().body(UserDto.class);
}

private UserDto fallbackUser(String userId, Throwable ex) {
  throw new DependencyUnavailableException("user-service unavailable", ex);
}
```

### Production-style Resilience4j config (order-service)
```yaml
resilience4j:
  circuitbreaker:
    instances:
      userService:
        slidingWindowType: COUNT_BASED
        slidingWindowSize: 50
        minimumNumberOfCalls: 20
        failureRateThreshold: 50
        slowCallRateThreshold: 50
        slowCallDurationThreshold: 2s
        waitDurationInOpenState: 30s
        permittedNumberOfCallsInHalfOpenState: 10
        automaticTransitionFromOpenToHalfOpenEnabled: true
        recordExceptions:
          - java.io.IOException
          - java.net.SocketTimeoutException
  timelimiter:
    instances:
      userService:
        timeoutDuration: 2s
```

---

## 7) Distributed tracing (OpenTelemetry)

### Goal
- Every request has `traceId` propagated across gateway → order-service → user-service.

### Typical production setup
- OpenTelemetry Java agent OR library instrumentation
- Trace backend: Jaeger/Tempo/X-Ray

### Spring Boot config (example)
```yaml
management:
  tracing:
    sampling:
      probability: 0.1
```

**Production notes**
- Don’t sample 100% in high traffic.
- Ensure trace context propagation for outbound HTTP clients.

---

## 8) Centralized logging

### Requirements
- JSON logs
- include `traceId` in every log line

**Production notes**
- Ship logs via FluentBit/Fluentd
- Store in ELK/Loki/CloudWatch

---

## 9) Metrics + monitoring + alerting

### Expose metrics
- Use Spring Boot Actuator + Micrometer
- Scrape via Prometheus or vendor agent

Example:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

Alerting best practice:
- Alert on SLO burn (error rate, latency), not raw CPU only.

---

## 10) Security (OAuth2/OIDC)

### Recommended model
- Gateway validates external tokens (optional)
- Services validate tokens (recommended) as resource servers

**Spring Boot resource server config (example)**
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://<your-issuer>
```

**Production notes**
- Use JWKS caching
- Apply least privilege (scopes/roles)

---

## 11) Service-to-service auth

Options:
- Internal JWT (service account tokens)
- mTLS via service mesh

Production note:
- If you adopt a mesh, mTLS is often the default and easiest to standardize.

---

## 12) Data layer

### Typical production requirements
- DB migrations (Flyway/Liquibase)
- connection pooling
- indexes aligned to queries
- backups and restore testing

Example Flyway config:
```yaml
spring:
  flyway:
    enabled: true
```

---

## 13) Messaging/eventing (optional but common)

If you have workflows (create order → billing → shipping), consider async events.

Options:
- Kafka
- SQS/SNS

Configuration considerations:
- DLQ
- retries
- idempotent consumers
- schema versioning (Schema Registry)

---

## 14) Kubernetes deployment (user-service and order-service)

### Deployment (3 replicas)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: <registry>/user-service:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health
              port: 8080
            initialDelaySeconds: 20
            periodSeconds: 10
```

### Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080
```

Repeat similarly for `order-service`.

---

## 15) Autoscaling (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

---

## 16) CI/CD

Typical pipeline stages:
- build + unit tests
- integration tests
- security scans (SCA + container scan)
- build image + push to registry
- deploy (ArgoCD/Flux or pipeline apply)

Production notes:
- use canary/blue-green for risky changes
- always have rollback

---

## 17) Container image registry

You need:
- ECR/GCR/ACR/DockerHub
- image tags (git SHA)
- vulnerability scanning

---

## 18) Service mesh (optional)

Use if you need:
- standardized mTLS
- traffic shifting
- consistent telemetry

Options:
- Istio
- Linkerd

---

## 19) Edge protection (WAF + rate limiting)

On AWS:
- AWS WAF in front of ALB/API Gateway
- throttle abusive clients

---

## 20) Governance / platform standards

Examples:
- standard API error format
- standard logging/tracing libs
- standard Helm charts
- dependency update and CVE policy

---

## “Any other tools/services required?” (common production add-ons)
- Registry (ECR)
- Secrets manager (Secrets Manager/Vault)
- Observability backend (Prometheus/Grafana + Jaeger/Tempo + log store)
- CI/CD (GitHub Actions/Jenkins + ArgoCD)
- Messaging broker (Kafka/SQS) and possibly schema registry
- Optional service mesh
