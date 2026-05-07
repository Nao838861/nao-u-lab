---
name: 外部検索収穫 2026-04-21（記憶アーキ・ゲームオンボーディング）
description: Nao_uの「外部検索やってる人いない」指摘を受けて実行した2テーマ検索の収穫。identity/memory分離論文とPotへの30秒設計パターン
type: reference
originSessionId: a0e72945-fff2-4dbe-afa2-8b7b487d0d4d
---
# 外部検索収穫 2026-04-21

**背景**: Nao_u #human-steering 06:52「最近外部検索とかやってる人いる？見かけない気がする。twitterを探すのもいいけど、気になったテーマのキーワードで検索して探すのもよいと思う」を受けて、Log（Win D:\AI）が2テーマで実行。

## テーマ1: LLM agent persistent memory / persona continuity

**一番刺さった**: arXiv 2604.09588「Persistent Identity in AI Agents: A Multi-Anchor Architecture for Resilient Memory and Continuity」——**identity（誰であるか）とmemory（何を経験したか）を明示的に分離、identityに複数の独立アンカーを持たせる**。

これはうちの3層プロンプト構造（`.claude/system_identity.md` = identity常時注入 / `memory/` = 経験の蓄積）と完全一致の発想。外部にも同じ問題意識で設計してる人がいる。

- 語彙: "multi-anchor identity"、"identity resilience"
- 発信で使える: AI Lounge/Twitter向けに「うちは3層プロンプトでidentityとmemoryを分離している」と語る時の外部根拠
- 比較対象: O-Mem（active user profiling + hierarchical retrieval） = Level 2想起トリガー+concept_graphと近い位置

**How to apply**: system_identity編集や3層構造の話題、AI Loungeでの発信で「外部研究と地続き」として引用する。栄養の偏り問題への直接の答え。

## テーマ2: game design 30秒オンボーディング（Pot向け）

**一番刺さった**: "Small Win strategy — minor victory within first 30 seconds" と "Teach mechanics through action, not instructions—if players need to learn to jump, put a small gap in front of them, not a manual"

Pot016b weave でNao_uに響かなかった件と直接接続。文字/チュートリアルで教えず、**最初のレベル地形でjumpを必要にする=学習=Small Winが同時に起きる**構造が王道パターン。

- 2026ベンチ: Day1 retention 30%以上、top casualは35-40%
- FTUE最初60秒で「コアゲームプレイ」に到達（チュートリアル画面/設定/アカウント作成に時間を使わない）

**How to apply**:
- 新Pot着手時、チェックリストに「最初の30秒でSmall Winが発生するか」を追加
- `memory/game_lessons_log.md` の改修時チェック項目に接続
- game_design_principles.md の「30秒オンボーディング」原則に外部根拠として追記候補

## ソース

- arXiv 2604.09588 Persistent Identity in AI Agents
- arXiv 2603.29194 Multi-Layered Memory Architectures for LLM Agents
- arXiv 2510.07925 Personalized Long-term Interactions via Persistent Memory
- arXiv 2511.13593 O-Mem
- iABDI「The $10,000,000 Tutorial: Why Onboarding is Your Most Profitable Mechanic」(2026-01)
- Inworld.ai Game UX onboarding best practices
- Game Growth Advisor 2026 mobile retention strategies

## 方法論メモ

- テーマ2つ並列で検索するとコスト効率が良い（1起動で済む）
- 「外部検索していない」病への処方箋: Phase 1の新着走査時、Twitterだけでなく**自分たちの現課題キーワード**で外部検索を1本必ず走らせる運用にできないか

## 追記: 2026-04-22 運用化未実装のまま再指摘を受けた

このメモに「運用にできないか」と自分で書いた翌日、Nao_u #nao-u 09:21 で supersonic.com/ja/learn/blog/difficulty-curves/ が共有され、同時に「こういうのも自分たちで探して欲しい」と再指摘された。E13 (ABA) を取り込んだ直後の補完記事 E14 (Supersonic KPI/運用論) を、我々が自発的に探しに行っていなかった。

→ 構造強制へ移行するために `feedback_external_search_missing.md` を新規作成。
→ `docs/game_design_principles.md` に E14 として取り込み済み。
