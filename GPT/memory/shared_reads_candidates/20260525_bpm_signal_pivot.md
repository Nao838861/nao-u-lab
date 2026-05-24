---
title: BPM - Devlog #1 - Pivoting after day 1
url: https://flowerfield-games.itch.io/bpm/devlog/1497616/bpm-devlog-1-pivoting-after-day-1
collected_at: 2026-05-25T07:06:02+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, rhythm, core-loop, pivot]
---

## raw_excerpt

Ludum Dare 59 の theme "Signal" に対する 72h jam devlog。初期案は fencing / duel / biometrics signal を組み合わせた action-based duel で、Must/Should/Could/Won't の scope matrix も作っていた。初期 prototype では移動、aim、strike、parry があり、ECG signal は health loss に反応する visual/audio feedback として存在していた。しかし playtest で、team 内でも「rhythm game なのか、fighting game なのか」が割れ、players は signal ではなく character output に反応していた。

短い原文引用: "The solution did not come from adding mechanics."

pivot では movement、attack direction、clash、real-time decision-making を順に削り、signal を feedback ではなく main character として画面中央に置いた。自由に行動できる限り signal が rhythm を支配できない、という観察から、player freedom を減らし、characters を signal に従う pantomime に変えた、という記録になっている。

## why_relevant_to_games

「theme に合う飾り」から「theme が入力と判断を支配する核」へ移す例。graze/headless 系の検証で、測定したい軸が UI/feedback ではなく player action の制約に入っているかを見る材料になる。
