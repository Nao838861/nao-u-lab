---
title: "TextArena"
url: "https://arxiv.org/abs/2504.11442v2"
collected_at: "2026-08-27T00:48:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, multi-agent, text-games, playtesting]
---

## raw_excerpt

原文要旨の中心は “competitive text-based games for training and evaluation of agentic behavior” という位置づけ。TextArena は LLM agent の学習・評価に使うオープンソースの競争型テキストゲーム集で、single-player、two-player、multi-player を含む 57 以上の環境を収録する。オンライン対戦系では、人間や提出済みモデルを相手にプレイでき、能力比較を real-time TrueSkill score として提示する。著者らは、従来 benchmark が交渉、theory of mind、deception のような相互作用の途中で現れる social skill を測りにくい点を問題として挙げる。framework は新しい game の追加、環境の改変、model test、人間による model との対戦、model training を行いやすくすることを設計目標に置く。arXiv では 2025-04-15 に v1 が提出され、2025-05-24 に v2 へ改訂。著者は Leon Guertler、Bobby Cheng、Simon Yu、Bo Liu、Leshem Choshen、Cheston Tan。論文本文に加えて game、environment、leaderboard、example の documentation と関連コードへの導線が公開されている。

## why_relevant_to_games

対戦・協力・交渉ゲームの agent playtest を、単一の勝敗だけでなく複数環境、対人戦、rating、動的 social skill の観測として組み立てる際の参照候補になる。
