---
title: "An Appraisal Transition System for Event-driven Emotions in Agent-based Player Experience Testing"
url: "https://arxiv.org/abs/2105.05589"
collected_at: "2026-05-30T12:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [player-experience, automated-testing, agent, emotion, telemetry]
---

## raw_excerpt
原文短句: "automated testing of player experience"

著作権配慮のため、abstract の逐語引用ではなく要点メモとして保存する。Ansari / Prasetya / Dastani / Dignum / Keller による 2021 年 EMAS / AAMAS 関連論文。PX 評価は人間プレイヤーへの手動調査に寄りがちだが、開発初期には人間参加なしで PX requirement を評価したい、という問題設定。提案は event-based emotion の formal model で、OCC theory of emotions を使い、ゲーム内イベントから感情 appraisal を遷移システムとして表す。Aplib という tactical agent programming library 上に prototype を統合し、3D game case study で intelligent PX test agents を作る。結果は heat map などとして可視化され、どのコンテンツが特定の体験を呼び起こすかを設計者が見る補助になる。

## why_relevant_to_games
headless agent 評価を score だけでなく、イベント列からの感情・体験推定に拡張する発想の候補になる。
