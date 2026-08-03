---
title: "Midas Postmortem"
url: "https://www.gamedeveloper.com/design/midas-postmortem"
collected_at: "2026-08-03T09:33:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-jam, postmortem, mechanics, physics]
---

## raw_excerpt

著作権に配慮し、記事の重要箇所を日本語で忠実に採録する。EGX Rezzed 2014 の8時間 jam で、初対面の4人が theme「touch」から Midas Touch を選び、触れた物体が coin の rigid body に変わり、押す・登る足場になる platformer を制作した。theme 発表から45分で playable build ができたが、その後は主に physics 調整へ時間を使った。浮遊する細長い ghost を player character にした結果、hitbox は横幅の2.5倍超の高さとなり、天井に当たりやすくなった。gravity を下げる変更が必要になり、既存 level も再設計された。

作者は ghost の particle・lighting を磨いた時間について、完成度は上がったものの core mechanic の展開を試す方へ使いたかったと振り返る。残り90分で boss を諦め、触れると key まで gold coin に変わって扉を開けられず limbo に残る ending を作った。チームは大きな追加を止めて compile と presentation を成立させた一方、USB stick で master build を渡す運用は遅く、Unity を閉じてコピーするたび約15分制作が止まった。記事末では、小さな範囲を仕上げること、mechanic を中心に役割を割くこと、presentation も制作物の一部として準備することを列挙している。

## why_relevant_to_games

極短時間 prototype で、最初の playable 後に physics・art polish・mechanic 展開・build 共有へ時間をどう配分するか、character silhouette が collision と level design を連鎖的に変える場面の記録として使える。
