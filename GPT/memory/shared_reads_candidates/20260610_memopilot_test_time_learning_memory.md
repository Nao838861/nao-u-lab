---
title: "From Player to Master: Enhancing Test-Time Learning of LLM Agents via Reinforcement Learning over Memory"
url: "https://arxiv.org/abs/2606.08656"
collected_at: "2026-06-10T07:44:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, memory, test-time-learning, game-playing, evaluation]
evaluated_at: "2026-06-10T07:49:41+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781045833.863959"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781045833863959"
  char_count: 3892
  posted_at: "2026-06-10T08:00:14+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-10T08:00:14+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781045833863959"
next_action: none
stale_after: "2026-07-10"
supersedes: []
gate_reason: "問題設定、memory update を multi-turn decision problem として扱う着想、GRPO 系の訓練、RPS/Limit Texas Hold'em 評価まで候補本文から抽出できる。ゲーム AI と Nao_u_BOT の記憶更新を、手書きプロンプトではなく報酬付きの更新方策として評価する具体的な接続がある。"
suggested_post_outline:
  overview_angle: "LLM agent の経験蓄積を、会話後メモではなく次行動の性能に効く test-time learning の更新方策として読む。"
  analysis_axis: "memory copilot、multi-turn decision formulation、turn-wise reward、context-independent advantage、ゲーム課題での Elo 評価を軸に整理する。"
  application_target: "Nao_u_BOT の atoms/候補/フィードバックを、次の playable diff へ効いたかで後評価する memory update probe に接続する。"
  pros_cons: "長所は記憶更新を評価可能な方策にできる点。短所は評価対象が限定ゲームで、創作・設計記憶への転用には報酬設計が必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv 2606.08656。2026-06-07 submitted。Yishuo Cai, Xingyu Guo, Xuancheng Huang, Jinhua Du, Can Huang, Wenxuan Huang, Wenhan Ma, Yuyang Hu, Aohan Zeng, Jie Tang, Xu Sun。

論文要旨メモ: 長期運用される LLM agent では、各 interaction 後に明示的 memory を更新し、次の判断へ使う方式が一般的になっている。しかし多くは hand-designed prompting rules に依存し、複数ターン先の downstream objective と memory update を整合させるのが難しい。著者らは MemoPilot という plug-in memory copilot を提案し、frozen LLM の逐次 interaction 性能を上げるよう memory update process 自体を訓練する。memory updating を multi-turn decision problem として定式化し、multi-turn GRPO、turn-wise reward signal、context-independent turn-level advantage estimation を使う。評価は multi-round Rock-Paper-Scissors と Limit Texas Hold'em。結果として、MemoPilot は両ゲームで baseline memory methods や proprietary models を上回り、Elo rating で上位になったと報告されている。

短い原文断片: "memory copilot" / "multi-turn decision problem" / "Rock-Paper-Scissors" / "Limit Texas Hold'em"。

## why_relevant_to_games
ゲームAIや自動テストプレイヤーの「経験を次回判断へ変換する」部分を、手書き反省プロンプトではなく、報酬付き memory update として扱う候補。Nao_u_BOT の制作記憶でも、atom 追加が次の playable diff に効いたかを後フェーズで考える材料になる。
