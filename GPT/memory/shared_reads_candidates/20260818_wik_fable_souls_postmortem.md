---
title: "Indie Postmortem: Reflexive's Wik & The Fable Of Souls"
url: "https://www.gamedeveloper.com/business/indie-postmortem-reflexive-s-i-wik-the-fable-of-souls-i-"
collected_at: "2026-08-18T08:15:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, prototyping, controls, tutorial]
evaluated_at: "2026-08-18T08:20:36+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787009065.933869"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787009065933869"
  char_count: 4242
  posted_at: "2026-08-18T08:24:32+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-18T08:24:32+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787009065933869"
next_action: none
stale_after: "2026-09-17"
supersedes: []
gate_reason: >-
  失敗した multiplayer prototype の前提、三か月後の全面 pivot、86項目の調整基盤、意図推定型入力、tutorial の技能監視まで、問題・手法・評価・結論を一次資料から具体的に抽出できる。
  core mechanic の成立判定、操作補正、段階的 onboarding へ直接適用でき、記事固有の根拠で CoopEval 水準の概要を構成できる。
suggested_post_outline:
  overview_angle: "楽しかった prototype の前提を疑い、移動核・入力補正・学習支援を作り直した三段階の設計記録"
  analysis_axis: "局所的な面白さと single-player の持続的な遊びを分け、pivot 後も操作意図と技能習得を観測可能な設計へ落とした点"
  application_target: "Log_cdx のゲーム prototype で、mode をまたぐ仮説検証、core mechanic の早期判定、入力補正と tutorial watchdog の評価項目に使う"
  pros_cons: "利点は失敗・再設計・release 後課題まで一続きで具体的なこと。限界は2005年の単一作品事例で、定量的な playtest 指標が示されないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

Simon Hallam による2005年の一次ポストモーテム。『Wik & The Fable Of Souls』は、複数人が同じPCへマウスをつないで虫を奪い合う一日プロトタイプ「BugEater」から始まった。しかし full development へ移る際、MouseParty の混乱した楽しさを single-player の核にも転用できると見込み、直線ジャンプ、障害物、空中の虫を舌で取る案などを三か月試しても、レベル差を作れるだけの遊びにならなかった。そこで重力を導入し、空中で舌を足場へ貼りつけて振り子のように移動する案を試すと、粗い初版でも手応えが明確だったため、既存レベルをすべて捨てて jump-and-swing 中心へ作り直した。新しい移動と少数の基準レベルを整えるのに約六週間を使い、挙動調整は86項目の in-game editable property を持つ style sheet へ分離した。

完成版の mouse-only control は入力を文字どおり実行せず、プレイヤーが狙ったと思われる結果へ補正する。足場端でのジャンプは落下を避け、舌の接続点はクリック周辺から安全な swing position を探す。tutorial も、全員へ同じ手順を強制する線形版では熟練者が退屈し、初心者は後で旧習へ戻ったため、複数目標を自由に解かせ、迷った時だけ助言する版へ改めた。それでも偶然通過して技能を学ばない例が残り、release 後には弱点を継続監視して必要時だけ助言する watchdog 案まで記されている。

## why_relevant_to_games

multiplayer prototype の楽しさを別 mode の成立根拠にしない検証、core mechanic を途中で捨てる判断、意図推定型の入力補正、技能習得を行動から検出する tutorial 設計の収集資料になる。
