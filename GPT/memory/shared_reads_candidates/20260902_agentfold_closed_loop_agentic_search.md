---
title: "AgentFold: Closed-Loop Agentic Search for Protein Folding Model Design"
url: "https://arxiv.org/abs/2608.26747v2"
collected_at: "2026-09-02T06:48:13+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, closed-loop-search, code-generation, evaluation, memory, game-development]
evaluated_at: "2026-09-02T06:52:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-09-02T06:52:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-09-02T06:52:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-10-02"
supersedes: []
gate_reason: >-
  大規模で相互依存する system を実行可能な variant の閉ループ探索として扱う問題設定、仮説・実装・評価・構造化 memory・MCTS 風配分という中核、
  約80 variant／約5,000 GPU 時間／1.7億 LLM token と同一 budget の Codex proposal・random search 比較、改善／不安定化 pattern の結論が揃う。
  playable prototype の分岐探索へ具体化でき、指標差と莫大な計算費を限界として明示すれば CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "agent の自律性紹介ではなく、相互依存する codebase の改善を、実行可能な variant・高コスト評価・成功失敗 memory・探索予算配分の閉ループへ変換した事例として読む"
  analysis_axis: "独立 proposal と random search に対し、共有 trace と branch 選択がどのように探索効率と再利用可能な設計知識を生んだかを、計算 budget と介入 pattern の両面から検討する"
  application_target: "自分達の game prototype 大規模改修で、仮説ごとの playable branch、固定評価項目、失敗を含む variant ledger、次に試す branch の予算配分を一続きの探索 loop として運用する"
  pros_cons: "長所は engineering-scale codebase で実装・検証まで閉じ、比較対照と失敗知識を残した点。短所は約5,000 GPU 時間と1.7億 token を要し、lDDT の自動評価を主観的な面白さへ直接移せず、個々の component の因果寄与も分離しにくい点"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv の要旨を基にした日本語採取メモ。AgentFold は、文献推論や実験計画に留まらず、相互依存の大きい機械学習システムを、実行可能なコード変更と高コストな検証を通じて自律改善できるかを、タンパク質折り畳みモデルで扱う。ESMFold を起点に、複数 agent が仮説提案、コード実装とデバッグ、model variant の評価、結果解釈を閉ループで回し、成功した介入だけでなく失敗した介入も構造化 memory に保存する。探索資源は MCTS 風 policy により、高い評価を得た branch へ配分する。対象は 2,000 行を超える engineering-scale codebase で、約 80 variant、約 5,000 GPU 時間、1.7 億 LLM token を用いた。同一計算 budget では、独立した Codex proposal より best lDDT を 7.5% 改善し、random-search control も上回ったと報告する。介入 trace からは、早期に入る柔らかく学習可能な prior と gated refinement は安定した改善につながりやすい一方、直接的な幾何摂動や geometry-conditioned feedback は training を不安定にしやすいという反復 pattern が抽出された。

## why_relevant_to_games

ゲーム prototype の大規模改修を、仮説・実装・実行評価・失敗記録・次 branch 選択の閉ループとして扱う際の外部事例になる。高コストな候補を無差別に試さず、成功と失敗の trace を次の playable variant 探索へ戻す構成を比較できる。
