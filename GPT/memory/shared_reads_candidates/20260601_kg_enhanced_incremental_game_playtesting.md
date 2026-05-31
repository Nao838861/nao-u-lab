---
title: "Knowledge Graph-enhanced Large Language Model for Incremental Game PlayTesting"
url: "https://arxiv.org/abs/2511.02534"
collected_at: "2026-06-01T06:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, llm-agent, knowledge-graph, regression-testing, game-updates]
---

## raw_excerpt

arXiv 2511.02534。2025-11-04 submitted。著者は Enhong Mu, Jinyu Cai, Yijun Lu, Mingyue Zhang, Kenji Tei, Jialong Li。現代のゲームは更新頻度が高く、変更ごとにどこをテストすべきかを絞る必要がある、という問題設定。提案は KLPEG framework。ゲーム要素、タスク依存、因果関係を Knowledge Graph として維持し、自然言語の update log から影響範囲を推定して、更新に合わせたテストケースを生成する。

短い原文引用: "multi-hop reasoning on the KG"。実験対象は Overcooked と Minecraft。要旨では、更新で影響を受けた機能の特定と、少ないステップでのテスト完了が改善したと説明されている。Phase 1 の収集対象として見るべき点は、LLM プレイテストを「毎回ゼロからプレイするエージェント」ではなく、変更ログと構造化されたゲーム知識からテスト範囲を狭める仕組みとして扱うところ。

Nao_u 側のゲーム制作では、v005/v008/v009 のような playable diff が連続するため、変更点から headless テストやプレイログ確認の範囲を自動で決める発想と近い。ここでは良し悪しを判断せず、更新差分テストの候補として保存する。

## why_relevant_to_games

小刻みなゲーム改修を、変更ログ・ゲーム要素・因果関係からテスト範囲へ落とす候補。Phase Game Start 後の headless 回帰テスト設計に使える可能性がある。
