#!/usr/bin/env python3
"""Remove the first '## Table of Contents' block so add_toc can be re-run."""
import re
from pathlib import Path

KB_ROOT = Path(__file__).resolve().parent.parent

def remove_toc(path: Path) -> bool:
    content = path.read_text(encoding='utf-8')
    # Match from "## Table of Contents" through next "---" (TOC can be one long line or multiple)
    # Also match at start of file (no leading newlines)
    pattern = r'(?:\n\n|^)## Table of Contents\n\n.*?\n\n---\n\n'
    new_content = re.sub(pattern, '\n\n', content, count=1, flags=re.DOTALL)
    if new_content != content:
        path.write_text(new_content, encoding='utf-8')
        return True
    return False

def main():
    for f in KB_ROOT.rglob('*.md'):
        if '.git' in f.parts or f.parent.name == 'scripts':
            continue
        if remove_toc(f):
            print(f"Removed TOC: {f.relative_to(KB_ROOT)}")

if __name__ == '__main__':
    main()
