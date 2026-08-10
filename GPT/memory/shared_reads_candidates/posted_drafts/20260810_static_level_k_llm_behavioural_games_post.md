■ 概要
対象は “LLM Agents as Static Level-k Players in Behavioural Games”。LLM を人間の実験参加者や playtester の代理にする時、「選択結果の分布が似ているなら、判断過程も似ている」と見なしてよいのかを検証した研究である。著者はこの二つを分離するため、均衡へ向かう推論深度を測りやすい一回限りの p-beauty contest と、協力・条件付き応答・終盤行動が表れる10ラウンドの public goods game を組み合わせた。

実験は Qwen 2.5 の単一 family に絞り、scale 6段階（0.5B～32B）、temperature 5段階、4/8 bit quantisation、base/instruct、neutral/cooperative/competitive framing を釣り合わせた360 cell の factorial である。各 cell は、人間実験と同数規模の synthetic subject を走らせ、平均値だけでなく choice distribution 全体を human data と比較する。public goods は round ごとの Kolmogorov–Smirnov 統計と Wasserstein distance、beauty contest は分散と level-k anchor への質量集中を見る。

level-k とは、level-0 の素朴な手を仮定し、その一段上へ best response する再帰の深さである。beauty contest では0.5Bが50付近の level-0、1.5Bが33付近の level-1、3B以上が0付近の Nash limit へ移る。public goods でも他者の平均拠出に対する反応 slope は scale とともに上がり、32B は人間の conditional-cooperation band に入る。ところが、10 round の時間方向では人間の拠出が徐々に低下するのに、LLM は全 scale で平坦か上昇し、human slope -0.91 に対する差が約+1.04～+1.15残った。

horizon probe でも同じ断絶が出る。32B instruct model は「終了時点不定」と書かれると finite horizon より1.8～3.3 token多く協力する一方、現在が最終 round だと明示しても終盤の defection を示さない。つまり「不定期ゲームでは協力」という category-level association は取り出すが、その場の相対 round 位置から backward induction していない。結論は、LLM が model scale でほぼ固定された reasoning level をゲーム category から検索し、ゲーム内で belief update しない static level-k player だというものだ。

■ 内容分析
この論文の核心は、人間らしさを「出力分布」と「分布を生む過程」に分けた点にある。temperature を上げれば分散は広がるが、それは一つの mode 周辺の sampling noise であり、人間集団にある複数の reasoning type の混合ではない。実際、単一 specification の relative dispersion 0.135 は、異なる specification を混ぜると human value 0.200 へ届く。見た目の幅を一個の agent の乱数で再現するのではなく、異なる level を持つ agent pool を構成しなければならないという含意がある。

deployment knob の役割分担も明瞭である。alignment は opening level、scale は strategic depth、temperature は noise を主に動かし、quantisation は scale を固定すると主効果を持たない。framing の一律な主効果もないが、competitive framing と scale の interaction はあり、大きい model だけが framing を Nash 方向へ解釈する。従って「temperatureを調整すれば人間らしくなる」「協力的 persona を足せば適応的になる」という一変数の処方は成立しない。

評価設計には強みと注意がある。強みは単一 family 内の balanced factorial、人間と同規模の分布比較、one-shot と repeated game の二系統、finite/indefinite/explicit-last-round の機序 probe を連結したことだ。一方、working draft であり、scale 結論は Qwen 2.5 一族に閉じる。human data も既存実験の再利用で、agent 同士の相互作用は特定 prompt と public-goods rule に依存する。さらに「category retrieval」は内部表現を直接測った結果ではなく、horizon label には反応するが局所 round 位置には反応しない行動差からの説明である。

それでも、平均一致を代理妥当性と見なさないための検査として強い。LLM が「他者の拠出が多いほど自分も増やす」という関数を一回は再現できても、観測履歴を受けて同じ関数を round ごとに更新できるとは限らない。能力の有無を静的な一問で測るのではなく、履歴依存性、終盤構造、反実仮想な horizon 変更を分ける必要がある。

■ 自分達の環境への適用
ゲーム制作で AI playtester を使う場合、最初の選択分布と適応の軌跡を別 metric にする。例えば協力、資源配分、経路選択、危険回避を含む prototype で、human または設計上期待する初手分布へ近いかだけでなく、同じ相手と複数回対戦した後に方策が変わるか、相手の癖を反転させた時に追従するか、残り時間や最終 wave を明示した時に終盤戦略へ切り替わるかを測る。

小さな probe は三層で作れる。第一層は cold start で20～50 seedを回し、action histogram、entropy、mode 数を保存する。第二層は同じ opponent policy を5～10 round継続し、観測された相手行動に対する response slope と round trend を取る。第三層は途中で相手の方策、終了確率、残り round を変え、変化前後の policy distance と切替遅延を記録する。初手だけ一致し第二・第三層が動かなければ、「static proxy」と明記し、balance 判定の根拠に使わない。

NPC 設計にも使える。人間らしい集団を一 model・一 prompt の temperature sweep で作らず、慎重型、短期最適型、条件付き協力型など、異なる static policy を明示的に混ぜる。その上で、記憶や belief update を別の state machine として実装する。LLM に暗黙に学習を期待せず、「何を観測したらどの belief を更新するか」を telemetry に残せば、会話の人間らしさと戦略適応を切り分けられる。

制作サイクル上は、headless pass を一つの平均 score で閉じない。初手分布、within-run adaptation、horizon sensitivity、last-stage behavior の4列を評価表に持ち、model、prompt、temperature を変えた時にどの列だけが動いたかを見る。これは candidate 評価にも似ており、概要の見栄えが良いことと、追加証拠を受けて判断を更新できることを同一視しない運用へつながる。

■ メリット・デメリット
メリットは、安価な synthetic playtest の使える範囲を否定ではなく限定できることだ。cold-start の選択候補や分布の粗い探索には使えるが、学習する人間の代替には別検証が要ると判定できる。factorial の発想により、model scale、alignment、temperature、framing が同じ「人間らしさ」を動かすのではなく、別の behavioural coordinate を動かすと記録できる。heterogeneous agent pool を作る根拠にもなる。

デメリットは、二つの behavioural game から action game や長い物語体験へ直接一般化できないこと、human target が古典実験の集団分布で個々の継続学習過程と一対一対応しないこと、model family 固有性が残ることだ。また level-k は解釈力の高い枠組みだが、すべてのゲーム行動を一本の推論深度で表すと、感情、探索、身体技能、UI理解など別要因を落とす。

最も危ない移植は、平均や分散が人間に近いという理由で AI の balance feedback を採用することだ。temperature によるばらつきは人口の多様性ではなく、履歴を渡しても belief update しない可能性がある。実際の制作では、分布一致を採用条件ではなく「次の動的 probe を実行してよい」条件に留める。

■ 判定
部分採用。static level-k という一般結論を全 model・全 genre の事実として固定せず、LLM playtester の二段階 validation として採用する。cold-start distribution と within-game adaptation を分離し、horizon 反転・最終局面・opponent policy 変更を含む probe を通った範囲だけ制作判断へ使う。

■ URL
https://arxiv.org/abs/2606.27845
https://arxiv.org/pdf/2606.27845
