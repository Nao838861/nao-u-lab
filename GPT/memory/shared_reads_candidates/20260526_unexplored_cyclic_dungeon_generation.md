---
title: "Unexplored's Secret: 'Cyclic Dungeon Generation'"
url: https://www.gamedeveloper.com/design/unexplored-s-secret-cyclic-dungeon-generation-
collected_at: 2026-05-26T13:21:25+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, roguelike, level-design, puzzle]
evaluated_at: 2026-05-26T13:23:58+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T13:33:18+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779769858230399"
posted:
  ts: "1779769858.230399"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779769858230399"
  char_count: 3615
  posted_at: "2026-05-26T13:33:18+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: |-
  start-goal path ではなく gameplay cycle / mission graph を先に設計し、それを playable dungeon に翻訳する中核が明確。
  lock-key、loop、入れ子 cycle、Ludoscope grammar まで具体化でき、ゲーム制作の構造設計へ無理なく適用できる。
suggested_post_outline:
  overview_angle: "ランダム地形生成ではなく、プレイヤーが往復・解除・再解釈する gameplay cycle を先に作る手法として整理する。"
  analysis_axis: "mission graph から地形・罠・宝箱・shortcut へ翻訳する段階分けと、線形生成との違いを軸にする。"
  application_target: "rog_mystery や探索/推理系プロトタイプで、UI に graph を出さずに構造を体験へ埋め込む設計チェックへ使う。"
  pros_cons: "メリットは構造的な探索感と再訪の意味を作れること。デメリットは grammar 設計の手間と、生成結果の読解性検証が必要なこと。"
  verdict_pre: "採用"

---

## raw_excerpt

Game Developer の 2021-01-28 記事。Unexplored の cyclic generation は、レベルを直接ランダム生成するのではなく、まず「面白い gameplay cycle」を設計し、それを playable dungeon へ変換する。短い核は "cycles of interesting gameplay"、"translated into level designs"、"mission graph"。通常の生成は start から goal への経路を作り、dead-end と branch を足す形になりやすいが、cyclic generation は start から goal へ行く道に加えて、start へ戻る別経路を持つ loop を中核にする。

記事では lock-and-key pattern が例として挙がる。プレイヤーは path A で扉に到達するが鍵がないため、path B を通って鍵を取り、再び start 側へ戻って path A を通り直す。さらに、この cycle の中に別の cycle を入れ子にできる。設計者は Ludoscope 上で抽象的な mission structure、pattern、rule を扱い、ゲーム側はその grammar を地形、罠、部屋テーマ、宝箱、shortcut などに翻訳する。

## why_relevant_to_games

「構造を積む」と「プレイヤーに読める道筋を作る」の橋渡し候補。log_mystery の内部構造流出問題や、探索/推理系プロトタイプで mission graph を UI に出さず体験へ翻訳する材料になる。
