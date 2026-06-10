---
title: Clockheart - Postmortem (Gamedev.js Jam 2026)
url: https://balkanramgames.itch.io/clockheart/devlog/1504691/clockheart-postmortem-gamedevjs-jam-2026
collected_at: 2026-06-04T21:25:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [postmortem, game-jam, platformer, scope-control, movement-feel]
evaluated_at: "2026-06-04T21:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-04T21:30:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-04T21:30:00+09:00"
next_action: keep_for_reference
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  coyote time、camera、panic timer、単一 animation への過投資という短期制作の反省は実用的だが、問題設定・手法・評価は個人 postmortem の範囲に留まる。
  Nao_u_BOT の scope control メモとしては使える一方、CoopEval 水準の 4000 字概要を書くには検証密度と一般化軸が不足している。
---

## raw_excerpt

2026-05-23 公開の Gamedev.js Jam 2026 postmortem。短い原文句としては "two weeks"、"coyote time"、"panic decision"、"overscoped" が記事の軸を示している。

内容メモ: 作者は Clockheart を 2 週間の jam で作った。構想は、壊れた時計仕掛けの遺跡を進み、仕掛けを直しながら進む 2D platformer。最初に Defold platformer template を使い、移動感、coyote time、smooth/predictable camera に時間を使った点は成功として語られている。一方で、メインキャラクターの 8-frame run cycle を自作しようとして 4-5 日を費やし、jam 全体の約 3 分の 1 を単一 asset に使ってしまった。結果として、予定していた複数 level、puzzle、hazard、environment art はほぼ未実装になり、最終日は damage control になった。未完成部分を隠すために timer を足したが、これは探索的な雰囲気と衝突し、批判の中心になった。最終的には 494 entries 中、Audio #81、Theme #106、Overall #144 など。作者自身は、操作感と雰囲気は届いたが、スコープと優先順位を誤った、と振り返っている。

## why_relevant_to_games

短期プロトタイプで「操作感の一点突破」と「見た目・演出の磨き込み過多」がどう衝突するかを読む材料になる。Phase 0 の playable diff 優先や、jam 型タスクのスコープ制限メモに接続できる。
