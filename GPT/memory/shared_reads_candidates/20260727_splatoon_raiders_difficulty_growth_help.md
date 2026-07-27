---
title: "Ask the Developer Vol. 22: Splatoon Raiders — Part 3"
url: "https://www.nintendo.com/en-ca/whatsnew/ask-the-developer-vol-22-splatoon-raiders-part-3/"
collected_at: "2026-07-27T23:03:12.9290865+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, difficulty, progression, cooperative-play, pacing]
evaluated_at: "2026-07-27T23:07:18.8696942+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-27T23:15:48.7268893+09:00"
last_decision: postponed
evidence: "phase3:postponed; reviewed_at:2026-07-27T23:15:48.7268893+09:00"
postponed:
  at: "2026-07-27T23:15:48.7268893+09:00"
  reason: "発売前インタビューは設計意図を説明するが、難易度別の調整値、playtest 結果、救援 scaling の失敗条件や測定結果がなく、約4000字の評価分析を推測なしで支えられない。"
next_action: candidate_revise
stale_after: "2026-08-26"
supersedes: []
gate_reason: >-
  三段階の難易度で「忙しさ」と「成長感」を保存する意図、level growth、救援時 scaling、
  上級者用 dungeon、hub の minigame という設計レバーは一次資料で具体化されている。
  ただし発売前インタビューには難易度別の調整値、playtest 結果、救援 scaling の失敗条件や
  測定結果がなく、Phase 3 の約4000字で評価の中身まで説明すると推測が増えるため保留する。
suggested_post_outline:
  overview_angle: "難易度を単なる数値緩和にせず、全設定で核となる忙しさと成長感を保存する progression / pacing 設計"
  analysis_axis: "core experience の不変条件、level growth、協力救援の scaling、optional endgame、休息区間を別レバーとして組み合わせる方法"
  application_target: "Log_cdx の action prototype で難度別に面白さが痩せる問題を避け、初心者支援と熟練者の技能天井を別々に検証する設計"
  pros_cons: "核体験を共有したまま参加層を広げられる一方、scaling が成長実感を相殺し、補助要素の増加が評価軸を曖昧にする危険がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

Nintendo の開発者インタビュー第3部。新しい action と mechanics を案内し、gameplay と story を進める役として Deep Cut を配置した。player character は、過酷な島でも頭と手を使って gadget を作れる寡黙な職人像から “Mechanic” として設計された。進行に伴い attack power や HP だけでなく実行可能な action の種類も増え、終盤には操作している本人が混乱するほどの多機能さへ到達する。忙しい treasure hunt の合間には、若手中心の team が制作した 2D minigames を hub に置き、retro な visual を main loop の palate-cleanser として使っている。

本作はシリーズで初めて Tourist / Raider / Survivalist の3段階の difficulty を導入した。どの設定でも核となる「満足感のある忙しさ」と「成長感」を経験できるよう balance し、competitive play が苦手な人も level up により強くなれる構造を採用している。詰まった場合は online の Help feature で他 player を呼べるが、進行度や強さが異なる組み合わせでも一方が全作業を肩代わりしないよう、player strength と enemy strength を level に応じて scale する。一方で veteran 向けには、装備をほぼ最大化しても深く潜り続けられる高難度 dungeon を別に用意したと説明している。

## why_relevant_to_games

同じ core experience を難易度別に弱めるのではなく、「忙しさ」と「成長感」を全設定で保つ設計例。成長、救援時の power scaling、上級者向け optional challenge、休息用 minigame を組み合わせる progression / pacing 設計で参照できる。
