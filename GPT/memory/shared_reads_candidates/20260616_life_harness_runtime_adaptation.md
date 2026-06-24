---
title: "Adapting the Interface, Not the Model: Runtime Harness Adaptation for Deterministic LLM Agents"
url: "https://arxiv.org/abs/2605.22166"
collected_at: "2026-06-16T14:14:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, evaluation, deterministic-environment, game-testing]
evaluated_at: "2026-06-16T14:18:59+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T14:26:55+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781587493063119"
next_action: none
stale_after: "2026-07-16"
supersedes: []
posted:
  ts: "1781587493.063119"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781587493063119"
  char_count: 3690
  posted_at: "2026-06-16T14:26:55+09:00"
gate_reason: |-
  LLM agent の失敗をモデル能力ではなく runtime harness 側の観測、ツール、実行、フィードバック、trajectory 制御の問題として分解する軸が明確。
  8 model backbones / 126 settings / 116 settings 改善 / average relative improvement 88.5% という評価要素があり、ゲーム用 headless bot や LLM tester の改善手順へ直結する。
suggested_post_outline:
  overview_angle: "deterministic なゲーム環境で agent が失敗した時、モデル変更前に runtime harness を診断・適応する方法として書く。"
  analysis_axis: "environment contract / procedural skill / action realization / trajectory regulation の再利用可能 intervention と、held-out 評価での転移性。"
  application_target: "自作ゲームの自動テスト、LLM 操作エージェント、失敗ログからの harness 改善ループ。"
  pros_cons: "モデルを触らず改善できる一方、harness 設計・失敗分類・環境 contract の整備が必要。"
  verdict_pre: "採用"
---

## raw_excerpt
arXiv 2605.22166。Tianshi Xu, Huifeng Wen, Meng Li による Life-Harness 論文。論文は、LLM agent の失敗を model weight 側だけでなく runtime harness 側の問題として扱う。対象は deterministic で rule-governed な環境で、observation、tool use、action execution、feedback interpretation、trajectory control を仲介する interface が agent の実力を大きく左右するという立て付け。Life-Harness は frozen LLM と評価環境を変えず、training trajectories で繰り返し出る失敗を、environment contract、procedural skill、action realization、trajectory regulation の reusable intervention に変換し、held-out evaluation 時には固定した harness として使う。

ローカル raw web research では、7 つの deterministic environments、18 model backbones、126 model-environment settings のうち 116 settings で改善し、average relative improvement 88.5% と記録されている。Qwen3-4B-Instruct trajectory から作った harness が他モデルにも転移した、という報告もある。重要語句としては "Adapting the Interface, Not the Model" と "runtime interface adaptation"。

## why_relevant_to_games
自作ゲームの headless bot / LLM tester が失敗した時、モデルやゲーム本体をすぐ変える前に、観測形式・入力実行・失敗回復・trajectory 制御を harness 側で改善する候補として使える。
