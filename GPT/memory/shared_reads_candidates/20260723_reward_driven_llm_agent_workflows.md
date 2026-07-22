---
title: "Reward-Driven LLM Agent Workflows: Synthesizing POMDP Routing and Self-Correction for Autonomous Decision-Making"
url: "https://arxiv.org/abs/2607.17038"
collected_at: "2026-07-23T00:45:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent, evaluation, pomdp, self-correction, structured-memory]
evaluated_at: "2026-07-23T00:49:17+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-23T00:49:17+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-23T00:49:17+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  POMDP routing、Graph Memory、実行前 Critic の役割と接続が明確で、比較実験、ablation、遅延コストまで記事固有の重要要素を説明できる。
  自動 test player の観測圧縮、危険・無効 action の実行前遮断、成功率と latency の分離計測へ具体的に適用でき、約4000字の独立した分析に展開可能である。
suggested_post_outline:
  overview_angle: "部分観測・疎な報酬・誤り累積を、構造化 belief state と実行前 self-correction で扱う三段階 workflow"
  analysis_axis: "Graph Memory と Critic の寄与を ablation で分離し、成功率向上と推論時間増加の交換条件、Critic 誤判定と再生成 loop の失敗条件を検討する"
  application_target: "Log_cdx のゲーム自動 test player に、観測履歴からの state 圧縮、候補 action の実行前 gate、success・invalid action・step 数・latency の計測を導入する設計"
  pros_cons: "長期 task の誤り伝播を抑え、失敗箇所を追跡しやすい一方、step ごとの推論費用、誤った veto、記憶圧縮による重要状態の欠落が増える"
  verdict_pre: "部分採用。まず危険または不可逆な action にだけ Critic を限定し、Graph Memory の寄与と latency を個別に測る"
---

## raw_excerpt

原文要旨の収集メモ: 論文は、長期計画、疎な報酬、部分観測、動的環境での誤り累積を対象に、Reward-Driven LLM Agent Workflow（RLAW）を提示する。環境との相互作用を POMDP として記述し、現在の観測と過去の行動履歴を、entity と関係を持つ Graph Memory に圧縮して belief state の近似に使う。各 step は Generation、Critique、Execution の三段階で進む。Actor が reasoning trace と候補 action を生成し、軽量 Critic が goal、history、action を入力として論理的一貫性、安全性、目標への前進度を score 化する。閾値未満なら action を外部環境へ出さず、診断を Actor の context に戻して最大三回まで再生成する。通過した action だけを実行し、環境の疎な reward と内部 critique reward を合わせて trajectory を扱う。

実験は LLaMA-3-8B-Instruct を共通基盤に、ALFWorld と WebShop の各 500 episode で Zero-Shot、ReAct、RLAW を比較したと報告する。ALFWorld の success rate は ReAct 54.1% に対して RLAW 78.6%、WebShop は 42.3% に対して 65.8%。ALFWorld の ablation では full RLAW 78.6%、Critique なし 61.2%、Graph Memory なし 68.4%、両方なし 54.1% とされる。平均処理時間は ReAct の 1.20 秒／step に対して full RLAW 2.15 秒／step。著者は、Critic 自身の誤判定、context 上限による attention dilution、再生成 loop、1.8～2.5 倍の推論 overhead を制約として挙げている。

## why_relevant_to_games

部分観測のゲーム内 agent や自動 test playerで、候補行動を実行前に検査する loop、world state の構造記憶、success rate・step 数・invalid action・latency を分けて測る評価設計を検討する場面に接続できる。
