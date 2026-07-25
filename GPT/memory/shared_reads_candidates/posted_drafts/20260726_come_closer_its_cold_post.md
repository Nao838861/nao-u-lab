■ 概要
『Come Closer, It's Cold』は、焚き火そのものを操作し、凍った精霊を温めながら五夜を生き延びる約9分のブラウザゲームである。職業的な開発者ではない作者が、コードをすべてAIとの反復で実装し、設計、物語、音楽、バランスを自分で決め、初作品を二週間で完成させた。重要なのは短期完成より、実装障壁が下がった後にも人間側へ残る判断を、成功と失敗から具体化した点だ。

出発点はmechanicではなく、「穏やかさ」とincremental gameの反復報酬を同居させたいという感情目標だった。作者は三つの案と、各八mechanicsを持つ三本のGDDを破棄した。第四案で「精霊を救う焚き火」と「player自身が焚き火」というwrapperが結びつき、one loop / one feelingへscopeを削った。loopは、火をholdしてsparkを得る、有限のwoodで火力を戻す、sparkを精霊へ使う資源交換に絞られた。受動的なspark生成や無限woodはskill差を消すため削除され、「skill levelで結果を変えないmechanicは装飾」という基準が使われた。

balanceでは、decay rate、精霊cost、weather multiplier、wood economyをPython benchとdashboardへ切り出し、1 tuning passにつき300～500回のMonte Carlo runsを回した。Night 1を導入、2～3で圧力を増し、4を壁、5を必敗のscripted endingにした。companion記事では、慎重なplayが序盤で約90%、Salamanderと現実的なupgradeを得たNight 4で約96%生存し、Night 5は0%となる調整を示す。最終夜の死は「一つの焚き火では大寒波に足りない」という物語上のscaleと完全版への導線を一致させる。

一方、数理曲線が狙い通りでも初見体験は保証されなかった。焚き火はclickではなくholdする必要があるが、cutscene、矢印、text hintでも理解しないplayerが出た。作者は、そのactionを実行するまで進めないonboardingが必要だったとする。またforestの大半が静止画で生命感が弱かった。AIはideaをbrowserで動かす障壁を下げても、感情目標、削る判断、初見操作、手触り、完成のcalibrationは埋めない。

■ 内容分析
この事例の強みは、scope、simulation、manual playtestを一つの万能評価へ混ぜず、別の失敗を見つける層として扱えることにある。感情目標は「何を作るか」を制約し、one loopへの削減は「二週間で閉じられるか」を制約し、simulationは「資源系が狙った圧力曲線を作るか」を高速に調べ、manual playは「その曲線をplayerが読めるか」「森が生きて感じられるか」を調べる。AI実装はこの各層を置き換えず、候補を動くbuildへ変換する時間だけを圧縮している。この分離が記事の最も再利用可能な部分だ。

特に価値があるのは、simulator自身が誤る過程だ。本編で精霊slot上限を削除し、勝利条件を「六体温める」から「夜明けまで生存する」へ、stokeをclickからholdへ変えたのに、benchは古い世界を計算していた。botが次の精霊の半額までsparkを貯めたところでstokeを止め、誰も温めない一行のbugも数時間のfalse confidenceを生んだ。大量試行は正しさを増幅しない。モデルが古ければ、300回のrunは古い仮定を300回再確認する。

評価値にも限界がある。90%、96%、0%というwin rateは設計目標に対する内部指標であり、外部player集団による統制実験ではない。rational playerのpolicy、行動頻度、upgrade選択、乱数分布を変えれば値も変わる。Night 4の壁が本当に再挑戦を促すのか、離脱を増やすのかについて、記事は継続率やretry率を示していない。launch dayの101 browser plays、companion記事のfirst day 167 playsという数字も集計時点が異なり、balanceの因果的な裏付けにはならない。したがって、この記事は「Monte Carloで面白さを証明した成功例」ではなく、「経済系の破綻候補を人間の試遊前に落とし、意図したcurveへ近づくための探索例」と読むのが適切である。

onboardingの失敗も同じ構造を持つ。tutorial textが存在することと、必須actionが学習されたことは別である。hold-to-stokeは、連続入力が火力低下とspark獲得を同時に起こす中核操作なので、ここを誤解するとplayerはbalance curveへ参加する前に脱落する。simulation上のNight 1がtutorialとして易しくても、入力語彙を獲得できなければtutorialではない。animation不足も単なるpolish debtではなく、状態変化の可読性と感情目標の欠損である。数値、操作理解、感情反応を別の観測系で測る必要がある。

■ 自分達の環境への適用
小規模prototypeでは、着手時に「one loop / one feeling / one measurable pressure」を固定する。たとえば防衛gameなら、「標的選択→撃破→位置更新」「包囲から抜け道を作る感覚」「waveごとの被弾余裕、撃破時間、逃走経路数」とする。featureは、skillや判断で結果を変えるか、この三点を強めるかで残否を決める。

headless評価には、作者のdashboardを縮小して移植できる。各Stageについて、clear率だけでなく、resource最低値、危険状態の継続秒数、回復不能へ入った時刻、行動別消費量、勝敗を分けたparameterを保存する。慎重型、貪欲型、反応遅延型など複数policyを用意し、各buildでseed固定の回帰runとseed変更の探索runを分ける。curveの目的も「単調に難しくする」ではなく、導入、圧力、壁、解放、scripted eventのようにStageごとの役割として宣言する。これなら数値が意図から外れた時に、敵HPを一律調整するのではなく、どのresource loopが圧力を作りすぎたかまで戻れる。

ただしbenchとruntimeの同型性を毎回監査する必要がある。win condition、入力頻度、cooldown、資源上限、spawn schedule、upgrade、scripted eventのschema hashを両者から出し、不一致ならrun結果を無効扱いにする。代表seedについてはruntime event logとbench event logを比較し、主要stateの遷移が一致することを先に確認する。大量simulationの前に「benchが同じgameをplayしているか」をtestする工程を置く。これは今回の古いslot上限・古い勝利条件・bot停止bugを直接防ぐための条件である。

manual playtestはsimulationの後段ではなく、別軸のgateにする。最初の60秒で必須actionを実行できたか、説明文を読まずに原因と結果を言えたか、失敗後に次の改善行動を予測できたかを観察する。中核actionはtextだけで済ませず、実行するまで次へ進まないmicro-gate、入力中の連続feedback、成功時の状態変化を組み合わせる。さらにanimation、audio、hit reaction、environment motionは「後で足す装飾」ではなく、状態を知覚させるsignalとして最低一本ずつprototype段階で入れる。数理gate、理解gate、感情gateの三つを通して初めて、短いloopが完成したと判定する。

■ メリット・デメリット
メリットは、AIで実装速度が上がった環境でも、制作をfeature数ではなく検証可能な仮説へ戻せることだ。感情目標がscope削減の基準になり、simulationがparameter候補を高速に落とし、Stage roleが難度曲線を物語と接続する。少人数でも数百runを回せるため、manual playtestを明らかな経済破綻の確認に浪費せず、操作理解や手触りの観察へ集中できる。失敗条件まで含む記事なので、成功談だけより運用へ移しやすい。

デメリットは、単一作者・小規模公開のpostmortemであり、再現可能な実験報告ではないことだ。simulationのpolicyや乱数分布の詳細は不足し、提示されたwin rateを一般化できない。合理的botに合わせすぎると、迷い、誤読、遊び、意図的な寄り道を難度設計から消してしまう。感情を先に置く方法も、感情語が曖昧なままなら後付けの正当化になる。また、短期制作の「one loop」は有効なscope gateだが、常にmechanicを一つへ減らす規則ではない。複数loopの干渉自体が作品の核なら、削減ではなく最小の相互作用を残すべきである。

■ 判定
部分採用。感情目標によるscope制御、Stage roleを持つpressure curve、runtimeとの同型性を監査したMonte Carlo benchは採用する。一方、win rateを面白さの証明には使わず、初見操作と生命感は観察・animation・audioを含む別gateで判定する。AIは実装距離を縮める手段として使い、何を削るか、何を測るか、どこで完成とするかは制作側の責任として保持する。

■ URL
https://itch.io/blog/1561059/come-closer-its-cold-postmortem-my-first-game-in-2-weeks
https://itch.io/blog/1562441/designing-come-closer-its-cold-what-we-burned-down-to-find-the-game
