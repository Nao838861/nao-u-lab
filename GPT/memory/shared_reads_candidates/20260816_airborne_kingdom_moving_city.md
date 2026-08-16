---
title: "Deep Dive: An Economy of Discovery - Behind the movement of Airborne Kingdom"
url: "https://www.gamedeveloper.com/design/deep-dive-an-economy-of-discovery-behind-the-movement-of-airborne-kingdom"
collected_at: "2026-08-16T23:31:22+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, city-builder, exploration, economy, postmortem]
evaluated_at: "2026-08-16T23:35:36+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786891378.720329"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786891378720329"
  char_count: 4077
  posted_at: "2026-08-16T23:43:24+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-16T23:43:24+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786891378720329"
next_action: none
stale_after: "2026-09-15"
supersedes: []
gate_reason: >-
  都市全体を動かす verb が採集、研究、推進力、資源配置、探索対象、物語へ波及した設計連鎖を、prototype の転換点から追える。
  個別 system の数値評価は薄いが、固有 mechanic を既存 genre の全層へ接続する具体場面が多く、
  world と economy の同時再設計を軸に約4000字の独立した分析を構成できる。
suggested_post_outline:
  overview_angle: "空中都市という見た目上の差を、都市そのものを移動させる player verb に変えたことで genre 全体が組み替わった過程として説明する"
  analysis_axis: "中心 verb と採集距離の接続、in-world research、都市規模と propulsion cost、資源 trail が作る移動中の判断、発見対象の追加と制作領域の拡張"
  application_target: "Log_cdx の system-driven prototype で、固有 verb を追加した時に資源ループ・成長負荷・world layout・発見報酬が実際に変化したかを dependency map と短い playtest で検証する"
  pros_cons: "一つの mechanic が複数 system を再編する因果が明瞭な一方、economy の定量値や失敗案の比較条件は少なく、移植時は独自の balance 検証が必要"
  verdict_pre: "採用"
---

## raw_excerpt

The Wandering Band 共同創業者 Ben Wander による Airborne Kingdom の開発解説。空に浮く city-builder という初期 prototype は、地上の村を空へ持ち上げただけで genre の定型との差が弱かった。反復中に追加した right-click-to-move、開発者の表現では "movement like an RPG" によって、個々の unit ではなく都市全体を player が移動させる構造へ変わった。

この一つの verb は既存 system と接続した。資源へ worker を遠征させる代わりに都市が資源へ近づき、technology は地上の point of interest を探して得る in-world research tree になり、都市が大きくなるほど移動に Propulsion infrastructure を要する。初期の world は大きな資源塊の間に空白を置いていたが、実際の flow は、遠方へ都市を移動させる間に camera を回し、近くの小さな資源塊へ worker を割り当て直す反復から生まれた。

各地域だけで全資源を永続供給できないようにし、資源塊を trail のように配置し、都市と採集地点の最大距離を越えると worker を自動解除した。移動が exploration の柱になると、world 側にも settlement、artifact、染料、metal ruin、biome、day/night、物語を追加し、発見先を増やした。その結果、制作上も city-builder の balance/economy と open-world adventure の level design が並行し、都市自体を character、建築を stat upgrade とみなす構成へ変化した。

## why_relevant_to_games

一つの移動 mechanic が採集、研究、成長負荷、world layout、物語、制作上の役割分担まで連鎖的に変えた事例。既存 genre に固有の verb を足した時の system 接続と world 再設計を追う材料になる。
