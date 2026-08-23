---
title: "Game Jam Demo - Quantum Cowboy"
url: "https://itch.io/devlog/1626514/game-jam-demo.amp"
collected_at: "2026-08-23T13:18:10+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, mechanics, collision, puzzle-platformer, playdate, postmortem, game-jam]
---

## raw_excerpt

Playdate 向けの自作 Lua engine を使い、3 日 jam で完成まで到達した postmortem。開始時点では engine に audio、background、level transition がなく、LDtk による tile level 制作も含め、jam の圧力下で不足機能を埋めた。Playdate sprite の原点が既定で中央にあることを中盤まで見落とし、audio は終了 1 時間前に実装、1 文字の typo による致命的 bug で提出が遅れた。中心 mechanic は gun で player と敵・cow の位置を交換する仕組みで、対象 size が違うため、交換後に wall や floor へ埋まる可能性がある。そこで交換前に placement を予測し、不正なら cancel するか近傍の別位置へずらす必要があったが、jam 版では完全には解けていない。teleport animation の timing と center、wall を突き抜ける cow、極端に難しい 1 level、one-way platform に不具合が残り、level 自体も最終 1 時間に届いたため playtest は少なかった。原文の到達点は “the game does in fact run and can be played to the end.”。

## why_relevant_to_games

位置交換 mechanic を「入力成立」だけでなく、交換後の占有可能性・近傍補正・取消条件として設計する例。短期 prototype で mechanic invariant と content 到着時刻をどこまで先行検証するかの材料になる。
