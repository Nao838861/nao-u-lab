---
title: "Slick Speed: Post Mortem"
url: "https://itch.io/devlog/1439113/slick-speed-post-mortem.amp"
collected_at: "2026-08-24T03:31:12+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, game-jam, arcade, scope]
---

## raw_excerpt

記事の重要部分を日本語で採録する。『Slick Speed』は Bigmode Game Jam 2026 の10日間で制作された、固定画面・pixel art の arcade game。作者は普段の Unity 3D 制作から離れ、Unity 2D と Aseprite を初めて使った。pixel per unit を64に固定し、asset の64 pixelをengine上の1 unitへ対応させた。前回の7日間jamではscopeを広げすぎ、soundとUIをreleaseへ入れられなかったため、今回は木・金をbrainstorm / design / planning、土曜をmechanics prototype、日曜をmechanics確定、月〜水をloopのpolish・balance・bug fix・playtest、木・金をsound / UI、最終土曜をpolishと提出に割り当てた。bug fixとplaytestの一部は木曜へずれ込んだが、sound・UI・仕上げ専用日を先に確保していた。

操作はarrow keyまたはWASDによる移動だけで、片手で遊べる構成にした。入力を増やさない代わりに、障害物同士が衝突して元の軌道から外れる相互作用を入れた。この挙動はcollision codeのvelocityを試している途中で生まれ、playerから反応の多かった場面になった。時間を遅くしてgrid上に経路を描き、その経路で障害物を分断するpower-up、slick pointでskinを買うshop、phaseごとに形態が変わる障害物は期限内に入らずcutされた。

## why_relevant_to_games

短期prototypeで、入力種類を増やさずobject間相互作用から展開を作る場面と、sound・UI・polishを日程上の独立枠として確保する場面の参照になる。
