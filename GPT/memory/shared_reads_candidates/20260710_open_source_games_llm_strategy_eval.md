---
title: "Evaluating LLMs in Open-Source Games"
url: "https://arxiv.org/abs/2512.00371"
collected_at: "2026-07-10T11:59:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, game-theory, strategy, agent-evaluation, mechanics]
---

## raw_excerpt
arXiv:2512.00371。2025-11-29 submitted、NeurIPS 2025。著者は Swadesh Sistla, Max Kleiman-Weiner。要旨では、LLM の programming capability により、LLM が open-source games に参加できるようになったと置く。ここでの open-source games は、player が action の代わりに computer program を提出する game-theoretic setting。提出プログラムは interpretability、inter-agent transparency、formal verifiability を持ち、通常形ゲームでは扱いにくい program equilibria を可能にする。論文は open-weight / closed-weight LLM が program strategies を予測・分類できるか、dyadic と evolutionary settings で LLM agents が到達する approximate program equilibria の特徴を評価できるかを調べる。観察対象には payoff-maximizing、cooperative、deceptive strategies の emergence、repeated open-source games における mechanism adaptation、comparative evolutionary fitness が含まれる。結論として、open-source games は multi-agent dilemmas で cooperative strategy の emergence を研究・誘導する viable environment だとされる。

## why_relevant_to_games
NPC や対戦 AI を「行動」だけでなく可読な program / rule として提出・観測する設計は、協力・裏切り・適応がある小型戦略ゲームの評価素材になる。
