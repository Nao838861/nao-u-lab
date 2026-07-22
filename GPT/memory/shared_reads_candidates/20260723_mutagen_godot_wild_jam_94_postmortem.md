---
title: "Godot Wild Jam #94"
url: "https://itch.io/devlog/1567962/godot-wild-jam-94"
collected_at: "2026-07-23T02:46:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, godot, scope, input-buffering]
evaluated_at: "2026-07-23T02:49:24+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-23T02:49:24+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-23T02:49:24+09:00"
next_action: keep_for_reference
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  短期制作での mechanic 固定、template 再利用、polish と体験設計の配分という論点は具体的だが、
  評価手順・比較結果・再現可能な判断基準が薄く、CoopEval 水準の約4000字へ展開すると一般論による水増しになる。
---

## raw_excerpt

本文要点の日本語収集メモ（長文の逐語引用ではなく言い換え）。bitbrain は Godot Wild Jam #94 の9日間で、色を組み合わせて自機を変異させ、現在色に応じて portal と door を利用する迷路 game『Mutagen』を制作した。初日は別案だったが、配信 chat に出た「色を混ぜて新しい色を作る」という発想から2日目朝に中核 mechanic を定めた。作者は完成順位より制作過程を目的に置き、AI / LLM を使わず手作業で進め、途中3日間と8日目の大半を休み、実作業を約5日間に抑えたと記す。

制作後の振り返りでは、template project を避けた結果、sound control と settings の再実装へ時間を使ったこと、visual と sound の polish に比べて player experience と物語の呼吸を設計できなかったことを挙げる。主人公 Marvin の動機や gameplay 外の challenge を見せる余地が intro 以外になく、本来は感情的な物語を狙っていたが level 内で展開できなかったという。今後の patch 項目は、高速移動時の jankiness を input buffering で軽減することと、player が stuck する場所を修正すること。記事は、短期制作の中核 mechanic、休む判断、基盤 template、polish と experience の配分、入力受付の改善候補を同じ postmortem に残している。

短い原文断片: “the process itself was the entire purpose of doing the jam.”

## why_relevant_to_games

game jam で中核 mechanic を早期に固定する場面、既存 template を使う範囲、polish と物語・体験設計の時間配分、高速操作の input buffering と stuck 防止を検討する場面に接続できる。
