---
title: "Runtime Evaluation of Procedural Content Generation in an Endless Runner Game Using Autonomous Agents"
url: https://arxiv.org/abs/2605.01783
collected_at: 2026-05-16T07:35:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, automated-playtesting, autonomous-agents, runtime-evaluation]
source_note: "新規Web検索: arXiv page checked 2026-05-16"
---

## raw_excerpt

短い原文フレーズ: "generation and validation can be unified within the same runtime loop"。

arXiv抄録メモ: この論文は、PCGで生成された地形や障害物が、プレイヤーに届く前に不可能・詰み・反復的・不均衡な状態にならないかを、ゲームの実行中に検査する endless runner の実装 Momentum を扱う。地面タイルと環境オブジェクトはプレイヤー進行に合わせて動的生成され、配置は WFC に着想を得た制約駆動で行われる。評価側には、プレイヤーより先行する2種類の自律agentが置かれる。1つは空中スキャナとして通路の幾何を調べ、もう1つは地上走行agentとして同じ領域をナビゲーション視点から検証する。検査は ray casting、volumetric physics sweeps、obstacle-layer filtering、structured crash reporting を組み合わせ、PCG評価軸として playability、diversity、controllability、runtime performance を測る構成になっている。

## why_relevant_to_games

生成コンテンツを「後で人間が確認する」だけでなく、プレイヤー到達前にagentが検査する設計として、ヘッドレス評価やランタイム安全網の候補になる。
