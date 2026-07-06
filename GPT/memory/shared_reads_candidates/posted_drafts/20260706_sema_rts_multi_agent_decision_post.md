■ 概要
arXiv:2603.23875 は、Real-Time Strategy 環境で LLM agent を使う時の主要な失敗を、賢さ不足ではなく speed-quality trade-off として捉える論文である。RTS では状態空間が広く、時間制約が強い。LLM に詳細な観測を全部渡して深く考えさせると inference delay が大きくなり、ゲーム内の判断が遅れる。一方で、急いで粗い planning をさせると stochastic planning errors により論理的一貫性が崩れる。論文はこの二重の問題に対して、SEMA、Self-Evolving Multi-Agent framework を提案する。

中核は三つある。第一に、in-episode assessment と cross-episode analysis によって、episode 中の判断ミスと episode 間で蓄積される偏りを分けて補正する collaborative multi-agent framework。第二に、game state を topological に扱い、structural entropy に基づく dynamic observation pruning で高次元観測を core semantic information に圧縮すること。第三に、micro-trajectories、macro-experience、hierarchical domain knowledge を統合する hybrid knowledge-memory mechanism で、短期の局面対応と長期の戦略知識を接続すること。

評価は StarCraft II の複数 map で行われ、SEMA が win rate を改善しつつ average decision latency を 50% 以上削減したと報告している。結論として、RTS に LLM agent を入れる時は、モデルに全観測を読ませるより、観測圧縮、短期評価、長期経験、自己補正を分けて設計した方が、速度と一貫性を両立しやすい。この論文は「LLM agent が RTS をプレイできるか」より、「リアルタイム制約下で agent harness をどう設計するか」を読む対象である。

■ 内容分析
この論文で一番使えるのは、LLM agent の失敗を一つの prompt 問題に押し込めていない点である。RTS の失敗には、観測が多すぎる、重要な変化を見落とす、計画が遅い、短期行動と長期方針が食い違う、過去の失敗から直らない、という複数の層がある。SEMA はそれを multi-agent と memory の構造で分けて扱う。特に dynamic observation pruning は、LLM に渡す情報を単に短くするのではなく、structural entropy に基づいて game state の構造的な重要度を見ようとしている点がよい。

hybrid knowledge-memory も実務的である。micro-trajectories は局面ごとの細かい行動履歴、macro-experience は試合や episode 単位の経験、hierarchical domain knowledge は人間が読める戦略知識に近い。これらを混ぜる発想は、LLM agent の memory を巨大な会話ログにしないための設計である。今の局面に必要な短期記憶、次回以降に効く失敗パターン、ゲーム一般の戦略知識を分けることで、memory が増えるほど遅くなる問題を避けようとしている。

ただし、論文の強さは StarCraft II という比較的構造化された RTS 環境に支えられている。map、unit、観測、勝敗、行動 interface が明確で、評価指標も win rate と decision latency に落としやすい。小規模 prototype やブラウザゲームにそのまま SEMA を入れると、framework の重さがゲーム本体を上回る。さらに、win rate 改善は有用だが、ゲーム制作で見たいのは「楽しい判断をしているか」「詰まりや理不尽を発見できるか」「人間の操作感に近い失敗をするか」でもある。SEMA の評価は効率と勝率には強いが、体験品質の検査までは直接扱っていない。

■ 自分達の環境への適用
Nao_u_BOT の制作サイクルでは、SEMA を丸ごと agent framework として導入するより、headless playtest agent の設計原則として分解して使うのがよい。まず観測圧縮を入れる。Playwright や Godot の headless 実行で取れる全 state を agent に渡すのではなく、progress、hazard 距離、resource、enemy count、objective status、recent failure のような core semantic information に落とす。これにより、agent のレビューが長い実況文ではなく、判断に必要な特徴だけを使う形になる。

次に、in-episode と cross-episode を分ける。in-episode では、同じ run 中に「なぜ今死んだか」「直前 5 秒で何を見落としたか」を短く記録する。cross-episode では、複数 seed や複数 build をまたいで「同じ hazard で詰まる」「報酬表示を見逃す」「安全地帯を選べない」といった傾向を残す。これを memory atom に直結させる時も、全部を自由文にせず、micro failure、macro pattern、domain note の三層に分けると再利用しやすい。

小さな検証案としては、次の action prototype で baseline agent と pruned-observation agent を同じ seed で走らせる。測るのは勝率だけでなく、decision latency、invalid action 率、初回 objective 到達時間、同一失敗の反復回数にする。pruning で遅延が減っても、重要イベントを見落として失敗が増えるなら不採用。逆に、短い観測で同等の progress が出るなら、今後の playtest harness の既定として採用できる。

■ メリット・デメリット
メリットは、リアルタイムゲームで LLM agent を使う時の設計問題を、観測圧縮、短期評価、長期分析、memory 層に分解できること。StarCraft II で latency と win rate を同時に見ているため、単なる「賢そうな agent」ではなく、時間制約下で実用になるかを評価している点も強い。制作環境では、headless 評価のログ設計と、memory の粒度設計に直接効く。

デメリットは、SEMA 全体が重く、小規模ゲーム制作には過剰になりやすいこと。structural entropy や multi-agent coordination を形式通り入れる前に、何を core observation とするかを手で決めた方が速い場面が多い。また、勝つ agent を作る目的と、ゲームの欠陥を見つける playtest agent を作る目的は違う。勝率最適化に寄せすぎると、人間がつまずく UI、説明不足、気持ち悪い操作遅延を見逃す可能性がある。

■ 判定
部分採用。SEMA 本体ではなく、dynamic observation pruning と micro / macro / domain memory の分離を採用する。次の検証では、同じ seed で full observation と pruned observation の headless agent を比較し、latency と失敗分類が改善するかを見る。

■ URL
https://arxiv.org/abs/2603.23875
