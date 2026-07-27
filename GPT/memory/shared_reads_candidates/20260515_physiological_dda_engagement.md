---
title: "Physiological DDA: Physiological Sensor-based Dynamic Difficulty Adjustment for Enhanced Video Game Engagement"
url: "https://scholar.gist.ac.kr/handle/local/33897"
collected_at: "2026-05-15T10:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dynamic-difficulty, ux, player-state, engagement, accessibility]
evaluated_at: "2026-07-28T03:21:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-28T03:21:03+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-28T03:21:03+09:00"
stale_after: "2026-08-27"
supersedes: []
next_action: keep_for_reference
gate_reason: |
  player-state を観測する DDA、hybrid LSTM、4 条件比較は抽出できるが、N=10 で効果量・予測精度・個人差が候補本文にない。
  入力密度などを proxy にする転用は研究結果から一段離れた推測であり、単独で残すべき 4000 字概要には証拠が薄いため fail とする。

---

## raw_excerpt

GIST Scholar 掲載。2025 International Joint Conference on Pervasive and Ubiquitous Computing-UbiComp Companion, pp.763-769。Issued Date: 2025-10-12。著者は Kim, Gwangbin; Kim, Seunghan; Kim, SeungJun。

短い原文抜粋: "physiological responses" / "eye tracking and electrodermal activity" / "stay in flow"。

内容メモ: 従来の DDA はゲーム内スコアや失敗回数などの performance metrics に寄りがちだが、この研究はプレイヤー状態そのものを推定して難易度調整に使う。N=10 の multimodal physiological signals から challenge と engagement を予測する hybrid LSTM を作り、single-level、gradual increase、performance DDA と比較した。結果として physiological DDA は single-level / gradual increase より engagement を高め、workload を増やさず cognitive challenge を上げた、とされている。

## why_relevant_to_games

実機センサーは使わなくても、「失敗数だけでは測れない緊張・余裕・負荷」を proxy として持つ発想が使える。弾幕やアクションで、被弾/死亡だけでなく回避余裕、入力密度、画面滞在位置などを難易度調整の観測量にする候補。
