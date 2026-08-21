---
title: "Sky Peck Goes Multiplayer: Keep the Beacon"
url: "https://skypeck.fun/blog/sky-peck-goes-multiplayer"
collected_at: "2026-08-21T09:31:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, playtesting, multiplayer, motion-control, mechanics, rapid-prototyping]
evaluated_at: "2026-08-21T09:35:10+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-21T09:35:10+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-21T09:35:10+09:00"
next_action: keep_for_reference
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  参加不能という身体入力上の制約を server 分離と beacon 奪取 loop へ変換した着想は具体的で、prototype の参照例としては有用である。
  ただし評価は開発者と友人による単発試験の継続時間に限られ、人数・比較条件・反復結果・認識問題の解消度が不明なため、CoopEval 水準の約4000字を推測で埋めずに支える材料が足りない。
---

## raw_excerpt

原文要点の日本語抄録（逐語引用ではない）。身体を動かして鳥を飛ばす Sky Peck を3週間繰り返し playtest した結果、開発者は「画面内に別の人が入ると操作認識が壊れ、見ている人が自然に参加したくても一緒に遊べない」という問題を発見した。そこで同一カメラ内の複数人認識を直すのではなく、server を用意して別々の player が同じ空を飛べる multiplayer へ展開した。最初の network mode は Keep the Beacon。map 上空に一つだけある beacon を奪い、保持時間の合計で勝敗を決める。保持者には debuff が付き、他の bird 全員から追われる target になる。着地または墜落すると beacon を失うため、逃走、追跡、奪取が継続する aerial tag の loop になる。開発者と友人による試験では、通常は約20分で身体的に疲れるゲームを3時間続けて検証したと記録されている。記事は、playtest で露出した参加不能の問題を、単なる入力修正ではなく社会的な遊び方と mode rule の追加へ変換した短い開発ログである。

## why_relevant_to_games

playtest 中の「傍観者が混ざれない」という不具合を、network mode と非対称な追跡ルールへ転換した事例。身体入力ゲームで、技術制約から social play の core loop を組み立てる場面に使える。
