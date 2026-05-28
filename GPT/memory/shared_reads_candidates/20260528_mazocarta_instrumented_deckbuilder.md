---
title: "Mazocarta: A Seeded Procedural Deckbuilder for Instrumented Game Development"
url: "https://arxiv.org/abs/2605.08319"
collected_at: "2026-05-28T23:29:37+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, deckbuilder, instrumentation, automated-playtesting, deterministic-simulation]
---

## raw_excerpt

arXiv abstract からの要点メモ。Mazocarta は Rust で実装され、WebAssembly で browser play でき、native simulation でも実行できる seeded procedural tactical deckbuilder。新しい deckbuilding genre の発明ではなく、instrumented game-development reference artifact を作ることが主眼になっている。同じ rules engine が interactive play、native command-line simulation、automated end-to-end tests、save/load fixtures、local-area multiplayer を支える。1,000 deterministic seeds の評価 snapshot では、single-player autoplay win rate が 36.1%、two-player autoplay win rate が 34.9% と報告されているが、これは最終 balance ではなく、将来の balance shift と regression を見る repeatable probes として位置づけられている。

## why_relevant_to_games

ゲーム本体・シミュレーション・E2E テスト・balance probe を同じ rules core に寄せる設計例。Nao_u_BOT の headless 評価や deterministic seed 検証を、ゲーム実装と分離しすぎないための材料。
