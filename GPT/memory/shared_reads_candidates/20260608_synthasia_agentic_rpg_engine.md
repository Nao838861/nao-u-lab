---
title: "\"Agentic Gaming\" - LLMs as a semantic reasoning layer inside an RPG engine"
url: "https://www.reddit.com/r/aigamedev/comments/1rdmmfa/agentic_gaming_a_deep_dive_into_how_im_using_llms/"
collected_at: "2026-06-08T02:14:51+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, rpg, llm-integration, systems-design, indie-dev]
---

## raw_excerpt
Reddit r/aigamedev の 2026-02-24 投稿。個人開発者が Synthasia という RPG / text adventure / world editor 的な engine で、LLM を「semantic reasoning layer」として使う設計を説明している。ローカル LLM や OpenAI-compatible API を差し替え可能にし、World Editor と Game を分ける。engine 自体は genre logic を hardcode せず、creator が attribute や skill を自然言語で定義し、その意味解釈や状況への関与判定を LLM に任せる。

具体例として、Salt Sensibility のような任意 attribute を定義すると、engine は XP、leveling、threshold を機械的に扱い、場面内でその attribute が効くかを LLM が判断する。成功確率や難度は stat と context から評価し、dice roll 後の結果 narration を別の LLM task に渡す。action generation prompt には persona alignment、environmental creativity、multi-solution philosophy、stat-based option generation、difficulty calibration などを含めるという。さらに 80 以上の LLM tasks を Director / Weaver / Clerk のような model profile に割り当てる構成も記録されている。

## why_relevant_to_games
LLM を全行動決定者にせず、数値ルール・dice・schema は engine 側に残し、意味解釈と選択肢生成だけを LLM に渡す構成例として読める。
