■ 概要
arXiv:2607.00233 は、LLM agents がゼロから共有言語を作る時、成功を左右する主因は channel capacity だけではなく memory architecture だと示す論文である。設定は Lewis signaling game。sender は 8 種類の object のうち target を知っており、自然言語ではなく固定長の symbolic message を出す。receiver は候補 object と message だけを見て target を当てる。両者は round ごとの結果だけを観測し、相互作用履歴から signal convention を作らなければならない。object は color、shape、size の 3 binary features で構成されるため、単に 8 個を丸暗記する方法も、各 token position を feature に対応させる compositional code もあり得る。

論文は 5 種類の memory architecture と複数の channel configuration を比較する。固定 capacity 実験では `|V| = 3`、`L = 3`、つまり 27 通りの symbol sequence が使える条件で 200 rounds、3 seeds を回す。評価は late-game window 151-200 rounds を中心に、accuracy、TopSim、Best MI、collision rate を見る。TopSim は object 間の feature-Hamming distance と message 間の Hamming distance の相関で、意味空間と signal 空間の幾何が揃っているかを見る指標。Best MI は token position と feature の相互情報量で、slot 構造の兆候を見る。collision rate は異なる object が同じ message に潰れる割合である。

結果は、persistent private notebook を持つ agent が surplus channel capacity を活用し、stateless agent で起きる high-capacity collapse を避けた、というもの。abstract では capacity 25 で coordination accuracy が 0.867 ± 0.023 と報告される。stateless agents は中程度の capacity では良いが、語彙が rolling context window で追跡できる範囲を超えると degraded する。著者らは、情報ボトルネック的には object 数と同じ capacity 8 が最適に見えそうだが、実際には capacity 8 は fragility point であり、余剰 capacity の方が convention を安定させやすいと結論する。一方で notebook にも失敗条件があり、途中で確立済み mapping を改訂すると late-game accuracy drop や convention drift が起きる。

■ 内容分析
この論文の面白さは、「LLM は大きな文脈窓を持つから履歴を読ませれば学ぶ」という単純な話を壊している点にある。stateless agent は履歴が prompt に流れている間は学習しているように見えるが、語彙や候補 mapping が増えると、過去の convention を安定した外部状態に変換できず、同じ symbol を別 object に使い直したり、以前の成功 mapping を見失ったりする。つまり問題は推論能力だけではなく、相互作用履歴をどんな形式で保存し、どの round でどう参照させるかである。

private notebook は、成功した code、失敗した code、相手の解釈を外部化し、各 round で convention を再発明する負荷を下げる。このため surplus channel capacity が害になりにくい。通常なら capacity が大きいほど探索空間が広くなり、曖昧さが増える。しかし notebook があると、余った symbol space は衝突回避や feature 分解の余地になる。逆に capacity 8 のように理論上ちょうどよい空間は、1 つの間違いがすぐ collision や drift につながるため、LLM agent には脆い条件になる。

評価指標の組み合わせも良い。accuracy だけだと「たまたま 8 object を丸暗記した」状態と「feature ごとに構造化された code を作った」状態が区別できない。TopSim は compositionality、Best MI は token position と feature の対応、collision rate は曖昧さを測る。ゲーム制作に移すなら、NPC 同士の合図が当たっているかだけでなく、プレイヤーが観察して学べる規則性があるかを測る必要がある。この論文はその測り方の骨格をくれる。

ただし限界も明確だ。object space は 8 個、features は 3 binary、round は 200、seeds は 3 と小さい。著者ら自身も、open-weight models、より大きな compositional space、seed 数増加が必要だとしている。また、notebook は安定化するが、確立済み mapping を途中で書き換えると逆に drift を生む。これは実ゲームの NPC 記憶でも同じで、「記憶がある」だけでは安定せず、どの記憶を immutable convention として扱い、どれを仮説として更新するかの lifecycle が必要になる。

■ 自分達の環境への適用
自分達のゲーム制作では、NPC の暗号、派閥内合図、協力パズル、プレイヤーが観察して学ぶローカル言語の設計に使える。重要なのは、LLM に自由会話で合図を作らせるのではなく、symbolic channel、object/state features、private notebook、更新規則を明示すること。例えば敵派閥が「赤い小旗 + 短い笛」を巡回方向と危険度の合図に使う、村人が 3 音節の隠語で資源位置を伝える、協力 NPC が光の点滅でスイッチ順を伝える、といった仕組みで、message space と meaning space の対応を観測可能にする。

headless 評価では、accuracy だけでなく、TopSim 相当、slot-feature MI 相当、collision rate を簡易実装したい。ゲーム内の「合図」が成功しているかは、受け手 NPC が正しく反応した割合で測れる。しかしプレイヤーが面白いと感じるには、合図が規則性を持ち、数回観察すれば推測できる必要がある。そこで、状態 feature を `danger_type`、`direction`、`urgency` のように定義し、message token との対応が安定しているかを測る。collision が高い合図は、NPC には通じてもプレイヤーには理不尽に見える可能性が高い。

小さな prototype は 8 objects のままでよい。sender NPC と receiver NPC を置き、3 token の signal で target を伝える。memory mode は stateless、rolling context、private notebook、immutable convention notebook の 4 条件に絞る。200 rounds ではなくゲーム制作向けには 50-80 rounds で、どの条件が早く安定し、どの条件が drift するかを見る。プレイヤー向け UI に翻訳する時は、notebook を内部プロンプトではなく世界内の「派閥手帳」「合図表」「古い看板」として出せる。こうすると、NPC の記憶安定化がそのままプレイヤーの学習素材にもなる。

■ メリット・デメリット
メリットは、創発言語を抽象論ではなく設計可能な変数に分けられること。channel capacity を増やすか減らすか、記憶を private notebook にするか、確立 mapping を固定するか、更新を許すか、collision を罰するか、という調整軸が見える。特に「余剰 capacity は必ず悪い」ではなく、memory が安定していれば convention の余地になるという結果は、ゲーム内合図の設計に効く。プレイヤーに見せる合図も、ギリギリの記号数より少し余白がある方が覚えやすい可能性がある。

デメリットは、LLM agent の自然な言語創発をそのままゲームに持ち込むと不安定になること。notebook が途中で mapping を改訂すれば、プレイヤーが学んだ規則を裏切る。seed 数が少ないため、報告された曲線を一般法則として扱うのも危ない。さらに symbolic game の指標は実ゲーム UI の可読性を直接保証しない。音、光、アニメーション、地形記号に置き換えた時、TopSim が高くてもプレイヤーが気づくとは限らない。

■ 判定
採用寄りの部分採用。NPC 同士の合図やプレイヤーが学ぶ局所言語を作る時、private notebook と convention lifecycle を設計軸に入れる。最初は自由生成ではなく、symbolic channel と小さな object space で prototype し、accuracy、collision、slot-feature 対応を headless で測る。記憶の更新は初期探索と確立後で分け、確立済み mapping の無制限な書き換えは避ける。

■ URL
https://arxiv.org/abs/2607.00233
