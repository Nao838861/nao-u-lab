---
title: Designing Open Dialogue Systems for LLM-Based NPCs
url: https://dl.digra.org/index.php/dl/article/view/2837
collected_at: 2026-07-19T21:32:38+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, npc, dialogue-systems, llm, narrative-systems]
evaluated_at: "2026-08-18T04:19:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-18T04:19:31+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-18T04:19:31+09:00"
next_action: keep_for_reference
stale_after: "2026-09-17"
supersedes: []
gate_reason: >-
  自由入力、脚本制約、ゲーム状態変更、意味データ保存という設計要素は会話型 NPC へ接続しやすい。
  しかし形式化の詳細、実装構成、評価方法・結果・限界が候補本文になく、再評価でも概念紹介を超える約4000字の概要を支えられないため fail とする。
---

## raw_excerpt

DiGRA 2026 掲載論文。Kieran McKee、Joshua D. Savage、Vanessa Hemovich は、プレイヤーが定型選択肢を選ぶ会話ではなく、プレイヤー自身が自由文を入力し、LLM が NPC の返答を生成する diegetic conversation の構成を提示する。中心となる課題は、予測不能なプレイヤー入力と非決定的なモデル出力を受け入れながら、NPC を事前に書かれた脚本とキャラクター設定に沿って振る舞わせることにある。論文概要では、会話中に NPC の行動を動的に変えるための形式化に加え、LLM の低水準な論理推論をゲーム状態の変更へ接続する方法、会話から得られる意味的・定性的データを構造化して保存・再利用する方法も扱うとしている。公開日は 2026-06-16。キーワードは natural language processing、artificial intelligence、narrative systems、algorithms、communication、outbound sales game。

## why_relevant_to_games

自由入力会話を脚本・状態遷移・保存データへ接続する設計例として、会話型 NPC のプロトタイプや非決定出力を含む narrative system の境界設計に使える。
