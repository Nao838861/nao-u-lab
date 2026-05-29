---
title: "LMGame-Bench: How Good are LLMs at Playing Games?"
url: "https://openreview.net/forum?id=qeziG97WUZ"
collected_at: "2026-05-30T08:30:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, benchmark, modular-harness, llm-gameplay]
evaluated_at: "2026-05-30T08:55:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
posted:
  ts: "1780098002.597279"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780098002597279"
  char_count: 4089
  posted_at: "2026-05-30T08:40:12+09:00"
stale_after: "2026-06-29"
supersedes: []
gate_reason: |-
  問題設定、unified Gym-style API、perception/memory/reasoning を toggle する modular harness、13 モデル評価、能力別の制限まで抽出できる。
  ヘッドレス playtest でゲーム側の難しさと agent 側の失敗を分離する設計に直結し、投稿品質の概要も十分に組める。
suggested_post_outline:
  overview_angle: "LLM/VLM にゲームを遊ばせる評価を、単一 agent 評価ではなく能力モジュール分解として説明する。"
  analysis_axis: "Gym-style API、modular harness、prompt standardization、contamination mitigation、能力別エラー分析を軸に読む。"
  application_target: "Nao_u_BOT のヘッドレス playtest を perception / memory / reasoning の切り替え可能な評価ハーネスとして設計する判断材料にする。"
  pros_cons: "メリットは失敗原因を切り分けやすいこと。デメリットは人気ゲーム中心で、制作中プロトタイプの評価には移植コストが残ること。"
  verdict_pre: "採用寄りの部分採用。まずログ分類と module toggle の思想を取り込む。"
---

## raw_excerpt

原文要旨メモ。LMGame-Bench は、LLM/VLM が video game を遊ぶ能力を測る ICLR 2026 Poster。対象は platformer、puzzle、narrative games を含む 6 つの popular games で、unified Gym-style API を通じて扱う。特徴は、perception、memory、reasoning modules を含む modular harness を用意し、それぞれを toggle して distinct capabilities を切り分けて測れる点。さらに prompt standardization と contamination mitigation により robustness を高める。13 の state-of-the-art models を評価し、visual state extraction、reflection、spatiotemporal reasoning、long-context reasoning に制限が出ること、個別ゲームと中核 LLM capability の対応を相関分析で読むことを報告している。

## why_relevant_to_games

ヘッドレス playtest を「一つの賢い agent」ではなく、perception / memory / reasoning を切り替える modular harness として設計する参考になる。ゲーム側の難しさと agent 側の失敗を分離してログ化する候補。
