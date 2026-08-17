---
title: "Indie Postmortem: Reflexive's Wik & The Fable Of Souls"
url: "https://www.gamedeveloper.com/business/indie-postmortem-reflexive-s-i-wik-the-fable-of-souls-i-"
collected_at: "2026-08-18T08:15:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, postmortem, prototyping, controls, tutorial]
---

## raw_excerpt

Simon Hallam による2005年の一次ポストモーテム。『Wik & The Fable Of Souls』は、複数人が同じPCへマウスをつないで虫を奪い合う一日プロトタイプ「BugEater」から始まった。しかし full development へ移る際、MouseParty の混乱した楽しさを single-player の核にも転用できると見込み、直線ジャンプ、障害物、空中の虫を舌で取る案などを三か月試しても、レベル差を作れるだけの遊びにならなかった。そこで重力を導入し、空中で舌を足場へ貼りつけて振り子のように移動する案を試すと、粗い初版でも手応えが明確だったため、既存レベルをすべて捨てて jump-and-swing 中心へ作り直した。新しい移動と少数の基準レベルを整えるのに約六週間を使い、挙動調整は86項目の in-game editable property を持つ style sheet へ分離した。

完成版の mouse-only control は入力を文字どおり実行せず、プレイヤーが狙ったと思われる結果へ補正する。足場端でのジャンプは落下を避け、舌の接続点はクリック周辺から安全な swing position を探す。tutorial も、全員へ同じ手順を強制する線形版では熟練者が退屈し、初心者は後で旧習へ戻ったため、複数目標を自由に解かせ、迷った時だけ助言する版へ改めた。それでも偶然通過して技能を学ばない例が残り、release 後には弱点を継続監視して必要時だけ助言する watchdog 案まで記されている。

## why_relevant_to_games

multiplayer prototype の楽しさを別 mode の成立根拠にしない検証、core mechanic を途中で捨てる判断、意図推定型の入力補正、技能習得を行動から検出する tutorial 設計の収集資料になる。
