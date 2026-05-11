"""Ad-hoc: respond to Nao_u "Shared-reads投稿に関する詳細ってある？" with full rules."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import post_message

CHANNEL_HUMAN_STEERING = "C0ANECNV5DK"

TEXT = """[Log] Shared-reads 投稿ルールまとめ（先ほどの slack_rules_digest は ch 一覧と絶対ルール中心で、shared-reads 固有の運用は省略していた）。

■ 位置づけ（docs/slack_rules.md + docs/operations.md + docs/scheduler_architecture.md）
- 「**記録に値する外部投稿の解釈・共有**」専用 ch
- 4フェーズサイクルの **Phase 2 (Analyze)** で書く（Phase 1 Gather → Phase 2 で分析投稿 → Phase 3 Act）
- 「記事紹介ではなく分析・接続・問い」（scheduler_architecture.md L338）— 単なるリンク貼りは禁止

■ 2段階の昇格フロー（2026-04-14 Nao_u 指示）
1. まず **#shared-reads** に書く
2. All で共有すべき話題があれば **#all-nao-u-lab** に「個別」に投稿（議論が深められる形で）— 単なるリンク内容紹介の転載禁止

■ 絶対ルール
- **外部URLは必ず本文に含める**（2026-04-12 / 2026-04-22 Nao_u 繰り返し指摘）— 省略すると読み手が何の話か分からない
- **1件ずつ別メッセージ**で投稿。まとめ返信は薄い（2026-03-23 Nao_u 指摘）
- スレッド返信禁止。フラットに投稿
- 投稿前に external_notes_<instance>.md に原文・要旨を記録してから書く（kaizen #116 「初回供給の確実保存」防御）

■ 6項目テンプレート（kaizen #119、検証期限 2026-05-10 で運用組込済）
1. **核主張** 1〜2行（記事が何を言っているか）
2. **自作への当てこみで矛盾・一致を分離**（一致だけ拾うと同調罠 = feedback_no_sympathy_goal_first.md）
3. **暗黙 target imagination** 1文（記事ジャンル別: ゲーム→player / 研究→reader-researcher / ツール→user / ルポ→対象人物像）— M-27「target 暗黙化警告」
4. **同調罠回避ノート明示節**（「直接適用しない」宣言。⑤一致点が強い時こそ必須）
5. **一致点を保留せず明示**
6. **次の一手**（採否ではなく「判定保留」or「再採点運用」）

→ target が自作と不一致なら **「反証寄り」フラグ** を本文に明示する（一致前提で借りる事故を構造的に封じる）

■ 巡回ローテーション（外部摂取の入口）
- Twitter おすすめタブ 6h 巡回: Mir=0/6/12/18時 / Log=2/8/14/20時 / Ash=4/10/16/22時
- 巡回 → external_notes_<instance>.md に原文記録 → Phase 2 で #shared-reads に分析投稿
- external_notes ラグ3日以上で Pre-check 警告（kaizen #116）

■ 通知粒度との関係
- shared-reads 投稿そのものは通知対象外（運用の日常）
- 投稿の中で「重要な設計変更／プロジェクト新設につながる気づき」を見つけたら #all-nao-u-lab に昇格

■ 直近 Log の運用例
今日の #shared-reads 3本（engraph / Karpathy LLM wiki / graph-agent-memory arxiv）はこの6項目で書いた。engraph 投稿が典型: 5レーン読み取り → 我々の現状カバー2/5 → orphan_check.py 試作の前提変更（採否でなく前提更新）という6項目構造で着地。

正本: docs/slack_rules.md（履歴付き）/ 圧縮版: .claude/rules/slack.md（ファイル操作時自動注入）/ 詳細運用: memory/kaizen_tracker.md #119。"""


if __name__ == "__main__":
    result = post_message(CHANNEL_HUMAN_STEERING, TEXT)
    print(result)
