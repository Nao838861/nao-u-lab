---
title: "Level-k Distinguishable Mechanisms for Evaluating Bounded Rationality in LLMs"
url: "https://arxiv.org/abs/2608.21296"
collected_at: "2026-08-25T02:18:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-theory, llm-agents, evaluation, opponent-modeling]
---

## raw_excerpt

arXiv 要旨の採取メモ。既存の LLM 戦略推論評価は、学習データに多く現れる canonical game を使うため、モデルが本当に相手の推論段階を追っているのか、既知の解法を再生しているのかを分離しにくい。論文はこの問題に対して、戦略深度を推定するための必要条件を「level-K distinguishability」として形式化し、その条件を満たす新しい game structure 群を構成する。評価は 4 LLM、4 game structure、反復推論 10 level にまたがり、Chain-of-Thought と実際の action の両方を見る。recursive reasoning を明示した条件では、述べた推論と行動の整合が保たれ、主な誤りは best response の計算そのものより、反復すべき推論段数の選択で生じた。一方、相手の gameplay trace から帰納的に深度を推定する条件では、精度が game ごとに不均一に低下した。要旨は、明示的な strategic mentalizing を推論中に行わせると全体成績が改善したと報告している。短い原文断片: “novel game structures” / “wrong number of iterated depth”。

## why_relevant_to_games

敵 AI や playtest bot の「強さ」を勝率だけでなく、相手を何段先まで読むかという行動差として露出させるテストゲーム設計に接続できる。既存ゲーム知識の再生を避けたルール発見・対戦評価用の小型 mechanics を作る場面で参照できる。
