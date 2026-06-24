---
title: "JAMER: Project-Level Code Framework Dataset and Benchmark on Professional Game Engines"
url: "https://arxiv.org/abs/2606.19830"
collected_at: "2026-06-20T21:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, benchmark, godot, coding-agent, game-engine, playable-artifact]
evaluated_at: "2026-06-20T21:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-20T20:55:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781956446604679"
next_action: none
stale_after: "2026-07-20"
supersedes: []
posted:
  ts: "1781956446.604679"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781956446604679"
  char_count: 3550
  posted_at: "2026-06-20T20:55:00+09:00"
gate_reason: |-
  Godot project 全体を対象に、構造・実行・振る舞いを分けて deterministic に測るため、Nao_u_BOT の playable diff 評価へ直接転用できる。
  問題設定、dataset 構築、評価 pipeline、capability cliff の結論まで抽出でき、CoopEval 水準の概要を書ける密度がある。
suggested_post_outline:
  overview_angle: "小さなコード片ではなく、professional game engine 上の project-level game code をどう検証するかを中心に書く。"
  analysis_axis: "JamSet/JamBench の抽出・検証 pipeline、Structural Completeness Score、Behavioral Alignment Score、runtime pass rate の落ち方を分けて分析する。"
  application_target: "Godot などの playable diff で、ファイル完整性、headless 実行、構造充足、振る舞い一致を別ゲートにする評価設計。"
  pros_cons: "メリットは制作物全体の破綻を deterministic に検出できる点。デメリットは Godot 依存と dataset 構築コスト、行動一致評価の設計負荷。"
  verdict_pre: "部分採用。ベンチマーク全体ではなく、headless 実行と構造・振る舞い分離の評価軸を先に取り込む。"
---

## raw_excerpt
arXiv:2606.19830。JAMER は、AI-driven game development が asset generation、gameplay design、web-based game coding では進んでいる一方、professional game engine 上の project-level code engineering は、大規模 dataset と deterministic evaluation が不足していると置く。提案は JamSet と JamBench。Game Jam の open-source projects を材料に、Godot engine の text-based format と headless execution mode を使い、file integrity から runtime behavior collection までの deterministic verification pipeline を組む。240,000 超の repositories から 8,133 verified projects を抽出し、そのうち 300 manually verified projects を JamBench、残りを JamSet とする。JamBench は theme-driven generation と code completion tasks を定義し、compilation pass rate、Structural Completeness Score、Behavioral Alignment Score で評価する。9 frontier models の評価では、project scale が大きくなると runtime pass rate が小規模 80.4% から大規模 5.7% まで落ちる capability cliff が報告されている。

## why_relevant_to_games
ゲーム制作 agent を「小さいコード片」ではなく Godot project 全体の構造、実行、振る舞いで測る候補。Nao_u_BOT の playable diff 評価で、ファイル完整性、headless 実行、構造充足、振る舞い一致を分ける参考になる。
