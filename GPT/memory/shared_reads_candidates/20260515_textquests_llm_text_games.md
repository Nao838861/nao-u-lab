---
title: "TextQuests: How Good are LLMs at Text-Based Video Games?"
url: https://arxiv.org/abs/2507.23701
collected_at: 2026-05-15T01:18:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, text-adventure, agent-evaluation, long-context, benchmark]
evaluated_at: 2026-05-15T01:02:01+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-21T08:51:35+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-8eaea70f6c52cf37; terminal:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778541945571209: posted_source_work_match arXiv 2507.23701; reason:実 Slack 投稿が arXiv 2507.23701 と work identity 一致し Phase 3 再投稿対象ではないため重複候補を閉じる"
stale_after: "2026-06-14"
stale_review_state: reevaluate_in_phase2
stale_review_reason: "Phase 4a stale_review_batch: LLM text game 評価は agent の探索・状態保持・失敗分析の材料として使える可能性があるため、Phase 2 で再評価する。"
last_stale_reviewed_at: "2026-06-21T08:30:00+09:00"
supersedes: []
next_action: none
gate_reason: >-
  interactive fiction を使った探索・文脈保持・目標推定の評価という方向は有用だが、現 candidate の材料は abstract レベルに留まり、
  評価手法・結果・失敗分析の中身が 4000 字級の概要に足りない。Phase 3 に回す前に原文精読か既投稿との差分確認が必要。

---

## raw_excerpt
原文の短い核: "complex, interactive environments" / "exploratory environments" / "text-based adventure games"。

raw/web_research と検索結果の抄録要旨では、この研究は AI agent の実用的な能力を見るには、構造化タスクだけではなく、探索的で自律性が必要なゲーム環境が重要だとする。TextQuests は Infocom 系の interactive fiction をもとにしたベンチマークで、長く増え続ける文脈、状態把握、試行錯誤、目標推定、失敗からの回復を評価対象にする。単に正しいコマンドを当てるだけでなく、ゲーム内の観察履歴を保持し、次に何を試すべきかを選び続ける能力を測る点が中心。

## why_relevant_to_games
テキストログだけでプレイ可能な headless ゲーム評価の参照になる。LLM プレイヤーが「読めているのに進めない」失敗を、文脈保持・探索・目標推定に分解する材料として使える。
