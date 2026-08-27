---
title: "OSU Game I/O Game Jam Postmortem: Eggurger"
url: "https://itch.io/devlog/1447983/osu-game-io-game-jam-postmortem-eggurger.amp"
collected_at: "2026-08-27T11:18:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, action-game, balancing, release-engineering]
---

## raw_excerpt

原文の要点を日本語で採録する。『Eggurger: The Game』は、食べ物を題材にした見通しのよい top-down action として、`hub -> run -> boss -> victory -> rerun` の循環を目標に制作された。jam 中は敵の出現間隔と room flow を反復調整し、combat の偶然性を減らした。武器は charge / slash の役割と命中結果を明確化し、French Fry と Jalapeño 系統の割合 damage は runaway scaling を避けるため削除した。通常敵の loot bag は確定 drop から確率制へ変え、mini-dungeon の room 通過だけで得られる passive XP も撤去し、戦闘と進行選択を報酬へ結び直した。

boss room は最終 burner fight の圧力と視覚へ合わせ、boss 撃破から portal、victory へ至る遷移を明示的に修正した。制作量は73 commit、Lua 33 file・16,010行で、最も重い subsystem は gameflow と combat room logic を持つ `states/` だった。作者は、rewrite より局所修正、endgame transition の明示、weapon damage model の正規化、重要修正直後の syntax check と rebuild を有効だった判断として挙げる。次回課題には状態遷移の regression check、drop table の小さな自動検査、content tuning と system behavior の分離、release artifact を確認する checklist script を挙げている。最終的に作品は jam で1位になった。

## why_relevant_to_games

action game の pacing・報酬・damage scaling を調整しながら playable 状態を保ち、boss 後の状態遷移と配布 build まで検証する短期制作の具体例として参照できる。
