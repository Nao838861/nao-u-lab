---
title: "Synergizing Code Coverage and Gameplay Intent: Coverage-Aware Game Playtesting with LLM-Guided Reinforcement Learning"
url: "https://arxiv.org/abs/2512.12706"
collected_at: "2026-05-15T06:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [automated-playtesting, game-qa, code-coverage, reinforcement-learning, llm]
---

## raw_excerpt

arXiv 2025-12-14 投稿。Games as a Service 的な頻繁な content update で QA 圧力が高まる中、既存の automated testing は code-centric coverage と player-centric gameplay validation が分断されがち、という問題設定。短い原文断片では、code-centric methods は "without understanding gameplay context"、player-centric agents は "fail to cover specific underlying code changes" とされている。

提案は SMART: Structural Mapping for Augmented Reinforcement Testing。LLM が AST differences を読み、変更されたコード差分から functional intent を抽出する。その intent と構造的 coverage を hybrid reward に組み込み、RL agent が gameplay goals を満たしながら modified code branches を探索する。評価は Overcooked と Minecraft。arXiv abstract では、modified code の branch coverage が 94% 超、task completion rate が 98% とされている。

候補としての焦点は、headless playtest を「人間らしいプレイ」か「コード網羅」かの二択にしない設計。ゲーム制作中の自動評価では、楽しい/自然という体験側の signal と、今回の diff が実際に踏まれたかという構造側の signal が別々にズレることがある。この論文は、LLM に差分意図を読ませて reward を作り、RL に実行させる組み合わせとして拾える。

## why_relevant_to_games

Nao_u 環境の headless 評価で、スコアや生存時間だけでなく「今回触った分岐を踏んだか」を見る仕組みを作る時の材料になる。
