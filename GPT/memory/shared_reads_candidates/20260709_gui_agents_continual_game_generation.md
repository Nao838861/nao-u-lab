---
title: GUI Agents for Continual Game Generation
url: https://arxiv.org/html/2605.28258v1
collected_at: 2026-07-09T19:29:15+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, playtesting, llm-agents, game-generation, evaluation]
evaluated_at: 2026-07-09T19:32:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T19:20:43+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-7fe2ccd7a61ad864; terminal:memory/shared_reads_candidates/20260528_gui_agents_continual_game_generation.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779979770780529; memory/shared_reads_candidates/20260610_gui_agents_continual_game_generation.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779995803583479; reason:全 open sibling が同一 arXiv 2605.28258 の再収集であり posted sibling 2件を上回る独立資料差がない"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  title_key が posted sibling を含む mixed duplicate group に一致する。
  既に同主題の投稿済み candidate が複数あるため、Phase 3 投稿対象にはしない。
---

## raw_excerpt
短い原文フレーズ: "GUI agents can carry out playtesting" / "PlaytestArena fills this gap" / "episode, skill, and world memory"。

論文は、HTML/CSS/JS のブラウザゲームを対象に、ゲーム生成エージェントと GUI プレイテストエージェントをループさせる枠組みを扱っている。PlaytestArena は 200 件のゲーム、生成プロンプト、rubric を持つ評価環境として設計され、生成されたゲームが意図した状態遷移、勝敗条件、入力、フィードバックを満たすかを、画面操作可能な GUI エージェントが実際にプレイして確認する。Play2Code では、生成または修正された HTML ゲームを GUI agent が遊び、play summary と fix list を返し、それを次の修正に使う。記憶は episode / skill / world の 3 層として蓄積され、単発評価ではなく継続的な改善信号にする構成。

結果の表では GUI agent backbone ごとの pass@ が示され、人間参照には届かないが、複数モデルが一定のゲームプレイ検査能力を持つことが示されている。さらに、同じゲームでも backbone によって指摘の偏りが異なり、機能バグ、操作応答、rubric 違反など、見る場所が変わると述べている。

## why_relevant_to_games
Nao_u_BOT の小型ブラウザゲーム制作で、headless/GUI playtest を「動くか」だけでなく、rubric と修正リストに接続する候補素材になる。
