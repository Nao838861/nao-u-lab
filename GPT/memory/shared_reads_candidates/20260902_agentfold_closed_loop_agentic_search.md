---
title: "AgentFold: Closed-Loop Agentic Search for Protein Folding Model Design"
url: "https://arxiv.org/abs/2608.26747v2"
collected_at: "2026-09-02T06:48:13+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, closed-loop-search, code-generation, evaluation, memory, game-development]
---

## raw_excerpt

arXiv の要旨を基にした日本語採取メモ。AgentFold は、文献推論や実験計画に留まらず、相互依存の大きい機械学習システムを、実行可能なコード変更と高コストな検証を通じて自律改善できるかを、タンパク質折り畳みモデルで扱う。ESMFold を起点に、複数 agent が仮説提案、コード実装とデバッグ、model variant の評価、結果解釈を閉ループで回し、成功した介入だけでなく失敗した介入も構造化 memory に保存する。探索資源は MCTS 風 policy により、高い評価を得た branch へ配分する。対象は 2,000 行を超える engineering-scale codebase で、約 80 variant、約 5,000 GPU 時間、1.7 億 LLM token を用いた。同一計算 budget では、独立した Codex proposal より best lDDT を 7.5% 改善し、random-search control も上回ったと報告する。介入 trace からは、早期に入る柔らかく学習可能な prior と gated refinement は安定した改善につながりやすい一方、直接的な幾何摂動や geometry-conditioned feedback は training を不安定にしやすいという反復 pattern が抽出された。

## why_relevant_to_games

ゲーム prototype の大規模改修を、仮説・実装・実行評価・失敗記録・次 branch 選択の閉ループとして扱う際の外部事例になる。高コストな候補を無差別に試さず、成功と失敗の trace を次の playable variant 探索へ戻す構成を比較できる。
