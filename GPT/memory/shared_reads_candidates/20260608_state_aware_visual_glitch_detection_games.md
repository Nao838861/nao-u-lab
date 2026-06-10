---
title: "A state-aware, hierarchical deep learning framework for automated visual glitch detection in games"
url: "https://www.sciencedirect.com/science/article/pii/S0952197625035286"
collected_at: "2026-06-08T04:14:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-qa, visual-testing, ai-testing, human-in-the-loop, regression-testing]
evaluated_at: "2026-06-08T04:17:51+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780860682.962599"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780860682962599"
  char_count: 4286
  posted_at: "2026-06-08T04:31:35+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-08T04:31:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780860682962599"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: |
  visual anomaly を gameplay state なしで判定すると誤検出しやすい、という問題設定がゲーム QA と直結している。
  state-conditioned detection、synthetic data、human-in-the-loop、CI test condition、3 commercial titles 評価まで揃い、概要の骨格を作れる。
  Nao_u_BOT では sprite wrap、UI overlap、弾/敵/UI の状態依存 visual regression に適用可能。
suggested_post_outline:
  overview_angle: "画面差分だけでなく game state と結び付けて visual glitch を検出する QA フレームとして書く。"
  analysis_axis: "状態情報、階層型 anomaly detection、synthetic data、HITL triage、CI 条件化、commercial game 評価を軸に整理する。"
  application_target: "2D STG、NES/MonoSH 風プロトタイプ、UI overlap、sprite wrap、状態付き visual regression の検出設計。"
  pros_cons: "状態付きなので実プレイ文脈に強い一方、state instrumentation と合成データ設計の初期コストが大きい。"
  verdict_pre: "部分採用"
---

## raw_excerpt

ScienceDirect 掲載の Engineering Applications of Artificial Intelligence 論文。題名は "A state-aware, hierarchical deep learning framework for automated visual glitch detection in games"。著者は Ciprian Paduraru。公開ページの abstract では、video game の visual anomalies が user experience と software quality を悪化させる一方、手作業 QA は scale しにくく、既存の AI 手法は描画スタイルや gameplay scenario の違いに一般化しにくい、という問題設定が置かれている。提案は game state information を統合した hierarchical visual anomaly detection framework。個別タイトルに合わせた high-fidelity synthetic data generation pipeline を作り、state-conditioned detection model と anomaly identification tool を組み合わせる。human-in-the-loop で難しいケースや CI 向け test condition を定義し、production 中に gameplay を妨げず rendering anomalies を検出する。評価は 3 つの commercial game titles。

## why_relevant_to_games

headless だけでは見落とす「画面上の壊れ」を、game state と結び付けて QA する候補。2D STG の弾・敵・UI overlap や NES/MonoSH の sprite wrap 事故を、状態付き visual regression として扱う入口になる。
