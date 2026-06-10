---
title: "Playtrace Arc Search: A Tool to Explore and Evaluate Large Spaces of Playtrace Metrics Through User-Defined Curves"
url: "https://www.researchgate.net/publication/401223923_Playtrace_Arc_Search_A_Tool_to_Explore_and_Evaluate_Large_Spaces_of_Playtrace_Metrics_Through_User-Defined_Curves"
collected_at: "2026-06-05T13:29:24+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, telemetry, player-modeling, design-tools]
evaluated_at: "2026-06-05T13:32:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780634198.510119"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780634198510119"
  char_count: 3675
  posted_at: "2026-06-05T13:36:46+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-05T13:36:46+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780634198510119"
next_action: none
stale_after: "2026-07-05"
supersedes: []
gate_reason: "平均・aggregate heatmap ではなく、設計者が描く progression arc と playtrace metric curve を照合する問題設定が明確。初期評価は 1,000 traces と限定的だが、headless playtest の時系列診断へ具体適用でき、CoopEval 水準の概要に必要な問題設定・中核手法・評価・限界を組み立てられる。"
suggested_post_outline:
  overview_angle: "playtest telemetry を平均値ではなく、設計者が期待する体験曲線との照合問題として扱う。"
  analysis_axis: "user-defined curve、metric-agnostic search、1,000 playtraces 初期評価、aggregate heatmap との違い、汎用性と評価規模の限界。"
  application_target: "Nao_u_BOT の headless 評価で、緊張・難度・回復・失敗圧・探索密度の時間推移を期待曲線として定義し、テスト bot のログを曲線検索する。"
  pros_cons: "メリットは設計仮説を時系列パターンとして検査できること。デメリットは曲線定義が設計者依存で、初期評価だけでは実運用の探索品質がまだ不明なこと。"
  verdict_pre: "部分採用。平均スコア補助ではなく、ログ診断 UI / probe の評価軸として採用する。"
---

## raw_excerpt
EXAG 2025 Workshop 掲載の Playtrace Arc Search (PAS) は、playtesting 中に得られる playtrace を、単なる aggregate heatmap ではなく、デザイナーが意図する体験曲線と照合するための検索対象として扱う。論文ページの要旨では、playtrace は runtime における game system と player action の変化を語る artifact とされ、PAS は designer が canvas 上に望ましい progression arc を描き、その曲線に似た metric curve を大量の playtrace から探す tool と説明されている。初期評価は 1,000 playtraces。metric-agnostic / game-agnostic な検索により、設計仮説が metric progression に一貫して現れているかを早く見つける狙いがある。

## why_relevant_to_games
headless playtest の平均スコアだけでは見えない「緊張・難度・回復・失敗圧の時間推移」を、設計者が描いた期待曲線と照合する発想として使える。
