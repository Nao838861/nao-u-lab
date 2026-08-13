---
title: "Pushing the limits in Simulating a City, One Page at a Time"
url: https://www.gamedeveloper.com/design/pushing-the-limits-in-simulating-a-city-one-page-at-a-time
collected_at: "2026-08-13T23:47:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, production, documentation, simulation]
---

## raw_excerpt

著作権に配慮し、長い逐語引用ではなく記事の要点を日本語で採取する。Danielle Riendeau が Stone Librande の GDC 2013 講演を再訪し、SimCity (2013) の pre-production から出荷まで one-page design だけで進められる範囲を追う。Librande は当初 5 人のチームで、複雑な設計を一枚の図へ落とし、印刷して目立つ場所に掲示する方法を実験した。初期 map の一部は制作の最後まで残り、multiplayer trading の図では構想が複雑化していることが実装投資前に露出した。一方、coal city の生産施設、module、支援要素、simulation への影響、reward、resource chain を一枚へ整理する要求や、磁石・card game を使った表現は時間がかかり、全ての情報を一形式で扱えない場面も出た。そこで CSV / spreadsheet を使いながら、色分けした統合 chart を各作業場所へ配布する hybrid へ移行した。high-level update のたびに古い紙を外して新版へ差し替え、重要な設計は人が見に来るのを待たず届ける運用にした。制作後の振り返りでは、3 年半前の図の一部も参照可能なままで、最上位構造から細部へ降りる project organization の土台として残ったと報告される。

## why_relevant_to_games

simulation、resource chain、multiplayer system のような相互依存の多い設計を、実装前の複雑さ検出とチーム共有へ接続する資料。小規模 prototype でも core loop と数値表をどう分離・同期するかを考える入口になる。
