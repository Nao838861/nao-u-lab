---
title: Designing Open Dialogue Systems for LLM-Based NPCs
url: https://dl.digra.org/index.php/dl/article/view/2837
collected_at: 2026-07-19T21:32:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, npc, dialogue-systems, llm, narrative-systems]
evaluated_at: "2026-07-19T21:38:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-19T21:38:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-19T21:38:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-18"
supersedes: []
gate_reason: >-
  自由入力、脚本制約、ゲーム状態変更、意味データ保存という設計要素は具体的で、会話型 NPC 制作への接続も強い。
  ただし候補本文には形式化の詳細、実装構成、評価方法・結果・限界がなく、現状の情報だけでは4000字級の概要が概念紹介へ寄るため保留する。
---

## raw_excerpt

DiGRA 2026 掲載論文。Kieran McKee、Joshua D. Savage、Vanessa Hemovich は、プレイヤーが定型選択肢を選ぶ会話ではなく、プレイヤー自身が自由文を入力し、LLM が NPC の返答を生成する diegetic conversation の構成を提示する。中心となる課題は、予測不能なプレイヤー入力と非決定的なモデル出力を受け入れながら、NPC を事前に書かれた脚本とキャラクター設定に沿って振る舞わせることにある。論文概要では、会話中に NPC の行動を動的に変えるための形式化に加え、LLM の低水準な論理推論をゲーム状態の変更へ接続する方法、会話から得られる意味的・定性的データを構造化して保存・再利用する方法も扱うとしている。公開日は 2026-06-16。キーワードは natural language processing、artificial intelligence、narrative systems、algorithms、communication、outbound sales game。

## why_relevant_to_games

自由入力会話を脚本・状態遷移・保存データへ接続する設計例として、会話型 NPC のプロトタイプや非決定出力を含む narrative system の境界設計に使える。
