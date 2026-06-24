---
title: "EGOSTREAM: A Diagnostic Benchmark for Streaming Episodic Memory in Egocentric Vision"
url: "https://arxiv.org/abs/2605.31557"
collected_at: "2026-06-12T15:44:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, memory, vision, gameplay-agent, telemetry]
evaluated_at: "2026-06-12T15:49:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781247404.911509"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781247404911509"
  char_count: 4360
  posted_at: "2026-06-12T16:16:44+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T16:16:44+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781247404911509"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: |-
  Answer Validity Window により、忘却と世界状態の変化を分離する評価の中核が明確。
  ゲーム画面を見る自動プレイ agent や長時間探索テストの記憶評価に、抽象論ではなく設計軸として適用できる。
  7 cognitive dimensions と memory profile 比較があり、CoopEval 水準の概要を構成しやすい。
suggested_post_outline:
  overview_angle: "streaming episodic memory を aggregate accuracy ではなく、答えが有効だった時間窓と記憶タイプ別 profile で診断する benchmark として紹介する。"
  analysis_axis: "問題設定、Answer Validity Window、7 cognitive dimensions、memory mechanism の比較、accuracy が同じでも profile が違うという結論を軸にする。"
  application_target: "画面観測型 gameplay agent、自動プレイテスター、長いステージの探索ログで、忘却とゲーム状態変化を切り分ける評価設計。"
  pros_cons: "メリットはプレイ中の記憶失敗を種類別に分解できる点。デメリットは egocentric video 前提のため、ゲームログへ移すにはイベント抽出設計が要る点。"
  verdict_pre: "部分採用。長時間プレイログの質問セットと answer validity window 設計の参考にする。"
---

## raw_excerpt

短い原文断片: "Answer Validity Window" / "streaming episodic memory" / "recall-conditioned evaluations"。

arXiv 要旨によると、EGOSTREAM は egocentric vision における streaming episodic memory の診断 benchmark。continuous episodic memory は動的環境で動く agent に必要だが、既存の streaming video benchmark では「何を、どれくらいの時間覚えているか」を診断しにくい、という問題設定。2,250 curated questions を detail、spatial、temporal、event、social、causal、prospective memory の 7 cognitive dimensions に分け、Answer Validity Window により「世界状態が変わったため答えが変化した」のか「モデルが忘れた」のかを分ける。複数の memory management mechanism を同一 backbone で比較し、aggregate accuracy が似ていても memory profile が大きく異なることを示す。

ローカル検出元: `memory/raw/web_research/results.jsonl` fetched_at 2026-06-12T10:06:55、query `agent memory evaluation autonomous agents`。外部確認: arXiv search result 2026-06-12。

## why_relevant_to_games

画面を見ながら遊ぶ agent / 自動プレイテスターの記憶評価に接続できる。プレイログで「忘却」と「ゲーム状態の自然変化」を分ける視点は、長いステージや探索ゲームの agent 評価に使える。
