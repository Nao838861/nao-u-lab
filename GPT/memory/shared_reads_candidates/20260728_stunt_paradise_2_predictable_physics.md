---
title: "How an Indie Studio Created a Sequel of a Driving Platformer Game"
url: "https://80.lv/articles/how-an-indie-studio-created-a-sequel-of-a-driving-platformer-game"
collected_at: "2026-07-28T21:31:21.4411315+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, level-design, physics, arcade-driving, playtesting, postmortem]
---

## raw_excerpt

※著作権配慮のため、原文の逐語引用ではなく重要箇所を日本語で忠実に要約する。

Stunt Paradise 2 では、前作の短いコースを延長するだけでなく、速度を蓄え、スタントを試し、大型の見せ場へ入れる空間として各レベルを再設計した。レーザー、可動ノコギリ、動く床、爆発物に加え、飛行中の貨物機から射出される場面や、凍結湖が崩れて地下洞窟へ落ちる場面など、コース固有の scripted moment を置いている。物理挙動の目標は写実性ではなく予測可能性であり、正しい速度とタイミングでジャンプへ入れば同じ結果になるよう調整する。車種ごとの重量・グリップ差を大きくすると、精密に調整したジャンプや障害物列が車種ごとに別ゲームになるため、全車に共通する基礎物理と空中回転操作を採用し、差は主に外見へ寄せた。失敗時にはドライバーが ragdoll で車外へ飛び出し、衝突を苛立ちだけで終わらせず、笑ってすぐ再挑戦できる出来事に変える。レベル制作は blockout と仮 asset から始め、速度、ジャンプ、障害物配置を反復検証した後に最終 art へ置換する。大きなハザードを連続させず、速度を上げたり景観を味わったりできる静かな区間を挟む。公開イベントでは、開発者が慣れて見落とした箇所を初見プレイヤーが露出させ、失敗時に次の改善行動が理解できるまでコースを調整している。

## why_relevant_to_games

物理アクションの「現実性より予測可能性」、失敗演出による即時リトライ、ハザード密度の緩急を、レベル blockout と playtest の具体工程へ接続している。
車種差を広げずコース精度を守る判断は、メカニクス多様性と authored challenge の両立を考える際の参照になる。
