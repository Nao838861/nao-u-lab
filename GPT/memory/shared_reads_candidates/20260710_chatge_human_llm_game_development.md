---
title: "Game Development as Human-LLM Interaction"
url: "https://aclanthology.org/2025.acl-long.218/"
collected_at: "2026-07-10T11:59:23+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm-tools, interaction-design, code-generation, workflow]
---

## raw_excerpt
ACL Anthology 2025.acl-long.218。著者は Jiale Hong, Hongqiu Wu, Hai Zhao。ACL 2025 long paper。要旨では、ゲーム開発は complex game engine と complex programming languages に依存する専門的作業であり、多くの game enthusiast が扱いにくいと置く。提案は LLM powered Chat Game Engine、略称 ChatGE。自然言語による Human-LLM interaction で custom game development を可能にすることを狙う。ChatGE として機能させるため、各 turn で三つの処理を行わせる設計になっている。P_script は user input に基づいて game script segment を設定する。P_code はその script segment に対応する code snippet を生成する。P_utter は guidance と feedback を含む user interaction を担当する。少数の manually crafted seed data から、LLM を使って game script-code pairs と interaction を生成する data synthesis pipeline も提案されている。さらに curriculum learning に従う three-stage training strategy で dialogue-based LLM を ChatGE へ移す。case study は poker games の ChatGE で、interaction quality と code correctness の二面から評価する。

## why_relevant_to_games
自然言語から直接コードを出すだけでなく、script / code / utterance を turn ごとに分ける制作 UI として、Nao_u_BOT の小型ゲーム制作ワークフロー分解に使える。
