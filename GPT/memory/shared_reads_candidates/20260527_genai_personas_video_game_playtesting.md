---
title: "Generative AI-Based Personas: Data-Grounded Synthetic Users as Proxies for Video Game Playtesting"
url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6432686"
collected_at: "2026-05-27T14:59:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, synthetic-users, personas, ux, playtesting, llm]
evaluated_at: "2026-05-27T15:05:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T15:11:25+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779862275005299"
posted:
  ts: "1779862275.005299"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779862275005299"
  char_count: 3500
  posted_at: "2026-05-27T15:11:25+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: >-
  video game playtesting を対象に、data acquisition から persona 構築、zero-shot role-play prompt、screenshot-grounded iterative playtesting までの手順と、実ユーザー比較による評価が揃っている。
  planned actions / pain points / in-the-moment feedback の再現率と hallucination・loop behavior の限界が明示されており、LLM persona を人間テストの代替ではなく事前リスク発見に使う、というゲーム制作への具体的接続が強い。
suggested_post_outline:
  overview_angle: "合成 persona をゲーム playtesting の代替ではなく、実ユーザーテスト前に UX リスクを炙り出す補助層として扱う手順と限界を中心に書く。"
  analysis_axis: "data-grounded persona construction、screenshot-grounded playtesting、real tester との行動一致・痛点再現・即時フィードバック再現、hallucination / loop behavior の失敗分析を軸にする。"
  application_target: "Nao_u_BOT の小規模 prototype で、人間に出す前の tutorial 詰まり、視認性、操作意図の誤読、探索順の偏りを persona 別に検出する phase 3b probe に効く。"
  pros_cons: "メリットは低コストで複数行動様式の事前探索ができる点。デメリットは幻覚・ループ・視覚理解のズレが残り、実ユーザーの代替として使うと判断を誤る点。"
  verdict_pre: "部分採用"

---

## raw_excerpt

著作権配慮のため長文引用ではなく、SSRN abstract の要点メモとして保存する。2026-03-20 posted、Luigi Vella ほか。対象は、GenAI をデザイン実務で使うだけでなく、testing phase の video game playtesting に使えるかという問い。五段階の方法として、data acquisition、user definition、personas construction、zero-shot role-play prompt design、iterative screenshot-grounded playtesting を置く。

検証対象は point-and-click game。Data-grounded personas として Instinctive / Methodical を作り、6 人の real playtesters と比較している。abstract によると Instinctive persona は Jaccard similarity 0.42-0.76 で real user 間の 0.48-0.71 に近く、Methodical persona は 0.22-0.42 と低い。persona は planned actions の 80%、users' pain points の 63.63%、in-the-moment feedback の 46.43% を再現した一方、hallucination と loop behavior の限界も出ている。短い原文フレーズ: "complement, but not replace".

## why_relevant_to_games

小規模プロトタイプで人間プレイテスト前に UX リスクを拾う候補。特に screenshot-grounded な観察、persona ごとの失敗差、幻覚・ループを限界として明記する点が使える。
