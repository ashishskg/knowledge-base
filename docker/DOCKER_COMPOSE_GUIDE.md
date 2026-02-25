
## Table of Contents

- [Docker Compose – Complete Guide](#docker-compose-complete-guide)
  - [1. What is Docker Compose?](#1-what-is-docker-compose)
  - [2. High‑level architecture (diagram)](#2-high-level-architecture-diagram)
  - [3. Minimal `compose.yaml` example (Spring Boot + Postgres)](#3-minimal-compose-yaml-example-spring-boot-postgres)
  - [4. Common Docker Compose commands (Docker CLI v2)](#4-common-docker-compose-commands-docker-cli-v2)
  - [5. Real‑world example: app + DB + Redis + admin tools](#5-real-world-example-app-db-redis-admin-tools)
  - [6. Summary](#6-summary)
  - [7. Dockerfile vs Docker Compose – differences & when to use both](#7-dockerfile-vs-docker-compose-differences-when-to-use-both)
    - [7.1 What is a Dockerfile?](#7-1-what-is-a-dockerfile)
    - [7.2 What is Docker Compose?](#7-2-what-is-docker-compose)
    - [7.3 Do we have to use both?](#7-3-do-we-have-to-use-both)

---

## Docker Compose – Complete Guide

### 1. What is Docker Compose?

- **Docker Compose** is a tool to **define and run multi‑container applications** using a single file (usually `docker-compose.yml` or `compose.yaml`).
- You describe:
  - **Services** (containers),
  - **Networks** (how they talk),
  - **Volumes** (persistent storage),
  all in one YAML file, then run everything with **one command**.

**Why we need it:**
- Instead of running many `docker run ...` commands manually (for app, DB, cache, etc.), you:
  - Declare everything once in YAML,
  - Start/stop the whole stack with `docker compose up` / `down`,
  - Version the config with your code.

---

### 2. High‑level architecture (diagram)

Example: Spring Boot app + Postgres DB + Redis cache.

```text
             +--------------------------+
             |      docker-compose      |
             |      (compose.yaml)      |
             +------------+-------------+
                          |
          ---------------------------------------
          |                |                   |
   +------+-----+   +------+-----+      +------+-----+
   |  app       |   |  postgres |      |  redis    |
   | service    |   |  service  |      |  service  |
   +------+-----+   +------+-----+      +------+-----+
          |                |                   |
          |   network: backend-network         |
          +------------------------------------+

Volumes:
- postgres-data  -> /var/lib/postgresql/data (postgres)
- redis-data     -> /data (redis)
```

One `compose.yaml` file defines all three services, networks, and volumes.

---

### 3. Minimal `compose.yaml` example (Spring Boot + Postgres)

```yaml
version: "3.9"

services:
  app:
    image: my-spring-app:prod
    container_name: spring-app
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/mydb
      SPRING_DATASOURCE_USERNAME: myuser
      SPRING_DATASOURCE_PASSWORD: secret
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      - db
    networks:
      - backend

  db:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - backend

networks:
  backend:
    driver: bridge

volumes:
  postgres-data:
```

Run everything:

```bash
docker compose up -d
```

---

### 4. Common Docker Compose commands (Docker CLI v2)

> Modern Docker uses `docker compose` (space), not `docker-compose` (dash).  
> Both may work, but `docker compose` is the recommended syntax.

| Command | Description | Example |
|--------|-------------|---------|
| **docker compose up** | Create and start containers | `docker compose up` |
| **docker compose up -d** | Start in background (detached) | `docker compose up -d` |
| **docker compose down** | Stop and remove containers, networks, default volumes | `docker compose down` |
| **docker compose down -v** | Also remove named/anonymous volumes | `docker compose down -v` |
| **docker compose ps** | List services/containers in the project | `docker compose ps` |
| **docker compose logs** | Show logs for all services | `docker compose logs` |
| **docker compose logs -f app** | Follow logs for a single service | `docker compose logs -f app` |
| **docker compose build** | Build images defined in compose file | `docker compose build` |
| **docker compose pull** | Pull images for services | `docker compose pull` |
| **docker compose push** | Push built images to registry | `docker compose push` |
| **docker compose start** | Start existing (stopped) services | `docker compose start` |
| **docker compose stop** | Stop running services without removing them | `docker compose stop` |
| **docker compose restart** | Restart services | `docker compose restart` |
| **docker compose exec** | Run command in running service container | `docker compose exec app sh` |
| **docker compose run** | Run a one‑off command in a new container | `docker compose run --rm app sh` |
| **docker compose config** | Validate and view the merged config | `docker compose config` |
| **docker compose ls** | List Compose projects | `docker compose ls` |
| **docker compose rm** | Remove stopped service containers | `docker compose rm` |

---

### 5. Real‑world example: app + DB + Redis + admin tools

```yaml
version: "3.9"

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: spring-app
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/mydb
      SPRING_DATASOURCE_USERNAME: myuser
      SPRING_DATASOURCE_PASSWORD: secret
      SPRING_REDIS_HOST: redis
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      - db
      - redis
    networks:
      - backend

  db:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - backend

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - backend

  pgadmin:
    image: dpage/pgadmin4:8
    container_name: pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - db
    networks:
      - backend

networks:
  backend:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
```

**Usage:**

```bash
# Start everything in background
docker compose up -d

# See running services
docker compose ps

# Tail app logs
docker compose logs -f app

# Exec into app container
docker compose exec app sh

# Stop and cleanup
docker compose down
```

---

### 6. Summary

- **Docker Compose** is for **orchestrating multiple containers locally** with a single YAML file and commands like `docker compose up` / `down`.
- It simplifies:
  - Local dev environments (app + DB + cache + tools),
  - Integration testing setups,
  - Sharing a reproducible environment with your team.
- For production, you typically move to **Kubernetes** or similar, but Docker Compose remains very useful for **local and CI test environments**.

---

### 7. Dockerfile vs Docker Compose – differences & when to use both

#### 7.1 What is a Dockerfile?

- A **Dockerfile** describes **how to build a single image**:
  - Base image (`FROM`)
  - Files to copy (`COPY`, `ADD`)
  - Build steps (`RUN`)
  - Entrypoint/command (`CMD`, `ENTRYPOINT`)
- Output: **one image** (e.g. `my-spring-app:prod`).

#### 7.2 What is Docker Compose?

- A **Compose file** (`docker-compose.yml` / `compose.yaml`) describes **how to run multiple containers together**:
  - Which images to run (can come from Dockerfiles or registries),
  - Ports, env vars, volumes, networks,
  - Dependencies between services.
- Output: **a running stack** (one or more containers/services).

#### 7.3 Do we have to use both?

- **You do not have to use both**, but they solve different problems:
  - Use a **Dockerfile** whenever you need to **build an image** (e.g. your Spring Boot app image).
  - Use **Docker Compose** when you need to **run multiple containers together** (e.g. app + DB + cache) with one command.
- Common real‑world pattern:
  1. Write a **Dockerfile** to build `my-spring-app:prod`.
  2. Reference that image (or build it) from **`compose.yaml`** alongside Postgres, Redis, etc.

Example:

```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: secret
```

- Here:
  - **Dockerfile** (in `.`) defines how to **build** the `app` image.
  - **Docker Compose** defines how to **run** `app` + `db` together.


