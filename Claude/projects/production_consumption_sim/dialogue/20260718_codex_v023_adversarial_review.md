# 2026-07-18 flow_island v0.23 独立敵対的レビュー指示

## Nao_u 指示原文

> flow_islandの続き。AGENTS.mdから読み、前回のCodexターン3以降を引き継いで。

> 新規実装についての問題をclaudeに精査してもらってる。あなたも問題がないか徹底的に精査して。

## Codexの解釈と実施範囲

- Claudeの並行レビューとは独立に、v0.23実装・監査・UI・文書を敵対的に確認する
- 実装修正は行わず、静的解析、標準テスト、24 seed比較、局所probe、実画面確認まで行う
- 発見事項は`design/v023_codex_adversarial_review.md`、`CONTEXT.md`、`WORKLOG.md`へ記録し、gitへ残す
