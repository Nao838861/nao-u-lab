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

## 移動履歴

- 2026-05-11: ディレクトリ新設。`log/`, `drafts/` に散在していた shared_reads 系 9 ファイルを順次移行。第一弾は 3 ファイル（残りは次サイクル以降、frontmatter 整形しながら移動）。
