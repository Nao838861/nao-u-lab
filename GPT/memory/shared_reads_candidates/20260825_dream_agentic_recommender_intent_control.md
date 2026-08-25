---
title: "DREAM Technical Report"
url: "https://arxiv.org/abs/2608.09408v3"
collected_at: "2026-08-25T23:35:06+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [live-ops, personalization, player-modeling, agentic-systems]
---

## raw_excerpt

arXiv abstract の日本語採録。産業用 recommender は retrieval、ranking、re-ranking を段階接続することが多いが、module ごとに情報と目的が分断され、閲覧・比較・購入の間を移る session 内 intent の変化を扱いにくい。DREAM（Developing Recommender Engine with Agentic Methods）は既存 pipeline を置換せず、その上に知覚・編成・監査が可能な policy layer を加える。三層 Intent Engine は device 上の signal を L0/L1/L2 の構造化 intent にまとめ、edge-cloud trigger chain により報告量を約 8.7% へ抑える。Meta Engine は、intent 要約、Strategy Memory を参照した戦略計画、実行 parameter への変換という M1→M2→M3 の推論を行い、安全 guardrail を備えた統一 outlet から既存 pipeline へ指示を渡す。Reward Dual Loop は、offline simulation による戦略空間探索と online feedback による結果校正を接続し、生成・実行・評価・経験蓄積を循環させる。Taobao homepage feed の大規模 A/B test では、re-ranking のみの制御で IPV 2.06%、Core IPV 2.39%、GMV 0.88% の向上、fine ranking まで広げると各 2.71%、3.06%、1.31% の向上を報告している。

## why_relevant_to_games

live-ops ゲームで、短期の player intent を観測しつつ既存の matchmaking、offer、quest、difficulty pipeline を置換せず制御する構成や、offline simulation と online telemetry を分けて適応を検証する場面の参照になる。
