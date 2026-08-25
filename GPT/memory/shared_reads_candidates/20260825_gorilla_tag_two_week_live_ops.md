---
title: "Keeping a VR giant fresh: Gorilla Tag’s two-week live ops cadence"
url: "https://unity.com/blog/another-axiom-gorilla-tag"
collected_at: "2026-08-25T21:19:08+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, live-ops, vr, ugc, performance, qa]
---

## raw_excerpt
Unity による Another Axiom producer Derek Arabian への取材。『Gorilla Tag』は腕だけで走る・登る・振る locomotion を核にし、複数の VR platform へ map、cosmetic、gameplay mode を2週間ごとに同時配信している。cycle は概ね、1週目に各 branch の feature・fix を release branch へ統合し、2週目に stabilization と polish を行う構成。短い QA 期間でも各 build を実 headset で確認する必要があり、内部向け continuous deployment と device 上での反復を支える build automation が重要だとする。

UGC sandbox には polygon 数、active object 数、performance impact に応じた制約を置き、安定性と安全性を確認済みの component だけを whitelist する。内部 tool が成熟したものから UGC pool へ徐々に開放する。VR では frame rate の一貫性を comfort と gameplay decision の基準にし、Quest 2 standalone を主要 benchmark として合理的な状況で 90 fps 付近を目指す。release build と中間 build に Profiler を用い、draw call、garbage collection、memory usage を監視する。gravity を変える space map では world space、signal、visual と視点変化を揃えて comfort を扱い、後に custom map creator へ開放したことで新しい minigame 案が生まれたと説明する。

## why_relevant_to_games
短周期で playable content を出す際の「統合週／安定化週」の分離、実機 QA、performance budget 付き UGC sandbox、内部 tool を段階公開する運用を検討する材料になる。
