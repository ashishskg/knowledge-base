cd /Users/ashish/Desktop/Git_Repos/knowledge-base/java

add_frontmatter() {
  local file="$1"
  local title="$2"
  local tags="$3"
  local level="$4"
  local related="$5"

  # Only add if frontmatter doesn't already exist
  if ! head -1 "$file" | grep -q "^---"; then
    tmpfile=$(mktemp)
    cat > "$tmpfile" <<EOF
---
title: $title
tags: [$tags]
created: 2024-01-01
updated: 2026-06-14
status: stable
level: $level
related: [$related]
---

EOF
    cat "$file" >> "$tmpfile"
    mv "$tmpfile" "$file"
    echo "✅ Added frontmatter to $file"
  else
    echo "⏭️  Skipped $file (already has frontmatter)"
  fi
}

add_frontmatter "java8-guide.md" \
  "Java 8 — Enterprise Reference" \
  "java, java8, streams, lambdas, optional" \
  "beginner → architect" \
  "java8-interview-guide.md"

add_frontmatter "java8-interview-guide.md" \
  "Java 8 — Interview Guide" \
  "java, java8, interview" \
  "intermediate → senior" \
  "java8-guide.md"

add_frontmatter "threading-basic-guide.md" \
  "Java Threading — Basics" \
  "java, threads, concurrency, synchronized" \
  "beginner → intermediate" \
  "threading-enterprise-guide.md"

add_frontmatter "threading-enterprise-guide.md" \
  "Java Threading — Enterprise" \
  "java, threads, virtual-threads, executors" \
  "senior → architect" \
  "threading-basic-guide.md"

add_frontmatter "java21-features-guide.md" \
  "Java 21 — New Features" \
  "java, java21, records, sealed-classes" \
  "intermediate → senior" \
  "java21-concurrency-guide.md"

add_frontmatter "java21-concurrency-guide.md" \
  "Java 21 — Concurrency & Virtual Threads" \
  "java, java21, virtual-threads, structured-concurrency" \
  "senior → architect" \
  "threading-enterprise-guide.md"

add_frontmatter "hashmap-guide.md" \
  "HashMap — Deep Dive" \
  "java, collections, hashmap, internals" \
  "intermediate" \
  "concurrent-hashmap-guide.md"

add_frontmatter "concurrent-hashmap-guide.md" \
  "ConcurrentHashMap Guide" \
  "java, collections, concurrency, thread-safe" \
  "senior" \
  "hashmap-guide.md"

add_frontmatter "list-guide.md" \
  "Java List Guide" \
  "java, collections, list, arraylist" \
  "beginner → intermediate" \
  "custom-arraylist-guide.md"

add_frontmatter "custom-arraylist-guide.md" \
  "Custom ArrayList Implementation" \
  "java, collections, internals, data-structures" \
  "senior" \
  "list-guide.md"
