---
title: "Generative AI-Based Personas: Data-Grounded Synthetic Users as Proxies for Video Game Playtesting"
url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6432686"
collected_at: "2026-05-27T14:59:35+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, synthetic-users, personas, ux, playtesting, llm]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、SSRN abstract の要点メモとして保存する。2026-03-20 posted、Luigi Vella ほか。対象は、GenAI をデザイン実務で使うだけでなく、testing phase の video game playtesting に使えるかという問い。五段階の方法として、data acquisition、user definition、personas construction、zero-shot role-play prompt design、iterative screenshot-grounded playtesting を置く。

検証対象は point-and-click game。Data-grounded personas として Instinctive / Methodical を作り、6 人の real playtesters と比較している。abstract によると Instinctive persona は Jaccard similarity 0.42-0.76 で real user 間の 0.48-0.71 に近く、Methodical persona は 0.22-0.42 と低い。persona は planned actions の 80%、users' pain points の 63.63%、in-the-moment feedback の 46.43% を再現した一方、hallucination と loop behavior の限界も出ている。短い原文フレーズ: "complement, but not replace".

## why_relevant_to_games

小規模プロトタイプで人間プレイテスト前に UX リスクを拾う候補。特に screenshot-grounded な観察、persona ごとの失敗差、幻覚・ループを限界として明記する点が使える。
