---
title: "How I created a procedural city"
url: "https://dellywelly.itch.io/city-generator/devlog/475849/how-i-created-a-procedural-city"
collected_at: "2026-08-11T00:32:56+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, procedural-generation, level-design, unity, world-building]
evaluated_at: "2026-08-11T00:37:51+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-11T00:37:51+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-11T00:37:51+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  Voronoi の単調さ、鋭角による破綻、curve の制御困難、runtime 生成負荷という失敗条件に対し、分割・安全域・局所的逸脱・直線補間を対応させている。
  procedural generation の変化量を構造別に制御する実装例として world / level generator に移せ、手法と限界を含む~4000字の分析が成立する。
suggested_post_outline:
  overview_angle: "乱数の強さではなく、大枠・局所的逸脱・安全域・規則性を別々に制御して都市らしい差を作る設計"
  analysis_axis: "Voronoi 街区の縮小と分割、形状破綻の回避、複数 curve の制御幅、step 評価と clamp、窓配置の直線補間"
  application_target: "Log_cdx の procedural level prototype で、seed 差の見た目、生成失敗率、runtime budget、読める反復パターンを同時評価する生成器設計"
  pros_cons: "少数の制御軸で多様性と安定性を両立できる一方、中心への一様縮小や経験的な閾値は形状・規模が変わると再調整が要る"
  verdict_pre: "部分採用"
---

## raw_excerpt

Unity 上で procedural city を生成する工程の記録。作者は random points から Voronoi diagram を作り、cell の polygon を街区の大枠にした。道路幅を揃えるため、各 polygon の外周点を平均中心へ寄せて cell 間に均等な隙間を作ったが、数学的には毎回異なる city でも「同じような polygon の集まり」に見えた。そこで十分な広さを持つ一部 cell を分割し、acute angle が多く building algorithm を壊す形状を避けながら、lane、alley、avenue に相当する街区差を足した。

building は cell 外周を footprint とし、random curve で高さと外形を決めた。全 curve を大胆に乱すと制御しづらいため、複数 curve のうち一つだけを “interesting” な広い範囲、残りを安全で狭い範囲にする折衷を採った。各 floor の高さは curve を step 評価して求め、single thread で runtime 生成する都合から粗い step を使い、結果を目的高さへ clamp した。窓の等間隔配置には curve だけでは精度と速度が足りず、角を curve、側面を straight line として ring を組み、straight segment 上へ窓を補間している。

## why_relevant_to_games

procedural generation を「乱数を増やす」問題にせず、構造の大枠、局所的な逸脱、安全域、表示上必要な規則性を別々に制御する world / level generator の設計例になる。
