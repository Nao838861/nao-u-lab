---
title: "Indie Postmortem: Armadillo Run"
url: "https://www.gamedeveloper.com/design/indie-postmortem-i-armadillo-run-i-"
collected_at: "2026-08-18T04:15:35+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, physics-game, puzzle, postmortem, solo-development, playtesting]
evaluated_at: "2026-08-18T04:19:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-18T04:30:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786995013250539"
next_action: none
stale_after: "2026-09-17"
supersedes: []
posted:
  ts: "1786995013.250539"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786995013250539"
  char_count: 3807
  posted_at: "2026-08-18T04:30:47+09:00"
gate_reason: >-
  低予算の一人制作で core physics の成立性を先に確かめ、emergent な遊びを発見し、playtest で editor UI を直すまでの判断連鎖が具体的である。
  4か月の本体制作と5か月の仕上げ、早すぎる最適化や無計画の代償も含み、小規模物理 prototype の工程設計へ直接適用できるため約4000字の概要を支えられる。
suggested_post_outline:
  overview_angle: "spring simulation の小実験から製品化まで、core feasibility と仕上げ工程の時間差を軸に制作判断を追う"
  analysis_axis: "emergent play の発見、設計書なしの利点と負債、playtest による editor 改修、最適化と polish の見積り"
  application_target: "Nao_u_BOT の物理系小規模 prototype で、遊びの成立確認と editor/usability・販売準備を別 budget として管理する"
  pros_cons: "少人数制作の実測に接地する一方、一作品の回顧なので工程比率を普遍則にはしない"
  verdict_pre: "採用"
---

## raw_excerpt

Peter Stock が、現実寄りの物理 simulation を使った puzzle game『Armadillo Run』を一人で設計・実装・販売し、9か月で release するまでを振り返る postmortem。低予算で既存作の visual と競争しないため、「小さく、面白く、違うもの」を狙い、まず 2D spring simulation を数週間試した。spring 単体は単純でも、組み合わせると複雑な挙動が自然に生まれることから、障害物のある level に構造物を組み、球を目的地へ運ぶ game へ発展した。実装順では成立可否を決める physics simulation を最初に検証し、数週間で core code を作った後、playtesting で編集 UI の苦痛や button の説明不足を発見して作り直した。

一方、game 本体の大部分は4か月でできたのに、sound、interface、level design、testing、tuning、menu、仕上げ、販売準備を軽く見積もったため release までさらに5か月かかった。変化中の code を早期に最適化しすぎ、計測なしの「改善」で遅くなった例もある。物理実験から game へ進んだ後も design document を作らず、interface と preliminary level design を紙上で整理しなかったため、一部実装は設計ではなく成り行きで進んだと記録している。

## why_relevant_to_games

物理 prototype から emergent な遊びを見つける順序、core feasibility を先に潰す実装順、playtest で editor usability を直す過程を、Nao_u_BOT の物理系小規模 prototype と完成工程の観察材料にできる。
