---
title: "Make your game great with touch"
url: "https://developer.apple.com/videos/play/wwdc2026/358/"
collected_at: "2026-08-13T14:16:21+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, controls, touch, mobile, game-feel, accessibility]
---

## raw_excerpt

Apple の WWDC26 セッションは、既存の物理コントローラ対応を Touch Controller framework へ接続する実装と、タッチ固有の操作設計を段階的に示す。まず九つの anchor、safe area、section grouping を使い、端末サイズが変わっても頻用操作を親指の近くに保ち、Dynamic Island やホームインジケータ、キャラクター表示と重ならない配置を作る。次に、物理ボタンの一対一コピーで画面を埋めず、現在の行動を表す icon へ更新し、拾える物が近い時だけ pickup、QTE 中だけ escape、選択中の power に応じた action を表示する。移動は左半面を thumbstick の入力領域にし、傾き量で walk と sprint を分ける。camera は右 stick の模倣ではなく相対値を返す全画面 touchpad に置き換え、過回転と初動の遅さを避ける。複数指を要求する L1+R1 や aim・move・release は一つの長押し／drag 操作へ畳み、押下状態、stick animation、sprint halo で入力と結果の対応を返す。原文の設計転換は “Players can jump into my game with only two fingers” と要約される。

## why_relevant_to_games

PC／controller 前提の操作を mobile へ移す際、ボタン縮小ではなく、同時入力数・文脈依存表示・入力領域・状態フィードバックを再設計するための具体例として使える。
