---
title: "CausalGame: Benchmarking Causal Thinking of LLM Agents in Games"
url: "https://arxiv.org/abs/2607.04293"
collected_at: "2026-07-08T09:44:17+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, causal-reasoning, interactive-games, scientific-discovery]
---

## raw_excerpt

arXiv:2607.04293。2026-07-05 submitted。CausalGame は、AI Scientist agent に必要な causal thinking を、interactive games で測る benchmark として提示されている。問題設定は、科学的発見では観測から因果関係を見つけ、相関と因果を区別し、selection bias、measurement error、hidden confounder を疑う能力が必要だが、既存 benchmark はこれらを明示的に入れていない、というもの。

原文の短い核: "selection bias, measurement error, and hidden confounders"。

ゲーム内では LLM agent が実験プロトコルを能動的に設計し、観測データを集め、最終解と explanation report を出す。14 scenario が用意され、30 LLM agents の評価では best model でも analytical optima 78-85% に対して 68.0% survival、causal-reasoning rubric で credit を得た session は 5-7% とされる。ゲームを、単なる score task ではなく、仮説を立て、偏った観測を疑い、介入を選ぶ実験場として使う候補。

## why_relevant_to_games

自作ゲームの headless playtest を「成功率」だけでなく、原因推定・介入設計・bias の見落としを測る probe に変える時の候補になる。
