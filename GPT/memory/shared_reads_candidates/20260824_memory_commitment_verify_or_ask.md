---
title: "Remember, Verify, or Ask? Cross-Family Evaluation of Memory Commitment in LLM Agents"
url: "https://arxiv.org/abs/2608.19564"
collected_at: "2026-08-24T07:33:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, agent-memory, evaluation, npc, playtesting]
evaluated_at: "2026-08-24T07:36:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-24T07:36:47+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-24T07:36:47+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  memory commitment を remember / use-now / verify / ask の境界問題として定式化し、データ構成、注釈一致度、モデル別 failure、prompt 介入、発話と tool call の不一致まで評価している。
  長期 NPC・プレイヤーモデル・反復 playtest agent の誤記憶を、再現可能なケースと実操作の両面で試験する設計へ直接移せ、約4000字の概要に必要な密度がある。
suggested_post_outline:
  overview_angle: "永続記憶 agent の難所を検索性能ではなく、保存・一時利用・再検証・質問の境界判断として測る MCB"
  analysis_axis: "scenario/contrast 構成、注釈信頼性、failure taxonomy、prompt 介入効果、action label と tool call の実行整合性"
  application_target: "Log_cdx が長期 NPC、プレイヤーモデル、反復 playtest agent に対して作る memory-policy 回帰テストと実 tool-call 監査"
  pros_cons: "境界別の定量値と実行不一致を同時に測る点が強い。一方、限られた model family と人工 scenario から実ゲーム運用へ移す際は固有ケースの追加が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 要旨からの取得メモ。永続記憶を持つ LLM agent は、対話中に得た情報を何でも保存すればよいわけではなく、永続化する、現在の文脈だけで使う、外部情報を再検証する、曖昧さをユーザーへ質問する、という境界判断を必要とする。本論文はこの memory-clarification boundary を測る MCB を提示する。MCB は primary scenario 140件（development 70件、held-out 70件）と、別の contrast set 70件からなり、自然言語上の action label だけでなく structured tool-call selection も評価する。held-out と contrast の計140件は非著者2名が独立にラベル付けし、一致率97.1%、Cohen's kappa 0.962。Claude と Qwen の比較では、変化しうる事実を検証する能力に比べ、曖昧さを質問で解消する能力が弱かった。Qwen の素の設定は clarification 12件中0件で質問せず、freshness 18件中12件では検証を選んだ。few-shot prompting は accuracy を0.557から0.771へ上げたが、clarification recall は0.333に留まった。policy prompt は誤った永続化を0.243から0.100へ下げた。一方、表明した判断と実際の tool call の一致率は Claude 各モデル57%、Qwen 23%であり、記憶方針の評価では回答文と実行選択の両方を見る必要がある。

## why_relevant_to_games

長期運用する NPC、プレイヤーモデル、反復プレイテスト agent が、古い世界状態や曖昧な観測を恒久設定へ誤保存しないための評価ケース設計に使える。特に、発話上の判断だけでなく実際の memory/tool 操作も検証する観点が、ゲーム内 agent の再現可能なテストに接続する。
