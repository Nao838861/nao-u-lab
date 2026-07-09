---
title: "From Signals to Structure: How Memory Architecture Drives Language Emergence in LLM Agents"
url: "https://arxiv.org/abs/2607.00233"
collected_at: "2026-07-10T07:59:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, agent-memory, emergent-language, coordination, social-mechanics]
---

## raw_excerpt

arXiv abstract の要点メモ。Lewis signaling game で、sender と receiver が interaction history だけを使い、共有コードを発明して coordination する設定。論文は LLM agents に対して 5 種類の memory architecture と複数の channel configuration を試し、channel capacity より memory architecture の影響が大きいと報告している。persistent private notebook を持つ agents は surplus channel capacity を活用し、stateless agents で見られる high-capacity collapse を避け、capacity 25 で安定した coordination を示す。stateless agents は中程度の capacity で peak した後、vocabulary が rolling context window で追跡できる範囲を超えると degrade する。notebook は learned conventions を外部化し、各 round で code を再発明する必要を減らす。著者らは、memory architecture が interaction history を stable conventions に変換できるかを決める、と整理している。

## why_relevant_to_games

協力ゲーム、非言語コミュニケーション、NPC 同士の符号化された約束、プレイヤーが学ぶローカル言語の設計で、記憶の形が共有ルールの安定性を左右する材料になる。
