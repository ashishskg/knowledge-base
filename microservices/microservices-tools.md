Microservice Tools for Spring Boot

Service Discovery
- Current: Eureka (Spring Cloud Netflix) - service registry and client-side discovery
- Alternative: Consul - registry, KV store, and health checks
- Deprecated/old: Zookeeper (as discovery in Spring Cloud) -> Replace with Consul or Eureka
- Concept: Dynamic lookup of service instances (client-side or server-side)

API Gateway
- Current: Spring Cloud Gateway - reactive routing, filters, and auth
- Alternative: Kong, NGINX, Traefik - edge gateway/ingress
- Deprecated/old: Zuul 1 -> Replace with Spring Cloud Gateway or Kong
- Concept: Single entry point, routing, rate-limit, auth, observability

Centralized Config
- Current: Spring Cloud Config Server - git-backed configuration
- Alternative: Vault, Consul KV, AWS SSM
- Deprecated/old: Archaius -> Replace with Spring Cloud Config
- Concept: Externalized configuration with environment separation

Security
- Current: Spring Security 6 with OAuth2 Resource Server
- Alternative: Keycloak, Auth0, Okta (identity providers)
- Deprecated/old: Spring Security OAuth (legacy) -> Replace with spring-boot-starter-oauth2-resource-server
- Concept: Authentication, authorization, and JWT validation

Resilience / Fault Tolerance
- Current: Resilience4j - circuit breakers, retries, bulkheads
- Alternative: Envoy or Istio (service mesh)
- Deprecated/old: Hystrix -> Replace with Resilience4j
- Concept: Protect services from cascading failures

Feign Client
- Current: Spring Cloud OpenFeign
- Alternative: WebClient, RestClient (Spring 6)
- Deprecated/old: Ribbon (client-side LB) -> Replace with Spring Cloud LoadBalancer
- Concept: Declarative HTTP clients with load balancing

Observability (Metrics + Tracing + Logs)
- Metrics current: Micrometer + Prometheus
- Tracing current: Micrometer Tracing + OpenTelemetry
- Deprecated/old: Spring Cloud Sleuth -> Replace with Micrometer Tracing
- Concept: Metrics, traces, and log correlation

Monitoring / Visualization
- Metrics store: Prometheus
- Dashboard: Grafana
- Deprecated/old: Graphite (less common now) -> Replace with Prometheus
- Concept: Time-series metrics collection and visualization

Suggested Modern Stack
- Discovery: Eureka or Consul
- Gateway: Spring Cloud Gateway
- Config: Spring Cloud Config
- Security: Spring Security + OAuth2 Resource Server
- Resilience: Resilience4j
- Client: OpenFeign + Spring Cloud LoadBalancer
- Metrics: Micrometer + Prometheus
- Tracing: Micrometer Tracing + OpenTelemetry
- Dashboards: Grafana
