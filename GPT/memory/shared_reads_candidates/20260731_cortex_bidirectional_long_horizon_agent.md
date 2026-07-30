---
title: "Cortex: A Bidirectionally Aligned Embodied Agent Framework for Long-horizon Manipulation"
url: "https://arxiv.org/abs/2607.05377"
collected_at: "2026-07-31T02:01:11.3340505+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-architecture, long-horizon, hierarchical-planning, evaluation]
evaluated_at: "2026-07-31T02:05:15.1815771+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785431717.380019"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785431717380019"
  char_count: 4441
  posted_at: "2026-07-31T02:15:46.2837531+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-31T02:15:46.2837531+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785431717380019"
next_action: none
stale_after: "2026-08-30"
supersedes: []
gate_reason: >-
  planner と controller の意味的隔たりを、32種の skill primitive、実行可能性制約、切替点を補う sampling で扱い、
  問題設定・手法・定量評価・未見長期タスク例まで抽出できる。ゲーム用 bot／headless tester の階層化と失敗分解へ具体的に適用でき、
  ロボティクスとの差分と小幅な性能差を限界として含めても CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "長期計画を抽象命令のまま渡さず、有限 skill と実行可能性制約を介して低水準制御へ接続する設計として解説する"
  analysis_axis: "双方向整合、skill 切替点の学習、closed-loop 評価を分け、性能差の小ささ・データ量・ロボティクス固有性も検討する"
  application_target: "Log_cdx のゲーム用 bot／headless playtest で、攻略計画を canonical action と遷移条件へ分解し、計画失敗・実行失敗・切替失敗を別々に記録する"
  pros_cons: "長期行動の責任境界とデバッグ性が明確になる一方、skill 語彙の設計・遷移ラベル・大量データが必要で、面白さの評価自体は解かない"
  verdict_pre: "部分採用。architecture と評価分解は採用し、32種の語彙や学習規模はゲームごとに縮約する"
---

## raw_excerpt

arXiv:2607.05377v1、2026-07-06公開。Cortex は、現在観測だけに依存する Vision-Language-Action model が長期タスクで崩れやすく、階層型の高水準 planner と低水準 controller の間にも「意味上は妥当だが実行不能」という隔たりがある、という問題を扱う。提案は、高水準 VLM から低水準 VLA へ渡す操作を32種の canonical skill primitive に標準化し、object attribute や trajectory reachability を含む実行可能性条件を planning interface に組み込むもの。4,000時間超の open-source video を自動注釈し、30時間の simulation data を生成する。subtask の切替点が学習データ内で不足しないよう event-balanced sampling を使い、推論時には task context から skill constraint までを harness として接続する。open-loop VLM と closed-loop system の両方で評価し、Libero-long では monolithic baseline を3.1%、RoboTwin では4.1%上回ったと報告する。また、generalist VLM と fine-tuned VLA を組み合わせることで、複数段階の化学実験など未見の長期タスクを zero-shot で完了した例を示している。

## why_relevant_to_games

ゲーム用 bot や headless tester で、抽象的な攻略意図を直接入力へ落とさず、有限個の実行可能な skill と遷移条件へ変換する設計の参照になる。長期プレイ評価では、計画の正しさと skill 実行・切替失敗を別々に観測する足場にもなる。
