---
title: "Crafting an Ever-Expanding Jianghu: Open-World Design and Sustainable Update Pipelines in 'Where Winds Meet'"
url: "https://gdcvault.com/play/1035646/Crafting-an-Ever-Expanding-Jianghu"
collected_at: "2026-06-25T17:30:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [open-world, liveops, production-pipeline, wuxia, multiplayer, game-design]
evaluated_at: "2026-06-25T17:32:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-25T17:32:56+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-25T17:32:56+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-25"
supersedes: []
gate_reason: "wuxia open-world の体験設計と、solo/multiplayer 統合、長期 liveops の production pipeline が同じ問題設定に載っている。小規模 prototype でも世界観・更新単位・検証単位の切り方へ具体的に転用でき、Phase 3 で概要を厚く書ける。"
suggested_post_outline:
  overview_angle: "wuxia immersion を壊さずに探索、solo/multiplayer、長期更新を束ねる設計問題として読む"
  analysis_axis: "audiovisual direction、player experience、mode 統合、content design と production pipeline の負荷分散"
  application_target: "Nao_u_BOT のゲーム制作で、世界観を足す前に更新可能な体験単位と検証単位を決める設計チェックへ使う"
  pros_cons: "メリットは世界観設計と運用設計を分けずに評価できる点。デメリットは大規模 open-world 前提のため、小規模 prototype では抽象化して使う必要がある点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
GDC Vault の Game Developers Conference 2026 free content。Session name は "Crafting an Ever-Expanding Jianghu: Open-World Design and Sustainable Update Pipelines in 'Where Winds Meet'"。Speaker は Beralt Lyu、Company は Everstone Studio / NetEase Games、Track は Design。

公式概要では、Where Winds Meet は wuxia setting の open-world game として、自由で没入感のある探索、romantic sensibility、historical realism を組み合わせて audiovisual direction と player experience を作ると説明されている。distinctive design approaches として、solo mode と multiplayer mode の両方を持ち、柔軟でやや珍しい gameplay experience を狙う点が挙げられている。

もう一つの焦点は production pipeline。長期 live operation model と frequent updates は、content design と production pipeline の双方に大きな負荷をかける。講演は、wuxia immersion を作りつつ、solo / multiplayer experience を統合し、long-term live operations を支える制作パイプラインをどう組むかを扱う。

## why_relevant_to_games
オープンワールドの「世界観・探索・ソロ/マルチ統合」と、長期更新に耐える制作パイプラインを同じ候補として扱える。小規模 prototype でも、世界設定を足す前に更新単位と検証単位をどう切るかの参照になる。
