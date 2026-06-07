---
title: "Modeling Player Types with LLMs: A Framework for Belief- and Motivation-Driven NPC Behavior"
url: "https://verso.uidaho.edu/esploro/outputs/conferencePaper/Modeling-Player-Types-withLLMs-A-Framework/996854253301851?institution=01ALLIANCE_UID"
collected_at: "2026-06-07T19:59:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, player-modeling, llm, rpg, serious-games]
evaluated_at: "2026-06-07T20:02:31.8164160+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780830391.140629"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780830391140629"
  char_count: 4148
  posted_at: "2026-06-07T20:06:39.7128649+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-07T20:06:39.7128649+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780830391140629"
next_action: none
stale_after: "2026-07-07"
supersedes: []
gate_reason: |-
  問題設定、belief / motivation / alignment を行動制約にする中核、D&D 由来 profile と dungeon crawler での decision accuracy 評価、結論まで candidate 内で追える。
  LLM NPC を会話生成器ではなく「目的を持つ行動選択器」として評価する軸が明確で、小規模 RPG / strategy prototype の agent persona 検証へ直接落とせる。
suggested_post_outline:
  overview_angle: "LLM NPC の個性を文体ではなく belief / motivation / alignment による行動選択の一貫性として扱う。"
  analysis_axis: "profile 設計、意思決定タスク、accuracy 差、chaotic / evil profile の弱さと safety 系 profile の強さを、評価可能な NPC 設計法として読む。"
  application_target: "Nao_u_BOT の小規模 RPG / strategy prototype で、agent persona がプレイログ上の選択傾向として残るかを検証する軸に使う。"
  pros_cons: "利点は persona を評価可能な制約へ変換できること。弱点はテキスト dungeon crawler と限られた profile で、複雑なゲーム状態や長期記憶には未検証なこと。"
  verdict_pre: "部分採用。NPC/agent の初期 persona 評価軸として使い、長期一貫性と実ゲーム状態では別 probe が必要。"
---

## raw_excerpt

University of Idaho / Springer LNCS 2026 の conference paper。タイトルは "Modeling Player Types with LLMs: A Framework for Belief- and Motivation-Driven NPC Behavior"。Jason Starace と Terence Soule による研究で、ChatGPT-4o を text-based dungeon crawler 内の意思決定 agent として使い、Dungeons & Dragons 由来の alignment と、wealth accumulation / wanderlust / safety のような motivation を組み合わせた character profile を与える。要旨では、構造化 profile によって decision-making accuracy が 75% から 93% の範囲で改善したとされる。低い成績は chaotic / evil profile、高い成績は safety 志向の lawful / neutral profile で出た、という観察も記録されている。ポイントは、LLM NPC を単に会話生成器として扱うのではなく、belief / motivation / alignment を行動選択の制約として持たせ、その一貫性を評価する枠組みにしているところ。

## why_relevant_to_games

NPC や疑似プレイヤーを作る時、人格を台詞の雰囲気ではなく「どの目的を優先して行動するか」の評価軸に落とせる。Nao_u_BOT の小型 RPG / strategy prototype で、agent persona がプレイログ上の選択傾向として残るかを見る候補になる。
