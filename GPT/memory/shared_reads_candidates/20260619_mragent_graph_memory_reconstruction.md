---
title: "Memory is Reconstructed, Not Retrieved: Graph Memory for LLM Agents"
url: "https://arxiv.org/abs/2606.06036"
collected_at: "2026-06-19T18:29:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, graph-memory, long-horizon-agents, evaluation, memory-system]
evaluated_at: "2026-06-19T18:37:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-19T18:37:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-19T18:37:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-19"
supersedes: []
gate_reason: >-
  Cue-Tag-Content graph と active reconstruction は記憶システム改善には有用だが、現候補は LoCoMo / LongMemEval 中心で、ゲーム制作の具体場面への接続がまだ薄い。
  Phase 3 に出す前に、playable diff / feedback / headless 評価を cue-tag-content 化する小さな適用例が必要。
---

## raw_excerpt
arXiv:2606.06036。2026-06-04 submitted。Shuo Ji / Yibo Li / Bryan Hooi による、LLM agent の長期履歴推論に関する論文。問題設定は、現在の memory-augmented agent が「まず検索し、その後に推論する」静的 pipeline に寄り、推論途中で見つかった手がかりに応じて memory access を動的に変えにくいこと。提案は MRAgent で、memory を Cue-Tag-Content graph として表し、associative tag を cue と content の橋渡しに使う。active reconstruction mechanism は LLM reasoning を memory access に直接組み込み、途中証拠に応じて探索経路を広げたり枝刈りしたりする。LoCoMo と LongMemEval で評価し、強い baseline に対して最大 23% の改善と token / runtime cost の低減を報告している。

## why_relevant_to_games
ゲーム制作サイクルの記憶運用で、過去の feedback / playable diff / headless 評価を単発検索ではなく、制作中の発見に応じて再構成する候補になる。
