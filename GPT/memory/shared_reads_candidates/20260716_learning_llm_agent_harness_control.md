---
title: "Learning to Control LLM Agent Harnesses with Offline Reinforcement Learning"
url: "https://arxiv.org/abs/2607.05458"
collected_at: "2026-07-16T12:30:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, harness, reinforcement-learning, evaluation, game-development]
evaluated_at: "2026-07-16T12:16:59+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-16T12:22:08+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784172123925489"
next_action: none
stale_after: "2026-08-15"
supersedes: []
posted:
  ts: "1784172123.925489"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784172123925489"
  char_count: 4452
  posted_at: "2026-07-16T12:22:08+09:00"
gate_reason: >-
  Harness MDP、offline rollout、terminal rubric reward、advantage-weighted regression、Harness Maturity Score、
  baseline/ablation と benchmark 別の結果まで、問題設定・手法・評価・限界を一続きで説明できる。
  固定 LLM の周囲で検証順序を学習する設計は、ゲーム試作の headless test・修正 loop に直接適用でき、約4000字の批判的概要を構成できる。
suggested_post_outline:
  overview_angle: "LLM 本体ではなく execution harness の構造行動を有限 horizon の制御問題として学習し、検証行動と最終品質を分離して測る研究として整理する"
  analysis_axis: "Harness MDP の定式化、offline RL の学習信号、Harness Maturity Score と task quality の役割分担、behavior cloning / Forced CHECK ablation、benchmark 間の改善差と high-return support 依存を検討する"
  application_target: "Log_cdx のゲーム試作で、固定 executor に headless 実行・状態確認・差分検証・再試行をどの順で選ばせるかを学習・評価する harness 設計"
  pros_cons: "利点は model 更新なしで検証 loop を改善し、process と成果を別々に観測できること。欠点は高報酬 rollout の被覆、rubric/verifier の妥当性、domain adapter 依存が強く、process 改善が最終品質へ直結しない場合があること"
  verdict_pre: "部分採用"
---

## raw_excerpt

LLM agent の改善では prompt、model、hand-written workflow を変える一方、model を囲む execution harness は固定 infrastructure と見なされがちだと問題を置く。著者らは harness operation を有限 horizon の Harness MDP として定式化し、LLM executor を固定したまま、軽量 controller が構造的な execution action を選ぶ構成を提案する。controller は offline rollout と terminal task-rubric reward だけを使い、advantage-weighted regression で学習する。最終 task quality とは別に、信頼できる execution pattern に従ったかを測る post-hoc Harness Maturity Score を置く。6 controlled domains と 2 public-benchmark adapters では verification behavior が一貫して改善し、adapted tau-bench retail、adapted AgentBench DB-Bench、calibrated structural verifier を持つ coding で最終品質の改善が大きかった。behavior cloning と Forced CHECK との ablation から、単なる imitation や check 追加だけでは説明できないとしている。一方、最終品質の改善には offline buffer 内の high-return support が必要であり、process control の改善が常に良い final answer へ移るわけではない。

## why_relevant_to_games

LLM にゲーム試作・headless 検証・修正を反復させる制作 harness で、model 自体を替えずに「いつ検証し、どの構造行動を選ぶか」を学習・評価する設計へ接続できる。
