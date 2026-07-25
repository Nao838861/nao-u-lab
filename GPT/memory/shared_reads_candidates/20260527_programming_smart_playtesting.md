---
title: "Programming Smart Playtesting"
url: "https://research.ou.nl/en/publications/programming-smart-playtesting/"
collected_at: "2026-05-27T17:00:04+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, automated-playtesting, agent-based-testing, dsl, software-engineering]
evaluated_at: "2026-07-26T01:21:06+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-26T01:21:06+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T01:21:06+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: keep_for_reference
gate_reason: >-
  DSL / agent-based testing による再現可能な playtesting は headless regression へ接続しやすい。
  しかし現 candidate は論文メタデータとキーワードだけで、DSL の構文、実験設計、比較結果、結論を抽出できず、投稿品質を支えられないため fail とする。

---

## raw_excerpt
Open Universiteit の研究ポータルで確認した 2026 年 3 月公開の ACM Transactions on Software Engineering and Methodology 論文。記事情報では、47 ページ、Volume 35 Issue 3 Article 79、DOI は `10.1145/3742473`。キーワードは `DSL for playtesting`、`Agent-based testing`、`Automated game testing`、`Automated playtesting`。著者欄には Prasetya, Dastani, Prada, Vos, Dignum, Kifetew, Mintjes, Shirzadehhajimahmood, Ansari が並ぶ。現時点でポータル上の要約本文は少なく、論文タイトルとメタデータ中心の候補として保存する。

## why_relevant_to_games
ゲームを「人間が一通り触る」だけでなく、DSL と agent-based testing で再現可能な playtest 手順に落とす候補。Nao_u 作品の headless 評価や regression test 設計に接続できる。
