---
title: "My experience making my first game"
url: "https://itch.io/devlog/1634773/my-experience-making-my-first-game.amp"
collected_at: "2026-08-23T23:31:46+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, platformer, scope-control, speedrun]
---

## raw_excerpt

itch.io で 2026-08-20 に公開された『Tiny Clones』の初制作記録。作品は clone machine で小さな分身を多数生み、人間の塔を作る、clone を犠牲に dash するなどしてゴールまでの時間を縮める browser game として作られた。当初、clone は自分で移動を計算せず、player の過去位置をそのまま追う実装だった。このため player が jump すると、一部の clone が jump 時点の空中位置に残り、player が動かなければ停止する問題が出た。作者は数日かけて、clone が空中にいる間は player の移動を replay する方式を実装した。

制作は game jam 向けに始まったが、想定より数か月長引いた。二週間の旅行後に意欲が落ち、別 project を進めたくなったため、scope を「短くて少し変な speedrun game」へ縮小した。想定 play time は約3分だったが、初見 player は約15分、speedrun は約60秒、作者の best time は1分05秒と記録されている。release 時には gameplay 動画から thumbnail と GIF を作ったものの、初動は10 views・4 playsで、challenge 画像の import 漏れも判明した。作者は thumbnail と画像を修正し、feedback と best time への挑戦を呼びかけている。

## why_relevant_to_games

過去位置追従型の分身 mechanic を実装する場面で、jump 中の状態不整合と replay による補正を検討する材料になる。また、長期化した初制作を短時間 speedrun へ切り直した scope 変更と、作者想定3分・初見15分・熟練約60秒という時間差を記録した制作事例である。
