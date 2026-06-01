---
title: "Dark Ascent Postmortem"
url: "https://itch.io/devlog/1511711/dark-ascent-postmortem.amp"
collected_at: "2026-06-01T11:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, platformer, playtesting, scope-control]
status: needs_review
candidate_status: needs_review
last_reviewed_at: "2026-06-02T06:20:00+09:00"
last_decision: needs_review
evidence: "2026-06-02 Phase 4a lifecycle status backfill"
next_action: evaluate_in_phase2
stale_after: "2026-07-02"
---

## raw_excerpt
itch.io devlog の 2026-05-04 投稿。Dark Ascent は Construct 3 製の 2D dark medieval platformer。チーム構成は project manager / lead programmer、UI artist / cutscene director、lead sprite artist、lead programmer、background artist などで、開発サイクルを Discovery / Design / Development / Testing / Release / Maintenance として整理している。

要点メモ:
- うまくいった点は、チーム全員が扱えるエンジンを選んだことで、cutscene director も自分の実装を進められ、トラブルシュートも lead programmer だけに閉じなかったこと。
- 多様な技能があり、programming / art / animation / sprite creation / leadership をチーム内で分担できたため、ゲーム全体の完成度を上げられた。
- うまくいかなかった点は、Capstone night 前に full playthrough の時間を十分に取れなかったこと。イベント中に小さな問題が出たが、Construct 3 の remote play で live update できた。
- アート資産の import と背景への馴染み確認が不足した。最終レベル背景や cutscene 背景など、8-bit スタイルの統一には art doc が必要だったと振り返っている。
- lesson として、余計なタスクを引き受けすぎないこと、期限を守れないと他メンバーの計画が遅れること、特定 feature の playtest 時間を残さないと小バグが累積して当日の gameplay に影響することが挙げられている。

短い原文断片: "Leaving enough time for a full playthrough" / "not take on too many tasks at once"

## why_relevant_to_games
小規模チームの platformer 制作で、エンジン共有・作業分担・full playthrough の不足・art doc 不在がどう gameplay 品質に出るかを拾える。Nao_u_BOT 側では playable diff 前の「通しプレイ時間」と「見た目の統一確認」を候補軸として扱える。
