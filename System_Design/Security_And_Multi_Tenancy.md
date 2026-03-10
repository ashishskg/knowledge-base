# Security and Multi-Tenancy

## Index

- [Authentication and authorization](#authentication-and-authorization)
- [Encryption](#encryption)
- [Multi-tenancy strategies](#multi-tenancy-strategies)
- [Rate limiting and input validation](#rate-limiting-and-input-validation)
- [Common threats at design level](#common-threats-at-design-level)
- [See also](#see-also)

---

## Authentication and authorization

**Authentication (AuthN):** “Who are you?” — verify identity (e.g. username/password, SSO, OAuth2/OIDC, API keys, mTLS). Use standard protocols (OAuth2, OIDC) and avoid storing raw passwords; use hashing (e.g. bcrypt) if you do.

**Authorization (AuthZ):** “What can you do?” — enforce permissions. **RBAC:** roles (e.g. admin, viewer) with permissions; assign roles to users. **ABAC:** policies based on attributes (user, resource, context). Prefer RBAC for simplicity; ABAC when you need fine-grained or context-based rules.

**API design:** Validate token or session on every request; resolve identity and then check permissions for the resource (e.g. “can this user access this order?”). Use short-lived tokens and refresh flow for UX and security.

---

## Encryption

- **In transit:** TLS for all client–server and server–server communication. No sensitive data over plain HTTP.
- **At rest:** Encrypt sensitive data in DB and object storage (e.g. AES; use KMS for key management). For PII or payment data, encryption at rest is usually required by policy or regulation.
- **Secrets:** Store API keys, DB passwords, and signing keys in a secrets manager (e.g. Vault, cloud secret store); inject at runtime; rotate periodically. Never commit secrets to code or logs.

---

## Multi-tenancy strategies

| Strategy | Description | Use when |
|----------|-------------|----------|
| **Shared DB, tenant_id** | One schema; every row has `tenant_id`; all queries filter by tenant | Cost-sensitive, many small tenants; strict row-level checks |
| **Schema per tenant** | One schema per tenant in same DB | Medium isolation, some per-tenant customization |
| **DB per tenant** | Separate database per tenant | Strong isolation, compliance, or large tenants |

Design for tenant isolation: never trust client; always enforce tenant_id in queries and APIs. Use connection or context to set tenant so developers cannot forget to filter.

---

## Rate limiting and input validation

- **Rate limiting:** Limit requests per user/IP/key to prevent abuse and DDoS. Token bucket or sliding window; return 429 when exceeded. Apply at gateway or at service; distinguish authenticated vs anonymous limits.
- **Input validation:** Validate and sanitize all inputs (length, type, format, range). Reject invalid input early. Use parameterized queries to prevent SQL injection; encode output to prevent XSS.

---

## Common threats at design level

| Threat | Mitigation |
|--------|------------|
| **SQL injection** | Parameterized queries only; least privilege DB user |
| **XSS** | Encode output; CSP; avoid eval and innerHTML with user data |
| **CSRF** | SameSite cookies; CSRF tokens for state-changing requests |
| **Broken auth** | Strong auth (OAuth2/OIDC), short-lived tokens, secure session store |
| **Sensitive data exposure** | Encrypt at rest and in transit; mask in logs; restrict access |

In interviews: “We use parameterized queries and never concatenate user input into SQL”; “Payment data is in a scoped service with encryption and PCI-focused controls.”

---

## See also

- [Observability_And_Operations](Observability_And_Operations.md) — audit logging.
- [Example_Ecommerce_System](Example_Ecommerce_System.md) — payment and PII handling.
- [Requirements_And_NFRs](Requirements_And_NFRs.md) — security NFRs.
