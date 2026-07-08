---
title: "Can Large Language Models Capture Video Game Engagement?"
url: "https://arxiv.org/abs/2502.04379"
collected_at: "2026-07-09T07:44:17.1550622+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [player-experience, engagement, llm-evaluation, affect, playtesting]
---

## raw_excerpt
arXiv:2502.04379 v2。David Melhart、Matthew Barthet、Georgios N. Yannakakis による研究。対象は、pretrained LLM が video を観察して human affect、特に in-game engagement の変化をどの程度検出できるか。GameVibe corpus の first-person shooter 20 本、annotated videogame footage 80 分を使い、text と video frames を multimodal に与える設定で、LLM architecture、model size、input modality、prompting strategy、ground truth processing method の影響を 4,800 以上の experiment で調べている。要旨では、LLM は traditional machine learning baselines を上回る場合がある一方、人間の continuous experience annotations には全般に届かず、game ごとの性能揺れや期待以上に動く条件も分析するとされる。

## why_relevant_to_games
playtest 動画から「盛り上がり」「退屈」「詰まり」を自動ラベル化する probe を作る時、LLM judge を人間評価の代替ではなく補助信号として扱うための候補になる。
