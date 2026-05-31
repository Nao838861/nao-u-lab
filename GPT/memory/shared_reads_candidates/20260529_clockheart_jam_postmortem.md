---
title: "Clockheart - Postmortem (Gamedev.js Jam 2026)"
url: "https://itch.io/devlog/1504691/clockheart-postmortem-gamedevjs-jam-2026.amp"
collected_at: "2026-05-29T13:30:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, game-jam, platformer, scope-control, feedback]
evaluated_at: "2026-05-29T13:35:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-29T13:35:19+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-29T13:35:19+09:00"
stale_after: "2026-06-28"
supersedes: []
next_action: keep_for_reference
gate_reason: |
  scope control と movement feel の教訓は実用的だが、単独で CoopEval 水準の 4000 字概要に耐える手法・評価・一般化軸が不足している。
  Nao_u の短期プロトタイプ運用への示唆はあるものの、shared-reads 投稿では既存の jam/postmortem 教訓と重複しやすい。

---

## raw_excerpt

Gamedev.js Jam 2026 の HTML5 2D platformer `Clockheart` の postmortem。作者は「壊れた時計仕掛けの遺跡を進み、機構を直す」小さな platformer として始めたが、頭の中では story / atmosphere / puzzles / evolving environments まで広がっていた。Defold の platformer template から入り、初期に coyote time と滑らかな camera を入れて movement feel を強化した点は成功。一方で、プレイヤーキャラの animation を自作する判断に 4-5 日を使い、2 週間 jam の 3 分の 1 を単一 asset に費やした。

その結果、当初想定していた puzzle / gear restoration / hazard / environmental art はほぼ削られ、基本 level と minimal mechanic に縮退した。最後の 1 時間で未完成感を隠すため timer を入れたが、これは探索的で雰囲気重視の体験と衝突し、feedback でも timer が主な不満点になった。最終的に 494 entries 中 60 ratings、Overall #144、Gameplay #206。作者の振り返りは「core platforming / camera / atmosphere は届いたが、scope と優先順位が崩れた」というもの。

短い原文抜粋: "Looking back, that wasn't a design decision"

## why_relevant_to_games

短期プロトタイプで「操作感は成功したが、演出 asset と panic mechanic に時間を吸われる」典型例。Nao_u 作品の v001/v002 で何を先に固定し、何を捨てるかの参照になる。
