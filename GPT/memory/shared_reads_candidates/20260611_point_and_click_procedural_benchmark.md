---
title: "Point-and-Click: A Procedural Benchmark for 2D Adventure Puzzle Solving"
url: "https://openreview.net/pdf/bd8a624649f8ade59aa122e55eaffa524eb3f1c9.pdf"
collected_at: "2026-06-11T14:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, benchmark, puzzle, adventure-game, procedural-generation, evaluation]
evaluated_at: "2026-06-11T14:24:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781155838.984449"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781155838984449"
  char_count: 4500
  posted_at: "2026-06-11T14:30:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-11T14:30:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781155838984449"
next_action: none
stale_after: "2026-07-11"
supersedes: []
gate_reason: "問題設定、生成手法、ground-truth causal graph による評価、agent 失敗要因まで candidate 内で抽出できる。Nao_u_BOT の headless 評価を subgoal 単位へ分解する具体的適用があり、CoopEval 水準の概要に展開できる。"
suggested_post_outline:
  overview_angle: "point-and-click adventure を、LLM/VLM agent の長期推論と implicit goal deduction を測る procedural benchmark として読む。"
  analysis_axis: "固定ゲーム評価ではなく、依存 DAG と ground-truth causal graph を持つ生成 instance によって success 以外の subgoal completion、optimality、knowledge/perception error を測る点。"
  application_target: "Nao_u_BOT のゲーム評価で、クリア率だけでなく依存グラフ上の停止 subgoal、clue forgetting、perception miss を run summary に出す評価設計。"
  pros_cons: "メリットは失敗箇所を設計改善へ戻しやすいこと。デメリットは自作ゲーム側にも依存グラフや subgoal instrumentation を仕込むコストがあること。"
  verdict_pre: "部分採用。benchmark そのものより、causal graph 付き評価ログの設計思想を取り込む。"
---

## raw_excerpt
ICLR 2026 under review の PDF。point-and-click adventure game を、multimodal LLM/VLM agent の long-horizon reasoning、commonsense knowledge、language-perception grounding、implicit goal deduction を測る場として扱う。固定ゲームではなく、keys/locks、codes、pattern matching などの primitive から directed acyclic graph の puzzle dependency を作り、2D room として procedural に生成する。各 instance は ground-truth causal graph を持つため、success/failure だけでなく subgoal completion、optimality、knowledge errors などを記録できる。実験では simple/medium/hard の成功率で human と agent の差が大きく、agent 側は perception/attention miss、riddle solving の脆さ、clue forgetting が失敗要因として挙げられている。短い原文断片: "ground-truth causal graph" / "implicit goal deduction" / "difficulty cliff"。

## why_relevant_to_games
Nao_u_BOT の headless 評価を「クリア率」だけでなく、依存グラフ上のどの subgoal で止まったかまで分解する設計候補になる。
