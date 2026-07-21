---
title: "Postmortem: One week from idea to internal playtest"
url: "https://sundaybrunchstudios.itch.io/battle-arena-prototype/devlog/1468761/postmortem-one-week-from-idea-to-internal-playtest"
collected_at: "2026-07-21T22:31:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, action-game, animation, state-machine, godot, prototyping, playtesting]
evaluated_at: "2026-07-21T22:33:29+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-21T22:40:46+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784641237651129"
next_action: none
stale_after: "2026-08-20"
supersedes: []
posted:
  ts: "1784641237.651129"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784641237651129"
  char_count: 4463
  posted_at: "2026-07-21T22:40:46+09:00"
gate_reason: >-
  Startup / Active / Recovery / Transition を frame data、animation、hitbox、入力割込み、logical state の共通語彙にした実装が具体的で、内部 playtest の評価範囲も明示されている。
  短期 action prototype の手触り検証と horizontal slice を混同しない milestone 設計まで一貫しており、約4000字で手法・評価・限界を固有に説明できる。
suggested_post_outline:
  overview_angle: "一週間の action prototype で攻撃4相を唯一の timing contract にし、見た目と判定と操作応答を同期した実装記録"
  analysis_axis: "animation clip の区間再利用、signal 駆動の state 同期、Transition 中の入力許可、core playtest と public slice の評価境界"
  application_target: "Log_cdx の短期 action game prototype における攻撃 timing table、hitbox event、cancel 可否、state transition の共通仕様化"
  pros_cons: "既存 asset を使って短期間に調整可能な一方、signal 結合と spreadsheet の二重管理、単一内部 playtest、progression 未検証が限界"
  verdict_pre: "採用"
---

## raw_excerpt

作者は action game prototype を一週間で作る目標に対し、8日で internal playtest まで到達した。友人からは直近の prototype より moment-to-moment gameplay の質が上がった一方、進む方向や長期 loop が分かりにくいという feedback が出た。作者は今回の build が progression system を含む milestone ではないことを切り分け、短時間で遊べる core の検証は通過、public playtest には horizontal slice が必要と記録している。workflow は既知手法80%と新規実験20%を timebox し、今回の新規課題を game state と animation state の同期に置いた。

攻撃 animation は Masahiro Sakurai の説明を参照し、Startup / Active / Recovery / Transition の四相を balance 用の frame data だけでなく animator へ渡す仕様として扱った。Godot の AnimationNodeAnimation で `stretch_time_scale` を切り、`start_offset` と `timeline_length` によって既存 KayKit animation の使用区間を指定し、各値は spreadsheet の式で管理した。code 側の State Tree は対応する animation state machine の `state_started` / `state_finished` signal に接続する。OverheadSlash では Active 開始時に sword hitbox を有効化し、Recovery 開始時に無効化、Recovery 終了時に Idle へ戻す。Transition の見た目が再生中でも player action で割り込めるようにし、入力がない時は自動遷移で Idle へ収束させた。状態と見た目の対応を一貫させた後は cooldown など上位 system を積みやすくなったという。

## why_relevant_to_games

短期 action prototype で、攻撃の手触りを animation、hitbox、入力割込み、logical state の共通 phase に落とす実装例として使える。core loop の playtest と horizontal slice の検証範囲を混同しない milestone 設計にも関係する。
