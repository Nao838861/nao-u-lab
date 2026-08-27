---
title: "OSU Game I/O Game Jam Postmortem: Eggurger"
url: "https://itch.io/devlog/1447983/osu-game-io-game-jam-postmortem-eggurger.amp"
collected_at: "2026-08-27T11:18:28+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, action-game, balancing, release-engineering]
evaluated_at: "2026-08-27T11:21:46+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-27T11:21:46+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-27T11:21:46+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-26"
supersedes: []
gate_reason: >-
  jam の限られた期間で、pacing、報酬、割合 damage、boss 後の状態遷移、release artifact をどう局所修正したかが具体例とともに揃い、73 commit・16,010行・jam 1位という評価の文脈もある。
  調整内容を「戦闘と報酬の因果を戻す」「終端遷移を明示する」「重要修正を即時検証する」という制作原則へ落とせ、短期 playable diff に直接適用できるため、約4000字の概要を記事固有の情報で構成できる。
suggested_post_outline:
  overview_angle: "jam 後半の局所修正を、遊びの因果・状態遷移・配布物検証の三層で読み解く"
  analysis_axis: "個別の数値調整ではなく、無償報酬や runaway scaling を除き、プレイヤー行動と結果の対応を再構成した判断を評価する"
  application_target: "Nao_u_BOT の短期アクション prototype で、combat tuning、boss→result 遷移、修正直後の syntax/build check を一つの完了条件に束ねる"
  pros_cons: "局所修正と具体的な失敗例は再利用しやすい一方、単一 jam 作品の自己報告であり、比較 playtest や定量的な retention 評価はない"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文の要点を日本語で採録する。『Eggurger: The Game』は、食べ物を題材にした見通しのよい top-down action として、`hub -> run -> boss -> victory -> rerun` の循環を目標に制作された。jam 中は敵の出現間隔と room flow を反復調整し、combat の偶然性を減らした。武器は charge / slash の役割と命中結果を明確化し、French Fry と Jalapeño 系統の割合 damage は runaway scaling を避けるため削除した。通常敵の loot bag は確定 drop から確率制へ変え、mini-dungeon の room 通過だけで得られる passive XP も撤去し、戦闘と進行選択を報酬へ結び直した。

boss room は最終 burner fight の圧力と視覚へ合わせ、boss 撃破から portal、victory へ至る遷移を明示的に修正した。制作量は73 commit、Lua 33 file・16,010行で、最も重い subsystem は gameflow と combat room logic を持つ `states/` だった。作者は、rewrite より局所修正、endgame transition の明示、weapon damage model の正規化、重要修正直後の syntax check と rebuild を有効だった判断として挙げる。次回課題には状態遷移の regression check、drop table の小さな自動検査、content tuning と system behavior の分離、release artifact を確認する checklist script を挙げている。最終的に作品は jam で1位になった。

## why_relevant_to_games

action game の pacing・報酬・damage scaling を調整しながら playable 状態を保ち、boss 後の状態遷移と配布 build まで検証する短期制作の具体例として参照できる。
