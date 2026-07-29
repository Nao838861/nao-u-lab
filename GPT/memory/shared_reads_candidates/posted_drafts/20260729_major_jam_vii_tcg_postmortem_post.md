■ 概要
対象は、tis2k が Major Jam 7 向けに制作した一人用カードゲーム “ERASE: Never Forget Me...” の postmortem である。jam の制約は “Unpredictable Rules”。作者は、カードゲームならルールを重ね、破り、途中で変えられると考え、伏せた Survivor を dice で盤上に表し、隣接するとカードを表にして戦闘する二人用 TCG の原案を一週間の制作へ持ち込んだ。カードは永続ユニットの Survivor、戦闘前に賭ける Feat、相手ターンの phase 間に使う Scheme の三種。さらに draft で見送った Survivor が後に敵として復讐することや、条件を明かさない強力な効果などを構想した。

失敗の中心は mechanic の個数ではなく、一つの mechanic が暗黙に要求した状態表現と操作経路の多さだった。伏せ札は正体を隠したまま一律二マス移動し、表になればカード固有の速度や体力を使う。手札は 2D UI、盤上のカードは 3D scene、party zone は deck 側のデータ、unit の位置は dice で表現された。これだけで party zone のデータ構造、物理カード、手札から盤面への配置、表裏反転、dice 移動、戦闘、Feat、combat stack、animation が連鎖する。作者は「面白い一案が2〜4 subsystemになる」と覚悟していたが、実際には8〜16相当へ膨張したと振り返る。

実装は巨大な await coroutine 列と global state に集中し、board、board 上の card、dice、party zone が異なる構造で同じ状態を表したため、同期不良と debug 困難が増えた。単純に見える「山札から Survivor を一枚探す」効果も、10〜30枚の検索 UI、2D/3D 表示、選択入力、文言設計を新たに要求して削除された。紙で検証しやすい設計だったのに序盤の paper test をせず、実装終盤まで全体を通さなかった結果、盤面は障害物も位置コストもなく進行を遅くし、Scheme の組合せで第1 turn に勝てる退化戦略や、Feat を全投入するだけの戦闘も遅れて発覚した。

締切には間に合わなかったが、3〜4日後に完成した。重要なのは、作者が単に「盤面を全部捨てた」のではない点である。dice を card 自体へ置き換えて二重表現と同期対象を削り、盤面は期待どおり動く条件では緊張と奥行きを生むとして残した。一方、敵が使えない cut-in phase や影響の薄い固有能力は削った。round 間 draft は30分未満の実装で secret character や意外な強カードを導入でき、費用対効果が非常に高かった。最終結果は148作中4位。作者の結論は、面白い着想を既成 TCG 枠へ詰めるのではなく着想を支える system を選び、jam 前半終了時に feature freeze し、実装と同程度に test subsystem を重視すべきだった、というものだ。

■ 内容分析
この回顧から得られる最も強い軸は、scope を「feature 数」で数えないことである。実装費は、mechanic から分岐する表現、入力、遷移、例外、同期、観測、test の積で決まる。伏せ札という一語でも、hidden identity、公開時の rule 切替、遅延 damage、盤上 projection、手札からの移送、AI の不完全情報が増える。さらに一つの事実を dice、3D card、party-zone data の三箇所へ持たせると、各遷移に整合性条件が生まれる。作者の「2〜4が8〜16になった」という感覚は厳密な測定ではないが、状態表現の直積が見積りを非線形にする実例として読める。

巨大 coroutine や global state は原因であると同時に、境界を観測できない設計の症状でもある。await 自体が悪いのではない。card game の段階進行には自然だが、phase の前後条件を個別に再生できず、同じ unit の正本が複数ある状態で長い sequence だけを通すと、どの遷移で壊れたか切り分けられない。作者が必要だったと述べる dedicated test subsystem は、一般的な unit test の本数より、任意の hand・board・phase を直接構成し、card effect 一件または combat 一回だけを再生する seam と解釈すべきである。

設計評価でも同じ問題が出ている。board、Feat wager、Cut-In は説明上の「緊張」や「戦略」を持っていたが、実際の decision cost と counterplay を早期に測っていない。障害物も移動コストもない board は距離を増やすだけで、Feat AI が全投入を選ぶなら温存判断は消える。これは実装不足だけでなく、想定した affordance と最小実装で現れる行動の差である。逆に post-jam の board は同期を減らした後には価値を出し、安価な draft は体験を大きく広げた。したがって教訓は「複雑な mechanic を避ける」ではなく、「体験価値を生む核と、その核を偶然支えていた高コスト表現を分離する」ことになる。

記事は単一作者の回顧で、日別工数、不具合数、変更前後の playtest 指標はない。148作中4位は完成版の魅力を示すが、dice 統合や feature freeze の因果効果を証明しない。過労と食事不足を含む制作条件は判断と実装速度を悪化させており、設計だけへ原因を還元できない。成功順位を「無理な scope でも最後は報われる」という根拠に使うのは危険で、late submission と追加3〜4日が必要だった事実を納期評価から分離すべきである。

■ 自分達の環境への適用
短期ゲーム制作では、実装前に mechanic-to-subsystem map を作る。各 mechanic について「正本となる状態」「画面上の projection」「入力経路」「phase 遷移」「AI が読む情報」「単独再生する test seam」を列にし、同じ事実が二箇所以上で更新される案を赤くする。例えば伏せ敵なら、正体は model 一箇所に保持し、sprite や UI は projection に限定する。見た目の object が別 data を所有する必要がある場合は、同期ではなく一方向の再生成で済むかを先に試す。

headless 評価では、完成した一戦だけを回す前に三つの小さい probe を置く。第一に全 phase 遷移を最小 deck で一巡させ、各境界で invariant を検査する。第二に card effect を一件ずつ固定 seed で実行し、合法手、対象集合、解決後状態を snapshot 化する。第三に想定する面白さを最小 AI で破壊し、Feat 全投入、最短直接攻撃、単一 combo 反復のような退化方策が支配しないかを見る。勝率だけでなく、選択肢の entropy、同一 action の連続率、決着 turn、盤面移動が結果へ与えた寄与を記録する。

制作サイクルには前半終了時の freeze をそのまま規則化するのではなく、二段ゲートとして入れる。25%時点で core loop を紙または headless で一巡できなければ新 mechanic を止め、50%時点で playable build がなければ状態表現を統合して scope を縮退する。削除判断は feature 名ではなく「体験価値 / 新規 subsystem 数」で並べる。この記事の round 間 draft のように、既存の card pool と UI を再利用して30分で大きな変化を出せるものは残し、検索 GUI や別の同期正本を要求する tutor effect は後回しにする。

記憶システムにも小さく適用できる。candidate、staging、index が同じ lifecycle を別々に持つ場合、どれが正本かを固定し、他は導出物として再生成可能にする。ゲームの board と party zone の同期事故は、運用データの二重正本でも同じ形で起きる。ただし記事は記憶システムを扱っていないため、ここは直接の知見ではなく、状態所有権という共通原理からの転用である。

■ メリット・デメリット
メリットは、scope 爆発を抽象論でなく、party zone から必要になった具体的 subsystem と、締切後に何を統合・削除・復活させたかの差分で追えることにある。設計上は魅力的でも UI 一つを新設する effect は高価で、既存資産を再利用する draft は安い、という価値対コストの非対称も明瞭である。二重状態を減らして体験の核を残す判断、専用 test seam、早い退化戦略探索はそのまま採用できる。

デメリットは、工数や test 結果が定量化されておらず、作者の自己診断に強く依存すること。feature freeze を日程だけで機械適用すると、短時間で高価値な draft まで捨てる恐れがある。global state や coroutine を一律禁止するのも誤りで、jam では単一正本としての global data が有効な場合もある。危険なのは技法そのものではなく、所有権が曖昧な複数表現と、局所再生できない長い遷移である。また最終4位という成功は作品価値を示しても、健康を削る制作や締切超過を正当化しない。

■ 判定
部分採用。採用するのは、mechanic を subsystem・状態正本・test seam まで展開して見積もること、同一情報の二重表現を削ること、前半に core loop と退化戦略を検証すること、体験価値を新規 subsystem 数で割って削減順を決めること。固定日だけの feature freeze、global state の一律排除、順位を根拠にした過大 scope の追認は採用しない。次の短期 prototype で mechanic-to-subsystem map と三つの headless probe を一回運用し、実装前見積りと実測差を残す。

■ URL
https://itch.io/blog/960870/major-jam-vii-postmortem
