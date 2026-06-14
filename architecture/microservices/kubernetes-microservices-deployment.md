## Kubernetes Microservices Deployment (Local → AWS EKS)

This file explains how to deploy microservices on Kubernetes with a production-shaped setup:
- **API Gateway**
- **User Service**
- **Order Service**
- **Database**

Includes YAML templates, scaling, probes, rolling updates, local testing, and AWS EKS steps.

---

## 1. Deployment Architecture

### 1.1 Definition
Kubernetes deployment architecture defines how services run (Pods), how they’re exposed (Services/Ingress), and how config/secrets are injected.

### 1.2 Why it exists
Standardizes deployment, scaling, and recovery for microservices across environments.

### 1.3 Diagram

```text
Client
  |
  v
Ingress / API Gateway
  |
  +----------------------+
  |                      |
  v                      v
user-service         order-service
  |                      |
  v                      v
user-db               order-db
```

---

## 2. Kubernetes YAML: Core Resources

### 2.1 `deployment.yaml` (template)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
        - name: user-service
          image: <your-registry>/user-service:1.0
          ports:
            - containerPort: 8081
          resources:
            requests:
              cpu: "100m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8081
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8081
            initialDelaySeconds: 30
            periodSeconds: 10
```

### 2.2 `service.yaml` (ClusterIP)

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
      targetPort: 8081
      protocol: TCP
```

### 2.3 `configmap.yaml` (non-secret config)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: order-config
data:
  SERVICES_USER_BASE_URL: http://user-service
  LOG_LEVEL: INFO
```

### 2.4 `secret.yaml` (secrets)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: order-secrets
type: Opaque
data:
  DB_USERNAME: YXBwdXNlcg==   # base64("appuser")
  DB_PASSWORD: YXBwcGFzcw==   # base64("apppass")
```

Inject ConfigMap + Secret into Deployment:

```yaml
env:
  - name: SERVICES_USER_BASE_URL
    valueFrom:
      configMapKeyRef:
        name: order-config
        key: SERVICES_USER_BASE_URL
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: order-secrets
        key: DB_USERNAME
```

---

## 3. Replica scaling

### 3.1 Why it matters
Scale independently by service load. Keep scaling policy separate from code.

### 3.2 HPA example

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 2
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

## 4. Health checks (Readiness vs Liveness)

- **Readiness**: can it receive traffic?
- **Liveness**: should it be restarted?

Common mistake:
- Using liveness probe for “dependency health” (DB down) → causes restart storms.

---

## 5. Rolling updates

### Internal working
Deployment creates a new ReplicaSet and gradually shifts traffic while keeping availability.

Commands:

```bash
kubectl rollout status deployment/order-service
kubectl rollout undo deployment/order-service
kubectl rollout history deployment/order-service
```

---

## 6. Local testing

### 6.1 Docker Compose (developer workstation)

Why:
- Faster feedback loop for “app + DB” and basic connectivity.

Minimal example:

```yaml
services:
  user-service:
    image: user-service:1.0
    ports: ["8081:8081"]
  order-service:
    image: order-service:1.0
    ports: ["8082:8082"]
    environment:
      SERVICES_USER_BASE_URL: http://user-service:8081
```

### 6.2 Minikube

```bash
minikube start
kubectl apply -f .
minikube service user-service
```

---

## 7. Production deployment to AWS EKS (step-by-step)

### 7.1 EKS architecture (concept)

```text
AWS EKS
  - Managed Control Plane (API server / etcd)
  - Worker nodes (EC2 managed node groups) in VPC subnets
  - Load balancer integration (ALB/NLB)
```

### 7.2 Create cluster (example with eksctl)

```bash
eksctl create cluster --name ms-prod --region us-east-1 --nodes 3
aws eks update-kubeconfig --name ms-prod --region us-east-1
kubectl get nodes
```

### 7.3 Push images (ECR outline)

- Create ECR repositories for each service.
- Build and push Docker images.
- Update `image:` fields in deployments.

### 7.4 Deploy manifests

```bash
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f user-deployment.yaml
kubectl apply -f user-service.yaml
kubectl apply -f order-deployment.yaml
kubectl apply -f order-service.yaml
kubectl apply -f ingress.yaml
```

### 7.5 Enterprise best practices for EKS

- Use IRSA (IAM Roles for Service Accounts) for AWS access (no static keys).
- Use Cluster Autoscaler / Karpenter.
- Use ALB Ingress Controller for HTTP and WAF integration.
- Use NetworkPolicies + security groups + private subnets.

---

## Interview questions

- Explain readiness vs liveness and typical failure modes.
- How do you do safe rollouts and rollbacks in Kubernetes?
- How would you expose services publicly on EKS?
- What are common misconfigurations that cause outages?

