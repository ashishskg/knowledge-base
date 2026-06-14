cd /Users/ashish/Desktop/Git_Repos/knowledge-base

# java/ - normalize filenames to kebab-case
mv java/ConcurrentHashMap-Guide.md java/concurrent-hashmap-guide.md
mv java/CustomArrayList-Guide.md java/custom-arraylist-guide.md
mv java/HashMap-Guide.md java/hashmap-guide.md
mv java/Java21-Concurrency-Guide.md java/java21-concurrency-guide.md
mv java/Java21-Features-Guide.md java/java21-features-guide.md
mv java/Java8-Guide.md java/java8-guide.md
mv java/Java8-Interview-Guide.md java/java8-interview-guide.md
mv java/List-Guide.md java/list-guide.md
mv java/Threading-Basic-Guide.md java/threading-basic-guide.md
mv java/Threading-Enterprise-Guide.md java/threading-enterprise-guide.md

# database/Oracle - normalize folder and filenames
mv database/Oracle database/oracle
mv database/Oracle-Database-Guide.md database/oracle-database-guide.md
mv database/oracle/Associative_Arrays.md database/oracle/associative-arrays.md
mv database/oracle/Collections_In_Tables.md database/oracle/collections-in-tables.md
mv database/oracle/Composite_Datatypes.md database/oracle/composite-datatypes.md
mv database/oracle/Cursors.md database/oracle/cursors.md
mv database/oracle/DML_And_Records.md database/oracle/dml-and-records.md
mv database/oracle/Exceptions.md database/oracle/exceptions.md
mv database/oracle/INDEX.md database/oracle/INDEX.md
mv database/oracle/Oracle_Queries_And_Interview_Guide.md database/oracle/oracle-queries-interview-guide.md
mv database/oracle/Procedures.md database/oracle/procedures.md
mv database/oracle/Sequences.md database/oracle/sequences.md
mv database/oracle/Varrays.md database/oracle/varrays.md

# frontend - move CSS_Master_Tutorial into css/
mv frontend/CSS_Master_Tutorial.html frontend/css/css-master-tutorial.html

# frontend/angular - normalize
mv frontend/angular/ANGULAR-NOTES.md frontend/angular/angular-notes.md

# infrastructure - normalize
mv infrastructure/kubernetes/Kubernetes-Guide.md infrastructure/kubernetes/kubernetes-guide.md

git add -A
git commit -m "chore: normalize all filenames to kebab-case"
