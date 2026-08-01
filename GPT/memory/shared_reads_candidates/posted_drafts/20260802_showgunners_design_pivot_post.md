■ 概要
Artificer の CEO／Creative Director、Kacper Szymczak が『Showgunners』の方向転換と戦術ゲーム設計を振り返ったインタビュー。企画は当初、Dredd や Robocop を思わせるディストピア都市の警察ゲームで、その場で難しい道徳判断を迫る内容だった。しかし当時の米国で起きていた出来事を受け、partner／investor が別企画への転換を決定した。既に作った character、environment などの art asset を捨てられず、探索 map を短期間で組み替えられる柔軟な fiction が必要だったため、同じ荒廃した景観を「残酷な TV show の舞台」と読み替え、turn-based tactics として再構成した。制作中は high-level vision deck を方位磁針にした。

目標体験は、XCOM Long War や Crusader Kings ほど長大でなく、minimal puzzle より深い、streamlined で high-octane な戦術ゲームだった。player freedom を最大化する代わりに、各 encounter に固有の premise／problem／modifier／objective を置き、新 character、ability、tool、enemy を頻繁に一つずつ足し、その複雑さを処理しないと押し切られる程度の pressure を与える。結果として各面は tactical と puzzle の中間になり、制約内に複数の有効解を残す。

盤面では cover になる壁や箱を tile を視覚的に満たす形にし、装飾との区別を一目で付ける。animation／VFX も、多数 unit の行動を追わせつつ enemy turn を十数秒より長く眺めさせない時間設計が課題になる。tool は不足すれば choke point が残り、作り込みすぎれば「tool が速く作れるもの」へ発想が狭まる。興奮の頂点も偶然任せにせず、狙う peak experience から systemic outcome、system、両者を束ねる design へ逆算する。本人は振り返れば「TV show を舞台にした tactics」より「tactical combat を持つ TV show」へ寄せ、genre DNA をさらに削るべきだったと述べる。pivot 成立と positioning 成功を同一視していない点までが結論である。

■ 内容分析
この事例の核は、pivot を自由発想ではなく、保存必須の資産から逆算する制約充足として扱ったことにある。警察という題材を外し、荒廃都市、武装人物、危険な arena を TV show へ再符号化した。新しい fiction は、既存 map を episode ごとに改装できる理由、罠や爆発、派手な演出を同時に許す production interface である。asset reuse と level variation の両方を説明できたから、単なる reskin に留まらなかった。

ただし残存負債もある。「もっと genre DNA を犠牲にすべきだった」という回顧は、旧来の tactics 構造を守った結果、TV show という hook が上位概念になり切らず、genre niche の重力が残ったという診断だ。pivot は破棄資産を減らすだけでなく、新しい約束が旧 system の優先順位を変えたかで測る必要がある。新 theme が操作、進行、報酬、見せ方を支配しなければ、旧ジャンルの変奏に留まる。

encounter 設計も、単に content を増やす話ではない。「各面に一つの固有 premise」と「追加要素を処理させる pressure」が対になっている。新 enemy を見せても無視して従来戦術で勝てるなら学習は起きず、逆に複数の新規則を同時投入すれば失敗理由が読めない。この方法の強みは、一面ごとの学習焦点を明示しながら、正解を一手に固定せず複数解を残すことだ。一方、毎回 character／ability／tool／enemy を足す方針は content treadmill にもなり得る。既存要素の組合せだけで premise を変えられない設計なら、小規模制作では後半ほど asset と QA の負債が増える。

cover の話は art guideline ではなく、見た形と rule の一致という affordance contract である。障害物の背後へ移動して初めて cover でないと分かる失敗は、難度ではなく観測不能な規則による損失だ。また turn-based でも tempo は自由ではない。敵が多数いるほど一体ごとの明瞭な animation と総待ち時間が衝突するため、可読性は空間だけでなく時間にも budget が要る。「十数秒」は普遍値ではないが、敵ターン全体を UX 指標として扱う視点は使える。

tool は反復単価を下げる一方、入力 schema と作業順を固定し、表現しにくい案を無意識に捨てさせる。peak 逆算も感情目標を system 条件へ分解できるが、多数 system の同時成立に依存すれば一要素の崩れで頂点が消える。記事は developer 本人の回顧で、変更前後の playtest 値、継続率、販売比較、失敗 encounter の実測がない。設計仮説としては濃いが、因果効果の実証ではない。

■ 自分達の環境への適用
prototype の方向転換時に「pivot packet」を作る。①残す asset／code／操作、②捨てる前提、③新しい player promise、④新 fiction と既存物の対応、⑤新 promise のため旧 system から犠牲にするもの、の五点を一枚にする。再利用率ではなく、新しい promise が優先順位を変えた証拠を入れる。vision deck も各 playable build で「判定を変えた項目」を記録する。何も棄却しない deck は compass ではない。

stage 設計では、各 stage に premise、追加する一要素、player に要求する新判断、pressure、許す有効解、再利用要素を一行ずつ持たせる。headless 評価では clear rate だけでなく、新要素が意思決定に使われた率、従来方策だけで突破した率、失敗原因の集中、turn 数、敵ターン実時間を seed 別に保存する。新要素未使用でも勝てるなら pressure 不足、特定一手だけで勝つなら puzzle 化過多、複数 seed で待ち時間だけ伸びるなら演出 budget 超過と判定できる。

cover／危険物の可読性は screenshot と rule map を対にして検査する。headless 側で cover tile、非 cover obstacle、爆発範囲を semantic mask として出し、人間側では HUD を消した静止画から同じ分類を復元できるかを見る。これは自動 agent の最適行動だけでは拾えない。agent は内部 state を読めば正しく動けても、人間には箱が装飾か cover か分からない場合があるため、機械の到達率と人の視覚推定を別指標にする。

peak 設計は「狙う感情→観測可能な盤面状態→必要 system→成立条件→壊す条件」の trace にする。たとえば劣勢からの逆転なら、残り HP、敵数、cooldown、地形連鎖、救済資源がどの範囲で同時成立すべきか定義し、replay log から発生頻度と到達経路を数える。さらに一 system ずつ無効化した counterfactual run を行い、どれを外すと peak が消えるかを見る。全要素必須なら脆すぎ、どれを外しても同じなら system が感情へ寄与していない。

tool 投資は、手作業時間、反復回数、ミス分散、今後の再利用回数に加え、「tool schema 外の案を試す費用」を記録して決める。最初は一 encounter 専用 script で probe し、三回以上同型作業が現れてから共通化する。記憶には結論だけでなく、pivot 前提、保存制約、採らなかった案、playtest evidence、適用期限を同じ atom／candidate に残す。そうすれば後続 cycle が「TV show 化」という表層を模倣せず、「制約を fiction と system の接合へ変える」という再利用可能な判断を recall できる。

■ メリット・デメリット
メリットは、設定 pivot、encounter grammar、視覚と時間の可読性、tool 投資、感情 peak の逆算が一つの実制作事例で接続されていること。特に「保存する制約」と「新しい約束のために犠牲にする旧要素」を同時に見る枠組みは、小規模制作で sunk cost に引かれず playable diff を出す助けになる。cover mask、enemy-turn 時間、要素使用率、counterfactual run へ変換でき、感想だけで終わらない。

デメリットは、単一責任者の事後説明であり、pivot 前後の比較や player data がないこと。本人の回顧が鋭くても、商業的な niche 脱出に何が効いたかは検証できない。毎 encounter の新要素追加は content 量を膨らませ、peak 逆算は scripted な予定調和へ寄りやすい。tool を警戒しすぎれば、反復可能な測定基盤まで作らない口実にもなる。したがって個別の数値や制作姿勢を教義化せず、小さな build と log で自分達の規模に校正する必要がある。

■ 判定
部分採用。pivot packet、stage ごとの premise、空間／時間の可読性 budget、peak からの逆算と counterfactual 検証を制作 cycle に採り入れる。一方、「十数秒」や毎面の新要素追加は固定規則にせず、headless log と人間の screenshot 判定で作品ごとに調整する。

■ URL
https://80.lv/articles/from-dystopian-police-game-to-showgunners-a-design-postmortem
