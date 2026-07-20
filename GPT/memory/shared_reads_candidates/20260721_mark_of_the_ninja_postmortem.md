---
title: "Classic Postmortem: Klei Entertainment's Mark of the Ninja"
url: "https://www.gamedeveloper.com/design/classic-postmortem-klei-entertainment-s-i-mark-of-the-ninja-i-"
collected_at: "2026-07-21T06:45:57.1601238+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, stealth, playtesting, level-design, production-tools]
---

## raw_excerpt

本文要点の日本語メモ（長い原文引用は避けて要約）: Klei Entertainment の Nels Anderson と Jamie Cheng が、16か月で制作した 2D ステルスゲーム『Mark of the Ninja』を振り返る。大きな設計リスクは、前例の少ない 2D ステルスが成立するか不明だったこと。Shank 2 の成熟した pipeline を土台にして試作へ早く入り、texture tiling と preview tool に数か月を投じ、レベル変更が art 全体の描き直しへ波及しない制作環境を作った。初見 player の playtest は週2回行い、要望をそのまま実装せず、なぜ戦闘したくなったか、なぜ tutorial を理解できなかったかという動機を調べた。light source の位置、複数対象を同時に狙わせる props、入力時の animation cue などを調整したが、公開 playtest の開始は開発8か月目で、もっと粗い段階から始めるべきだったとも記す。設計の核は Observe / Plan / Execute / React の四要素と、player-centric systems / intentional gameplay。3D stealth の慣習を写す代わりに、隠密状態を analog ではなく hidden / illuminated の二値にした。一方、初期は fire propagation や複雑な enemy reaction を作ったものの面白さへ結びつかず、数か月分の art / animation を捨てた。後半能力の air-dash と time-stop も試作後に不採用となり、採用した short-range teleport は level design の再作業を必要とした。終盤には全編 playtest と polish のため予定を3〜4か月延長し、level、control、cinematic、重複 item を調整した。

## why_relevant_to_games

新ジャンル試作で「ジャンル慣習」ではなく体験を構成する動詞へ戻る方法、初見 playtest から要望でなく行動動機を読む方法、反復可能性を level tool 側で確保する制作判断の参照になる。
