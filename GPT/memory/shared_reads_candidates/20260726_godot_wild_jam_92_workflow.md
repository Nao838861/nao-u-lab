---
title: "Godot Wild Jam 92 Postmortem: My workflow"
url: "https://littlebeardman.itch.io/brewers-of-khazad-dun/devlog/1499931/godot-wild-jam-92-postmortem-my-workflow"
collected_at: "2026-07-26T14:16:32.5093748+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, game-jam, workflow, godot, scope]
---

## raw_excerpt

作者 LittleBeardMan は、9日間の Godot Wild Jam で短期制作を完走する手順を、自作『Brewers of Khazad-Dun』を例に記録している。テーマ発表後は、Godot を開く前に画面 mockup を作り、必要な表示領域と実装対象を粗く割り当てる。最初の週末の目標は、見た目や調整が未完成でも、中心 mechanic と勝敗状態を含む core game loop を最後まで通すこと。Godot の signal / await を使い、後で中身を足せる空の scene や function を先に並べ、ゲーム全体の orchestration を作る。週中は一つの機能へ時間を集中させず、art、animation、mechanic などを少しずつ巡回し、残作業と残時間を見失わないようにする。金曜までに、全 mechanic に触れながら開始から終了まで遊べる状態を目指し、2回目の週末は bug、art、balance、settings、save/load、SFX、music を埋める。短時間で既存構造へ入らない追加案は切り、終盤は実プレイしながら各操作に visual / audio feedback があるかを記録する。最終日は web export、itch.io 上の表示、操作説明、欠けた asset を反復確認する。作者は、この手順を約12回の jam 参加経験から組み立てた個人的 workflow として提示している。

## why_relevant_to_games

短期プロトタイプ制作で、core loop、全体 orchestration、薄い system 巡回、feature complete、polish の順に playable diff を組み立てる場面の参照になる。
