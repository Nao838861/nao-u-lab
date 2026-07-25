---
title: Development Retrospective and Launch Postmortem
url: https://britown.itch.io/sweeper/devlog/1308943/development-retrospective-and-launch-postmortem
collected_at: 2026-07-25T14:00:50+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, puzzle, postmortem, web-game]
---

## raw_excerpt
作者は『Dragonsweeper』に着想を得た UI 中心の Minesweeper 系 RPG を試作し、盤面生成の制約処理を作り直した。単純に各 unit の配置可能地点を全走査する方法は、配置済み unit 同士の関係確認が重なって N^2 に近づき、約1秒かかるうえ、途中まで置いた結果として残りを配置不能にすることがあった。そこで Wave Function Collapse に近い考え方として、各 tile type に初期候補集合と、直前の配置を受けて候補を更新する処理を持たせる。毎回「置ける場所が最も少ない tile」を先に選び、位置を一つ決め、残りの候補集合へ制約を伝播する。候補が0になった場合は一手前の盤面 copy に戻り、その決定位置を候補から除いて再抽選し、必要なら再帰的にさらに戻る。

web build では Zig の cross compile 設定を離れ、Emscripten と Makefile で engine、software renderer、art、sound、board generator を browser 上へ移した。その後、portrait 寄りの layout と touch marking menu を追加し、Flask と Redis で leaderboard を構築した。公開後24時間で browser play が1000回、3週間で5000回を越え、その時点でも1日100回超の play が続いた。作者は一度、既存作に近すぎることと art・UI の不足から約1年棚上げし、最後の3～4日で仕上げて公開したとも記録している。

## why_relevant_to_games
相互依存する配置制約を持つ puzzle 盤面の生成、失敗時の backtracking、試作を browser・touch・leaderboard までつなげて実プレイを得る場面の参照資料になる。
