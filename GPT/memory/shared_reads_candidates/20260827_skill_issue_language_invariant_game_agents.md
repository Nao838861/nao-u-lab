---
title: "Skill Issue: Are Skills Language-Invariant in LLMs?"
url: "https://arxiv.org/abs/2608.25832v1"
collected_at: "2026-08-27T13:19:18+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-agents, evaluation, localization, multilingual, self-play, text-games]
evaluated_at: "2026-08-27T13:23:21+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-27T13:32:42.9949590+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787805158867599"
next_action: none
posted:
  ts: "1787805158.867599"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787805158867599"
  char_count: 3555
  posted_at: "2026-08-27T13:32:42.9949590+09:00"
stale_after: "2026-09-26"
supersedes: []
gate_reason: >-
  同一モデル・同一ゲームで言語だけを変える対照設計、3モデル・6ゲーム・8言語の評価、
  invalid action と戦略差、reasoning language 介入まであり、LLM NPC／自動テスターの検証手順へ直結する。
suggested_post_outline:
  overview_angle: "知識 benchmark ではなく、同条件 self-play で言語ごとの発現 skill を行動差として測る"
  analysis_axis: "言語が入力理解、途中推論、行動選択のどこで勝率・違反行動・戦略傾向を変えるか"
  application_target: "日本語化した LLM NPC・対戦相手・自動テスターを、言語別 win-loss・invalid action・方策差と reasoning language 切替で回帰評価する"
  pros_cons: "対戦条件を固定して言語差を切り出せる一方、text-based game と選定モデルの範囲を実ゲームへそのまま一般化はできない"
  verdict_pre: "採用"
---

## raw_excerpt

Bobby Cheng ほかは、LLM が持つ skill が対話言語によってどの程度変わるかを、知識量や一般 benchmark score とは分けて測るため multilingual self-play を用いた。同一モデルの2 instance を text-based game で対戦させ、それぞれには異なる言語の interface を与える。model、opponent、rules、state space、available actions を固定し、言語だけを変えることで、実際に表れる行動への影響を切り出す設計である。TextArena を多言語化し、open-weight model 3種を、空間推論、不完全情報、資源配分、反復相互作用を含む6 game・8 language で評価した。同じ model でも言語によって playing strength が大きく変わり、win-loss margin、invalid action、strategic tendency に系統的な差が出た。詳細分析では spatial reasoning、card-conditioned decision、optimal move selection に言語固有の failure が見られた。一部条件では intermediate reasoning language だけを変えることで失われた性能の多くが戻り、言語が意思決定の異なる段階へ影響しうることを示した。

## why_relevant_to_games

LLMをNPC・対戦相手・自動テスターとして使う時、翻訳済みルールや日本語UIでも英語条件と同じ方策が出るとは限らないため、ローカライズ別のself-play・invalid action・戦略差を評価する観点になる。
