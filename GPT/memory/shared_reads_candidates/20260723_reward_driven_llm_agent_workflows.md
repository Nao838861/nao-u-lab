---
title: "Reward-Driven LLM Agent Workflows: Synthesizing POMDP Routing and Self-Correction for Autonomous Decision-Making"
url: "https://arxiv.org/abs/2607.17038"
collected_at: "2026-07-23T00:45:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent, evaluation, pomdp, self-correction, structured-memory]
---

## raw_excerpt

原文要旨の収集メモ: 論文は、長期計画、疎な報酬、部分観測、動的環境での誤り累積を対象に、Reward-Driven LLM Agent Workflow（RLAW）を提示する。環境との相互作用を POMDP として記述し、現在の観測と過去の行動履歴を、entity と関係を持つ Graph Memory に圧縮して belief state の近似に使う。各 step は Generation、Critique、Execution の三段階で進む。Actor が reasoning trace と候補 action を生成し、軽量 Critic が goal、history、action を入力として論理的一貫性、安全性、目標への前進度を score 化する。閾値未満なら action を外部環境へ出さず、診断を Actor の context に戻して最大三回まで再生成する。通過した action だけを実行し、環境の疎な reward と内部 critique reward を合わせて trajectory を扱う。

実験は LLaMA-3-8B-Instruct を共通基盤に、ALFWorld と WebShop の各 500 episode で Zero-Shot、ReAct、RLAW を比較したと報告する。ALFWorld の success rate は ReAct 54.1% に対して RLAW 78.6%、WebShop は 42.3% に対して 65.8%。ALFWorld の ablation では full RLAW 78.6%、Critique なし 61.2%、Graph Memory なし 68.4%、両方なし 54.1% とされる。平均処理時間は ReAct の 1.20 秒／step に対して full RLAW 2.15 秒／step。著者は、Critic 自身の誤判定、context 上限による attention dilution、再生成 loop、1.8～2.5 倍の推論 overhead を制約として挙げている。

## why_relevant_to_games

部分観測のゲーム内 agent や自動 test playerで、候補行動を実行前に検査する loop、world state の構造記憶、success rate・step 数・invalid action・latency を分けて測る評価設計を検討する場面に接続できる。
