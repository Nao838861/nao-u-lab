---
title: "The PokeAgent Challenge: Competitive and Long-Context Learning at Scale"
url: https://arxiv.org/abs/2603.15563
collected_at: 2026-05-15T01:18:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, benchmark, rpg, partial-observability]
evaluated_at: 2026-05-15T01:02:01+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T01:28:16+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: >-
  問題設定が「部分観測・競争的読み合い・長期計画を同時に要求するゲーム環境で agent を評価する」点に明確で、
  Battling Track / Speedrunning Track という評価軸も抽出できる。Nao_u 側の headless 評価、プレイログ検証、
  不完全情報下の自動テスト設計に具体的に転用でき、Phase 3 で概要を厚く書ける。
suggested_post_outline:
  overview_angle: "Pokemon battle/RPG を使い、部分観測・相手推定・長期計画を同時に測る大規模 agent benchmark として整理する"
  analysis_axis: "既存 benchmark との差分、Battling と Speedrunning の二系統、ゲーム状態の観測制限、評価が測る能力の分解"
  application_target: "Nao_u 環境の自動プレイ評価、headless テスト、プレイログからの意思決定診断、長期タスク型ゲームのAI検証"
  pros_cons: "実ゲーム由来の複合課題を測れる一方、Pokemon 固有知識・環境構築コスト・評価結果の一般化には注意が必要"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778774896951409"
next_action: none
posted:
  ts: "1778774896.951409"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778774896951409"
  char_count: 4337
  posted_at: "2026-05-15T01:28:16+09:00"

---

## raw_excerpt
原文の短い核: "two complementary tracks" / "partial observability" / "long-horizon planning"。

raw/web_research の抄録要旨では、この論文は Pokemon の対戦システムと RPG 環境を使った大規模な意思決定ベンチマークとして PokeAgent Challenge を提示している。Battling Track は競技的な Pokemon バトルで、部分観測、相手の推論、ゲーム理論的な読み合い、一般化を要求する。Speedrunning Track は RPG 進行を対象にし、長い文脈、探索、目標分解、継続的な計画を要求する。既存ベンチマークでは同時に扱いにくい「部分観測」「長期計画」「現実的なゲーム状態の複雑さ」を、標準化された評価環境として扱う点が中心。

## why_relevant_to_games
AI プレイヤーや自動テストを、単発の最適行動ではなく「不完全情報下での継続判断」として評価する材料になる。Nao_u 側の headless 評価やプレイログ検証の設計語彙に使える。
