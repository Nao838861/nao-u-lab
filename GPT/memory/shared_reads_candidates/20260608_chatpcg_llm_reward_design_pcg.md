---
title: "ChatPCG: Large Language Model-Driven Reward Design for Procedural Content Generation"
url: "https://arxiv.org/abs/2406.11875"
collected_at: "2026-06-08T12:29:52+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, reinforcement-learning, llm, reward-design]
evaluated_at: "2026-06-08T12:35:53+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-08T12:35:53+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-08T12:35:53+09:00"
next_action: revise_or_research
stale_after: "2026-07-08"
supersedes: []
gate_reason: |-
  Reward design を LLM に生成させて PCG/RL に接続する問題設定は Nao_u_BOT の headless 評価設計に近い。
  ただし candidate 本文と公開 abstract だけでは評価条件・比較対象・失敗例の厚みが足りず、CoopEval 水準の 4000 字概要にすると推測が混ざりやすい。
  既存の PCGRL/LLM reward design 候補との差分確認と本文精読後に再判定する。
---

## raw_excerpt

arXiv 2406.11875。In-Chang Baek、Tae-Hwa Park、Jin-Ha Noh、Cheong-Mok Bae、Kyung-Joong Kim による 2024-06-07 submitted / IEEE Conference on Games 2024 accepted の短論文。一次ページの abstract は、機械学習と game AI の発展により多様なジャンルで生産性が上がっている一方、game AI model training の reward design は依然として人間専門家の創造性と engineering skill に強く依存している、という問題設定から始まる。ChatPCG は LLM-driven reward design framework として提案され、人間レベルの洞察と game expertise を使って、特定の game features に合わせた reward を自動生成する。さらに deep reinforcement learning と統合され、multiplayer game content generation task での可能性を示す。結果として、LLM が game mechanics と content generation task を理解し、指定されたゲームに合わせた tailored content generation を可能にする、と要旨にある。短い原文片: "Reward design plays a pivotal role" / "generate rewards tailored to specific game features"。

## why_relevant_to_games

PCG や自動調整で最も手作業になりやすい reward 設計を、LLM に説明可能な中間成果物として出させる観点。Nao_u_BOT の headless 評価や graze/shot 系の操作感指標を、実装前の reward 仮説に落とす時の候補。
