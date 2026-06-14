## Apache Kafka — Complete Enterprise Guide

---

## 0. How to Use This Guide

- **Audience**: beginners, backend developers, senior engineers, and architects.
- **Focus**: core Kafka internals, Spring Boot integration, Kubernetes deployment, and enterprise design.
- **Conventions**:
  - Code in Java 21 + Spring Boot 3.
  - ASCII diagrams for architecture.

---

## 1. Introduction to Apache Kafka

### 1.1 What is Apache Kafka?

**Definition**  
Apache Kafka is a **distributed, partitioned, replicated commit log** for high-throughput, fault-tolerant event streaming and messaging.

### 1.2 Why Kafka was created

Legacy messaging systems (JMS brokers, ESB) struggled with:
- Very high throughput (100k+ events/sec).
- Horizontal scalability.
- Long-term event retention and replay.

Kafka solves this by:
- Appending events to **partitioned logs**.
- Separating **storage** from **consumption** (multiple independent consumers).
- Providing **linear scalability** with partitions and brokers.

### 1.3 Messaging vs Event Streaming

| Aspect              | Traditional Messaging             | Event Streaming (Kafka)                         |
|---------------------|-----------------------------------|------------------------------------------------|
| Storage             | Often transient                   | Durable, append-only logs                      |
| Retention           | Typically short                   | Configurable (hours, days, months)            |
| Consumers           | Usually 1 group per queue        | Many independent consumer groups               |
| Use cases           | Work queues                      | Work queues + analytics + audit + replay      |

### 1.4 Kafka vs RabbitMQ vs ActiveMQ (high level)

- **Kafka**:
  - Partitioned log, pull-based consumption, high throughput, long retention.
  - Great for event sourcing, streaming analytics, data pipelines.
- **RabbitMQ / ActiveMQ**:
  - Queue/topic with push-based delivery, rich routing.
  - Great for RPC-style messaging, smaller workloads.

### 1.5 Real use cases

- **E-commerce order processing**: `OrderCreated`, `PaymentProcessed`, `OrderShipped`.
- **Payments**: transaction events for fraud, ledger, settlement.
- **Recommendation systems**: clickstream → Kafka → streaming jobs → personalized feeds.
- **Real-time analytics**: logs and metrics into Kafka, processed by Flink/Spark/Kafka Streams.

---

## 2. Kafka Architecture

### 2.1 Core components

```text
           +------------------------+
           |      Producers         |
           +-----------+------------+
                       |
                       v
                +------+------+
                | Kafka       |
                |  Cluster    |
                +------+------+
                       |
           +-----------+------------+
           |                        |
           v                        v
      Consumers               Consumer Groups
```

- **Broker**: Kafka server, stores data and serves clients.
- **Topic**: named category of events.
- **Partition**: append-only log within a topic; basic unit of parallelism.
- **Producer**: publishes records to topics.
- **Consumer**: reads records from topics.
- **Consumer group**: set of consumers for a topic that share the work.

### 2.2 Leader / Follower, Zookeeper, KRaft

- **Leader**: partition replica handling reads/writes.
- **Follower**: replica that copies from leader for HA.
- **Zookeeper** (legacy): external coordination service used by Kafka ≤ 2.x.
- **KRaft** (modern): Kafka Raft-based consensus, removes Zookeeper, integrates metadata into brokers.

Replication:
- Each partition has `replication.factor` replicas across brokers.
- One is leader, others are followers (in the ISR set).

---

## 3. Kafka Cluster Architecture

### 3.1 Diagram

```text
Client
  |
  v
Producer
  |
  v
         Kafka Cluster
   +---------+---------+---------+
   | Broker1 | Broker2 | Broker3 |
   +----+----+----+----+----+----+
        |         |         |
  P0 (L) P1 (F)  P1 (L)  P2(L/F) ...
```

- Partitions are spread across brokers for load and redundancy.
- Producers and consumers connect to brokers; metadata tells them which broker is leader for each partition.

### 3.2 Leader election & replication (simplified)

- Each partition has:
  - **Leader**: handles writes and reads.
  - **ISR (in-sync replicas)**: fully caught-up followers.
- On leader failure:
  - A follower in ISR becomes new leader.
  - If no ISR available, depending on `min.insync.replicas`, Kafka may:
    - Stop writes (to preserve durability).
    - Or elect non-ISR (risking data loss) if configured.

---

## 4. Topics and Partitions

### 4.1 Definitions

- **Topic**: logical stream of events (e.g., `order-events`).
- **Partition**: ordered, immutable sequence of records within a topic.

### 4.2 Partitioning strategy

- Keyed partitioning: `partition = hash(key) % numPartitions`.
  - Guarantees all events with same key go to same partition (ordering per key).
- Round-robin: for load balancing when ordering doesn’t matter.

Example:
- `order-events` topic with 6 partitions: `order-events-0` … `order-events-5`.
- All events for `orderId=123` go to one partition.

---

## 5. Producers

### 5.1 Producer architecture

```text
App Thread -> Producer API -> Accumulator -> Sender Thread -> Broker
```

- Batches records per partition in memory, then sends to brokers.

### 5.2 Key producer configs (high level)

- `bootstrap.servers`: list of broker addresses.
- `acks`:
  - `0`: fire-and-forget.
  - `1`: leader only.
  - `all`: leader + ISR (strongest).
- `retries`: how many times to retry send on transient errors.
- `batch.size`: max bytes per batch (per partition).
- `linger.ms`: time to wait before sending batch (adds latency, increases throughput).
- `compression.type`: `snappy`, `lz4`, `zstd` etc.

### 5.3 Spring Boot producer for order events

**Gradle/Maven dependency**

```xml
<dependency>
  <groupId>org.springframework.kafka</groupId>
  <artifactId>spring-kafka</artifactId>
</dependency>
```

**Configuration (application.yml)**

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all
      retries: 5
      properties:
        linger.ms: 5
        batch.size: 16384
```

**Order event DTO**

```java
public record OrderCreatedEvent(
        String orderId,
        String userId,
        String productId,
        int quantity,
        Instant createdAt
) {}
```

**Producer service**

```java
@Service
public class OrderEventProducer {
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    @Value("${app.kafka.topics.order-events}")
    private String topic;

    public OrderEventProducer(KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void send(OrderCreatedEvent event) {
        kafkaTemplate.send(topic, event.orderId(), event);
    }
}
```

---

## 6. Consumers

### 6.1 Consumer architecture

```text
Consumer -> Poll loop -> Fetch from broker -> Process -> Commit offset
```

### 6.2 Consumer groups & offsets

- Consumers in the **same group** share partitions (load-balanced).
- Offsets per partition per group define progress.

### 6.3 Spring Boot consumer example

```yaml
spring:
  kafka:
    consumer:
      group-id: payment-service
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "*"
      auto-offset-reset: earliest
```

```java
@Service
public class PaymentEventConsumer {

    @KafkaListener(topics = "${app.kafka.topics.order-events}", groupId = "payment-service")
    public void onOrderCreated(OrderCreatedEvent event) {
        // process payment
    }
}
```

---

## 7. Kafka Message Flow & Offsets

```text
Producer --> Broker (Topic-Partition Log) --> Consumer
                                    |
                                Offset pointer (per consumer group)
```

- Consumer periodically **commits offsets**:
  - Automatic (enable.auto.commit) or manual (preferred for control).
- On restart, consumer resumes from last committed offset.

---

## 8. Delivery Semantics

### 8.1 At-most-once
- Commit before processing.
- If crash after commit, messages lost.

### 8.2 At-least-once (common default)
- Process then commit.
- If crash between process and commit, message may be processed twice.
- Use **idempotent** processing.

### 8.3 Exactly-once (concept)
- Separate concerns:
  - **Exactly once delivery** is impossible in general; Kafka provides **exactly once processing** semantics using:
    - Idempotent producer (`enable.idempotence=true`).
    - Transactions (producer + consumer offsets in single transaction).

---

## 9. Kafka Storage Internals

### 9.1 Log segments

- Each partition is a series of log segments.
- Records are appended sequentially (fast disk writes).

### 9.2 Retention & compaction

- `log.retention.hours`, `log.retention.bytes`: time-/size-based deletion.
- Log compaction:
  - For compacted topics, older records with same key are removed, keeping latest.

---

## 10. Replication & Fault Tolerance

### 10.1 Replication factor & ISR

- `replication.factor`: number of replicas per partition (e.g., 3).
- ISR (In-Sync Replicas): replicas that are fully caught up with leader.

### 10.2 Fault tolerance

- With RF=3 and min.insync.replicas=2:
  - Cluster tolerates losing 1 broker while still accepting writes.

---

## 11. Consumer Groups (Load Balancing)

```text
Topic: order-events (3 partitions)

Group A:
  Consumer A1 -> P0
  Consumer A2 -> P1
  Consumer A3 -> P2

Group B:
  Consumer B1 -> P0, P1, P2   (independent pipeline)
```

- Increasing consumers in group A scales processing.

---

## 12. Kafka Transactions

### 12.1 Definition

- Atomic writes across multiple partitions and topics.
- Atomic “read → process → write + commit offsets”.

### 12.2 Example use case

- Order service consumes `OrderCreated` and produces `PaymentRequested` + updates DB.
- Use transactions to ensure “process + emit + commit” is atomic.

---

## 13. Kafka Streams

### 13.1 Definition

Kafka Streams is a **Java library** for building stream processing apps directly on Kafka.

### 13.2 Example: order aggregation

```java
StreamsBuilder builder = new StreamsBuilder();

KStream<String, OrderEvent> orders = builder.stream("order-events");

KTable<String, Long> ordersPerUser = orders
        .groupBy((key, value) -> value.userId())
        .count(Materialized.as("orders-per-user"));
```

---

## 14. Kafka Connect

### 14.1 Definition

Framework for running **source** and **sink** connectors without custom boilerplate.

### 14.2 Example pipeline

```text
MySQL (CDC) -> Kafka Connect Source -> Kafka Topic -> Connect Sink -> Elasticsearch
```

Use cases:
- CDC from DB to Kafka.
- Streaming data from Kafka to data warehouse/search.

---

## 15. Schema Management

### 15.1 Schema Registry

- Central store of schemas (Avro / JSON Schema / Protobuf).
- Enforces compatibility (backward/forward).

Why:
- Prevents breaking changes between producers and consumers.

---

## 16. Security

### 16.1 SSL, SASL, ACL

- **SSL/TLS**: encrypts traffic.
- **SASL**: auth mechanisms (PLAIN, SCRAM, OAUTHBEARER).
- **ACLs**: control which principals can read/write/admin topics.

Best practices:
- Always enable TLS externally.
- Principle of least privilege in ACLs.

---

## 17. Performance Tuning

### 17.1 Producer tuning

- Increase `batch.size` and `linger.ms` for better throughput.
- Enable compression.

### 17.2 Partition strategy

- More partitions → more parallelism but:
  - More open file handles, more coordination overhead.

Handling 100k+ msg/sec:
- Spread load across topics/partitions.
- Use larger instance types, disk throughput, network.

---

## 18. Monitoring

Tools:
- Prometheus + Grafana.
- Kafka Manager / Confluent Control Center.

Key metrics:
- Producer: request latency, batch size, retries.
- Broker: CPU, disk, network, under-replicated partitions.
- Consumer: lag per partition.

---

## 19. Kafka with Spring Boot 3

### 19.1 Dependencies & config

See Section 5 and 6 for core examples. Add:

```xml
<dependency>
  <groupId>org.springframework.kafka</groupId>
  <artifactId>spring-kafka</artifactId>
</dependency>
```

Enterprise tips:
- Use **DLQ** topics for poison messages.
- Use retryable vs non-retryable exception strategies.

---

## 20. E-commerce Microservices Example (Event-Driven)

### 20.1 Services

- Order Service
- Payment Service
- Inventory Service
- Notification Service

### 20.2 Event flow

```text
OrderCreated
   -> PaymentProcessed (success/fail)
   -> InventoryReserved
   -> OrderCompleted / OrderCancelled
```

### 20.3 Architecture diagram

```text
Client
  |
  v
Order API (Order Service)
  |
  v
Kafka Topic: order-events
  |
  +------------------------+
  |                        |
  v                        v
Payment Service       Inventory Service
  |                        |
  v                        v
Kafka: payment-events    Kafka: inventory-events
  \                        /
   \                      /
    v                    v
  Notification Service (send email/SMS)
```

---

## 21. Spring Boot Order Producer Example (Java 21)

```java
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderEventProducer producer;

    public OrderController(OrderEventProducer producer) {
        this.producer = producer;
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody CreateOrderRequest req) {
        var event = new OrderCreatedEvent(
                UUID.randomUUID().toString(),
                req.userId(),
                req.productId(),
                req.quantity(),
                Instant.now()
        );
        producer.send(event);
        return ResponseEntity.accepted().build();
    }
}
```

---

## 22. Spring Boot Consumer Example (Payment Service)

```java
@Service
public class PaymentService {

    @KafkaListener(topics = "${app.kafka.topics.order-events}", groupId = "payment-service")
    public void handleOrderCreated(OrderCreatedEvent event) {
        // charge card / call payment gateway
        // publish PaymentProcessed event or update DB
    }
}
```

---

## 23. Kafka with Kubernetes (Strimzi operator)

### Definition
Strimzi is a Kubernetes operator that manages Kafka clusters declaratively.

High level:
- Define `Kafka` custom resource (CR) with brokers, ZK/KRaft, topics.
- Operator creates/updates underlying resources (StatefulSets, Services).

Benefits:
- Kubernetes-native operations, rolling updates, config management.

---

## 24. Kafka Deployment Architecture (Enterprise)

```text
Region A
  Kafka Cluster (3–5 brokers)
    - RF=3, SSD disks, private subnets

Region B
  Kafka Cluster (DR / analytics)

Cross-region
  MirrorMaker / replicator for selective topics
```

Best practices:
- Use dedicated Kafka clusters per major use case (OLTP vs analytics).
- Carefully plan capacity (partitions, disk, network).

---

## 25. Kafka Interview Questions

### Beginner
- What is a topic? What is a partition?
- At-least-once vs at-most-once?

### Intermediate
- Explain consumer groups and offset management.
- How does Kafka achieve high throughput?

### Senior
- How do you design idempotent consumers?
- How do you guarantee “exactly-once processing” in Kafka?

### Architect
- Design an event-driven e-commerce system with Kafka.
- How would you run Kafka across multiple regions?

---

## 26. Kafka Command Cheat Sheet

```bash
# list topics
kafka-topics.sh --bootstrap-server localhost:9092 --list

# create topic
kafka-topics.sh --bootstrap-server localhost:9092 \
  --create --topic order-events --partitions 6 --replication-factor 3

# describe topic
kafka-topics.sh --bootstrap-server localhost:9092 \
  --describe --topic order-events

# console producer
kafka-console-producer.sh --bootstrap-server localhost:9092 --topic order-events

# console consumer
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic order-events --from-beginning
```

---

## 27. Real Enterprise Case Study (E-commerce)

High level:
- Orders, payments, inventory, shipping, recommendations, analytics all exchange events via Kafka.
- Kafka decouples real-time pipelines from transactional systems.

Key lessons:
- Start with clear **event contracts** and **ownership**.
- Invest early in **observability** and **schema management**.
- Design for **backpressure** and **failover** from day one.

