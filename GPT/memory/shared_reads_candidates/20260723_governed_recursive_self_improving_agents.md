---
title: "How to Realize Recursively Self-Improving Agents and Personal Singularity: A Goal-, Scope-, Tool-, and Benchmark-Driven Multi-Agent Architecture"
url: "https://arxiv.org/abs/2607.12254"
collected_at: "2026-07-23T06:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm-agents, agent-architecture, evaluation, memory]
evaluated_at: "2026-07-23T06:48:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-23T06:48:41+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-23T06:48:41+09:00"
next_action: revise_or_research
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  短い実行 loop と evidence-gated improvement loop、外部 governance plane の分離は、ゲーム制作 agent と playtest harness の改善受入れに具体適用できる。
  ただし候補は現行 v2 の題名と self-model / Auto-Index / Personal Singularity OS の追加を反映せず、position paper のため実験・実装による評価結果もない。現状では CoopEval 水準の概要に必要な出典整合性と評価の中身が不足する。
---

## raw_excerpt

Chengshuai Yang による2026年7月の position / systems-design paper。LLM agent の状態を、model parameter、runtime policy / prompt、memory、再利用可能な skill / tool、goal stack、外部から強制される permission、evaluation evidence、version / lineage metadata の組として表す。agent 自身が変更候補を提案できる部分と、permission、evaluator policy、audit record、release signature、shutdown mechanism のように外部保護され、直接変更できない部分を分離する。

各 specialist agent は goal contract、bounded scope、validated tool registry、tool-level test、end-to-end benchmark、owner-controlled autonomy policy、routing policy、memory、improvement policy を持つ。実行系は、短い planner–executor–verifier loop と、経験から変更候補を作り evidence gate を通して採用する遅い improvement loop に分かれ、さらに authorization、evaluation、release、rollback を担当する external governance plane を置く。scope 外の task は一つの accountable agent へ構造化 handoff し、必要なら niche agent を作る。

論文は tool 単体の validation と agent 全体の benchmark を分け、hidden / rotating partition、versioned release、provenance、rollback を改善受け入れの構成要素として扱う。また、単なる出力修正、固定された reflection prompt の反復、memory / skill の更新、source-level modification、将来の改善機構そのものを変える meta-improvement を別階層として整理する。実験 dataset や reference implementation の報告ではなく、architecture、safety invariant、benchmark design、implementation roadmap を提示する概念設計である。

## why_relevant_to_games

ゲーム制作 agent と自動 playtest agent を、短い「実装→実行→検証」loop と、評価済み経験だけを skill・memory・harness 改修へ反映する遅い loop に分ける設計資料になる。ゲーム固有 tool の単体 test、end-to-end の playable benchmark、失敗時 rollback、担当外 task の handoff を同じ version / provenance 枠で記録する場面に接続できる。
