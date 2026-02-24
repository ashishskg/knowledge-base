# Deploy a simple Spring Boot service to Kubernetes (3 replicas): step-by-step

This guide shows the end-to-end steps to deploy a basic Spring Boot API (no existing Docker/K8s config) to Kubernetes with **3 instances**.

---

## Prerequisites
- A working Spring Boot app that listens on a port (commonly `8080`).
- Java + Maven/Gradle installed locally.
- Docker installed (or use Buildpacks).
- Access to a Kubernetes cluster and `kubectl` configured.
- Access to a container registry (Docker Hub / ECR / GCR / ACR, etc.).

---

## 1) Build the application artifact (JAR)

### Maven
Run from your app folder:
```bash
mvn clean package
```

### Gradle
```bash
./gradlew clean build
```

You should now have a runnable JAR under `target/` (Maven) or `build/libs/` (Gradle).

---

## 2) Containerize the application

Kubernetes runs containers, so you must create a container image.

### Option A: Dockerfile (simple and common)
Create a `Dockerfile` in the app folder:

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

Build the image:
```bash
docker build -t <registry>/<app-name>:1.0.0 .
```

### Option B: Spring Boot Buildpacks (no Dockerfile)
If using Spring Boot plugin:

```bash
mvn spring-boot:build-image -Dspring-boot.build-image.imageName=<registry>/<app-name>:1.0.0
```

---

## 3) Push the image to a container registry

```bash
docker push <registry>/<app-name>:1.0.0
```

Notes:
- The Kubernetes nodes must be able to pull this image.
- If the registry is private, you may need `imagePullSecrets`.

---

## 4) Create Kubernetes manifests

You typically need:
- `Deployment` (defines pods/replicas)
- `Service` (stable networking endpoint inside the cluster)

### 4.1 Deployment (3 replicas)
Create `deployment.yaml`:

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
          image: <registry>/<app-name>:1.0.0
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 20
            periodSeconds: 10
```

If you do NOT use Spring Actuator, you can:
- Add dependency `spring-boot-starter-actuator`, OR
- Change probe paths to a real endpoint you have (example `/api/v1/health`).

### 4.2 Service (ClusterIP)
Create `service.yaml`:

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

This exposes the app **inside** the cluster.

---

## 5) Apply manifests to Kubernetes

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

---

## 6) Verify 3 instances are running

```bash
kubectl get deployments
kubectl get pods -l app=user-service
kubectl get svc user-service
```

Expected:
- Deployment shows `READY 3/3`
- Three pods in `Running` state

---

## 7) Access the service

### Option A: Port-forward (quick dev test)
```bash
kubectl port-forward svc/user-service 8080:80
```

Then call your API:
```bash
curl http://localhost:8080/<your-endpoint>
```

### Option B: Expose externally
Two common approaches:

#### `LoadBalancer` (simple)
Update the Service:
```yaml
spec:
  type: LoadBalancer
```
Then:
```bash
kubectl get svc user-service
```
Use the external IP/hostname.

#### Ingress (recommended in many setups)
- Install/configure an Ingress Controller (nginx/traefik/cloud ingress)
- Create an Ingress resource mapping host/path → `user-service`

---

## 8) Recommended production additions
- **Resource requests/limits** (CPU/memory)
- **Horizontal Pod Autoscaler (HPA)** based on CPU or custom metrics
- **ConfigMap/Secret** for configuration
- **Graceful shutdown** and proper timeouts
- **Centralized logging + metrics + tracing**

---

## Quick recap
1. Build JAR
2. Build container image
3. Push image to registry
4. Create `Deployment` with `replicas: 3`
5. Create `Service`
6. `kubectl apply`
7. Verify pods and access the service
