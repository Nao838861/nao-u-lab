#!/usr/bin/env python3
"""
繰り返し発生語彙クローラ（#097）— 意味的統合漏れ検出

external_notes_*.md と slack_archive/*.jsonl から、
「頻繁に現れるが memory/*.md に反映されていない」語彙を検出する。

#096 (external_notes_integration_audit) が「統合マーカー付いてるか」
の構造的監査なのに対し、本スクリプトは「原文から重複発生パターンを
検出 → memory/ 未反映の検出」の意味的監査（#097 pre-mortem 対応:
ツールは候補提示までに留め、結晶化判断は人間側に残す）。

使い方:
  python tools/recurrence_crawler.py
    --threshold N   最小出現回数（既定 3）
    --top N         出力上位件数（既定 30）
    --include-slack slack_archive も対象（既定は外部ノートのみ）

正の exit code は未結晶化候補ありを示す（CI/Phase 1 連携用途）。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# 複合語パターン（日本語・英語）
# - 「漢字/カナ + の + 漢字/カナ」: 「人間のアンカー」型
# - カタカナ4文字以上（単独カタカナ語）: 「アーキテクチャ」
# - 漢字4文字以上連続: 「能力最大化」「記憶階層」
# - 英語 PascalCase or 2語以上: "Hermes Agent" "SystemM"
COMPOUND_JP = re.compile(r"[一-龥ァ-ヴー]+の[一-龥ァ-ヴー]+")
KANA_LONG = re.compile(r"[ァ-ヴー]{4,}")
KANJI_LONG = re.compile(r"[一-龥]{4,}")
ENGLISH_TERM = re.compile(
    r"\b(?:[A-Z][a-zA-Z0-9]+(?:\s[A-Z][a-zA-Z0-9]+){1,3}|[A-Z]{2,}[a-zA-Z0-9]*)\b"
)

# ノイズ除外（日本語の機能語複合・頻出一般語）
STOPWORDS = {
    # 日本語一般複合
    "その後", "それから", "この前", "この時", "その時", "それぞれ", "あらゆる",
    "ある程度", "その他", "その間", "その結果", "以下の通り",
    # 「の」複合のうち意味薄いもの
    "今日のこと", "昨日のこと", "明日のこと",
    # 英語一般語
    "The", "This", "That", "There", "These", "Those",
    "And", "But", "For", "With", "From",
}


def iter_external_notes() -> list[Path]:
    return sorted((ROOT / "memory").glob("external_notes_*.md"))


def iter_slack_jsonl() -> list[Path]:
    d = ROOT / "log" / "slack_archive"
    if not d.exists():
        return []
    return sorted(d.glob("*.jsonl"))


def load_memory_corpus() -> str:
    mem_dir = ROOT / "memory"
    chunks = []
    for p in mem_dir.glob("*.md"):
        try:
            chunks.append(p.read_text(encoding="utf-8", errors="ignore"))
        except OSError:
            continue
    # knowledge/ と projects/ も既結晶化扱い（memory 等価のレジストリ）
    for sub in ("knowledge", "projects"):
        d = ROOT / sub
        if d.exists():
            for p in d.rglob("*.md"):
                try:
                    chunks.append(p.read_text(encoding="utf-8", errors="ignore"))
                except OSError:
                    continue
    return "\n".join(chunks)


def extract_terms(text: str) -> list[str]:
    terms: list[str] = []
    for pat in (COMPOUND_JP, KANA_LONG, KANJI_LONG, ENGLISH_TERM):
        terms.extend(pat.findall(text))
    # 前後空白除去
    return [t.strip() for t in terms if t.strip()]


def scan_sources(include_slack: bool) -> Counter:
    counter: Counter = Counter()
    # 外部ノート（Log/Mir/Ash 全員分を対象にする。差分はカウンタに集約）
    for p in iter_external_notes():
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for term in extract_terms(text):
            counter[term] += 1
    if include_slack:
        for p in iter_slack_jsonl():
            try:
                with p.open("r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        try:
                            obj = json.loads(line)
                        except json.JSONDecodeError:
                            continue
                        text = obj.get("text") or ""
                        for term in extract_terms(text):
                            counter[term] += 1
            except OSError:
                continue
    return counter


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--threshold", type=int, default=3)
    ap.add_argument("--top", type=int, default=30)
    ap.add_argument("--include-slack", action="store_true")
    ap.add_argument("--check", default=None,
                    help="特定語彙の結晶化判定を単発実行（例: --check 人間のアンカー）")
    args = ap.parse_args()

    memory_corpus = load_memory_corpus()

    if args.check:
        appears_in_memory = args.check in memory_corpus
        counter = scan_sources(include_slack=True)
        count = counter.get(args.check, 0)
        print(f"term: {args.check}")
        print(f"  外部+Slack 出現回数: {count}")
        print(f"  memory/knowledge/projects 反映: {'YES' if appears_in_memory else 'NO'}")
        return 0 if appears_in_memory else 1

    counter = scan_sources(include_slack=args.include_slack)
    # 閾値以上かつ memory 未反映のみ抽出
    unresolved: list[tuple[str, int]] = []
    for term, count in counter.most_common():
        if count < args.threshold:
            break
        if term in STOPWORDS:
            continue
        if term in memory_corpus:
            continue
        unresolved.append((term, count))

    print("=== recurrence_crawler.py (#097) ===")
    print(f"外部ノート: {len(iter_external_notes())} files")
    print(f"閾値: {args.threshold} 回以上、対象: "
          f"{'外部ノート + Slack' if args.include_slack else '外部ノートのみ'}")
    print(f"未結晶化候補: {len(unresolved)} 語")
    print()
    if not unresolved:
        print("  （閾値以上で memory/ 未反映の語彙なし）")
        return 0

    print("--- 頻出かつ memory/ 未反映の語彙（結晶化候補） ---")
    for term, count in unresolved[: args.top]:
        print(f"  {count:>3}回  {term}")

    # 自己検証: 「人間のアンカー」が含まれていないこと（kaizen #097 検証手段 (3)）
    if any(t == "人間のアンカー" for t, _ in unresolved):
        print("\n[warn] 「人間のアンカー」が未結晶化判定されています。"
              "memory_redesign.md への統合を確認してください。", file=sys.stderr)
        return 2

    return 1  # 候補あり = 非ゼロ終了（結晶化タスクを促す）


if __name__ == "__main__":
    sys.exit(main())
