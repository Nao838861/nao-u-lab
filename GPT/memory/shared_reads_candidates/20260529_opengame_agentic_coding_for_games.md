---
title: "OpenGame: Open Agentic Coding for Games"
url: https://arxiv.org/abs/2604.18394
collected_at: 2026-05-29T12:30:22+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, agentic-coding, browser-games, playability-evaluation, llm]
evaluated_at: 2026-05-29T12:37:16+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-19T08:42:48+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-03cdcad532e5031a; terminal:memory/shared_reads_candidates/20260526_opengame_agentic_coding_games.md: status:posted permalink:p1779801836817719; reason:posted-source index が同一 arXiv work を実投稿済みと確定"
phase3_review:
  reviewed_at: "2026-05-29T13:05:00+09:00"
  decision: postpone
  reason: "同一 URL の OpenGame 投稿が 2026-05-26 に #shared-reads へ投稿済みのため、重複投稿を避けて撤退。"
  duplicate_of:
    candidate: "memory/shared_reads_candidates/20260526_opengame_agentic_coding_games.md"
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779801836817719"
stale_after: "2026-06-28"
supersedes: []
next_action: none
gate_reason: |-
  問題設定は「自然言語要求から playable なブラウザゲームを agentic coding で作る」ことに明確で、Template Skill / Debug Skill / OpenGame-Bench という手法の中核と評価軸を抽出できる。
  Nao_u_BOT の Phase 0 playable diff、headless 実行確認、失敗 signature の記憶化に直結し、~4000字の概要に必要な密度もある。
suggested_post_outline:
  overview_angle: "OpenGame を、ゲーム制作向け agentic coding の workflow と playable 評価を結び直す事例として書く。"
  analysis_axis: "Template Skill / Debug Skill / GameCoder-27B / OpenGame-Bench の役割分担と、Build Health・Visual Usability・Content Alignment が何を測るか。"
  application_target: "Nao_u_BOT のゲーム制作で、仕様から scaffold、実行、デバッグ、プレイ可能性確認までを Phase 0 の最小ループに落とす評価軸。"
  pros_cons: "利点は制作経験の再利用と playable 評価の明確化。懸念は benchmark と実制作の面白さ評価のずれ、ブラウザゲーム以外への転用範囲。"
  verdict_pre: "部分採用"

---

## raw_excerpt
短い原文断片: "Open Agentic Coding for Games" / "OpenGame-Bench"

arXiv 検索結果と周辺要約による候補メモ。OpenGame は、自然言語のゲーム要求から browser-based game を組み立てる agentic coding framework として提示されている。中心は GameCoder-27B と agent workflow の組み合わせで、project scaffolding、コード生成、debug、playability evaluation を一つの流れにする。評価側には OpenGame-Bench があり、Build Health、Visual Usability、Intent Alignment のような観点で、静的コード品質ではなく「実行して見える playable さ」を扱う。

重要そうな構成要素は、Template Skill と Debug Skill という再利用可能な制作経験の蓄積である。Template Skill は過去のゲーム生成から scaffold を再利用し、Debug Skill は error signature と修正手順を保持する。これは一回ごとの prompt engineering ではなく、ゲーム制作に特化した skill memory を育てる方向の事例として見られる。

## why_relevant_to_games
Nao_u_BOT の playable diff 制作で、template / debug skill / headless playable evaluation を分けて記録する候補軸になる。特に「作ったあとに実行して intent alignment を見る」部分は、Phase 0 の最低限プレイアブル確認と接続できそう。
