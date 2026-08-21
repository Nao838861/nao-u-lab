---
title: '"Pharos Night: Crown Pursuit": An AI-Native Deck-Building and Tactical Arena Game Design Based on Multi-Agent Systems'
url: https://arxiv.org/abs/2608.12216
collected_at: "2026-08-22T00:33:06+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, deckbuilding, tactical-game, generative-ai, multi-agent, player-control]
---

## raw_excerpt

原文 abstract の要点を日本語で保持する。Pharos Night: Crown Pursuit は、生成 AI が外見や会話だけでなくゲーム規則の駆動にも関わる「AI-native game」の例として作られた、デッキ構築と tactical arena を組み合わせる multi-agent system である。LLM は素材とカードの生成、NPC の意思決定、自然言語による相互作用を担う。プレイヤーは素材を集め、欲しいカード効果を自然言語で記述し、arena の NPC と交渉するか戦うかを選ぶ。ただし生成結果をそのまま任意のルールへせず、応答を structured JSON として解析し、効果を事前定義済み mechanics から構成し、定性的な効果段階を designer 指定の数値へ写像する。13人の小規模 playtest では、戦略上意味のある魅力的な AI-driven play の可能性が示された一方、予測可能性、透明性、player control が課題として観察された。CHI Play 2026 採択論文であり、自由記述から生じる効果を有限の実行可能な部品へ落とす具体例を含む。

## why_relevant_to_games

自然言語でカードや能力を作らせつつ、JSON・定義済み mechanics・数値写像でゲームとして実行可能な範囲へ閉じる設計例として、生成 AI を core loop に入れる際に参照できる。
