#!/usr/bin/env python3
"""
Add a Table of Contents to each Markdown document in the knowledge base.
Inserts TOC after the first H1 (and optional intro) and before the first ## section.
Skips files that already have a TOC in the first 20 lines.
"""
import re
import os
from pathlib import Path

KB_ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {'.git', 'scripts'}


def slug(text: str) -> str:
    """Generate GitHub-style anchor from heading text."""
    # Strip markdown formatting (e.g. backticks, bold)
    t = re.sub(r'`+', '', text)
    t = re.sub(r'\*+', '', t)
    t = t.strip()
    # Lowercase, replace spaces and consecutive non-alphanumeric with single hyphen
    t = t.lower()
    t = re.sub(r'[^a-z0-9\s\-]', ' ', t)
    t = re.sub(r'\s+', '-', t)
    t = re.sub(r'-+', '-', t).strip('-')
    return t


def extract_headings(lines: list[tuple[int, str]]) -> list[tuple[int, int, str]]:
    """Extract (level, line_index, text) for ##, ###, #### headings. Level 2 = ##, 3 = ###, 4 = ####."""
    headings = []
    for i, line in lines:
        m = re.match(r'^(#{2,4})\s+(.+)$', line)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            # Skip "Table of Contents" / "Contents" / "Index" section itself
            if re.match(r'^(Table of )?Contents?|Index$', text, re.I):
                continue
            headings.append((level, i, text))
    return headings


def build_toc(headings: list[tuple[int, int, str]]) -> list[str]:
    """Build TOC lines (markdown list with links). Each line ends with newline."""
    lines = []
    for level, _, text in headings:
        anchor = slug(text)
        indent = '  ' * (level - 2)  # H2 no indent, H3 two spaces, H4 four spaces
        lines.append(f"{indent}- [{text}](#{anchor})\n")
    return lines


def has_toc_already(lines: list[str], max_line: int = 20) -> bool:
    """Return True if file already has a TOC in the first max_line lines."""
    for i, line in enumerate(lines):
        if i >= max_line:
            break
        if re.match(r'^##\s+(Table of )?Contents?|^##\s+Index\s*$', line.strip(), re.I):
            return True
    return False


def find_insert_index(lines: list[str]) -> int:
    """
    Find index after which to insert TOC: after first H1 and optional intro (blank, paragraph, ---).
    Insert before the first ## that is a real section (not TOC).
    If no H1 (e.g. root README with plain title), insert before the first ##.
    """
    i = 0
    while i < len(lines):
        line = lines[i]
        if re.match(r'^#\s+', line):  # H1
            i += 1
            # Skip blank lines and optional intro (non-heading, non-hr lines)
            while i < len(lines):
                l = lines[i]
                if re.match(r'^#{2,6}\s', l):
                    return i
                if l.strip() == '---':
                    i += 1
                    return i
                if l.strip() and not re.match(r'^#\s', l):
                    i += 1
                    continue
                if not l.strip():
                    i += 1
                    continue
                i += 1
            return i
        # No H1 yet: if we hit ##, insert before it (for docs that start with plain title)
        if re.match(r'^##\s+', line):
            return i
        i += 1
    return 0


def process_file(path: Path) -> bool:
    """Add TOC to file if needed. Return True if modified."""
    content = path.read_text(encoding='utf-8')
    lines = content.splitlines(keepends=True)
    if not lines:
        return False

    numbered = list(enumerate(lines))
    headings = extract_headings(numbered)
    if not headings:
        return False

    if has_toc_already([l for _, l in numbered]):
        return False

    insert_at = find_insert_index(lines)
    toc_lines = [
        "\n",
        "## Table of Contents\n",
        "\n",
    ]
    toc_lines.extend(build_toc(headings))
    toc_lines.append("\n")
    toc_lines.append("\n")
    toc_lines.append("---\n")
    toc_lines.append("\n")

    new_content = (
        ''.join(lines[:insert_at]) +
        ''.join(toc_lines) +
        ''.join(lines[insert_at:])
    )
    path.write_text(new_content, encoding='utf-8')
    return True


def main():
    modified = []
    for root, dirs, files in os.walk(KB_ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel = Path(root).relative_to(KB_ROOT)
        for f in files:
            if not f.endswith('.md'):
                continue
            path = Path(root) / f
            try:
                if process_file(path):
                    modified.append(str(path.relative_to(KB_ROOT)))
            except Exception as e:
                print(f"Error processing {path}: {e}")
    for p in modified:
        print(f"Added TOC: {p}")


if __name__ == '__main__':
    main()
