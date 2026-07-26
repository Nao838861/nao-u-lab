---
title: "Bridging the Agent-World Gap: Text World Models for LLM-based Agents"
url: "https://arxiv.org/abs/2606.09032"
collected_at: "2026-06-14T15:59:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, world-models, text-game, planning, evaluation]
evaluated_at: "2026-07-27T07:07:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T07:07:54+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T07:07:54+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  transition model の整理は text game や headless planning evaluation に接続できるが、候補本文は survey の大分類と用途列挙に留まる。
  代表手法・評価設計・比較結果・失敗例を抽出できず、4000字級の概要が抽象論になるため、参照用として閉じる。
---

## raw_excerpt

arXiv 2606.09032。2026-06-08 投稿。Yixia Li ほか。

検索結果と arXiv 要旨による一次メモ。LLM agent は web navigation、code editing、tool use、long-horizon dialogue などの textual interactive environment で使われるが、多くは観測から次行動へ反応的に写像しており、環境がどう構造化され、行動でどう変化するかの明示的 model を持たない。論文は text world models を、textual state と candidate action から次の webpage、terminal output、API response、user reply などを予測する transition model として位置づける。survey は agent lifecycle に沿って、foundation、construction、application、evaluation を整理する。construction では LLM-as-world-model と code-as-world-model の系統、application では training-time の experience synthesis と inference-time の planning、verification、adaptation、evaluation では world model 自体の評価と agent evaluation environment としての利用を扱う。

## why_relevant_to_games

テキストゲーム、ルール説明ベースのプロトタイプ、headless evaluation で「次状態を予測できるモデル」を別建てにすると、LLM agent の反応的プレイと計画的プレイを分けて検証できる。
