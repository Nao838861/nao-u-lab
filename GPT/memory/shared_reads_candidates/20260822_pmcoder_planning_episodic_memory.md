---
title: "Coupling Planning with Episodic Memory in LLM Agents for Software Issue Resolution"
url: https://arxiv.org/abs/2608.06811
collected_at: "2026-08-22T18:30:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, episodic-memory, planning, software-engineering, game-development-workflow]
evaluated_at: "2026-08-22T18:34:29+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-22T18:34:29+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-22T18:34:29+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-21"
supersedes: []
gate_reason: >-
  planning と episodic memory の双方向結合、execution evidence による検証、stuck 検知から再計画までの中核が具体的で、複数モデル・ablation・trajectory analysis の評価も揃う。
  ゲーム制作の長期実装や不具合修正で、phase 別 recall、失敗反復の検出、playable diff の実行証拠による完了判定へ直接写せ、CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "長い修正 episode を、計画と記憶を別々に足す問題ではなく、相互に制御する閉ループとして捉える"
  analysis_axis: "phase-conditioned retrieval、trajectory statistics による stuck detection、execution-grounded verification の因果関係と ablation の証拠"
  application_target: "Log_cdx のゲーム実装・不具合修正サイクルにおける phase 別 recall、失敗 edit の反復検知、playable diff とテスト結果による完了判定"
  pros_cons: "長期作業の迷走と自己申告完了を減らせる一方、coding benchmark の改善をゲーム設計品質へそのまま一般化できず、記憶抽出・統計更新・検証 harness の運用コストが増える"
  verdict_pre: 部分採用
---

## raw_excerpt

Jiahao Zhang、Yifan Zhang、Yu Huang による arXiv:2608.06811（2026年8月7日投稿）。実際の software issue 解決は、探索、仮説、実装、検証をまたぐ数十〜数百 step の長い repair episode であり、base model の局所推論だけでなく、変化する plan の維持と phase を越えた observation の記憶を必要とする。既存の repository-level agent は planning と memory の一方だけを強化することが多く、古い evidence、失敗 edit の反復、実行結果ではなく agent 自身の完了申告に基づく verification が残るとする。

提案する PMCoder は hierarchical phase planner と episodic memory を双方向に結合する。現在の plan phase が memory retrieval の条件となり、memory から得た trajectory statistics が stuck detection と replanning に使われる。issue reproduction の verdict が得られる場合は、self-report ではなく execution evidence で verification progress を接地する。SWE-bench Verified では harness-matched baseline より平均25件、5.0 percentage point 多く解決し、Verified-500 でも Claude Haiku 4.5、DeepSeek-V4-Flash、OpenHands port にわたり最低14件、2.8 point の増加を報告する。ablation と trajectory analysis では、planning-memory coupling が各 component 単独を上回り、repeated failed action、empty-patch exit、context-window exhaustion を減らしたとしている。

## why_relevant_to_games

複数 phase にまたがるゲーム実装・不具合修正で、現在の制作段階に応じて過去の観測を取り出し、失敗反復や自己申告だけの完了判定を避ける agent workflow を考える資料になる。
