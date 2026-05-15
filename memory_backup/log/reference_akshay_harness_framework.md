---
name: Akshay Pachaar Harness Framework
description: LLM agent harness設計を4軸で分類するレンズ。Memory/Skills/Protocols/Mediators。新能力の置き場所を決める時の判断基準
type: reference
originSessionId: 0c86daf9-bafa-4a36-a249-faa91e7c0fb8
---
# Akshay Pachaar "A harnessed LLM agent" (2026-04-20 Nao_u転送)

## 骨格

Thin model + harness composes intelligence at runtime。
コア周りに以下が軌道する:

| 軸 | 中身 | うちでの実体 |
|---|---|---|
| **Memory** | working / semantic / episodic / personalized。ライフサイクル別 | MEMORY.md (index) / Level 3 memory/*.md / concept_graph / nao_u_live.md |
| **Skills** | procedural knowledge: operational procedures, decision heuristics, normative constraints | `.claude/rules/*.md` (slack/blog/knowledge) / 3原則 / 5原理 / feedback_index |
| **Protocols** | agent-to-user / agent-to-agent / agent-to-tools の契約 | Slackチャンネル使い分け / 投稿スクリプト契約 / AI Lounge手順 / shared-reads形式 |
| **Mediators** | sandboxing, observability, compression, evaluation, approval loops, sub-agent orchestration | リポ外禁止 / inbox_check.log・kaizen-log / MEMORY.md index・reflections_index / headless replay / #human-steering / Agent tool (Explore/Plan) |

## うちで使える決定的な問い

> "for any new capability, where should it live?"

新能力を足す時、これまでは反射的にMemoryに置いていた（memory/*.mdに足す）。
Akshayのレンズを通すと4択になる:
- 安定した知識 → Memory
- 学習した手続き → Skills (.claude/rules/)
- 通信契約 → Protocols (スクリプト + ドキュメント)
- ループ統治 → Mediators (hook / 構造強制)

## 既存メモリとの接続

- `feedback_structural_enforcement.md` (手動手順は守れない→構造で強制) = Memory/Skillsから**Mediators**への押し出し。語彙がなかっただけで既に実行していた
- `reference_witcheer_two_camps.md` (Camp2=人間可読ファイル累積) = MemoryとMediators(compression)の境界議論
- `reference_opus_47_practices.md` (委譲力・文脈を揃える力) = Mediators (sub-agent orchestration) の強化方向

## 運用

新しい能力・ルール・仕組みを導入する時にこの4分類を通す。
Memory一極集中を止めるためのチェックゲート。

## 出典

- Tweet: https://x.com/akshay_pachaar/status/2045510648474530263
- 発言者: Akshay Pachaar
- Nao_u経由 2026-04-20 #nao-u
