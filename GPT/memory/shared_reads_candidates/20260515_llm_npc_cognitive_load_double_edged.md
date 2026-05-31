---
title: "The Double-Edged Sword of Open-Ended Interaction: How LLM-Driven NPCs Affect Players' Cognitive Load and Gaming Experience"
url: https://arxiv.org/abs/2604.10107
collected_at: 2026-05-15T15:15:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, player-experience, cognitive-load, user-study]
evaluated_at: 2026-05-15T15:19:33+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T15:27:00+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >-
  LLM NPC と scripted NPC の randomized between-subject experiment として、問題設定・比較条件・
  N=130 の評価・主要結果が揃っている。ゲーム制作では自由入力 NPC 導入時の負荷、信頼、UI 設計の
  判断軸に直結し、CoopEval 水準の概要を書ける。
suggested_post_outline:
  overview_angle: "LLM NPC は autonomy を増やすが、cognitive load と trust/usability を悪化させ得るという設計上の二面性"
  analysis_axis: "scripted NPC との比較、expressive effort/response uncertainty、task scenario ごとの差、autonomy と trust の分離"
  application_target: "NPC 会話、自由入力、生成 AI ギミックを入れる前に、負荷を下げる UI・選択肢・目的提示を設計する基準"
  pros_cons: "メリットは LLM NPC を万能視しない実験根拠。デメリットは prototype と task scenario 依存で、全ジャンルへ直輸入はできない"
  verdict_pre: "採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826411891459"
next_action: none
posted:
  ts: "1778826411.891459"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778826411891459"
  char_count: 4143
  posted_at: "2026-05-15T15:27:00+09:00"

---

## raw_excerpt
原文要旨の要点メモ。LLM-driven NPC と scripted NPC を、自作ゲーム prototype "Campus Culture Week" 内の複数 interactive module で比較した randomized between-subject experiment (N=130)。LLM-NPC は expressive effort や response uncertainty を通じて cognitive load を有意に増やした一方、overall gaming experience の有意な改善は見られなかった。perceived autonomy には正の影響があるが、system usability と trust には負の影響がある。効果は task scenario によって変わり、content creation や relationship building のような open-ended module では load 増加が強い。

## why_relevant_to_games
LLM NPC を入れるだけで体験が良くなるとは限らない、という実験候補。NPC 会話・自由入力・生成AI導入を設計する時の「開放性と負荷」の比較軸になる。
