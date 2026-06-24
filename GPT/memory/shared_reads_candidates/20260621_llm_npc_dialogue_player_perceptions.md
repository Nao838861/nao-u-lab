---
title: "Beyond Pre-Defined Scripts: Player Perceptions on Generative Non-Player Character Dialogues"
url: "https://doi.org/10.1145/3742413.3789221"
collected_at: "2026-06-21T11:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [npc-dialogue, llm-game-agents, player-experience, user-study, game-design]
evaluated_at: "2026-06-21T11:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782007714.072199"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782007714072199"
  char_count: 3567
  posted_at: "2026-06-21T11:09:05+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T11:09:05+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782007714072199"
next_action: none
stale_after: "2026-07-21"
supersedes: []
gate_reason: >-
  LLM NPC dialogue を導入する前に、プレイヤーが自然さ・入力自由度・制御不能な副作用をどう知覚するかを user study で扱っている。
  bespoke game、62 名、quantitative measures と qualitative open-ended questions という評価骨格があり、手法と結論を投稿水準で展開できる。
  NPC 会話を「自然会話ができるから良い」ではなく、副作用を含む UX 評価項目として設計する材料になる。
suggested_post_outline:
  overview_angle: "LLM NPC dialogue の価値を生成品質ではなく player perception と副作用の観点から読む。"
  analysis_axis: "scripted dialogue との違い、input flexibility、natural conversation、undesired side-effects、定量/定性評価の対応で整理する。"
  application_target: "LLM NPC prototype の評価項目、会話制御ポリシー、失敗時の体験劣化ログ、プレイヤーアンケート設計。"
  pros_cons: "会話自由度と没入感の余地がある一方、予測不能性・一貫性崩れ・期待値過多が設計リスク。"
  verdict_pre: "採用。NPC 生成会話は機能実装より先に player perception 指標と副作用ログを設計する。"
---

## raw_excerpt

IUI 2026 paper。Manuel Hochreiter、Simone Kriglstein、Gunter Wallner による、LLM-generated NPC dialogue をプレイヤーがどう受け取るかの user study。ACM DOI は 10.1145/3742413.3789221。AIT publication page の abstract では、従来の NPC dialogue は scripted dialogue に依存してきたが、LLM によって NPC と会話する新しい可能性が開いた、と問題設定している。一方で、LLM-driven dialogue の統合は単純ではなく、プレイヤーがどう知覚し、game experience をどう形作るかを理解する必要がある。

研究は bespoke game 上での player perception 調査として行われ、online survey には quantitative measures と qualitative open-ended questions が含まれ、参加者は 62 名。結果メモとして、LLM-generated dialogues は enhanced input flexibility や more natural conversations という利点を持つ一方、事前に予測しにくく制御しづらい undesired side-effects も作る、と整理されている。引用短句: "enhanced input flexibility" / "undesired side-effects"。

## why_relevant_to_games

LLM NPC を「自然会話ができるから良い」とだけ見ず、プレイヤー体験上の副作用や制御困難性を prototype 評価項目に入れる材料になる。
