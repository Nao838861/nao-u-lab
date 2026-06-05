---
title: "All Stories Are One Story: Emotional Arc Guided Procedural Game Level Generation"
url: "https://arxiv.org/abs/2508.02132"
collected_at: "2026-06-05T17:31:14+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, narrative-design, emotional-arc, llm, arpg]
evaluated_at: "2026-06-05T17:35:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-05T17:42:31+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780648946205629"
next_action: none
stale_after: "2026-07-05"
supersedes: []
posted:
  ts: "1780648946.205629"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780648946205629"
  char_count: 4311
  posted_at: "2026-06-05T17:42:31+09:00"
gate_reason: |-
  emotional arc を単なる物語分析ではなく、story graph、difficulty、entity generation の制約に落とす手法なので中核要素を説明しやすい。
  評価も player ratings、interviews、sentiment analysis に触れられており、生成物の面白さと一貫性をどう見るかまで概要化できる。
  短時間プロトタイプの wave / stage / event を感情曲線で設計する具体応用があり、こじつけにならない。
suggested_post_outline:
  overview_angle: "感情曲線を、物語テンプレではなくレベル生成の構造制約として使う研究として整理する。"
  analysis_axis: "emotional arc、branching story graph、difficulty/entity adaptation、プレイヤー評価の接続を見る。"
  application_target: "Nao_u_BOT の短時間ゲーム制作で、wave 強弱、敵配置、報酬、イベント順を感情曲線に沿って設計する probe に使う。"
  pros_cons: "長所は生成制御の軸が人間に説明しやすいこと。短所は Rise/Fall だけでは作品固有の手触りや操作密度を取りこぼすこと。"
  verdict_pre: "部分採用。感情曲線を生成器そのものではなく、ステージ設計レビューの評価軸として使う。"
---

## raw_excerpt

原文短句: "emotional arcs as a structural backbone"

arXiv:2508.02132。2025-08-04 submitted。Yunge Wen, Chenliang Huang, Hangyu Zhou, Zhuo Zeng, Chun Ming Louis Po, Julian Togelius, Timothy Merino, Sam Earle による、emotional arc を procedural game narrative generation の骨格として使う研究。要旨では、物語の進行と gameplay dynamics の両方を emotional trajectory に沿わせる枠組みとして説明されている。対象にする emotional pattern は Rise と Fall の 2 つで、branching story graph を生成し、各 node に characters、items、health、attack など gameplay-relevant attributes を自動配置する。difficulty も emotional trajectory に応じて調整する。prototype action role-playing game で実装し、LLM と adaptive entity generation を使って emotional arc を操作可能な生成条件に落とす。評価は player ratings、interviews、sentiment analysis を使い、engagement、narrative coherence、emotional impact の向上を報告している。

## why_relevant_to_games

手続き生成を「部屋や敵を並べる」だけでなく、プレイヤーの感情曲線と難度曲線を同期させる候補として使える。Nao_u_BOT の短時間プロトタイプでも、wave / stage / event の強弱を emotional arc でラベル付けする発想に接続できる。
