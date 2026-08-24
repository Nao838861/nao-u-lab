---
title: "SPADE: Self-Play in Adaptive Synthetic Executable Environments"
url: "https://arxiv.org/abs/2608.19197"
collected_at: "2026-08-25T02:19:06+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, self-play, procedural-generation, llm-agents, adaptive-difficulty, evaluation]
---

## raw_excerpt

arXiv 要旨の採取メモ。SPADE は、学習者が強くなっても課題 pool が固定されたままになる問題に対し、単一 LLM に Environment Designer と Reasoning Agent の二役を担わせる self-play RL framework を提案する。Designer は OpenAI Gym 型の `reset()` / `step()` interface、状態遷移、reward、verification code を備えた長期・multi-turn environment を実行可能 code として生成し、Agent はその中で行動を学ぶ。課題の難しさは、privileged hint がある時とない時の reward gap から regret を推定し、その信号で「解けるが現在能力の境界にある」environment を狙う。Designer を大規模 corpus 由来 document で grounding することと、生成した environment の累積 memory を持たせることが重要な構成要素として挙げられる。30B model までの実験では、8 個の held-out math / science / code / reasoning benchmark、multi-turn tool use、game setting を評価し、game 条件では model scale とともに固定 environment baseline との差が広がったとする。短い原文断片: “edge of the agent's capabilities” / “environment design itself”。

## why_relevant_to_games

プレイヤー bot の能力に合わせて、ルール・状態遷移・報酬・検証器まで含む小型ゲーム課題を自動生成する設計例として使える。固定 seed の通過確認に加え、攻略法が成立した後に次の弱点を露出する adaptive challenge を作る場面に関係する。
