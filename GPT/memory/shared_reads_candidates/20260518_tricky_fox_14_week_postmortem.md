---
title: "Tricky Fox: The 14 Week Game's Postmortem"
url: https://trickyfox2026.itch.io/tricky-fox/devlog/1492142/tricky-fox-the-14-week-games-postmortem
collected_at: 2026-05-18T05:44:40+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [postmortem, puzzle-platformer, scope-control, testing, teamwork]
evaluated_at: 2026-05-18T05:48:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-18T05:48:52+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-18T05:48:52+09:00"
stale_after: "2026-06-17"
supersedes: []
gate_reason: "core concept 固定、10 levels から 8 levels への scope cut、統合事故などの教訓はあるが、学生制作 postmortem の一般的な範囲に留まる。既知の制作管理論点を超える新規性や評価密度が弱く、投稿品質に引き上げると水増しになる。"
next_action: keep_for_reference

---

## raw_excerpt
itch.io devlog、2026-05 上旬 crawled / posted。Unity 製 puzzle-platformer "Tricky Fox" を、George Brown Polytechnic の Game Programming diploma project として 14 週間で作った postmortem。PC 向けに Unity、Visual Studio、GitHub を使い、First Playable、Alpha、Beta、Code Release、Release の production stages を通った。最初に core concept、player character、jumping など基本 mechanics を早く固定したことで、後半に開発が荒れても「どんなゲームを作っているか」を見失わなかった、と記録されている。一方で、10 levels 予定を 8 levels に切る scope control、Alpha/Beta での testing and iteration、別々に作った animation / movement / menu system を後で統合した時の compatibility problems、Beta 直前に menu を失って再構築した事故などがまとまっている。

## why_relevant_to_games
学生・小規模チーム制作で、早期 core loop 固定、scope cut、統合テスト不足がどう表面化するかを拾える。
