---
title: "Postmortem: Chris Chung's Catlateral Damage"
url: https://www.gamedeveloper.com/audio/postmortem-chris-chung-s-catlateral-damage
collected_at: "2026-08-22T14:31:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, indie-development, scope-management, procedural-generation, playtesting]
---

## raw_excerpt

Chris Chung は、2013年の 7DFPS game jam で作った一室だけの猫視点 prototype を、約1年9.5か月かけて製品版へ発展させた。初期版の核は、左右移動、moon jump、視点移動に連動した前足で室内の物を床へ落とすことだった。報道で注目を得た後に Kickstarter を実施し、目標4万ドルに対して61,944ドルを集めた。支援者の猫写真や playable cat を報酬に組み込み、資金の約3分の1をこの個人的な参加型 reward が占めたという。

開発では、資金が尽きる前に出荷するため scope を管理し、third-person view、multiplayer、level editor、猫ごとの能力などを切った。手作り level の少量構成から procedural generation へ切り替え、単純な mechanics、low-poly cel-shaded art、共通 texture と shader によって content integration を軽くした。一方、最短で完成させることを優先した結果、core gameplay と metagame の設計が遅れた。premade room の puzzle、roguelike 的な locked room と upgrade、open house と side objective を経て、最終的には high score と機能を持たない unlockable を備えた単純な infinite-runner 構造へ縮小した。

著者は、猫として物を落とす着想と collectible だけでは10分以上の遊びを支えられず、体験が toy に近くなったと振り返る。大量の object も player にとっては同じ「床へ落とす物」で、各 play session にほぼ全 content が露出したため、発見や差異が薄かった。weight や friction、object 同士の吸着・反発、moving target など、見た目ではなく機械的に異なる interaction を増やす案を挙げている。終盤には正式 QA と meetup での playtest を削り、致命的 bug は避けられたものの、設計上の問題や非致命的 bug を捕まえる機会を失った。polish も後回しになり、context に応じて拾う・噛む操作を示す crosshair のような小さな feedback を、もっと積み重ねたかったとしている。

## why_relevant_to_games

短期 prototype の強い一発ネタを製品へ伸ばす時、content の物量と機械的な差異、toy と game の境界、scope 削減と core design／playtest／polish の削減を区別する材料になる。
