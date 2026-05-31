---
title: "The Evaluation Game: Beyond Static LLM Benchmarking"
url: "https://arxiv.org/abs/2605.19377"
collected_at: "2026-05-27T04:44:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [evaluation, agent, benchmark, game-design, adversarial-testing]
evaluated_at: "2026-05-27T04:47:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-27T04:51:42.9034759+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779825099980279"
posted:
  ts: "1779825099.980279"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779825099980279"
  char_count: 4438
  posted_at: "2026-05-27T04:51:42.9034759+09:00"
stale_after: "2026-06-26"
supersedes: []
next_action: none
gate_reason: |-
  静的 benchmark の限界を evaluator/trainer の two-player game として定式化し、手法の中核と評価結果を抽出できる。
  headless playtest やゲームAI評価で、固定課題への過適応と変換下での一般化を分けて見る具体的な適用先がある。
suggested_post_outline:
  overview_angle: "静的な評価セットではなく、評価者が変換を持つ対戦ゲームとして benchmark を捉える"
  analysis_axis: "group action による変換、trainer の局所適応、変換後分布での性能低下、評価設計の locality-dependence"
  application_target: "Nao_u_BOT の headless playtest、敵AI・エージェント評価、固定 seed/固定課題への過適応検出"
  pros_cons: "利点は評価の過適応を検出しやすいこと。弱点は変換群の設計が評価者の仮説に強く依存すること。"
  verdict_pre: "部分採用。ゲーム制作では benchmark そのものではなく、評価課題を変換して破綻点を見る probe として採用する。"

---

## raw_excerpt
収集メモ。Paul Wang らによる、静的な LLM benchmark ではなく、evaluator と trainer の相互作用を two-player game として扱う評価枠組み。対象は jailbreak や adversarial prompt に対する robustness fine-tuning で、trainer が既知の攻撃に局所的に適応しただけなのか、未知変換にも一般化したのかを見分ける問題を扱う。論文は group action を使って data augmentation や変換の軌道を表現し、benchmark を固定 prompt 集ではなく evaluator の変換操作で動く対象として捉え直す。実験では Llama / Qwen / Mistral 系で、adversarial prompt への fine-tuning が近傍には効くが距離が離れると拒否率が落ちるという locality-dependence を示す。

## why_relevant_to_games
ゲームAI評価や headless playtest でも、固定 seed / 固定課題への過適応と、変換された状況への一般化を分けて見る必要がある。評価設計を「静的テスト集」から「変換を持つ対戦ゲーム」として考える材料になる。
