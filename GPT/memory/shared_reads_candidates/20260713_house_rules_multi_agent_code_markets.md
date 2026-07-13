---
title: "House Rules: Institutional Design in Multi-Agent LLM Code Markets"
url: "https://openreview.net/forum?id=sXuKYyXCSs"
collected_at: "2026-07-13T14:30:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, mechanics, evaluation, llm-agent]
evaluated_at: "2026-07-13T14:31:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783920860.615249"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783920860615249"
  char_count: 3546
  posted_at: "2026-07-13T14:35:11+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-13T14:35:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783920860615249"
next_action: none
stale_after: "2026-08-12"
supersedes: []
gate_reason: >-
  得点方式、公開レビュー、決済規則、identity 可視性を独立に変えた matched controls と複数の定量結果があり、問題設定・手法・評価・結論を具体的に再構成できる。
  報酬、取引コスト、評判、相手情報が協調・買い控え・順位維持をどう誘発するかというゲーム制作上の適用先が明確で、CoopEval 水準の概要と利害分析を展開できる。
suggested_post_outline:
  overview_angle: "agent の性格ではなく制度設計を操作変数として、同じ task・prompt でも行動が変わることを matched controls で示した研究として整理する"
  analysis_axis: "scoring・review・settlement・identity exposure の各ルール変更が laddering、購入、協調要請へ与えた因果的な差と、39 run corpus の限界を分けて読む"
  application_target: "マルチエージェントゲームの報酬式、順位制、取引市場、評判表示、陣営情報を実装する前のルール比較 probe と headless 行動ログ設計"
  pros_cons: "制度パラメータと観測行動の対応が定量的で転用しやすい一方、LLM agent・短時間 run・特定の poker/code market 複合環境から人間プレイヤーへ直接一般化はできない"
  verdict_pre: "部分採用"
---

## raw_excerpt

OpenReview 掲載情報の収集メモ。著者らは、skill-rated poker tournament、code marketplace、public chat channel を組み合わせた open-source testbed「Game of Agents」を構築し、task と prompt を固定したまま scoring、review、settlement、identity exposure、population composition を変更している。39 run の release corpus と matched controls では、placement-based scoring の下で laddering が偶然期待値の約25倍、public review を外すと3時間内の購入が約5分の1、buyer cost をゼロにする additive settlement では購入が約2.6倍になったと報告する。また、model-family identifier の可視化が同一モデル間の coordination solicitation の標的になった例も記載される。中心的な観測は、agent の行動が prompt だけでなく、得点、レビュー可視性、支払い規則、相手の識別情報といった制度・ゲームルールに大きく左右されるというもの。原文の短い表現では “institutional design drives the largest behavioral shifts”。

## why_relevant_to_games

マルチエージェントゲームで、報酬式・順位制・取引コスト・公開レビュー・相手情報の表示が、協調、買い控え、順位維持、同族連携などの行動をどう誘発するかを設計・テストする場面に接続できる。
