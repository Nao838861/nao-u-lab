#!/usr/bin/env python3
"""tools/cycle_self_check.py — focus 既達観測強制装置（雛形 / kaizen #122 系譜 / C150 Mir）

boot_intent から focus 行を抽出し、言及されているファイルパスを実 Read で検査して
size/lines/mtime をstaging に書く。手順依存の §5 既達チェックを観測強制で代替する第一段階。
雛形は3関数のみ（抽出・検査・出力）、実行統合（autonomous_cycle.sh への組込）は別サイクル。
"""
import re, sys, datetime
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PATH_RE = re.compile(r'`?([\w./_-]+\.(?:py|md|html|txt|json|js|sh))`?')

def extract_paths(text: str) -> list[str]:
    """boot_intent の「起動時の焦点」セクションからパスを抽出（重複除去・順序保持）"""
    sec = re.search(r'## 起動時の焦点.*?(?=\n## |\Z)', text, re.DOTALL)
    scope = sec.group(0) if sec else text
    seen, out = set(), []
    for m in PATH_RE.finditer(scope):
        p = m.group(1)
        if p not in seen and not p.startswith(('http', '.archive')):
            seen.add(p); out.append(p)
    return out

def inspect(rel: str) -> str:
    """rel パスの size/lines/mtime を1行で返す。不在なら NOT FOUND"""
    p = REPO / rel
    if not p.exists(): return f"- `{rel}` → NOT FOUND"
    st = p.stat()
    lines = sum(1 for _ in p.open(encoding='utf-8', errors='ignore')) if p.is_file() else 0
    mtime = datetime.datetime.fromtimestamp(st.st_mtime).strftime('%Y-%m-%d %H:%M')
    return f"- `{rel}` → {st.st_size}B / {lines}行 / {mtime}"

def main() -> int:
    src = Path(sys.argv[1] if len(sys.argv) > 1 else REPO / 'memory/mir_boot_intent.md')
    text = src.read_text(encoding='utf-8')
    paths = extract_paths(text)
    print(f"# cycle_self_check {datetime.datetime.now():%Y-%m-%d %H:%M} src={src.name}")
    print(f"# 検出パス {len(paths)} 件")
    for rel in paths: print(inspect(rel))
    return 0

if __name__ == '__main__': sys.exit(main())
