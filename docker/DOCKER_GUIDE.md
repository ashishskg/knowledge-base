# Docker & Dockerfile Guide

A practical guide to Dockerfile basics and a production-style Dockerfile for a Spring Boot application.

---

## 1. Dockerfile instructions – quick reference

| Instruction | Basic syntax | Description | Typical use |
|------------|--------------|-------------|-------------|
| **FROM** | `FROM image[:tag] [AS name]` | Base image for the build | Start from Ubuntu, Alpine, JDK, etc. |
| **RUN** | `RUN command` | Execute command inside build and commit result | Install packages, build binaries |
| **CMD** | `CMD ["exec", "form"]` or `CMD command` | Default command when container starts | Default app command (overridable) |
| **ENTRYPOINT** | `ENTRYPOINT ["exec", "form"]` | Main entry command, usually not overridden | Force container to run a specific app |
| **COPY** | `COPY src dest` | Copy files/dirs from build context into image | Add app code, config, etc. |
| **ADD** | `ADD src dest` | Like COPY, plus URL & tar extraction | Rarely needed; prefer COPY |
| **WORKDIR** | `WORKDIR /path` | Set working directory for following instructions | Set current dir for RUN/CMD/ENTRYPOINT |
| **ENV** | `ENV KEY value` or `ENV KEY=value` | Set environment variable in image | App configuration, paths |
| **ARG** | `ARG NAME[=default]` | Build-time variable (not kept at runtime) | Pass build-time values (`--build-arg`) |
| **EXPOSE** | `EXPOSE 8080` | Document container port | Informational; for tooling |
| **VOLUME** | `VOLUME ["/data"]` | Declare mount point for volumes | Persist or share data |
| **USER** | `USER username` or `USER uid:gid` | Set user for subsequent instructions / runtime | Drop root privileges |
| **LABEL** | `LABEL key="value"` | Metadata (author, version, description) | For tooling, search, ownership |
| **HEALTHCHECK** | `HEALTHCHECK CMD ...` | Command to check container health | Monitor service availability |
| **ONBUILD** | `ONBUILD INSTRUCTION` | Instruction triggered in child images | Image templates (advanced) |
| **STOPSIGNAL** | `STOPSIGNAL SIGTERM` | Signal sent to stop container | Graceful shutdown control |
| **SHELL** | `SHELL ["executable", "arg"]` | Change default shell for RUN | Use powershell, bash, etc. |

---

## 2. Core instructions with short examples

### 2.1 FROM

```dockerfile
FROM eclipse-temurin:21-jre-alpine AS base
FROM maven:3.9-eclipse-temurin-21 AS build
```

- First instruction in almost every Dockerfile.
- `AS name` labels the stage for multi-stage builds.

### 2.2 RUN

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

- Executes commands at **build time**; result is baked into the image.

### 2.3 COPY vs ADD

```dockerfile
COPY target/app.jar /app/app.jar
ADD app.tar.gz /app/    # extracts local tar
```

- Prefer `COPY` for simple copies; `ADD` only when you need auto-extract or HTTP download.

### 2.4 WORKDIR

```dockerfile
WORKDIR /app
COPY . .
```

- Sets working directory for following instructions; created if missing.

### 2.5 ENV & ARG

```dockerfile
ARG JAR_FILE=target/app.jar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ARG JAR_FILE
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-Xms256m -Xmx512m"

COPY ${JAR_FILE} app.jar
```

- `ARG` = build-time only, passed via `--build-arg`.
- `ENV` = baked into image, available at runtime (can be overridden with `-e`).

### 2.6 CMD vs ENTRYPOINT

```dockerfile
ENTRYPOINT ["java","-jar","app.jar"]
CMD ["--spring.profiles.active=prod"]
```

- Default invocation: `ENTRYPOINT + CMD`.
- `docker run image --spring.profiles.active=dev` overrides only **CMD**.

### 2.7 EXPOSE, VOLUME, USER, HEALTHCHECK

```dockerfile
EXPOSE 8080
VOLUME ["/data"]
USER appuser
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1
```

- `EXPOSE` documents ports; `VOLUME` marks data paths; `USER` drops root; `HEALTHCHECK` defines health logic.

---

## 3. Production-style Dockerfile for Spring Boot (Java 21)

Assumptions:
- Build tool: **Maven**
- Final jar: `target/app.jar`
- Java: **21**

```dockerfile
# ===========================
# 1. Build stage
# ===========================
FROM maven:3.9-eclipse-temurin-21 AS build

# Set working directory inside the container
WORKDIR /workspace

# Copy Maven descriptor first (for dependency cache)
COPY pom.xml .

# Download dependencies (will be cached if pom.xml doesn’t change)
RUN mvn -B -q dependency:go-offline

# Copy source code
COPY src ./src

# Build application (skip tests for faster Docker build; run tests in CI separately)
RUN mvn -B -q clean package -DskipTests

# ===========================
# 2. Runtime stage
# ===========================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set workdir
WORKDIR /app

# Copy the fat JAR from the build stage
COPY --from=build /workspace/target/*.jar app.jar

# Environment (can be overridden at runtime)
ENV JAVA_OPTS="-Xms256m -Xmx512m" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=UTC

# Expose application port
EXPOSE 8080

# Ensure correct file ownership
RUN chown appuser:appgroup /app/app.jar

# Drop root
USER appuser

# Exec form entrypoint: supports signals, overrides, JAVA_OPTS
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### 3.1 Build and run commands

```bash
# Build the image
docker build -t my-spring-app:prod .

# Run container (prod-like)
docker run -d \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e JAVA_OPTS="-Xms512m -Xmx1024m" \
  --name my-spring-app \
  my-spring-app:prod
```

---

## 4. Build stage vs package stage (Maven & Docker)

### 4.1 Maven lifecycle: build vs package

In Maven/CI pipelines you’ll often separate **build** and **package** like this:

- **Build stage**: compile and test the code.
  - `mvn clean compile test`
  - Produces compiled `.class` files (in `target/classes`) and runs unit tests.
- **Package stage**: assemble a deployable artifact from compiled code.
  - `mvn package`
  - Produces a JAR/WAR (for Spring Boot: `target/app.jar`) that you can deploy or put into a Docker image.

Example CI pipeline:

```yaml
stages:
  - build
  - package

build:
  stage: build
  script:
    - mvn clean compile test

package:
  stage: package
  script:
    - mvn package
    - docker build -t my-app:latest .
    - docker push my-registry/my-app:latest
```

### 4.2 Docker multi-stage: build vs runtime (using the package)

In the Dockerfile above, the **build stage** compiles and packages the app; the **runtime stage** only runs the packaged JAR:

```dockerfile
# Build stage (build + package JAR)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q clean package -DskipTests   # build + package here

# Runtime stage (use the packaged JAR)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/*.jar app.jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

- **Build stage** (`AS build`): Maven compiles and packages the Spring Boot app into a JAR.
- **Runtime stage**: a small JRE base image that only runs the already packaged JAR.

So conceptually:
- **Build** = compile + test (and often triggers `package`).
- **Package** = produce the final artifact (JAR/WAR/image) that you ship to environments.

### 4.3 Real-world production multi-stage Dockerfile (Spring Boot, Java 21)

A more **prod-like** example where the build stage runs tests (`mvn verify`) and the runtime stage is slim and non-root:

```dockerfile
# ===========================
# 1. BUILD STAGE  (build + tests + package)
# ===========================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /workspace

# Use dependency cache: copy only pom.xml first
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy source code and run full build (compile + tests + package)
COPY src ./src
RUN mvn -B clean verify         # compiles, runs tests, and packages JAR into target/app.jar

# ===========================
# 2. PACKAGE / RUNTIME STAGE (thin, prod image)
# ===========================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only the final JAR from build stage into runtime image
COPY --from=build /workspace/target/app.jar app.jar

# Runtime configuration (overridable at run time)
ENV JAVA_OPTS="-Xms512m -Xmx1024m" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=UTC

EXPOSE 8080

RUN chown appuser:appgroup /app/app.jar
USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

In a typical CI/CD pipeline:

- The **Docker build** runs both stages and outputs a single prod-ready image.
- You then push that image to your registry and deploy it (e.g. to Kubernetes) without needing Maven or source code in the runtime environment.

---

## 5. Common docker CLI commands – quick reference

| Command | Description | Example |
|---------|-------------|---------|
| **docker build** | Build an image from a Dockerfile in the current directory | `docker build -t my-app:latest .` |
| **docker images** | List local images | `docker images` |
| **docker run** | Run a container from an image | `docker run -d -p 8080:8080 my-app:latest` |
| **docker ps** | List running containers | `docker ps` |
| **docker ps -a** | List all containers (including stopped) | `docker ps -a` |
| **docker stop** | Stop one or more running containers | `docker stop my-container` |
| **docker start** | Start one or more stopped containers | `docker start my-container` |
| **docker rm** | Remove one or more stopped containers | `docker rm my-container` |
| **docker rmi** | Remove one or more images | `docker rmi my-app:latest` |
| **docker logs** | Show logs from a container | `docker logs -f my-container` |
| **docker exec** | Run a command in a running container | `docker exec -it my-container sh` |
| **docker inspect** | Show detailed info on images/containers | `docker inspect my-container` |
| **docker pull** | Download image from a registry | `docker pull nginx:1.27-alpine` |
| **docker push** | Upload image to a registry | `docker push my-registry/my-app:latest` |
| **docker network ls** | List networks | `docker network ls` |
| **docker volume ls** | List volumes | `docker volume ls` |

---

This guide now includes:
- A **table** of common Dockerfile instructions and what they do.
- Short examples for the main Dockerfile instructions.
- A **production-ready** multi-stage Dockerfile for a Spring Boot application using Java 21.
- A **table of basic docker CLI commands** for building, running, and managing containers.
