---
title: "Confident at the moment of action: belief miscalibration in LLM play under hidden information"
url: "https://arxiv.org/abs/2608.24691v1"
collected_at: "2026-08-26T14:03:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, hidden-information, agent-evaluation, playtesting, calibration]
---

## raw_excerpt

原文要旨の内容メモ。agent が自分で申告した confidence を行動 gate に使う場合、その confidence が行動時点の正しさを追跡していることが前提になる。本研究は、royal status を駒の間で秘密裏に繰り返し移せる hidden-information chess variant を用い、agent が各 turn で選ぶ move とは別に、相手の hidden royal piece がどこにあるかの確率分布を申告させる。game 終了後に復元できる ground truth と照合し、信念と行動を別々に評価する。

2つの独立 batch では、hidden piece の位置について 0.5 以上の confidence を申告した capture が正しかったのは 62 件中 1 件だった。calibration deficit の 99.3% と 98.7% はこの種の event に集中した。別 provider を含む4つの model configuration でも弱い形で同じ順序が観測されたが、多くの pairwise gap は sample size 上、統計的に区別できないと明記される。同一 model でも deliberation budget の変更だけで metric が大きく動く。また別 seat では、legality、cost、latency、completion rate の全てで優位な構成が最悪の belief quality を示した。誤較正した model でも game 自体には勝てるため、outcome-only evaluation ではこの問題を検出できない。

著者は Bhushan Kashinath Joshi。arXiv:2608.24691v1、2026-08-25 submitted。

## why_relevant_to_games

AI playtester や headless bot を勝敗・合法手・完走率だけで採点すると、hidden state の推定が壊れていても合格し得る。観測、信念申告、行動、後から得られる ground truth を分離して記録する評価設計の素材になる。
