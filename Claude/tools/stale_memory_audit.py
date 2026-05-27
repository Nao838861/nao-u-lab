#!/usr/bin/env python3
"""
stale_memory_audit.py — memory/*.md の stale 度を3軸で機械検出 (dry-run sketch)

Log_cdx 16:38 ts=1779867519 検証キュー(a) の deterministic 実装。
kaizen #131-#134 family 第5弾基盤 (memory_redesign 2026-05-27 C250 Phase 3 確定設計)。

判定3軸:
  (a-1) git 最終更新が --max-age-days (default 90) 経過 → WARN
  (a-2) frontmatter `expires_at:` が今日を超過 → ERR
  (a-3) 本文中の絶対日付参照 (YYYY-MM-DD) の最新が --body-date-days (default 30) 経過 → WARN

dry-run sketch のため副作用ゼロ。memory/stale_audit_queue.jsonl は **未生成** (将来段階で実書き出し)。

exit code:
  0 = WARN/ERR なし
  1 = WARN あり (ERR なし)
  2 = ERR あり (or root not found / git unavailable)
"""
import argparse, re, sys, subprocess
from datetime import date, datetime
from pathlib import Path

FRONTMATTER_EXPIRES_RE = re.compile(r"^expires_at:\s*(\d{4}-\d{2}-\d{2})", re.MULTILINE)
BODY_DATE_RE = re.compile(r"(20\d{2}-\d{2}-\d{2})")


def git_last_commit_date(path: Path) -> date | None:
    try:
        r = subprocess.run(
            ["git", "log", "-1", "--format=%ai", "--", str(path)],
            capture_output=True, text=True, encoding="utf-8", errors="replace",
            timeout=10,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None
    out = (r.stdout or "").strip()
    if not out:
        return None
    # "2026-05-27 19:27:00 +0900" 形式の先頭10文字
    try:
        return datetime.strptime(out[:10], "%Y-%m-%d").date()
    except ValueError:
        return None


def parse_frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        return ""
    end = text.find("\n---\n", 4)
    if end == -1:
        return ""
    return text[4:end]


def audit_file(path: Path, today: date, max_age_days: int, body_date_days: int) -> dict:
    text = path.read_text(encoding="utf-8", errors="replace")
    fm = parse_frontmatter(text)

    # (a-1) git age
    git_age_warn = False
    last = git_last_commit_date(path)
    if last is not None:
        age = (today - last).days
        if age >= max_age_days:
            git_age_warn = True
    git_age = (today - last).days if last else None

    # (a-2) expires_at ERR
    expires_err = False
    expires_val = None
    m = FRONTMATTER_EXPIRES_RE.search(fm)
    if m:
        try:
            expires_val = datetime.strptime(m.group(1), "%Y-%m-%d").date()
            if expires_val < today:
                expires_err = True
        except ValueError:
            pass

    # (a-3) body absolute date latest
    body_date_warn = False
    body_latest = None
    for m in BODY_DATE_RE.finditer(text):
        try:
            d = datetime.strptime(m.group(1), "%Y-%m-%d").date()
        except ValueError:
            continue
        if d > today:  # 未来日付は除外 (expires_at 等の予定日が本文にも入る場合)
            continue
        if body_latest is None or d > body_latest:
            body_latest = d
    if body_latest is not None:
        if (today - body_latest).days >= body_date_days:
            body_date_warn = True

    return {
        "path": str(path),
        "git_age": git_age,
        "git_age_warn": git_age_warn,
        "expires_at": expires_val.isoformat() if expires_val else None,
        "expires_err": expires_err,
        "body_latest": body_latest.isoformat() if body_latest else None,
        "body_date_warn": body_date_warn,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default="memory", help="走査対象ディレクトリ (default: memory)")
    ap.add_argument("--max-age-days", type=int, default=90,
                    help="git 最終更新からの WARN 閾値日数 (default: 90)")
    ap.add_argument("--body-date-days", type=int, default=30,
                    help="本文絶対日付からの WARN 閾値日数 (default: 30)")
    ap.add_argument("--recursive", action="store_true",
                    help="サブディレクトリも走査 (default: 直下のみ)")
    ap.add_argument("--sample", nargs="*", default=None,
                    help="サンプル走査: 指定したパスのみ判定 (人手照合用)")
    ap.add_argument("--dry-run", action="store_true", default=True,
                    help="dry-run (現状はこれ以外不可、副作用ゼロ)")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    today = date.today()

    if args.sample:
        paths = [Path(p) for p in args.sample if Path(p).is_file()]
    else:
        root = Path(args.root)
        if not root.is_dir():
            print(f"[stale_memory_audit] root not found: {root}", file=sys.stderr)
            return 2
        paths = sorted(root.rglob("*.md") if args.recursive else root.glob("*.md"))

    stale_warn, expires_err, body_date_warn = [], [], []
    for p in paths:
        r = audit_file(p, today, args.max_age_days, args.body_date_days)
        if r["git_age_warn"]:
            stale_warn.append(r)
        if r["expires_err"]:
            expires_err.append(r)
        if r["body_date_warn"]:
            body_date_warn.append(r)

    total = len(paths)
    print(
        f"[stale_memory_audit] target={args.root} files={total} "
        f"stale_warn={len(stale_warn)} expires_err={len(expires_err)} "
        f"body_date_warn={len(body_date_warn)}",
        file=sys.stderr,
    )

    if args.verbose:
        for r in stale_warn[:5]:
            print(f"[STALE WARN] {r['path']} (git_age={r['git_age']}d)", file=sys.stderr)
        for r in expires_err[:5]:
            print(f"[EXPIRES ERR] {r['path']} (expires_at={r['expires_at']})", file=sys.stderr)
        for r in body_date_warn[:5]:
            print(f"[BODY DATE WARN] {r['path']} (latest={r['body_latest']})", file=sys.stderr)

    if expires_err:
        return 2
    if stale_warn or body_date_warn:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
