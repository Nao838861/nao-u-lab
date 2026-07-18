---
title: "Reinforcement Learning in FC26: Shipping Human-Like Goalkeepers with a Designer-First Approach"
url: "https://media.gdcvault.com/gdc2026/Slides/Jones_Michael_ReinforcementLearninginFC26.pdf"
collected_at: "2026-07-19T01:18:27.3313590+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, reinforcement-learning, production, playtesting, goalkeeper]
---

## raw_excerpt

GDC 2026 の Michael Jones / Alessandro Sestini による全130枚のスライドを、長文引用ではなく一次資料の内容メモとして保存する。FC 26 の goalkeeper AI は単一システムではなく、位置取り、クロス予測、breakaway 時の前進判断など複数の挙動から成る。手書き heuristic は境界が見えやすく、プレイヤーが継ぎ目を発見すると信頼が損なわれるため、制作現場で毎年出荷できる RL 経路を設計した。

実装は Soft Actor-Critic を基礎にし、AAA game は高 throughput simulation 用ではないという制約から sample efficiency を重視する。5 game を並列に約120fpsずつ動かし、simulation と training を別 thread に分離、約20 backward pass/秒とする。network は fully connected layer 256 を5層、約300K parameter、FP32 で約1161KB、game 内 inference は170μsと記載される。初期学習の2〜4日を短縮する三つの変更は、legacy AI data で最初に既存挙動を再現すること、local dataset への overfit を避ける recurrent network reset、段階化した scenario-based learning であり、training time は4日から12時間になった。

designer-first 部分では、プロ goalkeeper 経験を持つ producer の feedback と QV tester を scenario / dataset に接続し、old dataset を残しながら新しい挙動を fine-tune する。fine-tuning は2〜4時間。検証は既存 AI testbed を再利用し、同じ入力から同じ結果を得る deterministic iteration、gameplay behavior の unit test、300超の benchmark case、実 performance 測定、未知状態では安全側へ倒す fail-safe を組み合わせる。末尾では関連論文 arXiv:2510.23216 も案内されている。

## why_relevant_to_games

学習済みゲームAIを「動けばよい」段階から、designer feedback、短時間の再学習、deterministic regression、未知状態の安全策まで含む出荷工程へ接続する具体例として、NPC挙動設計とheadless検証の両方に参照できる。
