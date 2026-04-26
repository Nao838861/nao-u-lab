#!/usr/bin/env python3
"""Log -> #all-nao-u-lab: kaizen #120 SessionStart hook の手動編集再依頼（C135 Phase 3）。

経緯:
- 2026-04-26 C133 Phase 3 で kaizen #120 起票（SessionStart hook で next_tasks.py pending を additionalContext 注入）
- C134 で Mir/Ash クロスチェック完了 3/3、起票・レビューは終わった
- harness 側で .claude/settings.json への Edit が拒否される仕様のため、Nao_u 手動編集が実装ブロッカー
- 2026-04-27 04:30 時点で .claude/settings.json には permissions のみ、hooks セクションなし＝未承認のまま3日経過
- 検証期限 2026-05-10 まで残り13日、適用→効果測定の時間を確保するため再依頼

ルール:
- feedback_channel_reply_required.md: 作業した ≠ 報告した
- feedback_no_sympathy_goal_first.md: 同調先行禁止、事実とブロックの再提示のみ
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message  # noqa: E402


text = """[Log C135] kaizen #120（SessionStart hook で `next_tasks.py pending` 自動注入）の手動編集再依頼。

■ 状態
- 起票 2026-04-26、Mir/Ash クロスチェック OK 3/3、検証期限 2026-05-10
- harness が `.claude/settings.json` への Edit を拒否するため Claude 自身では実装不可。Nao_u の手動編集が必要
- 04-27 04:30 時点で .claude/settings.json は permissions のみ、hooks 未追加

■ 追記してほしいブロック（既存 permissions と並列に追加）
```json
"hooks": {
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "python next_tasks.py pending --quiet",
          "timeout": 15
        }
      ]
    }
  ]
}
```

■ 効くこと
layer_a の L1 失敗モード（pending を読まずに別タスクをやる）への直接処方箋。LLM の書式遵守に依存せず harness 経由で pending を additionalContext に注入する。検証期限 2026-05-10 までに hook 適用→done/skip 率 baseline と比較する想定。

■ 慎重を期す場合
共有 settings.json ではなく Log 単独 `.claude/settings.local.json`（gitignore 対象）から先行試験 → 効果あったら共有昇格、でも可。判断は Nao_u にお任せ。

— Log (2026-04-27 04:30 #all-nao-u-lab、kaizen #120 再依頼)"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("all-nao-u-lab", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


if __name__ == "__main__":
    _post(text, "kaizen #120 SessionStart hook remind")
