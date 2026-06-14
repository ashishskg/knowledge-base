# 📚 Knowledge Base

A personal knowledge base for software engineering, architecture, cloud, and AI/ML topics.
Maintained as a Git repo for version history and portability.

---

## 📁 Structure

| Folder | Contents |
|---|---|
| [`java/`](#java) | Core Java, concurrency, collections, testing, design patterns, Jakarta |
| [`architecture/`](#architecture) | System design, microservices patterns |
| [`database/`](#database) | SQL fundamentals, Oracle PL/SQL |
| [`cloud/`](#cloud) | AWS services |
| [`infrastructure/`](#infrastructure) | Docker, Kubernetes, Kafka |
| [`frontend/`](#frontend) | HTML, CSS, JavaScript, TypeScript, Angular |
| [`ai/`](#ai) | LLMs, RAG, Spring AI, LangChain4j, course notes |

---

## Java

Core Java language, concurrency, collections, testing, and enterprise frameworks.

```
java/
├── java8-guide.md
├── java21-features-guide.md
├── java21-concurrency-guide.md
├── threading-basic-guide.md
├── threading-enterprise-guide.md
├── hashmap-guide.md
├── concurrent-hashmap-guide.md
├── list-guide.md
├── custom-arraylist-guide.md
├── java8-interview-guide.md
├── testing/
│   ├── unit-testing-guide.md
│   └── integration-testing-guide.md
├── design-patterns/
│   ├── behavioral/   (Chain, Command, Observer, Strategy, ...)
│   ├── creational/   (Singleton, Factory, Builder, ...)
│   └── structural/   (Adapter, Decorator, Proxy, ...)
└── jakarta/
    ├── jakarta-beginner-guide.md
    └── jakarta-enterprise-guide.md
```

---

## Architecture

System design concepts and microservices patterns.

```
architecture/
├── system-design/
│   ├── Concepts_Overview.md
│   ├── Architecture_Styles_And_Patterns.md
│   ├── Scalability_And_Performance.md
│   ├── Reliability_And_Resilience.md
│   ├── Data_And_Storage.md
│   ├── Security_And_Multi_Tenancy.md
│   ├── Observability_And_Operations.md
│   ├── Tradeoffs_And_Principles.md
│   ├── Requirements_And_NFRs.md
│   └── Example_*.md   (Chat, Ecommerce, File Storage, Social Feed, ...)
└── microservices/
    ├── microservices-architecture.md
    ├── microservices-design-patterns.md
    ├── microservices-platform-tools.md
    ├── microservices-interview-guide.md
    ├── springboot-microservices-example.md
    ├── kubernetes-microservices-deployment.md
    └── observability-security.md
```

---

## Database

SQL fundamentals and Oracle PL/SQL reference.

```
database/
├── oracle-database-guide.md
├── DATABASE_SQL_AND_INTERVIEW_GUIDE.md
├── db-docs/              ← SQL learning series (00–07)
│   ├── 00-Sample-Data.md
│   ├── 01-SQL-Fundamentals.md
│   ├── 02-JOINs.md
│   ├── 03-GROUP-BY-and-Aggregations.md
│   ├── 04-Subqueries-and-CTEs.md
│   ├── 05-Window-Functions.md
│   ├── 06-Complex-Queries.md
│   └── 07-Indexes-and-Performance.md
└── oracle/
    ├── cursors.md
    ├── procedures.md
    ├── exceptions.md
    ├── associative-arrays.md
    ├── varrays.md
    ├── collections-in-tables.md
    ├── composite-datatypes.md
    ├── dml-and-records.md
    ├── sequences.md
    └── oracle-queries-interview-guide.md
```

---

## Cloud

```
cloud/
└── aws/
    ├── aws-dynamodb-guide.md
    ├── aws-lambda-guide.md
    └── aws-networking-guide.md
```

> 📌 Structure supports adding `gcp/` and `azure/` later.

---

## Infrastructure

```
infrastructure/
├── docker/
│   └── docker-guide.md
├── kubernetes/
│   └── kubernetes-guide.md
└── kafka/
    └── kafka-guide.md
```

---

## Frontend

```
frontend/
├── html/
├── css/
│   ├── css-master-tutorial.html
│   └── flexbox-notes.html
├── javascript/
│   └── javascript-enterprise-guide.md
├── typescript/
│   └── typescript-enterprise-guide.md
├── angular/
│   ├── angular-enterprise-guide.md
│   └── angular-notes.md
├── dashboard-responsive-app/   ← working HTML/CSS app
└── prod-app/                   ← working JS app
```

---

## AI

> 🚧 In progress — actively building this section.

```
ai/
├── courses/        ← DeepLearning.AI / Coursera notes
├── llm/            ← Prompting, RAG, Agents, MCP
├── spring-ai/      ← Spring AI integration
└── langchain4j/    ← LangChain4j integration
```

---

## Conventions

- **Folders:** `kebab-case`
- **Files:** `kebab-case.md`
- **Frontmatter** on each file:
  ```yaml
  ---
  title: <title>
  tags: [tag1, tag2]
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  status: draft | review | stable
  ---
  ```

---

## Git Workflow

```bash
# Add new notes
git add -A
git commit -m "add: <topic> notes"

# Update existing
git commit -m "update: <file> - <what changed>"
```
