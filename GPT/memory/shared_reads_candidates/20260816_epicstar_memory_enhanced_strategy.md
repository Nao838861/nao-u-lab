---
title: "LLMs Are Not Good Strategists, Yet Memory-Enhanced Agency Boosts Reasoning"
url: "https://arxiv.org/abs/2608.12626v1"
collected_at: "2026-08-16T19:31:08+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, strategy, agent-memory, evaluation, starcraft-ii]
evaluated_at: "2026-08-16T19:34:35+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-16T19:39:08.953229+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786876748953229"
next_action: none
stale_after: "2026-09-15"
supersedes: []
gate_reason: >-
  strategic drift という問題設定から、episodic/working memory、dynamic gating、比較実験、ablation、限界まで重要要素を抽出できる。
  長期戦略 AI の成功 replay 検索と再推論の切替へ具体的に適用でき、CoopEval 水準の概要と批判的分析を構成できる。
suggested_post_outline:
  overview_angle: "長期戦略を巨大 context で耐える問題ではなく、成功 trajectory を非 parametric policy として検索し、局面ごとに再利用か再推論かを選ぶ問題として整理する"
  analysis_axis: "episodic memory・working memory・dynamic gating の役割分解と、win rate・token 効率・ablation が各設計要素をどこまで支持するかを検証する"
  application_target: "長期戦略ゲーム AI の replay bank、局面 fingerprint、既知手順の再利用条件、未知 opponent での再探索条件、および回帰評価セットの設計"
  pros_cons: "少数の成功例で戦略一貫性と token 効率を改善できる一方、勝利例への過適合、memory bank の被覆不足、拡大時の検索・prompt overhead が残る"
  verdict_pre: "部分採用"
posted:
  ts: "1786876748.953229"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786876748953229"
  char_count: 4082
  posted_at: "2026-08-16T19:39:08.953229+09:00"
---

## raw_excerpt

論文は、長期・部分観測環境で LLM agent が局所観測へ過適合し、数千 step にわたる大局目標との整合を失う現象を strategic drift と置く。EpicStar はこれに対し、勝利 game から時刻・観測・行動をまとめた episode を保存する episodic memory と、直近の環境変化を追う working memory を併用する。新しい局面では game time と観測状態を使って過去の類似 episode を取得し、dynamic gating が取得済み行動を直接再利用するか、working memory と取得 episode を contextual fusion して新しく推論するかを切り替える。検証には TextStarCraft II を用い、level 5・6 の built-in agent と複数 opponent style を対象に Chain of Summarization と比較した。EpicStar は level 5 で gpt-4o-mini 67.5%、gpt-4-turbo 75.0%、level 6 で gpt-4o-mini 30.0% の win rate を報告し、同一 model 条件の token 消費は CoS の 14.5% とする。ablation では exploration を外すと level 6 の win rate が 17.5%、contextual fusion を外すと 12.5% に下がった。著者らは少数の高品質な過去 trajectory を非 parametric policy として使う構成を示す一方、未見 opponent style への過適合検出と、memory bank 拡大時の prompt overhead を今後の課題に挙げている。

## why_relevant_to_games

長期戦略ゲームの AI を、成功 replay の検索、短期状態の追跡、既知手順の再利用と再推論の切替として実装・評価する場面に参照できる。
