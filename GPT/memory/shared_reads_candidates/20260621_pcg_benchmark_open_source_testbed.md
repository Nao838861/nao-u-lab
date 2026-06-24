---
title: "The Procedural Content Generation Benchmark: An Open-source Testbed for Generative Challenges in Games"
url: "https://arxiv.org/abs/2503.21474"
collected_at: "2026-06-21T04:29:49+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, benchmark, procedural-generation, evaluation, game-ai]
evaluated_at: "2026-06-21T04:32:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781984368.714359"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368714359"
  char_count: 3906
  posted_at: "2026-06-21T04:39:32.3973979+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T04:39:32.3973979+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368714359"
next_action: none
stale_after: "2026-07-21"
supersedes: []
gate_reason: |
  quality / diversity / controllability を分ける評価枠が明確で、生成物を「面白さ」以前に検査する実装観点へ落とせる。
  12 種類の game-related problem と共通 testbed という具体性があり、Nao_u の PCG probe や自動評価ログ設計に直接接続できる。
suggested_post_outline:
  overview_angle: "PCG Benchmark を、生成 AI の創造性判定ではなくゲーム生成物の最低限の検査台として読む。"
  analysis_axis: "共通インターフェース、quality / diversity / controllability、問題ごとの評価関数、スコア解釈の限界を整理する。"
  application_target: "レベル・ルール・配置・パターン生成を導入する前の headless probe と回帰テスト設計に効く。"
  pros_cons: "比較可能性と検査軸は強いが、スコアは面白さや完成度の代替ではなく、評価関数への適合に留まる。"
  verdict_pre: "採用。ゲーム制作サイクルの生成物評価チェックリストとして使う。"
---

## raw_excerpt
原文の短い引用: "quality, diversity, and controllability" / "12 game-related problems"。

FDG 2025 の PCG Benchmark 論文。ゲーム向け生成アルゴリズムを、単発の level generator や個別論文ごとの評価関数で比べるのではなく、共通インターフェースを持つ open-source testbed に載せる。初期状態で 12 種類の game-related problem を含み、レベル生成だけでなく、simple arcade game の rule set、building、word game、pattern なども対象にする。各問題は content representation、control parameter、quality、diversity、controllability の評価基準を持ち、生成物ごとに 0 から 1 の近さも返せる。これにより search-based PCG、quality diversity、PCGML、PCGRL、constraint-based generation などを同じ枠で試せる。著者らは、最高点を取ったから創造性の問題が解けたわけではなく、その問題設定と評価基準では解けたという意味だ、と明示している。

## why_relevant_to_games
Nao_u のプロトタイプで生成要素を入れる時、面白さ評価に飛ぶ前の最低限の検査軸として quality / diversity / controllability を使える。生成結果を headless probe に載せる設計にもつながる。
