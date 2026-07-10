---
title: "When LLMs Play the Telephone Game: Cultural Attractors as Conceptual Tools to Evaluate LLMs in Multi-turn Settings"
url: "https://arxiv.org/abs/2407.04503"
collected_at: "2026-07-10T20:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, llm-agent, narrative, evaluation, communication]
---

## raw_excerpt
arXiv:2407.04503。2024-07-05 submitted、2026-01-29 v4。Jérémy Perez, Grgur Kovač, Corentin Léger, Cédric Colas, Gaia Molinaro, Maxime Derex, Pierre-Yves Oudeyer, Clément Moulin-Frier による、LLM 同士の反復的な情報伝達でテキストがどう変形するかを調べた研究。要旨では、個別 LLM の出力だけでなく、LLM から LLM へ情報が渡る時の collective behavior と information distortion が見落とされていると置く。実験は cultural evolution 研究の transmission chain design を借りた "telephone game experiments" で、LLM agent が前の agent から text を受け取り、生成し、次へ渡す。追跡対象は toxicity、positivity、difficulty、length など。小さな bias が単発出力では無視できても、反復 interaction で attractor states へ増幅される可能性があり、open-ended instructions では constrained tasks より attraction effects が強く出るとされる。コードと Data Explorer も公開され、ICLR 2025 採択済み。

## why_relevant_to_games
NPC 会話、噂、伝言、複数 agent の world log 圧縮で、内容がどの方向へ歪むかをゲームメカニクスや評価 probe として扱う候補になる。
