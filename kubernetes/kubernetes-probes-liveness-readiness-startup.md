# Kubernetes Probes: Liveness vs Readiness vs Startup

## Overview

Kubernetes provides three types of health check probes to ensure your containers are running correctly and ready to serve traffic. Understanding when and how to use each probe is crucial for building resilient applications.

---

## 1. Liveness Probe

### Purpose
**Determines if the container is alive and running.** If the liveness probe fails, Kubernetes kills the container and restarts it (based on the restart policy).

### When to Use
- Detect deadlocks or hung processes
- Detect application crashes that don't exit
- Detect infinite loops that consume resources
- Restart unhealthy containers automatically

### Behavior
- **Success**: Container continues running
- **Failure**: Kubernetes kills the container and restarts it (if restart policy allows)

### Example Scenarios
- Application stops responding but process is still running
- Application enters an unrecoverable state
- Memory leak causing application to hang

---

## 2. Readiness Probe

### Purpose
**Determines if the container is ready to accept traffic.** If the readiness probe fails, Kubernetes removes the pod from Service endpoints (stops sending traffic to it).

### When to Use
- Application needs time to initialize (load config, connect to DB, etc.)
- Application is temporarily unable to serve traffic
- Application needs to warm up before handling requests
- Graceful shutdown scenarios

### Behavior
- **Success**: Pod is added to Service endpoints and receives traffic
- **Failure**: Pod is removed from Service endpoints (no traffic sent), but container keeps running

### Example Scenarios
- Database connection temporarily unavailable
- Application is loading large datasets into memory
- Application is performing maintenance tasks
- External dependencies are temporarily unavailable

---

## 3. Startup Probe

### Purpose
**Determines if the application has started successfully.** This probe is used to handle slow-starting containers and prevents the liveness/readiness probes from interfering during startup.

### When to Use
- Applications with slow startup times (Java apps, legacy systems)
- Applications that need more time than the initial delay allows
- When you want to give the app more time before liveness/readiness checks begin

### Behavior
- **Success**: Kubernetes starts checking liveness and readiness probes
- **Failure**: Container is killed and restarted (if restart policy allows)
- **Key Feature**: Disables liveness and readiness probes until startup succeeds

### Example Scenarios
- Java applications that take 2-3 minutes to start
- Applications loading large configuration files
- Applications performing extensive initialization
- Legacy applications with slow startup

---

## Key Differences Summary

| Feature | Liveness Probe | Readiness Probe | Startup Probe |
|---------|---------------|-----------------|---------------|
| **Purpose** | Is container alive? | Is container ready for traffic? | Has container started? |
| **On Failure** | Kills & restarts container | Removes from Service endpoints | Kills & restarts container |
| **Traffic Impact** | No direct impact (but restart may cause downtime) | Stops sending traffic | No traffic until startup succeeds |
| **When Active** | After startup succeeds | After startup succeeds | Immediately on container start |
| **Use Case** | Detect crashes/hangs | Detect temporary unavailability | Handle slow startup |

---

## Probe Configuration Options

All three probes support the same configuration options:

### 1. HTTP GET Probe
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
    scheme: HTTP  # or HTTPS
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 3
```

### 2. TCP Socket Probe
```yaml
readinessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
  timeoutSeconds: 1
  successThreshold: 1
  failureThreshold: 3
```

### 3. Exec Command Probe
```yaml
startupProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - "pgrep -f 'java.*myapp'"
  initialDelaySeconds: 0
  periodSeconds: 10
  timeoutSeconds: 1
  successThreshold: 1
  failureThreshold: 30  # Allow up to 5 minutes for startup
```

### Configuration Parameters

- **`initialDelaySeconds`**: Number of seconds after container starts before probe is initiated
- **`periodSeconds`**: How often (in seconds) to perform the probe (default: 10)
- **`timeoutSeconds`**: Number of seconds after which the probe times out (default: 1)
- **`successThreshold`**: Minimum consecutive successes for probe to be considered successful (default: 1)
- **`failureThreshold`**: Number of consecutive failures before probe is considered failed (default: 3)

---

## Complete Example: All Three Probes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers:
  - name: myapp-container
    image: myapp:1.0.0
    ports:
    - containerPort: 8080
    
    # Startup Probe: Give app up to 5 minutes to start
    startupProbe:
      httpGet:
        path: /health/startup
        port: 8080
      initialDelaySeconds: 0
      periodSeconds: 10
      timeoutSeconds: 5
      successThreshold: 1
      failureThreshold: 30  # 30 * 10s = 5 minutes max
    
    # Liveness Probe: Check if app is alive (starts after startup succeeds)
    livenessProbe:
      httpGet:
        path: /health/live
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      successThreshold: 1
      failureThreshold: 3  # Restart after 3 failures
    
    # Readiness Probe: Check if app can serve traffic (starts after startup succeeds)
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
      timeoutSeconds: 3
      successThreshold: 1
      failureThreshold: 3  # Remove from service after 3 failures
```

---

## Best Practices

### 1. Always Use Readiness Probes
- **Why**: Prevents sending traffic to pods that aren't ready
- **Benefit**: Better user experience, fewer errors

### 2. Use Startup Probes for Slow-Starting Apps
- **Why**: Prevents liveness/readiness from killing slow-starting containers
- **Benefit**: More reliable deployments for Java/legacy apps

### 3. Use Liveness Probes Carefully
- **Why**: Failed liveness probes restart containers (can cause downtime)
- **Best Practice**: Only use for detecting truly unrecoverable states
- **Avoid**: Using liveness for temporary issues (use readiness instead)

### 4. Set Appropriate Timeouts
- **Why**: Network delays can cause false failures
- **Recommendation**: Set `timeoutSeconds` to 2-3 seconds for HTTP probes

### 5. Use Different Endpoints
- **Why**: Different checks for different purposes
- **Example**:
  - `/health/live`: Quick check if process is alive
  - `/health/ready`: Check DB connections, external dependencies
  - `/health/startup`: Check if initialization is complete

### 6. Consider Probe Frequency
- **Why**: Too frequent = resource waste, too slow = delayed detection
- **Recommendation**: 
  - Readiness: 5-10 seconds (needs to be responsive)
  - Liveness: 10-30 seconds (less critical)
  - Startup: 10 seconds (check frequently during startup)

### 7. Set Realistic Failure Thresholds
- **Why**: Prevents false positives from transient issues
- **Recommendation**: 
  - Readiness: 2-3 failures (remove quickly from service)
  - Liveness: 3-5 failures (avoid unnecessary restarts)
  - Startup: Higher threshold (30+) for slow-starting apps

---

## Common Patterns

### Pattern 1: Fast-Starting Application
```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 2

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
```

### Pattern 2: Slow-Starting Application (Java/Legacy)
```yaml
startupProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 30  # 5 minutes max

readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 3

livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 10
  failureThreshold: 3
```

### Pattern 3: Database-Dependent Application
```yaml
readinessProbe:
  httpGet:
    path: /health/ready  # Checks DB connection
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 2

livenessProbe:
  httpGet:
    path: /health/live  # Just checks if process is alive
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
```

---

## Troubleshooting

### Check Probe Status
```bash
# Describe pod to see probe status
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check pod status
kubectl get pods -w
```

### Common Issues

1. **Pod keeps restarting**
   - Check liveness probe configuration
   - Verify endpoint is responding correctly
   - Check logs: `kubectl logs <pod-name>`

2. **Pod not receiving traffic**
   - Check readiness probe status
   - Verify pod is in Ready state: `kubectl get pods`
   - Check Service endpoints: `kubectl get endpoints`

3. **Slow startup causing restarts**
   - Add startup probe with higher failure threshold
   - Increase `initialDelaySeconds` for liveness/readiness

4. **False positives**
   - Increase `timeoutSeconds`
   - Increase `failureThreshold`
   - Check network connectivity between kubelet and pod

---

## Summary

- **Liveness Probe**: "Is my container alive?" → Kills and restarts if failed
- **Readiness Probe**: "Can my container serve traffic?" → Removes from service if failed
- **Startup Probe**: "Has my container started?" → Gives slow apps time to start before other probes activate

**Golden Rule**: Use readiness probes for temporary issues, liveness probes for permanent failures, and startup probes for slow-starting applications.
