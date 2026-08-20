---
title: "A Broken Time Machine — Postjam Postmortem"
url: "https://itch.io/devlog/1612975/postjam-postmortem.amp"
collected_at: "2026-08-21T03:17:24+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, postmortem, tutorialization, game-jam]
---

## raw_excerpt

『A Broken Time Machine』は、GMTK 2026 の残り約2日から制作を始めた PuzzleScript 製 Sokoban 系パズルである。作者は、4日では実現しにくい新案と、短期間で作れても惹かれない案の間で停滞した後、過去作『Time Juice』の「限られた手数で対象物を壊れたタイムマシンへ運ぶ」規則を移植した。初日は基本規則を実装し、方眼紙で level を設計。翌日は PuzzleScript Next への移行と sprite・palette 調整に時間を使ったが、Aseprite からの export tool を見つけて反復速度を戻し、締切直前に最終 level を追加した。

提出後に別 PC で確認すると、制作機の高い gamma では見えていた黒い pit と wall の区別がつきにくい問題が発覚した。jam 後の反応では mechanic と level design は好評だった一方、序盤の規則理解が難しいという声が集まった。評価分布は enjoyment 上位約5%、creativity 上位約6%だったが、作者は puzzle に粘る人には報酬がある反面、最初の数 level で目的を掴めない人をすぐ遠ざけた可能性を挙げている。一般の jam audience には、試行を続けたくなる即時の誘因と tutorialization が必要だと振り返り、投票終了後は level を変えず、視認性を上げる sprite 修正を行った。

## why_relevant_to_games

短期パズル制作で、既知 mechanic の再利用、紙上 level design、制作環境外での表示確認、序盤の規則提示が、完成度と初回離脱へどう接続するかを追える。PuzzleScript 系 prototype の tutorial と視認性検証を組む際の参照事例になる。
