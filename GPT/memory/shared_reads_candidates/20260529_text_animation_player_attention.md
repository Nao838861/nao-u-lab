---
title: LATAM indie devs lay out how to improve your text animation
url: https://www.gamedeveloper.com/art/latam-indie-devs-lay-out-how-to-improve-your-text-animation
collected_at: 2026-05-29T06:29:43.8303200+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ui-ux, game-feel, tutorial-design, narrative]
evaluated_at: "2026-07-28T12:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-28T12:08:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-28T12:08:00+09:00"
next_action: keep_for_reference
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  文字の位置・速度・文字単位 animation を操作テンポと世界観へ結ぶ複数例は、小規模 prototype の UI 評価軸として具体的である。
  ただし現候補は作品例と tool の紹介が中心で、比較条件、可読性や行動への効果測定、localization の検証結果がなく、CoopEval 水準の結論を支えられないため fail とする。
---

## raw_excerpt
Game Developer の 2026-05-21 記事。Gamescom LATAM で展示された複数のインディー作品を手がかりに、ゲーム内テキストを「読ませる」ための動き・配置・テンポを扱っている。記事の軸は、テキストは物語やチュートリアルを伝えるだけでなく、動き方によってゲーム世界の一部になり、プレイヤーの視線誘導や入力テンポにも関わるという点。

例として、Climb Out of Hell は Unity の基本 UI と gamefeel 系アセットで、地獄のビジュアルに合う燃えるような表示を作っている。Artius: Pure Imagination は Gamemaker と Scribble を使い、文字単位の縮小・色変化・個別アニメーションを行い、ローカライズ時の文字種差も意識している。Ghostless は複雑な tutorial sequence の検証で、文字の出る位置が「操作を妨げる説明」か「行動の結果として待っていた情報」かを分けると述べている。

短い引用: "Want people to read your text? Juice it up."

## why_relevant_to_games
チュートリアル、会話、警告 UI を「読むべき文章」ではなく、操作テンポと世界観に接続する game feel 要素として扱う候補。小規模プロトタイプでも文字表示の位置・速度・反応を評価軸にできる。
