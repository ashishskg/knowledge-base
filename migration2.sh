cd /Users/ashish/Desktop/Git_Repos/knowledge-base

# 1. Rename Java → java and Database → database (lowercase)
mv Java java
mv Database database

# 2. AWS README ended up in cloud/ root instead of cloud/aws/
mv cloud/README.md cloud/aws/README.md

# 3. Clean up leftover nested UI/ui folder inside frontend
mv frontend/ui/flexbox-notes.html frontend/css/
mkdir -p frontend/css
mv frontend/ui/flexbox-notes.html frontend/css/
rm -rf frontend/ui

# 4. Delete the migration script from the repo
rm migration.sh

# 5. Commit
git add -A
git commit -m "fix: lowercase Java→java, Database→database, cleanup leftover folders"
