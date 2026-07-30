---
title: "How to Design Emotional Game Environments for Sky: Children of the Light"
url: "https://80.lv/articles/how-to-design-emotional-game-environments-for-sky-children-of-the-light"
collected_at: "2026-07-30T10:18:08.7713455+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, environment-art, wayfinding, level-design, live-service, optimization]
---

## raw_excerpt

Flora Yu は、ゲーム環境を美しい背景ではなく、移動、物語、感情を同時に伝える playable space として設計する。最初の数秒にプレイヤーの視線がどこへ向き、安全・危険・神秘・誘引のどれを感じるかを確認し、色に頼る前に grayscale の value contrast、silhouette、光、開いた構図で視覚階層を作る。wayfinding は、遠距離の landmark と spatial anchor、中距離の path・材質・高低差・framing、近距離の色分け・prop・sign・lighting pocket という複数 scale を重ね、明示指示なしでも mental map を組み立てられるようにする。

『Sky: Children of the Light』の Season of Two Embers の市場では、似た形の tent と狭い道が混乱を招くため、背の高い構造物、吊り飾り、頭上の要素、色のまとまりを tent より上の参照点として置いた。Season of Duets の concert hall では、狭く静かな水路から大空間へ開く compression-release の sequence で期待を作り、中央 stage を複数の観覧位置から読めるよう sightline を整えた。大人数でも空虚にならず、少人数でも親密に感じるよう、hall の大きな scale と player-sized の席、机、蝋燭を併置した。

live-service の performance planning は最後の cleanup ではなく、layout 初期から行う。main path、gameplay space、narrative focus に detail budget を寄せ、背景は silhouette と depth の役割に絞る。壁、曲がり角、地形、大型建築、tent は世界観と同時に sightline と occlusion を制御し、隠れた geometry や dressing の描画を抑える。asset ごとに、近接表示、collision、baked lighting、material complexity、LOD が本当に必要かを、player experience への寄与から決める。

## why_relevant_to_games

小規模ゲームでも、環境を wayfinding・感情曲線・視認性・描画予算の共通装置として設計し、他者の初見プレイで「見た場所、進んだ方向、受け取った感情」を照合する材料になる。
