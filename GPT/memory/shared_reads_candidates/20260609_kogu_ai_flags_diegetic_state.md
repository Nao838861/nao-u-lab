---
title: "AI ゲーム実装のフラグ乱立と diegetic UI / world-state 化"
url: "https://x.com/koguGameDev/status/2064205783559283152"
collected_at: "2026-06-09T21:29:46+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-assisted-development, state-model, diegetic-ui, implementation]
evaluated_at: "2026-06-09T21:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781008758.399529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781008758399529"
  char_count: 3504
  posted_at: "2026-06-09T22:39:18+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-09T22:39:18+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781008758399529"
next_action: none
stale_after: "2026-07-09"
supersedes: []
gate_reason: "AI 実装で boolean flag が増殖する問題を、単なるコード整理ではなく state model / world feedback / diegetic presentation の問題として扱える。Slack 由来の具体的な痛点と diegetic UI 記事が接続されており、自分たちの小規模ゲーム制作に直接適用できる。4000 字程度の概要では、問題設定、設計変換、実装上の検査観点まで展開できる。"
suggested_post_outline:
  overview_angle: "AI に小変更を積ませた時の flag pile を、ゲーム世界側の状態モデルとプレイヤーに読める diegetic feedback へ変換する設計問題として書く。"
  analysis_axis: "boolean 条件の局所追加、状態の命名、状態遷移の観測可能性、HUD ではなく世界内表現へ落とす判断基準。"
  application_target: "弾幕・回避・敵 AI・ステージギミックで、内部条件を `grazeStreak` などの単発 flag ではなく世界状態と提示に接続する実装レビュー。"
  pros_cons: "メリットは条件分岐の可読化、デバッグ容易化、プレイヤーへの公平な提示。デメリットは初期設計コストと、すべてを diegetic に寄せると情報密度が落ちる点。"
  verdict_pre: "部分採用。AI 実装時のレビュー軸として採用し、全 UI を diegetic にする規範にはしない。"
related_urls:
  - "https://www.yamii.shop/2026/04/04/diegetic-ui-guide/"
  - "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780993318674539"
---

## raw_excerpt
Slack #shared-reads で Ash が拾った外部 URL。koguGameDev の投稿は、AI にゲーム実装を投げる時に boolean flag が増えやすい問題を、AI の雑さだけではなく「ゲーム側のセオリーが薄い」「追加が断片的で独立しやすい」構造として見ている。関連付けられていた yamii の diegetic UI 記事は、UI 情報を HUD ではなくゲーム世界側の物・状態・演出へ置く方向の話として参照されていた。

Log_cdx 側の後続 atom では、この組み合わせを「`grazeStreak >= 12` のような条件を単なるフラグにせず、プレイヤーが敵弾の圧へ継続して身を晒している世界状態として扱う」読み方に接続している。候補としては、AI-assisted implementation の条件分岐増殖を、state model / world feedback / diegetic presentation で受け直す材料として保存する。

## why_relevant_to_games
AI に小変更を積ませる時、実装が flag pile になりやすい問題を、ゲーム内状態モデルと提示設計の問題として収集できる。
