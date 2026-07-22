---
title: "It's OK, Try Again. - Postmortem behind the scenes of my game jam entry"
url: "https://itch.io/devlog/1494738/its-ok-try-again-postmortem-behind-the-scenes-of-my-game-jam-entry.amp"
collected_at: "2026-07-22T20:47:08+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-jam, postmortem, platformer, rewind-mechanic, scope-control, godot]
---

## raw_excerpt

原文の重要部分を日本語で採録する。Picorims が二週間の GameName Game Jam で制作した Godot 製 2D platformer『It's OK, Try Again.』の postmortem。テーマ「invincible」を、失敗を消すのではなく直前の状態へ巻き戻してやり直せる仕組みとして扱った。最初に CharacterBody2D と TileMapLayer で基本移動を作り、coyote time、jump buffering、corner correction、可変 jump、wall / air jump、wind、spike へ広げた。一方、締切までに直せる範囲を保つため、全方向へ重力を切り替える案は、既存コードの下向き重力依存と bug 増加を理由に見送った。

rewind は単に座標を保存する機能ではなく、jump 可否、coyote time、buffered input など全 movement state の再現と、各 frame の timestamp を使う制御可能な timeline を必要とした。frame 単位で過去状態を選べるため、通常なら表面化しにくい一瞬の exploit や復元漏れも繰り返し再現できた。level design は開始五日後となり、残る art と music の時間から一つの level に絞った。説明文を増やす代わりに、mechanic を使わなければ通れない地形で発見を促す構成を試している。

制作後半では進行を表す Path2D 上の 0〜1 の比率を共通信号にし、地形の duotone 配色、背景 shader、環境音、11 instrument の fade を連動させた。30秒 loop の layer を場所ごとに出し入れし、約3分30秒の変化へ拡張した。巻き戻し時も自然な音楽にする retrograde inversion 案は締切内に成立せず撤回し、web export の音同期問題には Windows / Linux build と動画を fallback として用意した。二週目は予定より高負荷になったが、all-nighter は避け、playable build を提出している。

## why_relevant_to_games

時間巻き戻し mechanic を、状態復元・決定性・level teaching・演出同期まで含む制作上の制約として追える。game jam で新規 core を守りながら、危険な追加案を切り、単一の進行変数で visual / audio を束ねる場面に接続できる。
