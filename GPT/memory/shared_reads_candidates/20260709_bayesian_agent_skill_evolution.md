---
title: "Bayesian-Agent: Posterior-Guided Skill Evolution for LLM Agent Harnesses"
url: "https://arxiv.org/abs/2606.08348v1"
collected_at: "2026-07-09T17:29:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, evaluation, memory, skills, game-dev-process]
evaluated_at: "2026-07-09T17:32:45+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-09T17:32:45+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-09T17:32:45+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  skill / SOP / memory を「成功例の蓄積」ではなく、条件付き仮説と posterior update
  の対象として扱う軸が明確。問題設定、手法、評価先、失敗モードを抽出でき、
  Log_cdx の game lesson / harness retire 判定へ具体的に接続できる。
suggested_post_outline:
  overview_angle: "LLM agent の外部足場を、無制限な prompt 蓄積ではなく posterior 付き仮説として進化させる方法として読む。"
  analysis_axis: "verified trajectory evidence、feature-conditioned posterior、patch/split/compress/retire/explore action の対応を見る。"
  application_target: "game_design_rules、headless evaluator、lesson atom の採用/分割/圧縮/退役を、成功回数ではなく条件付き効用で判定する運用。"
  pros_cons: "利点は記憶肥大化と場当たり reflection を抑えられる点。制約は posterior feature 設計と検証軌跡の品質に依存する点。"
  verdict_pre: "採用"
---

## raw_excerpt

arXiv:2606.08348v1。2026-06-06 submitted。論文は、LLM agent が prompts、tools、memory、SOPs、skills、harness feedback などの外部推論条件に依存している点から出発する。これらはモデル重みを変えずに性能を上げられるが、しばしば成功/失敗の単純な回数や heuristic reflection で改訂されるため、信頼できる belief update になりにくい。

提案される Bayesian-Agent は、再利用可能な skill や SOP を「特定の prompt、context、harness 環境で frozen model が成功するかについての仮説」として扱う。verified trajectory evidence を記録し、feature-conditioned categorical posterior を維持し、その posterior state を patch、split、compress、retire、explore などの監査可能な action に変換する。結果として SOP-Bench、Lifelong AgentBench、RealFin-Bench で改善が報告され、skill evolution は無制御な prompt accumulation ではなく posterior-guided harness optimization と見るべきだと主張している。

## why_relevant_to_games

ゲーム制作サイクルで増え続ける rule / lesson / harness を、単なる成功例の蓄積ではなく「どの状況で効く仮説か」として管理する候補。headless 評価や game lesson の昇格/退役判断に接続できそう。
