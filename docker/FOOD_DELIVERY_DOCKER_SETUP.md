## Food Delivery System – Spring Boot, Dockerfile & Docker Compose

This document defines a sample **food delivery microservices architecture** using Spring Boot, Docker, and Docker Compose, plus concrete `Dockerfile` and `compose.yaml` examples.

---

### 1. Microservices overview (ports, DBs, dependencies)

| Service              | Port  | DB / Storage                 | Depends on                          | Description |
|----------------------|-------|------------------------------|--------------------------------------|-------------|
| **api-gateway**      | 8080  | —                            | `auth-service`, `restaurant-service`, `order-service` | Single entry point (routing, rate limiting) |
| **auth-service**     | 8081  | Postgres `authdb`           | `postgres-auth`                      | User auth, JWT, roles, sessions |
| **restaurant-service** | 8082 | Postgres `restaurantdb`    | `postgres-restaurant`                | Restaurants, menus, items, categories |
| **order-service**    | 8083  | Postgres `orderdb`          | `postgres-order`, `restaurant-service`, `auth-service` | Orders, order items, status, tracking |
| **payment-service**  | 8084  | Postgres `paymentdb` (optional) | `postgres-payment`, external payment gateway | Payments, transactions, refunds |
| **notification-service** | 8085 | Redis `notifications`    | `redis`                              | Email/SMS/push notifications, event consumers |
| **postgres-auth**    | 5433  | Persistent volume           | —                                    | DB for `auth-service` |
| **postgres-restaurant** | 5434 | Persistent volume         | —                                    | DB for `restaurant-service` |
| **postgres-order**   | 5435  | Persistent volume           | —                                    | DB for `order-service` |
| **postgres-payment** | 5436  | Persistent volume           | —                                    | DB for `payment-service` |
| **redis**            | 6379  | Persistent volume           | —                                    | Cache + message store for notifications/sessions |

> Note: Ports 5433–5436 are host ports; inside Docker network, services talk to DBs using default Postgres port **5432** on their service names (e.g. `jdbc:postgresql://postgres-auth:5432/authdb`).

---

### 2. Architecture diagram (logical)

```text
                   +------------------+
                   |   api-gateway    |  (8080)
                   +---------+--------+
                             |
           ----------------------------------------
           |                |                     |
   +-------v------+  +------v--------+    +------v--------+
   | auth-service |  | restaurant-   |    | order-service |
   |   (8081)     |  | service (8082)|    |    (8083)     |
   +-------+------+  +------+--------+    +-------+-------+
           |                |                     |
     +-----v----+     +-----v---------+     +-----v---------+
     |postgres- |     |postgres-      |     |postgres-      |
     | auth     |     | restaurant    |     | order         |
     +----------+     +---------------+     +---------------+

           +-------------------+        +----------------------+
           | payment-service   |        | notification-service |
           |      (8084)       |        |        (8085)        |
           +---------+---------+        +----------+-----------+
                     |                             |
               +-----v---------+             +-----v-----+
               | postgres-     |             |  redis    |
               | payment       |             |  (6379)   |
               +---------------+             +-----------+
```

All services are connected via a **Docker network** `backend`, and each Postgres instance has its own named volume for persistence.

---

### 3. Common Spring Boot Dockerfile (used by each service)

Assume each service is a Maven-based Spring Boot app producing a JAR named `target/app.jar`.

`Dockerfile` (place in each microservice’s root folder – `api-gateway/`, `auth-service/`, etc.):

```dockerfile
# ===========================
# 1. BUILD STAGE  (build + tests + package)
# ===========================
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /workspace

# Copy pom and download dependencies first (cache layer)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn -B clean verify        # compile + tests + package -> target/app.jar

# ===========================
# 2. RUNTIME STAGE (slim, non-root)
# ===========================
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

COPY --from=build /workspace/target/app.jar app.jar

ENV JAVA_OPTS="-Xms256m -Xmx512m" \
    SPRING_PROFILES_ACTIVE=prod \
    TZ=UTC

EXPOSE 8080

# Basic container healthcheck hitting Spring Boot actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

RUN chown appuser:appgroup /app/app.jar
USER appuser

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

- You can reuse this Dockerfile for each service; just ensure each service builds `target/app.jar` (or adjust name).
- The **internal** port is always 8080; we map different host ports in Compose (8081, 8082, …).

---

### 4. `docker-compose.yml` for the food delivery system

Create a top-level `docker-compose.yml` next to your services:

```yaml
version: "3.9"

services:
  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    container_name: api-gateway
    hostname: api-gateway
    ports:
      - "8080:8080"
    read_only: true
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      # If using discovery, config, etc., add here
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    depends_on:
      - auth-service
      - restaurant-service
      - order-service
    networks:
      - backend

  auth-service:
    build:
      context: ./auth-service
      dockerfile: Dockerfile
    container_name: auth-service
    hostname: auth-service
    ports:
      - "8081:8080"
    read_only: true
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-auth:5432/authdb
      SPRING_DATASOURCE_USERNAME: authuser
      SPRING_DATASOURCE_PASSWORD: authpass
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    depends_on:
      - postgres-auth
    networks:
      - backend

  restaurant-service:
    build:
      context: ./restaurant-service
      dockerfile: Dockerfile
    container_name: restaurant-service
    hostname: restaurant-service
    ports:
      - "8082:8080"
    read_only: true
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-restaurant:5432/restaurantdb
      SPRING_DATASOURCE_USERNAME: restouser
      SPRING_DATASOURCE_PASSWORD: restopass
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    depends_on:
      - postgres-restaurant
    networks:
      - backend

  order-service:
    build:
      context: ./order-service
      dockerfile: Dockerfile
    container_name: order-service
    hostname: order-service
    ports:
      - "8083:8080"
    read_only: true
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-order:5432/orderdb
      SPRING_DATASOURCE_USERNAME: orderuser
      SPRING_DATASOURCE_PASSWORD: orderpass
      RESTAURANT_SERVICE_URL: http://restaurant-service:8080
      AUTH_SERVICE_URL: http://auth-service:8080
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    depends_on:
      - postgres-order
      - restaurant-service
      - auth-service
    networks:
      - backend

  payment-service:
    build:
      context: ./payment-service
      dockerfile: Dockerfile
    container_name: payment-service
    hostname: payment-service
    ports:
      - "8084:8080"
    read_only: true
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres-payment:5432/paymentdb
      SPRING_DATASOURCE_USERNAME: payuser
      SPRING_DATASOURCE_PASSWORD: paypass
      PAYMENT_GATEWAY_URL: https://sandbox.payment-gateway.example/api
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    depends_on:
      - postgres-payment
    networks:
      - backend

  notification-service:
    build:
      context: ./notification-service
      dockerfile: Dockerfile
    container_name: notification-service
    hostname: notification-service
    ports:
      - "8085:8080"
    read_only: true
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    depends_on:
      - redis
    networks:
      - backend

  postgres-auth:
    image: postgres:16-alpine
    container_name: postgres-auth
    hostname: postgres-auth
    environment:
      POSTGRES_DB: authdb
      POSTGRES_USER: authuser
      POSTGRES_PASSWORD: authpass
    ports:
      - "5433:5432"
    volumes:
      - postgres-auth-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U authuser -d authdb"]
      interval: 30s
      timeout: 5s
      retries: 5
    networks:
      - backend

  postgres-restaurant:
    image: postgres:16-alpine
    container_name: postgres-restaurant
    hostname: postgres-restaurant
    environment:
      POSTGRES_DB: restaurantdb
      POSTGRES_USER: restouser
      POSTGRES_PASSWORD: restopass
    ports:
      - "5434:5432"
    volumes:
      - postgres-restaurant-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U restouser -d restaurantdb"]
      interval: 30s
      timeout: 5s
      retries: 5
    networks:
      - backend

  postgres-order:
    image: postgres:16-alpine
    container_name: postgres-order
    hostname: postgres-order
    environment:
      POSTGRES_DB: orderdb
      POSTGRES_USER: orderuser
      POSTGRES_PASSWORD: orderpass
    ports:
      - "5435:5432"
    volumes:
      - postgres-order-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orderuser -d orderdb"]
      interval: 30s
      timeout: 5s
      retries: 5
    networks:
      - backend

  postgres-payment:
    image: postgres:16-alpine
    container_name: postgres-payment
    hostname: postgres-payment
    environment:
      POSTGRES_DB: paymentdb
      POSTGRES_USER: payuser
      POSTGRES_PASSWORD: paypass
    ports:
      - "5436:5432"
    volumes:
      - postgres-payment-data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U payuser -d paymentdb"]
      interval: 30s
      timeout: 5s
      retries: 5
    networks:
      - backend

  redis:
    image: redis:7-alpine
    container_name: redis
    hostname: redis
    command: ["redis-server", "--appendonly", "yes"]
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 5s
      retries: 5
    networks:
      - backend

networks:
  backend:
    driver: bridge

volumes:
  postgres-auth-data:
  postgres-restaurant-data:
  postgres-order-data:
  postgres-payment-data:
  redis-data:
```

---

### 5. How to run the full stack

From the root folder containing `docker-compose.yml` and all service subfolders (`api-gateway/`, `auth-service/`, etc.):

```bash
# Build all service images and start everything in the background
docker compose up -d

# See running services
docker compose ps

# Tail logs from api-gateway
docker compose logs -f api-gateway

# Stop and remove containers (keep volumes)
docker compose down

# Stop and remove everything including DB data
docker compose down -v
```

This setup gives you a **realistic, prod-like local environment** for a food delivery system using **Spring Boot microservices**, **Postgres**, **Redis**, and **Docker Compose**.

