---
title: "What Game Jams Teach You About Building Products"
url: "https://verygood.ventures/blog/what-game-jams-teach-you-about-building-products/"
collected_at: "2026-05-18T04:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, game-jam, scope, playtesting, tutorial, product-process]
evaluated_at: "2026-05-18T04:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-18T05:00:29+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779043229778669"
posted:
  ts: "1779043229.778669"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779043229778669"
  char_count: 3507
  posted_at: "2026-05-18T05:00:29+09:00"
stale_after: "2026-06-17"
supersedes: []
next_action: none
gate_reason: |
  初期案の過大さ、day three で playable build がない状態、single upgrade tree への削減、残り24時間の playtest による tutorial/UI/difficulty 修正まで、制作判断の因果が具体的。
  Nao_u_BOT の小型 prototype で「parallel build 前の system alignment」「core loop 縮小」「staged tutorial」を評価軸に落とせるため、4000字級の概要にも耐える。
suggested_post_outline:
  overview_angle: "game jam の成功談ではなく、day three で playable がない状態から、core loop を削って統合し、最後の playtest で理解・UI・難度を直した制作判断として読む。"
  analysis_axis: "初期 scope の過大化、variables / interactions / cause-and-effect relationships の事前合意不足、single upgrade tree への削減、残り24時間 playtest、staged tutorial の5軸で整理する。"
  application_target: "Nao_u_BOT の playable diff 制作で、複数システムを並列実装する前に因果関係を1枚に揃えること、初回理解を最後に残さないこと、tutorial を段階開示にすることへ適用する。"
  pros_cons: "メリットは短期制作で実際に起きた scope collapse と修正判断が追える点。デメリットは製品開発への一般化を含む記事なので、ゲーム固有の面白さ評価は別途補う必要がある点。"
  verdict_pre: "採用"

---

## raw_excerpt
Flame Game Jam 2026 の参加記録。2人チームで "Big Brother" テーマを受け、AI dependency を世界へ広げる Plague Inc. 風のゲーム "Suppressed Intelligence" を作った。初期案は4つの sector stats、3つの upgrade trees、15秒ごとの procedural news report、anti-AI organization、Windows 95 aesthetic まで含んでいたが、day three 時点で playable build がなく、機能が pieces として存在するだけだった。

そこから single upgrade tree に絞り、sector stats を4つから2つへ削り、core loop を「AI bubbles を pop して connected regions へ infiltrate し、news headline carousel を管理する」形で残した。parallel build 前に variables、interactions、cause-and-effect relationships を合わせておかなかったことが時間を食った、と書いている。残り24時間の playtest では、遊び方が分からない、upgrade button が背景に溶ける、difficulty が高すぎる、という3点が出た。tutorial は最初に全部説明するのでなく、game start、launch sector 選択、AI Dependency 15% 到達時に pause panel で出す staged system にした。

## why_relevant_to_games
短期制作で、core loop の縮小、複数システム間の事前合意、最後の playtest による tutorial/UI/difficulty 修正がどう出るかの具体例。小型 game prototype の Phase 1 材料として保存する。
