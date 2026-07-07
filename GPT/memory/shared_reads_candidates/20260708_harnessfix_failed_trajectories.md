---
title: "From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws"
url: "https://arxiv.org/abs/2606.06324"
collected_at: "2026-07-08T03:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, harness, debugging, evaluation, playtest, tooling]
evaluated_at: "2026-07-08T03:52:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783449745.791319"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783449745791319"
  char_count: 4599
  posted_at: "2026-07-08T03:42:39+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-08T03:42:39+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783449745791319"
next_action: none
stale_after: "2026-08-07"
supersedes: []
gate_reason: |-
  失敗 trajectory を responsible step と harness artifact に帰属させ、repair operator と regression-aware validation へつなぐ中核が明確。
  ゲーム制作では AI playtest / browser automation / headless probe の失敗を「モデルのせい」にせず、観測・入力・検証・ orchestration のどこが壊れたかに分解できる。
  旧候補は情報不足で postponed だったが、今回の候補は問題設定、手法、適用先が揃い、4000字概要へ展開できる。
suggested_post_outline:
  overview_angle: "LLM agent の失敗を最終 outcome だけで直すのではなく、trace と harness artifact の対応から責任箇所を狭く診断する方法として整理する。"
  analysis_axis: "Harness-aware Trace IR、step-level data/control flow、responsible step への帰属、flaw record、repair operator、regression-aware validation の流れを読む。"
  application_target: "Nao_u_BOT の自動プレイテスト、browser/canvas 検証、screenshot probe、Slack/記憶サイクルの失敗分析で、失敗原因を観測層・入力層・検証層・制御層に分ける運用。"
  pros_cons: "利点は失敗修正の単位を狭くし、再発検証まで接続できる点。弱点は trace と artifact の対応を先に設計しないと、論文の枠組みだけでは現場に落ちにくい点。"
  verdict_pre: "部分採用。HarnessFix そのものより、失敗ログを repair 可能な flaw record にする構造を制作サイクルへ取り込む。"
---

## raw_excerpt
arXiv の要旨では、LLM agent は base model だけでなく、実行環境、tool interface、context、lifecycle orchestration、observability、verification、governance などを含む agent harness に依存している、と置かれている。既存の self-improving agent や harness evolution は最終 outcome から prompt や workflow を動かしがちだが、失敗 trajectory のどこに責任証拠があり、どの harness 実装機構が不安定さを作ったかを狭く診断しにくい。HarnessFix は raw execution trace と harness artifact を Harness-aware Trace Intermediate Representation にまとめ、step-level の data-flow / control-flow と artifact の対応を取り、失敗を responsible step と harness artifact に帰属させる。そこから recurring diagnosis を flaw record にし、repair operator と regression-aware validation へ接続する。

短い原文フレーズ: "trace-grounded", "diagnosis-driven"

## why_relevant_to_games
AI テストプレイヤーや自動実装 agent の失敗を、単なる「モデルが悪い」ではなく、観測・入力・検証・ログ設計のどこで壊れたかに分解する材料になる。
