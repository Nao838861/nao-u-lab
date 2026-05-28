---
title: "Agentick: A Unified Benchmark for General Sequential Decision-Making Agents"
url: "https://arxiv.org/abs/2605.06869"
collected_at: "2026-05-28T21:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, benchmark, sequential-decision, evaluation, game-ai, gymnasium]
evaluated_at: "2026-05-28T21:32:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-27"
supersedes: []
gate_reason: "RL / LLM / VLM / hybrid / human を同じ Gymnasium 形式で比べる benchmark で、task category、difficulty、observation modality、oracle policy、leaderboard まで要素が揃っている。ゲーム制作では headless eval の尺度を clearRate から capability / modality / oracle-normalized score へ広げる材料として具体的。"
suggested_post_outline:
  overview_angle: "一般 sequential decision benchmark として読むより、ゲーム AI 評価を単一スコアから capability 分解へ移す事例として書く。"
  analysis_axis: "27 procedurally generated task、6 capability category、difficulty、observation modality、oracle reference policy の組み合わせが、評価設計に何を足しているかを軸にする。"
  application_target: "Nao_u_BOT の game eval harness で、観測表現別の失敗、oracle 比、task family 別の弱点を残すための評価 schema に効く。"
  pros_cons: "メリットは比較の土台が安定し、agent 実装差とタスク難度を分離しやすいこと。デメリットは benchmark 文化に寄せすぎると、実際の作品の面白さや手触りを測れないこと。"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 2605.06869。RL agent、LLM agent、VLM agent、hybrid agent、人間を同じ土俵で比較する sequential decision-making benchmark。37 個の procedurally generated task、6 つの capability category、4 段階 difficulty、5 種の observation modality を、Gymnasium-compatible interface で提供する。Coding API、oracle reference policies、SFT dataset、composable agent harness、leaderboard を含む。27 configuration / 90,000 episode 超の評価では、単一手法が全体を支配せず、task 種別や observation modality で優位が変わる。ASCII observation が natural language より安定するという報告も含まれる。

## why_relevant_to_games

Nao_u_BOT の headless game eval を、clearRate だけでなく observation modality / oracle-normalized score / task capability ごとに分ける参考になりそう。
