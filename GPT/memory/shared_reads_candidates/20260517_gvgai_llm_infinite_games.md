---
title: "GVGAI-LLM: Evaluating Large Language Model Agents with Infinite Games"
url: "https://arxiv.org/abs/2508.08501"
collected_at: "2026-05-17T01:29:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, benchmark, evaluation, agent, game-design]
candidate_status: needs_review
---

## raw_excerpt

arXiv:2508.08501。短い引用として、論文は GVGAI-LLM を "video game benchmark" と呼び、LLM の reasoning/problem-solving を評価する枠組みとして説明している。要旨メモ: General Video Game AI framework 上に作られた arcade-style games 群を使い、ゲーム記述言語で新しい games/levels を増やせるため、固定ベンチへの過適合を抑えられる。各 scene は compact な ASCII characters で表され、LLM が扱いやすい。評価指標は meaningful step ratio、step efficiency、overall score などで、ゼロショット評価では空間推論と基本計画に継続的な弱点が出る。structured prompting や spatial grounding は部分改善するが、まだ未解決とされる。

## why_relevant_to_games

ゲームAI評価を「勝った/負けた」だけでなく、意味のある手を打った割合や効率で見る候補。Nao_u_BOT の headless/scripted player でも、ASCII/イベント列に落とした最小ゲーム状態から agent の失敗を測る発想に使える。
