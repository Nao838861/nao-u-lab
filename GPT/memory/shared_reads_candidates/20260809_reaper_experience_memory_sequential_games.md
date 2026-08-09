---
title: Towards Improving Sequential Decision-Making in LLM Agents via Experience Memory
url: https://arxiv.org/abs/2608.03420v1
collected_at: "2026-08-09T22:01:08+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agents, game-playing, experience-memory, sequential-decision-making, evaluation]
evaluated_at: "2026-08-09T22:10:33+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-09T22:29:44+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786282173010339"
next_action: none
stale_after: "2026-09-08"
posted:
  ts: "1786282173.010339"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786282173010339"
  char_count: 4446
  posted_at: "2026-08-09T22:29:44+09:00"
supersedes: []
gate_reason: >-
  逐次ゲームでの LLM の弱点を正解付き評価し、局所妥当性と最終結果への寄与を分ける reflection、case memory、rule extraction の中核と比較結果を抽出できる。
  PlyBench の条件、REAPER の構成、10 run の定量結果、三目並べ中心という限界が揃い、約4000字の検証可能な概要を構成できる。
  Log_cdx のゲーム制作では、テストプレイヤーの一手単位評価と、プレイ履歴を局所ケース／転移可能ルールへ二層化する反復 harness に直接適用できる。
suggested_post_outline:
  overview_angle: "LLM のゲーム経験を勝敗ログの蓄積ではなく、一手ごとの credit assignment と再利用可能な戦略ルールへ変換する研究として整理する。"
  analysis_axis: "PlyBench の ground-truth 評価、局所妥当性と最終寄与の二軸 reflection、case memory と rule extraction の役割分離、10 run の改善幅と適用限界を軸に読む。"
  application_target: "Log_cdx の headless playtest で、勝敗だけでは見えない良手／悪手を分離し、失敗局面の case と複数 run に転移する短いルールを更新する評価・学習 harness に使う。"
  pros_cons: "メリットは credit assignment の粒度、評価中 memory freeze、ルール圧縮による token 削減。デメリットは三目並べ中心で、長期 horizon・部分観測・非ゼロ和ゲームへの一般化が未検証な点。"
  verdict_pre: "部分採用。REAPER 全体ではなく、二軸 reflection と case／rule 二層 memory を小規模な deterministic game probe から導入する。"
---

## raw_excerpt

完全情報・二人・ゼロ和ゲームを、LLM の逐次意思決定を正解付きで測る環境として使う研究。PlyBench は OpenSpiel 上で三目並べ、Nim、Connect Four を動かし、Random／MCTS／Minimax の相手と対戦させる。各組合せで先後を入れ替え、三目並べと Nim では最適手率、Connect Four では勝率と手数を記録する。表層表現だけを変えて同じゲーム木を保つ難読化も加え、既知戦略の単純な想起と盤面上の意思決定を切り分けようとしている。効率・中間層モデルは三目並べでも最適手を外し、frontier 層も Connect Four では MCTS に全敗した。

提案法 REAPER は、planner-executor と case memory に self-reflector と rule extractor を加える。対局終了後、各手を「その局面で局所的に妥当だったか」と「最終結果へ正／負／中立のどれで寄与したか」の二軸で振り返り、勝敗だけを全手へ一様に割り当てる粗い credit assignment を避ける。遭遇済み局面の反省は case として保持し、一定対局数ごとに近年の case と既存ルールを小数の自然言語戦略へ再蒸留する。検索時には state-action-reward の重複を除き、成功例と失敗例を層化して取り出す。

GPT-5 nano・medium reasoning・最適三目並べ相手の実験では、各 run が空 memory での 50 評価対局から始まり、20 学習対局と 50 評価対局を 5 epoch、10 独立 run で反復する。評価中は memory を凍結した。reflection のみの最終 draw rate は 0.826、rule extraction 併用は 0.868。強化した baseline の 0.818 に対して REAPER は 0.868 となり、出力 token 数も学習とともに減少した。検証範囲は三目並べ中心で、大規模ゲーム、長い horizon、部分観測への拡張は未解決として残る。

## why_relevant_to_games

LLM テストプレイヤーの評価を最終勝敗だけでなく各手の最適性まで分解し、プレイ履歴を局所ケースと転移可能なルールの二層へ変換する設計例になる。反復テストで「負け試合中の良い手／勝ち試合中の悪い手」を混同しないフィードバック形式として参照できる。
