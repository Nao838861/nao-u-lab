---
title: "Enhancing Automated Video Game Regression Testing through Behavior-Driven Development and Imitation Learning"
url: "https://conf.researchr.org/details/icse-2026/gas-2026-papers/4/Enhancing-Automated-Video-Game-Regression-Testing-through-Behavior-Driven-Development"
collected_at: "2026-06-08T04:14:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, headless-eval, ai-agent, regression-testing, bdd, imitation-learning]
evaluated_at: "2026-06-08T04:17:51+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780860681.445569"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780860681445569"
  char_count: 3537
  posted_at: "2026-06-08T04:31:35+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-08T04:31:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780860681445569"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: |
  BDD の自然言語仕様を expected behavior として置き、IL で初期方策を作って RL fine-tuning する流れが明確。
  Godot の Mario clone 評価、coverage 向上、開発時間短縮、reward/training cost の課題まであり、4000 字の概要に必要な材料が揃う。
  Nao_u_BOT では route contract や graze_log 系の仕様を agent 回帰テストへ接続する話として具体化できる。
suggested_post_outline:
  overview_angle: "手書きテストでは追えないゲーム回帰を、BDD 仕様から agent の探索目標へ変換する手法として書く。"
  analysis_axis: "BDD expected behavior、expert demonstration、IL 初期方策、RL fine-tuning、coverage/時間/複雑回帰の評価を分けて整理する。"
  application_target: "Pulse Relay や graze_log の route contract を自然言語仕様から headless agent テストへ落とす評価サイクル。"
  pros_cons: "仕様が人間可読で CI に接続しやすい一方、reward 設計と RL 計算負荷が小規模制作では導入障壁になる。"
  verdict_pre: "部分採用"
---

## raw_excerpt

ICSE 2026 / GAS 2026 の発表ページ。題名は "Enhancing Automated Video Game Regression Testing through Behavior-Driven Development and Imitation Learning"。著者は Vincent Mastain と Fabio Petrillo。ページ上の abstract では、現代のゲーム環境が複雑化し、手作業テストが動的な開発速度に追いつきにくい、という問題設定から始まる。提案は BDD と RL と IL を統合した自動テスト手法。BDD の自然言語仕様を expected game behaviors の定義に使い、それを RL agent の探索ガイドにする。さらに expert demonstrations から IL で初期方策を学ばせ、その後 RL fine-tuning に移す。検証対象は Godot 製の Super Mario Bros clone。報告されている利点は、テスト開発時間の短縮、coverage 向上、複雑な game regression の検出。残る課題として reward function 設計と RL training の計算負荷が挙げられている。

## why_relevant_to_games

Nao_u_BOT の headless 評価を、単なるスコア計測ではなく「自然言語仕様 -> 行動 agent -> regression 検出」に接続する候補。特に Pulse Relay / graze_log 系の route contract を BDD 化する時の参照になる。
