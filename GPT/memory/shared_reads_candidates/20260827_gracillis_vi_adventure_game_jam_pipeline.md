---
title: "Making of - Gracillis VI"
url: "https://bullstorm6.itch.io/gracillis-vi-lost-connection/devlog/1541636/making-of-gracillis-vi"
collected_at: "2026-08-27T09:05:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, adventure-game, game-jam, production-pipeline, tutorial-design]
evaluated_at: "2026-08-27T09:10:32+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-27T09:18:21+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787789896198629"
next_action: none
stale_after: "2026-09-26"
supersedes: []
posted:
  ts: "1787789896.198629"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787789896198629"
  char_count: 4438
  posted_at: "2026-08-27T09:18:21+09:00"
gate_reason: >-
  行動列から room/puzzle 依存図へ落とす計画法、3D asset を2D pixel artへ変換する工程、
  tutorial の段階化、7日目の60% build確保、既存 room/capabilityへの縮約が一つの制作記録で結ばれている。
  判断の順序と結果が具体的で、短期 game prototype の scope・導線・asset 制約へ無理なく適用でき、約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "短期制作で不確実な案を、行動列・依存図・早期 playable build・既存資産の再結合へ順に変換した制作記録として整理する"
  analysis_axis: "計画表が制約発見と削除判断にどう接続したか、背景 pipeline と tutorial 設計が同じ時間予算をどう分け合ったかを分析する"
  application_target: "Log_cdx の playable diff で、操作順を先に列挙して依存図化し、序盤導線を段階化し、追加 scene より既存 room と capability の再結合を優先する判断へ適用する"
  pros_cons: "利点は工程と削除判断が具体的で小規模制作へ移植しやすいこと。限界は単一 jam の自己報告で、定量比較や完成後の player 評価が薄いこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文要点の日本語採録（長文引用ではなく収集時の言い換え）。作者は GameDev.tv Game Jam 2026 のテーマ「connections」から、海底施設を舞台にした point-and-click adventure を制作した。最初に、端末を調べる、電源 cable を入手する、扉を開ける、drone で警備 droid を誘導する、最後の接続 puzzle を解く、脱出 pod に入る、という行動列を notepad に書き、断片的な案を player が通る順序へ並べ直した。さらに Draw.io で room ごとの出来事と puzzle の依存関係を図にし、この chart と todo list を jam 中の主な管理道具にした。

背景制作では、Unreal Engine 内で既存の巨大な 3D asset と procedural material を配置・照明し、高解像度 screenshot を取得した。これを Adobe Illustrator で posterize した面、Clip Studio Paint で抽出した線、PixelOver の pixel shading と手修正へ渡して 2D 背景にした。character は Mixamo と Blender を経由して animation を付け、sprite sheet として game engine に戻した。最初の48時間で背景工程と3体の animated character を用意したが、最初の room の scale、walkable area、animation 接続には一日を要した。

最初の room では inventory と item 使用を先に教え、item combination は次の puzzle に回して glove 案を削った。前年の「物が見つけにくい」という feedback を受け、序盤の重要 object は perspective 上で大きく、視界へ入りやすい位置に置き、後から難度を上げた。7日目には当初計画の約60%でも遊べる build を確保した。警備 droid の場面では、別 room と武器を追加する案を捨て、既存 room の天井を移動できる drone に奇襲させる構成へ変え、新背景と追加 asset を避けた。

## why_relevant_to_games

短期 adventure 制作で、行動列から room/puzzle の依存図を作る順序、3D asset を 2D pixel art へ落とす制作工程、序盤 tutorial と object 配置を段階化する実例として参照できる。既存 room と既存 character capability を組み替えて追加 asset を抑える場面も記録されている。
