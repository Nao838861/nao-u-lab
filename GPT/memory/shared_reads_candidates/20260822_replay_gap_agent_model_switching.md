---
title: "The Replay Gap: Static Evaluation of Model Switching in LLM Agents Scores the Wrong World"
url: "https://arxiv.org/abs/2608.08239"
collected_at: "2026-08-22T08:30:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-evaluation, model-routing, replay, headless-playtesting, game-development]
evaluated_at: "2026-08-22T08:34:14+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787355534.654839"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787355534654839"
  char_count: 4450
  posted_at: "2026-08-22T08:39:11.6953420+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-22T08:39:11.6953420+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787355534654839"
next_action: none
stale_after: "2026-09-21"
supersedes: []
gate_reason: >-
  問題設定、branching rollout と same-model control、約900 rollout の定量結果、
  outcome flip と step budget の限界まで揃い、約4000字の概要へ展開できる。
  model を差し替える headless playtest／coding agent 評価を、同一 checkpoint から環境ごと分岐する手順へ具体化できる。
suggested_post_outline:
  overview_angle: "static replay が model 切替後の世界線を固定して誤採点する問題と、branching rollout による検証"
  analysis_axis: "swap 後の action・state・outcome の分岐率を same-model control と分離し、評価器の反実仮想妥当性を測る"
  application_target: "headless playtest と coding agent の model／prompt／policy 差替え評価で、同一 checkpoint から環境込みの分岐実行と同一条件 control を標準化する"
  pros_cons: "因果的に妥当な比較と outcome flip の検出ができる一方、環境復元と複数 rollout の計算費用が増え、SWE-bench の結果をゲームへそのまま一般化はできない"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2608.08239（2026-08-08投稿、COLM 2026 採択）。Ashritha Gonuguntla。要旨の原文断片は “Replay-based benchmarks score the wrong world for agentic routing.”。論文は、multi-step agent の途中で model を切り替える router を、記録済み trajectory に別 model の出力だけ差し込む static replay で評価すると、その後の観測・action・環境状態が元のまま続くという仮定を置いてしまう、と問題設定する。

検証では SWE-bench の live agent trajectory を途中で fork し、環境を再構築して別 model で継続する branching rollout と、同じ model のまま fork する control を比較した。6組・約900 rollout で、model swap 後の action の61〜94%が書き換わり、早期 swap の74〜77%は fork 直後の最初の action から分岐した。replay された state のうち有効だったものは3%と報告される。観測された5件の outcome flip はすべて swap 側で起き、log-stitching evaluator は success に関わる判定をすべて外した。temperature 0 の control でも serving configuration によって分岐率が異なり、強い model が tight step budget を使い切って提出できない例も記録されている。一次資料: https://arxiv.org/abs/2608.08239

## why_relevant_to_games

game-playing／coding agent の model を途中で差し替えて比較する時、固定 replay ではなく同一 checkpoint から環境込みで分岐実行し、同一 model control で自然な揺れを測る評価設計の資料になる。
