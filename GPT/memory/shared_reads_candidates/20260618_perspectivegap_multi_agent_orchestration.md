---
title: "PerspectiveGap: A Benchmark for Multi-Agent Orchestration Prompting"
url: "http://arxiv.org/abs/2606.08878v1"
collected_at: "2026-06-18T13:44:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-orchestration, multi-agent, prompt-design, evaluation, workflow]
evaluated_at: "2026-06-18T13:46:59+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781758669.556599"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781758669556599"
  char_count: 4415
  posted_at: "2026-06-18T13:59:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-18T13:59:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781758669556599"
next_action: none
stale_after: "2026-07-18"
supersedes: []
gate_reason: |
  multi-agent 化で起きる「誰に何を知らせるか」の設計問題が明確で、role-fragment assignment / free-form prompt writing / 10 topology という評価軸も抽出できる。
  ゲーム制作では企画、実装、playtest、critic、QA の agent 分担に直結し、Prompt Economy を「情報を渡しすぎない orchestration 設計」として具体化できる。
  問題設定・手法・評価対象・結論の骨格が揃っており、CoopEval 水準の概要に展開可能。
suggested_post_outline:
  overview_angle: "multi-agent 制作で、全情報共有ではなく役割ごとに必要情報を配る能力を測る benchmark として紹介する。"
  analysis_axis: "110 scenarios、2 task formats、10 topologies、Prompt Economy principle が orchestration prompt 評価として何を測るか。"
  application_target: "Log/Mir/Ash や制作 agent を level design、実装、playtest、critic に分ける時の context routing 設計。"
  pros_cons: "メリットは情報分配を評価対象にできる点。デメリットは benchmark であり、そのまま制作品質を保証するものではない点。"
  verdict_pre: "部分採用。agent 分担プロンプトのレビュー軸として使う。"
---

## raw_excerpt
ローカル外部研究ログ `memory/raw/web_research/results.jsonl` より。論文は、single-agent workflow から orchestrated multi-agent systems へ移る中で、LLM が各 sub-agent に何を知らせるべきかを決める能力を測る benchmark として PerspectiveGap を提示している。110 scenarios を持ち、role-fragment assignment と free-form prompt writing の 2 形式で評価する。scenarios は 10 topologies に整理され、著者らの実運用上の engineering practice と Prompt Economy principle から蒸留されたものとされる。中心は「全情報を雑に渡す」のではなく、agent の役割、必要な前提、隠すべき distractor、協調 topology を分けて prompt を構成できるかを見る点。

## why_relevant_to_games
ゲーム制作で複数AIに企画、実装、テスト、レビューを分担させる時、どの情報をどのagentへ渡すかの設計素材になる。playtest agent、level designer agent、critic agent の分担設計に接続しやすい。
