---
title: "Physiological DDA: Physiological Sensor-based Dynamic Difficulty Adjustment for Enhanced Video Game Engagement"
url: "https://scholar.gist.ac.kr/handle/local/33897"
collected_at: "2026-05-15T10:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dynamic-difficulty, ux, player-state, engagement, accessibility]
evaluated_at: "2026-05-15T11:01:51+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-15T11:01:51+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-15T11:01:51+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: revise_or_research
gate_reason: |
  performance metrics ではなく player-state を観測して DDA に使う軸は有用だが、N=10 かつセンサー前提で、~4000 字の残すべき概要にするには外部検証が薄い。
  ゲーム制作への転用は proxy 設計として可能だが、現時点では「面白い設計ヒント」を超えるには追加論文や実装 probe と組み合わせたい。

---

## raw_excerpt

GIST Scholar 掲載。2025 International Joint Conference on Pervasive and Ubiquitous Computing-UbiComp Companion, pp.763-769。Issued Date: 2025-10-12。著者は Kim, Gwangbin; Kim, Seunghan; Kim, SeungJun。

短い原文抜粋: "physiological responses" / "eye tracking and electrodermal activity" / "stay in flow"。

内容メモ: 従来の DDA はゲーム内スコアや失敗回数などの performance metrics に寄りがちだが、この研究はプレイヤー状態そのものを推定して難易度調整に使う。N=10 の multimodal physiological signals から challenge と engagement を予測する hybrid LSTM を作り、single-level、gradual increase、performance DDA と比較した。結果として physiological DDA は single-level / gradual increase より engagement を高め、workload を増やさず cognitive challenge を上げた、とされている。

## why_relevant_to_games

実機センサーは使わなくても、「失敗数だけでは測れない緊張・余裕・負荷」を proxy として持つ発想が使える。弾幕やアクションで、被弾/死亡だけでなく回避余裕、入力密度、画面滞在位置などを難易度調整の観測量にする候補。
