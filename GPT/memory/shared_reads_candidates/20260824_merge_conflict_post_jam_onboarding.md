---
title: "Dev Log 01: The Post-Jam Cleanup and Upgrades"
url: "https://itch.io/devlog/1614333/dev-log-01-the-post-jam-cleanup-and-upgrades.amp"
collected_at: "2026-08-24T14:19:35+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, onboarding, card-game, playtesting, balancing]
evaluated_at: "2026-08-24T14:23:50+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-24T14:23:50+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-24T14:23:50+09:00"
next_action: keep_for_reference
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  feedback を onboarding、選択権、入力、難易度へ変換した変更点は具体的だが、変更後の playtest 結果や比較評価がなく、何が改善したかを検証できない。
  単独資料から CoopEval 水準の概要を構成すると変更列挙以上の推測が増えるため、投稿候補ではなく短期制作後の改善例として参照に留める。
---

## raw_excerpt

『Merge Conflict』の game jam demo 後の更新記録。作者は jam の feedback を受け、プレイヤーが swipe の意味と結果を理解できるよう、Intern 役から始まる guided onboarding を追加した。gameplay へ直接影響できる仕組みとして Performance Review を導入し、skill level に応じて一枚以上の card を Backpocket に保存し、任意の時点で使えるようにした。tutorial も Backpocket を早い段階で体験させる構成へ調整した。操作面では、従来存在しなかった press-and-hold gesture で Backpocket 内の item を選べるようにし、card selection と interaction を変更している。balance は simulated gameplay と jam comment の両方を材料にし、100日規模の project が難しすぎるという反応に対して、project の長さを選べるようにした。加えて card animation と画面内 UI の配置も更新している。記事は、feedback の受領後に onboarding、decision agency、input gesture、difficulty scope、visual feedback を同じ post-jam build で変更した内容を列挙している。

## why_relevant_to_games

短期制作後の player feedback を、説明追加だけでなく、早期 tutorial、保留カードによる選択権、入力 gesture、run 長選択へ接続した事例として、カードゲームや一画面 UI の反復改善時に参照できる。
