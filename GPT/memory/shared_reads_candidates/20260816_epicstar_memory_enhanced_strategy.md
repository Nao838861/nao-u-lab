---
title: "LLMs Are Not Good Strategists, Yet Memory-Enhanced Agency Boosts Reasoning"
url: "https://arxiv.org/abs/2608.12626v1"
collected_at: "2026-08-16T19:31:08+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, strategy, agent-memory, evaluation, starcraft-ii]
---

## raw_excerpt

論文は、長期・部分観測環境で LLM agent が局所観測へ過適合し、数千 step にわたる大局目標との整合を失う現象を strategic drift と置く。EpicStar はこれに対し、勝利 game から時刻・観測・行動をまとめた episode を保存する episodic memory と、直近の環境変化を追う working memory を併用する。新しい局面では game time と観測状態を使って過去の類似 episode を取得し、dynamic gating が取得済み行動を直接再利用するか、working memory と取得 episode を contextual fusion して新しく推論するかを切り替える。検証には TextStarCraft II を用い、level 5・6 の built-in agent と複数 opponent style を対象に Chain of Summarization と比較した。EpicStar は level 5 で gpt-4o-mini 67.5%、gpt-4-turbo 75.0%、level 6 で gpt-4o-mini 30.0% の win rate を報告し、同一 model 条件の token 消費は CoS の 14.5% とする。ablation では exploration を外すと level 6 の win rate が 17.5%、contextual fusion を外すと 12.5% に下がった。著者らは少数の高品質な過去 trajectory を非 parametric policy として使う構成を示す一方、未見 opponent style への過適合検出と、memory bank 拡大時の prompt overhead を今後の課題に挙げている。

## why_relevant_to_games

長期戦略ゲームの AI を、成功 replay の検索、短期状態の追跡、既知手順の再利用と再推論の切替として実装・評価する場面に参照できる。
