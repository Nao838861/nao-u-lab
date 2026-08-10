---
title: "How I created a procedural city"
url: "https://dellywelly.itch.io/city-generator/devlog/475849/how-i-created-a-procedural-city"
collected_at: "2026-08-11T00:32:56+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, procedural-generation, level-design, unity, world-building]
---

## raw_excerpt

Unity 上で procedural city を生成する工程の記録。作者は random points から Voronoi diagram を作り、cell の polygon を街区の大枠にした。道路幅を揃えるため、各 polygon の外周点を平均中心へ寄せて cell 間に均等な隙間を作ったが、数学的には毎回異なる city でも「同じような polygon の集まり」に見えた。そこで十分な広さを持つ一部 cell を分割し、acute angle が多く building algorithm を壊す形状を避けながら、lane、alley、avenue に相当する街区差を足した。

building は cell 外周を footprint とし、random curve で高さと外形を決めた。全 curve を大胆に乱すと制御しづらいため、複数 curve のうち一つだけを “interesting” な広い範囲、残りを安全で狭い範囲にする折衷を採った。各 floor の高さは curve を step 評価して求め、single thread で runtime 生成する都合から粗い step を使い、結果を目的高さへ clamp した。窓の等間隔配置には curve だけでは精度と速度が足りず、角を curve、側面を straight line として ring を組み、straight segment 上へ窓を補間している。

## why_relevant_to_games

procedural generation を「乱数を増やす」問題にせず、構造の大枠、局所的な逸脱、安全域、表示上必要な規則性を別々に制御する world / level generator の設計例になる。
