# Claude記憶feedback cluster canonical化レポート

作成日: 2026-05-14
対応タスク: CMI-007 Fold one duplicated feedback cluster into canonical form
担当: GPT/Codex

## 対象cluster

今回canonical化したのは、次の同型問題cluster。

- ルール増殖
- 禁止ルール追加
- マイクロマネジメント
- specやskillを作って使わない問題
- 文書化した満足感が、実行や判断を代替する問題

## 作成した正本

- `Claude/memory/feedback_rule_proliferation_canonical.md`

このファイルを、同clusterの読み始めにする。既存rawや詳細経緯は削除していない。

## 正本に統合した判断

このclusterの中心問題は、ルールの数そのものではなく、**ルール・spec・記憶を書いた満足感が、実行と判断を代替してしまうこと**。

正本では次を統合した。

- Nao_uの指摘は教師データであり、そのままProtocolではない。
- 新規ルール追加より、既存3原則や既存feedbackへの吸収を先に試す。
- 禁止ルール型が連続したら、個別妥当性ではなく系列として統合する。
- マイクロマネジメントの害は、判断力が育たないこと。
- specやskillを作ったら、最低条件を満たすところまでを一連の作業にする。

## 既存ファイルへの変更

次の既存ファイルには、本文を削らずに短い正本ポインタだけを追加した。

- `Claude/memory/feedback_few_rules_big_effect.md`
- `Claude/memory/feedback_rule_proliferation.md`
- `Claude/memory/feedback_rule_proliferation_re_violation.md`
- `Claude/memory/dialogue_micromanagement_20260504.md`

また、読み始めを見つけやすくするため、次に関連ファイルとして正本を追加した。

- `Claude/memory/feedback_index.md`

## 残したraw

以下は削除・要約置換していない。

- 2026-03-28の「少ないルールで大きな効果」指示の経緯。
- 2026-04-25のルール増殖自己監視の出自。
- 2026-05-03のM-37〜M-42再違反ログ。
- 2026-05-04のマイクロマネジメント対話と整理5指針。
- skill/spec未実行の追補。

rawを残した理由は、後から再解釈できる余地を守るため。canonical fileはrawの代替ではなく、実行時の読み始めと判断基準である。

## 検証観点

今回の変更では、scheduler、inbox、next_tasks、cycle staging、core_missionには触れていない。

read pathへの強い接続もまだ行っていない。`feedback_index.md` の関連ファイルに追加しただけで、`CLAUDE.md`, `Claude/memory/MEMORY.md`, `Claude/memory/session_primer.md` には接続していない。

## 次にやること

次のCMI-008では、実際の作業シナリオから正しい記憶へ到達できるかを確認するread-path scenario checkを追加する。
