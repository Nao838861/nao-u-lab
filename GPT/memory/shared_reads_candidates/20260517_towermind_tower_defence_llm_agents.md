---
title: "TowerMind: A Tower Defence Game Learning Environment and Benchmark for LLM as Agents"
url: "https://arxiv.org/abs/2601.05899"
collected_at: "2026-05-17T09:44:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, rts, tower-defense, multimodal-evaluation]
evaluated_at: "2026-05-17T10:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T09:55:21+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778979163445409"
posted:
  ts: "1778979163.445409"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778979163445409"
  char_count: 3959
  posted_at: "2026-05-17T09:55:21+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: >-
  RTS 評価の重さと textual observation の弱さという問題設定、tower defense 化という着想、
  multimodal observation と 5 benchmark levels による評価、planning validation / multifinality /
  action use の失敗様式が candidate 内だけで抽出できる。Nao_u_BOT の headless 評価にも
  画面・テキスト・構造化状態の分離という具体的な接続先がある。
suggested_post_outline:
  overview_angle: "tower defense を、軽量 RTS として LLM agent の計画・局面適応・hallucination を測る評価環境として読む。"
  analysis_axis: "観測形式の違い、macro planning と micro adaptation の同時要求、人間・RL baseline・LLM の差、失敗様式の分類。"
  application_target: "小型プロトタイプの headless harness で、構造化状態だけでなく画面/テキスト観測別の評価を切る設計。"
  pros_cons: "軽量で実装に落としやすい一方、tower defense 固有の配置最適化へ寄りすぎる危険がある。"
  verdict_pre: "部分採用。benchmark 全体ではなく、観測形式分離と失敗様式ログを制作サイクルへ持ち込む。"

---

## raw_excerpt

arXiv:2601.05899。Dawei Wang ほか、AAAI 2026 Oral。論文ページの要旨では、RTS は macro-level strategic planning と micro-level tactical adaptation/action execution を同時に要求するため、LLM agent 評価に向くが、既存 RTS 環境は計算負荷が高いか textual observation が弱い、と問題設定している。TowerMind は tower defense を RTS の軽量サブジャンルとして使い、pixel-based、textual、structured game-state representation を含む multimodal observation space を持つ。5 つの benchmark levels で複数 LLM を評価し、human experts との能力差と hallucination 差を測る。結果として、planning validation の不足、multifinality の弱さ、action use の非効率が観測される。Ape-X DQN と PPO も比較対象に含める。

## why_relevant_to_games

タワーディフェンスは短いプロトタイプでも「配置計画」「局面適応」「行動の無駄」を測りやすい。Nao_u_BOT の headless 評価で、画面・テキスト・構造化状態を分けて観測する候補になる。
