---
title: "Towards Generalist Game Players: An Investigation of Foundation Models in the Game Multiverse"
url: "https://arxiv.org/abs/2605.09965"
collected_at: "2026-05-30T08:30:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, generalist-agents, benchmark, harness, survey]
evaluated_at: "2026-07-26T09:56:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-26T09:56:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-26T09:56:00+09:00"
stale_after: "2026-08-25"
supersedes: []
next_action: keep_for_reference
gate_reason: |-
  Dataset / Model / Harness / Benchmark の4層と5段階ロードマップは、Log_cdx の評価系を分類する索引として有用である。
  しかし現 snapshot は51ページのサーベイ全体を粗く要約した地図に留まり、代表研究の比較、評価結果、trade-off の具体例が無いため、約4000字の投稿では広く浅い紹介にしかならない。

---

## raw_excerpt

原文要旨メモ。この論文は、Foundation Models を generalist game player として捉え、ゲームの多様な rule、aesthetics、physics、objectives に適応する能力を、AGI 評価・訓練の場として整理する 51 ページのサーベイ。議論の柱は Dataset、Model、Harness、Benchmark の 4 つで、single-game mastery から、ゲーム世界を作りながらその中で進化する creator stage までの 5 段階ロードマップを描く。著者らは、symbolic / reinforcement learning の環境特化型 agent から、foundation model による generalist player、さらに creator stage へ進む流れとして分野を整理し、各 advance を「現在の system を縛る trade-off を破る試み」として読む。arXiv ページでは v2 が 2026-05-12 に改訂され、GitHub も示されている。

## why_relevant_to_games

個別ハーネスや単発ベンチではなく、Dataset / Model / Harness / Benchmark を分けてゲーム評価を整理する入口になる。Nao_u_BOT のヘッドレス評価やゲーム制作記憶を、どの層の改善として扱うか分類する材料になる。
