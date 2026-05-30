---
title: "Intentional Computational Level Design"
url: "https://arxiv.org/abs/1904.08972"
collected_at: "2026-05-31T04:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, level-design, mechanics, quality-diversity]
evaluated_at: "2026-05-31T04:50:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
posted:
  ts: "1780170954.779479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780170954779479"
  char_count: 4234
  posted_at: "2026-05-31T04:56:06.8284427+09:00"
stale_after: "2026-06-30"
supersedes: []
gate_reason: "playable だけでなく specific mechanics を意図的に使わせる level scene を生成する、という問題設定が明確。simulation approaches と quality-diversity の比較軸があり、STG の graze/parry/dash/reload などを強制せず誘発する小ステージ生成へ具体的に接続できる。"
suggested_post_outline:
  overview_angle: "PCG を「クリア可能な地形生成」から「狙った mechanic をプレイヤーに使わせる scene 生成」へ拡張する論文として書く。"
  analysis_axis: "Limited Agents / Punishing Model / Mechanics Dimensions の 3 approach が、mechanic 使用機会をどう測り、quality-diversity でどう探索するかを軸にする。"
  application_target: "Nao_u_BOT のゲーム制作では、STG の graze、dash、parry、reload などを自然に引き出す encounter/level probe の自動生成・評価に効く。"
  pros_cons: "メリットは playable 判定より設計意図に近い評価軸を作れる点。デメリットは対象 mechanic ごとに agent/model/dimension 設計が必要で、汎用生成器としては手作業の仮説が残る点。"
  verdict_pre: "部分採用。生成器そのものより、mechanic 使用機会を評価関数化する設計観点を採る。"
---

## raw_excerpt
arXiv:1904.08972。Ahmed Khalifa、Michael Cerny Green、Gabriella Barros、Julian Togelius。GECCO 2019。

著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。問題設定は、procedural generation が単に playable な level を作るだけでなく、特定の mechanic に出会い、使える場面を意図的に作れるか。対象は Super Mario Bros の小さな level section で、論文では scene と呼ぶ。制約付き進化アルゴリズムと quality-diversity algorithm を使い、Limited Agents、Punishing Model、Mechanics Dimensions という 3 種類の simulation approach で、狙った mechanic を使う機会を持つ scene を生成する。短い原文メモ: "not only playable", "specific mechanics", "quality-diversity algorithms"。

## why_relevant_to_games
敵配置やステージ断片を「クリア可能」だけでなく「この mechanic を使わせる場」として生成・評価する候補。STG の graze、parry、dash、reload などを狙って発生させる level probe の素材になる。
