---
title: "Tycho: Active Abstraction with Programmatic World Models for ARC-AGI-3"
url: "https://arxiv.org/abs/2607.28287"
collected_at: "2026-08-02T16:47:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, agent-playtesting, world-model, rule-discovery, arc-agi-3]
evaluated_at: "2026-08-02T16:51:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785657519.159189"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785657519159189"
  char_count: 3907
  posted_at: "2026-08-02T16:59:31+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-02T16:59:31+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785657519159189"
next_action: none
stale_after: "2026-09-01"
supersedes: []
gate_reason: >-
  問題設定、実行可能 world model の構築・検査・修復、複数 orchestration 方針の比較、183 level と RHAE による評価、active abstraction という結論まで抽出できている。
  自作ゲームの AI playtest でモデル精度と行動効率を分離し、モデルを作る／直す／使わず行動する判断を計測する具体的な適用へ落とせ、既投稿の ARC-AGI-3 紹介とも焦点が重ならない。
suggested_post_outline:
  overview_angle: "正確な world model を常時作る競争ではなく、限られた行動予算の中で抽象化へ投資する時機を選ぶ active abstraction として解説する"
  analysis_axis: "モデル再現精度と goal discovery・action efficiency の非一致、および actor 主導の selective delegation が自動修復を上回る理由を比較する"
  application_target: "Nao_u_BOT の未知ルール型ゲームに対する AI playtest で、仮説モデルの fidelity、理解までの操作数、修復コスト、direct action への切替を別々に記録する評価 harness"
  pros_cons: "長所は探索・モデル化・計画の費用対効果を実測できること。短所は deterministic な小規模世界への形式化が強く、面白さ、game feel、確率的挙動を直接評価しないこと"
  verdict_pre: "部分採用。総合的な面白さ判定ではなく、未知 mechanics の理解効率とモデル運用判断を測る probe として採用する"
---

## raw_excerpt

ARC-AGI-3 は、未知のゲームを操作しながらルール、隠れ状態、目標を推定し、各行動にコストがあるため少ない手数で進めることを求める。Tycho は、この環境を parameterized rendered deterministic Moore machine として形式化し、ゲーム固有の実行可能な仮説モデルを構築・検査・利用する coding-agent system である。観測履歴では、操作可能な状態を中間 animation、level-completion、game-over frame から分離する。agent は構造化された履歴からモデルを作り、テストし、計画に使い、検証失敗後に修復し、必要ならモデルを使わず直接行動する。

25 種の公開ゲームを同じ inference budget で比較した実験では、actor が必要時に model builder へ委譲する方針が、Claude Opus 4.8 で平均 Relative Human Action Efficiency 88.49 を記録した。選択した方針では GPT-5.6 Sol と Opus 5 が全 183 level を完了し、RHAE 100.00 に達した。一方、検証失敗のたびに自動修復する方針は遷移再現精度を上げても RHAE 83.07 に留まった。著者らは、正確な simulator を作るだけでは目標同定や次行動の改善は保証されず、いつモデルを構築・修復・使用・迂回するかまで含む問題を短く "active abstraction" と呼ぶ。

## why_relevant_to_games

未知メカニクスを遊びながら発見する AI テスターの設計で、world model の正確さとプレイ効率を別々に測る評価軸、およびモデル構築を常時行わず必要時に委譲する orchestration の比較材料になる。
