## Kubernetes — Complete Enterprise Guide

---

## 0. How to Use This Guide

- **Audience**:
  - Beginners learning Kubernetes fundamentals.
  - Developers deploying microservices.
  - DevOps/SRE managing production clusters.
  - Architects designing large-scale cloud-native platforms.
- **Scope**:
  - Covers Kubernetes concepts from Pods to advanced autoscaling, storage, networking, and real microservice deployments on local clusters and AWS EKS.
- **Conventions**:
  - YAML snippets use `---` documents; commands use `$` prompt.

---

## 1. Introduction to Kubernetes

### 1.1 What is Kubernetes?

**Definition**  
Kubernetes (K8s) is an open-source **container orchestration platform** for automating deployment, scaling, and management of containerized applications.

### 1.2 Why Kubernetes was created / problems it solves

- Manual container deployment (on many hosts) is error-prone.
- Need for:
  - Automatic **rescheduling** of failed containers.
  - **Declarative** desired state (how many instances, where, with what config).
  - **Service discovery**, load balancing, scaling, rolling updates.

Kubernetes provides:
- A declarative API for describing desired cluster state.
- A reconciler loop that constantly drives actual state -> desired state.

### 1.3 Kubernetes vs Docker

| Aspect            | Docker                                   | Kubernetes                                       |
|-------------------|-------------------------------------------|--------------------------------------------------|
| Main focus        | Build/run containers on a single host     | Orchestrate containers across many nodes        |
| Abstractions      | Images, containers, volumes, networks     | Pods, Deployments, Services, Ingress, etc.      |
| Scheduling        | None (manual)                             | Built-in scheduler                               |
| Self-healing      | Limited (restart policy)                  | Reschedules Pods, handles node failures         |

Docker is a **runtime**; Kubernetes is an **orchestrator** (uses a container runtime like containerd).

### 1.4 Kubernetes ecosystem (high-level)

```text
Kubernetes
  ├─ Core APIs (Pods, Services, Deployments, etc.)
  ├─ Add-ons (Ingress controllers, DNS, metrics)
  ├─ CNI plugins (Calico, Cilium, Flannel)
  ├─ CSI plugins (storage drivers)
  ├─ Service mesh (Istio, Linkerd, Kuma)
  └─ Observability (Prometheus, Grafana, ELK)
```

---

## 2. Kubernetes Architecture

### 2.1 Cluster layout

```text
           +------------------------+
           |      K8s Cluster       |
           +-----------+------------+
                       |
             Control Plane (master)
        +---------+---------+--------+
        |         |         |        |
   API Server  Scheduler  CtlrMgr   etcd

        Worker Nodes
        +------------------------------+
        | Node 1   Node 2   Node 3    |
        | kubelet  kubelet  kubelet   |
        | kube-proxy ...              |
        +------------------------------+
```

### 2.2 Control Plane components

- **API Server**:
  - Front door to the cluster (all kubectl/clients talk to it).
  - Validates and persists resource definitions to `etcd`.
- **Scheduler**:
  - Assigns Pods to Nodes based on resource requests, policies, affinity/anti-affinity.
- **Controller Manager**:
  - Runs controllers (DeploymentController, ReplicaSetController, NodeController, etc.) that reconcile desired vs actual state.
- **etcd**:
  - Highly available key–value store.
  - Stores cluster state (all API objects).

### 2.3 Worker node components

- **kubelet**:
  - Node agent.
  - Ensures Pods are running as expected on that node (talks to container runtime).
- **kube-proxy**:
  - Implements Service virtual IPs and load-balancing rules (iptables/IPVS).
- **Container runtime**:
  - containerd, CRI-O, etc.

### 2.4 How they communicate

- API server is central hub.
- kubelet pulls Pod specs from API server and reports status back.
- Controllers watch API server via watches and update resources.
- etcd is storage back-end for API server.

**Interview questions**
- Describe the role of `kube-apiserver`.
- How does the scheduler decide which node to place a Pod on?

---

## 3. Kubernetes Core Concepts

### 3.1 Cluster, Node, Pod, Container

- **Cluster**: set of machines (nodes) managed by Kubernetes control plane.
- **Node**: worker machine (VM or bare metal) running Pods.
- **Pod**: smallest deployable unit; one or more containers sharing network & storage.
- **Container**: application runtime unit (Docker/OCI).

### 3.2 Pod lifecycle (simplified)

```text
Pending -> Scheduled -> Running -> Succeeded / Failed
   ^                                          |
   |                                          v
 Terminating <------------------------ delete / evict
```

**YAML example (simple Pod)**:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      ports:
        - containerPort: 80
```

---

## 4. Kubernetes Pod

### 4.1 What is a Pod and why it exists

**Definition**
- Pod is a logical host for one or more containers.
- Containers in same Pod:
  - Share **network namespace** (same IP and ports).
  - Share **volumes**.

**Why**
- Co-locate tightly coupled containers (sidecars) that must share resources.

### 4.2 Multi-container Pod example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-with-sidecar
spec:
  containers:
    - name: nginx
      image: nginx:1.27
      ports:
        - containerPort: 80
    - name: log-agent
      image: busybox
      command: ["sh", "-c", "tail -n+1 -F /var/log/nginx/access.log"]
      volumeMounts:
        - name: logs
          mountPath: /var/log/nginx
  volumes:
    - name: logs
      emptyDir: {}
```

Best practice:
- Use multi-container Pods for cross-cutting concerns (logging, proxy, sidecars), not for independent services.

---

## 5. Labels and Selectors

### 5.1 Definition

- **Label**: key/value pair attached to objects.
- **Selector**: query/filter that selects objects by labels.

Example:

```yaml
metadata:
  labels:
    app: order-service
    env: prod
```

Selector in a Service:

```yaml
spec:
  selector:
    app: order-service
```

Best practices:
- Standardize labels:
  - `app`, `component`, `version`, `environment`.

---

## 6. ReplicaSet

### 6.1 Definition

**ReplicaSet** ensures a specified number of Pod replicas are running at any given time.

### 6.2 YAML example

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
```

Scaling:

```bash
$ kubectl scale rs nginx-rs --replicas=5
```

In practice, you use **Deployments** instead of managing ReplicaSets directly.

---

## 7. Deployment

### 7.1 Definition & why

**Deployment** is a higher-level controller managing ReplicaSets and rolling updates.

### 7.2 Deployment vs ReplicaSet

- ReplicaSet: maintains N replicas of a Pod template.
- Deployment: maintains ReplicaSets over time, supports:
  - rolling updates
  - rollbacks

### 7.3 Example Deployment YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
```

Rolling update:

```bash
$ kubectl set image deployment/nginx-deployment nginx=nginx:1.28
$ kubectl rollout status deployment/nginx-deployment
```

Rollback:

```bash
$ kubectl rollout undo deployment/nginx-deployment
```

---

## 8. Services

### 8.1 Service types

| Type         | Scope                 | Use case                                   |
|--------------|-----------------------|--------------------------------------------|
| ClusterIP    | internal cluster-only | default; service-to-service communication  |
| NodePort     | node IP + static port | simple external access (dev/test)          |
| LoadBalancer | external LB           | cloud LB for production exposure           |
| ExternalName | DNS alias             | external service alias                     |

### 8.2 Example Service YAML (ClusterIP)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
```

### 8.3 NodePort example

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-nodeport
spec:
  type: NodePort
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
```

Service discovery:
- Pods access `order-service` via DNS: `http://order-service` (within namespace).

---

## 9. ConfigMap

### 9.1 Definition

Stores non-sensitive configuration data as key/value pairs.

### 9.2 Example ConfigMap YAML

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  SPRING_PROFILES_ACTIVE: prod
  LOG_LEVEL: INFO
```

Mount as env vars:

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

---

## 10. Secrets

### 10.1 Definition

Stores small sensitive data (passwords, tokens) in base64-encoded form.

### 10.2 Example Secret YAML

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YXBwdXNlcg==   # base64("appuser")
  password: YXBwcGFzcw==   # base64("apppass")
```

Use in Pod:

```yaml
env:
  - name: DB_USERNAME
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: username
```

Best practice:
- Use cloud secret managers for high-security environments; sync to K8s via controllers.

---

## 11. Volumes and Storage

### 11.1 Volume types

- `emptyDir`: ephemeral storage shared between containers in a Pod.
- `hostPath`: mounts host filesystem path (avoid in prod).
- `PersistentVolume` (PV) + `PersistentVolumeClaim` (PVC): abstract storage from implementation.
- StorageClass: defines dynamic provisioning templates.

### 11.2 PV/PVC example

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: db-data
spec:
  accessModes: [ "ReadWriteOnce" ]
  resources:
    requests:
      storage: 10Gi
  storageClassName: gp2
```

Use PVC:

```yaml
volumes:
  - name: db-storage
    persistentVolumeClaim:
      claimName: db-data
```

---

## 12. StatefulSets

### 12.1 Definition & when to use

- Used for **stateful applications**:
  - Stable network identity.
  - Stable persistent storage.
  - Ordered deployment and scaling.

Example use cases:
- Databases, Kafka, ZooKeeper.

Minimal YAML snippet:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: 20Gi
```

---

## 13. DaemonSets

### 13.1 Definition

- Ensures **one Pod per node** (or subset of nodes).

Use cases:
- Log shippers (Fluentd, Filebeat).
- Node-level monitoring agents.

Example:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      containers:
        - name: fluentd
          image: fluent/fluentd:v1.16
          volumeMounts:
            - name: varlog
              mountPath: /var/log
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
```

---

## 14. Jobs and CronJobs

### 14.1 Jobs

- Run Pods to completion (batch tasks).

Example:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrator
          image: myorg/migrator:1.0
          command: ["./migrate.sh"]
```

### 14.2 CronJobs

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-report
spec:
  schedule: "0 1 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: reporter
              image: myorg/report:1.0
              command: ["./generate-report.sh"]
```

---

## 15. Ingress

### 15.1 Definition

- Manages **external HTTP/HTTPS access** to Services.
- Requires an **Ingress Controller** (NGINX, Traefik, AWS ALB, etc.).

Example:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: orders-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /orders
            pathType: Prefix
            backend:
              service:
                name: order-service
                port:
                  number: 80
```

---

## 16. Horizontal Pod Autoscaler (HPA)

### 16.1 Definition

- Automatically scales the number of Pod replicas based on metrics (CPU, memory, custom).

Example (CPU-based):

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
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

## 17. Kubernetes Networking (Enterprise View)

- **Pod networking**: each Pod gets its own IP; all Pods can communicate (flat network).
- **CNI plugins**: provide Pod-to-Pod connectivity (Calico, Cilium, Flannel).
- **Service networking**:
  - `kube-proxy` programs iptables/IPVS for stable VIPs.

Enterprise considerations:
- Network policies for zero-trust networking.
- Multi-cluster mesh for service-to-service traffic across regions.

---

## 18. Security

### 18.1 RBAC

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "watch", "list"]
```

```yaml
kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: read-pods
subjects:
  - kind: User
    name: alice
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### 18.2 Service Accounts

Assign identities to Pods for in-cluster auth.

### 18.3 Network Policies

Restrict traffic between Pods.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

---

## 19. Monitoring

### 19.1 Prometheus & Grafana

- Prometheus: metrics collection via scraping.
- Grafana: dashboards and visualization.

### 19.2 Logging

- Centralized logging: EFK (Elasticsearch, Fluentd, Kibana) or Loki/Fluent Bit.

Enterprise patterns:
- Use a standard observability stack per cluster with SLOs and alerting.

---

## 20. Kubernetes CLI (`kubectl`)

### 20.1 Basic commands

```bash
$ kubectl get pods
$ kubectl get pods -n my-namespace
$ kubectl describe pod <name>
$ kubectl logs <pod> [-c container] [-f]
$ kubectl exec -it <pod> -- /bin/sh
$ kubectl apply -f resource.yaml
$ kubectl delete -f resource.yaml
```

Other common:

```bash
$ kubectl get deploy
$ kubectl get svc
$ kubectl get nodes
$ kubectl top pods
```

---

## 21. Kubernetes YAML Structure

Key fields:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
  labels:
    app: my-app
spec:
  replicas: 3
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: myimage:1.0
status:
  # set by Kubernetes at runtime
```

- `apiVersion`: version of the Kubernetes API.
- `kind`: resource type.
- `metadata`: name, labels, annotations.
- `spec`: desired state.
- `status`: current state set by K8s.

---

## 22. Kubernetes Best Practices

- Set **resource requests/limits** for CPU/memory.
- Configure **liveness** and **readiness** probes.
- Use **namespaces** to isolate environments.
- Immutable images, versioned tags.
- Use ConfigMaps/Secrets for configuration.

Example probes:

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
```

---

## 23. Real Microservices Example (Spring Boot, Java 21)

### 23.1 Order Service (concept)

Endpoints:
- `GET /orders/{id}`
- `POST /orders`

DTO with records:

```java
record CreateOrderRequest(String productId, int quantity) {}
record OrderResponse(long id, String status) {}
```

Controller skeleton:

```java
@RestController
@RequestMapping("/orders")
class OrderController {
    @PostMapping
    OrderResponse create(@RequestBody CreateOrderRequest req) { ... }

    @GetMapping("/{id}")
    OrderResponse get(@PathVariable long id) { ... }
}
```

### 23.2 Payment Service (concept)

Endpoints:
- `POST /payments`

Same style DTOs using records.

---

## 24. Docker Images for Microservices

### 24.1 Order Service Dockerfile

```Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/order-service.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

### 24.2 Payment Service Dockerfile

```Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/payment-service.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]
```

Build:

```bash
$ mvn clean package -DskipTests
$ docker build -t order-service:1.0 ./order-service
$ docker build -t payment-service:1.0 ./payment-service
```

---

## 25. Kubernetes Deployment for Microservices

### 25.1 order-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: <your-registry>/order-service:1.0
          ports:
            - containerPort: 8080
```

### 25.2 payment-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
        - name: payment-service
          image: <your-registry>/payment-service:1.0
          ports:
            - containerPort: 8081
```

### 25.3 Services

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: payment-service
spec:
  selector:
    app: payment-service
  ports:
    - port: 80
      targetPort: 8081
```

---

## 26. Run Kubernetes Locally

### 26.1 Docker Desktop Kubernetes

- Enable Kubernetes from Docker Desktop settings.
- `kubectl` is configured automatically.

Check:

```bash
$ kubectl get nodes
```

### 26.2 Minikube

```bash
$ minikube start
$ kubectl get nodes
```

### 26.3 Kind (Kubernetes in Docker)

```bash
$ kind create cluster --name dev
$ kubectl get nodes
```

Apply manifests:

```bash
$ kubectl apply -f order-deployment.yaml
$ kubectl apply -f payment-deployment.yaml
```

---

## 27. Deploy to AWS EKS (High-Level)

### 27.1 EKS architecture

```text
AWS EKS
  ├─ Managed control plane (API server, etcd)
  └─ Worker nodes (EC2 or Fargate) in your VPC
```

### 27.2 Steps (simplified)

1. Create EKS cluster (using `eksctl` or AWS Console).

```bash
$ eksctl create cluster --name my-eks --region us-east-1 --nodes 3
```

2. Configure `kubectl`:

```bash
$ aws eks update-kubeconfig --name my-eks --region us-east-1
```

3. Push images to ECR:
   - Create ECR repos.
   - Tag and push images.

4. Apply K8s manifests:

```bash
$ kubectl apply -f order-deployment.yaml
$ kubectl apply -f payment-deployment.yaml
```

5. Expose via Service (LoadBalancer) and/or Ingress + ALB Ingress Controller.

---

## 28. Enterprise Kubernetes Architecture

### 28.1 Typical production architecture

```text
           +------------------------+
           |     API Gateway        |
           +-----------+------------+
                       |
                    Ingress
                       |
          +------------+------------+
          |  Service Mesh (Istio)   |
          +------------+------------+
                       |
          +------------+------------+
          |   Microservices (Pods)  |
          +------------+------------+
                       |
          +------------+------------+
          |  Databases / Queues     |
          +-------------------------+
```

Key components:
- API gateway / ingress.
- Service mesh for mTLS, traffic shaping, retries.
- Autoscaling (HPA/VPA).
- Multi-cluster / multi-region via federation or mesh.

---

## 29. Kubernetes Interview Questions

### 29.1 Beginner

- What is a Pod? Why not deploy containers directly?
- Difference between Deployment and ReplicaSet?
- What does a Service do?

### 29.2 Intermediate

- Compare ClusterIP, NodePort, and LoadBalancer.
- How does rolling update work for a Deployment?
- Explain how ConfigMap and Secret differ and how they are mounted.
- When would you use a StatefulSet vs Deployment?

### 29.3 Senior DevOps

- Explain the control plane components and their roles.
- Describe how HPA works and how you would tune autoscaling thresholds.
- How do you secure a cluster (RBAC, Network Policies, Pod Security)?
- How do you debug a crashlooping Pod?

### 29.4 Architect

- Design a multi-region, multi-cluster deployment strategy.
- Compare using a service mesh vs a simple ingress-based architecture.
- How do you manage configuration and secrets across environments and clusters?
- How would you design observability (metrics, logs, traces) for 200+ microservices on Kubernetes?

---

## 30. Kubernetes Cheat Sheet

### 30.1 `kubectl` essentials

```bash
kubectl get pods [-n ns]
kubectl describe pod <name>
kubectl logs <pod> [-c container] [-f]
kubectl exec -it <pod> -- /bin/sh
kubectl get deploy,svc,ingress
kubectl apply -f file.yaml
kubectl delete -f file.yaml
kubectl rollout status deployment/<name>
kubectl rollout undo deployment/<name>
```

### 30.2 YAML templates

- Pod, Deployment, Service, Ingress, HPA, ConfigMap, Secret shown in previous sections.

### 30.3 Troubleshooting tips

- Check Pod events:

```bash
kubectl describe pod <pod>
```

- Check node status:

```bash
kubectl get nodes
```

- Exec into containers to inspect environment/logs:

```bash
kubectl exec -it <pod> -- /bin/sh
```

Use this guide as a blueprint for **designing, deploying, and operating** Kubernetes-based systems—from local development clusters to enterprise-grade, multi-region architectures. 

---

## 31. Stateful MySQL for Microservices

This section gives you a **complete, ready-to-apply setup** for running MySQL as a StatefulSet and wiring the **Order** and **Payment** Spring Boot microservices to it.

### 31.1 Design overview

```text
          +---------------------+
          |  order-service Pod  |  ---> uses jdbc:mysql://mysql:3306/orders_db
          +---------------------+
                     |
          +---------------------+
          | payment-service Pod |  ---> uses jdbc:mysql://mysql:3306/payments_db
          +---------------------+
                     |
                 +-------+
   Headless Svc  | mysql |  (DNS: mysql.default.svc.cluster.local)
                 +---+---+
                     |
               StatefulSet Pods
              mysql-0, mysql-1, ...
                     |
            Per-Pod Persistent Volumes
```

- **MySQL** runs as a **StatefulSet** with:
  - Headless `Service` named `mysql`.
  - `PersistentVolumeClaim` per Pod for data.
- **order-service** and **payment-service**:
  - Take DB config from **Secrets/env vars**.
  - Connect using the MySQL Service DNS name `mysql`.

---

### 31.2 MySQL credentials Secret

File: `mysql-secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
data:
  mysql-root-password: cm9vdHBhc3M=       # base64("rootpass")
  mysql-user: YXBwdXNlcg==               # base64("appuser")
  mysql-password: YXBwcGFzcw==           # base64("apppass")
  mysql-orders-database: b3JkZXJzX2Ri    # base64("orders_db")
  mysql-payments-database: cGF5bWVudHNfZGI= # base64("payments_db")
```

Best practices:
- Use different users per microservice in real systems (here we keep it simple).
- Generate strong passwords and avoid committing raw values; use a secret manager in production.

---

### 31.3 Headless Service for MySQL

File: `mysql-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
  labels:
    app: mysql
spec:
  clusterIP: None              # headless for StatefulSet
  selector:
    app: mysql
  ports:
    - name: mysql
      port: 3306
      targetPort: 3306
      protocol: TCP
```

Why headless?
- For StatefulSets, this gives each Pod a stable DNS record (e.g., `mysql-0.mysql`), useful for clustering.
- Clients can still use `mysql` as the hostname for simple single-primary setups.

---

### 31.4 MySQL StatefulSet with persistent storage

File: `mysql-statefulset.yaml`

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-root-password
            - name: MYSQL_USER
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-user
            - name: MYSQL_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-password
            # One default DB; services can create/use their own schemas
            - name: MYSQL_DATABASE
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-orders-database
          volumeMounts:
            - name: mysql-data
              mountPath: /var/lib/mysql
  volumeClaimTemplates:
    - metadata:
        name: mysql-data
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 10Gi
        # Use the default StorageClass or set explicitly, e.g. "gp2" on EKS
        # storageClassName: gp2
```

Notes:
- `replicas: 1` keeps it simple; for HA MySQL you would use operator solutions (e.g., Percona, Vitess).
- `volumeClaimTemplates` ensures each Pod (mysql-0, mysql-1, …) gets its own PV.

---

### 31.5 Updating Order Service Deployment to use MySQL

Replace the earlier `order-service` Deployment with this version (file: `order-deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: <your-registry>/order-service:1.0
          ports:
            - containerPort: 8080
          env:
            - name: SPRING_DATASOURCE_URL
              value: jdbc:mysql://mysql:3306/orders_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
            - name: SPRING_DATASOURCE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-user
            - name: SPRING_DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-password
            - name: SPRING_JPA_HIBERNATE_DDL_AUTO
              value: update
            - name: SPRING_JPA_SHOW_SQL
              value: "false"
```

In `application.yml` (inside the app), you can bind:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: ${SPRING_JPA_HIBERNATE_DDL_AUTO:update}
    show-sql: ${SPRING_JPA_SHOW_SQL:false}
```

---

### 31.6 Updating Payment Service Deployment to use MySQL

File: `payment-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: payment-service
  template:
    metadata:
      labels:
        app: payment-service
    spec:
      containers:
        - name: payment-service
          image: <your-registry>/payment-service:1.0
          ports:
            - containerPort: 8081
          env:
            - name: SPRING_DATASOURCE_URL
              value: jdbc:mysql://mysql:3306/payments_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
            - name: SPRING_DATASOURCE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-user
            - name: SPRING_DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: mysql-password
            - name: SPRING_JPA_HIBERNATE_DDL_AUTO
              value: update
            - name: SPRING_JPA_SHOW_SQL
              value: "false"
```

If you prefer a **single schema** (e.g., `orders_db`) shared by both services, you can reuse the same DB name; for stricter isolation, create separate schemas and/or users.

---

### 31.7 Services for Order and Payment (unchanged)

For completeness (file: `microservices-services.yaml`):

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: payment-service
spec:
  selector:
    app: payment-service
  ports:
    - port: 80
      targetPort: 8081
```

---

### 31.8 Apply order (local or EKS)

```bash
# 1) Create secrets
kubectl apply -f mysql-secret.yaml

# 2) Create MySQL Service + StatefulSet
kubectl apply -f mysql-service.yaml
kubectl apply -f mysql-statefulset.yaml

# 3) Deploy microservices + their Services
kubectl apply -f order-deployment.yaml
kubectl apply -f payment-deployment.yaml
kubectl apply -f microservices-services.yaml
```

Verify:

```bash
kubectl get pods
kubectl get svc

# Optional: connect into mysql Pod
kubectl exec -it mysql-0 -- mysql -uappuser -papppass orders_db
```

This completes a **stateful MySQL setup** for your **Order** and **Payment** microservices with persistent storage, secrets-based credentials, and clean wiring via Kubernetes Services. 

