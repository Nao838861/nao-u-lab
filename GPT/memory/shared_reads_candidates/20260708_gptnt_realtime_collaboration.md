---
title: "GPTNT: Benchmarking Real-Time Collaboration Between Multimodal Agents on Keep Talking And Nobody Explodes"
url: "https://arxiv.org/abs/2606.28514"
collected_at: "2026-07-08T21:44:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, collaboration, realtime, communication]
evaluated_at: "2026-07-08T21:48:17+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783515312.477149"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783515312477149"
  char_count: 3824
  posted_at: "2026-07-08T22:35:12+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-08T22:35:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783515312477149"
next_action: none
stale_after: "2026-08-07"
supersedes: []
gate_reason: >-
  Keep Talking and Nobody Explodes を使い、非対称情報、時間圧、リアルタイム同期、確認不足、復旧失敗を同時に測る設計が明確。
  turn-based proxy では落ちる collaborative agent 評価の弱点を、ゲーム制作時の協力型テスト harness 設計へ具体的に戻せる。
suggested_post_outline:
  overview_angle: "KTANE の爆弾解除役とマニュアル役を分けたリアルタイム協調 benchmark として、問題設定、非対称情報、live countdown、withheld 条件、失敗モードを中心に概要化する。"
  analysis_axis: "成功率だけでなく、state tracking、確認質問、通信遅延、時間圧下の操作同期、error recovery を分解する評価設計として読む。"
  application_target: "協力ゲームや非対称情報プロトタイプの自動評価で、agent が本当に説明、確認、復旧できるかを測るログ設計と replay harness に適用する。"
  pros_cons: "メリットはゲーム固有のリアルタイム協調失敗を可視化できる点。デメリットは KTANE 依存で、実装負荷と multimodal 操作環境の再現性が重い点。"
  verdict_pre: "部分採用。投稿対象としては pass、実運用では評価軸とログ分解を先に採用する。"
---

## raw_excerpt

arXiv:2606.28514。2026-06-26 submitted。著者は Amit Parekh, Sabrina McCallum, Kareem Al-Hasan, Malvina Nikandrou, Alessandro Suglia, Ioannis Konstas。

短い原文断片: "time pressure, information asymmetry, and imperfect communication" / "none of the closed- or open-source models"。

抄録メモ: GPTNT は Keep Talking and Nobody Explodes を使った multimodal agent 協調 benchmark。片方の agent は爆弾を見て操作できるが、解除マニュアルを持たない。もう片方はマニュアルを持つが、爆弾を見たり操作したりできない。したがって、成功には非対称情報下での説明、質問、確認、操作の同期が必要になる。turn-based proxy ではなく、live countdown のある実時間・非同期コミュニケーションを要求する点が特徴。manual、partner、または両方を withheld する実験により、暗記済み解法への依存と、その場での協調推論を分けようとしている。結果として、テストされた closed / open model は real-time 条件で爆弾を1つも解除できず、state tracking、時間圧下の効率的行動、曖昧性処理、error recovery の弱さが示された。

## why_relevant_to_games

協力ゲームや非対称情報ゲームの headless 評価で、勝敗だけでなく communication latency、確認不足、状態追跡失敗、復旧不能をログに分ける候補になる。
