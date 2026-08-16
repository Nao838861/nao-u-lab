---
title: "Game Design Deep Dive: Dandara's unique jump-only movement mechanic"
url: "https://www.gamedeveloper.com/design/game-design-deep-dive-i-dandara-i-s-unique-jump-only-movement-mechanic"
collected_at: "2026-08-16T23:30:49+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, platformer, input-design, level-design, postmortem]
---

## raw_excerpt

Dandara の共同創業者 João Brant による開発解説。出発点は、mobile の touch screen に既存 console 操作を移植するのではなく、touch の開始と解放をどちらも即時的な入力として使う "Touch Release" と swipe から設計することだった。初期案には歩行もあったが、角度付き面で意図しない移動が混ざる一方、対向面へ跳ぶ動きが強い運動感を生んだため、歩行を削って jump-only に絞った。

自由着地は高速移動の快感と引き換えに、着地失敗や戻り操作でテンポを壊した。そこで jump range を制限し、有効な白い target area だけへ着地可能にした。指を離す瞬間の方向ぶれには最後の有効 aim を保持し、swipe の長さに応じて side raycaster の探索幅を広げる補助を入れた。攻撃も、画面外から安全に倒せる長射程 machine gun と auto-aim から、接近と位置取りを要求する短射程の広角 shot へ変更した。

level design では、誤着地後に進みたい方向へ戻れず一度後退を強いられる "mini dead-end"、壁沿い jump、敵配置や camera trigger が一時的な行き止まりを作る問題を room 制約として抽出した。gamepad への移植では touch 操作の直訳を断念し、移動と攻撃を同じ stick で aim し、接地後の次 jump に向けて方向 vector を反転する補助を採用した。

## why_relevant_to_games

固有の移動 verb を、入力方式、intent 補助、武器射程、room topology、別 controller への移植まで一体で反復した事例。platformer の操作感設計と、失敗後に余計な後退を生む level 構造の検査に参照できる。
