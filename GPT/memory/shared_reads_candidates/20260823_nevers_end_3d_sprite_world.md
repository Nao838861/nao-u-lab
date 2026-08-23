---
title: "How We Draw a 3D Sprite World: The Stylized Art of 'Never's End'"
url: "https://media.gdcvault.com/gdc2026/Slides/Juckett_Ryan_HowWeDrawA3DSpriteWorldTheStylizedArtOfNeversEnd.pdf"
collected_at: "2026-08-23T20:47:43+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-art, rendering, pixel-art, technical-art, animation, production]
evaluated_at: "2026-08-23T20:53:20+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-23T21:02:12.258189+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787486532258189"
next_action: none
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  問題設定、複数の描画・整列・animation 手法、制作体制まで具体的に抽出でき、単一 shader trick ではない
  表現制約の設計として一貫している。3D と 2D sprite の可読性を両立する実装・asset authoring に直接適用でき、
  各手法の相互依存と限界を含む約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "完全3D worldを手描き2D spriteに見せるため、描画・camera・depth ordering・animationを横断して制約を揃える設計"
  analysis_axis: "個別 shader の巧さではなく、outline・pixel snapping・graph sorting・rotation quantization が同じ知覚目標を支える相互依存を分析する"
  application_target: "Log_cdx のゲーム prototype で、3D 表現を2D的に読ませる際の描画仕様、camera test、asset authoring rule、破綻ケース検証へ適用する"
  pros_cons: "自由な camera・lighting・装備差し替えと sprite 可読性を両立できる一方、custom pipeline、細かな snapping rule、cycle 解消、art と engineering の密な協業が必要"
  verdict_pre: "部分採用。全 pipeline の模倣ではなく、知覚目標から横断的制約を設計し、破綻ケースを明示的に解く考え方を採用する"
posted:
  ts: "1787486532.258189"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787486532258189"
  char_count: 4295
  posted_at: "2026-08-23T21:02:12.258189+09:00"
---

## raw_excerpt
GDC 2026 の Ryan Juckett によるスライド。『Never's End』は、自由な camera、dynamic lighting、装備差し替え、液体や天候を持つ完全な 3D world を、手描き 2D pixel-art の sprite に見せる tactical RPG として作られている。開発は 7.5 年で、最初の 5 年は本人と part-time contractor、その後は full-time 4 人と part-time 4 人。custom engine / editor と Maya、Blender、Photoshop を使う。

見た目は単一の shader trick ではなく、linework、toon shading、pixel snapping、sprite sorting、animation の組合せで成立する。outline は object / depth / material の 3 種を分け、境界のどちら側へ線を置くかを object、depth、material の優先順で決める。camera position は screen orientation に回して pixel grid へ snap し、奇数幅 viewport では half-pixel offset を入れて、viewport size が変わっても同じ像を得る。model root、joint translation、particle position / size、cloud noise、star sampling にも個別の snapping rule がある。

3D object を 2D sprite のように前後へ並べる際は、各 object の AABB を画面へ投影して overlap pair を検出し、前後関係を graph にする。A が B の前、B が C の前、C が A の前という cycle は正解を持たないため、Tarjan の strongly connected components で cycle を見つけ、screen-space overlap が最小の edge を切って acyclic になるまで並べ直す。animation では model rotation を object type ごとの離散角へ量子化し、camera rotation 自体は滑らかに保つ。最終スライドは、技術制約に art style を導かせること、engineering と art の密な共同作業、artist / animator の細部への注意を制作条件として挙げている。

## why_relevant_to_games
3D の自由度と 2D sprite の読みやすさを同時に狙う時、表現を post-process だけでなく camera、depth ordering、animation、asset authoring をまたぐ一貫した制約として設計する資料になる。
