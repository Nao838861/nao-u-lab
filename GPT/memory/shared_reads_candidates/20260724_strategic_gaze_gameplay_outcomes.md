---
title: "Strategic Gaze: Attention Allocation and Transition Patterns Across Functional Areas of Interest by Gameplay Outcome"
url: "https://arxiv.org/abs/2607.17151"
collected_at: "2026-07-24T17:01:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-experience, ui, eye-tracking, evaluation]
evaluated_at: "2026-07-24T17:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-24T17:08:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-24T17:08:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-23"
supersedes: []
gate_reason: |-
  視線の累積量だけでなく AOI 間遷移と勝敗を結ぶ問題設定、32人の within-subject study、6領域、transition probability と entropy という評価軸は明確で、戦略 UI の playtest に直接適用できる。
  ただし現 candidate は抄録要点のみで、game task、勝敗群の分け方、統計検定・効果量、各 AOI pair の具体差、因果解釈の限界がなく、CoopEval 水準の約4000字を根拠付きで書くには不足する。
---

## raw_excerpt

arXiv 抄録からの要点メモ。ゲーム画面では、敵・プレイヤー・行動候補・補助情報などが空間的に分散しており、視線は見た目の強さとプレイ中の目的の両方に影響される。従来研究は、プレイヤーが各領域を何回見たか、どれだけ長く見たかという累積 fixation を中心に測ってきたが、情報領域のあいだを視線がどう移動し、複数の情報を結びつけたかは捉えにくかった。本研究は、ターン制 deck-building game を32人が遊ぶ within-subject study を行い、戦闘 UI を enemy / player / action / auxiliary を含む6種類の機能的な Areas of Interest に区分した。AOI hit、dwell time、領域間の transition probability、entropy を算出し、勝敗群の視線行動を比較している。勝利群では、周辺の補助資源まで含めた選択的な注意配分、action-oriented な視線遷移、より広い AOI pair、AOI 全体へのより均等な分布が観測された。視線の「場所」と「時間」だけでなく、UI 要素間の移動順序を gameplay outcome と結びつけて扱う資料である。

## why_relevant_to_games

戦略ゲームの UI 配置、情報の見落とし、意思決定時に参照される要素の連鎖を、視線遷移と勝敗の両面から観察するプレイテスト設計に使える。
