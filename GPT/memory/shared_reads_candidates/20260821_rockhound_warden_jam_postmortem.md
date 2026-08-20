---
title: "The Rockhound Warden Jam Postmortem"
url: "https://itch.io/devlog/1614928/the-rockhound-warden-jam-postmortem.amp"
collected_at: "2026-08-21T05:31:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-jam, postmortem, mining, voxel, mechanics, production]
evaluated_at: "2026-08-21T05:34:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-21T05:34:38+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-21T05:34:38+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  3D matching の失敗から inventory compactor へ mechanic を移す判断、描画限界を fog と curvature で表現へ転換する過程、迷子を検出した test 後の補助追加まで因果を追える。
  成功談だけでなく balance 未完と時間配分の失敗も残り、小規模 voxel prototype の設計・実装・評価へ具体的に適用でき、4000字級の概要を無理なく構成できる。
suggested_post_outline:
  overview_angle: 失敗した3D matchingを別の操作面へ移し、技術制約を世界観へ変換して一か月の voxel game を成立させた判断連鎖
  analysis_axis: mechanic の役割を保った表現面の変更、制約由来の art direction、playtest 後の可読性補助、未完の balance が示す scope 管理
  application_target: Log_cdx の小規模3D prototypeで、読めない mechanic を捨てずに別 UI 層へ移植する判断と、性能制約を visual identity へ接続する評価 cycle
  pros_cons: 具体的な設計 pivot と test 後の修正は再利用しやすい一方、定量評価がなく upgrade economy の妥当性は未検証
  verdict_pre: 部分採用
---

## raw_excerpt

Game-Like Jam 10 で「Minecraft Classic に似た作品」を一か月で作った The Rockhound Warden の postmortem。Minecraft 全体を再現せず、破壊可能 voxel と mining を中心に絞ったうえで、一般的な採掘 game の Dig→Sell→Upgrade 反復とは違う核を探した。最初は block の記号を3D空間で matching すると採掘効率が上がる案を試したが、視点と奥行きを含む空間では直感的でなく、操作が煩わしかったため撤回した。代わりに、Minecraft の同種 item stacking を inventory 内の compactor という仕組みに読み替え、短時間で動く形に置き換えた。

素朴な voxel 描画は遠距離まで表示すると性能が足りず、作者は描画限界を fog と world curvature で隠した。結果的に制約隠しが神秘的な雰囲気を生み、firefly particle や Warden という交換相手の造形へ art direction がつながった。一方、途中で別 game jam に参加して約一週間を失い、upgrade と balance は最大の bottleneck のまま締切を迎えた。終盤の test では坑道内で迷いやすいことが分かり、help message、照準 icon、採掘時間を示す radial bar、flare、効果音を追加した。延長された一日で save system と Warden の animation まで入れて提出した。

## why_relevant_to_games

3Dでは読みにくい mechanic を inventory 操作へ移す判断と、性能上の制限を visual identity に変換する過程を、小規模 voxel prototype の設計・評価に利用できる。
