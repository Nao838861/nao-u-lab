---
title: "Interview: How Project Shadowglass Creates Its Impossible Fully 3D Pixel Art Look"
url: "https://80.lv/articles/interview-how-project-shadowglass-creates-its-impossible-fully-3d-pixel-art-look"
collected_at: "2026-05-25T18:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [visual-design, pixel-art, readability, immersive-sim, godot, production-pipeline]
evaluated_at: "2026-05-25T18:35:47+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T18:44:10+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779702139356069"
posted:
  ts: "1779702139.356069"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779702139356069"
  char_count: 3719
  posted_at: "2026-05-25T18:44:10+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  3D pixel art を単なる低解像度演出ではなく、camera stability、shader/rendering code、pixel stabilization、角度/距離別 readability として扱っている。
  弾・敵・地形・UI の視認性を制約から逆算する話に直結し、制作コストと gameplay readability の両面で Phase 3 投稿に耐える具体性がある。
suggested_post_outline:
  overview_angle: "3D pixel art の魅力を、ノスタルジーではなく可読性・カメラ・距離別アセット設計の問題として説明する。"
  analysis_axis: "stable perspective camera、pixel stabilization、色数と fog の例外、距離別 animation frames / asset variants を軸に分析する。"
  application_target: "弾幕/見下ろし/2.5D 試作で、低解像度表現を採用する前の可読性チェックリストと asset variant 見積もりに使う。"
  pros_cons: "利点は表現制約を gameplay readability に接続できること。弱点は技術詳細が完全な実装手順までは開示されていないこと。"
  verdict_pre: "採用"

---

## raw_excerpt
80.lv の 2026-05-19 インタビュー。Project Shadowglass は、3D 空間を探索しながら低解像度 pixel art の安定した見た目を保つ "Pixerly" 的な表現を扱う。開発者は、この見た目を voxel や単なる low-res 表示ではなく、stable 3D perspective camera と custom shaders / rendering code / pixel stabilization の組み合わせとして説明している。

短い原文抜粋: "stable 3D perspective camera" / "readability at every angle"

記事の焦点は、ノスタルジーそのものよりも「制約をどこまで残すか」の設計。少ない色数は cohesion と readability に効く一方、fog は full spectrum のままの方が雰囲気を作れる場合がある。遠距離オブジェクトは少ない animation frames で成立するが、近距離では画面上の移動量が増えるので frames を増やす必要がある。asset creation は細部が減る一方、低解像度では角度ごとの可読性を常に考え、距離別の asset variants が必要になる。

## why_relevant_to_games
見た目の制約を「雰囲気」だけでなく gameplay readability と production cost に接続する事例。弾・敵・地形・UI の視認性を、解像度や色数の制約から逆算する時に使える。
