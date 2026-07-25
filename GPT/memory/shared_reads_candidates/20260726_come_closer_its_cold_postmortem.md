---
title: "Come Closer, It's Cold — Postmortem: My First Game in 2 Weeks"
url: "https://itch.io/blog/1561059/come-closer-its-cold-postmortem-my-first-game-in-2-weeks"
collected_at: "2026-07-26T03:31:27+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, ai-assisted-development, balancing, onboarding, simulation]
---

## raw_excerpt

原文の重要部分を日本語で言い換えた収集メモ。作者は、凍った精霊を焚き火で温めながら五夜を生き延びる約9分の browser game を、初作品として二週間で完成させた。コードは AI に実装させ、game design、物語、音楽システム、balance は自分で担当した。着想は mechanic からではなく「穏やかだが incremental の反復報酬がある感情」を先に置き、三つの案を捨てた後、焚き火そのものを player character にする構図へ到達した。

難度調整では decay rate、精霊の cost、天候倍率、wood economy を dashboard にまとめ、parameter を少しずつ変えながら一条件あたり300～500回の Monte Carlo simulation を行った。Night 1 を tutorial、2～3を圧力導入、4を意図的な壁、5を scripted ending とする曲線を作った。一方、tutorial text を用意しても「焚き火を click ではなく hold する」操作が伝わらず、作者は説明よりも、その action を実行するまで進行しない onboarding が必要だったと振り返る。

事前には mechanic を八つ持つ GDD を三本書いたが、相互作用と実装量が膨らんで全て破棄した。記事中の短い原則は “One loop. One feeling. Ship that.”。また、数理的な balance が意図通りでも、静止画中心の森は生命感を欠き、animation と反復 play による「どこで完成とするか」の感覚は別の課題として残った。

## why_relevant_to_games

AI 実装で制作障壁を下げても、感情目標、scope、難度 proxy、初見操作、animation の不足は別々に検証する必要がある。短い game loop に Monte Carlo と実プレイ観察をどう接続するかを考える一次事例になる。
