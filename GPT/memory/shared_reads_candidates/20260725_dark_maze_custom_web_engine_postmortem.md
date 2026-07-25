---
title: "Designing a Web Horror Game from Scratch (Decisions, Process, & Learnings)"
url: "https://itch.io/devlog/1583161/designing-a-web-horror-game-from-scratch-decisions-process-learnings.amp"
collected_at: "2026-07-25T23:02:05.6425859+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, horror, postmortem, web-game, custom-engine, javascript]
---

## raw_excerpt

本文要点の日本語メモ（原文の長文引用ではなく、収集時の言い換え）。作者はブラウザ向けホラーゲーム『Dark Maze』を Unity / Unreal / Godot に頼らず、純粋な JavaScript と Canvas で制作した。狙いは、web の処理負荷を抑えながら閉所の緊張感を作ることだった。map は壁を `1`、空間を `0` とする rigid grid-matrix に限定し、inventory や武器の複雑さを増やす代わりに、視界制限と「隠れて逃げる」loop へ集中した。

custom engine は `requestAnimationFrame` を中心にしつつ、描画速度と physics loop を分離して、tab の一時的な frame stutter が移動量を変えないようにした。browser の audio autoplay 制限には、player が canvas を操作した後だけ ambient loop と jumpscare sound を初期化する state logic で対応した。公開後には portal ごとに audio asset や embed 構造の自動検査条件が違うこと、desktop・low-end laptop・mobile 間で CSS と drawing resolution を適応させないと aspect ratio の歪みや処理落ちが起きることを学んだとしている。次作では responsive 3D viewport、`localStorage` の save、enemy pathfinding まで custom engine を拡張する予定も記している。

## why_relevant_to_games

小規模 web game で、雰囲気の目標を grid・視界・行動 loop へ落とし、frame timing、audio policy、responsive scaling、配布 portal の制約まで一続きに設計する場面で参照できる。
