# Kubernetes Resource Requests and Limits




## Table of Contents

- [Overview](#overview)
- [Key Concepts](#key-concepts)
  - [1. Resource Requests (`requests`)](#1-resource-requests-requests)
  - [2. Resource Limits (`limits`)](#2-resource-limits-limits)
- [CPU vs Memory: Critical Differences](#cpu-vs-memory-critical-differences)
  - [CPU Details](#cpu-details)
  - [Memory Details](#memory-details)
- [How Kubernetes Uses Requests and Limits](#how-kubernetes-uses-requests-and-limits)
  - [Scheduling Decision (Requests)](#scheduling-decision-requests)
  - [Resource Enforcement (Limits)](#resource-enforcement-limits)
  - [Node Capacity Calculation](#node-capacity-calculation)
- [Basic Example](#basic-example)
- [Resource QoS Classes](#resource-qos-classes)
  - [1. Guaranteed (Highest Priority)](#1-guaranteed-highest-priority)
  - [2. Burstable (Medium Priority)](#2-burstable-medium-priority)
  - [3. BestEffort (Lowest Priority)](#3-besteffort-lowest-priority)
- [Complete Examples](#complete-examples)
  - [Example 1: Web Application (Burstable)](#example-1-web-application-burstable)
  - [Example 2: Database (Guaranteed)](#example-2-database-guaranteed)
  - [Example 3: Batch Job (BestEffort)](#example-3-batch-job-besteffort)
  - [Example 4: Multi-Container Pod](#example-4-multi-container-pod)
- [Best Practices](#best-practices)
  - [1. Always Set Requests](#1-always-set-requests)
  - [2. Set Limits Based on Application Needs](#2-set-limits-based-on-application-needs)
  - [3. Start Conservative, Monitor, Adjust](#3-start-conservative-monitor-adjust)
  - [4. Use Different Values for Requests vs Limits](#4-use-different-values-for-requests-vs-limits)
  - [5. Consider Application Type](#5-consider-application-type)
  - [6. Monitor Resource Usage](#6-monitor-resource-usage)
  - [7. Use Resource Quotas (Namespace Level)](#7-use-resource-quotas-namespace-level)
  - [8. Use LimitRange (Default Limits)](#8-use-limitrange-default-limits)
- [Common Patterns](#common-patterns)
  - [Pattern 1: Small Web Service](#pattern-1-small-web-service)
  - [Pattern 2: Medium Web Application](#pattern-2-medium-web-application)
  - [Pattern 3: Large Application](#pattern-3-large-application)
  - [Pattern 4: Microservice (Lightweight)](#pattern-4-microservice-lightweight)
- [Troubleshooting](#troubleshooting)
  - [Issue 1: Pod Not Scheduling (Pending)](#issue-1-pod-not-scheduling-pending)
  - [Issue 2: Pod Killed (OOMKilled)](#issue-2-pod-killed-oomkilled)
  - [Issue 3: Slow Performance (CPU Throttling)](#issue-3-slow-performance-cpu-throttling)
  - [Issue 4: Resource Waste](#issue-4-resource-waste)
- [Commands Reference](#commands-reference)
  - [Check Resource Usage](#check-resource-usage)
  - [Check Node Capacity](#check-node-capacity)
  - [Check Resource Quotas](#check-resource-quotas)
- [CPU and Memory Units Reference](#cpu-and-memory-units-reference)
  - [CPU Units](#cpu-units)
  - [Memory Units](#memory-units)
- [Real-World Example: Spring Boot Application](#real-world-example-spring-boot-application)
- [Summary](#summary)
  - [Key Takeaways](#key-takeaways)
  - [Quick Reference](#quick-reference)
  - [Remember](#remember)


---

## Overview

Resource requests and limits are critical for managing compute resources (CPU and Memory) in Kubernetes. They help ensure:
- **Fair resource allocation** across pods
- **Prevent resource starvation** (one pod consuming all resources)
- **Enable proper scheduling** decisions
- **Control costs** in cloud environments

---

## Key Concepts

### 1. Resource Requests (`requests`)
- **Definition**: Minimum guaranteed resources a container needs
- **Purpose**: Used by Kubernetes scheduler to decide which node can run the pod
- **Guarantee**: Kubernetes guarantees these resources are available
- **Behavior**: If not specified, defaults to 0 (no guarantee)

### 2. Resource Limits (`limits`)
- **Definition**: Maximum resources a container can use
- **Purpose**: Prevents a container from consuming all node resources
- **Enforcement**: 
  - **CPU**: Throttled if exceeded (soft limit)
  - **Memory**: Container killed if exceeded (hard limit - OOMKilled)
- **Behavior**: If not specified, container can use all available resources on the node

---

## CPU vs Memory: Critical Differences

| Resource | Unit | Request Behavior | Limit Behavior | Exceeding Limit |
|----------|------|------------------|----------------|-----------------|
| **CPU** | Cores (1, 0.5) or millicores (1000m, 500m) | Guaranteed minimum | Maximum allowed | **Throttled** (slowed down) |
| **Memory** | Bytes (Ki, Mi, Gi, Ti) | Guaranteed minimum | Maximum allowed | **Killed** (OOMKilled) |

### CPU Details
- **1 CPU core = 1000m (millicores)**
- **0.5 CPU = 500m**
- **Fractional**: Can request 0.1, 0.25, etc.
- **Exceeding limit**: CPU throttling (performance degradation, not termination)
- **Measured over time**: CPU usage is averaged

### Memory Details
- **Units**: 
  - `Ki` = Kibibyte (1024 bytes)
  - `Mi` = Mebibyte (1024² bytes)
  - `Gi` = Gibibyte (1024³ bytes)
  - `Ti` = Tebibyte (1024⁴ bytes)
- **Exceeding limit**: Container is **killed immediately** (OOMKilled)
- **Measured instantly**: Memory usage is measured at a point in time

---

## How Kubernetes Uses Requests and Limits

### Scheduling Decision (Requests)
```
1. Pod created with requests: CPU=500m, Memory=512Mi
2. Scheduler checks all nodes
3. Finds nodes with at least 500m CPU and 512Mi Memory available
4. Schedules pod on one of those nodes
```

### Resource Enforcement (Limits)
```
1. Container tries to use more than limit
2. Kubernetes enforces:
   - CPU: Throttles (reduces CPU time)
   - Memory: Kills container (OOMKilled)
```

### Node Capacity Calculation
```
Node Total Resources = Sum of all Pod Requests + System Reserved + Eviction Threshold
```

---

## Basic Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp-container
    image: myapp:1.0.0
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"      # 0.25 CPU cores
      limits:
        memory: "512Mi"
        cpu: "500m"      # 0.5 CPU cores
```

**What this means:**
- **Guaranteed**: 256Mi memory and 250m CPU
- **Maximum allowed**: 512Mi memory and 500m CPU
- **If exceeds**: CPU throttled, Memory → OOMKilled

---

## Resource QoS Classes

Kubernetes assigns Quality of Service (QoS) classes based on resource configuration:

### 1. Guaranteed (Highest Priority)
**All containers have requests = limits**
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "512Mi"  # Same as request
    cpu: "500m"      # Same as request
```
- **Priority**: Highest (last to be evicted)
- **Use case**: Critical applications

### 2. Burstable (Medium Priority)
**At least one container has request < limit or only requests specified**
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"  # Higher than request
    cpu: "500m"      # Higher than request
```
- **Priority**: Medium
- **Use case**: Most applications (can burst when resources available)

### 3. BestEffort (Lowest Priority)
**No requests or limits specified**
```yaml
# No resources section
```
- **Priority**: Lowest (first to be evicted)
- **Use case**: Non-critical workloads, batch jobs

---

## Complete Examples

### Example 1: Web Application (Burstable)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: webapp:1.0.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "1000m"  # Can burst to 1 CPU
```

### Example 2: Database (Guaranteed)
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
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
        image: postgres:14
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"   # Same as request = Guaranteed
            cpu: "1000m"    # Same as request = Guaranteed
```

### Example 3: Batch Job (BestEffort)
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-processor
spec:
  template:
    spec:
      containers:
      - name: processor
        image: processor:1.0.0
        # No resources = BestEffort QoS
      restartPolicy: Never
```

### Example 4: Multi-Container Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multi-container-pod
spec:
  containers:
  - name: app
    image: app:1.0.0
    resources:
      requests:
        memory: "256Mi"
        cpu: "200m"
      limits:
        memory: "512Mi"
        cpu: "500m"
  
  - name: sidecar
    image: sidecar:1.0.0
    resources:
      requests:
        memory: "128Mi"
        cpu: "100m"
      limits:
        memory: "256Mi"
        cpu: "200m"
```

**Pod-level resources** = Sum of all container resources:
- **Total requests**: 384Mi memory, 300m CPU
- **Total limits**: 768Mi memory, 700m CPU

---

## Best Practices

### 1. Always Set Requests
- **Why**: Enables proper scheduling and prevents resource starvation
- **Benefit**: Predictable performance and fair resource allocation

### 2. Set Limits Based on Application Needs
- **CPU**: Set 2-3x request (allows bursting)
- **Memory**: Set 1.5-2x request (buffer for spikes)
- **Avoid**: Setting limits too high (defeats the purpose)

### 3. Start Conservative, Monitor, Adjust
```
1. Start with conservative requests/limits
2. Monitor actual usage (kubectl top pods)
3. Adjust based on metrics
4. Leave 20-30% headroom for spikes
```

### 4. Use Different Values for Requests vs Limits
- **Requests**: Based on average/typical usage
- **Limits**: Based on peak usage + buffer
- **Ratio**: 
  - CPU: Limit = 2-3x Request
  - Memory: Limit = 1.5-2x Request

### 5. Consider Application Type

**Stateless Web Apps:**
```yaml
requests:
  cpu: "200m"
  memory: "256Mi"
limits:
  cpu: "1000m"      # Can burst
  memory: "512Mi"
```

**Stateful Databases:**
```yaml
requests:
  cpu: "1000m"
  memory: "4Gi"
limits:
  cpu: "1000m"      # Same = Guaranteed
  memory: "4Gi"     # Same = Guaranteed
```

**Batch Jobs:**
```yaml
# Can use BestEffort or minimal requests
requests:
  cpu: "500m"
  memory: "1Gi"
limits:
  cpu: "2000m"
  memory: "2Gi"
```

### 6. Monitor Resource Usage
```bash
# Check current resource usage
kubectl top pods
kubectl top nodes

# Describe pod to see requests/limits
kubectl describe pod <pod-name>

# Check for OOMKilled
kubectl get pods | grep OOMKilled
```

### 7. Use Resource Quotas (Namespace Level)
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: production
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
```

### 8. Use LimitRange (Default Limits)
```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production
spec:
  limits:
  - default:
      memory: "512Mi"
      cpu: "500m"
    defaultRequest:
      memory: "256Mi"
      cpu: "250m"
    type: Container
```

---

## Common Patterns

### Pattern 1: Small Web Service
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

### Pattern 2: Medium Web Application
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "2000m"
```

### Pattern 3: Large Application
```yaml
resources:
  requests:
    memory: "2Gi"
    cpu: "2000m"
  limits:
    memory: "4Gi"
    cpu: "4000m"
```

### Pattern 4: Microservice (Lightweight)
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "128Mi"
    cpu: "200m"
```

---

## Troubleshooting

### Issue 1: Pod Not Scheduling (Pending)
**Symptom**: Pod stays in `Pending` state
```bash
kubectl describe pod <pod-name>
# Look for: "Insufficient cpu" or "Insufficient memory"
```

**Solution**:
- Reduce resource requests
- Add more nodes to cluster
- Check node capacity: `kubectl describe nodes`

### Issue 2: Pod Killed (OOMKilled)
**Symptom**: Pod status shows `OOMKilled`
```bash
kubectl get pods
# NAME          STATUS      RESTARTS
# myapp-pod     OOMKilled   3
```

**Solution**:
- Increase memory limit
- Optimize application memory usage
- Check memory leaks

### Issue 3: Slow Performance (CPU Throttling)
**Symptom**: Application slow, CPU throttled
```bash
kubectl top pod <pod-name>
# Check if CPU usage is at limit
```

**Solution**:
- Increase CPU limit
- Optimize application CPU usage
- Check for inefficient code

### Issue 4: Resource Waste
**Symptom**: Low actual usage vs high requests
```bash
kubectl top pods
# Compare actual usage vs requests
```

**Solution**:
- Reduce requests to match actual usage
- Leave 20-30% buffer for spikes

---

## Commands Reference

### Check Resource Usage
```bash
# Pod resource usage
kubectl top pods
kubectl top pods --namespace production
kubectl top pod <pod-name>

# Node resource usage
kubectl top nodes

# Detailed pod info (shows requests/limits)
kubectl describe pod <pod-name>

# Get pod YAML with resources
kubectl get pod <pod-name> -o yaml
```

### Check Node Capacity
```bash
# Node details
kubectl describe node <node-name>

# Node capacity and allocatable
kubectl get nodes -o custom-columns=\
NAME:.metadata.name,\
CPU-REQ:.status.allocatable.cpu,\
MEM-REQ:.status.allocatable.memory
```

### Check Resource Quotas
```bash
# List quotas
kubectl get resourcequota

# Describe quota
kubectl describe resourcequota <quota-name>
```

---

## CPU and Memory Units Reference

### CPU Units
- `1` = 1 CPU core
- `0.5` = 0.5 CPU cores
- `1000m` = 1000 millicores = 1 CPU core
- `500m` = 500 millicores = 0.5 CPU cores
- `100m` = 100 millicores = 0.1 CPU cores

### Memory Units
- `Ki` = Kibibyte (1024 bytes)
- `Mi` = Mebibyte (1024² = 1,048,576 bytes)
- `Gi` = Gibibyte (1024³ = 1,073,741,824 bytes)
- `Ti` = Tebibyte (1024⁴ bytes)

**Examples:**
- `128Mi` = 128 Mebibytes
- `2Gi` = 2 Gibibytes
- `512Mi` = 512 Mebibytes

**Note**: Use binary units (Ki, Mi, Gi) not decimal (KB, MB, GB)

---

## Real-World Example: Spring Boot Application

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spring-boot-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: spring-boot-app
  template:
    metadata:
      labels:
        app: spring-boot-app
    spec:
      containers:
      - name: app
        image: spring-boot-app:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: JAVA_OPTS
          value: "-Xms512m -Xmx1024m"  # JVM heap settings
        resources:
          requests:
            memory: "768Mi"   # JVM heap (1024m) + overhead (~300Mi)
            cpu: "500m"
          limits:
            memory: "1536Mi"  # 1.5x request for spikes
            cpu: "2000m"      # 2 CPU cores max
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
```

**Key Points:**
- Memory request accounts for JVM heap + overhead
- Limits allow bursting for traffic spikes
- Probes ensure health checks work properly

---

## Summary

### Key Takeaways

1. **Requests**: Minimum guaranteed resources (used for scheduling)
2. **Limits**: Maximum allowed resources (enforced by Kubernetes)
3. **CPU**: Throttled when limit exceeded
4. **Memory**: Killed (OOMKilled) when limit exceeded
5. **QoS Classes**: Guaranteed > Burstable > BestEffort
6. **Best Practice**: Always set requests, set limits 1.5-3x requests

### Quick Reference

```yaml
# Minimum recommended configuration
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"    # 2x request
    cpu: "1000m"       # 4x request (allows bursting)
```

### Remember
- **No requests** = Can't schedule properly
- **No limits** = Can consume all node resources
- **Requests = Limits** = Guaranteed QoS (highest priority)
- **Monitor and adjust** based on actual usage
