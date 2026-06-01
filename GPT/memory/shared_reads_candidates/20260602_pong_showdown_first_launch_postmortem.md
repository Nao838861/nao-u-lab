---
title: "Devlog - Postmortem - Pong Showdown!"
url: "https://itch.io/devlog/1516654/devlog-postmortem.amp"
collected_at: "2026-06-02T07:59:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, solo-dev, ai-behavior, balancing, launch]
evaluated_at: "2026-06-02T08:04:32+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-02T08:04:32+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-02T08:04:32+09:00"
next_action: keep_for_reference
stale_after: "2026-07-02"
supersedes: []
gate_reason: |-
  「単純なPongでもAI挙動、power-up、balancing、自己playtest偏重で難しくなる」という教訓は明確だが、抽出できる中核は既知の制作リスクに近い。
  具体場面への適用はできる一方、記事単体でCoopEval水準の概要・分析・判定を書くには情報量と独自性が不足する。
---

## raw_excerpt

itch.io の初リリース振り返り。Pong 系の単純そうな題材でも、実際には enemy AI、two-player mode、power-up、UI、movement feel、bug fix、balancing が連鎖して難しくなったという記録。作者は、未完成のまま眠らせるより不完全でも公開したことに意味があったと書いている一方、少ない feedback と自己 playtest 中心では balancing が難しかったとも述べている。

短い原文抜粋:

> "no game is ever truly simple"

> "testing the game mostly by myself"

要点メモ: enemy AI は「ボールを追い、少し遅延を入れれば beatable になる」という単純な発想から始まったが、実装すると robotic / unnatural / jittering が残った。power-up もアイデアを出すことと、Unity 上で実際に動く mechanic にすることは別で、2つ実装するだけでも試行錯誤が必要だった。UI と presentation は deadline のため機能優先になり、品質に影響した。

## why_relevant_to_games

「古典ゲームの小改造なら簡単」という見積もりを疑う材料になる。AI movement の自然さ、自己 playtest の限界、power-up を実装可能な遊びへ落とす難しさを、次の小型 prototype のリスク項目として拾える。
