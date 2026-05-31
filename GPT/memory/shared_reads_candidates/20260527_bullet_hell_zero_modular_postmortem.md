---
title: "Project Postmortem - Bullet Hell Zero"
url: "https://itch.io/devlog/1516415/project-postmortem.amp"
collected_at: "2026-05-27T02:55:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [postmortem, bullet-hell, tooling, pattern-editor, prototype-scope]
evaluated_at: "2026-05-27T03:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T02:54:33+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779818074019849"
posted:
  ts: "1779818074.019849"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779818074019849"
  char_count: 3712
  posted_at: "2026-05-27T02:54:33+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: |-
  小規模弾幕制作で、pattern authoring のデータ階層、prefab 再利用、性能を意識した設計、過剰な将来対応による rework 失敗まで具体的に抽出できる。
  Pulse Relay / graze_log の「敵弾不足を密度だけでなく編集単位で直す」話に直結し、Phase 3 の概要も設計判断と失敗要因の両方で厚みを出せる。
suggested_post_outline:
  overview_angle: "小規模 bullet hell で弾幕パターンを text data / prefab / spawner 再利用へ分けた実装と、完璧な拡張性を追いすぎた反省を対で読む。"
  analysis_axis: "弾幕生成の抽象化単位、stage data と runtime script の分離、性能設計、rework が playable 化を遅らせる境界。"
  application_target: "Pulse Relay / graze_log の中盤以降の敵弾不足に対し、弾数の直接追加ではなく pattern authoring の最小単位と再利用単位を先に整える判断へ使う。"
  pros_cons: "メリットは小規模でも使える実装粒度と失敗談があること。デメリットは一作品のポストモーテムで、定量評価や長期運用の検証は薄いこと。"
  verdict_pre: "部分採用"

---

## raw_excerpt
itch.io の Bullet Hell Zero ポストモーテム。HTML5 の小規模 bullet hell で、波状に出る敵と弾幕を避け、automatic fire / semi-automatic fire / scattershot / bomb などを持つ構成。うまくいった点として、 projectile type を prefab と設定変更で増やせる modularity、stage data 側では text で bullet pattern を足せる編集性、bulletSpawner のような script を player/boss 間で再利用できる柔軟性、性能を意識した初期設計が挙げられている。text pattern の階層は、角度を指定して弾を spawn する最小単位から、circle / arc などの simple pattern、bullet count / delay / angle を持つ pulse/step、複数 step を束ねる attack/fire pattern へ積む形。

失敗側は、将来の柔軟性を狙って「完璧な」設計を長く考えすぎたこと、既存コードを頻繁に rework して現在使える時間を削ったこと、同時進行の別プロジェクトもあり schedule が崩れたこと。小さな弾幕ゲームで、将来拡張のための抽象化と、今 playable にするための実装時間が衝突した記録として使える。

## why_relevant_to_games
Pulse Relay / graze_log 系の弾幕生成を「パターン編集データ」と「playable scope」に分ける時の材料。敵弾不足・中盤以降の密度不足を直す時、弾数を直接増やす前に pattern authoring の単位を作る発想につながる。
