#!/usr/bin/env python3
"""Log -> #human-steering: Nao_u 01:57 「Mirへの2タスク確認に返信がない」への状況報告。

ルール適用:
- Nao_u からのコメントは同じチャンネル (#human-steering) で返す
- 同調禁止、目的照合・事実先行 (feedback_no_sympathy_goal_first.md)
- 担当: mir_textadv は Mir の領域。Log は Mir の代弁をしない。事実だけ報告し、Mir 自身の返信を促す
- 構造的失敗の自覚: feedback_channel_reply_required.md（依頼元チャンネル返信は必須）
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message  # noqa: E402


text = """[Log] Nao_u 01:57 指摘受領。Mir 担当タスクなので Log は事実状況のみ報告し、Mir 本人の返信は inbox 経由で要請する。代弁はしない。

■ 事実確認（Slack archive 参照）
両タスクとも実行は #game-rights で済んでいる。ただし指摘の通り #human-steering への完了報告が抜けた。

1. **mir_textadv v04 ブラウザプレイ可能化** — `[Mir] mir_textadv v04「思考漏れ — Thought Leak：共犯」をブラウザプレイ可能にした` (#game-rights ts=1777082607.113899, game/mir_textadv/v04/index.html を確認)
2. **frenchbread Dolce andante プレイ分析** — `[Mir] frenchbread「Dolce andante」プレイ分析 — 何が面白くて何が足りないか` (#game-rights ts=1777082611.668289)

その後の流れ: Nao_u からの v04 プレイフィードバック → Mir が v05「供述」へ移行 → ENDING H/G 不発の指摘 → M-18 刻印 まで進んでいる（#game-rights 連鎖は継続）。

■ 構造的失敗の自覚
作業をしたチャンネル (#game-rights) と質問が来たチャンネル (#human-steering) が違う時、後者への完了報告を欠かす癖が再発した。これは Log/Mir 共通の `memory/feedback_channel_reply_required.md`（依頼元チャンネル返信必須）の典型違反。Nao_u の今回の指摘は「作業した ≠ 報告した」を 2026-04-20 に続いて 2 回目に踏んだ証拠。

■ 対応
- `inbox_mac.md` に Mir 宛の高優先 forward を追加。Mir 自身が #human-steering で第一人称返信するべき内容（v04/v05 の現状と Q-A/B/C 採点後の次手）を促した
- Log 側の構造強制候補: 起票時に「#human-steering 由来タスク」を明示マークし、完了時に同チャンネル報告を必須化する hook（kaizen 起票は Mir 起動後に協議）

— Log (2026-04-26 02:00 #human-steering)"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("human-steering", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


if __name__ == "__main__":
    _post(text, "Mir 2-task status report to #human-steering")
