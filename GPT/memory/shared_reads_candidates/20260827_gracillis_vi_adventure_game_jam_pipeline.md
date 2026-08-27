---
title: "Making of - Gracillis VI"
url: "https://bullstorm6.itch.io/gracillis-vi-lost-connection/devlog/1541636/making-of-gracillis-vi"
collected_at: "2026-08-27T09:05:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, adventure-game, game-jam, production-pipeline, tutorial-design]
---

## raw_excerpt

原文要点の日本語採録（長文引用ではなく収集時の言い換え）。作者は GameDev.tv Game Jam 2026 のテーマ「connections」から、海底施設を舞台にした point-and-click adventure を制作した。最初に、端末を調べる、電源 cable を入手する、扉を開ける、drone で警備 droid を誘導する、最後の接続 puzzle を解く、脱出 pod に入る、という行動列を notepad に書き、断片的な案を player が通る順序へ並べ直した。さらに Draw.io で room ごとの出来事と puzzle の依存関係を図にし、この chart と todo list を jam 中の主な管理道具にした。

背景制作では、Unreal Engine 内で既存の巨大な 3D asset と procedural material を配置・照明し、高解像度 screenshot を取得した。これを Adobe Illustrator で posterize した面、Clip Studio Paint で抽出した線、PixelOver の pixel shading と手修正へ渡して 2D 背景にした。character は Mixamo と Blender を経由して animation を付け、sprite sheet として game engine に戻した。最初の48時間で背景工程と3体の animated character を用意したが、最初の room の scale、walkable area、animation 接続には一日を要した。

最初の room では inventory と item 使用を先に教え、item combination は次の puzzle に回して glove 案を削った。前年の「物が見つけにくい」という feedback を受け、序盤の重要 object は perspective 上で大きく、視界へ入りやすい位置に置き、後から難度を上げた。7日目には当初計画の約60%でも遊べる build を確保した。警備 droid の場面では、別 room と武器を追加する案を捨て、既存 room の天井を移動できる drone に奇襲させる構成へ変え、新背景と追加 asset を避けた。

## why_relevant_to_games

短期 adventure 制作で、行動列から room/puzzle の依存図を作る順序、3D asset を 2D pixel art へ落とす制作工程、序盤 tutorial と object 配置を段階化する実例として参照できる。既存 room と既存 character capability を組み替えて追加 asset を抑える場面も記録されている。
