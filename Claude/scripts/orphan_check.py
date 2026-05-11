#!/usr/bin/env python3
"""memory/ 孤児ノード検出 試作 v0 — memory_tree_consolidation.md §E

参照グラフ (MEMORY.md + サブインデックス + 再帰展開) と memory/**/*.md 全集合の
diff を取り、temporal awareness (git log 履歴) を併用して3クラス分類で出力する。

3クラス分類:
- true_orphan    : 参照グラフから到達不可 + 直近30日以内に編集なし
- stale_linked   : 参照グラフ内だが直近30日編集なし (evolution 段階の死活判定対象)
- unregistered_new: 直近7日以内に新規作成 + 参照グラフ未登録 (接続待ち優先度高)

arXiv 2602.05665 (Graph-based Agent Memory: Taxonomy, Techniques, and Applications)
が指摘する memory ライフサイクル 4 段階 (extraction/storage/retrieval/evolution)
のうち、evolution が Pot 現状で最弱点 (beliefs.md 停滞 25/35 = 71% など)。
「孤児 ≠ 死んだノード」の区別を本スクリプトで装置化する。

Usage:
    python scripts/orphan_check.py --dry-run
    python scripts/orphan_check.py --write tools/orphan_check_dry_run_<ts>.txt
    python scripts/orphan_check.py --dry-run --verbose
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from datetime import date, datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MEMORY_DIR = REPO_ROOT / "memory"
PROJECTS_DIR = REPO_ROOT / "projects"
DOCS_DIR = REPO_ROOT / "docs"
SKILLS_DIR = REPO_ROOT / "skills"
CLAUDE_DIR = REPO_ROOT / ".claude"


def _build_index_files() -> list[Path]:
    """参照グラフ起点を構築。

    v0.1: MEMORY.md + サブインデックス + concept_graph + beliefs + projects/INDEX
    v0.2: 上記に加え CLAUDE.md / .claude/system_identity.md / docs/*.md /
          skills/**/SKILL.md を追加。memory/ 配下のファイルは CLAUDE.md や docs/
          経由でも reachable になり得るため、それら instruction レイヤを起点に含める
          ことで「真孤児」の意味を「ファイル名上 reachable でない」から
          「どの instruction/index からも reachable でない」へ近づける。
    """
    roots: list[Path] = [
        MEMORY_DIR / "MEMORY.md",
        MEMORY_DIR / "feedback_index.md",
        MEMORY_DIR / "operational_index.md",
        MEMORY_DIR / "game_dev_index.md",
        MEMORY_DIR / "references_external_index.md",
        MEMORY_DIR / "tweets_index.md",
        MEMORY_DIR / "concept_graph.md",
        MEMORY_DIR / "beliefs.md",
        PROJECTS_DIR / "INDEX.md",
        # v0.2 追加: instruction / system 層
        REPO_ROOT / "CLAUDE.md",
        CLAUDE_DIR / "system_identity.md",
    ]
    # v0.2 追加: docs/*.md (game_dev_foundation など memory/ を多く参照する一群)
    if DOCS_DIR.is_dir():
        roots.extend(sorted(DOCS_DIR.glob("*.md")))
    # v0.2 追加: skills/**/SKILL.md (genre-deep-analysis / lessons-recall など)
    if SKILLS_DIR.is_dir():
        roots.extend(sorted(SKILLS_DIR.glob("**/SKILL.md")))
    return roots


INDEX_FILES = _build_index_files()

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+\.md)(?:#[^)]*)?\)")

# v0.1 追加: feedback_index.md などプロセ参照に多い矢印記法
#   `→ path.md` / `詳細→ path.md` / `→ a.md, b.md` 等
# `→` から行末までを 1 チャンク化し、その中の `*.md` トークンを全部拾う。
# `\.md` 単独や日本語混入を避けるため、md パスは [\w./\-]+ のみ許容。
ARROW_LINE_RE = re.compile(r"→[^\n]*")
ARROW_TARGET_RE = re.compile(r"([\w./\-]+\.md)")

AGE_THRESHOLD_STALE = 30
AGE_THRESHOLD_NEW = 7

EXCLUDE_PART = "memory_backup"


def normalize_link(link: str, base_file: Path) -> Path | None:
    """Markdown link を repo 配下の絶対 Path に正規化。外部 URL や repo 外なら None。

    memory/ 制限はしない (projects/ や log/ も traverse 対象にする)。
    memory/ かどうかは呼び出し側で判定する。
    """
    link = link.split("#", 1)[0].split("?", 1)[0].strip()
    if not link or link.startswith(("http://", "https://", "mailto:")):
        return None
    try:
        resolved = (base_file.parent / link).resolve()
    except OSError:
        return None
    try:
        resolved.relative_to(REPO_ROOT)
    except ValueError:
        return None
    return resolved


def is_memory_path(p: Path) -> bool:
    try:
        rel = p.relative_to(REPO_ROOT)
    except ValueError:
        return False
    return str(rel).replace("\\", "/").startswith("memory/")


def build_reference_set(verbose: bool = False) -> set[Path]:
    """起点ファイルから BFS で到達可能な memory/ パス集合を構築。

    projects/ や log/ 経由の中継も traverse 対象にする (memory/ への 2-hop 以上を
    捕捉するため)。最終 set には memory/ 配下のみを含める。
    """
    visited: set[Path] = set()
    queue: list[Path] = []
    for idx in INDEX_FILES:
        if idx.exists():
            queue.append(idx.resolve())
        elif verbose:
            print(f"WARN: index missing: {idx}", file=sys.stderr)
    while queue:
        cur = queue.pop()
        if cur in visited:
            continue
        visited.add(cur)
        if not cur.exists():
            continue
        try:
            text = cur.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for _name, link in LINK_RE.findall(text):
            target = normalize_link(link, cur)
            if target is not None and target not in visited:
                queue.append(target)
        # v0.1: 矢印記法 `→ path.md` も参照として扱う
        for arrow_line in ARROW_LINE_RE.findall(text):
            for arrow_target in ARROW_TARGET_RE.findall(arrow_line):
                target = normalize_link(arrow_target, cur)
                if target is not None and target not in visited:
                    queue.append(target)
    return {p for p in visited if is_memory_path(p)}


def collect_memory_files() -> list[Path]:
    """memory/**/*.md を列挙 (memory_backup は除外)。"""
    files = []
    for p in MEMORY_DIR.rglob("*.md"):
        if EXCLUDE_PART in p.parts:
            continue
        files.append(p.resolve())
    return sorted(files)


def get_git_toplevel() -> Path | None:
    """git リポジトリのトップレベル絶対パスを取得。

    本リポジトリは D:\\AI\\Nao_u_BOT\\ が git root で、Claude/ はその配下。
    git log の出力は repo-top 相対パスなので、突合せに toplevel が要る。
    """
    try:
        proc = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            check=False,
            encoding="utf-8",
            errors="replace",
        )
        if proc.returncode != 0:
            return None
        return Path(proc.stdout.strip()).resolve()
    except FileNotFoundError:
        return None


# v0.3: 親階層化 relocate コミット (2026-05-08) で path が memory/ → Claude/memory/
# に一括 rename された結果、relocate 後に未編集のファイルは Pass 1 では捕捉できない。
# Pass 2 で pre-relocate コミット (paths=memory/) を逆方向に走査し、Pass 3 で
# それでも取れないファイルに relocate 日をフォールバック付与する。
RELOCATE_DATE = date(2026, 5, 8)
RELOCATE_CUTOFF = "2026-05-08 00:00:00"


def _parse_git_log_dates(
    stdout: str,
    path_to_abs,
    result: dict[Path, date],
) -> None:
    """`COMMIT %ci` / `<path>` 形式の git log 出力をパースし result に最終編集日を入れる。

    path_to_abs(line) は git log の path 行を absolute Path に変換する関数。
    既に result にあるエントリは上書きしない (newest-first 前提)。
    """
    current_date: date | None = None
    for line in stdout.splitlines():
        if line.startswith("COMMIT "):
            ts = line[len("COMMIT "):].strip()[:10]
            try:
                current_date = date.fromisoformat(ts)
            except ValueError:
                current_date = None
        elif line and current_date is not None:
            path = path_to_abs(line)
            if path is not None and path not in result:
                result[path] = current_date


def get_last_edit_dates(
    files: list[Path],
) -> tuple[dict[Path, date], set[Path]]:
    """memory/ 配下の全ファイルの最終 commit 日を取得。fallback 適用先も返す。

    Pass 1: post-relocate コミット (Claude/memory/) を走査。
    Pass 2: pre-relocate コミット (memory/, git_top cwd) を走査。
            paths を Claude/memory/foo.md に正規化して merge。
    Pass 3: それでも未取得のファイルに relocate 日 (2026-05-08) をフォールバック。
            戻り値の set にフォールバック適用ファイルを記録 (分類時に
            FALLBACK_RELOCATE 識別子として利用可能)。
    """
    result: dict[Path, date] = {}
    fallback: set[Path] = set()
    git_top = get_git_toplevel()
    if git_top is None:
        print("ERROR: git not found or not a repo", file=sys.stderr)
        return result, fallback

    # Pass 1: post-relocate (REPO_ROOT cwd, paths = Claude/memory/...)
    # 意味的でない一括 commit `^log: relocate` のみ除外。`backup:` は
    # memory_backup/ commit で memory/ を触らないため path filter で自然に外れる。
    # `Auto sync` は cross-machine 同期で実変更を含むため除外しない。
    try:
        proc1 = subprocess.run(
            ["git", "log",
             "--extended-regexp",
             "--invert-grep",
             "--grep=^log: relocate",
             "--pretty=format:COMMIT %ci", "--name-only", "--",
             "memory/"],
            cwd=str(REPO_ROOT),
            capture_output=True, text=True, check=False,
            encoding="utf-8", errors="replace",
        )
    except FileNotFoundError:
        print("ERROR: git not found in PATH", file=sys.stderr)
        return result, fallback
    _parse_git_log_dates(
        proc1.stdout,
        lambda line: (git_top / line).resolve(),
        result,
    )

    # Pass 2: pre-relocate (git_top cwd, paths = memory/...)
    # `--before` で relocate より前の commits に限定し、paths を
    # Claude/memory/foo.md に正規化して Pass 1 dict に merge する。
    proc2 = subprocess.run(
        ["git", "log",
         f"--before={RELOCATE_CUTOFF}",
         "--pretty=format:COMMIT %ci", "--name-only", "--",
         "memory/"],
        cwd=str(git_top),
        capture_output=True, text=True, check=False,
        encoding="utf-8", errors="replace",
    )
    _parse_git_log_dates(
        proc2.stdout,
        lambda line: (git_top / "Claude" / line).resolve(),
        result,
    )

    # Pass 3: それでも未取得のファイルに relocate 日をフォールバック。
    # 旧パス・新パスのどちらにも commit 履歴がない = relocate の rename イベント
    # でしか動いていない真の静止ファイル。relocate 日を最後の砦として使う。
    for f in files:
        if f not in result:
            result[f] = RELOCATE_DATE
            fallback.add(f)

    return result, fallback


def classify(
    refs: set[Path],
    files: list[Path],
    dates: dict[Path, date],
    fallback: set[Path],
    today: date,
) -> dict[str, list[tuple[Path, str, int, int]]]:
    classes: dict[str, list[tuple[Path, str, int, int]]] = {
        "true_orphan": [],
        "stale_linked": [],
        "unregistered_new": [],
        "other": [],
    }
    for f in files:
        ref_count = 1 if f in refs else 0
        last = dates.get(f)
        if last is None:
            age = 9999
            last_str = "unknown"
        else:
            age = (today - last).days
            # v0.3: relocate フォールバック適用ファイルは識別子付きで明示
            last_str = last.isoformat()
            if f in fallback:
                last_str += "*"  # relocate-fallback marker
        entry = (f, last_str, age, ref_count)
        if ref_count == 0 and age > AGE_THRESHOLD_STALE:
            classes["true_orphan"].append(entry)
        elif ref_count > 0 and age > AGE_THRESHOLD_STALE:
            classes["stale_linked"].append(entry)
        elif ref_count == 0 and age < AGE_THRESHOLD_NEW:
            classes["unregistered_new"].append(entry)
        else:
            classes["other"].append(entry)
    for k in classes:
        classes[k].sort(key=lambda e: (-e[2], str(e[0])))
    return classes


def format_entry(cls: str, entry: tuple[Path, str, int, int]) -> str:
    f, last, age, refs = entry
    try:
        rel = f.relative_to(REPO_ROOT)
    except ValueError:
        rel = f
    rel_s = str(rel).replace("\\", "/")
    return f"[{cls}] {rel_s} (last_edit={last}, age={age}日, refs={refs})"


def main() -> int:
    parser = argparse.ArgumentParser(description="memory/ orphan check (v0)")
    parser.add_argument("--dry-run", action="store_true",
                        help="標準出力に表示 (--write 未指定時はデフォルトで有効)")
    parser.add_argument("--write", type=str, default=None,
                        help="結果を指定パスに書き出す")
    parser.add_argument("--verbose", action="store_true",
                        help="other クラスも出力 + 欠損インデックス警告")
    args = parser.parse_args()

    today = date.today()
    refs = build_reference_set(verbose=args.verbose)
    files = collect_memory_files()
    dates, fallback = get_last_edit_dates(files)
    classes = classify(refs, files, dates, fallback, today)

    lines: list[str] = []
    lines.append(f"# orphan_check.py result (run={today.isoformat()})")
    lines.append(
        f"# scope: memory/**/*.md = {len(files)} files, "
        f"reachable from {len(INDEX_FILES)} index roots = {len(refs)} files"
    )
    lines.append(
        f"# v0.3: relocate-fallback ({RELOCATE_DATE.isoformat()}*) "
        f"applied to {len(fallback)} files"
    )
    lines.append("")

    for cls_name, cls_label in [
        ("true_orphan", f"真孤児 (refs=0 + age>{AGE_THRESHOLD_STALE}日)"),
        ("stale_linked", f"静止親接続 (refs>0 + age>{AGE_THRESHOLD_STALE}日)"),
        ("unregistered_new", f"新規未登録 (refs=0 + age<{AGE_THRESHOLD_NEW}日)"),
    ]:
        entries = classes[cls_name]
        lines.append(f"## {cls_label}: {len(entries)} 件")
        for e in entries:
            lines.append(format_entry(cls_name, e))
        lines.append("")

    if args.verbose:
        lines.append(f"## other (active or middle-age): {len(classes['other'])} 件")
        for e in classes["other"]:
            lines.append(format_entry("other", e))
        lines.append("")

    output = "\n".join(lines)

    if args.write:
        out_path = Path(args.write)
        if not out_path.is_absolute():
            out_path = REPO_ROOT / out_path
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(output, encoding="utf-8")
        print(f"written: {out_path}")

    if args.dry_run or not args.write:
        print(output)

    return 0


if __name__ == "__main__":
    sys.exit(main())
