---
title: "Change is Hard: Consistent Player Behavior Across Games with Conflicting Incentives"
url: "https://arxiv.org/abs/2603.16136"
collected_at: "2026-06-16T22:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-modeling, game-analytics, behavior-change, chi2026]
evaluated_at: "2026-06-16T22:51:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T22:59:26+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781618338308199"
next_action: none
posted:
  ts: "1781618338.308199"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781618338308199"
  char_count: 3699
  posted_at: "2026-06-16T22:58:58+09:00"
stale_after: "2026-07-16"
supersedes: []
gate_reason: |-
  同一プレイヤーを LoL と TFT で比較する設計により、ゲーム側インセンティブと個人傾向の切り分けが明確。
  サンプル数、対比構造、結論が揃っており、プレイヤー誘導・ビルド設計・難易度調整への適用も具体化しやすい。
suggested_post_outline:
  overview_angle: "異なる報酬構造を持つゲームでも、プレイヤーの行動傾向はどこまで変わるのかを軸に書く。"
  analysis_axis: "ゲーム構造による誘導と個人の一貫したプレイ傾向のどちらが行動を説明するか。"
  application_target: "プレイスタイル誘導、ビルド選択、難易度調整、agent 評価で「設計した最適行動に寄せられるはず」という前提を点検する。"
  pros_cons: "実プレイヤー横断データの説得力がある一方、LoL/TFT 依存の文脈を一般化しすぎない注意が必要。"
  verdict_pre: "部分採用。行動変容を前提にした設計の検査軸として使う。"
---

## raw_excerpt
出典上の短い表現: "Consistent Player Behavior Across Games with Conflicting Incentives"。

この論文は、League of Legends と Teamfight Tactics の両方を十分に遊んだ 4,830 人を対象に、同一プレイヤーが異なる構造的インセンティブを持つゲーム間でどの程度行動を変えるかを調べる。League は勝利のために専門化が有利になりやすく、TFT は柔軟な選択が有利になりやすいという対比を使い、ゲーム側の構造と個人の傾向のどちらが行動を強く説明するかを見る。検索結果上の説明では、プレイヤーはゲームごとの報酬構造が違っても行動傾向をかなり保ち、成功への動機が強いプレイヤーほど適応も見られる、とされている。

## why_relevant_to_games
プレイヤーが設計上の誘導どおりに行動を変えるとは限らない、という観点を難易度調整・ビルド誘導・プレイスタイル評価に持ち込める。
