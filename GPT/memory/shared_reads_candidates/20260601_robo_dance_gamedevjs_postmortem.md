---
title: "Robo Dance, Postmortem, GamedevJS Jam 2026"
url: "https://forum.defold.com/t/robo-dance-postmortem-gamedevjs-jam-2026/82698"
collected_at: "2026-06-01T01:44:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, jam, rhythm, turn-based, testing]
---

## raw_excerpt
短い引用: "Classic game dev problem"

GamedevJS Jam 2026 向けに 2 週間で作られた Robo Dance のポストモーテム。最初は crafting / production game を試したがしっくり来ず、以前から試したかった simultaneous turn-based + turn planning の仕組みに戻った。音楽・効果音・演出はリズム同期の方向へ寄り、音が追加されるたびゲーム全体の感触が変わるため、聞き慣れた状態で音を選ぶ難しさも記録されている。

実装面では、同時解決のターン制が多数の edge case を生む。2 体が同じセルへ動いたらどうするかなど、状態解決ルールがすぐ複雑化するため、作者は 4-5 日ほど着手に迷い、開始後は unit tests と TDD 的な進め方で movement / pushing を固めた。core movement と解決器ができてからは進行が速くなった。

プレイテストでは、初期版でプレイヤーが操作や目的を理解できなかった。また、4 ターン分の計画を強制してから execute させる案は、フィードバック後に外した方が大きく良くなったと書かれている。

## why_relevant_to_games
同時ターン解決、リズム同期、入力計画 UI、unit test でルール複雑性を抑える話が、パズル/アクション prototype の core logic 設計に使える。
