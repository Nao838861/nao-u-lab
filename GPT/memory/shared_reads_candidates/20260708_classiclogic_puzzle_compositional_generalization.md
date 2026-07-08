---
title: "ClassicLogic: A Knowledge-Driven Benchmark of Classic Puzzle Games for Evaluating Compositional Generalization"
url: "https://arxiv.org/abs/2607.05185"
collected_at: "2026-07-08T17:45:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [puzzle, benchmark, compositional-generalization, agent-evaluation, game-ai]
evaluated_at: "2026-07-08T17:48:30+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-08T17:48:30+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-08T17:48:30+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  puzzle agent の失敗を正解率ではなく strategy hierarchy と compositional depth で分解する点が明確で、手法の中核を説明できる。
  puzzle の難易度設計、hint、tutorial、agent playtest の診断に直接接続でき、4000字級の概要に耐える構造がある。
suggested_post_outline:
  overview_angle: "古典パズルを使い、知識階層と合成汎化で agent の理解段階を診断する benchmark として書く"
  analysis_axis: "Entity / Relational / Procedural Composition、strategy-driven generation、validated difficulty scaling、unique solution 保証"
  application_target: "パズル制作で、どの戦略階層でプレイヤーや agent が詰まるかを難易度・ヒント設計に戻す評価軸"
  pros_cons: "診断性は高いが、対象は古典論理パズル寄りで、アクション性や曖昧な affordance を持つ作品には追加設計が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt
ClassicLogic は、Sudoku、KenKen、Kakuro、Futoshiki の4種類の classic logic puzzle を使い、agent が基本ルールを覚えるだけでなく、明示的な strategy knowledge base から複合手順を学び、組み合わせ、転移できるかを測る benchmark。各 game base には hierarchical knowledge base があり、複雑な solving strategy はより単純な strategy の composition として定義される。論文は、Entity Composition、Relational Composition、Procedural Composition の3種を分けて評価できる点を主張している。設計原則として、初期盤面を symbolic matrix ではなく MNIST digit image で提示する Perceptual Grounding、特定の最小 strategy set を必要とする instance を作る Strategy-Driven Generation、strategy の compositional depth に連動する Validated Difficulty Scaling、すべての puzzle instance に unique solution を保証する Guaranteed Uniqueness を挙げる。通常の CSP solver のように最終解だけを高速に出すのではなく、agent が人間に理解可能な戦略を学び、どこで失敗したかを診断することを狙う。

## why_relevant_to_games
パズルゲームの難易度設計や tutorial / hint 設計で、単なる正解率ではなく「どの戦略階層で詰まったか」を測る候補になる。
