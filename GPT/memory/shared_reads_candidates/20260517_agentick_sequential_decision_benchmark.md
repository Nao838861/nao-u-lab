---
title: "Agentick: A Unified Benchmark for General Sequential Decision-Making Agents"
url: "https://arxiv.org/abs/2605.06869"
collected_at: "2026-05-17T05:29:19+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-agent, benchmark, sequential-decision-making, evaluation]
---

## raw_excerpt
arXiv:2605.06869。2026-05-07 submitted、2026-05-12 revised。Agentick は、RL agent、LLM、VLM、hybrid agent、人間を同じ土俵で比較する sequential decision-making benchmark として提示されている。37 個の procedurally generated tasks を、6 つの capability category、4 つの difficulty level、5 つの observation modality に分け、単一の Gymnasium-compatible interface で扱う構成。

要旨メモ: Coding API、全タスクの oracle reference policies、pre-built SFT datasets、composable agent harness、live leaderboard を含む。27 configurations / 90,000 episodes 以上の評価では単一手法が支配的ではなく、全体では GPT-5 mini が oracle-normalized score 0.309、planning / multi-agent tasks では PPO が優位、reasoning harness は LLM performance を 3-10x に伸ばし、ASCII observations が natural language observations より一貫して強かった、と報告している。

## why_relevant_to_games
ゲーム制作で「AI がプレイできるか」「観測表現をどう渡すか」「scripted / RL / LLM player をどう比較するか」を考える材料になる。特に ASCII 観測が強いという結果は、Nao_u_BOT の headless 評価やデバッグ用 state 表現の設計に接続できる。
