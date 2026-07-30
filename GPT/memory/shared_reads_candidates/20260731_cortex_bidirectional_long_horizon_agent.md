---
title: "Cortex: A Bidirectionally Aligned Embodied Agent Framework for Long-horizon Manipulation"
url: "https://arxiv.org/abs/2607.05377"
collected_at: "2026-07-31T02:01:11.3340505+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-architecture, long-horizon, hierarchical-planning, evaluation]
---

## raw_excerpt

arXiv:2607.05377v1、2026-07-06公開。Cortex は、現在観測だけに依存する Vision-Language-Action model が長期タスクで崩れやすく、階層型の高水準 planner と低水準 controller の間にも「意味上は妥当だが実行不能」という隔たりがある、という問題を扱う。提案は、高水準 VLM から低水準 VLA へ渡す操作を32種の canonical skill primitive に標準化し、object attribute や trajectory reachability を含む実行可能性条件を planning interface に組み込むもの。4,000時間超の open-source video を自動注釈し、30時間の simulation data を生成する。subtask の切替点が学習データ内で不足しないよう event-balanced sampling を使い、推論時には task context から skill constraint までを harness として接続する。open-loop VLM と closed-loop system の両方で評価し、Libero-long では monolithic baseline を3.1%、RoboTwin では4.1%上回ったと報告する。また、generalist VLM と fine-tuned VLA を組み合わせることで、複数段階の化学実験など未見の長期タスクを zero-shot で完了した例を示している。

## why_relevant_to_games

ゲーム用 bot や headless tester で、抽象的な攻略意図を直接入力へ落とさず、有限個の実行可能な skill と遷移条件へ変換する設計の参照になる。長期プレイ評価では、計画の正しさと skill 実行・切替失敗を別々に観測する足場にもなる。
