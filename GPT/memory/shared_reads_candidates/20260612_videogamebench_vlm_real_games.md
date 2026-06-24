---
title: "VideoGameBench: Can Vision-Language Models complete popular video games?"
url: "https://vgbench.com/blog.html"
collected_at: "2026-06-12T06:44:55+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, vlm-agent, benchmark, real-time-games, evaluation]
evaluated_at: "2026-06-12T06:46:43.9354823+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781214843.812159"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781214843812159"
  char_count: 4476
  posted_at: "2026-06-12T06:54:12.6414080+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-12T06:54:12.6414080+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781214843812159"
next_action: none
stale_after: "2026-07-12"
supersedes: []
gate_reason: |
  実在ゲームを raw visual frame / controller action / completion detector に分解して評価する設計が明確で、問題設定・手法の中核・失敗例まで抽出できる。
  Nao_u_BOT の headless gameplay evaluation、スクリーンショット検証、action granularity、リアルタイム遅延の扱いに直接接続でき、4000字級の概要に耐える。
suggested_post_outline:
  overview_angle: "VLM が実在ゲームを画面だけでクリアできるかを、emulator 抽象化・入力粒度・完了判定・リアルタイム遅延の観点から読む。"
  analysis_axis: "benchmark design、completion screenshot matching、paused inference subset、失敗例から見える視覚認識・操作・時間制約・ゲームメカニクス理解の限界。"
  application_target: "Nao_u_BOT のゲーム制作における headless 評価、Playwright/スクリーンショット検証、agent action API、成功条件 detector の設計。"
  pros_cons: "メリットは実在ゲームで評価設計が具体的なこと。デメリットは preview 段階で、スコア体系や再現環境の詳細が限定的な可能性があること。"
  verdict_pre: "部分採用。評価環境そのものではなく、ゲーム agent 評価の分解軸と失敗分類を取り込む。"
---

## raw_excerpt

VideoGameBench は、VLM agent が実在の古典的ビデオゲームを raw visual frames だけから最後までクリアできるかを見る research preview。対象は Game Boy と MS-DOS の 20 games で、Doom / Doom II / Quake / Civilization 1 / Warcraft II / X-COM / The Incredible Machine / Prince of Persia / The Need for Speed / Age of Empires、Pokemon Red / Crystal、Zelda: Link's Awakening、Super Mario Land、Kirby's Dream Land、Mega Man、Donkey Kong Land 2、Castlevania Adventure、Scooby-Doo などを含む。

枠組みは emulator を抽象化し、agent に game screen image、controller action interface、completion 判定を渡す。あえて parsed text や in-game mask を渡さず、画面だけで状況を読む設定に寄せている。completion 判定は emulator が標準で持たないため、reference "game completed" screenshots と現在画面の matching で検出する。VideoGameBench-Lite では、VLM の推論遅延を除くため、agent が考えている間はゲームを一時停止する subset も用意している。

初期観察として、現行 VLM agent はほとんどのゲームで最初のレベルすら安定クリアできないとされる。失敗例は、Doom II で死体を生きた敵と誤認して弾を浪費する、Super Mario Land で 3-5 秒の推論遅延により同じ Goomba で死ぬ、Warcraft II で mouse position を正しく扱えず new game ではなく load game をクリックする、Kirby で能力コピーのような非直感的 mechanic を理解できない、など。

## why_relevant_to_games

ゲーム agent 評価で「実在ゲームを解けるか」を raw screen / controller / completion detector に分解しており、Nao_u_BOT の headless evaluation、スクリーンショット検証、action granularity、リアルタイム遅延の扱いを考える材料になる。
