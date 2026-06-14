cd /Users/ashish/Desktop/Git_Repos/knowledge-base

# Fix .gitignore first
echo ".DS_Store" >> .gitignore
find . -name ".DS_Store" -delete

# Remove stray file
rm -f abc.txt

# Create parent directories FIRST
mkdir -p architecture/system-design
mkdir -p architecture/microservices
mkdir -p infrastructure/docker
mkdir -p infrastructure/kubernetes
mkdir -p infrastructure/kafka
mkdir -p cloud/aws
mkdir -p ai/{courses,llm,spring-ai,langchain4j}

# Move System_Design contents into architecture/system-design
mv System_Design/* architecture/system-design/
rmdir System_Design

# Move Microservice contents into architecture/microservices
mv Microservice/* architecture/microservices/
rmdir Microservice

# Move Docker, Kubernetes, Kafka
mv Docker/* infrastructure/docker/
rmdir Docker
mv Kubernetes/* infrastructure/kubernetes/
rmdir Kubernetes
mv Kafka/* infrastructure/kafka/
rmdir Kafka

# Move AWS contents into cloud/aws
mv AWS/* cloud/aws/
rmdir AWS

# Reorganize Java
mv Java_Design_Pattern Java/design-patterns
mv Jakarta Java/jakarta

# Rename top-level folders
mv Java java
mv Database database
mv UI frontend

# Create AI README
echo "# AI / ML Notes" > ai/README.md

# Commit everything
git add -A
git commit -m "refactor: reorganize knowledge base structure"
