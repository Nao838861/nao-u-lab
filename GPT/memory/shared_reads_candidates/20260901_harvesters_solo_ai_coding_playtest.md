---
title: "Harvesters: A little clicker game about mining in space"
url: "https://chuckiee3.itch.io/harvesters/devlog/1584663/harvesters-a-little-clicker-game-about-mining-in-space"
collected_at: "2026-09-01T04:51:09+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [postmortem, solo-development, ai-coding, playtesting, incremental-game]
---

## raw_excerpt

原文を基にした日本語抜粋メモ（長文の直接引用ではなく要約）。Godot で約3か月かけて制作された、宇宙採掘を題材にした一人用 clicker / incremental game の開発記録。作者が開始時に置いた目標は、AI に coding を補助させて game design と art creation の練習へ時間を回すこと、外部の制作者へ何かを依頼して協働を経験することの二つだった。coding には Claude Code と更新される `claude.md` を使った一方、作者は programming knowledge が必要であり、AI が長く試しても解けない bug があること、Resource・Config・Scene・UI の初期設定を人間が整えると作業しやすいことを記している。menu / cover art は外注し、parallax 用には各要素を分離した source file が必要になるという制作上の観測もある。

incremental game は反復 playthrough が多く必要で、完成版にも balance の不足が残った。複数の友人が最初の playable version から bug 発見と feedback に参加し、全編を何度も完走した。最速 playthrough は16分50秒。作者は、初期 build から test していなければ、最終状態は大幅に悪化していたと振り返る。ゲームの着想は『Red Alert 2: Yuri's Revenge』の Slave Miner にあり、採集設備と採集者が一体化した見た目、作業者が資源を掘って戻る運動を、個々の harvester に愛着を持てる idle / clicker 表現へ展開した。原文の短い表現では “test from the first playable version” が制作上の要点として置かれている。

## why_relevant_to_games

AI coding を使う小規模ゲーム制作で、人間が先に整える scene / UI 境界と、最初の playable から反復 playtest を始める実例として収集した。incremental game の balance 検証と外注 asset の受け渡し設計にも接続できる。
