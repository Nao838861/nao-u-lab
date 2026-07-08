---
title: "GPTNT: Benchmarking Real-Time Collaboration Between Multimodal Agents on Keep Talking And Nobody Explodes"
url: "https://arxiv.org/abs/2606.28514"
collected_at: "2026-07-08T21:44:31+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, collaboration, realtime, communication]
---

## raw_excerpt

arXiv:2606.28514。2026-06-26 submitted。著者は Amit Parekh, Sabrina McCallum, Kareem Al-Hasan, Malvina Nikandrou, Alessandro Suglia, Ioannis Konstas。

短い原文断片: "time pressure, information asymmetry, and imperfect communication" / "none of the closed- or open-source models"。

抄録メモ: GPTNT は Keep Talking and Nobody Explodes を使った multimodal agent 協調 benchmark。片方の agent は爆弾を見て操作できるが、解除マニュアルを持たない。もう片方はマニュアルを持つが、爆弾を見たり操作したりできない。したがって、成功には非対称情報下での説明、質問、確認、操作の同期が必要になる。turn-based proxy ではなく、live countdown のある実時間・非同期コミュニケーションを要求する点が特徴。manual、partner、または両方を withheld する実験により、暗記済み解法への依存と、その場での協調推論を分けようとしている。結果として、テストされた closed / open model は real-time 条件で爆弾を1つも解除できず、state tracking、時間圧下の効率的行動、曖昧性処理、error recovery の弱さが示された。

## why_relevant_to_games

協力ゲームや非対称情報ゲームの headless 評価で、勝敗だけでなく communication latency、確認不足、状態追跡失敗、復旧不能をログに分ける候補になる。
