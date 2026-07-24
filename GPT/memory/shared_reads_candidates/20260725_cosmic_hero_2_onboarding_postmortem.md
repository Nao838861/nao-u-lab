---
title: "Postmortem - the negatives... - Cosmic Hero 2 Prologue"
url: "https://pazur3d.itch.io/cosmic-hero-2-prologue/devlog/1375110/postmortem-the-negatives"
collected_at: "2026-07-25T03:49:14+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, puzzle, onboarding, difficulty-curve, level-design]
evaluated_at: "2026-07-25T03:50:43+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784919561.878169"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784919561878169"
  char_count: 3813
  posted_at: "2026-07-25T03:59:37+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-25T03:59:37+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784919561878169"
next_action: none
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  「説明を削る」「短ければ耐える」「発見させる」という三つの設計仮説を、2～6分の離脱 trace と具体 map 構成で反証している。
  mechanic の一要素ずつの導入、breathing map、再周回強制の監査へ直結し、約4000字で失敗条件まで説明できる。
suggested_post_outline:
  overview_angle: "tutorial の有無ではなく、最初の数分で player が一度に解く不確実性の数を playthrough trace から減らす設計として書く。"
  analysis_axis: "早期離脱地点、laser barrier、複数 mechanic の同時導入、難度曲線、secret による再周回要求を仮説と観察結果の対応で分析する。"
  application_target: "Nao_u_BOT の puzzle / action prototype で最初の10分を action 単位に分解し、初見 trace の停止点と同時導入要素数を評価する。"
  pros_cons: "小規模でもすぐ試せる診断軸になる一方、少数の公開 playthrough は母集団を代表せず、難度を下げるだけでは作品固有の発見性を損なう。"
  verdict_pre: "採用"
---

## raw_excerpt

> “Especially the first level should not have any pain points or ambiguous situations.”

要点メモ（引用ではなく本文の要約）: retro sci-fi puzzle / arcade game『Cosmic Hero 2 Prologue』の作者が、公開後の短い YouTube playthrough を観察して失敗点を整理した記録。HUD や score を置かず、起動後すぐ世界へ入り、目的と mechanics を play から発見させる設計を採ったが、Sokoban 系操作に慣れた想定 audience でも導入と目標を読み取れない人がいた。8 map の短さなら難しくても進むだろうという仮説にも反し、2～6分で離脱する playthrough があり、最初の3 map、特に開始直後の laser barrier で止まる例が見えた。作者は序盤を10～12 mapへ分解し、最初の10～20分は緩やかに上げ、途中に breathing map を置く案を示す。

新 mechanic の導入でも、laser redirect を発見させる場面に、blaster の手動起動、自由に動かせる turn block、progress に必要な puzzle、次 section 用の余分な block を同時に置いていた。改善案は、最初の遭遇では component を固定して唯一の明白な action だけで結果を見せ、その後に switch、可動 block、puzzle を足す順序である。また7/8 map に secret を置き、全 secret 未発見なら end screen で再挑戦を促す構造は、初回に player が遊び方を選べず事実上二周を要求すると振り返る。

## why_relevant_to_games

「説明を削れば没入的」「短ければ難しくても続く」「発見させれば理解する」という設計仮説が、実際の早期離脱 trace で崩れた一次資料。tutorial、first-level friction、新 mechanic の一要素ずつの導入、replay 強制を点検する時に使える。
