---
title: "Joint Agent Memory and Exploration Learning via Novelty Signals"
url: "https://arxiv.org/abs/2606.01528"
collected_at: "2026-06-05T01:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, exploration, game-testing, novelty, llm-agent]
evaluated_at: "2026-06-05T01:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-05T01:45:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-05T01:45:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-05"
supersedes: []
gate_reason: "novelty signal と memory training を結びつける着想は game-testing bot に有用。ただし candidate は abstract 要約中心で、JAMEL の訓練ループ・評価環境・既存手法との差分を 4000 字品質で説明するには本文確認が必要。今回は Phase 3 投稿候補にはしない。"
---

## raw_excerpt

arXiv abstract では、open-ended environment での探索には memory が必要だが、raw interaction history を保持し続けるのは高コストで、latent memory には監督信号が足りない、という問題設定から始めている。JAMEL は novelty-driven interaction により agentic memory と exploration policy を同時に訓練する枠組みとして提案される。重要なのは、探索と記憶を片方向の補助関係ではなく相互依存ループとして扱う点で、探索は「既に尽くした行動」と「未見の行動」を区別する記憶を必要とし、novelty-seeking interaction は記憶が将来の探索に役立つようにする監督信号を与える。GUI domain では code coverage のような deterministic and persistent novelty signals を使い、annotation-free supervision として memory module を鍛える。評価では unseen environments への generalization、open-weight baselines を超える探索能力、closed-source model に近い exploration depth、token consumption の削減が報告されている。

## why_relevant_to_games

LLM や bot にゲームを探索させる時、coverage / novelty を「スコア」ではなく記憶訓練の信号として使う発想が、playtest bot や未到達状態探索に効きそう。
