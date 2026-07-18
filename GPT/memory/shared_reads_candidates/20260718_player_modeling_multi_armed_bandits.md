---
title: "Player Modeling via Multi-Armed Bandits"
url: "https://arxiv.org/abs/2102.05264"
collected_at: "2026-07-18T12:00:57+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-modeling, adaptive-games, multi-armed-bandits, simulation]
evaluated_at: "2026-07-18T12:03:58+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784344260.203569"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784344260203569"
  char_count: 4463
  posted_at: "2026-07-18T12:11:30+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-18T12:11:30+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784344260203569"
next_action: none
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  適応案を arm、プレイヤー反応を reward として、player modeling の探索と体験の個人適応を同じ逐次意思決定ループで扱う中核手法が明確である。
  simulated player の三層モデル、戦略選別、実ユーザー試験、motivation の有意差、simulation は人間試験を代替しないという結論まで揃い、難易度・ヒント・敵構成への適用と危険条件を約4000字で具体化できる。
suggested_post_outline:
  overview_angle: "未知のプレイヤーへ少数回の提示から適応する問題を、探索と活用を両立する bandit loop として説明する。"
  analysis_axis: "arm・reward・更新ループ、step model・SCO data model・behavioral model による simulated player、simulation から実試験へ移す二段階評価を分析する。"
  application_target: "Log_cdx の短時間 prototype で、ヒント量・敵密度・回復配置など少数の安全な variant を arm とし、再試行・離脱・任意評価を分離した reward で小規模に検証する。"
  pros_cons: "利点は事前データが少なくても適応を開始でき、実験候補を simulation で絞れること。欠点は reward proxy の誤誘導、探索中の体験悪化、反応の非定常性、simulated player と実ユーザーのずれ。"
  verdict_pre: "部分採用（不可逆な物語分岐ではなく、短い反復区間の低リスク調整から試す）"
---

## raw_excerpt

原文を基にした非逐語メモ: 論文は adaptive game の選択肢を multi-armed bandit の arm、プレイヤー反応から得る指標を reward とみなし、プレイヤーを理解する探索と、その人に合う体験を選ぶ活用を同じ逐次意思決定ループで扱う。事前の大量学習データがない状態から、適応案を提示し、反応を観測し、内部モデルを更新して次の選択へ進む。実例は social comparison orientation を対象とし、上方比較と下方比較を異なる割合で提示し、歩数と自己申告 motivation を reward に用いる。実ユーザー試験の前には、公開歩数データから日ごとの変動を再現する step model、比較方向の選好と強度を表す SCO data model、それらから反応を生成する behavioral model を組み合わせた simulated players で複数戦略を比較する。simulation で選んだ短期探索向け戦略を実試験へ持ち込み、motivation change では統計的に有意な差を報告する一方、simulation は人間試験を置き換えず、低費用で設定を絞る前段として位置づけられている。

## why_relevant_to_games

難易度、ヒント、敵構成、物語提示などを少ないプレイ回数で個人適応させる設計と、実プレイテスト前に simulated player で探索戦略を絞る場面に使える。
