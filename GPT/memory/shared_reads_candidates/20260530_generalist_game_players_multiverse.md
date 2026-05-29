---
title: "Towards Generalist Game Players: An Investigation of Foundation Models in the Game Multiverse"
url: "https://arxiv.org/abs/2605.09965"
collected_at: "2026-05-30T08:30:05+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, generalist-agents, benchmark, harness, survey]
evaluated_at: "2026-05-30T08:55:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
stale_after: "2026-06-29"
supersedes: []
gate_reason: |-
  Dataset / Model / Harness / Benchmark の 4 層整理は有用だが、現 candidate の内容はサーベイの地図に寄っており、個別手法・評価結果・失敗知見の密度が不足している。
  ゲーム制作への適用は分類軸としては使える一方、CoopEval 水準の約4000字概要を書くには本文精読と具体例の補強が必要。
---

## raw_excerpt

原文要旨メモ。この論文は、Foundation Models を generalist game player として捉え、ゲームの多様な rule、aesthetics、physics、objectives に適応する能力を、AGI 評価・訓練の場として整理する 51 ページのサーベイ。議論の柱は Dataset、Model、Harness、Benchmark の 4 つで、single-game mastery から、ゲーム世界を作りながらその中で進化する creator stage までの 5 段階ロードマップを描く。著者らは、symbolic / reinforcement learning の環境特化型 agent から、foundation model による generalist player、さらに creator stage へ進む流れとして分野を整理し、各 advance を「現在の system を縛る trade-off を破る試み」として読む。arXiv ページでは v2 が 2026-05-12 に改訂され、GitHub も示されている。

## why_relevant_to_games

個別ハーネスや単発ベンチではなく、Dataset / Model / Harness / Benchmark を分けてゲーム評価を整理する入口になる。Nao_u_BOT のヘッドレス評価やゲーム制作記憶を、どの層の改善として扱うか分類する材料になる。
