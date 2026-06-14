## Docker — Complete Enterprise Guide

---

## 0. How to Use This Guide

- **Audience**:
  - Beginners: understand containers and basic commands.
  - Developers: package and run applications in Docker.
  - DevOps engineers: deploy microservices stacks.
  - Architects: design scalable, secure container platforms.
- **Scope**:
  - Fundamentals → intermediate → advanced → enterprise usage.
  - Strong focus on **images**, **containers**, **networking**, **volumes**, **Dockerfile**, **Compose**, **security**, **performance**, and **real project examples**.
- **Conventions**:
  - Shell commands use `$` prompt.
  - Replace placeholders like `<your-docker-id>` with your real values.

---

## 1. Introduction to Docker

### 1.1 What is Docker?

**Definition**  
Docker is a platform for building, shipping, and running applications in **containers**. A container is a lightweight, isolated environment that packages an application and all its dependencies.

**Why Docker was created / problems it solves**

- “Works on my machine” problem: differing environments between dev/test/prod.
- Heavyweight virtual machines for each app.
- Manual dependency management and configuration drift.

Docker provides:

- Consistent environments across machines.
- Portable, reproducible artifacts (images).
- Fast startup and low overhead compared to VMs.

### 1.2 VM vs Container

Text-based diagram:

```text
Traditional VM:
  Hardware
    └─ Host OS
        └─ Hypervisor
            ├─ Guest OS 1
            │    └─ App + libs
            └─ Guest OS 2
                 └─ App + libs

Docker:
  Hardware
    └─ Host OS
        └─ Docker Engine
            ├─ Container 1 (App + libs)
            └─ Container 2 (App + libs)
```

- **VM**: Each VM includes a full guest OS.
- **Container**: Shares host kernel; isolates processes, filesystem, network.

**Benefits of containerization**

- Faster startup (milliseconds/seconds).
- Higher density (more apps on same hardware).
- Immutable deployments and easier rollbacks.
- Better dev-prod parity.

**Interview questions**

- Explain difference between VM and container.
- Why do containers start faster than VMs?
- What problem does Docker solve in CI/CD pipelines?

---

## 2. Docker Architecture

### 2.1 Components

- **Docker Client**:
  - CLI (`docker ...`) or GUI that you use.
- **Docker Daemon (`dockerd`)**:
  - Service running on the host that manages containers, images, networks, volumes.
- **Docker Engine**:
  - Combined client/daemon implementation.
- **Docker Registry**:
  - Stores images. Public (Docker Hub) or private (Harbor, ECR, GCR, etc.).
- **Docker Hub**:
  - Default public registry (`docker.io`).

Architecture diagram:

```text
+-----------+           +----------------+
| docker CLI|  HTTP API |  dockerd (daemon)
+-----------+  <------> +----------------+
                             |
                             | Pull/Push
                             v
                        Docker Registry
```

### 2.2 How they interact

- Client sends REST API requests to daemon (local socket or TCP).
- Daemon pulls images from registry, builds images, runs containers.
- Containers use storage driver (layers), networking driver, etc.

**Interview questions**

- Describe Docker’s client–server architecture.
- What is Docker Hub, and how is it used in a CI/CD pipeline?

---

## 3. Installing Docker

### 3.1 Mac

- Install **Docker Desktop for Mac** from `https://www.docker.com/products/docker-desktop`.
- After installation:

```bash
$ docker --version
$ docker info
```

### 3.2 Linux

On Ubuntu-like systems:

```bash
$ curl -fsSL https://get.docker.com -o get-docker.sh
$ sh get-docker.sh
$ sudo usermod -aG docker $USER   # add your user to docker group
```

Re-login and verify:

```bash
$ docker --version
```

### 3.3 Windows

- Install **Docker Desktop for Windows**.
- Requires Windows 10/11 with WSL2 enabled.
- Verify:

```powershell
> docker --version
> docker info
```

---

## 4. Basic Docker Commands

### 4.1 Version and info

```bash
$ docker version
$ docker info
```

- `docker version` shows client and server versions.
- `docker info` shows environment details (storage driver, number of containers, etc.).

### 4.2 Help

```bash
$ docker --help
$ docker run --help
```

### 4.3 System usage and cleanup

```bash
$ docker system df       # disk usage
$ docker system prune    # remove unused data (dangling images, stopped containers, etc.)
```

**Best practices**

- Run `docker system df` and `docker system prune` regularly in dev environments to free space.
- In prod, be more careful and use targeted cleanup.

---

## 5. Docker Images

### 5.1 Definition & internals

- An **image** is a **read-only template** with instructions for creating a container:
  - Includes OS base, app binaries, dependencies, configuration.
- Internally:
  - Built from **layers** (each Dockerfile instruction creates a new layer).
  - Layers are **content-addressable** and cached.

### 5.2 Commands

```bash
$ docker images         # list images
$ docker pull nginx     # download image from registry
$ docker rmi nginx      # remove image
```

### 5.3 Building images

```bash
$ docker build -t myapp:1.0 .
```

- `-t` tags image as `myapp:1.0`.
- Uses `Dockerfile` in current directory.

**Image caching & layers**

- Docker reuses layers if:
  - Instructions & their context (files) didn’t change.
- Order Dockerfile steps from **least changing → most changing** to maximize cache hits.

**Common mistakes**

- `COPY . .` too early; invalidates cache frequently.
- Bundling build tools & dev artifacts in final image.

**Interview questions**

- Explain image layers and caching.
- Why does Docker build get slower if Dockerfile instructions are poorly ordered?

---

## 6. Docker Containers

### 6.1 Definition

- A **container** is a running instance of an image:
  - Has its own filesystem (from image layers + a writable layer).
  - Has isolated process namespace, network namespace, etc.

### 6.2 Container lifecycle

Text diagram:

```text
create -> start -> running -> stop -> exited -> rm
```

### 6.3 Commands

```bash
$ docker run nginx                # run container from nginx image (foreground)
$ docker run -d nginx             # run detached
$ docker ps                       # running containers
$ docker ps -a                    # all containers
$ docker stop <container_id>      # stop
$ docker start <container_id>     # start stopped container
$ docker restart <container_id>   # restart
$ docker rm <container_id>        # remove container
```

Example:

```bash
$ docker run --name web -d nginx
$ docker ps
$ docker stop web
$ docker rm web
```

**Best practices**

- Use descriptive container names (`--name`).
- Treat containers as **ephemeral**; store state in volumes or external DBs.

---

## 7. Host Port vs Container Port

### 7.1 Concept

- Containers have their own network namespace.
- To expose a container’s port on the host, use `-p hostPort:containerPort`.

Example:

```bash
$ docker run -d -p 8080:80 nginx
```

- `80` is the Nginx default port **inside** the container.
- `8080` is the port **on the host**.

Network diagram:

```text
Host:  localhost:8080  --->  Container: nginx:80
```

You can now access Nginx at `http://localhost:8080`.

**Common mistakes**

- Reversing the mapping (`-p 80:8080` vs `-p 8080:80`).
- Forgetting to publish port; container runs but service unreachable from host.

---

## 8. Docker Networking

### 8.1 Network types

- **bridge** (default):
  - Docker creates a virtual bridge network (`bridge`).
  - Containers get internal IP, can talk to each other.
- **host**:
  - Container shares host network stack (no port mapping; uses host ports directly).
- **none**:
  - No network for container.
- **overlay**:
  - Multi-host, used by Swarm or orchestrators to connect containers across nodes.

### 8.2 Commands

```bash
$ docker network ls
$ docker network inspect bridge
$ docker network create mynet
```

### 8.3 Example: Two containers on same network

```bash
$ docker network create mynet

$ docker run -d --name db --network mynet postgres:16
$ docker run -d --name api --network mynet myapi:1.0
```

- `api` can reach `db` by DNS name `db` on the same network.

**Best practices**

- Create user-defined bridge networks for apps; avoid using default `bridge` for everything.
- Use separate networks for internal vs public-facing services.

---

## 9. Docker Volumes

### 9.1 Concept

Persistent storage options:

- **Volumes** (managed by Docker):
  - Recommended for most use cases.
- **Bind mounts**:
  - Map a host path into container.
- **tmpfs**:
  - In-memory filesystem for sensitive or ephemeral data.

### 9.2 Commands

```bash
$ docker volume create mydata
$ docker volume ls
$ docker volume inspect mydata
$ docker volume rm mydata
```

### 9.3 Example: Mount volume

```bash
$ docker run -d \
  --name pg \
  -v pgdata:/var/lib/postgresql/data \
  postgres:16
```

- Volume `pgdata` persists even if container is removed.

**Best practices**

- Use named volumes for DBs and application state.
- Use bind mounts for dev (e.g., mapping source code for live reload).

---

## 10. Dockerfile (Deep Guide)

### 10.1 Definition & structure

A **Dockerfile** is a script of instructions to build an image.

Basic structure:

```Dockerfile
FROM base-image
LABEL key=value
ENV VAR=value
WORKDIR /app
COPY . .
RUN build commands
EXPOSE 8080
CMD ["executable","arg1"]
```

### 10.2 Key instructions

- `FROM`: base image.
- `RUN`: execute command during build; creates a new layer.
- `COPY`: copy files into image (from build context).
- `ADD`: like COPY + supports URLs and archives (use sparingly).
- `WORKDIR`: set working directory.
- `CMD`: default command for container.
- `ENTRYPOINT`: main executable; `CMD` often provides arguments.
- `EXPOSE`: documents intended port (no actual mapping).
- `ENV`: set environment variables.
- `ARG`: build-time variables.
- `VOLUME`: declare mount points.
- `LABEL`: metadata.

### 10.3 Example Dockerfile — Spring Boot Java app

```Dockerfile
FROM eclipse-temurin:21-jre-alpine AS base

WORKDIR /app
COPY target/myservice.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

### 10.4 Node.js API Dockerfile

```Dockerfile
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

COPY . .

EXPOSE 3000
CMD ["node","server.js"]
```

### 10.5 Angular SPA Dockerfile (multi-stage)

```Dockerfile
# build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# runtime stage
FROM nginx:alpine
COPY --from=build /app/dist/my-angular-app /usr/share/nginx/html
EXPOSE 80
```

**Layer caching best practices**

- Copy `package*.json` first; run `npm install`; then copy rest.
- For Java, copy `pom.xml`/`build.gradle` and `src` in steps that leverage cache.

---

## 11. Building Docker Images

### 11.1 Basic build

```bash
$ docker build -t myapp .
$ docker build -t myapp:1.0 .
```

- Tag format: `[registry/]repo[:tag]`.
  - Example: `myorg/myapp:1.0`, `ghcr.io/myorg/myapp:1.0`.

### 11.2 Best practices

- Use a **small base image** (e.g., Alpine) if compatible.
- Use **multi-stage builds** to keep runtime image minimal.
- Avoid copying `.git`, `node_modules` (use `.dockerignore`).

**Common mistakes**

- Running the app as `root` inside container.
- Including secrets in Dockerfile or image layers.

---

## 12. Running Containers (Day-to-Day Operations)

### 12.1 `docker run`

```bash
$ docker run --name web -d -p 8080:80 nginx
```

Options:

- `-d`: detached.
- `--name`: container name.
- `-p`: port mapping.

### 12.2 `docker exec` (run inside a running container)

```bash
$ docker exec -it web /bin/sh   # or /bin/bash
```

### 12.3 Logs, attach, inspect, stats

```bash
$ docker logs web                 # current logs
$ docker logs -f web              # follow logs
$ docker attach web               # attach to main process (be careful)
$ docker inspect web              # JSON inspection
$ docker stats                    # resource usage of containers
```

**Best practices**

- Use `docker logs` instead of `docker attach` in most cases.
- Use `-it` (interactive TTY) only for debugging.

---

## 13. Docker Compose (Deep Guide)

### 13.1 Why Compose?

- Manage multi-container applications with a single file (`docker-compose.yml` / `compose.yml`).
- Define services, networks, and volumes declaratively.
- Useful for local dev and small environments.

### 13.2 Dockerfile vs Docker Compose

- **Dockerfile**: describes **how to build** a single image.
- **Compose**: describes **how to run** multiple containers together.

### 13.3 `docker-compose.yml` structure

Basic example:

```yaml
version: "3.9"

services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=mypassword
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 13.4 Commands

```bash
$ docker compose up          # start (build if needed)
$ docker compose up -d       # start in background
$ docker compose down        # stop & remove containers, networks
$ docker compose build       # build images
$ docker compose logs        # view logs
$ docker compose ps          # list services
```

### 13.5 Microservices example (frontend + backend + DB)

```yaml
version: "3.9"

services:
  frontend:
    build: ./frontend
    ports:
      - "4200:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/appdb
      - SPRING_DATASOURCE_USERNAME=appuser
      - SPRING_DATASOURCE_PASSWORD=apppass
    ports:
      - "8080:8080"
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=appuser
      - POSTGRES_PASSWORD=apppass
    volumes:
      - dbdata:/var/lib/postgresql/data

volumes:
  dbdata:
```

---

## 14. Docker Hub

### 14.1 Definition

Docker Hub is a public image registry on `hub.docker.com`.

### 14.2 Workflow: push image

```bash
$ docker login
$ docker build -t myapp:1.0 .
$ docker tag myapp:1.0 <your-docker-id>/myapp:1.0
$ docker push <your-docker-id>/myapp:1.0
```

Then others can pull:

```bash
$ docker pull <your-docker-id>/myapp:1.0
```

---

## 15. Docker Security

### 15.1 Key aspects

- Containers share the host kernel → **root in container** can be dangerous.
- Images from public registries may contain vulnerabilities.

**Best practices**

- Run as **non-root user** (use `USER` in Dockerfile).
- Use **minimal base images**.
- Scan images for vulnerabilities (Trivy, Anchore, Clair, Docker Hub scanning).
- Store secrets outside images:
  - Environment variables (for non-sensitive config).
  - Secret managers (Vault, AWS Secrets Manager, K8s secrets).
- Restrict Docker daemon access: root or docker group.

**Common mistakes**

- Using `latest` tags in production.
- Embedding secrets in Dockerfile or image layers.

---

## 16. Docker Optimization

### 16.1 Small images

- Choose smaller base images (e.g., `alpine`) when possible.
- Remove build tools in final runtime image.

### 16.2 Multi-stage builds

```Dockerfile
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/target/app.jar app.jar
ENTRYPOINT ["java","-jar","app.jar"]
```

### 16.3 Performance considerations

- Limit container memory/CPU if necessary (`--memory`, `--cpus`).
- Use `docker stats` and monitoring to detect resource pressure.
- Avoid logging huge volumes to stdout without log rotation.

---

## 17. Docker in CI/CD

### 17.1 GitHub Actions example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: <your-docker-id>/myapp:latest
```

### 17.2 Jenkins / GitLab CI

- Build image with `docker build`.
- Push to registry.
- Deploy orchestrator (Kubernetes, Swarm, ECS) referencing the image tag.

---

## 18. Docker vs Kubernetes

### 18.1 Differences

- **Docker**:
  - Builds and runs containers on a single host.
  - Great for dev, local testing, and small deployments.

- **Kubernetes**:
  - Orchestrator for **many containers across many nodes**.
  - Handles scheduling, self-healing, rolling updates, service discovery, etc.

### 18.2 When to use

- Use **Docker alone**:
  - Local dev environment, POCs, small internal tools.
- Use **Kubernetes** (with Docker/OCI images):
  - Large-scale, high-availability microservices.
  - Multi-node, auto-scaling environments.

---

## 19. Enterprise Docker Architecture

### 19.1 Components

Text diagram:

```text
Developers  -->  CI/CD  -->  Registry  -->  Orchestrator (K8s, ECS)
                                |
                                v
                             Docker images
```

Key building blocks:

- Private registry (ECR, GCR, ACR).
- Orchestrator (Kubernetes, ECS).
- Service discovery (K8s Service, Istio).
- Load balancing (Ingress, API Gateway).
- Observability (Prometheus, Grafana, ELK).

### 19.2 Use cases

- Microservices running in containers, one service per container.
- Blue/green or canary deployments via image versions.
- Autoscaling based on CPU/HTTP metrics.

---

## 20. Real Project Examples

### 20.1 Spring Boot container

`Dockerfile`:

```Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/orders-service.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

Run:

```bash
$ mvn clean package
$ docker build -t orders-service:1.0 .
$ docker run -d -p 8080:8080 --name orders orders-service:1.0
```

### 20.2 Angular container

See multi-stage example in §10.5.

### 20.3 Node API container

See §10.4.

### 20.4 Full microservices stack (simplified)

- Services:
  - `orders-service` (Spring Boot)
  - `payments-service` (Spring Boot)
  - `frontend` (Angular)
  - `db` (Postgres)
- Managed via `docker compose` (see §13).

---

## 21. Docker Interview Questions

### 21.1 Beginner

- What is a Docker image vs container?
- How does `docker run -p 8080:80 nginx` work?
- Difference between `docker ps` and `docker ps -a`?

### 21.2 Intermediate

- Explain Docker image layers and caching.
- What is the difference between a volume and a bind mount?
- How does Docker networking work (bridge vs host)?
- Show a basic Dockerfile for a Node/Java app.

### 21.3 Advanced

- How would you minimize Docker image size for a Java service?
- Explain multi-stage builds with an example.
- How do you secure containers and Docker images?
- How do you troubleshoot high CPU in a container?

### 21.4 DevOps Architect

- Design a CI/CD pipeline that builds and deploys Dockerized microservices.
- Compare Docker Swarm vs Kubernetes for enterprise workloads.
- How do you manage secrets across containers and environments?
- How do you design logging/monitoring for a container-based platform?

---

## 22. Docker Command Cheat Sheet

### 22.1 Image commands

```bash
docker images
docker pull <image>
docker build -t repo/name:tag .
docker rmi <image>
```

### 22.2 Container commands

```bash
docker run [options] image
docker ps [-a]
docker stop <container>
docker start <container>
docker restart <container>
docker rm <container>
docker exec -it <container> /bin/sh
docker logs [-f] <container>
```

### 22.3 Network commands

```bash
docker network ls
docker network create <name>
docker network inspect <name>
```

### 22.4 Volume commands

```bash
docker volume ls
docker volume create <name>
docker volume inspect <name>
docker volume rm <name>
```

### 22.5 Docker Compose commands

```bash
docker compose up [-d]
docker compose down
docker compose build
docker compose logs [-f]
docker compose ps
```

---

## 23. Extra: Spring Boot Two-Microservice Example & Push to Docker Hub

### 23.1 Project layout

```text
/ (repo root)
  orders-service/
    pom.xml
    src/...
    Dockerfile
  payments-service/
    pom.xml
    src/...
    Dockerfile
```

### 23.2 Sample Dockerfiles

**`orders-service/Dockerfile`**

```Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/orders-service.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

**`payments-service/Dockerfile`**

```Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/payments-service.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]
```

### 23.3 Build JARs

```bash
$ cd orders-service
$ mvn clean package -DskipTests
$ cd ../payments-service
$ mvn clean package -DskipTests
$ cd ..
```

### 23.4 Build Docker images with tags

Assume Docker Hub ID: `<your-docker-id>`.

```bash
# Orders service
$ cd orders-service
$ docker build -t <your-docker-id>/orders-service:1.0 .

# Payments service
$ cd ../payments-service
$ docker build -t <your-docker-id>/payments-service:1.0 .
$ cd ..
```

### 23.5 Push both services to Docker Hub

```bash
$ docker login   # enter Docker Hub username/password

$ docker push <your-docker-id>/orders-service:1.0
$ docker push <your-docker-id>/payments-service:1.0
```

Now both images are available at:

- `docker.io/<your-docker-id>/orders-service:1.0`
- `docker.io/<your-docker-id>/payments-service:1.0`

You can deploy them via Docker Compose, Kubernetes, ECS, etc., by referencing these image names.

---

This guide provides a complete journey from **Docker fundamentals** to **enterprise deployment patterns**. Keep sections on **Dockerfile**, **Compose**, **networking**, **volumes**, and the **Spring Boot microservices example** handy as you design and operate containerized systems in production.

