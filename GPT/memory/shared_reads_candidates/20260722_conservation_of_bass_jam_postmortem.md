---
title: "Conservation of Bass (Post-Mortem)"
url: "https://emlise.itch.io/conservation-of-bass/devlog/1476584/conservation-of-bass-post-mortem"
collected_at: "2026-07-22T07:01:13+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, postmortem, game-jam, mechanics, scope, level-design]
---

## raw_excerpt

原文の要点を日本語で採録する。『Conservation of Bass』は、48時間の GM48 game jam（テーマは「Equivalent Exchange」）に制作された puzzle game で、総合1位に加えて全評価カテゴリでも1位となった。作者は過去の jam で scope を広げすぎ、重要 system や critical bug が締切直前まで残ることが多かったが、今回は単純な gameplay foundation を早期に決めたことで、制作が穏やかに進み polish へ時間を使えたと振り返る。

中心 mechanic は player の位置を 1x1 tile と交換するもの。puzzle 案を選ぶ際に「同じ mechanic だけで異なる level を少なくとも5つ考えられるか」を基準にし、この条件を通った案だけを採用した。mechanic が単純で早く固まったため、programming、art、sound と並行して level design を進められた。テーマとの接続では、当初は交換できない 1x1 block もあったが、「同じ mass のものだけを交換できる」という conservation of mass の見立てに合わせ、すべての 1x1 block を交換対象へ統一した。

未採用案には、player が別 tile と結合して ladder のような大きな object と交換する仕組みや、goal の water glass 自体を交換対象にする案があった。いずれも基本規則を複雑にするため本編には入れなかった。pixel art は最小限で平面的に作り、smoothing shader と vocal sound effects で presentation を補った。作者は、単一 mechanic の展開可能性を早期に確かめ、追加 mechanic を抑えたことが、48時間内の並行制作と安定した polish を支えたと記録している。

## why_relevant_to_games

短期 puzzle prototype で、単一 mechanic の展開可能性を level 案の数で事前確認し、scope・並行制作・テーマとの統合へつなぐ方法を参照できる。
