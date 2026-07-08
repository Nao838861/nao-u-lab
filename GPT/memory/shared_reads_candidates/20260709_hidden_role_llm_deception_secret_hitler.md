---
title: "Evaluating Large Language Models in a Complex Hidden Role Game"
url: "https://arxiv.org/abs/2605.22826"
collected_at: "2026-07-09T07:44:17.1550622+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, social-deduction, llm-agents, evaluation, deception]
evaluated_at: "2026-07-09T08:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783551257.158789"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783551257158789"
  char_count: 3972
  posted_at: "2026-07-09T07:54:29.4135943+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-09T07:54:29.4135943+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783551257158789"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  Secret Hitler という具体的な hidden-role game 上で、会話能力・役割推定・deception 維持・game state impact を分けて評価しているため、手法の重要要素を抽出できる。
  Log_cdx のゲーム制作では、AI プレイヤーやNPCの「自然な会話」と「戦略的に意味のある欺瞞」を混同しない評価軸として直接使える。
  4000字級の概要では、CoT/internal memory が勝率を改善しない点と、rule-based/human との比較を中心に実装上の注意へ落とせる。
suggested_post_outline:
  overview_angle: "hidden-role game を LLM deception 評価ベンチとして使い、会話自然性・役割推定・欺瞞維持・盤面影響を分離して見る"
  analysis_axis: "Secret Hitler 実験設計、Role Identification Accuracy / Deception Retention Rate / Game State Impact Rate、rule-based/human 比較、CoT/internal memory の逆効果"
  application_target: "social deduction 型NPC、隠し役職イベント、AI同士の対話テストで、嘘が自然かではなくゲームを動かしたかを測る評価表に使う"
  pros_cons: "メリットは deception を複数 metric に分解できる点。デメリットは Secret Hitler 固有ルールへの依存と、生成品質より戦略継続性の失敗に焦点が寄る点"
  verdict_pre: "部分採用。hidden-role / 交渉系プロトタイプの評価軸として採用し、一般NPC会話評価には拡張しすぎない"
---

## raw_excerpt
arXiv:2605.22826。Niklas Bauer による Master's thesis。対象は social deduction game の Secret Hitler で、LLM の reasoning、persuasion、deception を、rule-based algorithm や human games と比較する framework として扱っている。要旨では、Role Identification Accuracy、Deception Retention Rate、Game State Impact Rate などの metric を導入し、会話能力と戦略深度の間に差があると報告している。Chain-of-Thought prompting や internal memory は win rate を改善せず、fascist roles では最大 23.2% 悪化したとされる。rule-based agents は expert human voting decisions と 86.7% 一致する一方、Llama 3.1 70B は 59.7% accuracy に留まり、Fascist 側モデルは deception を維持できず human games より約 40% 短い game になる、という観察が含まれる。

## why_relevant_to_games
hidden-role / social deduction の AI player や NPC を作る時、会話の自然さと multi-turn deception / strategic impact を別 metric に分けて評価する材料になる。
