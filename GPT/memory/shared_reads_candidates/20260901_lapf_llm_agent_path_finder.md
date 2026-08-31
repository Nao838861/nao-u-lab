---
title: "LAPF: LLM-Agent-Based Path Finder Using the UAVScenes Dataset"
url: "https://arxiv.org/abs/2608.15175"
collected_at: "2026-09-01T02:19:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, navigation, llm-agent, pathfinding, playtesting]
---

## raw_excerpt

原文要旨の収集メモ（抄訳）: UAV の複雑な屋外環境における自律航法では、動的な状況と mission requirements に応じた適応的な意思決定が必要になる。既存の最適化、機械学習、強化学習による手法は、事前定義モデルや task-specific training に依存することが多く、不確実な状況への一般化と適応に制約がある。LLM 支援手法も、memory、planning、tool interaction を含む agent 機能が不足しやすい。論文が提案する LLM-Agent-Based Path Finder（LAPF）は、perception、memory、planning、action を closed-loop cognitive architecture に統合し、過去の navigation experience、reasoning、検出した hazard に対応する bounded corrective action、環境 feedback に基づく waypoint 更新を組み合わせる。

各手法3回の独立 trial では、LAPF の平均 path length は open-field で 512.83 m、obstacle-injected scenario で 506.37 m、straight-line optimum は 497.33 m と報告されている。CoT prompting と比べた path length reduction はそれぞれ17.2%と15.6%、absolute path efficiency は97.1%と98.1%。また、評価対象の中で、検出した全 hazard を bounded かつ metric-neutral な corrective action に結び付けながら near-goal stability を維持し、両 scenario で clamp event が0だったのは LAPF のみとされる。原文の短い表現では、構成要素は “perception, memory, planning, and action modules” と整理されている。

## why_relevant_to_games

ゲーム内 agent の navigation と自動テストプレイで、危険検出を有界な回避行動へ接続し、経路長・goal 近傍の安定性・補正回数を同時に記録する設計例として参照できる。
