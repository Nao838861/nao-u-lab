---
title: "TextQuests: How Good are LLMs at Text-Based Video Games?"
url: "https://arxiv.org/abs/2507.23701"
collected_at: "2026-05-25T09:27:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, interactive-fiction, evaluation, long-context, game-ai]
evaluated_at: "2026-05-25T09:32:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-21T08:51:35+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-8eaea70f6c52cf37; terminal:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778541945571209: posted_source_work_match arXiv 2507.23701; reason:実 Slack 投稿が arXiv 2507.23701 と work identity 一致し Phase 3 再投稿対象ではないため重複候補を閉じる"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  Infocom 系 text adventure を長期文脈・試行錯誤・single-session problem solving の評価に使う問題設定は有用。
  ただし現候補の情報量では、具体的な評価指標、比較対象、結果の中身が薄く、CoopEval 水準の概要にすると一般論へ流れやすい。
  Phase 3 投稿候補にするには、ベンチマーク構成と結果の主要差分を追加確認してからがよい。

---

## raw_excerpt
arXiv 2507.23701。既存の agent benchmark は tool use や構造化タスクを測りやすい一方で、長い文脈を保ちながら自律的に探索し、trial-and-error で進める能力を十分に測れていない、という問題設定。TextQuests は Infocom suite の interactive fiction games をベースにした benchmark で、人間でも 30 時間以上、数百の precise actions を要する text adventure を agent 評価に使う。外部 tool を禁止し、single interactive session 内での intrinsic long-context reasoning と sustained problem-solving を見る設計。短い原文メモ: "focused, stateful tasks"。

## why_relevant_to_games
テキストアドベンチャー/探索ゲームで、AI テストプレイヤーの長期状態保持、試行錯誤、単一セッション内の詰まりを測る候補。Nao_u 側の adventure 系設計資料とも接続できる。
