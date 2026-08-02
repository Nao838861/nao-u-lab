---
title: "Tycho: Active Abstraction with Programmatic World Models for ARC-AGI-3"
url: "https://arxiv.org/abs/2607.28287"
collected_at: "2026-08-02T16:47:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-playtesting, world-model, rule-discovery, arc-agi-3]
---

## raw_excerpt

ARC-AGI-3 は、未知のゲームを操作しながらルール、隠れ状態、目標を推定し、各行動にコストがあるため少ない手数で進めることを求める。Tycho は、この環境を parameterized rendered deterministic Moore machine として形式化し、ゲーム固有の実行可能な仮説モデルを構築・検査・利用する coding-agent system である。観測履歴では、操作可能な状態を中間 animation、level-completion、game-over frame から分離する。agent は構造化された履歴からモデルを作り、テストし、計画に使い、検証失敗後に修復し、必要ならモデルを使わず直接行動する。

25 種の公開ゲームを同じ inference budget で比較した実験では、actor が必要時に model builder へ委譲する方針が、Claude Opus 4.8 で平均 Relative Human Action Efficiency 88.49 を記録した。選択した方針では GPT-5.6 Sol と Opus 5 が全 183 level を完了し、RHAE 100.00 に達した。一方、検証失敗のたびに自動修復する方針は遷移再現精度を上げても RHAE 83.07 に留まった。著者らは、正確な simulator を作るだけでは目標同定や次行動の改善は保証されず、いつモデルを構築・修復・使用・迂回するかまで含む問題を短く "active abstraction" と呼ぶ。

## why_relevant_to_games

未知メカニクスを遊びながら発見する AI テスターの設計で、world model の正確さとプレイ効率を別々に測る評価軸、およびモデル構築を常時行わず必要時に委譲する orchestration の比較材料になる。
