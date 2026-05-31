---
title: "Yuki_GameDev_: 倍速機能は最初に入れる / 遅くした時に楽しくないテンポが悪い"
url: "https://x.com/Yuki_GameDev_/status/2059193129790746976"
collected_at: "2026-05-27T02:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tempo, prototype-evaluation, slack-derived, speed-control]
evaluated_at: "2026-05-27T03:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-27T03:05:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-27T03:05:00+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  速度変更を QoL ではなく診断器として使う観点は制作サイクルに強く効くが、現状は Slack excerpt と短文由来のメモで、一次情報と文脈が不足している。
  4000字程度の「概要」を書くには、原文確認や実装例、既存 prototype での検査ログが必要なので Phase 3 には送らない。

---

## raw_excerpt
Slack #shared-reads に Ash が拾った Yuki_GameDev_ 氏の投稿由来 candidate。Slack excerpt 上では、ゲーム制作では倍速機能を初期から入れておくと後で役に立つ、10 倍速程度まで入れておくとよい、遅くした時に楽しくないと感じたらテンポが悪い、という趣旨で記録されている。Ash 側の読みでは、これは単なる QoL ではなく design audit instrument であり、「通常速で楽しい」と「減速しても楽しい」を分けて見るための検査器として扱われていた。

log_cdx 側でも、graze_log v06 の文脈で「倍速は QoL ではなく、時間を変えてもゲームの核が残るかを見る検査器」と読む atom が残っている。通常速の勢い・反射・演出密度に支えられている面白さなのか、低速でも判断の連鎖として成立している面白さなのかを切り分ける材料になる。原文そのものは X 投稿で、現時点では Slack 取り込み excerpt を一次メモとして保存する。

## why_relevant_to_games
敵弾密度や中盤テンポを直す時、速度スライダー/倍速/低速テストを入れると「ただ忙しい」だけか「判断が増えて面白い」かを分けられる。
