---
title: "An Appraisal Transition System for Event-driven Emotions in Agent-based Player Experience Testing"
url: "https://arxiv.org/abs/2105.05589"
collected_at: "2026-05-30T12:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [player-experience, automated-testing, agent, emotion, telemetry]
evaluated_at: "2026-05-30T12:36:46+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: ready_to_post
stale_after: "2026-06-29"
supersedes: []
gate_reason: >
  PX testing を人手アンケートだけに頼らず、OCC theory ベースの appraisal transition と agent execution に接続する問題設定が明確。
  aplib prototype、2D game case study、heat map 可視化という評価・利用形もあり、headless 評価の次段へ具体的に接続できるため pass。
suggested_post_outline:
  overview_angle: "自動テストを score / reachability から event-driven emotion と designer-readable heatmap へ拡張する研究として書く。"
  analysis_axis: "PX requirement、OCC theory、appraisal transition system、aplib agent、2D case study、emotion heatmap が設計者の判断材料になる流れ。"
  application_target: "Nao_u_BOT の headless playtest で death / near miss / resource gain / blocked route などの event を emotion proxy に変換し、体験上の詰まりを可視化する。"
  pros_cons: "利点は自動テスト結果を体験仮説へ翻訳できる点。弱点は emotion model の妥当性が設計者の仮説に依存し、人間評価の代替にはならない点。"
  verdict_pre: "部分採用。人間評価の代替ではなく、次に人が見るべき場面を絞る telemetry layer として採用する。"
---

## raw_excerpt
原文短句: "automated testing of player experience"

著作権配慮のため、abstract の逐語引用ではなく要点メモとして保存する。Ansari / Prasetya / Dastani / Dignum / Keller による 2021 年 EMAS / AAMAS 関連論文。PX 評価は人間プレイヤーへの手動調査に寄りがちだが、開発初期には人間参加なしで PX requirement を評価したい、という問題設定。提案は event-based emotion の formal model で、OCC theory of emotions を使い、ゲーム内イベントから感情 appraisal を遷移システムとして表す。Aplib という tactical agent programming library 上に prototype を統合し、3D game case study で intelligent PX test agents を作る。結果は heat map などとして可視化され、どのコンテンツが特定の体験を呼び起こすかを設計者が見る補助になる。

## why_relevant_to_games
headless agent 評価を score だけでなく、イベント列からの感情・体験推定に拡張する発想の候補になる。
