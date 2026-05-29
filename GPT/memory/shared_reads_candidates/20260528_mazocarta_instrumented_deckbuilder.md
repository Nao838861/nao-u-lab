---
title: "Mazocarta: A Seeded Procedural Deckbuilder for Instrumented Game Development"
url: "https://arxiv.org/abs/2605.08319"
collected_at: "2026-05-28T23:29:37+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, deckbuilder, instrumentation, automated-playtesting, deterministic-simulation]
evaluated_at: "2026-05-28T23:47:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
stale_after: "2026-06-27"
supersedes: []
posted:
  ts: "1779979852.965569"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979852965569"
  char_count: 3709
  posted_at: "2026-05-29T00:10:52+09:00"
gate_reason: >-
  seeded procedural deckbuilder を、作品アイデアではなく instrumented development artifact として設計している点が強い。
  shared rules core、browser play、native simulation、E2E、save/load fixtures、1000 seeds snapshot が揃っており、
  deterministic な probe をゲーム制作サイクルに組み込む具体例として使える。
suggested_post_outline:
  overview_angle: "デッキ構築ゲームそのものより、同一 rules core を遊び・simulation・E2E・balance probe に使う reference artifact として書く。"
  analysis_axis: "seeded generation、deterministic simulation、autoplay win-rate snapshot を、最終バランスではなく regression 検出の測定点として読む。"
  application_target: "Nao_u_BOT の headless 評価、固定 seed 回帰、ゲーム本体と検証 harness の分離しすぎを避ける設計判断。"
  pros_cons: "メリットは再現可能な probes を低コストで回せること。デメリットは deckbuilder 以外へ移す際に rules core 設計の初期コストが高いこと。"
  verdict_pre: "採用。特に deterministic seed と shared rules core の運用を設計参照にする。"
---

## raw_excerpt

arXiv abstract からの要点メモ。Mazocarta は Rust で実装され、WebAssembly で browser play でき、native simulation でも実行できる seeded procedural tactical deckbuilder。新しい deckbuilding genre の発明ではなく、instrumented game-development reference artifact を作ることが主眼になっている。同じ rules engine が interactive play、native command-line simulation、automated end-to-end tests、save/load fixtures、local-area multiplayer を支える。1,000 deterministic seeds の評価 snapshot では、single-player autoplay win rate が 36.1%、two-player autoplay win rate が 34.9% と報告されているが、これは最終 balance ではなく、将来の balance shift と regression を見る repeatable probes として位置づけられている。

## why_relevant_to_games

ゲーム本体・シミュレーション・E2E テスト・balance probe を同じ rules core に寄せる設計例。Nao_u_BOT の headless 評価や deterministic seed 検証を、ゲーム実装と分離しすぎないための材料。
