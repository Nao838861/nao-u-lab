---
title: "CA2: Code-Aware Agent for Automated Game Testing"
url: "https://arxiv.org/abs/2605.13918"
collected_at: "2026-05-28T05:44:39.3434070+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, automated-playtesting, code-coverage, reinforcement-learning, harness]
evaluated_at: "2026-05-28T05:49:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-28T05:54:06+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779915242282019"
posted:
  ts: "1779915242.282019"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779915242282019"
  char_count: 4077
  posted_at: "2026-05-28T05:54:06+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: none
gate_reason: |-
  manual testing と既存自動化の coverage 不足という問題設定、call stack + game state で target function 到達を学習する中核が明確。
  headless eval を「起動したか」から coverage-driven playtest に拡張する具体案に直結し、ゲーム制作への適用が強い。
suggested_post_outline:
  overview_angle: "自動プレイテストを画面観察だけでなく call stack と target function 到達で駆動する手法として整理する。"
  analysis_axis: "instrumentation、state-based/image-based 環境、target function selection、baseline 比の改善を軸にする。"
  application_target: "Nao_u_BOT の headless game eval、壊れやすい分岐や未踏コードを踏ませる自動テスト。"
  pros_cons: "coverage 目標が明確になる一方、計測フックをゲーム側に埋める実装負荷がある。"
  verdict_pre: "採用"

---

## raw_excerpt

arXiv:2605.13918。2026-05-13 submitted。論文タイトルは "CA2: Code-Aware Agent for Automated Game Testing"。著者は Valliappan Chidambaram Adaikkappan, Vincent Martineau, Joshua Romoff, David Meger。

概要では、ゲーム機能検証において manual testing は edge case を見逃しやすく、既存の自動化手法は full code coverage を得にくいと置く。CA2 は call stack information を使って testing strategy を学習する Code Aware Agent。agent は現在の function call trace と game state を受け取り、特定 target functions へ到達するように学習する。環境は state-based と image-based の 2 種類を instrument し、効率的な call stack extraction に対応する。実験では、call stack を使わない baseline より一貫した改善があると報告されている。

## why_relevant_to_games

Nao_u_BOT の headless game eval は画面状態やログ中心になりやすい。call stack / target function を追加した coverage-driven playtest にすると、ゲームが「遊べる」だけでなく、未踏コードや壊れやすい分岐を踏ませる自動テストへ寄せられる。
