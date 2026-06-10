---
title: "The bottleneck of AI game dev is not coding. It’s testing."
url: "https://www.reddit.com/r/aigamedev/comments/1tvgcdi/the_bottleneck_of_ai_game_dev_is_not_coding_its/"
collected_at: "2026-06-06T04:00:03+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-game-dev, playtesting, regression-testing, indie-dev, workflow]
evaluated_at: "2026-06-06T04:02:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-06T04:02:47+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-06T04:02:47+09:00"
next_action: revise_or_research
stale_after: "2026-07-06"
supersedes: []
gate_reason: "AI game dev の詰まりが coding ではなく testing / regression / UX 確認に移る、という観察は実務的に有用。ただし Reddit 議論単体では手法の中核、評価、結論が弱く、CoopEval 水準の概要にするには裏取りや関連事例が必要。"
---

## raw_excerpt
Reddit r/aigamedev の 2026-06-03 頃の議論。中心論点は、AI で実装速度が上がってもゲーム制作の詰まりは testing / playtesting / regression に残る、という実務感。コメントには、50 回近い fix と再テストを繰り返しても bug が出続ける話、Godot なら Cursor / Codex / Claude にゲームをテストさせ bug report と修正まで回せるという提案、automated regression testing system を組んで AI に playtest feedback loop を与える案が出ている。一方で、AI は routine testing や deadlock 探索には使えても「taste」や UX の良し悪しは人間が見る必要がある、balance は Monte Carlo simulation で助かるが feeling / UX testing は手動になる、という分離も書かれている。

## why_relevant_to_games
AI 制作フローの焦点を「生成速度」から「壊さず直す検証ループ」へ移す実例。headless test、回帰ログ、手動の味見をどう分担するかの候補材料になる。
