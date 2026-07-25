---
title: Postmortem "she danced in the wind like a holographic dream before the world died"
url: https://alienmelon.itch.io/flower/devlog/1382599/postmortem-she-danced-in-the-wind-like-a-holographic-dream-before-the-world-died
collected_at: 2026-07-25T14:00:50+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, interactive-fiction, procedural-generation, postmortem, narrative-design]
---

## raw_excerpt
作品は、都市で踏まれる dandelion を描く短い interactive poem の更新として始まったが、建築、brutalism、Unreal Engine の PCG、無限に探索できる open world へ拡大した。作者は大規模範囲を単一 PCG で runtime 生成する構想を縮小し、world を chunk に分け、PCG Stamp と level instancing を使い、landscape と city を事前生成する形へ変更した。建物をすべて固有にする案も resource 負荷から断念し、一部 procgen に固定した。草・岩・崖の散布規則と LOD 間の遷移には PCG を利用し、最適化設定で低性能の Dell PC でも60 fpsを得たと記す。照明は主に emissive material、volumetric fog、post-process exposure を組み合わせ、通常 light source を限定して負荷を抑えた。

物語面では、滅亡後の世界を最後の花が歩き、殺された詩人の memory fragment を順不同で収集する。作者は断片を正しい順に読ませず、player が関係を推測できる余地を残した。収集物は Unreal 内で動く Twine と、その中へ埋め込んだ Bitsy で構成し、HTML の styling と Unreal の空間表現を併用する。Audio Volume、Sound Cue、procedural music を重ね、屋外・建物内・UI・文章画面の遷移を連続させた。文章だけを提示するのではなく、art、lighting、texture、探索空間が player を文章へ向かわせる構成を採った。

## why_relevant_to_games
小さな narrative prototype が open-world PCG へ膨らんだ時の scope 縮小と、文章・空間・埋込み HTML・音響を一体化して順不同の探索物語を作る場面の参照になる。
