# Kubernetes Imperative Approach (Formatted)

## Introduction

The **imperative approach** uses `kubectl` commands to create and manage resources directly. It is fast for demos and troubleshooting, but it is harder to track changes in version control compared to declarative YAML.

## Prerequisites

- A running cluster (minikube, kind, EKS, GKE, etc.)
- `kubectl` configured for the cluster

## 1) Create a Pod
```bash
kubectl run demo-pod --image=nginx:1.27 --restart=Never --port=80
kubectl get pods -o wide
kubectl describe pod demo-pod
```

## 2) Expose the Pod (NodePort Service)
```bash
kubectl expose pod demo-pod --type=NodePort --port=80 --name=demo-pod-svc
kubectl get svc demo-pod-svc
kubectl get nodes -o wide
```

## 3) ReplicaSet (create from YAML)
ReplicaSets are commonly created from YAML. Use the provided file:

- `01-pod.yml`
- `02-pod-service.yml`
- `03-replicaset.yml`

Apply and verify:
```bash
kubectl apply -f 03-replicaset.yml
kubectl get rs
kubectl get pods -l app=my-helloworld -o wide
```

## 4) Deployment (imperative)
```bash
kubectl create deployment demo-deploy --image=nginx:1.27
kubectl scale deployment demo-deploy --replicas=3
kubectl get deploy
kubectl get rs
kubectl get pods -l app=demo-deploy
```

## 5) Update and rollback a deployment
```bash
kubectl set image deployment/demo-deploy nginx=nginx:1.27.5
kubectl rollout status deployment/demo-deploy

kubectl rollout history deployment/demo-deploy
kubectl rollout undo deployment/demo-deploy
```

## 6) Cleanup
```bash
kubectl delete pod demo-pod
kubectl delete svc demo-pod-svc
kubectl delete deploy demo-deploy
kubectl delete rs my-helloworld-rs
```
