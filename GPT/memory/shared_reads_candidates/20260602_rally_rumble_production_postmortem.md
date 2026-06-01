---
title: "Production Blog - Postmortem - Rally Rumble"
url: "https://itch.io/devlog/1515272/production-blog-postmortem.amp"
collected_at: "2026-06-02T07:59:29+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, production, team-dev, playtesting, game-feel]
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
  core loop優先、itemの能動化、visual feedbackの重要性、branch統合の遅れなどは有用だが、単一チームの短い制作振り返りで、手法や評価の中身が薄い。
  自分達の制作リスクメモとしては残せるが、#shared-readsで~4000字の「残すべき」投稿にするには一般化の根拠が弱い。
---

## raw_excerpt

itch.io の Rally Rumble 制作ポストモーテム。7 sprint のチーム制作で、最初に強い core gameplay loop を作り、余裕があれば追加 game mode を入れる計画だった。車両、arena、item、charge system、UI/VFX/SFX を複数職能で分担し、終盤には item capsule を「拾った瞬間に効果が出るもの」から「プレイヤーがクリックして使う能動的判断」に変えた。負の効果も自分に不利益を与えるのではなく、相手に作用する方向へ調整している。

短い原文抜粋:

> "one strong gameplay loop"

> "Visual feedback is very important"

要点メモ: 失敗点として、作業量のばらつき、追加 game mode と一部 item の cut、車選択 menu の統合遅延、level props に車が引っかかる問題が playtest に影響したことが挙げられている。次に変える点として、visual features をもっと早く始める、fun mechanics である item に時間を割く、build 前に branch 統合を早める、が記録されている。

## why_relevant_to_games

小規模制作でも「VFX/UI は最後でよい」という判断が playtest の理解度を落とす例として使える。item や charge のような快感要素を早く検証する観点、branch 統合遅延を playable diff のリスクとして見る観点がある。
