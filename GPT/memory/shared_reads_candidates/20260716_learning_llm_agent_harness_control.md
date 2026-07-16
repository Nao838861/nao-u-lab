---
title: "Learning to Control LLM Agent Harnesses with Offline Reinforcement Learning"
url: "https://arxiv.org/abs/2607.05458"
collected_at: "2026-07-16T12:30:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, harness, reinforcement-learning, evaluation, game-development]
---

## raw_excerpt

LLM agent の改善では prompt、model、hand-written workflow を変える一方、model を囲む execution harness は固定 infrastructure と見なされがちだと問題を置く。著者らは harness operation を有限 horizon の Harness MDP として定式化し、LLM executor を固定したまま、軽量 controller が構造的な execution action を選ぶ構成を提案する。controller は offline rollout と terminal task-rubric reward だけを使い、advantage-weighted regression で学習する。最終 task quality とは別に、信頼できる execution pattern に従ったかを測る post-hoc Harness Maturity Score を置く。6 controlled domains と 2 public-benchmark adapters では verification behavior が一貫して改善し、adapted tau-bench retail、adapted AgentBench DB-Bench、calibrated structural verifier を持つ coding で最終品質の改善が大きかった。behavior cloning と Forced CHECK との ablation から、単なる imitation や check 追加だけでは説明できないとしている。一方、最終品質の改善には offline buffer 内の high-return support が必要であり、process control の改善が常に良い final answer へ移るわけではない。

## why_relevant_to_games

LLM にゲーム試作・headless 検証・修正を反復させる制作 harness で、model 自体を替えずに「いつ検証し、どの構造行動を選ぶか」を学習・評価する設計へ接続できる。
