---
title: "Open-Ended Video Game Glitch Detection with Agentic Reasoning and Temporal Grounding"
url: "https://arxiv.org/abs/2604.07818"
collected_at: "2026-06-04T08:29:43+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, multimodal-agent, glitch-detection, temporal-grounding, evaluation]
evaluated_at: "2026-06-04T08:35:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780530263.937239"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780530263937239"
  char_count: 4324
  posted_at: "2026-06-04T08:44:59+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-04T08:44:59+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780530263937239"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: "問題設定が gameplay video 上の open-ended glitch detection と temporal grounding に明確で、VideoGlitchBench / GliDe / semantic fidelity + temporal accuracy という手法・評価軸を抽出できる。Nao_u_BOT の動画レビュー、headless 検証、失敗区間の記録に直結し、CoopEval 水準の概要へ展開できる。"
suggested_post_outline:
  overview_angle: "動画を見て「何が壊れたか」だけでなく「いつ壊れたか」を自然言語説明と temporal span で扱う評価問題として書く。"
  analysis_axis: "benchmark 設計、game-aware contextual memory、debate-based reflector、event-level grounding、semantic fidelity と temporal accuracy の同時評価。"
  application_target: "Nao_u_BOT の playtest 動画レビュー、失敗ログ、手触りの破綻検出、再現区間付き issue 化。"
  pros_cons: "利点は破綻の時刻・説明を検証ログへ接続できること。懸念は動画 annotation コスト、valid event と glitch の境界、既存モデルの精度不足。"
  verdict_pre: "部分採用。benchmark そのものより、動画失敗を temporal span つきで残すログ設計を採用候補にする。"
---

## raw_excerpt
arXiv:2604.07818。2026-04-09 submitted、2026-04-24 revised。対象は gameplay video の中から glitch を見つけ、自然言語で説明し、発生時刻の span まで特定する open-ended video game glitch detection。従来の image-level recognition や closed-form QA ではなく、mechanics、physics、rendering、animation、expected state transitions を連続動画上で読み、真の glitch と unusual だが valid な game event を区別する必要がある、という問題設定。

提案側は VideoGlitchBench と GliDe。VideoGlitchBench は 120 games から 5,238 gameplay videos を集め、glitch description と temporal span を付けた benchmark。GliDe は game-aware contextual memory、debate-based reflector、event-level grounding module を組み合わせ、断片的な temporal evidence から glitch interval を復元する。評価も semantic fidelity と temporal accuracy を同時に見る設計になっている。実験では現行 multimodal models には難しいが、GliDe は vanilla baseline より強いとされる。

## why_relevant_to_games
Nao_u_BOT の headless / video review は「失敗を検出する」だけでなく、どの時刻に何が mechanics として破綻したかを残す必要がある。動画ベースの glitch span と説明を候補化しておくと、手触りや不可解な失敗の回収に使えそう。
