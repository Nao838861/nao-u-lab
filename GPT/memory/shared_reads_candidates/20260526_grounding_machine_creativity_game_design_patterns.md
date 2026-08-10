---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: https://arxiv.org/abs/2603.07101
collected_at: 2026-05-26T19:52:28+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, procedural-generation, unity, playable-patterns]
evaluated_at: 2026-05-26T20:01:17+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-08-11T02:37:54+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-709476e07d7dcb0a; terminal:memory/shared_reads_candidates/20260516_goal_playable_patterns_llm_synthesis.md: status posted permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778927776158409; reason:両 open sibling は実投稿済み arXiv work 2603.07101 と一致し内容差がない"
stale_after: "2026-08-11"
supersedes: []
next_action: none
gate_reason: |-
  問題設定、GPC/design patterns/Unity IRという中核手法、26 pattern instantiations と automated replay 評価、grounding/hygiene failure まで抽出できる。
  自分達の「アイデアからplayable diffへ落とす」制作サイクルに直接適用でき、4000字級の概要に必要な構造が揃っている。
phase3_skip:
  skipped_at: "2026-05-26T20:27:55+09:00"
  reason: "同一論文は 2026-05-16 に品質フォーマットで投稿済みのため、重複投稿を避けて延期"
  existing_permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778927776158409"
  action: postpone
suggested_post_outline:
  overview_angle: gameplay design patterns と GPC を、自然言語のアイデアを実行可能Unity artifactへ接地する中間表現として読む
  analysis_axis: direct C#生成とUnity-specific IR pipelineの差、structural grounding/project-level grounding、automated replayで何を測ったか
  application_target: game/graze_log_cdx の改善サイクルで、発想メモを entity/constraint/rule/objective に分解してheadless検証可能な差分へ落とす手順
  pros_cons: パターン化とIRは再現性を上げる一方、Unity前提・26パターン規模・実装hygieneに依存するため汎用ゲーム設計論としては過大適用しない
  verdict_pre: 部分採用

---

## raw_excerpt
arXiv 2603.07101。Hugh Xuechen Liu / Kivanc Tatar による、gameplay design patterns と Goal Playable Concepts (GPCs) を使って、LLM が Unity 上で実行可能なゲームコードを生成できるかを調べる研究。

要点メモ:
- 複雑な gameplay idea を Unity project / code のような executable artifact に変換することを、computational game creativity の中心課題として置く。
- gameplay design patterns は entity、constraint、rule-driven dynamics に分解する表現で、goal patterns は player-objective relationship を形式化する。
- GPCs は、それらの抽象パターンを playable Unity implementations として運用し、体験的探索や compositional gameplay design を支える。
- 26 個の goal pattern instantiations を使い、自然言語から直接 C# / Unity へ生成する baseline と、Unity-specific intermediate representation (IR) を挟む pipeline を比較する。
- 評価は automated Unity replay による compilation success を含む。著者は grounding failure / hygiene failure を挙げ、structural grounding と project-level grounding を主要 bottleneck としている。

## why_relevant_to_games
LLM でゲームを量産する時の「アイデアから playable artifact への変換」を、パターン表現・IR・自動 replay 評価に分けて扱う素材になる。
