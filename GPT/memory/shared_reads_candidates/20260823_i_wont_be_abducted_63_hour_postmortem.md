---
title: "I Won't Be Abducted: a 63-hour postmortem"
url: "https://chrisdalbano.com/notes/i-wont-be-abducted-postmortem"
collected_at: "2026-08-23T00:31:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, scope-control, narrative-design, godot, ai-assisted-development]
---

## raw_excerpt

作者 Christian D'Albano が Wavedash Spring Jam 26 の約63時間で完成させた、3夜構成の tabletop-defense game のポストモーテム。制作前に must ship / stretch / **do not build** の3列を作り、procedural map、combo system、free-roam pathfinding、4夜目を初日から禁止した。途中で Scrap を使う shop は、upgrade 価格と income pacing の二重の tuning debt を生むため、5枚の pool から3枚を提示して1枚選ぶ無料の dawn draft に置換。Godot の gameplay 数値を `.tres` resource に置き、終盤は script 編集ではなく調整へ時間を使った。tabletop standee という表現制約は walk cycle を不要にし、hop、lunge、knock-back、screen shake で動きを成立させつつ、終幕の種明かしにも接続した。一方、敵 roster と攻撃 telegraph の実装が最終日に寄り、balance と fairness の playtest 時間を失った。作者は、全 system を最後の一場面へ向けて切り詰めたことが、週末で完結した arc を出荷できた理由だと記している。

## why_relevant_to_games

短時間プロトタイプで「作らないもの」を先に固定し、調整負債の大きい economy を draft へ縮約する具体例。表現上の制約を制作コスト削減と narrative payoff の両方へ接続する設計例として参照できる。
