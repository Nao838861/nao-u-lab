---
title: "First Gamejam Post-Mortem"
url: "https://itch.io/devlog/1578153/first-gamejam-post-mortem"
collected_at: "2026-07-22T02:45:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, postmortem, game-jam, controls, playtesting, game-feel]
---

## raw_excerpt

本文要点の日本語メモ（原文の長文引用ではなく、収集時の言い換え）。作者 Echo は、初参加の game jam と初公開作品『Sunset Twist』について、審査順位と制作判断を対応づけている。visual は約4.4、audio は約3.8、theme / creativity は約4.0だった一方、enjoyment は約3.5。作者は、回転する独特な移動操作を自分には自然で気持ちよいものとして調整したが、playtester は入力が進行方向へどう影響するか分からず、難しさへの不満も繰り返したと記す。途中で control-stick 表示から上下方向を除いて左右だけにし、移動方向を示す矢印形の影を加えると、tester が向きを把握しやすくなったという。それでも難度を維持した点は、より易しい movement mode や assist option を用意すべきだった失敗として挙げている。

制作初日は最小 asset で physics を試し、level より先に movement feel を固めた。auto-tiling / terrain を早期に習得して床を短時間で変更できるようにし、prototype asset も締切時にそのまま使える見た目にした。一方、jam と無関係な plugin 改造に一日を失い、週半ばには壁との衝突で進行方向が乱れる問題から movement を全面 refactor した。原因は sphere collider を楕円にするため `transform.scale` を使ったことにあり、調査と修正で長時間停止した。物語面では暗い展開を終盤かつ secret route に置いたため、多くの player が短時間の通常 play ではそこへ到達せず、明るい arcade game と受け取った。作者は、初期 physics test、変更しやすい level tool、操作理解を助ける visual cue、tester の難度指摘、締切外の寄り道、重要な narrative cue の露出時期を、同じ一週間の工程として振り返っている。

## why_relevant_to_games

作者には自然になった独特な操作を初見者が読めない時、入力表示を増やすのでなく不要方向を削り、進行方向を世界内 cue で示した事例として使える。短期 prototype で game feel を先行させる利点と、難度・tool寄り道・終盤に隠した物語が評価へどう現れたかを同時に追える。
