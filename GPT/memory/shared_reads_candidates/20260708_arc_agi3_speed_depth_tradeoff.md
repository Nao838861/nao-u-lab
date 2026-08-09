---
title: "Explore Before You Solve: The Speed--Depth Trade-off in Epistemic Agents for ARC-AGI-3"
url: "https://arxiv.org/abs/2605.25931"
collected_at: "2026-07-08T21:44:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, exploration, benchmark, harness]
evaluated_at: "2026-08-10T05:25:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-10T05:25:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-10T05:25:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  public 25 games の非知的攻略内訳、18 game の null-coordinate bypass、AERA の三段階構成と RHAE / solved 数が揃い、問題設定・手法・評価・結論を具体的に説明できる。
  ゲーム評価で「理解」と反復・exploit を分離し、探索予算と検証行動を設計する実用的な監査軸へ直接接続できる。
suggested_post_outline:
  overview_angle: "ARC-AGI-3 の公開ゲームを攻略成績ではなく benchmark validity から分解し、探索の深さと行動効率を同時に測る必要を説明する"
  analysis_axis: "blind repetition・probing・null-coordinate bypass と EXPLORE / VERIFY / PLAN を対比し、solve 判定が理解を保証しない構造を分析する"
  application_target: "headless playtest で exploit baseline、情報獲得行動、仮説検証、action budget を別メトリクスとして記録する評価 harness"
  pros_cons: "攻略率の偽陽性を発見できる一方、public set 固有の脆弱性と小規模 agent 結果を一般化しすぎる危険がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2605.25931。2026-05-25 submitted。著者は Liew Keong Han。

短い原文断片: "Explore Before You Solve" / "Speed--Depth trade-off" / "EXPLORE / VERIFY / PLAN"。

抄録メモ: この論文は ARC-AGI-3 の public 25 games を調べ、すべてが非知的な strategy でも到達可能であると報告する。内訳として、10 game は blind step、5 game は probing action 後、1 game は ACTION1 の反復、1 game は diverse exploration、8 game は十分な budget を持つ単一 action 反復で到達可能とされる。また null-coordinate vulnerability により 18 game が 1 step で bypass されるという benchmark validity の指摘も含む。その上で、AERA という EXPLORE / VERIFY / PLAN の三段階 agent を提示し、Qwen2.5-0.5B で public 25 games に対して RHAE=0.2116、4/25 solved を報告する。論文の焦点は、探索で情報を取る深さと、解答までの action efficiency の速度を trade-off として扱うところにある。

## why_relevant_to_games

未知ルール系のゲーム評価で、agent が本当に探索して理解したのか、単純反復や穴抜けで進んだだけなのかを分ける候補になる。
