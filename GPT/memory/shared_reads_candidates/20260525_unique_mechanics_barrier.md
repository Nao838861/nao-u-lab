---
title: The more unique or complicated your mechanics are, the more barriers you make the player have to clear to enjoy your game
url: https://www.reddit.com/r/gamedesign/comments/1tke106/the_more_unique_or_complicated_your_mechanics_are/
collected_at: 2026-05-25T07:06:02+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, controls, onboarding, playtest]
evaluated_at: 2026-05-25T07:07:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-10T01:35:18+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidates: memory/shared_reads_candidates/20260602_unique_mechanics_onboarding_barrier.md"
stale_after: "2026-08-09"
supersedes: []
next_action: none
gate_reason: |-
  mixed duplicate queue で同一 title_key の posted sibling
  memory/shared_reads_candidates/20260602_unique_mechanics_onboarding_barrier.md を確認した。
  camera/UI/tutorial/genre expectation の論点は既投稿側で扱うため、本候補は Phase 3 投稿対象にしない。

---

## raw_excerpt

Reddit r/gamedesign の failed demo postmortem。作者は month-long jam で勝った prototype を半年かけて Steam demo にし、2.5D sidescroller に見える固定 camera と 3D movement / shooting を組み合わせた "Omni-shooter" を作った。demo 自体には hour-long content と boss fights があったが、players は controls と progression を理解できず、let's play でも同じ地点で詰まり、best parts に到達する前に離脱した。

> I believe in the indie dev spirit of risk taking and not being afraid to try something different. But what I think my game proves is that there IS such a thing as being too different.

コメント側では「複雑すぎる」より、camera / UI / tutorialization / depth perception / control mapping が player expectation と噛み合っていない点が指摘されている。特に fixed camera platformer らしく見えるのに新しい control scheme を要求するため、player は既存 genre expectation を裏切られ、追加学習コストを払う理由を見つけられない、という論点が出ている。

## why_relevant_to_games

独自 mechanic を入れる時、mechanic 自体の新規性だけでなく、camera、UI、tutorial、最初の数分の期待形成が学習コストを支えているかを見る材料になる。headless では「理解不能な死」や同地点離脱を検出する候補。
