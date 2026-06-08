---
title: "Engagement-Oriented Dynamic Difficulty Adjustment"
url: "https://www.mdpi.com/2076-3417/15/10/5610"
collected_at: "2026-06-09T01:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, dynamic-difficulty, player-engagement, churn, game-ai]
evaluated_at: "2026-06-09T01:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780935964.958299"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780935964958299"
  char_count: 4463
  posted_at: "2026-06-09T01:26:16+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-09T01:26:16+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780935964958299"
next_action: none
stale_after: "2026-07-09"
supersedes: []
gate_reason: |
  問題設定が「難易度とスキルの均衡」から「離脱傾向を直接扱う DDA」へ明確にずれており、churn trend、monitoring phase、調整対象パラメータ集合という手法の中核が候補本文から抽出できる。
  gameplay time、難易度、Game Engagement Questionnaire を含む評価観点と、7 ジャンル統合 prototype という評価の枠もあり、4000 字級の概要に必要な構造を作れる。
  小規模ゲーム制作では「同じ challenge に滞在し続ける時間」を離脱兆候として扱い、enemy 数・速度・HP などの介入パラメータに接続できるため、適用先が具体的。
suggested_post_outline:
  overview_angle: "従来 DDA の skill/challenge 均衡だけでは離脱を捉えきれない、という問題設定から EDDA が churn trend を監視し介入する仕組みを説明する。"
  analysis_axis: "monitoring phase と intervention phase、gameplay time ベースの churn parameter、player / partner / opponent / system level の調整対象、7 ジャンル prototype の評価観点を軸に読む。"
  application_target: "Nao_u_BOT のプロトタイプ評価で、死亡回数や勝敗だけでなく challenge 滞在時間を離脱兆候として記録し、敵数・攻撃力・HP・速度などの調整候補へ接続する。"
  pros_cons: "利点は離脱兆候を設計指標に変えられること。弱点は滞在時間を engagement と boredom のどちらとして解釈するかに追加検証が必要なこと。"
  verdict_pre: "部分採用。DDA 全体を導入するより、monitoring/intervention 分離と churn parameter の設計だけを小さく取り込む。"
---

## raw_excerpt
MDPI Applied Sciences 2025, 15(10), 5610。2025-05-17 published。著者は Qingwei Mi and Tianhan Gao。論文タイトルは "Engagement-Oriented Dynamic Difficulty Adjustment"。

短い原文断片:
- "Traditional DDA methods focus little on player churn"
- "EDDA directly considers players’ churn trend"
- "prototype system integrating seven major game genres"

要旨メモ: 従来の DDA が難易度とスキルの均衡を狙う一方で、プレイヤー離脱傾向を直接扱いきれていない、という問題設定から EDDA を提案している。EDDA は challenge 中の gameplay time を用いた real-time monitoring と、player / partner / opponent / system level の調整可能パラメータ集合を持つ。7 つの主要ゲームジャンルを統合した prototype system で、難易度、プレイ時間、Game Engagement Questionnaire のスコアを多面的に確認したと説明されている。表では churn parameter として sleep phase、active phase、unit phase、threshold phase、sleep time、active time、unit time、threshold time などを定義し、調整対象として opponent の number / attack / defense / health point / speed なども列挙している。

## why_relevant_to_games
小規模プロトタイプでも、死亡回数やスコアだけでなく「同じ challenge に滞在し続ける時間」を離脱兆候として扱う設計材料になる。特に shooter / action の調整を enemy 数や速度だけに寄せず、monitoring phase と intervention phase に分ける候補として使える。
