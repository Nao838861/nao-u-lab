---
title: "AIDG: A Formal Decomposition of Information Extraction and Containment Asymmetries in Multi-Turn LLM Dialogue"
url: "https://arxiv.org/abs/2602.17443v2"
collected_at: "2026-05-28T13:14:32+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-evaluation, adversarial-game, dialogue-game, agent-evaluation]
evaluated_at: "2026-05-28T13:35:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-28T13:26:39.1867928+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779942387259629"
posted:
  ts: "1779942387.259629"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779942387259629"
  char_count: 4482
  posted_at: "2026-05-28T13:26:39.1867928+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: none
gate_reason: |-
  hidden information dialogue を Seeker / Holder の非対称能力として分解しており、問題設定・中核手法・failure mode・比較評価の要素が候補段階で揃っている。
  LLM NPC、social deduction、情報秘匿型会話ゲームの評価軸に直結し、単なる一般論ではなくゲーム制作時の検証設計へ落とせる。
  CoopEval 水準の概要は、win-rate 評価の限界から役割別能力測定へ展開する軸で十分に書ける。
suggested_post_outline:
  overview_angle: "単一勝率では潰れる multi-turn LLM dialogue の能力差を、情報を引き出す側と守る側の非対称ゲームとして測る研究として整理する。"
  analysis_axis: "AIDG の formalization、Seeker/Holder の役割、failure mode、game set / six frontier LLMs の比較から見える評価設計の強みと限界。"
  application_target: "hidden information game、social deduction、LLM NPC の会話評価で、勝敗だけでなく情報抽出・秘匿・仮説探索のどこが壊れたかを記録する評価ログへ適用する。"
  pros_cons: "メリットは対話ゲームの失敗を役割別に診断できること。デメリットは評価環境が人工的で、実ゲームの演出・UI・プレイヤー心理まで直接測れるわけではないこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt

arXiv result memo: AIDG は multi-turn LLM evaluation を単一の win-rate で扱うと能力差が混ざる、という問題から出発する。Adversarial Information Deduction Game を、二人・部分観測・確率ゲームとして定式化し、Seeker 側の情報抽出能力と Holder 側の情報封じ込め能力を分けて評価する。分解される failure mode は cooperative-prior leakage、constraint-reasoning interference、inefficient hypothesis-space traversal。439 games / six frontier LLMs の比較では、防御側性能は狭くまとまり、攻撃側性能のばらつきが大きい、という要旨が raw web_research に残っている。

検索メモ: `memory/raw/web_research/results.jsonl` fetched_at 2026-05-28T08:51:04, query `LLM game design player evaluation` で検出。既存 `shared_reads_candidates` と `atoms.jsonl` に `AIDG` / `2602.17443` の候補化は見つからなかった。

## why_relevant_to_games

対戦構造を持つ会話ゲームとして、LLM NPC / hidden information game / social deduction の評価軸を「勝率」から役割別・失敗モード別に分ける材料になる。
