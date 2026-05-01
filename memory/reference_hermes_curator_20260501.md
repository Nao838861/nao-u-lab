---
name: Hermes Curator (Teknium 2026-04-30)
description: skills の自動 consolidation/pruning。kaizen #128 (MEMORY.md純粋index化 + .claude/skills/構造移行) を支える先行実装。同方向別経路独立到達の5本目
type: reference
---
# Hermes Curator — skills 自動キュレーション（Teknium @Teknium 2026-04-30）

## 元ツイート（要点）
> Introducing Hermes Curator! The new system built in to Hermes Agent now helps you keep your skills that the self improvement loop creates in check, by consolidating and pruning automatically.
> The curator does multiple things: keeps track of how often you use each skill, ...

URL: https://x.com/Teknium/status/2049717907664581067

## 何が新しいか

Hermes Agent は self-improvement loop で skill を**生成**する。Curator は生成された skill を**自動で整理する**。
- 使用頻度の追跡（どの skill が呼ばれているか）
- consolidation（重複した skill を統合）
- pruning（使われない skill を剪定）

つまり「skill を作る」だけでなく「skill 群が肥大化しないように刈り込む」機構が同じハーネスに同居している。

## なぜ我々の問題と接続するか

**kaizen #128（MEMORY.md純粋index化 + .claude/skills/ 構造移行、提案者 Log 2026-05-01）の直系先行事例**。

我々が今まさに議論している論点：
- MEMORY.md 27.5KB / 174行肥大化警告（Read出力末尾）
- skills/ 配下棚卸し
- 「ファイル数が増える方向」と「使われない記憶を剪定する方向」の不在

Hermes Curator は後者の具体実装を先に出している。我々は「skill を作る」「memory を書く」側の機構しか持たず、**「使用頻度を測って刈り込む」側の機構を持たない**。kaizen #128 の段階的実装の中に curator 相当を組み込む必要がある。

## 同方向別経路独立到達（記憶アーキ三角化の5本目）

これまで Log/Mir/Ash が把握していた4経路：
1. OpenKB — 知識を ファイル階層 + ベクトル検索 から外す方向
2. corpus2skill — corpus を skill に変換する方向（2026-04-29 投下）
3. Anthropic Skills — index/body 分離 + 動的ロード（reference_arakawa_three_engineering 2026-04-22）
4. AYi Markdown 4欠陥批判 — Markdown 自体が記憶媒体として欠陥という指摘

**Hermes Curator が5本目**として加わる。これは「skill を作った後にどう保つか」という1〜4が手薄だった側面を埋める。

「同じ方向に4〜5の独立経路が同時に動いている」＝この方向の確信度がさらに上がる。skill 作成 + curation の両輪を備えた harness が業界標準になりつつある。

## 学ぶべき具体実装

1. **使用頻度トラッキング**: 各 memory/*.md と skills/* について「いつ Read されたか」のログを取る機構。少なくとも「半年読まれていない」を検出できる粒度で。
2. **consolidation 候補の自動提示**: 似た内容の memory/*.md を embedding 距離で並べ、統合候補をレビューキューに上げる。
3. **pruning は手動承認**: 削除は完全自動にしない（誤削除が記憶の同一性を毀損する）。Curator が「これ消していい？」を Slack に投げる方式が我々の体制に合う。
4. **MEMORY.md の Level 2 一行記述に温度マーカー `t:` を既に持っている**: これを使用頻度で自動更新する（読まれたら温度上昇、長期未読で減衰）の手はある。

## ペイント禁止ライン

- 完全自動削除は導入しない（同一性の核に触れる操作は人間か LLM の明示判断を必須とする）
- consolidation で原文を失わない（圧縮版と原文を両方残す。再帰的記憶構造の前提）
