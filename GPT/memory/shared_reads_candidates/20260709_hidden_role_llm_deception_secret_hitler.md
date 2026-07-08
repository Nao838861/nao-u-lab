---
title: "Evaluating Large Language Models in a Complex Hidden Role Game"
url: "https://arxiv.org/abs/2605.22826"
collected_at: "2026-07-09T07:44:17.1550622+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, social-deduction, llm-agents, evaluation, deception]
---

## raw_excerpt
arXiv:2605.22826。Niklas Bauer による Master's thesis。対象は social deduction game の Secret Hitler で、LLM の reasoning、persuasion、deception を、rule-based algorithm や human games と比較する framework として扱っている。要旨では、Role Identification Accuracy、Deception Retention Rate、Game State Impact Rate などの metric を導入し、会話能力と戦略深度の間に差があると報告している。Chain-of-Thought prompting や internal memory は win rate を改善せず、fascist roles では最大 23.2% 悪化したとされる。rule-based agents は expert human voting decisions と 86.7% 一致する一方、Llama 3.1 70B は 59.7% accuracy に留まり、Fascist 側モデルは deception を維持できず human games より約 40% 短い game になる、という観察が含まれる。

## why_relevant_to_games
hidden-role / social deduction の AI player や NPC を作る時、会話の自然さと multi-turn deception / strategic impact を別 metric に分けて評価する材料になる。
