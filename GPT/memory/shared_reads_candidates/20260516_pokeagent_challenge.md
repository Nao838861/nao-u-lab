---
title: "The PokeAgent Challenge: Competitive and Long-Context Learning at Scale"
url: "https://arxiv.org/abs/2603.15563"
collected_at: "2026-05-16T15:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, benchmark, agent-evaluation, rpg, partial-observability, long-horizon-planning]
---

## raw_excerpt

原文短抜粋: "Partial observability, game-theoretic reasoning, and long-horizon planning remain open problems"

要旨メモ: PokeAgent Challenge は、Pokemon の対戦システムと RPG 環境を使った大規模 decision-making benchmark。Battling Track は部分観測下の競技的 Pokemon battles で strategic reasoning と generalization を測り、20M+ battle trajectories と heuristic / RL / LLM baselines を提供する。Speedrunning Track は Pokemon RPG の long-horizon planning と sequential decision-making を対象にし、harness-based LLM approaches を比較する open-source multi-agent orchestration system を含む。NeurIPS 2025 competition では 100+ teams が参加し、汎用 LLM、専門 RL、elite human performance の間に大きな差が残ることが示されている。

## why_relevant_to_games

自作ゲームを agent に遊ばせて評価する時、部分観測・長期計画・ハーネス設計を同時に測る benchmark 事例として使える。
