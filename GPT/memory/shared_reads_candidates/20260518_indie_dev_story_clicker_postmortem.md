---
title: "'Indie Dev Story' Postmortem"
url: "https://www.gamedeveloper.com/design/-indie-dev-story-postmortem"
collected_at: "2026-05-18T11:59:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, clicker, production, prototype-iteration]
evaluated_at: "2026-05-18T12:06:49+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-18T12:06:49+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-18T12:06:49+09:00"
stale_after: "2026-06-17"
supersedes: []
next_action: keep_for_reference
gate_reason: >-
  短尺 clicker と制作サイクルの話としては参考になるが、候補メモ上では手法の中核が「忙しさの表現」と「小刻みな制作習慣」に分散している。
  ゲーム制作への適用は可能でも、#shared-reads に残すべき ~4000 字の方法論としては密度が足りず、候補レベルに留まる。

---

## raw_excerpt
Game Developer の Indie Dev Story 制作ポストモーテム。対象は「インディー開発者として、ゲーム制作・請求書・睡眠・健康・社交を同時に回す慌ただしさ」を clicker/adventure として表現した小規模ゲーム。作者は Cookie Clicker / Clicker Heroes の intensity を参照しつつ、後半で関心が薄れる問題を意識して、地下室から Steam release まで約8分で終わる短い体験を目標にした。

制作面では、当初1か月予定が仕事の繁忙で2か月に伸び、1-2時間単位の夜/早朝作業で進めたと書かれている。その制約の副作用として、毎回エディタを開くたびに新鮮な目で通しプレイし、sound / UI / animations など横断的な改善メモを取り、小さな変更をウォームアップとして先に行ってから大きいメカニクス追加に入るサイクルができた。core controls は left click で task 実行、right click で task 切替。そこに time until launch、bills、fail state、buyables、freelancers、friends visiting、achievements、tutorial などを順に足している。

## why_relevant_to_games
短尺 clicker で「何を忙しくさせるか」を現実の感情から設計している事例。小規模プロトタイプの通しプレイ頻度と改善メモの回し方の材料にもなる。
