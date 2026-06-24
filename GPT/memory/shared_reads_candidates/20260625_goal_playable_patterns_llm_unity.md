---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101v4"
collected_at: "2026-06-25T07:29:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm, executable-synthesis, unity, design-patterns]
evaluated_at: "2026-06-25T07:52:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-25T07:52:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-25T07:52:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-25"
supersedes: []
gate_reason: "ゲームデザインパターンから Unity の実行可能成果物へ落とす問題設定が、Nao_u_BOT の playable diff 化サイクルに直結する。IR あり/なしの比較、26パターン、Unity replay によるコンパイル確認、grounding failure まで抽出でき、4000字概要の骨格が立つ。"
suggested_post_outline:
  overview_angle: "抽象的な gameplay pattern を、そのままコード生成させるのではなく、Unity 向け中間表現を挟んで実行可能性と意味保持を評価した研究として書く。"
  analysis_axis: "goal pattern / Goal Playable Concept / human-authored IR / direct generation 比較 / Unity replay / grounding と hygiene failure の分解。"
  application_target: "ゲーム案を playable diff に変換する前段で、目的・制約・エンジン構造を分けた仕様カードを作る運用に効く。"
  pros_cons: "利点は抽象案から実装までの失敗箇所を観測できること。弱点は Unity 前提と人手 IR への依存で、完全自動生成の証明ではないこと。"
  verdict_pre: "部分採用。アイデア生成ではなく、実装前の中間表現と失敗分類を取り込む。"
---

## raw_excerpt
arXiv abstract notes:

The paper frames the translation of gameplay ideas into runnable artifacts as a constrained executable synthesis problem. Gameplay design patterns are used as structured representations for gameplay phenomena, with goal patterns describing player-objective relationships. The authors define Goal Playable Concepts as Unity implementations of those abstractions, then test whether LLMs can generate Unity code conditioned by those patterns while satisfying both engine-level structure and gameplay semantics.

The experiment uses 26 goal pattern instantiations and compares direct natural-language-to-C# generation with pipelines that use a human-authored Unity-specific intermediate representation. Compilation success is checked through automated Unity replay. The paper reports grounding and hygiene failure modes, with structural and project-level grounding named as primary bottlenecks.

Source lines: arXiv metadata and abstract, submitted 2026-03-07 and revised 2026-04-30.

## why_relevant_to_games
Nao_u_BOT のゲーム制作で「抽象アイデアを playable diff に落とす」時、自然文から直接実装するより、目標・制約・ルール・エンティティを中間表現に分ける候補として使える。
