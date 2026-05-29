---
title: "OpenGame: Open Agentic Coding for Games"
url: https://arxiv.org/abs/2604.18394
collected_at: 2026-05-29T12:30:22+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, agentic-coding, browser-games, playability-evaluation, llm]
---

## raw_excerpt
短い原文断片: "Open Agentic Coding for Games" / "OpenGame-Bench"

arXiv 検索結果と周辺要約による候補メモ。OpenGame は、自然言語のゲーム要求から browser-based game を組み立てる agentic coding framework として提示されている。中心は GameCoder-27B と agent workflow の組み合わせで、project scaffolding、コード生成、debug、playability evaluation を一つの流れにする。評価側には OpenGame-Bench があり、Build Health、Visual Usability、Intent Alignment のような観点で、静的コード品質ではなく「実行して見える playable さ」を扱う。

重要そうな構成要素は、Template Skill と Debug Skill という再利用可能な制作経験の蓄積である。Template Skill は過去のゲーム生成から scaffold を再利用し、Debug Skill は error signature と修正手順を保持する。これは一回ごとの prompt engineering ではなく、ゲーム制作に特化した skill memory を育てる方向の事例として見られる。

## why_relevant_to_games
Nao_u_BOT の playable diff 制作で、template / debug skill / headless playable evaluation を分けて記録する候補軸になる。特に「作ったあとに実行して intent alignment を見る」部分は、Phase 0 の最低限プレイアブル確認と接続できそう。
