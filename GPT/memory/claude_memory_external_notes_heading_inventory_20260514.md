---
title: "Claude external_notes 見出し inventory 2026-05-14"
date: 2026-05-14
owner: GPT/Codex
status: active
lifecycle: audit
source_files:
  - Claude/memory/external_notes_mac.md
  - Claude/memory/external_notes_log.md
  - Claude/memory/external_notes_ash.md
  - Claude/memory/external_notes_mir.md
---

# Claude external_notes 見出し inventory 2026-05-14

## 目的

CMI-017 として、`external_notes_*.md` を本文編集せずに見出し単位で可視化する。

今回の精密対象は `Claude/memory/external_notes_mac.md`。本文は raw evidence として保持し、統合・削除・本文整形は行わない。

## 全体サイズ

| file | size | 備考 |
|---|---:|---|
| `Claude/memory/external_notes_mac.md` | 56,283 bytes | 今回の精密 inventory 対象 |
| `Claude/memory/external_notes_ash.md` | 329,681 bytes | 次回以降、同じ方式で分割 inventory |
| `Claude/memory/external_notes_log.md` | 394,129 bytes | 次回以降、同じ方式で分割 inventory |
| `Claude/memory/external_notes_mir.md` | 438,333 bytes | 次回以降、同じ方式で分割 inventory |

## external_notes_mac.md 概要

- 行数: 607
- 見出し数: 68
- L2 見出し: 13
- L3 以上: 55
- 明示 URL 数: L2 block 合計 10
- 統合済マーカー: 明示的な `integrated` / `統合済` marker は未確認

## L2 inventory

| lines | L3数 | URL数 | route | 見出し |
|---:|---:|---:|---|---|
| 7-26 | 0 | 0 | `reference/architecture` | 2026-03-18 ヴィシャル・ミスラ「AGIへの壁はアーキテクチャにある」（Nao_u経由） |
| 27-86 | 4 | 0 | `reference/ai-character` | 2026-03-17 AITuber巡回（Web検索ベース） |
| 87-124 | 3 | 0 | `memory/reference` | 2026-03-17 AIエージェントの記憶アーキテクチャ（Web検索） |
| 125-196 | 7 | 4 | `memory/reference` | 2026-03-17 AITuber巡回（第2回・深掘り） |
| 197-229 | 3 | 1 | `game/reference` | 2026-03-17 ゲームデザイン論（Web検索・第1回外部素材サイクル） |
| 230-278 | 4 | 0 | `memory/game/reference` | 2026-03-17 AIエージェント記憶アーキテクチャ＋暗黙的教育（Web検索・第2回外部素材サイクル） |
| 279-340 | 4 | 4 | `memory/reference` | 2026-03-18 外部検索サイクル（Nao_u指示: 毎サイクルにWeb検索を入れろ） |
| 341-376 | 0 | 0 | `skills/memory` | 2026-03-19 cognee-skills「スキル自動改善の5ステップ」（Slack #all-nao-u-lab経由） |
| 377-409 | 0 | 1 | `skills/protocol` | 2026-03-19 Anthropic公式「Skills完全ガイド」（Qiita ゆるくさ氏解説、Nao_u経由 #nao-u） |
| 410-429 | 4 | 0 | `beliefs/quotes` | 2026-03-19 Nao_uが#nao-uに貼った引用群（Slack経由） |
| 430-527 | 14 | 0 | `operation/agent` | 2026-03-19 #nao-u投稿3件（Slack経由） |
| 528-596 | 11 | 0 | `identity/teacher` | 2026-03-19 Nao_uのRT教師付き学習（#nao-uチャンネル消化） |
| 597-607 | 1 | 0 | `game/reference` | 2026-03-16 Emergent Narrative研究（Web検索） |

## 接続先候補

| route | 対象 |
|---|---|
| `memory/reference` | Agent Memory、Mem0、Titans/MIRAS、Trajectory-Informed Memory、autonomous LLM memory |
| `skills/protocol` | Anthropic Skills、cognee-skills、手順ではなく理由を理解する話 |
| `game/reference` | レベルデザイン、環境ストーリーテリング、emergent narrative、感情的デザイン |
| `identity/teacher` | Nao_u の RT 教師付き学習、AIキャラクター人格、創作の信用度 |
| `operation/agent` | 並列エージェント、AI実行効率、spec review、タスク分解、テスト品質 |
| `beliefs/quotes` | 削り出す感覚、銀河英雄伝説、安宅和人、情報選択 |

## 推奨 route

1. まず `memory/reference` block を候補化する。CMI-018 の analysis-to-action canonical と接続しやすい。
2. 次に `game/reference` block を `game_read_path_compiled_guide.md` の補助資料として扱う。
3. `skills/protocol` は memory ではなく Protocol/Skill 境界の検討材料に回す。
4. `identity/teacher` と `beliefs/quotes` は raw のまま保持し、beliefs へ昇格する場合は Nao_u 原文性を確認する。

## 保留判断

- `external_notes_mac.md` 本体には編集しない。
- この時点で canonical 化しない。
- `external_notes_ash.md`、`external_notes_log.md`、`external_notes_mir.md` は巨大なので、次回以降に同じ heading inventory を別ファイルとして作る。

## 次アクション

CMI-018 では、`feedback_analysis_action_gap.md` と `feedback_info_integration.md` を中心に「分析から行動へ戻らない」問題の canonical を作る。今回の `external_notes_mac.md` inventory は、その canonical に接続できる外部情報 block を探す補助資料として使う。
