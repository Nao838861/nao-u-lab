---
title: "Fantastic Adaptive Taxonomies and How to Use Them"
url: "https://arxiv.org/abs/2607.16387"
collected_at: "2026-07-24T19:30:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, playtesting, evaluation, failure-analysis, workflow]
evaluated_at: "2026-07-24T19:34:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784889638.957859"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784889638957859"
  char_count: 4456
  posted_at: "2026-07-24T19:40:43+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-24T19:40:43+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784889638957859"
next_action: none
stale_after: "2026-08-23"
supersedes: []
gate_reason: >-
  問題設定、3軸の taxonomy 誘導、held-out trace による適用可能性 gate、
  5 benchmark と trajectory 選択の評価まで重要要素を抽出できる。
  AI プレイテストの失敗診断・実行時 feedback・候補選択へ同じ語彙を戻す具体的な適用があり、約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "長い個別 trace を、system・role・domain の3軸で更新可能な失敗語彙へ変え、複数の改善経路で共用する設計として解説する"
  analysis_axis: "固定 taxonomy と free-form reflection の間で、適応性・一貫した注釈可能性・改善行動への接続をどう両立したか"
  application_target: "Log_cdx のゲーム制作サイクルで、AI プレイテスターと制作 agent の trace を失敗コード化し、次の playtest 設計・runtime feedback・trajectory 採否へ戻す"
  pros_cons: "長い trace を横断比較でき、同じ診断を複数工程で再利用できる一方、taxonomy 生成と held-out gate の運用費用、自己生成分類の盲点、ゲーム固有 code の過適合に注意する"
  verdict_pre: "部分採用。まず少数の制作・playtest trace で3軸 taxonomy と held-out 適用率を試し、既存の失敗記録を置換せず補助 index として検証する"
---

## raw_excerpt

arXiv 本文からの要点メモ（逐語引用ではなく日本語での内容転記）。LLM agent の実行 trace には失敗原因が残るが、生ログは長く、個別事例に寄り、同じ失敗を横断して指す安定した語彙がない。AdaMAST は対象 system 自身の trace 群から、system-level、role-specific、domain-specific の3軸に沿った failure code を生成する。軸だけを固定し、code 名・定義・role label・evidence pattern は trace から誘導するため、人手で code を事前定義せず、各 trace への人手 annotation も要求しない。生成 taxonomy は held-out trace に対して独立 annotator が一貫して適用できるかを gate とし、system の変化に合わせて code の追加・統合・改名を行う。用途は事後診断だけでなく、agent-system search の失敗候補への診断、実行中 checkpoint での feedback、複数 trajectory からの選択という3経路で共用される。論文は5 benchmark の system search で free-form reflection を上回り、SWE-bench Verified Mini では SWE-agent の解決率を free-text reflection の60%から70%へ、Claude Code を64.0%から70.7%へ改善したと報告する。Terminal-Bench 2.0 の best-of-5 選択では Pass@1 より8–15ポイント高かった。

## why_relevant_to_games

AI プレイテスターやゲーム制作 agent の実行ログから、探索停止・検証漏れ・役割固有ミス・ゲーム領域固有ミスを再利用可能な失敗コードへ変え、次の playtest・候補選択・workflow 改善へ戻す設計資料になる。
