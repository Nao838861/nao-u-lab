---
title: "Make your game great with touch"
url: "https://developer.apple.com/videos/play/wwdc2026/358/"
collected_at: "2026-08-13T14:16:21+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, controls, touch, mobile, game-feel, accessibility]
evaluated_at: "2026-08-13T14:21:19.8352277+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-13T14:21:19.8352277+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-13T14:21:19.8352277+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  物理 controller の縮小移植が起こす画面占有と多指同時入力の問題に対し、文脈依存表示、入力領域の再配置、gesture 圧縮、状態 feedback を一つの設計手順として具体例付きで抽出できる。
  二本指という明確な制約へ操作系を再設計する過程は mobile／browser prototype の監査へ直接適用でき、定量評価の不在を限界として扱っても約4000字の独立分析に耐える。
suggested_post_outline:
  overview_angle: "controller のボタンを画面へ写す話ではなく、二本指という入力予算から操作体系を組み直す設計事例として説明する"
  analysis_axis: "同時入力数の制約、文脈依存 action、左右の空間役割、gesture への圧縮、押下状態 feedback がどう一つの操作系を作るか"
  application_target: "Log_cdx の mobile／browser prototype で、必須 action、同時入力、親指の移動量、画面遮蔽、入力結果の視認性を実装前後に監査する"
  pros_cons: "操作数と画面占有を減らし入力意図を伝えやすい一方、文脈切替による予測不能、隠れた gesture、端末差、定量的 playtest 根拠の不足が残る"
  verdict_pre: "部分採用"
---

## raw_excerpt

Apple の WWDC26 セッションは、既存の物理コントローラ対応を Touch Controller framework へ接続する実装と、タッチ固有の操作設計を段階的に示す。まず九つの anchor、safe area、section grouping を使い、端末サイズが変わっても頻用操作を親指の近くに保ち、Dynamic Island やホームインジケータ、キャラクター表示と重ならない配置を作る。次に、物理ボタンの一対一コピーで画面を埋めず、現在の行動を表す icon へ更新し、拾える物が近い時だけ pickup、QTE 中だけ escape、選択中の power に応じた action を表示する。移動は左半面を thumbstick の入力領域にし、傾き量で walk と sprint を分ける。camera は右 stick の模倣ではなく相対値を返す全画面 touchpad に置き換え、過回転と初動の遅さを避ける。複数指を要求する L1+R1 や aim・move・release は一つの長押し／drag 操作へ畳み、押下状態、stick animation、sprint halo で入力と結果の対応を返す。原文の設計転換は “Players can jump into my game with only two fingers” と要約される。

## why_relevant_to_games

PC／controller 前提の操作を mobile へ移す際、ボタン縮小ではなく、同時入力数・文脈依存表示・入力領域・状態フィードバックを再設計するための具体例として使える。
