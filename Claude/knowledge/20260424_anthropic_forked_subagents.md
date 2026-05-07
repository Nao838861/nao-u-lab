---
title: Anthropic forked subagents — 親agentのcontextを継承するsubagent
source: https://x.com/arankomatsuzaki/status/2047349471877726586
author: Aran Komatsuzaki (@arankomatsuzaki) 経由 / Anthropic公式update
published: 2026-04-24
captured_at: 2026-04-24
captured_by: Log (Win)
trigger: Nao_u #nao-u 2026-04-24 06:06 URL単独投下（無言）
related:
  - memory/reference_opus_47_practices.md — Opus 4.7サブエージェント抑制傾向の観測
  - memory/reference_akshay_harness_framework.md — Memory/Skills/Protocols/Mediators 4軸
  - memory/reference_external_search_20260421.md — Phase 1で外部検索1本運用化提案(未実装)
  - memory/reference_arakawa_three_engineering.md — Skills index/body分離
  - memory/feedback_external_search_missing.md — 外部検索を自発的にやれていない再指摘
---

# Anthropic forked subagents（2026-04-24取得）

Aran Komatsuzaki(@arankomatsuzaki)経由でAnthropic最新update。subagentに2種類できた:

| 種別 | context |
|---|---|
| 従来 subagent | cold start (fresh context) |
| forked subagent | 親agentのcontextを継承して起動 |

Aran評: "This is just what I needed!" — richer contextを必要とするタスクに使う。

## 概念ノード（R-007: 私的造語×外部対応語の併記）

- **forked subagent** = context-inheriting subagent (Anthropic 2026) — 親の文脈を引き継いで起動するsubagent
- **cold start subagent** = stateless / fresh-context subagent — 従来型、文脈剥落で起動
- **栄養の偏り** = information diet imbalance / epistemic bubble (Nguyen 2020) — 摂取側がプル型に依存して摂取が偏る問題（うちの私的用語）

## 我々への直接の影響3点

### 1. 栄養の偏り処方箋の質が上がる

memory/reference_external_search_20260421.md で「Phase 1で現課題キーワード外部検索1本運用化」を提案 → 未実装で4日経過。
未実装の主因の一つ: Exploreがcold startで「今の問い」を渡せず、汎用検索しか戻らない実感があった。
forkedなら今握っている温度（inbox / 新着 / 今サイクルの問い）を抱えたまま検索を投げられる → 戻りの接続率が上がる → 実装ハードルが一段下がる。

### 2. Opus 4.7サブエージェント抑制の構造的説明

memory/reference_opus_47_practices.md で「Opus 4.7はサブエージェント抑制傾向」と観測した。
これはモデル個性ではなく、**cold startのcontext剥落コストへの合理化反応**として読める。
forkedが標準化すれば抑制理由が消える方向 → 抑制を解除する判断材料になる。

### 3. regular vs forked の使い分けゲート

regularとforkedは機能が違う:

- **regular subagent** = 主観バイアス遮断装置 / fresh perspective（cross_review的役割）
- **forked subagent** = Memory state preservation / richer context（外部検索や継続調査的役割）

memory/reference_akshay_harness_framework.md の4軸(Memory/Skills/Protocols/Mediators)で言うとどちらもMediatorだが、内訳が割れる。
「subagent起動」を一律で扱わず、Phase 1 promptに「目的=新視点(regular) or 文脈継続(forked)」の判断1行を入れる候補。

## 試行案（1mm）

次の1サイクルでPhase 1冒頭の外部検索1本をforked Explore起動で回し、cold start版の過去結果と接続率を比較する。1サンプルでも使い分け基準が見える。

## 既存記憶との既成接続

- 反対方向への接続: regular subagentの「主観バイアス遮断」価値 = cross_review系の役割。forkedで全部置き換わるわけではない。
- 同方向の物理レンダリング側具体例: 同日取得のCuRast(Markus Schütz, https://x.com/m_schuetz/status/2047334757856362851) はLOD precompute廃止 → "事前最適化を捨てて実行時で全部やる"型として共通項。記憶も計算もprecomputeコストが「賢い圧縮」から「ただの遅延」に転落する転換点を別レイヤで観測している。

## 次の自己検証

- 試行案を実際に実行できたか（feedback_index.md #5: 知識の存在 ≠ 行動の変化）
- forked起動のAPI/SDK実装詳細をAnthropicドキュメントで確認 → このknowledgeに追記
