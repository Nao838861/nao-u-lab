---
title: "MINDGAMES: A Live Arena for Evaluating Social and Strategic Reasoning in Multi-Agent LLMs"
url: "https://arxiv.org/abs/2605.29512"
collected_at: "2026-05-30T08:30:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, multi-agent, social-deduction, telemetry]
---

## raw_excerpt

原文要旨メモ。MINDGAMES は、LLM agent の社会的・戦略的推論を、静的な設問ではなく複数ゲームの live arena で測る評価環境。対象にする能力は、hidden information 下での belief attribution、反復相互作用での opponent modeling、知識非対称下の cooperative inference、social deduction での sustained deception。TextArena 上に統一 interface、TrueSkill-based rating、full trajectory logging を置き、Colonel Blotto、Iterated Prisoner's Dilemma、Codenames、Secret Mafia の 4 環境で 2025 competition cycle を実施した。944 agents / 76 teams / 29,571 multi-agent games の turn-level observations、actions、rewards を残し、MG-Ref という deterministic offline tournament protocol も提供する。分析では、rule adherence の脆さ、構造的 scaffolding 依存、environment ごとの leaderboard validity の差、Secret Mafia における error-survival confound が報告されている。

## why_relevant_to_games

ヘッドレス評価で「勝った/負けた」だけでなく、ターン単位の観測・行動・報酬・エラー要因を残す設計例として使える。対戦/協力/欺きが絡むゲームを作る時、評価ログが能力と環境バグを混同しないための材料になる。
