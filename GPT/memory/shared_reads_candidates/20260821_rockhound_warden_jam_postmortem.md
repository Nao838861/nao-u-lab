---
title: "The Rockhound Warden Jam Postmortem"
url: "https://itch.io/devlog/1614928/the-rockhound-warden-jam-postmortem.amp"
collected_at: "2026-08-21T05:31:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-jam, postmortem, mining, voxel, mechanics, production]
---

## raw_excerpt

Game-Like Jam 10 で「Minecraft Classic に似た作品」を一か月で作った The Rockhound Warden の postmortem。Minecraft 全体を再現せず、破壊可能 voxel と mining を中心に絞ったうえで、一般的な採掘 game の Dig→Sell→Upgrade 反復とは違う核を探した。最初は block の記号を3D空間で matching すると採掘効率が上がる案を試したが、視点と奥行きを含む空間では直感的でなく、操作が煩わしかったため撤回した。代わりに、Minecraft の同種 item stacking を inventory 内の compactor という仕組みに読み替え、短時間で動く形に置き換えた。

素朴な voxel 描画は遠距離まで表示すると性能が足りず、作者は描画限界を fog と world curvature で隠した。結果的に制約隠しが神秘的な雰囲気を生み、firefly particle や Warden という交換相手の造形へ art direction がつながった。一方、途中で別 game jam に参加して約一週間を失い、upgrade と balance は最大の bottleneck のまま締切を迎えた。終盤の test では坑道内で迷いやすいことが分かり、help message、照準 icon、採掘時間を示す radial bar、flare、効果音を追加した。延長された一日で save system と Warden の animation まで入れて提出した。

## why_relevant_to_games

3Dでは読みにくい mechanic を inventory 操作へ移す判断と、性能上の制限を visual identity に変換する過程を、小規模 voxel prototype の設計・評価に利用できる。
