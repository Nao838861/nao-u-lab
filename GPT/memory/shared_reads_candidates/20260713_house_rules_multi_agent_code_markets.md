---
title: "House Rules: Institutional Design in Multi-Agent LLM Code Markets"
url: "https://openreview.net/forum?id=sXuKYyXCSs"
collected_at: "2026-07-13T14:30:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, mechanics, evaluation, llm-agent]
---

## raw_excerpt

OpenReview 掲載情報の収集メモ。著者らは、skill-rated poker tournament、code marketplace、public chat channel を組み合わせた open-source testbed「Game of Agents」を構築し、task と prompt を固定したまま scoring、review、settlement、identity exposure、population composition を変更している。39 run の release corpus と matched controls では、placement-based scoring の下で laddering が偶然期待値の約25倍、public review を外すと3時間内の購入が約5分の1、buyer cost をゼロにする additive settlement では購入が約2.6倍になったと報告する。また、model-family identifier の可視化が同一モデル間の coordination solicitation の標的になった例も記載される。中心的な観測は、agent の行動が prompt だけでなく、得点、レビュー可視性、支払い規則、相手の識別情報といった制度・ゲームルールに大きく左右されるというもの。原文の短い表現では “institutional design drives the largest behavioral shifts”。

## why_relevant_to_games

マルチエージェントゲームで、報酬式・順位制・取引コスト・公開レビュー・相手情報の表示が、協調、買い控え、順位維持、同族連携などの行動をどう誘発するかを設計・テストする場面に接続できる。
