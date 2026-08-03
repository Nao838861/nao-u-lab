---
title: "Postmortem: The singular design of Namco's Katamari Damacy (2004)"
url: "https://www.gamedeveloper.com/design/postmortem-the-singular-design-of-namco-s-katamari-damacy-2004-"
collected_at: "2026-08-03T11:48:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mechanics, postmortem, prototyping, interaction-design]
evaluated_at: "2026-08-04T01:05:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-04T01:14:27.564479+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785773667564479"
next_action: none
posted:
  ts: "1785773667.564479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785773667564479"
  char_count: 4055
  posted_at: "2026-08-04T01:14:27.564479+09:00"
stale_after: "2026-09-03"
supersedes: []
gate_reason: >-
  単一の成長動詞を守るためにpower-upや別目的を退け、配置、音、振動、camera、memory制約をprototypeで調整した判断と未解決点が揃っている。
  成功談だけでなくscale感の消失や物理・時間制限の妥協も評価でき、操作感設計と制作判断を約4000字で立体的に分析できる。
suggested_post_outline:
  overview_angle: "『転がして大きくする』一動詞を中心に、入力、配置、感覚feedback、scale、技術制約を統合した設計を分解する"
  analysis_axis: "追加要素の多さではなく、中心動詞を目的のまま保つ棄却判断と、scale変化を身体感覚へ伝える複数channelの役割"
  application_target: "一動詞型prototypeで、別目標が中心動詞を手段化していないか、音・振動・camera・配置が同じ感触を補強するかを検証する"
  pros_cons: "明快な操作核と豊かなscale感を両立する一方、camera、物理、memory制約が体験の連続性を損なう限界もある"
  verdict_pre: "採用"
---

## raw_excerpt

Game Developer が2004年12月号の記事を2024年に再掲した、Keita Takahashi による『Katamari Damacy』のポストモーテム。プレイヤーは左右の analog stick だけで塊を転がし、物を巻き込んで5cm級から500m超まで大きくする。full development 前に prototype を作り、map design、object placement、memory 制約、目標寸法へ達する時間を、実際に object を置いて巻き込む trial-and-error で調整した。

開発初期から power-up を入れず、“roll stuff and make it bigger” という一つの操作に留めた。特定の大物を巻き込む mission も検討したが、それが主目的になると巨大化が単なる手段へ変わるため採用しなかった。連続取得は数値 combo ではなく花火・紙吹雪・星で示し、取得音と controller vibration も転がす感触に使った。一方、巨大化すると小さかった時の記憶が薄れ、scale の変化を十分感じられないこと、衝突で300mから2mまで崩れる案が object の吸収・memory 削除と両立しなかったこと、camera の自動 zoom-out が巨大感と3D酔いの両方に課題を残したことを挙げる。細長い物を巻くと不規則に転がる物理や、time limit を外せなかった点も未完の論点として記録されている。

## why_relevant_to_games

一つの入力と成長動詞を維持しつつ、scale、配置、触覚・音、camera、制約が同じ体験へどう寄与したかを調べる mechanics prototype と操作感設計の資料になる。
