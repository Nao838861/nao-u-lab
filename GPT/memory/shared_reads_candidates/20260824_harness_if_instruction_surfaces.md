---
title: "Harness-IF: Evaluating Instruction Following Across Instruction Surfaces in Coding Agents"
url: "https://arxiv.org/abs/2608.11727v1"
collected_at: "2026-08-24T16:19:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, harness, evaluation, game-development, workflow]
---

## raw_excerpt

Harness-IF は、coding agent が一つの user prompt ではなく、system prompt、tool description、skill description、CLAUDE.md / AGENTS.md などの project file、user instruction という複数の instruction surface を読みながら長い作業を行う点を評価対象にする。642 個の atomic rule library から、60 件の realistic multi-turn coding item に rule を配置し、実行 trace、diff、test、artifact、log から 256 rule へ pass / fail / not applicable の verdict を付ける。

単なる既定動作との一致を instruction following と数えないため、対象 rule を注入しない zero-injection probe で unprompted default を観測し、その既定傾向に反する rule だけを測る Against-Prior Accuracy（AP-Acc）を導入する。通常 accuracy は 72.1–85.9%、AP-Acc は 66.1–78.6%で、全12 model が against-prior rule で 3.6–7.4 point（平均5.81）低下した。8,440 failure の 77.1% は、禁止を破る overstep ではなく、要求 action を実行しない shortfall だった。別の conflict pilot では、system prompt・project file・user instruction が平均 rank で同率、tool description、skill description が後ろに並んだ。ただし9 build・4 conflict pair の pooled tendency で、普遍的 hierarchy とはしていない。verdict の86.8%は LLM judge を含み、judge 交換時の agreement が低いことを測定限界としている。

## why_relevant_to_games

ゲーム制作 agent に与える設計ルール、検証手順、skill、project file が実際の trace 上で守られたかを、完成物の成否とは別に観測する評価設計へ接続できる。とくに「禁止違反」だけでなく、playtest・比較・記録など要求 action の未実行を検出する観点になる。
