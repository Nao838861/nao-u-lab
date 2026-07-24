---
title: "Postmortem and a little history - Ecliptic"
url: "https://itch.io/devlog/1532254/postmortem-and-a-little-history.amp"
collected_at: "2026-07-25T03:46:43+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, postmortem, tactical, engine-architecture, state-machine, tooling]
---

## raw_excerpt

> “There are too many modes and it is too easy to switch to one unexpectedly.”

要点メモ（引用ではなく本文の要約）: Amiga 向けターン制戦術ゲーム『Ecliptic』を、2020年の初期メモ、2022年の Blitz Basic 版、2023年の C++ 再実装を経て2026年に完成させた作者の記録。成功点として、game object 用の garbage-collected heap、object behavior を動かす VM、item・monster・room layout・graphics・palette・sound・UI を共通に定義する DSL と C# compiler、A*・AVL tree・shadowcasting の採用を挙げる。game state に依存する object を GC heap 内へ、display・input・disk I/O など machine state に依存する層を外へ分離した。

一方、STL を使えない環境での C++ は実質的に “C with classes” となり、save/load のための vtable pointer 処理を含む摩擦を生んだ。固定 puzzle と set-piece を作るため procedural layout を固定 room 中心へ変更したが、corridor の randomness が level design をなお制約した。player turn や target selection、monster behavior を多数の “mode” object で管理した結果、event から予期せぬ mode へ遷移し、元へ戻れず apparent lock-up になる bug が多発した。作者は、mode 数と遷移可能性を制限すれば単純化できたと振り返る。2024～2025年には engine rewrite や feature detour を止めて level 制作へ移り、最終的に8 levelを完成させた。

## why_relevant_to_games

長期個人制作で「面白い基盤技術」と「完成を阻む状態遷移の複雑さ」が同居した一次事例。独自 engine / DSL / save-state 分離を設計する時と、mode 増殖による soft lock を state graph や回帰 test で監査する時の参照になる。
