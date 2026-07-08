---
title: "Explore Before You Solve: The Speed--Depth Trade-off in Epistemic Agents for ARC-AGI-3"
url: "https://arxiv.org/abs/2605.25931"
collected_at: "2026-07-08T21:44:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, exploration, benchmark, harness]
evaluated_at: "2026-07-08T21:48:17+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-08T21:48:17+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-08T21:48:17+09:00"
next_action: revise_or_research
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  benchmark validity critique と EXPLORE / VERIFY / PLAN の速度深度 trade-off はゲーム評価 harness に有用だが、候補本文だけでは主張の検証材料が薄い。
  ARC-AGI-3 public set の bypass 論点を投稿水準の概要へ上げるには、具体例と評価指標の確認が必要。
---

## raw_excerpt

arXiv:2605.25931。2026-05-25 submitted。著者は Liew Keong Han。

短い原文断片: "Explore Before You Solve" / "Speed--Depth trade-off" / "EXPLORE / VERIFY / PLAN"。

抄録メモ: この論文は ARC-AGI-3 の public 25 games を調べ、すべてが非知的な strategy でも到達可能であると報告する。内訳として、10 game は blind step、5 game は probing action 後、1 game は ACTION1 の反復、1 game は diverse exploration、8 game は十分な budget を持つ単一 action 反復で到達可能とされる。また null-coordinate vulnerability により 18 game が 1 step で bypass されるという benchmark validity の指摘も含む。その上で、AERA という EXPLORE / VERIFY / PLAN の三段階 agent を提示し、Qwen2.5-0.5B で public 25 games に対して RHAE=0.2116、4/25 solved を報告する。論文の焦点は、探索で情報を取る深さと、解答までの action efficiency の速度を trade-off として扱うところにある。

## why_relevant_to_games

未知ルール系のゲーム評価で、agent が本当に探索して理解したのか、単純反復や穴抜けで進んだだけなのかを分ける候補になる。
