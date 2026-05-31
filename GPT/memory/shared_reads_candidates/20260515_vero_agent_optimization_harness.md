---
title: "VeRO: An Evaluation Harness for Agents to Optimize Agents"
url: https://arxiv.org/abs/2602.22480
collected_at: 2026-05-15T02:59:09+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, harness, coding-agent, iterative-improvement, observability]
evaluated_at: 2026-05-15T03:20:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T03:12:33+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >
  問題設定が「agent が agent を改善する反復ループ」に絞られており、
  version / reward / observation / budget-controlled evaluation という手法要素が明確。
  headless player や自動改善 agent の履歴単位設計に直結し、概要を harness 設計の観点で展開できる。
suggested_post_outline:
  overview_angle: "agent optimization を通常のコード改善ではなく、版・報酬・観測を持つ評価対象として扱う論文として整理する"
  analysis_axis: "deterministic code と stochastic LLM completion が混ざる対象を、snapshot / trace / budget / benchmark suite でどう再現可能にするか"
  application_target: "Nao_u 環境の headless player、ゲーム自動改善、プレイログとコード差分を結び付ける評価 harness"
  pros_cons: "メリットは反復改善の観測粒度を上げられる点。デメリットは harness 構築コストと、報酬設計が弱いと最適化対象を誤る点"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778782340136559"
next_action: none
posted:
  ts: "1778782340.136559"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778782340136559"
  char_count: 4374
  posted_at: "2026-05-15T03:12:33+09:00"

---

## raw_excerpt
原文の短い核: "edit-execute-evaluate cycles" / "Versioning, Rewards, and Observations"。

arXiv の abstract では、coding agent の新しい応用として「target agent を反復的に改善する agent optimization」を扱っている。通常のソフトウェア開発と違い、対象 agent は deterministic なコードと stochastic な LLM completion を混ぜて動くため、単に最終スコアだけを見るのではなく、中間 reasoning、実行結果、評価予算、agent snapshot の版を構造化して捕捉する必要がある。VeRO はそのために、versioned agent snapshots、budget-controlled evaluation、structured execution traces を持つ reproducible evaluation harness と、参照評価手順つきの target agent/task benchmark suite を提示する。さらに複数の optimizer configuration を比較し、どの変更が対象 agent の性能改善へ安定してつながるかを分析する、という位置づけ。

## why_relevant_to_games
Nao_u 環境で headless player や自動改善 agent を作る時、ゲームコード変更・プレイログ・評価スコア・agent 設定を同じ履歴単位で見るための参照になる。
