---
title: "Harness-IF: Evaluating Instruction Following Across Instruction Surfaces in Coding Agents"
url: "https://arxiv.org/abs/2608.11727v1"
collected_at: "2026-08-24T16:19:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, harness, evaluation, game-development, workflow]
evaluated_at: "2026-08-24T16:23:10+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787556626.596989"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787556626596989"
  char_count: 4056
  posted_at: "2026-08-24T16:30:38+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-24T16:30:38+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787556626596989"
next_action: none
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  複数の instruction surface、atomic rule、実行証拠、zero-injection probe を組み合わせる手法と、定量結果・失敗分類・測定限界まで抽出できる。
  ゲーム制作では完成物評価と別に playtest・比較・記録の実行漏れを監査する具体用途があり、約4000字の概要と独自分析へ十分に展開できる。
suggested_post_outline:
  overview_angle: "coding agent の rule 遵守を複数 instruction surface と実行証拠から rule 単位で測り、既定動作との偶然一致を AP-Acc で分離する評価設計"
  analysis_axis: "atomic rule と evidence-based verdict の強み、shortfall 優勢という失敗像、zero-injection の識別力、LLM judge と小規模 conflict pilot の限界"
  application_target: "Log_cdx のゲーム制作サイクルで、AGENTS.md・skill・user instruction に置いた playtest／比較／記録要求が trace 上で実行されたかを成果物品質とは別軸で検証する"
  pros_cons: "要求 action の抜けと instruction 配置の弱点を可視化できる一方、証拠計装と N/A 判定のコストが高く、judge agreement と surface hierarchy の一般化には注意が要る"
  verdict_pre: "部分採用 — rule 全面スコア化ではなく、重要な要求 action に絞った zero-injection 付き監査として導入候補"
---

## raw_excerpt

Harness-IF は、coding agent が一つの user prompt ではなく、system prompt、tool description、skill description、CLAUDE.md / AGENTS.md などの project file、user instruction という複数の instruction surface を読みながら長い作業を行う点を評価対象にする。642 個の atomic rule library から、60 件の realistic multi-turn coding item に rule を配置し、実行 trace、diff、test、artifact、log から 256 rule へ pass / fail / not applicable の verdict を付ける。

単なる既定動作との一致を instruction following と数えないため、対象 rule を注入しない zero-injection probe で unprompted default を観測し、その既定傾向に反する rule だけを測る Against-Prior Accuracy（AP-Acc）を導入する。通常 accuracy は 72.1–85.9%、AP-Acc は 66.1–78.6%で、全12 model が against-prior rule で 3.6–7.4 point（平均5.81）低下した。8,440 failure の 77.1% は、禁止を破る overstep ではなく、要求 action を実行しない shortfall だった。別の conflict pilot では、system prompt・project file・user instruction が平均 rank で同率、tool description、skill description が後ろに並んだ。ただし9 build・4 conflict pair の pooled tendency で、普遍的 hierarchy とはしていない。verdict の86.8%は LLM judge を含み、judge 交換時の agreement が低いことを測定限界としている。

## why_relevant_to_games

ゲーム制作 agent に与える設計ルール、検証手順、skill、project file が実際の trace 上で守られたかを、完成物の成否とは別に観測する評価設計へ接続できる。とくに「禁止違反」だけでなく、playtest・比較・記録など要求 action の未実行を検出する観点になる。
