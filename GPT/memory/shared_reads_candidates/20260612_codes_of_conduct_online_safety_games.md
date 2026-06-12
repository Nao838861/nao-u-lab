---
title: "Analyzing Codes of Conduct for Online Safety in Video Games at Scale"
url: "https://arxiv.org/abs/2605.15047"
collected_at: "2026-06-12T08:57:03+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, online-safety, community, multiplayer, governance]
evaluated_at: "2026-06-12T10:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781224674.498789"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781224674498789"
  char_count: 4114
  posted_at: "2026-06-12T09:37:53+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T09:37:53+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781224674498789"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: "オンラインゲームの害を mechanics / community context と接続して扱い、CONDUCTIFY で Steam multiplayer 9,586 件から CoC 検出・分析する問題設定と手法が明確。350 件のみ CoC が見つかったという結果も投稿の核になる。マルチプレイや共有空間の設計で、運用文書を game design の一部として扱う適用性がある。"
suggested_post_outline:
  overview_angle: "Code of Conduct を法務文書ではなく、オンラインゲームの mechanics と community context に結びつく安全設計データとして読む。"
  analysis_axis: "CONDUCTIFY pipeline、Steam 大規模サンプル、CoC 有無の分布、人気作・adult-oriented・community-driven title との関係、設計上の含意を軸にする。"
  application_target: "共有空間、非同期交流、ランキング、ユーザー生成要素を持つ小型ゲームで、ルール文面・通報導線・禁止行為定義を後付けにしないための checklist に効く。"
  pros_cons: "利点は scale と実運用文書から設計論へ戻せる点。弱点は CoC の有無分析がプレイヤー行動改善の因果までは示しにくい点。"
  verdict_pre: "部分採用。multiplayer だけでなく、共同制作・共有スコア・UGC を持つ prototype の事前安全設計に使う。"
---

## raw_excerpt

著作権配慮のため、arXiv abstract の長文引用ではなく要点メモとして保存する。Jiuming Jiang ほかによる 2026-05-14 submitted の論文。オンラインゲームを、プレイヤーが相互作用し、競争し、共同で創作する社会的空間として捉え、harassment、discrimination、不適切コンテンツ、privacy breach、cheating などの害が game design、mechanics、community context によって形を変えると置く。論文は CONDUCTIFY という pipeline を使い、Steam の multiplayer titles 9,586 件から Codes of Conduct を検出・分析する。利用可能な CoC が見つかったのは 350 件で、人気作、adult-oriented、community-driven なゲームほど CoC がある傾向。一方、多くの multiplayer games は regulatory / industry recommendation があるにもかかわらず CoC なしで運用されていると報告する。

短い原文断片: "The shape and severity of such harms vary across game design" / "CONDUCTIFY"

## why_relevant_to_games

マルチプレイや共有空間を持つゲームを作る時、ルールや通報文面を後付けの運用文書ではなく、mechanics と community context に接続した設計材料として扱う入口になる。
