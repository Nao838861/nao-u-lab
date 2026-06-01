---
title: "Leveraging LLM Agents for Automated Video Game Testing"
url: "https://arxiv.org/abs/2509.22170"
collected_at: "2026-06-02T04:00:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automated-playtesting, llm-agent, qa, game-testing, long-horizon]
---

## raw_excerpt

arXiv:2509.22170、2025-09-26 submitted。対象は MMORPG の自動テストで、従来手法は state coverage と efficiency が弱く、LLM game-playing も complex game state-action spaces と long-complex tasks の理解が浅い、という問題設定。提案 framework は TITAN。構成要素は、high-dimensional game states の perceive / abstract、available actions の proactive optimize / prioritize、action trace memory と reflective self-correction による long-horizon reasoning、LLM-based oracle による functional / logic bug detection と diagnostic reports。実験では PC / mobile の大規模商用 MMORPG 2 本で評価し、task completion rate 95%、既存手法より高い bug detection、prior approaches が見つけられなかった previously unknown bugs 4 件、real-world game QA pipelines 8 件への deployment が記録されている。

Source lines: arXiv page lines 30-41.

## why_relevant_to_games

ゲーム改善時の「よいプレイ」だけでなく、長期 task trace、自己修正、bug oracle を分けて記録する候補。headless の評価ログ設計に直接接続できる。
