---
title: "I Won't Be Abducted: a 63-hour postmortem"
url: "https://chrisdalbano.com/notes/i-wont-be-abducted-postmortem"
collected_at: "2026-08-23T00:31:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, scope-control, narrative-design, godot, ai-assisted-development]
evaluated_at: "2026-08-23T00:35:14+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-23T00:35:14+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-23T00:35:14+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  63時間という制約下で、do-not-build、economy の draft 化、data-driven tuning、表現制約と終幕の統合を行った因果が具体的である。
  成功だけでなく roster・telegraph・voice scope の遅延も評価でき、短期ゲーム制作への適用条件と単一事例の限界を含む約4000字の分析を構成できる。
suggested_post_outline:
  overview_angle: "一つの終幕を正本にし、機能・調整負債・表現コストを63時間の出荷可能範囲へ切り詰める設計"
  analysis_axis: "do-not-build と mid-jam cut が探索空間をどう狭め、data/signals/standee が残り時間を調整と narrative payoff に変えたか"
  application_target: "Log_cdx の短期プロトタイプで、着手前の禁止項目、最小盤面、economy 縮約、初期 enemy からの fairness probe を同じ playable milestone に束ねる"
  pros_cons: "scope と物語を同じ制約で強化できる一方、作者の自己報告1件で比較実験がなく、draft の自己均衡性や AI 補助の寄与は一般化しすぎない"
  verdict_pre: 部分採用
---

## raw_excerpt

作者 Christian D'Albano が Wavedash Spring Jam 26 の約63時間で完成させた、3夜構成の tabletop-defense game のポストモーテム。制作前に must ship / stretch / **do not build** の3列を作り、procedural map、combo system、free-roam pathfinding、4夜目を初日から禁止した。途中で Scrap を使う shop は、upgrade 価格と income pacing の二重の tuning debt を生むため、5枚の pool から3枚を提示して1枚選ぶ無料の dawn draft に置換。Godot の gameplay 数値を `.tres` resource に置き、終盤は script 編集ではなく調整へ時間を使った。tabletop standee という表現制約は walk cycle を不要にし、hop、lunge、knock-back、screen shake で動きを成立させつつ、終幕の種明かしにも接続した。一方、敵 roster と攻撃 telegraph の実装が最終日に寄り、balance と fairness の playtest 時間を失った。作者は、全 system を最後の一場面へ向けて切り詰めたことが、週末で完結した arc を出荷できた理由だと記している。

## why_relevant_to_games

短時間プロトタイプで「作らないもの」を先に固定し、調整負債の大きい economy を draft へ縮約する具体例。表現上の制約を制作コスト削減と narrative payoff の両方へ接続する設計例として参照できる。
