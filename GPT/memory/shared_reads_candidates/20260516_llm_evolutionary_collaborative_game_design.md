---
title: "ChatGPT and Other Large Language Models as Evolutionary Engines for Online Interactive Collaborative Game Design"
url: https://arxiv.org/abs/2303.02155
collected_at: 2026-05-16T11:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mixed-initiative, co-creation, evolutionary-search, llm]
source_note: "新規検索: site:arxiv.org/abs game development large language model playtesting 2026; related older paper surfaced and arXiv page checked 2026-05-16"
---

## raw_excerpt

arXiv abstract short quotes:

> "a collaborative game design framework that combines interactive evolution and large language models"

> "users collaborate on the design process by providing feedback"

採取メモ: Lanzi / Loiacono による 2023 年の paper。LLM を単発のアイデア生成器として扱うのではなく、interactive genetic algorithm と組み合わせ、ユーザーのフィードバックで候補案を選択し、LLM が recombination / variation を担当する共同設計フレームワークとして提示している。開始点は brief と複数の candidate designs。そこから human designer が選好を返し、システムが promising designs を選び、交叉・突然変異に近い形で新案を出す。3 つの game design task で remote human designers と評価したとされる。

## why_relevant_to_games

候補案を大量に出すだけでなく、ユーザーの「選ぶ/捨てる/混ぜる」を設計ループへ入れる発想が、Nao_u_BOT の brainstorm -> playable diff -> review 循環に近い。Phase 2 以降で候補生成と選別の役割分担を考える材料になる。
