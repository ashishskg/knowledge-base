# Kubernetes Namespaces, LimitRange, and ResourceQuota

## Table of Contents
1. [Namespaces Introduction](#namespaces-introduction)
2. [Creating Namespaces Imperatively](#creating-namespaces-imperatively)
3. [LimitRange Introduction](#limitrange-introduction)
4. [Creating and Deploying LimitRange](#creating-and-deploying-limitrange)
5. [ResourceQuota Introduction](#resourcequota-introduction)
6. [Creating and Deploying ResourceQuota](#creating-and-deploying-resourcequota)
7. [Complete Examples](#complete-examples)

---

## Namespaces Introduction

### What is a Namespace?

A **Namespace** in Kubernetes is a virtual cluster within a physical cluster. It provides:
- **Logical separation** of resources
- **Resource isolation** between teams/projects
- **Access control** boundaries
- **Resource quotas** and limits per namespace

### Default Namespaces

Kubernetes comes with several built-in namespaces:

```bash
# List all namespaces
kubectl get namespaces
# or short form
kubectl get ns
```

**Default namespaces:**
- **`default`**: Default namespace for resources without a specified namespace
- **`kube-system`**: System components (kube-proxy, kube-dns, etc.)
- **`kube-public`**: Publicly accessible resources
- **`kube-node-lease`**: Node heartbeat information

### Why Use Namespaces?

1. **Multi-tenancy**: Separate environments (dev, staging, prod)
2. **Team isolation**: Different teams can work independently
3. **Resource management**: Apply quotas and limits per namespace
4. **Access control**: RBAC policies per namespace
5. **Organization**: Group related resources together

### Namespace Scope

**Namespaced resources** (isolated per namespace):
- Pods, Services, Deployments, ConfigMaps, Secrets, etc.

**Cluster-wide resources** (shared across namespaces):
- Nodes, PersistentVolumes, ClusterRoles, etc.

---

## Creating Namespaces Declaratively (YAML Manifest)

### Basic Namespace YAML Structure

```yaml
apiVersion: v1          # Always v1 for Namespace
kind: Namespace         # Resource type
metadata:
  name: <namespace-name>  # Required: namespace name
  labels:               # Optional: labels for organization
    key: value
  annotations:          # Optional: metadata
    key: value
spec:                   # Optional: finalizers
  finalizers:
    - kubernetes
```

### Basic Namespace YAML Example

Create a file `namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
```

**Deploy:**
```bash
kubectl apply -f namespace.yaml
kubectl get ns development
```

### Namespace with Labels and Annotations

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: production
    team: platform
    cost-center: engineering
  annotations:
    description: "Production environment namespace"
    owner: "platform-team@company.com"
```

**Deploy:**
```bash
kubectl apply -f namespace.yaml
kubectl get ns production --show-labels
kubectl describe ns production
```

### Multiple Namespaces in One File

```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: development
  labels:
    environment: dev
---
apiVersion: v1
kind: Namespace
metadata:
  name: staging
  labels:
    environment: staging
---
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    environment: production
```

**Deploy:**
```bash
kubectl apply -f namespaces.yaml
kubectl get ns -l environment
```

### Complete Namespace Example with All Fields

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-app
  labels:
    app: my-application
    environment: production
    managed-by: kubernetes
  annotations:
    description: "Namespace for my application"
    contact: "team@example.com"
    cost-center: "engineering"
spec:
  # Finalizers prevent namespace deletion until conditions are met
  finalizers:
    - kubernetes
```

**Deploy:**
```bash
kubectl apply -f namespace-complete.yaml
kubectl get ns my-app -o yaml
```

---

## Creating Namespaces Imperatively

### Method 1: Using `kubectl create namespace`

```bash
# Create a namespace
kubectl create namespace <namespace-name>

# Examples
kubectl create namespace development
kubectl create namespace production
kubectl create namespace staging
kubectl create namespace testing
```

### Method 2: Using `kubectl create ns` (short form)

```bash
# Short form
kubectl create ns development
kubectl create ns production
```

### Verify Namespace Creation

```bash
# List all namespaces
kubectl get namespaces
kubectl get ns

# Get detailed information about a namespace
kubectl describe namespace development
kubectl describe ns development

# Get namespace in YAML format
kubectl get namespace development -o yaml
kubectl get ns development -o yaml
```

### Create Resources in a Specific Namespace

```bash
# Create a pod in a specific namespace
kubectl run my-pod --image=nginx --namespace=development
kubectl run my-pod --image=nginx -n development  # Short form

# Create a deployment in a namespace
kubectl create deployment my-app --image=nginx -n development

# List pods in a namespace
kubectl get pods -n development
kubectl get pods --namespace=development

# Set default namespace for current context
kubectl config set-context --current --namespace=development

# Verify current namespace
kubectl config view --minify | grep namespace
```

### Delete a Namespace

```bash
# Delete a namespace (deletes all resources in it)
kubectl delete namespace development
kubectl delete ns development

# Delete with force (use with caution)
kubectl delete namespace development --force --grace-period=0
```

### Switch Between Namespaces

```bash
# Set default namespace for current context
kubectl config set-context --current --namespace=production

# View current namespace
kubectl config view --minify --output 'jsonpath={..namespace}'

# List all contexts
kubectl config get-contexts

# Switch context (if you have multiple clusters)
kubectl config use-context <context-name>
```

---

## LimitRange Introduction

### What is LimitRange?

**LimitRange** is a Kubernetes resource that:
- Sets **default** resource requests and limits for containers
- Sets **minimum** and **maximum** resource constraints per container
- Sets **default** storage requests for PersistentVolumeClaims
- Prevents resource exhaustion by enforcing limits

### Why Use LimitRange?

1. **Prevent resource starvation**: Ensures no container uses all resources
2. **Set defaults**: Automatically applies requests/limits if not specified
3. **Enforce policies**: Ensures all containers have resource constraints
4. **Cost control**: Prevents over-provisioning

### LimitRange Scope

- **Namespace-scoped**: Applies to all containers/PVCs in a namespace
- **Multiple LimitRanges**: Can have multiple LimitRanges per namespace
- **Validation**: Validates resources at creation time

### LimitRange Types

1. **Container Limits**: CPU/Memory requests and limits per container
2. **Pod Limits**: Total CPU/Memory requests and limits per pod
3. **PVC Limits**: Storage requests and limits per PersistentVolumeClaim

---

## Creating and Deploying LimitRange

### Step 1: Create LimitRange Manifest

Create a file `limitrange.yaml`:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: development  # Optional: can be set during apply
spec:
  limits:
  # Container-level limits
  - default:
      memory: "512Mi"
      cpu: "500m"
    defaultRequest:
      memory: "256Mi"
      cpu: "250m"
    max:
      memory: "2Gi"
      cpu: "2000m"
    min:
      memory: "128Mi"
      cpu: "100m"
    type: Container
  
  # Pod-level limits (total across all containers)
  - max:
      memory: "4Gi"
      cpu: "4000m"
    min:
      memory: "256Mi"
      cpu: "250m"
    type: Pod
  
  # PersistentVolumeClaim limits
  - max:
      storage: "10Gi"
    min:
      storage: "1Gi"
    type: PersistentVolumeClaim
```

### Step 2: Deploy LimitRange

```bash
# Create namespace first (if it doesn't exist)
kubectl create namespace development

# Apply LimitRange
kubectl apply -f limitrange.yaml

# Or create directly with kubectl
kubectl create -f limitrange.yaml

# Verify LimitRange creation
kubectl get limitrange -n development
kubectl get limitrange -n development -o yaml

# Describe LimitRange
kubectl describe limitrange default-limits -n development
```

### Step 3: Verify LimitRange is Working

```bash
# Create a pod without resources (will get defaults)
kubectl run test-pod --image=nginx -n development

# Check pod resources (should have defaults applied)
kubectl get pod test-pod -n development -o yaml | grep -A 10 resources

# Describe pod to see applied limits
kubectl describe pod test-pod -n development
```

### Complete LimitRange Example

**File: `limitrange-complete.yaml`**

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: compute-limits
  namespace: production
spec:
  limits:
  # Container limits
  - default:
      memory: "1Gi"
      cpu: "1000m"
    defaultRequest:
      memory: "512Mi"
      cpu: "500m"
    max:
      memory: "4Gi"
      cpu: "4000m"
    min:
      memory: "128Mi"
      cpu: "100m"
    type: Container
  
  # Pod limits
  - max:
      memory: "8Gi"
      cpu: "8000m"
    min:
      memory: "256Mi"
      cpu: "250m"
    type: Pod
```

**Deploy:**

```bash
kubectl create namespace production
kubectl apply -f limitrange-complete.yaml
kubectl get limitrange -n production
```

---

## ResourceQuota Introduction

### What is ResourceQuota?

**ResourceQuota** is a Kubernetes resource that:
- Sets **hard limits** on total resource usage in a namespace
- Prevents **resource exhaustion** at namespace level
- Enforces **resource quotas** per namespace
- Works with **LimitRange** for complete resource management

### Why Use ResourceQuota?

1. **Multi-tenancy**: Limit resources per team/project
2. **Cost control**: Prevent over-provisioning
3. **Fair resource allocation**: Ensure fair distribution
4. **Compliance**: Enforce organizational policies

### ResourceQuota Scope

- **Namespace-scoped**: Applies to entire namespace
- **Hard limits**: Cannot be exceeded (creation will fail)
- **Aggregate limits**: Sum of all resources in namespace

### ResourceQuota Types

1. **Compute Resources**: CPU, Memory
2. **Storage Resources**: PersistentVolumeClaims, requests.storage
3. **Object Counts**: Pods, Services, ConfigMaps, Secrets, etc.

---

## Creating and Deploying ResourceQuota

### Step 1: Create ResourceQuota Manifest

Create a file `resourcequota.yaml`:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: development
spec:
  hard:
    # Compute resources
    requests.cpu: "10"           # 10 CPU cores total
    requests.memory: 20Gi        # 20 GiB memory total
    limits.cpu: "20"             # 20 CPU cores max
    limits.memory: 40Gi          # 40 GiB memory max
    
    # Storage resources
    requests.storage: "100Gi"    # 100 GiB storage total
    persistentvolumeclaims: "10" # Max 10 PVCs
    
    # Object counts
    pods: "20"                   # Max 20 pods
    services: "10"               # Max 10 services
    configmaps: "20"             # Max 20 ConfigMaps
    secrets: "20"                # Max 20 Secrets
    persistentvolumeclaims: "10" # Max 10 PVCs
```

### Step 2: Deploy ResourceQuota

```bash
# Create namespace (if it doesn't exist)
kubectl create namespace development

# Apply ResourceQuota
kubectl apply -f resourcequota.yaml

# Or create directly
kubectl create -f resourcequota.yaml

# Verify ResourceQuota
kubectl get resourcequota -n development
kubectl get quota -n development  # Short form

# Describe ResourceQuota
kubectl describe resourcequota compute-quota -n development

# Get ResourceQuota in YAML
kubectl get resourcequota compute-quota -n development -o yaml
```

### Step 3: Check ResourceQuota Usage

```bash
# View current usage
kubectl describe resourcequota compute-quota -n development

# Output shows:
# Resource Quotas
# Name:            compute-quota
# Namespace:       development
# Resource         Used  Hard
# --------         ----  ----
# limits.cpu       2     20
# limits.memory    4Gi   40Gi
# pods             5     20
# requests.cpu     1     10
# requests.memory 2Gi   20Gi
```

### Complete ResourceQuota Example

**File: `resourcequota-complete.yaml`**

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
spec:
  hard:
    # Compute resources
    requests.cpu: "50"
    requests.memory: 100Gi
    limits.cpu: "100"
    limits.memory: 200Gi
    
    # Storage
    requests.storage: "500Gi"
    persistentvolumeclaims: "50"
    
    # Object counts
    pods: "100"
    services: "50"
    deployments.apps: "20"
    replicasets.apps: "50"
    configmaps: "100"
    secrets: "100"
    ingresses.extensions: "10"
```

**Deploy:**

```bash
kubectl create namespace production
kubectl apply -f resourcequota-complete.yaml
kubectl describe resourcequota production-quota -n production
```

---

## Complete Examples

### Example 1: Development Environment Setup

**Step 1: Create namespace**

```bash
kubectl create namespace development
```

**Step 2: Create LimitRange (`dev-limitrange.yaml`)**

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: development
spec:
  limits:
  - default:
      memory: "512Mi"
      cpu: "500m"
    defaultRequest:
      memory: "256Mi"
      cpu: "250m"
    max:
      memory: "2Gi"
      cpu: "2000m"
    min:
      memory: "128Mi"
      cpu: "100m"
    type: Container
```

**Step 3: Create ResourceQuota (`dev-resourcequota.yaml`)**

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: development
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
    services: "20"
```

**Step 4: Deploy**

```bash
kubectl apply -f dev-limitrange.yaml
kubectl apply -f dev-resourcequota.yaml

# Verify
kubectl get limitrange,resourcequota -n development
```

### Example 2: Production Environment Setup

**File: `production-setup.yaml`**

```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
apiVersion: v1
kind: LimitRange
metadata:
  name: prod-limits
  namespace: production
spec:
  limits:
  - default:
      memory: "1Gi"
      cpu: "1000m"
    defaultRequest:
      memory: "512Mi"
      cpu: "500m"
    max:
      memory: "4Gi"
      cpu: "4000m"
    min:
      memory: "256Mi"
      cpu: "250m"
    type: Container
  - max:
      memory: "8Gi"
      cpu: "8000m"
    type: Pod
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: prod-quota
  namespace: production
spec:
  hard:
    requests.cpu: "50"
    requests.memory: 100Gi
    limits.cpu: "100"
    limits.memory: 200Gi
    pods: "100"
    services: "50"
    persistentvolumeclaims: "50"
    requests.storage: "500Gi"
```

**Deploy:**

```bash
kubectl apply -f production-setup.yaml

# Verify everything
kubectl get ns production
kubectl get limitrange,resourcequota -n production
```

### Example 3: Testing LimitRange Defaults

**Create a pod without resources:**

```bash
kubectl run test-pod --image=nginx -n development
```

**Check applied resources:**

```bash
kubectl get pod test-pod -n development -o jsonpath='{.spec.containers[0].resources}'
```

**Expected output (from LimitRange defaults):**
```json
{
  "limits": {
    "cpu": "500m",
    "memory": "512Mi"
  },
  "requests": {
    "cpu": "250m",
    "memory": "256Mi"
  }
}
```

### Example 4: Testing ResourceQuota Limits

**Try to exceed quota:**

```bash
# Create deployment that exceeds quota
kubectl create deployment large-app \
  --image=nginx \
  --replicas=100 \
  -n development

# Check if pods are created
kubectl get pods -n development

# Check ResourceQuota usage
kubectl describe resourcequota dev-quota -n development

# Some pods will be in Pending state due to quota limits
```

---

## Commands Reference

### Namespace Commands

```bash
# Create
kubectl create namespace <name>
kubectl create ns <name>

# List
kubectl get namespaces
kubectl get ns

# Describe
kubectl describe namespace <name>
kubectl describe ns <name>

# Delete
kubectl delete namespace <name>
kubectl delete ns <name>

# Set default namespace
kubectl config set-context --current --namespace=<name>

# View current namespace
kubectl config view --minify | grep namespace
```

### LimitRange Commands

```bash
# Create
kubectl apply -f limitrange.yaml
kubectl create -f limitrange.yaml

# List
kubectl get limitrange -n <namespace>
kubectl get limits -n <namespace>

# Describe
kubectl describe limitrange <name> -n <namespace>

# Delete
kubectl delete limitrange <name> -n <namespace>
```

### ResourceQuota Commands

```bash
# Create
kubectl apply -f resourcequota.yaml
kubectl create -f resourcequota.yaml

# List
kubectl get resourcequota -n <namespace>
kubectl get quota -n <namespace>

# Describe (shows usage)
kubectl describe resourcequota <name> -n <namespace>

# Delete
kubectl delete resourcequota <name> -n <namespace>
```

---

## Best Practices

### 1. Namespace Organization

```bash
# Organize by environment
kubectl create ns dev
kubectl create ns staging
kubectl create ns prod

# Organize by team
kubectl create ns team-frontend
kubectl create ns team-backend
kubectl create ns team-data
```

### 2. LimitRange Best Practices

- **Set defaults**: Always set defaultRequest and default
- **Set minimums**: Prevent resource starvation
- **Set maximums**: Prevent single container from consuming all resources
- **Match your app needs**: Base limits on actual usage

### 3. ResourceQuota Best Practices

- **Start conservative**: Set quotas based on actual needs
- **Monitor usage**: Regularly check quota usage
- **Adjust over time**: Increase quotas as needed
- **Use with LimitRange**: Combine both for complete control

### 4. Combined Strategy

```yaml
# 1. Create namespace
# 2. Apply LimitRange (container-level defaults)
# 3. Apply ResourceQuota (namespace-level limits)
# This provides:
# - Defaults for containers without resources
# - Maximum limits per container
# - Total limits per namespace
```

---

## Troubleshooting

### Issue 1: Pod Creation Fails - "exceeded quota"

**Error:**
```
Error from server (Forbidden): error when creating "pod.yaml": 
pods "my-pod" is forbidden: exceeded quota: compute-quota
```

**Solution:**
```bash
# Check current quota usage
kubectl describe resourcequota compute-quota -n development

# Reduce resource requests or delete unused resources
# Or increase quota limits
```

### Issue 2: Pod Creation Fails - "exceeded maximum"

**Error:**
```
Error from server (Forbidden): pods "my-pod" is forbidden: 
maximum memory usage per Container is 2Gi, but limit is 4Gi
```

**Solution:**
```bash
# Check LimitRange max limits
kubectl describe limitrange default-limits -n development

# Reduce container limits or increase LimitRange max
```

### Issue 3: Pod Gets Default Resources When Not Expected

**Symptom:** Pod has resources even though you didn't specify them

**Solution:**
```bash
# Check LimitRange defaults
kubectl describe limitrange default-limits -n development

# LimitRange applies defaults automatically
# Explicitly set resources in pod spec to override
```

---

## Summary

### Namespaces
- Logical separation of resources
- Create with `kubectl create namespace <name>`
- Use for multi-tenancy and organization

### LimitRange
- Sets default and min/max resource constraints
- Applies to containers, pods, and PVCs
- Prevents resource starvation

### ResourceQuota
- Sets hard limits on namespace resources
- Prevents resource exhaustion
- Works with LimitRange for complete control

### Combined Approach
```
Namespace → LimitRange (defaults & constraints) → ResourceQuota (total limits)
```

This provides complete resource management and isolation in Kubernetes!
