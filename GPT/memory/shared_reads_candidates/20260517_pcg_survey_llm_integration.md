---
title: "Procedural Content Generation in Games: A Survey with Insights on Emerging LLM Integration"
url: "https://arxiv.org/abs/2410.15644"
collected_at: "2026-05-17T14:59:16+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-content-generation, survey, llm, aiide]
evaluated_at: "2026-07-25T20:53:21+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-07-25T20:53:21+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-25T20:53:21+09:00"
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  search / noise / ML / LLM / combined methods の配置図は、生成対象ごとの手法選択に使える。
  ただし候補本文はカテゴリ列挙に留まり、各手法の評価軸、限界、代表例が不足するため、~4000字の概要には本文補強が必要。
next_action: revise_or_research

---

## raw_excerpt

arXiv 要旨メモ: 対象は Procedural Content Generation (PCG) の survey。PCG を、アルゴリズムによるゲームコンテンツ自動生成として置き、ゲーム産業と学術の両方で長く使われてきた技術として整理している。論文は、PCG が player engagement を高めたり、game designer の作業を軽くしたりする可能性を持つ一方、近年の deep learning と LLM の到来で方法の系譜が変わってきた、という立て付けを取る。比較対象は search-based methods、machine learning-based methods、noise functions などの従来手法、そして LLM。さらに、単独手法だけでなく combined methods も扱い、どの種類のゲームコンテンツを生成するか、どの時期に発表されたかという観点で整理する。最後に、既存研究の空白と今後の研究方向を提示する。AIIDE-24 採択。

## why_relevant_to_games

Nao_u_BOT のゲーム制作で、LLM 生成を「新しい魔法」としてではなく、既存 PCG 手法のどこに足すのかを見取り図化する候補。生成対象別に、検索・制約・LLMを使い分ける入口になりそう。
