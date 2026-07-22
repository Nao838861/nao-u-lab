■ 概要
『Liquid Swarm』作者 Mickael Bergeron Neron による、過去3作の不振後、4作目を CrazyGames 公開6週間で日額約31ユーロ、年換算12.9千ドルの広告収益へ育てた一次 postmortem。価値があるのは収益額そのものより、「完成品を作ってから需要を知る」順序を反転し、1分で全要素を見切れる無料版から core loop を検証した過程にある。ゲームは最大2400体の pixel fighters を動かして最大16800体の敵群を包囲・吸収し、XPで能力を上げる incremental roguelite。2.5年前に作った原型を5月2日に itch.io と Redditへ公開し、好反応を確認してからCrazyGamesへ提出、2週間の限定 trial を経て5月27日に広告対応版を公開した。前3作で先に実装していた controller、褅数言語、key binding、speedrun 等は、core idea が支持されるまで作らなかった。

改善は一つの指標ではなく、流入から継続までの funnel に分けられている。CrazyGames の conversion は「訪問者が1分以上遊ぶ割合」で、作者は custom engine による高速 load、静止した群れを囲む→動く群れを囲む、という2段階・約10秒の tutorial、動画だけで遊びが理解できる画面を入口対策にした。さらに追加要素を最初は隠し、理解コストを抑えた。platform 上で conversion や play time が高いと露出が増え、露出が次の plays と収益を増やすため、数ポイントの離脱差が推薦を介して非線形に拡大する。

継続側では ByteBrew の匿名 telemetry を用い、何人がどこまで進み、どこで止まるかを観測した。弱く高価に設計した Fighters stat へプレイヤーが集中投資し、最初の level を突破できる人が24%しかいないと判明。100 fighters を得る rewarded ad を追加した翌日に収益が25%増えたという。低かったCTRにはUIとpreview videoを変更し、約10%改善。さらに Fighters costを半減するA/B testでは、暫定値ながらplay timeがほぼ2倍、retentionが18%改善する兆候が出た。ただし作者自身、統計的な偶然を除くには試験継続が必要としている。

最も明瞭な失敗例は互換性変更である。mobile support と同時に WebGL2 へ上げると、非対応端末による bounce が約5%増え、impressions は約半分、収益は3分の1低下した。原因把握に2週間かかったが、WebGLへ戻すとplaysと収益は過去最高水準へ回復した。結論は、極小版で需要を確認し、入口・進行・継続・収益を別々に計測し、悪化時に戻せる変更単位で育てること。ただし、成功はゲーム固有の新規性、CrazyGamesの独占契約による露出・収益分配優遇、platform推薦にも支えられている。

■ 内容分析
この事例の核は「最小機能」ではなく「最小の検証可能な体験」である。1分しか内容がなくても、群れを操り包囲する感触、敵を吸収する結果、XP成長という因果は一周していた。薄さを許した代わりに、何を支持されたのかをcore loopへ限定できた。単なる未完成版を早く出す話ではなく、最初の問いを「製品全体が売れるか」から「この相互作用をもう一度やりたいか」へ縮めた設計である。

telemetry の読み方も具体的だ。Fighters は設計者にとって弱い罠 stat だったが、名前と可視的な群れの増加がプレイヤーには中心的な成長に見えた可能性が高い。ここで「正しい build を教える」のではなく、選ばれる欲望に合わせてcostを変えるtestへ進んだ点が重要である。一方、rewarded ad追加はgame balance修正とmonetizationを同時に行う。翌日25%増という比較だけでは、曜日、流入構成、推薦順位、更新直後効果を分離できない。A/B testのFighters cost半減の方が仮説としてはきれいだが、sample size、期間、retentionの定義、信頼区間は非公開で、効果量を再現可能な実験結果とは扱えない。

WebGL2の件は、このpostmortemで最も強い反証になっている。「mobile対応を増やす」という表面的には正しい施策が、実端末の互換性低下を通じて入口指標を5%悪化させ、推薦が露出を半減させた。局所的な品質改善より、distributionの裾にいる端末が起動できることの方がplatform全体では支配的だった。変更を戻した後に回復したため因果は比較的読みやすいが、mobile対応とrenderer更新を同時に出したこと自体が診断を遅らせた失敗でもある。

限界も大きい。収益・内部metricsの画面は契約上の懸念から公開されず、全数値は作者の自己申告である。独占契約はOriginals表示、高い収益分配、staffによる最適化支援を含み、通常公開との比較を崩す。tutorialで9600 fightersを見せて本編を400から始める「未来の強さの試食」がplay timeを伸ばしたという説明も未検証の推測。Steam wishlistには成功がまだ移転せず、Poki不採用や低CTRを見た目の弱さに帰す説明にも直接証拠はない。これは普遍的成功則ではなく、観測と推測が混ざった単一作品の探索記録である。

■ 自分達の環境への適用
短期prototypeでは、完成度ではなく「一周したcore loop」と「判定可能な問い」を公開単位にする。例えば新作なら、最初の30～60秒で入力、危険への反応、成功報酬、次の選択まで到達させ、追加weaponやmeta progressionより先に、もう一度触りたい相互作用かを人間playtestで確認する。headless評価は起動、状態遷移、詰み、難度曲線の異常を測れるが、理解、期待、継続意欲の代理にはしない。

観測は `load_complete`、`first_input`、`tutorial_complete`、`first_reward`、`first_failure`、`first_loop_complete` のような最小eventに絞る。各eventの到達率と所要時間をseed・build単位で保存し、離脱が見えた箇所だけ一仮説ずつ変える。tutorial短縮と初期数値調整を同時に行わず、rendererやasset pipelineを変えるbuildには低性能環境の起動smoke testを付ける。悪化時に前buildへ戻せるよう、変更前baseline、変更理由、判定指標、rollback条件を同じ記録へ残す。

制作サイクルへの具体的な移植は、小さなprobeで十分である。次のplayable prototype 1本について、初回一周のeventを6個以下で固定し、内部headless runと人間5～10playの観測を分ける。1回のiterationでは一つの仮説だけを変更し、「完走率が上がったが面白さコメントは落ちた」のような衝突も残す。CrazyGames固有のrevenueやretentionを目標にせず、まず操作理解、最初の快感、再挑戦理由の三層を測る。

■ メリット・デメリット
メリットは、支持されない機能を作らずcore loopへ投資を集中できること、設計者の意図ではなく実際の選択と離脱から問題を見つけられること、互換性regressionを数値とrollbackで止められることにある。入口・進行・継続を分けるため、「遊ばれない」と「遊ぶが続かない」を混同しにくい。

デメリットは、少数playtestや短期間の指標が偶然と新奇性に強く影響されること、測りやすい完走率やplay timeへ最適化してgame feelを痩せさせ得ること、platform推薦の増幅をゲーム自体の改善と誤認しやすいこと。広告報酬を進行修正に使うと、意図的な摩擦を作る誘因も生じる。telemetryは最小化・匿名化・目的限定が必要で、観測できない感情は会話と実play確認で補うべきである。

■ 判定
部分採用。極小でも一周するcore loop、funnelごとの最小telemetry、一変更一仮説、互換性smoke testとrollback gateは採用する。日額収益、広告追加の効果、個別のretention改善率は一般化せず、独占契約と推薦algorithmを含む自己申告事例として保留する。次のprototypeで6 event以下の観測表を一度だけ試し、指標が制作判断を明確にしたかまで評価する。

■ URL
https://mickaelbneron.itch.io/liquid-swarm/devlog/1579269/six-weeks-on-crazygames-my-incremental-roguelite-makes-31day-full-breakdown-of-whats-working-while-my-previous-three-games-flopped
