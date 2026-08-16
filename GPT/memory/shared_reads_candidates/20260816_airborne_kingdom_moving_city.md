---
title: "Deep Dive: An Economy of Discovery - Behind the movement of Airborne Kingdom"
url: "https://www.gamedeveloper.com/design/deep-dive-an-economy-of-discovery-behind-the-movement-of-airborne-kingdom"
collected_at: "2026-08-16T23:31:22+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, city-builder, exploration, economy, postmortem]
---

## raw_excerpt

The Wandering Band 共同創業者 Ben Wander による Airborne Kingdom の開発解説。空に浮く city-builder という初期 prototype は、地上の村を空へ持ち上げただけで genre の定型との差が弱かった。反復中に追加した right-click-to-move、開発者の表現では "movement like an RPG" によって、個々の unit ではなく都市全体を player が移動させる構造へ変わった。

この一つの verb は既存 system と接続した。資源へ worker を遠征させる代わりに都市が資源へ近づき、technology は地上の point of interest を探して得る in-world research tree になり、都市が大きくなるほど移動に Propulsion infrastructure を要する。初期の world は大きな資源塊の間に空白を置いていたが、実際の flow は、遠方へ都市を移動させる間に camera を回し、近くの小さな資源塊へ worker を割り当て直す反復から生まれた。

各地域だけで全資源を永続供給できないようにし、資源塊を trail のように配置し、都市と採集地点の最大距離を越えると worker を自動解除した。移動が exploration の柱になると、world 側にも settlement、artifact、染料、metal ruin、biome、day/night、物語を追加し、発見先を増やした。その結果、制作上も city-builder の balance/economy と open-world adventure の level design が並行し、都市自体を character、建築を stat upgrade とみなす構成へ変化した。

## why_relevant_to_games

一つの移動 mechanic が採集、研究、成長負荷、world layout、物語、制作上の役割分担まで連鎖的に変えた事例。既存 genre に固有の verb を足した時の system 接続と world 再設計を追う材料になる。
