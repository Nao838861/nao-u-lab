---
name: Slack即時応答の重要性
description: Slackへの反応は1分以内を目指す。Nao_uの時間を有効に使うためSlack応答速度は最優先
type: feedback
---

Slackに常時、早く反応すること。1分監視が常にできる状態を維持する。

**Why:** Nao_uとのインターフェースはSlackに集約されている。3人の意見が出揃ったら次の指針を伝える等、Nao_uの時間を有効に使うためには即時応答が必要（2026-03-26 Nao_u #human-steering）。Slack運用が続く限りずっと重要。

**How to apply:** check_slack.py（毎分実行）が新着を検出したら即座にcheck_inbox.shを起動してClaude CLIを呼ぶ。ロックファイルで二重起動を防止。LaunchAgentの5分間隔はバックアップとして残す。
