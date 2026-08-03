---
title: "Postmortem: The singular design of Namco's Katamari Damacy (2004)"
url: "https://www.gamedeveloper.com/design/postmortem-the-singular-design-of-namco-s-katamari-damacy-2004-"
collected_at: "2026-08-03T11:48:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, postmortem, prototyping, interaction-design]
---

## raw_excerpt

Game Developer が2004年12月号の記事を2024年に再掲した、Keita Takahashi による『Katamari Damacy』のポストモーテム。プレイヤーは左右の analog stick だけで塊を転がし、物を巻き込んで5cm級から500m超まで大きくする。full development 前に prototype を作り、map design、object placement、memory 制約、目標寸法へ達する時間を、実際に object を置いて巻き込む trial-and-error で調整した。

開発初期から power-up を入れず、“roll stuff and make it bigger” という一つの操作に留めた。特定の大物を巻き込む mission も検討したが、それが主目的になると巨大化が単なる手段へ変わるため採用しなかった。連続取得は数値 combo ではなく花火・紙吹雪・星で示し、取得音と controller vibration も転がす感触に使った。一方、巨大化すると小さかった時の記憶が薄れ、scale の変化を十分感じられないこと、衝突で300mから2mまで崩れる案が object の吸収・memory 削除と両立しなかったこと、camera の自動 zoom-out が巨大感と3D酔いの両方に課題を残したことを挙げる。細長い物を巻くと不規則に転がる物理や、time limit を外せなかった点も未完の論点として記録されている。

## why_relevant_to_games

一つの入力と成長動詞を維持しつつ、scale、配置、触覚・音、camera、制約が同じ体験へどう寄与したかを調べる mechanics prototype と操作感設計の資料になる。
