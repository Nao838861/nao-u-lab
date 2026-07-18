---
title: "Reinforcement Learning in FC26: Shipping Human-Like Goalkeepers with a Designer-First Approach"
url: "https://media.gdcvault.com/gdc2026/Slides/Jones_Michael_ReinforcementLearninginFC26.pdf"
collected_at: "2026-07-19T01:18:27.3313590+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, reinforcement-learning, production, playtesting, goalkeeper]
evaluated_at: "2026-07-19T01:22:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-19T01:34:08+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784392410906539"
next_action: none
stale_after: "2026-08-18"
supersedes: []
posted:
  ts: "1784392410.906539"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784392410906539"
  char_count: 4333
  posted_at: "2026-07-19T01:34:08+09:00"
gate_reason: |-
  goalkeeper AI の heuristic 境界という問題設定から、SAC、legacy data、network reset、scenario learning、designer feedback まで手法の因果が具体的である。
  4日から12時間への学習短縮、300超の deterministic benchmark、unit test、実機性能、fail-safe が揃い、学習 AI を出荷工程へ接続する4000字級の分析に耐える。
suggested_post_outline:
  overview_angle: "RL 採用そのものではなく、人間らしい goalkeeper を毎年出荷できる designer-first production pipeline として整理する。"
  analysis_axis: "legacy AI data による初期化、recurrent network reset、scenario curriculum、短時間 fine-tuning、deterministic regression と fail-safe の接続を軸に読む。"
  application_target: "Log_cdx のゲーム制作で、敵・NPC・自動プレイヤーの挙動変更を designer feedback、headless benchmark、回帰検知、安全側 fallback へつなぐ制作サイクル。"
  pros_cons: "利点は学習挙動を短い反復と再現可能な検証へ載せられる点。弱点は simulator、dataset、benchmark の維持費が大きく、小型 prototype では全構成をそのまま導入できない点。"
  verdict_pre: "部分採用。RL 基盤全体ではなく、legacy behavior からの初期化、scenario 単位の反復、deterministic regression、fail-safe を制作パターンとして採用する。"
---

## raw_excerpt

GDC 2026 の Michael Jones / Alessandro Sestini による全130枚のスライドを、長文引用ではなく一次資料の内容メモとして保存する。FC 26 の goalkeeper AI は単一システムではなく、位置取り、クロス予測、breakaway 時の前進判断など複数の挙動から成る。手書き heuristic は境界が見えやすく、プレイヤーが継ぎ目を発見すると信頼が損なわれるため、制作現場で毎年出荷できる RL 経路を設計した。

実装は Soft Actor-Critic を基礎にし、AAA game は高 throughput simulation 用ではないという制約から sample efficiency を重視する。5 game を並列に約120fpsずつ動かし、simulation と training を別 thread に分離、約20 backward pass/秒とする。network は fully connected layer 256 を5層、約300K parameter、FP32 で約1161KB、game 内 inference は170μsと記載される。初期学習の2〜4日を短縮する三つの変更は、legacy AI data で最初に既存挙動を再現すること、local dataset への overfit を避ける recurrent network reset、段階化した scenario-based learning であり、training time は4日から12時間になった。

designer-first 部分では、プロ goalkeeper 経験を持つ producer の feedback と QV tester を scenario / dataset に接続し、old dataset を残しながら新しい挙動を fine-tune する。fine-tuning は2〜4時間。検証は既存 AI testbed を再利用し、同じ入力から同じ結果を得る deterministic iteration、gameplay behavior の unit test、300超の benchmark case、実 performance 測定、未知状態では安全側へ倒す fail-safe を組み合わせる。末尾では関連論文 arXiv:2510.23216 も案内されている。

## why_relevant_to_games

学習済みゲームAIを「動けばよい」段階から、designer feedback、短時間の再学習、deterministic regression、未知状態の安全策まで含む出荷工程へ接続する具体例として、NPC挙動設計とheadless検証の両方に参照できる。
