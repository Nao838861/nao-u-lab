---
title: "Confident at the moment of action: belief miscalibration in LLM play under hidden information"
url: "https://arxiv.org/abs/2608.24691v1"
collected_at: "2026-08-26T14:03:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, hidden-information, agent-evaluation, playtesting, calibration]
evaluated_at: "2026-08-26T14:07:08.2708205+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-26T14:15:49+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787721348368529"
next_action: none
posted:
  ts: "1787721348.368529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787721348368529"
  char_count: 4401
  posted_at: "2026-08-26T14:15:49+09:00"
stale_after: "2026-09-25"
supersedes: []
gate_reason: |-
  hidden state の確率申告と行動を分離し、終了後の ground truth、2 batch、62 capture、calibration deficit、4構成と deliberation budget の差まで評価内容と限界を抽出できる。
  AI playtester の勝敗・合法手・完走率に belief calibration を加える具体的な計測設計へ直結し、約4000字で手法・結果・適用条件を固有に説明できるため pass とする。
suggested_post_outline:
  overview_angle: "勝てる agent でも hidden state の信念は壊れ得ることを、行動時 confidence と事後 ground truth の分離で測る"
  analysis_axis: "outcome-only 指標が見逃す belief miscalibration、calibration deficit の集中、model と deliberation budget の交絡、sample size の限界"
  application_target: "Log_cdx の AI playtester で observation・belief distribution・action・後日確定する ground truth を別ログにし、勝敗や完走率と並列評価する probe"
  pros_cons: "内部状態の破綻を結果指標より早く検出できる一方、信念申告が可能な対象に限られ、申告自体が行動を変える可能性と小標本の不確実性がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文要旨の内容メモ。agent が自分で申告した confidence を行動 gate に使う場合、その confidence が行動時点の正しさを追跡していることが前提になる。本研究は、royal status を駒の間で秘密裏に繰り返し移せる hidden-information chess variant を用い、agent が各 turn で選ぶ move とは別に、相手の hidden royal piece がどこにあるかの確率分布を申告させる。game 終了後に復元できる ground truth と照合し、信念と行動を別々に評価する。

2つの独立 batch では、hidden piece の位置について 0.5 以上の confidence を申告した capture が正しかったのは 62 件中 1 件だった。calibration deficit の 99.3% と 98.7% はこの種の event に集中した。別 provider を含む4つの model configuration でも弱い形で同じ順序が観測されたが、多くの pairwise gap は sample size 上、統計的に区別できないと明記される。同一 model でも deliberation budget の変更だけで metric が大きく動く。また別 seat では、legality、cost、latency、completion rate の全てで優位な構成が最悪の belief quality を示した。誤較正した model でも game 自体には勝てるため、outcome-only evaluation ではこの問題を検出できない。

著者は Bhushan Kashinath Joshi。arXiv:2608.24691v1、2026-08-25 submitted。

## why_relevant_to_games

AI playtester や headless bot を勝敗・合法手・完走率だけで採点すると、hidden state の推定が壊れていても合格し得る。観測、信念申告、行動、後から得られる ground truth を分離して記録する評価設計の素材になる。
