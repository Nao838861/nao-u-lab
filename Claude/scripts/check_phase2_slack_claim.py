#!/usr/bin/env python3
"""Phase 2 投稿主張 ts の Slack archive 実在性検証 — kaizen #131 family 拡張モード

cycle_staging .md の Phase 2 セクション内で `ts=\\d{10,13}` として引用される
Slack ts が log/slack_archive/*.jsonl に実在するかを検証する。Phase 2 自己診断幻覚
N=22/24/25/29 (memory/sense_prediction_log.md) の系列 4 例目到達を受け、
「投稿主張 ts 検証」を装置化する。

family 統合管理ルール準拠 (kaizen_tracker.md #131/#132/#133/#134 メタ監視):
本スクリプトは既存 scripts/check_repeated_pattern_indication.py (#131 段階2 hook)
の **拡張モード** として配置し、独立 kaizen (#135) は立てない。検出対象は
#131 (外形語彙) / #132 (自己診断語彙) / #133 (kaizen ID 実在性) / #134 (atom 品質3指標)
と排他別軸: ts 引用実在性。家族第5弾独立 entry にはせず、既存 family の検出軸追加
として集約管理する。

段階1 = 本スクリプト (単体実装 + --self-test + dry run)。
段階2 = multi_phase_cycle_log.py への hook 統合 (C232 以降 段階1 PASS 観察後に判定)。

Usage:
    python3 scripts/check_phase2_slack_claim.py [STAGING_FILE]
    python3 scripts/check_phase2_slack_claim.py --self-test
    Exit code: 0=clean, 1=WARN(Phase 2 内 ts が archive 不在)
"""
from __future__ import annotations

import argparse
import re
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_STAGING = REPO / "log" / "cycle_staging_log.md"
SLACK_ARCHIVE_DIR = REPO / "log" / "slack_archive"

# Phase 2 セクションのみ抽出 (## Phase 2... から次の ## Phase or ## 次フェーズ まで)
PHASE2_PAT = re.compile(
    r"^##\s+Phase\s*2\b.*?(?=^##\s+(?:Phase\s*[3-9]|次フェーズ)|\Z)",
    re.MULTILINE | re.DOTALL,
)
TS_PAT = re.compile(r"ts=(\d{10,13})")


def extract_phase2(text: str) -> str:
    m = PHASE2_PAT.search(text)
    return m.group(0) if m else ""


def extract_ts(text: str) -> list[str]:
    # 出現順を保ちつつ重複除去
    seen: set[str] = set()
    out: list[str] = []
    for ts in TS_PAT.findall(text):
        if ts not in seen:
            seen.add(ts)
            out.append(ts)
    return out


def ts_exists_in_archive(ts: str, archive_dir: Path) -> bool:
    if not archive_dir.exists():
        return False
    needle_dot = f'"ts": "{ts}.'
    needle_eq = f'"ts": "{ts}"'
    for jsonl in archive_dir.glob("*.jsonl"):
        try:
            data = jsonl.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if needle_dot in data or needle_eq in data:
            return True
    return False


def check_staging(staging_path: Path, archive_dir: Path) -> int:
    if not staging_path.exists():
        print(f"[#131-ext] staging not found: {staging_path}", file=sys.stderr)
        return 0
    text = staging_path.read_text(encoding="utf-8")
    phase2 = extract_phase2(text)
    if not phase2:
        print(f"[#131-ext] Phase 2 section not found in {staging_path}", file=sys.stderr)
        return 0
    ts_list = extract_ts(phase2)
    if not ts_list:
        return 0
    missing = [ts for ts in ts_list if not ts_exists_in_archive(ts, archive_dir)]
    for ts in missing:
        print(
            f"[#131-ext WARN] Phase 2 が ts={ts} を引用していますが "
            f"log/slack_archive/*.jsonl に実在しません (投稿主張 ts 検証)",
            file=sys.stderr,
        )
    return 1 if missing else 0


def self_test() -> int:
    """3 パターン合成データで OK/WARN/noise を検証

    - OK: Phase 2 内 ts が archive に実在 → exit 0
    - WARN: Phase 2 内 ts が archive 不在 (ts=1779579275 模擬) → exit 1
    - noise: Phase 1 観察記述の ts 引用は警告対象外 → exit 0
    """
    with tempfile.TemporaryDirectory() as tmp:
        tmpdir = Path(tmp)
        archive = tmpdir / "archive"
        archive.mkdir()
        (archive / "ok.jsonl").write_text(
            '{"ts": "1779000000.000001", "channel": "shared-reads", "text": "real post"}\n',
            encoding="utf-8",
        )

        ok_staging = tmpdir / "ok.md"
        ok_staging.write_text(
            "## Phase 2: 分析\n\n#shared-reads 投稿完了 (ts=1779000000)。\n\n"
            "## Phase 3: アクション\nthen\n",
            encoding="utf-8",
        )
        warn_staging = tmpdir / "warn.md"
        warn_staging.write_text(
            "## Phase 2: 分析\n\n#shared-reads ULSPB 投稿完了 (ts=1779579275)。\n\n"
            "## Phase 3: アクション\n",
            encoding="utf-8",
        )
        noise_staging = tmpdir / "noise.md"
        noise_staging.write_text(
            "## Phase 1: 情報収集\n\n"
            "投稿観測 (ts=1779579275, ts=1779999999) Phase 1 観察記述。\n\n"
            "## Phase 2: 分析\n\n本サイクルは投稿スキップ。\n\n"
            "## Phase 3: アクション\n",
            encoding="utf-8",
        )

        ok_rc = check_staging(ok_staging, archive)
        warn_rc = check_staging(warn_staging, archive)
        noise_rc = check_staging(noise_staging, archive)

        results = [
            ("OK", ok_rc == 0, ok_rc),
            ("WARN", warn_rc == 1, warn_rc),
            ("noise", noise_rc == 0, noise_rc),
        ]
        all_pass = all(p for _, p, _ in results)
        for name, ok, rc in results:
            mark = "PASS" if ok else "FAIL"
            print(f"[self-test {mark}] {name} (exit={rc})")
        print(f"[self-test {'PASS' if all_pass else 'FAIL'}] overall")
        return 0 if all_pass else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("staging", nargs="?", default=str(DEFAULT_STAGING),
                    help="staging .md path (default: log/cycle_staging_log.md)")
    ap.add_argument("--self-test", action="store_true",
                    help="OK/WARN/noise 3 パターンで自己検証")
    args = ap.parse_args()

    if args.self_test:
        return self_test()
    return check_staging(Path(args.staging), SLACK_ARCHIVE_DIR)


if __name__ == "__main__":
    sys.exit(main())
