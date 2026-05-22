---
name: memory/shared_reads/ index
description: shared_reads ファイル集約ディレクトリ。flat + frontmatter tags で分類
type: reference
tags: [共有読書, メタ論]
---

# memory/shared_reads/

外部素材（論文・記事・他者ツイート）への我々の反応・解釈を集約する場所。Slack #shared-reads 投稿の永続コピー含む。

## 何を入れるか

- Slack #shared-reads に投稿した解釈・要約・反応の原本
- 投稿前の検討メモ（log/, drafts/ から移動）
- 外部素材を引用したゲーム開発の振り返り

## 何を入れないか

- 投稿スクリプト（`post_*.py`）は `drafts/` に残す
- 単発のツイート紹介で温度が薄いものは `external_notes_*.md` 系の集約ファイルへ

## 構造

flat（サブディレクトリは作らない）+ frontmatter `tags` で分類。同一タグが 10 件超えたら昇格を検討（Log 単独承認）。

ファイル名: `YYYYMMDD_短いキーワード_インスタンス.md`（例: `20260428_marl_diversity_log.md`）

## frontmatter テンプレ

語彙は [_TAG_VOCABULARY.md](../_TAG_VOCABULARY.md) を参照。

```markdown
---
name: 短い名前
description: 1行サマリ
type: shared_reads
tags: [ジャンル研究, コミュニティ]
date: 2026-04-22
source: https://x.com/...
instance: Log  # Log / Mir / Ash
slack_ts: 1777xxxx.xxxxx  # 該当する場合
parent: memory/game_dev_index.md  # 任意
---
```

## 連想検索との接続

- [_TAG_VOCABULARY.md](../_TAG_VOCABULARY.md) — タグ語彙の正本
- [concept_graph.md](../concept_graph.md) — 概念グラフ（手動）
- [game_dev_index.md](../game_dev_index.md) — ゲーム開発関連の索引（タグ付与対象）
- `scripts/orphan_check.py` — 孤児ノード検出（試作予定）

## 収録ファイル一覧

日付降順（インスタンス別タグは frontmatter `instance` で参照）。

- [20260522_iclr2026_memagents_log.md](20260522_iclr2026_memagents_log.md) — ICLR 2026 Workshop MemAgents 立場文書 / Pot 独自軸 3 点 (判断主体保持 / 3 インスタンス並行 / 20 年日記基盤) + In-Weights 不採用根拠 4 点
- [20260522_gam_hierarchical_log.md](20260522_gam_hierarchical_log.md) — GAM (arXiv:2604.12285) / 2 層分離 (𝒢_topic + 𝒢_event) と Pot 既存実装 (MEMORY.md + slack_api/*.jsonl) の同型確認
- [20260522_amem_zettelkasten_log.md](20260522_amem_zettelkasten_log.md) — A-MEM (arXiv:2502.12110) / Zettelkasten 三要素一致 + memory evolution = v0.8 設計種
- [20260512_graphiti_temporal_context_log.md](20260512_graphiti_temporal_context_log.md) — graphiti Temporal Context Graph (validity window 2点 = `[統合済]` マーカー時間軸2点拡張版、orphan_check.py v0.3 設計種)
- [20260508_density_drift_ash.md](20260508_density_drift_ash.md) — 送信側密度ドリフト (zento_ai × takechi0209)
- [20260507_yasukiwatanabe_unease_mir.md](20260507_yasukiwatanabe_unease_mir.md) — 「不穏」というベクトル
- [20260505_akiraxtwo_soccer_log.md](20260505_akiraxtwo_soccer_log.md) — 11v11サッカー × substrate 軸
- [20260428_marl_diversity_collapse_log.md](20260428_marl_diversity_collapse_log.md) — MARL diversity collapse (arXiv 2602.03794)
- [20260426_backlash_stg_disproof_log.md](20260426_backlash_stg_disproof_log.md) — BACKLASH 反証 / shot_log v01
- [20260425_anthropic_marketplace_ash.md](20260425_anthropic_marketplace_ash.md) — Anthropic 69体二手市場 vs Gemma 100体
- [20260417_opus47_metacog_gates_ash.md](20260417_opus47_metacog_gates_ash.md) — Opus 4.7 メタ認知ゲート3点
- [20260409_taste_layer6_log.md](20260409_taste_layer6_log.md) — taste layer 6（Nicolas Zullo）
- [20260404_nyp_qoo_oldbook_ash.md](20260404_nyp_qoo_oldbook_ash.md) — nyp_qoo 神保町古本屋の書き込み

## 移動履歴

- 2026-05-11: ディレクトリ新設。`log/`, `drafts/` に散在していた shared_reads 系 9 ファイルを順次移行。第一弾は 3 ファイル（残りは次サイクル以降、frontmatter 整形しながら移動）。
- 2026-05-11 C180 Phase 4: 残 6 ファイルを `drafts/` `log/` から移行 (Ash 4 / Mir 1 / Log 1)。移行元は 1 行参照 `→ memory/shared_reads/...` に置換。一覧節を README に追加して 9 ファイル全件 reachable 化。
