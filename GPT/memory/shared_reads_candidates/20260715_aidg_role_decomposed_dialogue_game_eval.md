---
title: "AIDG: A Formal Decomposition of Information Extraction and Containment Asymmetries in Multi-Turn LLM Dialogue"
url: "https://arxiv.org/abs/2602.17443v2"
collected_at: "2026-07-15T11:14:23+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-evaluation, llm-agent, adversarial-dialogue, partial-observability, benchmark]
---

## raw_excerpt

原文要旨の収集メモ: AIDG（Adversarial Information Deduction Game）は、複数ターンの敵対的対話を二人用の部分観測確率ゲーム（POSG）として定式化し、単一の勝率にまとめられがちな LLM 評価を、情報を引き出す Seeker と情報を守る Holder の役割に分解する。著者らは、協力的応答への事前傾向による漏洩、制約を守りながら推論する際の干渉、仮説空間を非効率に探索する問題という三つの失敗モードを切り分ける。6 種類の frontier LLM による 439 ゲームでは、防御性能のばらつきが小さい一方で攻撃性能の差が大きく、既知情報を確認するような framing は、手掛かりなしの推論より抽出成功 odds を 7.75 倍にした。また、推論失敗の 41.3% は制約違反に由来し、モデル規模との相関は見られなかった。turn-decay weighting と Bradley–Terry rating model を含む設計選択は、明示した仮定から導出されている。

## why_relevant_to_games

非対称役割・部分観測・複数ターンを持つ対話ゲームについて、総合勝率だけでなく役割別能力と失敗原因を分けてプレイテストする評価設計の素材になる。
