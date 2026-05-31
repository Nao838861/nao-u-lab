---
title: "\"It depends on where AI is used\": Players' attitude patterns and evaluative logics toward different AI applications in digital games"
url: "https://arxiv.org/abs/2604.27812"
collected_at: "2026-05-26T05:08:35+09:00"
collected_by: "log_cdx (Phase 1)"
evaluated_at: "2026-05-26T05:12:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-26T05:38:14+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779740294393709"
posted:
  ts: "1779740294.393709"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779740294393709"
  char_count: 4002
  posted_at: "2026-05-26T05:38:14+09:00"
stale_after: "2026-06-25"
supersedes: []
next_action: none
gate_reason: >-
  8つの AI 利用文脈ごとに acceptance / rejection / conditional acceptance を分け、
  6つの evaluative logics へ抽象化しているため、問題設定・手法・評価・結論を概要化できる。
  AI NPC や動的難易度を「AI 機能」一括で扱う失敗を避ける設計チェックに直結する。
suggested_post_outline:
  overview_angle: "AI そのものの是非ではなく、介入箇所ごとに変わるプレイヤーの評価ロジックを整理する。"
  analysis_axis: "8文脈、自由記述 thematic analysis、6つの evaluative logics の対応を見る。"
  application_target: "NPC、dynamic balancing、生成アート、co-creation を実装前レビューで別々のリスク表に落とす。"
  pros_cons: "受容理由と抵抗理由を分離できる一方、質問票研究なので実プレイ中の行動差分は別検証が必要。"
  verdict_pre: "部分採用"
genre_tags: [game-design, player-experience, ai-in-games, ux, survey]

---

## raw_excerpt
arXiv:2604.27812。AI がデジタルゲームへ入る時、プレイヤーの態度は「AI を使っているか」だけではなく、どこで・どう介入するかに左右される、という問題設定。対象は intelligent NPC、emergent narrative、dynamic balancing、recommendation systems、review and governance、art asset generation、co-creation gameplay、gameplay evolution の8文脈。

310件の質問票から得た 1,856 件の有効な自由記述を thematic analysis し、acceptance / rejection / conditional acceptance の理由を整理している。結果として、プレイヤーは AI が immersion、personalization、novelty、efficiency、convenience を増す時には歓迎しやすい。一方で creativity、emotional authenticity、autonomy、fairness、system stability、authorship、accountability を脅かす時には抵抗しやすい。著者らは上位概念として experiential enrichment、instrumental efficiency、system reliability、agency and control、authorship and compliance、human oversight の6つの evaluative logics を挙げる。

## why_relevant_to_games
NPC、動的難易度、生成アート、co-creation などを一括で「AI機能」と見ず、介入箇所ごとにプレイヤーの抵抗理由を分けて設計メモ化できる。
