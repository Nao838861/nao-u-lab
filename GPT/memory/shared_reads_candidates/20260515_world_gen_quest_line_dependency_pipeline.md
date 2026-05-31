---
title: "From World-Gen to Quest-Line: A Dependency-Driven Prompt Pipeline for Coherent RPG Generation"
url: https://arxiv.org/abs/2604.25482
collected_at: 2026-05-15T17:14:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [narrative-design, rpg, llm-pipeline, procedural-content-generation, structured-output]
evaluated_at: 2026-05-15T17:21:41+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T17:30:14+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |
  world、NPC、player character、campaign quest、quest expansion を structured JSON で段階接続する中核が明確で、coherence を data flow と schema で支える論点がある。
  RPG 生成に限らず、ゲーム仕様を一気に作らず中間表現と破綻確認点に分ける設計へ適用できる。
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778833809466169"
next_action: none
posted:
  ts: "1778833809.466169"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778833809466169"
  char_count: 4132
  posted_at: "2026-05-15T17:30:14+09:00"
suggested_post_outline:
  overview_angle: "LLM に物語を丸投げする話ではなく、依存関係付き JSON pipeline で一貫性を守る生成設計として書く。"
  analysis_axis: "各段階の出力が次段の入力になる data flow、schema、structural completeness / consistency / diversity / actionability の評価。"
  application_target: "NPC、目的、ステージ条件、報酬、イベント条件を分割生成し、途中で検査する制作フロー。"
  pros_cons: "破綻箇所を見つけやすい一方、schema 設計が浅いと形式だけ整った凡庸な生成になる。"
  verdict_pre: "部分採用"

---

## raw_excerpt
短い原文句: "dependency-aware" / "structured JSON outputs" / "narrative coherence"。

メモ: 2026-04-28 投稿の arXiv 論文。RPG の world building、NPC 作成、player character 作成、campaign-level quest planning、quest expansion を段階分解し、各段階が前段の structured JSON output に依存する prompt pipeline を試す。狙いは、単発生成で崩れやすい一貫性・制御性・構造的整合性を、明示的な data flow と schema で支えること。評価は複数 independent run への qualitative / human-centered analysis で、structural completeness、internal consistency、diversity、actionability などを見る。

## why_relevant_to_games
物語生成そのものだけでなく、ゲーム仕様を「前段出力に依存する小さな中間表現」に分ける材料になる。NPC、目的、ステージ条件、報酬を一気に生成せず、破綻確認点を挟む設計に使えそう。
