---
title: "Procedural Generation of First Person Shooter Maps using Map-Elites"
url: "https://arxiv.org/abs/2605.30570"
collected_at: "2026-06-21T06:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, map-elites, level-design, fps, evaluation]
evaluated_at: "2026-06-21T06:49:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T07:20:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781992758045369"
next_action: none
stale_after: "2026-07-21"
supersedes: []
posted:
  ts: "1781992758.045369"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781992758045369"
  char_count: 4499
  posted_at: "2026-06-21T07:20:00+09:00"
gate_reason: |
  MAP-Elites/MESB、FPS map representation、topological/emergent properties、diversity/quality 比較が要旨段階で揃っており、手法の重要要素を抽出できる。
  Nao_u_BOT の headless 評価や PCG prototype で、単一スコア最適化ではなく特性空間を埋める設計に具体的に接続できる。
  Phase 3 で CoopEval 水準の概要を書くには、表現差分と評価軸を中心に構成すれば十分な密度を出せる。
suggested_post_outline:
  overview_angle: "FPS map generation を題材に、MAP-Elites が何を照らすべきかを map representation と feature selection の問題として読む。"
  analysis_axis: "All-Black / Grid-Graph / Point-Line / Spatial-Layout の表現差、topological properties と gameplay emergent properties の分離、MESB による quality-diversity 探索を軸に分析する。"
  application_target: "PCG や headless playtest で、生成物を平均スコアだけで選ばず、構造特徴とプレイ時に現れる特徴を分けて coverage を見る評価設計に使う。"
  pros_cons: "メリットは多様性と品質を同時に扱える点。デメリットは gameplay emergent property の評価にシミュレーション/プレイログが必要で、評価コストと feature 設計の恣意性が残る点。"
  verdict_pre: "部分採用。FPS map 手法そのものより、representation と evaluation feature を分けて MAP-Elites に渡す設計を採用候補にする。"
---

## raw_excerpt

arXiv:2605.30570。2026-05-28 submitted。Simone de Donato, Pier Luca Lanzi, Daniele Loiacono による FPS map generation 論文。要旨では、MAP-Elites を First-Person Shooter の level design に適用し、既存表現の All-Black / Grid-Graph に加えて Point-Line / Spatial-Layout という新しい map representation を導入するとしている。

論文は map を評価する特徴量を、layout だけで決まる topological properties と、実際の gameplay を通して評価する emergent properties に分ける。そのうえで MAP-Elites の illumination process を導く feature として何が適するかを分析し、Sliding Boundaries 付き MAP-Elites で FPS map population を進化させる。要旨上の結論は、新しい表現が従来の FPS map evolution 表現より高い diversity と quality を持つ map を生成できる、というもの。

## why_relevant_to_games

FPS そのものだけでなく、Nao_u_BOT の headless 評価で「単一スコアではなく特性空間を埋める」発想を使う時の追加材料になる。Talakat の弾幕 MAP-Elites と比較して、level topology と gameplay emergent property を分ける観点が使えそう。
