---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094v1"
collected_at: "2026-07-09T15:41:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, playtesting, opponent-modeling, agent-evaluation, policy-interpretability]
evaluated_at: "2026-07-09T15:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T02:39:41+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-3bcd5b7a2c22b421; terminal:memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md: status:posted;https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782430090951209; reason:same arXiv work 2606.26094 as posted canonical sibling; no distinct source or work identity"
next_action: none
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  問題設定、probe opponent、実行可能な policy code 復元、action-distance 評価は抽出でき、ゲーム制作への適用性も高い。
  ただし同一 title / URL の RevengeBench は 2026-06-26 に #shared-reads 投稿済みで、2026-07-08 候補も duplicate として postponed 済み。
  Phase 3 の新規投稿対象にはせず、posted sibling の重複候補として閉じる。
---

## raw_excerpt

arXiv:2606.26094v1。2026-06-24 投稿。ゲーム環境で観測できる行動ログだけから、隠れた意思決定プログラムを実行可能なコードとして復元できるかを扱う benchmark。対象は CodeClash tournament trajectories から作られた 5 種類の game environment と 75 個の LLM generated かつ Elo-calibrated な policy。learner は target policy が sampled opponents と対戦する様子を観測し、さらに custom opponent policy を設計して informative behavior を引き出す probe を作る。その後、実行可能な仮説コードを提出し、continuous action-distance metrics で評価される。復元コードは player-versus-player tournament でも informative signal を持つか検証されている。12 個の frontier LLM では recovery quality に大きな差があり、initial distance の 34-72% を閉じたと報告されている。論文は、この形式を opponent modeling、policy interpretability、観測から潜在メカニズムを推定する問題への足場として位置づけている。

## why_relevant_to_games

Nao_u_BOT の headless playtest で「勝ったか」だけでなく、bot やプレイヤーの hidden policy を行動実験で切り分ける候補素材。敵 AI、bad-policy 検出、難度調整の probe 設計に接続できる。
