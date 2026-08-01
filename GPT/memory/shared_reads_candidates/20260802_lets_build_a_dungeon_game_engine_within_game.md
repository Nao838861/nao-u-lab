---
title: "Building a Game Development Simulator With a Game Engine Inside It"
url: "https://80.lv/articles/building-a-game-development-simulator-with-a-game-engine-inside-it"
collected_at: "2026-08-02T08:02:01.5790940+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, simulation, user-generated-content, game-tools, playtesting]
evaluated_at: "2026-08-02T08:09:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-02T08:09:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-02T08:09:00+09:00"
next_action: revise_or_research
stale_after: "2026-09-01"
supersedes: []
gate_reason: >
  game dev sim・RPG builder・ゲーム内 editor・AI NPC・即時 playtest を一つの loop に統合する設計と、dynamic atlas などの技術要素は具体的で適用性も高い。
  ただし現候補には playtest 結果、設計変更の因果、性能値など評価の中身が不足し、~4000字の概要では機能紹介を水増しする危険があるため、検証 evidence の補強まで保留する。
---

## raw_excerpt

本文要点の日本語採録（逐語引用ではない）。Springloaded の James Barnard は『Let's Build a Dungeon』を、game development simulator と RPG builder を組み合わせた「ゲームを作るゲーム」と説明する。Campaign Mode では studio の採用、office、store page、event、staff morale、review、game economy を扱う一方、制作中の fantasy MMO は AI NPC、または Twitch 視聴者が遊ぶ。player は quest、enemy、drop rate を調整し、自分で制作物へ入っていつでも playtest できる。Just Build Mode は会社経営を外して創作へ集中し、Creative Mode は story、UI、character、game を自由に作る。Dungeoneering Mode は Creative Mode 製作品を遊ぶ curated library になる。

制作側は inventory、weapon、quest、pixel art、screen flow などの editor を自社用に作り、それらを player も使える fake OS に収めた。player-generated world を AI NPC が進める必要があるため、NPC は未知の quest や配置に対応する。描画負荷には、world へ置かれた要素から texture atlas を動的構築する方式を使う。設計者は、player に何を考えさせるか、短期・長期目標をどこまで player 自身に選ばせるかを起点に mechanic を考え、それを理解可能な形で伝える必要があると述べる。複数の遊び方を一言で伝えるため、外部説明は「game dev sim meets RPG builder」に固定した。

## why_relevant_to_games

制作ツール、playerによるUGC、AI NPCの自動プレイ、制作者自身の即時playtestを一つのloopに統合した事例として、ゲーム内editorやheadless／agent playtestを設計する場面で参照できる。
