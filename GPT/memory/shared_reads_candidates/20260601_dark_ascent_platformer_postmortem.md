---
title: "Dark Ascent Postmortem"
url: "https://itch.io/devlog/1511711/dark-ascent-postmortem.amp"
collected_at: "2026-06-01T11:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, platformer, playtesting, scope-control]
evaluated_at: "2026-07-28T16:37:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-28T16:37:09+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-28T16:37:09+09:00"
next_action: keep_for_reference
stale_after: "2026-08-27"
supersedes: []
gate_reason: >-
  full playthrough 時間の確保、共有可能な engine、art doc、scope 制御という失敗点は制作工程へ直接適用できる。
  ただし記述は一般的な回顧に留まり、各判断と不具合の因果、評価方法、改善後の結果を抽出できない。
  ローカルのチェック項目としては残すが CoopEval 水準の独立記事には不足するため投稿候補として閉じる。
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
