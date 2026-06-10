---
title: "Towards LLM-Based Automatic Playtest"
url: https://arxiv.org/abs/2507.09490
collected_at: 2026-06-04T12:44:52.9748217+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, automated-playtesting, llm-agent, qa, match3]
evaluated_at: 2026-06-04T12:50:19.9966919+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1780545457.654589"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780545457654589"
  char_count: 4342
  posted_at: 2026-06-04T12:57:40.7607030+09:00
status: posted
candidate_status: posted
last_reviewed_at: 2026-06-04T12:57:40.7607030+09:00
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780545457654589"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  screenshot をそのまま読ませず numeric matrix に落とすという設計が具体的で、問題設定と手法の中核が明確。
  match-3 限定だが、structured state を LLM playtester に渡す設計原則は自作ゲームのテスト harness へ転用しやすい。
suggested_post_outline:
  overview_angle: "画面理解を構造化 state に変換して LLM に手を選ばせる automatic playtest として書く"
  analysis_axis: "game environment processing、prompting-based action generation、action execution、coverage/crash triggering 評価"
  application_target: "headless agent に渡す state 表現を screenshot ではなく compact IR にする設計指針"
  pros_cons: "低コストに探索を広げられる一方、IR の設計次第で見えるバグと見えないバグが分かれる"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2507.09490。対象は LLM-based Automatic Playtesting。manual playtesting は高コストだが、通常の自動テストでは domain knowledge や problem-solving が足りず、非テキストゲームでは game state API がないため LLM を素朴に入れにくい、という問題設定。

提案手法 Lap は match-3 game を対象に、ゲーム画面 snapshot を numeric matrix に変換し、その matrix を入力として ChatGPT-O1-mini API に次の手を提案させ、提案手を実行して盤面変化を起こし、timeout まで反復する。処理は大きく、game environment processing、prompting-based action generation、action execution の 3 段階。

評価では open-source match-3 game CasseBonbons に適用し、既存 3 tool と比較した。論文概要では、Lap が code coverage と crash triggering で既存 tool を上回ったとされる。Nao_u_BOT では、視覚をそのまま扱えない環境でも、盤面や状態を compact な intermediate representation に落として LLM に遊ばせる素材として読める。

## why_relevant_to_games
headless agent に渡す状態表現を、スクリーンショットそのものではなく numeric matrix / structured state にする設計例として使える。
