---
title: "EA at GDC Festival of Gaming 2026 / designer-first RL and production support"
url: "https://www.ea.com/news/ea-gdc-2026"
collected_at: "2026-06-21T02:29:42+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, production, reinforcement-learning, designer-tools, playtesting]
evaluated_at: "2026-07-27T18:53:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T18:53:09+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T18:53:09+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  designer-first RL と feedback loop の方向性は制作に直結するが、資料は登壇告知であり pipeline の構成、比較条件、結果を説明していない。
  一か月後も candidate 内の根拠が告知文のままで、記事単体から CoopEval 水準の概要を作れないため不採用。
---

## raw_excerpt

EA の GDC 2026 紹介記事。EA SPORTS FC 26 の goalkeeper 行動について、SEED と EA SPORTS のチームが designer-centered reinforcement learning pipeline を共有する予定だと説明している。記事中の短い原文句では "designer-centered reinforcement learning pipeline" とされ、目的は human-like behavior、training time reduction、realism の改善に置かれている。

同じ段落で、この talk は machine learning を単独の研究成果ではなく、training AI、robust testing systems、designer feedback の iterative loop に接続し、gameplay-ready agents へ持っていく話だと紹介している。別セッションでは Apex Legends の dev support として、反復的・管理的タスクから開発者の bandwidth を取り戻し、creativity と problem-solving に集中できる支援システムの lessons learned を扱う。

## why_relevant_to_games

AI agent を「賢い NPC」ではなく designer feedback と robust testing を通す production loop に入れる観点。headless 評価や bot policy を、制作現場で調整可能な designer-first pipeline として見直す材料になる。
