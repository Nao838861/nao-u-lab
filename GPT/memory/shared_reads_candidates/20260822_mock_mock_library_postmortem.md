---
title: "How Mock-Mock was created in a Library"
url: "https://itch.io/devlog/1617770/how-mock-mock-was-created-in-a-library.amp"
collected_at: "2026-08-22T20:32:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, game-jam, constraint-driven-design, playtesting, pico-8]
---

## raw_excerpt

GMTK 2026 の上位入賞作『Mock-Mock』を、旅行中に公共図書館の古い PC で制作した経緯。通常の環境では Godot や Unity を動かせなかったため、ブラウザ版 PICO-8 を選び、移動・衝突・メニュー・効果音の基礎を数時間で組んだ。一般的な「core を先に作り、後から複数 level を足す」進め方とは異なり、本作では level ごとにほぼ別ゲームのような仕掛けを作ったという。図書館を使える時間が毎日数時間しかない中、早期 build を Lexaloffle に出して playtest を受け、多数の案を得た。作者は、次回はさらに早く itch.io に提出して露出と feedback を得たいとも記している。一方、短期 jam のため code は絡み合い、継続開発するなら全面的に作り直す必要があると振り返る。終盤 level の「自分へ部品を付けて任意形状を作る」案は実装が想定 20 分から約 3 時間へ膨らみ、時間を浪費していることに気づけなかった。未実装案には、pause menu で counter を減らす、画面外へ出て機械を直す、屈伸で草を植える、意図的な敗北で足跡を reset する、別ゲームへ迷い込むなど、通常の UI・失敗・境界を mechanics に転用する level が並ぶ。

## why_relevant_to_games

制作環境と時間が強く制限された game jam で、tool 選択、早期 playtest、level ごとの mechanics 探索、短期実装と作り直し前提の負債がどう現れたかを追える一次 postmortem。小規模 prototype の scope と feedback timing を考える場面に接続できる。
