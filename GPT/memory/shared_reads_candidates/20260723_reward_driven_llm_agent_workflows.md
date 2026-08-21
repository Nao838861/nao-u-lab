---
title: "Reward-Driven LLM Agent Workflows: Synthesizing POMDP Routing and Self-Correction for Autonomous Decision-Making"
url: "https://arxiv.org/abs/2607.17038"
collected_at: "2026-07-23T00:45:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent, evaluation, pomdp, self-correction, structured-memory]
evaluated_at: "2026-08-22T02:34:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-22T02:34:54+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-22T02:34:54+09:00; Phase 3 source audit: arXiv:2607.17038v1 and public repository commit 8d3408c do not reproduce the published benchmark path"
next_action: keep_for_reference
stale_after: "2026-09-21"
supersedes: []
gate_reason: >-
  POMDP routing、Graph Memory、実行前 Critic という設計案は、自動 test player の観測圧縮と不可逆 action の実行前 gate に接続できる。
  しかし Phase 3 で公開実装を監査したところ、論文の ALFWorld / WebShop 各 500 episode を再現する評価経路はなく、公開 evaluate.py は手書きの mock actor・mock critic・3 task 環境だけを実行する。
  論文表の 78.6%、65.8%、2.15 秒などは実測から計算されず README とスクリプトの固定文字列として再掲され、50,000 critique trace と記載された公開 dataset も約 2 KB に留まる。
  分散、信頼区間、seed、統計検定、hallucination 判定注釈の再現手順も示されないため、主結果を検証済み事実として #shared-reads に残せない。
  30日後の再評価でも再現可能な benchmark artifact はなく、主要数値を検証済み事実として残せない。方法アイデアは参照用に保持するが投稿候補としては不採用にする。
---

## raw_excerpt

原文要旨の収集メモ: 論文は、長期計画、疎な報酬、部分観測、動的環境での誤り累積を対象に、Reward-Driven LLM Agent Workflow（RLAW）を提示する。環境との相互作用を POMDP として記述し、現在の観測と過去の行動履歴を、entity と関係を持つ Graph Memory に圧縮して belief state の近似に使う。各 step は Generation、Critique、Execution の三段階で進む。Actor が reasoning trace と候補 action を生成し、軽量 Critic が goal、history、action を入力として論理的一貫性、安全性、目標への前進度を score 化する。閾値未満なら action を外部環境へ出さず、診断を Actor の context に戻して最大三回まで再生成する。通過した action だけを実行し、環境の疎な reward と内部 critique reward を合わせて trajectory を扱う。

実験は LLaMA-3-8B-Instruct を共通基盤に、ALFWorld と WebShop の各 500 episode で Zero-Shot、ReAct、RLAW を比較したと報告する。ALFWorld の success rate は ReAct 54.1% に対して RLAW 78.6%、WebShop は 42.3% に対して 65.8%。ALFWorld の ablation では full RLAW 78.6%、Critique なし 61.2%、Graph Memory なし 68.4%、両方なし 54.1% とされる。平均処理時間は ReAct の 1.20 秒／step に対して full RLAW 2.15 秒／step。著者は、Critic 自身の誤判定、context 上限による attention dilution、再生成 loop、1.8～2.5 倍の推論 overhead を制約として挙げている。

## why_relevant_to_games

部分観測のゲーム内 agent や自動 test playerで、候補行動を実行前に検査する loop、world state の構造記憶、success rate・step 数・invalid action・latency を分けて測る評価設計を検討する場面に接続できる。
