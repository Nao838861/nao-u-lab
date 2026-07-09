---
title: "Bayesian-Agent: Posterior-Guided Skill Evolution for LLM Agent Harnesses"
url: "https://arxiv.org/abs/2606.08348v1"
collected_at: "2026-07-09T17:29:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-harness, evaluation, memory, skills, game-dev-process]
---

## raw_excerpt

arXiv:2606.08348v1。2026-06-06 submitted。論文は、LLM agent が prompts、tools、memory、SOPs、skills、harness feedback などの外部推論条件に依存している点から出発する。これらはモデル重みを変えずに性能を上げられるが、しばしば成功/失敗の単純な回数や heuristic reflection で改訂されるため、信頼できる belief update になりにくい。

提案される Bayesian-Agent は、再利用可能な skill や SOP を「特定の prompt、context、harness 環境で frozen model が成功するかについての仮説」として扱う。verified trajectory evidence を記録し、feature-conditioned categorical posterior を維持し、その posterior state を patch、split、compress、retire、explore などの監査可能な action に変換する。結果として SOP-Bench、Lifelong AgentBench、RealFin-Bench で改善が報告され、skill evolution は無制御な prompt accumulation ではなく posterior-guided harness optimization と見るべきだと主張している。

## why_relevant_to_games

ゲーム制作サイクルで増え続ける rule / lesson / harness を、単なる成功例の蓄積ではなく「どの状況で効く仮説か」として管理する候補。headless 評価や game lesson の昇格/退役判断に接続できそう。
