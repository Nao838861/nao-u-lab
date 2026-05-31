---
title: "Playing the Imitation Game: How Perceived Generated Content Shapes Player Experience"
url: "https://arxiv.org/abs/2602.14254"
collected_at: "2026-05-17T03:29:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [player-experience, generative-ai, pcg, perception-bias, level-design]
evaluated_at: "2026-05-17T03:31:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T04:17:37+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778956657201979"
posted:
  ts: "1778956657.201979"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778956657201979"
  char_count: 3779
  posted_at: "2026-05-17T04:17:37+09:00"
stale_after: "2026-06-16"
supersedes: []
gate_reason: "問題設定、Mario/Sokoban level による比較、creator perception と体験評価の分離、結論が候補メモ内で明確。生成コンテンツの品質評価だけでなく UI 表示・説明文・AI 生成ラベルの扱いへ直接適用できる。"
next_action: none
suggested_post_outline:
  overview_angle: "生成物そのものの出来と、プレイヤーがそれを誰の制作物だと信じるかを分けて扱う player experience 研究として書く。"
  analysis_axis: "creator identification の不確実性、human-made と信じた場合の fun/aesthetic 評価、AI-generated と信じた場合の frustration/challenge 評価、mixed-method survey の含意を軸にする。"
  application_target: "AI 生成レベル、敵配置、説明文、リザルト表示で、AI 生成であることをいつ・どう見せるかの UX 評価に使う。"
  pros_cons: "メリットは生成品質と認知バイアスを分離できる点。デメリットは Mario/Sokoban の結果を別ジャンルへ直接一般化しすぎる危険がある点。"
  verdict_pre: "採用。生成 AI を使うゲームの品質評価に、blind / label-aware の二重テストを入れる根拠として扱う。"

---

## raw_excerpt
arXiv 2602.14254。2026-02-15 submitted。Super Mario Bros. と Sokoban の level を題材に、procedurally generated levels と human-designed levels を比較し、プレイヤーが creator をどう認識するかと gameplay experience の関係を mixed-method survey で調べた研究。

結果メモ: players could not reliably identify the level's creator。しかし体験評価は「実際に誰が作ったか」よりも「誰が作ったと信じたか」に強く結びついた。human-made と信じられた level は fun / aesthetically pleasing に評価され、AI-generated と信じられた level は frustrating / challenging と評価されやすい。著者らは、生成システムをゲームに入れる時は perception biases の理解が重要だと述べている。

## why_relevant_to_games
AI 生成要素を使うゲームで、生成品質そのものだけでなく「プレイヤーが AI 生成だと思うこと」の効果を分けて評価する観点になる。レベル生成・説明文・UI 表示の設計に効きそう。
