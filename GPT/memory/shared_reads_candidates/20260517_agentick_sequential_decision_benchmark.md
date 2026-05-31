---
title: "Agentick: A Unified Benchmark for General Sequential Decision-Making Agents"
url: "https://arxiv.org/abs/2605.06869"
collected_at: "2026-05-17T05:29:19+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, sequential-decision-making, evaluation]
evaluated_at: "2026-05-17T05:36:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T05:37:56+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778963876642889"
posted:
  ts: "1778963876.642889"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778963876642889"
  char_count: 3535
  posted_at: "2026-05-17T05:37:56+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: none
gate_reason: |
  問題設定、task 構成、oracle policy / SFT dataset / harness、評価結果、結論の各要素が揃っており、概要を単なる論文紹介でなく評価設計の話として書ける。
  Nao_u_BOT の headless 評価、観測表現、scripted/RL/LLM player 比較に直結し、ASCII observation 優位という結果も具体的な制作判断に落とせる。
suggested_post_outline:
  overview_angle: "sequential decision-making agent を同じ Gymnasium interface と oracle-normalized score で比較する評価基盤として読む"
  analysis_axis: "task taxonomy、observation modality、oracle policies、reasoning harness、モデル別の得手不得手を分けて分析する"
  application_target: "headless playtest、AI プレイヤー評価、デバッグ用 state 表現、LLM/RL/scripted player の比較 harness"
  pros_cons: "長所は観測表現と評価基盤を制作サイクルに移しやすい点。短所は benchmark task と実ゲームの面白さ評価が一致しない点"
  verdict_pre: "部分採用"

---

## raw_excerpt
arXiv:2605.06869。2026-05-07 submitted、2026-05-12 revised。Agentick は、RL agent、LLM、VLM、hybrid agent、人間を同じ土俵で比較する sequential decision-making benchmark として提示されている。37 個の procedurally generated tasks を、6 つの capability category、4 つの difficulty level、5 つの observation modality に分け、単一の Gymnasium-compatible interface で扱う構成。

要旨メモ: Coding API、全タスクの oracle reference policies、pre-built SFT datasets、composable agent harness、live leaderboard を含む。27 configurations / 90,000 episodes 以上の評価では単一手法が支配的ではなく、全体では GPT-5 mini が oracle-normalized score 0.309、planning / multi-agent tasks では PPO が優位、reasoning harness は LLM performance を 3-10x に伸ばし、ASCII observations が natural language observations より一貫して強かった、と報告している。

## why_relevant_to_games
ゲーム制作で「AI がプレイできるか」「観測表現をどう渡すか」「scripted / RL / LLM player をどう比較するか」を考える材料になる。特に ASCII 観測が強いという結果は、Nao_u_BOT の headless 評価やデバッグ用 state 表現の設計に接続できる。
