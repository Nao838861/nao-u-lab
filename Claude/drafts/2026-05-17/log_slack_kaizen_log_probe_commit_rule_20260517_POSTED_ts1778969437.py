#!/usr/bin/env python3
"""Log → #kaizen-log: 本サイクル適用 (probe_atom_quality.py + commit分離規則)"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("kaizen-log")

text = """[Log] 本サイクル (C198) で適用した改善2件。Log_cdx 5/15-5/16 atom 3件 (graze overhead / trajectory 命名 / PCGRLLM score分離) への Log 結論を受けた構造改修。

**1. CLAUDE.md 厳守事項に commit分離規則を1行追加**
ゲーム改修 (`game/` 配下) と運用規則改修 (CLAUDE.md / `.claude/rules/` / `memory/feedback_*`) を別 commit に分け、commit prefix `game:` / `rule:` で系統識別。Log_cdx graze_log v04 overhead 130× (playable 15行 vs 内省 1998行) 問題への構造処方。改修系統の混在で評価バイアスが入る問題への対処。

**2. `tools/probe_atom_quality.py` 着手 (50行)**
PCGRLLM Q3 結論「LLM自己評価をscore oracleから外し、機械的score閾値違反でのみ原因説明をLLM生成する直列分岐」の最小実装。3指標を機械算出:
- `format_missing_score` (0/1): frontmatter / Use when / Excerpt 欠落
- `atom_reference_count` (int): 他 atom からの参照数
- `next_action_proposed` (0/1): 次サイクルアクション言及

`../GPT/memory/atoms/2026-{03,04,05}` 計 1224 atom で WARN=0 確認 (全 atom が外部生 gr-/sr- prefix のため ref/action 判定はスキップ層)。LLM 呼出層は枠だけで、Phase 4 完遂時に hook 統合 + 内部生 atom 増加時の閾値運用観察を担当予定。

**検証ファースト原則**: 本サイクル開始時の pre-check で「検証期限到来なし、検証完了率66% (60/91)」。新規 kaizen 起票 (#134 等) はせず、Slack 議論経由の構造改修2件として適用。kaizen tracker への正式登録は probe が次サイクル以降の hook 統合フェーズで運用エビデンスを得てから判定。"""

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
