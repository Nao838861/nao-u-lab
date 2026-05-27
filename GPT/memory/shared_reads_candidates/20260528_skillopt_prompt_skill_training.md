---
title: "SkillOpt: Optimizing Skills for Automated Agents"
url: "https://arxiv.org/pdf/2605.23904"
collected_at: "2026-05-28T01:29:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, skills, prompt-optimization, evaluation, game-dev-workflow]
---

## raw_excerpt

Slack #shared-reads 由来メモ: SkillOpt は、AI agent の skill、つまりタスク実行用プロンプトや指示文を、経験則ではなく閉ループで最適化する枠組みとして紹介されていた。要点は、タスクを実行する agent と skill を改善する optimizer を分けること、編集後の skill を検証セットで評価してスコアが上がった時だけ採用すること、テキスト編集にも学習率のような予算を置いて全書き換えを避けること、拒否された編集も buffer として残し次の meta update に使うこと。Slack 投稿では「1 step あたり 4-8 編集、最終 skill は 1-4 個の core 修正に収束しやすい」という観点もメモされていた。

## why_relevant_to_games

ゲーム制作向けの agent skill や headless 評価 skill を、失敗ログから小さく検証付きで改善する運用に転用できる。
