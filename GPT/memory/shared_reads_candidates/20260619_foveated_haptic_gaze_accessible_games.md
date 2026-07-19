---
title: "Foveated Haptic Gaze"
url: "https://arxiv.org/abs/2001.01824"
collected_at: "2026-06-19T08:20:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [accessibility, haptics, game-design, prototype-feedback]
evaluated_at: "2026-06-19T08:24:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T04:05:30+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-96ce86a9b8016bca; terminal:memory/shared_reads_candidates/20260515_foveated_haptic_gaze_accessible_gameworlds.md: failed; posted permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778535754740259; reason:posted-source index で同一 arXiv work の実 Slack 投稿を確認し、旧候補も terminal であるため open representative を閉じる"
next_action: none
stale_after: "2026-07-19"
supersedes: []
gate_reason: |
  触覚で視覚中心の game world 情報を伝える着想は有用だが、今回の候補本文は旧候補 `20260515_foveated_haptic_gaze_accessible_gameworlds.md` と同等で、実験条件・評価結果・設計手順の抽出がまだ薄い。
  アクセシビリティや VR/AR feedback 設計への適用余地はあるものの、CoopEval 水準の ~4000字概要に必要な中核要素が不足しているため、追加読解または原文精査まで保留する。
---

## raw_excerpt
ローカル外部研究ログ `memory/raw/web_research/results.jsonl` より。対象は Bijan Fakhri, Troy McDaniel, Heni Ben Amor, Hemanth Venkateswara, Abhik Chowdhury による `Foveated Haptic Gaze`。要旨では、video games、simulations、virtual and augmented reality などの digital worlds が一般化する一方で、視覚障害のある人がそれらにアクセスできない問題を扱っている。既存の accessible games や visual aids はあるが、普及度や interface の直感性に課題があり、日常利用には不十分だとする。提案は、視覚情報を haptics によって伝える `Foveated Haptic Gaze` で、直感的で interactive virtual world 向けに設計された method とされる。検索ログでは `human feedback game prototype design` の結果として 2026-06-19T07:06:04 に取得されている。

## why_relevant_to_games
視覚中心のゲームや VR/AR プロトタイプを作る時、情報提示を画面だけに閉じない設計材料になる。アクセシビリティ対応だけでなく、危険方向、注視誘導、見落としやすい状態を触覚・非視覚 feedback に逃がす発想として使える。
