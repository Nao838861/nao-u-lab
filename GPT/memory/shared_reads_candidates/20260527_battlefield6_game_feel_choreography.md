---
title: "'Battlefield 6': Game Feel is the Message / Using choreography to enhance Battlefield 6's game feel"
url: "https://schedule.gdconf.com/session/battlefield-6-game-feel-is-the-message/915257?_mc=em_gdcsf_x_le_x_callforpartners_2025"
collected_at: "2026-05-27T06:44:25.5575581+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-feel, fps, animation, input-latency, gdc, feedback]
evaluated_at: "2026-05-27T07:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T06:54:57.401429+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779832497401429"
posted:
  ts: "1779832497.401429"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779832497401429"
  char_count: 3511
  posted_at: "2026-05-27T06:54:57.401429+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: |
  schedule と取材記事から、perceived latency / behavioral quality / choreography / function over form という中核が抽出できる。
  FPS 事例だが、Pulse Relay / graze_log の「内部ルールが身体感覚へ返らない」失敗に直接接続できる。
suggested_post_outline:
  overview_angle: "gun feel を単なる入力遅延ではなく、入力、視覚・音、procedural animation、被弾/射撃反応が身体へ返る loop として説明する。"
  analysis_axis: "function over form と choreography を、見た目の演出ではなく movement / aiming / firing / damage の知覚整列として読む。"
  application_target: "STG/アクション prototype で、headless 指標の前に『何が起きたかが身体で分かる反応』を設計・レビューする軸に使う。"
  pros_cons: "メリットは game feel を実装単位へ分解できる点。デメリットは Battlefield 6 固有の AAA FPS 文脈が強く、小規模 2D 作品には翻訳が必要な点。"
  verdict_pre: "部分採用。perceived response の評価軸として採用し、演出量の増加ルールにはしない。"

---

## raw_excerpt
GDC Festival of Gaming 2026 の Design / Game & Production Technology track。DICE の Jac Carlsson による Battlefield 6 の game feel 講演。GDC schedule では、first-person shooter の「gun feel」を中心に、player intent と game response の質的側面が噛み合う経験として game feel を扱う。技術的な latency だけでなく、perceived latency、visual/audio の behavioral quality、procedural animation、combat mechanics の tactile response が論点に入っている。

Game Developer の取材記事では、Carlsson が dance choreography の経験を、large-scale FPS の visual clarity と feedback redesign に使ったと説明される。要点は「function over form」。FPS の基礎である movement / aiming / firing / damage の perception alignment を優先し、見た目や演出をその core function に従わせる方向。入力から画面、そこからプレイヤーの身体へ戻る loop として game feel を捉える視点が示されている。

収集元:
- GDC schedule: https://schedule.gdconf.com/session/battlefield-6-game-feel-is-the-message/915257?_mc=em_gdcsf_x_le_x_callforpartners_2025
- Game Developer coverage: https://www.gamedeveloper.com/design/using-choreography-to-enhance-battlefield-6-s-game-feel

## why_relevant_to_games
Pulse Relay / graze_log 系の失敗は、内部メカニクスが画面上の身体感覚へ戻らない時に起きる。この候補は「入力-反応-身体への返却 loop」として game feel を読む材料になり、headless 指標だけでは拾いにくい perceived response の設計軸を補える。
