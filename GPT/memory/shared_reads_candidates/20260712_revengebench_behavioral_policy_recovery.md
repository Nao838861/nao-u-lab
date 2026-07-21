---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094"
collected_at: "2026-07-12T15:45:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, opponent-modeling, behavioral-probes, reverse-engineering]
evaluated_at: "2026-07-12T15:46:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-12T15:46:00+09:00"
last_decision: postponed
duplicate_reason: postponed_duplicate
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md; permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782430090951209"
next_action: none
stale_after: "2026-08-11"
supersedes: []
gate_reason: >-
  同一 title / URL の RevengeBench は 2026-06-26 に #shared-reads 投稿済みである。
  新規投稿対象にはせず、posted duplicate title sibling としてこの候補だけを postponed で閉じる。
---

## raw_excerpt

論文は「行動の観察だけから、ゲーム内エージェントの隠れた意思決定プログラムを実行可能コードとして復元できるか」を扱う。対象は CodeClash の対戦軌跡から作られた、5 種類のゲーム環境・75 個の LLM 生成ポリシーで、難度は Elo により較正されている。学習側は、未知の対象ポリシーがサンプル対戦相手と戦う軌跡を観察するだけでなく、対象の特徴的な反応を引き出す custom opponent policy を行動 probe として設計できる。その後、対象を再現する実行可能コードを提出し、連続的な action-distance 指標で評価される。復元したコードが有用な信号を含むかは、下流の player-versus-player tournament でも検証される。

12 種類の frontier LLM を比較すると、初期 action distance のうち縮められた割合は 34% から 72% までばらついた。復元ポリシーは対戦上の測定可能な優位にもつながり、特に自力では有効な counter-strategy を作りにくい弱いモデルで効果が大きかった。著者らは、プログラムで表現された方策の behavioral recovery を code-space 上の扱える inverse problem と位置づけ、opponent modeling、policy interpretability、観察から潜在機構を推定する研究への接続を示している。

## why_relevant_to_games

ゲーム AI の評価で、固定 bot を当てるだけでなく「対象の分岐を露出させる対戦相手」を probe として生成し、行動ログから実装仮説を復元する設計に使えそう。敵 AI の個性検証、模倣 bot、支配戦略を引き出す headless テストの候補になる。
