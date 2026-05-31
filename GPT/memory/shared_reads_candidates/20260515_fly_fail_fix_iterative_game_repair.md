---
title: "Fly, Fail, Fix: Iterative Game Repair with Reinforcement Learning and Large Multimodal Models"
url: "https://arxiv.org/abs/2507.12666"
collected_at: "2026-05-15T06:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, automated-playtesting, ai-assisted-design, reinforcement-learning, multimodal]
evaluated_at: "2026-05-15T07:02:42+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T07:07:15.148045+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778796436646579"
posted:
  ts: "1778796436.646579"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778796436646579"
  char_count: 3565
  posted_at: "2026-05-15T07:07:15.148045+09:00"
next_action: none
gate_reason: >-
  問題設定、RL playtest、LMM による mechanics parameter 修正、比較条件、限界が候補内で揃っている。
  Nao_u 環境の headless harness を「測定から小修正へ」進める具体場面に接続でき、CoopEval 水準の概要も書ける。
suggested_post_outline:
  overview_angle: "プレイログを設計入力に変え、Flappy Bird 系のパラメータを閉ループで修正する枠組みとして書く"
  analysis_axis: "静的読解ではなく、RL agent の失敗軌跡と LMM の修正提案を反復させる点、text/image trace の比較、brittleness の限界"
  application_target: "headless 評価で検出したスコア・生存時間・画面状態から、敵密度や移動量など小さな mechanics parameter を調整する probe"
  pros_cons: "測定から修正へ進める利点が大きい一方、単一 agent 依存と RL の脆さ、人間プレイヤー多様性の欠落が弱点"
  verdict_pre: "部分採用"

---

## raw_excerpt

NVIDIA Research / arXiv の 2025 年論文。ゲーム設計を、静的なコードやアセットだけで読むのではなく、プレイ行動のログから反復修正する枠組みとして扱う。短い原文断片では、RL agent が playtest し、LMM がそれを見て設定を直すという構図が示されている: "RL agent, which playtests the game" / "LMM, which revises the game"。

対象は Flappy Bird 系の設定修正。プレイヤー役は DQN agent、デザイナー役は GPT-4.1。各 iteration で agent が 5 episode をプレイし、score や flight time のテキスト指標、または直近 gameplay frame の image strip を LMM に渡す。LMM は目標スコア 10 に近づくように YAML の設定値を修正する。条件は config-only / text-only / image-only / text+image の比較。config-only は改善しにくく、text や image の行動トレースを渡すと目標スコア周辺へ近づいた、という報告。

重要なのは、単に「AI がゲームを作る」ではなく、play trace を入力にして mechanics parameter を閉ループで動かす点。論文中でも、visual data だけでも gameplay behavior から design parameter を調整できる可能性が述べられている。一方で、player physics の小変更で RL agent performance が崩れる brittleness、単一 agent では human player diversity の代替にならない点、将来は ensemble agents や code modification へ広げたい点も挙げている。

## why_relevant_to_games

Nao_u 環境の headless / harness が「測定だけ」で終わらず、プレイログから小さな設計パラメータを反復修正するループにできるかを考える材料になる。
