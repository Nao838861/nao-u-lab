---
title: "Deep Dive: Masterminding the fluid movement system behind Echo Point Nova"
url: "https://www.gamedeveloper.com/design/deep-dive-the-movement-of-echo-point-nova"
collected_at: "2026-08-01T03:45:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, movement, game-feel, physics, camera, vfx, sfx, postmortem]
---

## raw_excerpt

著作権に配慮し、以下は記事本文の要点を日本語で記録した収集メモ。短い原文断片は “experimenting and tinkering with code” と “can’t really be viewed in isolation”。作者 Matt Larrabee は、Echo Point Nova の移動を完成像から逆算せず、約3年間にわたり inspiration、player physics、camera motion、VFX / SFX の間を往復しながら、プレイ時に良く感じる方向へ1〜2手ずつ調整したと説明する。hoverboard は sprint-to-crouch slide を坂の上りにも延長したいという発想から生まれ、Unreal の walking physics を基礎に friction と deceleration を無効化し、最高速まで数秒かけて車両的な加速を作った。斜面から自然に飛び出すため slope detection を追加した。grapple は高速移動中の照準誤差を許容するため、直前に見た grappleable target を短時間記憶し、現在速度から視線方向の目標速度へ約1秒で補間する。カメラは速度連動 FOV、hoverboard 時の上下動・傾き、階段移動の平滑化を使う。音は速度に応じて pitch を変え、VFX は接地面と速度で debris を変える。記事末尾では、物理だけでなく camera、sound、VFX、level、unlock timing、tutorialization まで含めて移動 mechanic が成立すると述べている。

## why_relevant_to_games

操作感を単一の物理パラメータではなく、入力許容、速度変化、カメラ、音、視覚効果、レベル配置を横断する反復対象として収集できる。高速移動や grapple を持つアクション試作で、どの層を観測・調整するかを考える材料になる。
