---
title: "Trust-ya: design of a multiplayer game for the study of small group processes"
url: "https://arxiv.org/abs/2109.04037"
collected_at: "2026-07-16T11:05:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, multiplayer, social-dynamics, game-theory, simulation]
evaluated_at: "2026-07-16T11:15:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784165694.565729"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784165694565729"
  char_count: 3976
  posted_at: "2026-07-16T10:34:54.565729+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-16T10:34:54.565729+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784165694565729"
next_action: none
stale_after: "2026-08-15"
supersedes: []
gate_reason: >-
  地位形成を投資集中・配当判断・実利のない status symbol という操作可能なルールへ変換しており、問題設定から設計原理まで具体的に追える。
  評価は単純な simulated agents と設計チームのプレイ例に限られるが、その限界も含めてゲーム試作への適用と約4000字の批判的な概要を構成できる。
suggested_post_outline:
  overview_angle: "小集団の地位・追随・不平等を、説明文ではなく投資と還元の反復ループから発生させるゲーム設計"
  analysis_axis: "社会心理学上の status 概念を各ルールへ対応づける設計と、simulated agents・人間プレイ例による観察の妥当性と限界"
  application_target: "Log_cdx の multiplayer prototype で、役職を固定せず資源委任・還元履歴・装飾的記号から leader-follower 関係が立ち上がるかを計測する設計 probe"
  pros_cons: "利点は抽象的な社会関係を少数の可視な選択へ圧縮できること。欠点は小規模な例示評価で一般化が弱く、人工 agent による集団誘導には倫理上の注意が要ること"
  verdict_pre: "部分採用"
---

## raw_excerpt

Huang らは、小集団内の status、leader-follower 行動、durable inequality を観察するための協力・競争型 multiplayer game「Trust-ya」を設計している。3 人以上のプレイヤーは中央の coin pool から自分の stash を増やすが、全体として多くを引き出すには協力も必要になる。各手番では自分で少量を取るか、別プレイヤーへ coin を渡して投資できる。投資を多く受けたプレイヤーほど大きな gamble に参加でき、得た payoff を投資者へ分配するか自分で保持する。このため、投資が leader に集中する一方、leader は支持を保つための還元と自己利益の保持を両立させる必要がある。さらに、直接的なゲーム価値を持たない emoji を購入可能な status symbol とし、匿名環境での cheap-talk 的な合図として使う。論文は社会心理学上の status 概念と各ルールの対応を示し、単純な simulated agents と設計チームによる人間プレイの例から、期待される地位行動が現れることを報告している。将来的には、協力均衡に至らない集団へ artificial agent を加えて行動を変える可能性にも触れるが、その効果と倫理には追加研究が必要としている。短い原文メモ: "status symbols"、"leader-follower behaviours"、"simulated agents"。

## why_relevant_to_games

社会的地位を説明文や数値だけで表すのではなく、投資集中・配当・無価値な記号という操作可能なルールへ落とし込み、簡単な bot と人間プレイで emergent social dynamics を観察する multiplayer prototype の設計例として使える。
