---
title: Towards Improving Sequential Decision-Making in LLM Agents via Experience Memory
url: https://arxiv.org/abs/2608.03420v1
collected_at: "2026-08-09T22:01:08+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, game-playing, experience-memory, sequential-decision-making, evaluation]
---

## raw_excerpt

完全情報・二人・ゼロ和ゲームを、LLM の逐次意思決定を正解付きで測る環境として使う研究。PlyBench は OpenSpiel 上で三目並べ、Nim、Connect Four を動かし、Random／MCTS／Minimax の相手と対戦させる。各組合せで先後を入れ替え、三目並べと Nim では最適手率、Connect Four では勝率と手数を記録する。表層表現だけを変えて同じゲーム木を保つ難読化も加え、既知戦略の単純な想起と盤面上の意思決定を切り分けようとしている。効率・中間層モデルは三目並べでも最適手を外し、frontier 層も Connect Four では MCTS に全敗した。

提案法 REAPER は、planner-executor と case memory に self-reflector と rule extractor を加える。対局終了後、各手を「その局面で局所的に妥当だったか」と「最終結果へ正／負／中立のどれで寄与したか」の二軸で振り返り、勝敗だけを全手へ一様に割り当てる粗い credit assignment を避ける。遭遇済み局面の反省は case として保持し、一定対局数ごとに近年の case と既存ルールを小数の自然言語戦略へ再蒸留する。検索時には state-action-reward の重複を除き、成功例と失敗例を層化して取り出す。

GPT-5 nano・medium reasoning・最適三目並べ相手の実験では、各 run が空 memory での 50 評価対局から始まり、20 学習対局と 50 評価対局を 5 epoch、10 独立 run で反復する。評価中は memory を凍結した。reflection のみの最終 draw rate は 0.826、rule extraction 併用は 0.868。強化した baseline の 0.818 に対して REAPER は 0.868 となり、出力 token 数も学習とともに減少した。検証範囲は三目並べ中心で、大規模ゲーム、長い horizon、部分観測への拡張は未解決として残る。

## why_relevant_to_games

LLM テストプレイヤーの評価を最終勝敗だけでなく各手の最適性まで分解し、プレイ履歴を局所ケースと転移可能なルールの二層へ変換する設計例になる。反復テストで「負け試合中の良い手／勝ち試合中の悪い手」を混同しないフィードバック形式として参照できる。
