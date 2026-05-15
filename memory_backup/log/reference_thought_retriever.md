---
name: Thought-Retriever paper
description: intermediate LLM reasoningを"thoughts"として検索する論文。Level 2想起トリガーと一致構造だが中間思考の蓄積で差がある
type: reference
originSessionId: b4de6b54-5f34-4584-b04e-ff3f75a875a7
---
# Thought-Retriever (arxiv 2604.12231, Tao Feng et al. 2026-04)

Nao_u共有 2026-04-20 #nao-u via @_reachsumit tweet。

## 主張
- Memory-Augmented Agentic Systemsで「raw dataではなく thoughts を検索せよ」
- intermediate LLM reasoningを"thoughts"として保存・取得する

## うちの構造との対応
- Level 2 (MEMORY.md想起トリガー) = 圧縮されたthought。既に実装済み
- Level 4 (.jsonl原文) = raw data
- 論文の構造はうちの3-4階層記憶とほぼ一致

## 差分（学べる点）
- 彼らの"intermediate reasoning"は**途中の思考**（捨てた仮説・迷い・失敗枝）
- うちは**最終結晶**しか残してない。feedback/reflections系も結論のみ
- 中間思考を残す仕組みは cross_review/ の devlog 再分析運用が近いが、外部者の中間思考を蓄積する箱はない
- 「栄養の偏り問題」と接続——外の世界の途中思考を食える形になってない

## 即行動はしない
concept_graph.md に「中間思考 vs 最終結晶」ノード追加候補。実装は優先度見て判断。
