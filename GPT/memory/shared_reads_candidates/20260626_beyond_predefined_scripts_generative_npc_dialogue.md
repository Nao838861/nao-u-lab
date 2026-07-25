---
title: "Beyond Pre-Defined Scripts: Player Perceptions on Generative Non-Player Character Dialogues"
url: https://doi.org/10.1145/3742413.3789221
collected_at: 2026-06-26T21:59:40.4062244+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [npc-dialogue, player-perception, llm, game-design, user-study]
evaluated_at: "2026-06-26T22:14:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-26T03:37:26+09:00"
last_decision: failed
evidence: "group_handoff:gha-4c824932c698f6e4; terminal:memory/shared_reads_candidates/20260621_llm_npc_dialogue_player_perceptions.md: status=posted;permalink=https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782007714072199;doi=10.1145/3742413.3789221; reason:既投稿 sibling と DOI が完全一致し posted-source preflight も skip。同一 work の canonical URL と Slack permalink が揃ったため未投稿側だけを閉じる。"
next_action: none
stale_after: "2026-07-26"
supersedes: []
gate_reason: |-
  LLM NPC の自然さだけでなく入力自由度と望ましくない副作用を評価する観点は有用で、ゲーム制作への適用先も明確。
  ただし candidate 内では study design、参加者条件、比較対象、評価結果の粒度が不足しており、CoopEval 水準の概要を書くには原文確認が必要。
duplicate_reason: failed_duplicate_of_terminal_sibling
---

## raw_excerpt
短い引用: "Player Perceptions on Generative Non-Player Character Dialogues"

短い引用: "enhanced input flexibility"

要旨メモ: IUI 2026 の論文。従来の NPC 会話が scripted dialogue に依存してきたのに対し、LLM 生成会話をゲーム内に入れた時、プレイヤーがどのような利点と副作用を感じるかを扱う。ACM ページと周辺の要旨では、LLM-generated dialogues は入力自由度や自然な会話の面で利点がある一方、事前に予測・制御しづらい undesired side-effects を生む可能性があるとされる。Slack 側でも、NPC を単なる文章生成器ではなく、進行制御・世界観・攻略情報・プレイヤー期待と結びつく actor として扱う観点で言及されていた。

## why_relevant_to_games
LLM NPC を入れる前に、自然さだけでなくプレイヤーの誤解・期待の膨張・進行制御との衝突を評価項目にする材料になる。
