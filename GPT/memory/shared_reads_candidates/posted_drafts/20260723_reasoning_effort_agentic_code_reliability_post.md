■ 概要
対象は “Reasoning effort, not tool access, buys first-try reliability in agentic code generation: an observational study”。coding agent に機能を足せば成果も良くなる、という期待をmodel、reasoning effort、browser testing tool、design promptの寄与へ分解した観察研究である。全90 runに同じ詳細仕様を渡し、drag-and-drop、WebSocket同期、永続化、Docker配備等を持つreal-time retrospective boardを独立に実装させた。主分析のOpus 4.7ではHigh/xHigh effort × base/Playwright/full design prompt/1段落の短縮directiveを各6回反復。tool有効の23 runでは全て実際にtesting機能が呼ばれた。

評価は14機能×3点の42点満点。初回で動けば3、観測症状だけを伝える1回のcorrective prompt後に直れば2、未解決なら1とし、最終点とは別に「14項目すべて初回成功」と人間介入数の下限を測った。visual qualityはscreenshotからpolish、色・typography、layout、professional feelを1～5でLLM評価し、人間が全件確認した。結果は、frontier 3 familyの平均が約41/42で天井付近に集まる一方、失敗内訳には大差があった。全100件の初回criterion失敗の55%はlocal environmentとDockerで、Dockerだけで40/90 runが初回失敗した。最終平均点が1点未満しか違わない世代間でも、Docker初回成功は19%から75%へ動いており、修正後の総点は受け渡し時の信頼性を隠した。

Opus 4.7の主sweepでは、HighからxHighへ上げると初回完全成功が5/18（28%）から16/18（89%）へ増え、corrective prompt総数は16から3へ減った。条件固定のmedian cost増は9～29%だった。一方Playwright追加はmedian costをHigh 42%、xHigh 68%増やしたが、機能点・初回信頼性・画面で見えるcriterionを改善しなかった。増分は出力codeよりcache-readで、High 2.3M→5.3M、xHigh 2.3M→7.0Mだった。

design promptは別の仕事をした。promptなし45 runのvisual ratingが全て3.0なのに対し、full prompt 22 runは平均4.5、短縮版18 runは4.7で、機能点は上がらなかった。短縮版は「visual qualityを第一級にし、plainなMVPを避け、調和した色、現代的typography、gradient、micro-animation等を使う」という1段落だけである。ただし豪華なUIは無料ではなく、design promptありではdrag-and-drop初回失敗が11/40、なしでは5/45。xHigh baseは6/6初回完全成功だったのに、短縮design prompt併用は1/6だった。結論は、能力を一律追加するのでなく、信頼性にはmodel/effort、見た目には明示的design directive、検証には実際の故障を観測できるtoolを割り当て、最終点と初回成功を分けて測るべき、というものだ。

■ 内容分析
この研究で最も使えるのは「toolより推論」という順位そのものではなく、aggregate scoreをfailure topologyへ分解した設計である。Dockerやpackage installで起動前に落ちればbrowserは何も観測できない。UIが起動しても、今回の使用は主にpassive screenshot verificationであり、表示された状態からinteraction invariantや永続化まで自動判定するoracleではなかった。したがってnull resultはbrowser testing一般の否定ではなく、観測窓が故障分布に合わないtoolを常時付け、長いsessionを再読させても信頼性は買えない、という結果である。論文自身もcontainer build/smoke testなら主要故障を捕捉し得たと認めている。

reasoning effortの効果も「長く考えれば万能」とは読めない。base/tool条件では環境を含む失敗を横断して減らしたが、design directiveが誘発した複雑性を完全には相殺しなかった。xHigh＋短縮directiveでDocker 3件、drag-and-drop 2件が残ったことは、生成予算と要求scopeが相互作用する証拠である。見た目の指示は潜在能力を呼び出したが、output tokenと実装行数を増やし、装飾層がinteraction層へ侵入した。visual polishを呼ぶなら、同時にinteraction regressionを独立検査する必要がある。

限界は大きい。単一web application、単一human evaluator、非randomizedな条件割当で、分析はpost hoc。xHigh比較はOpus 4.7だけ、各cellは主に6 run、最終点は天井効果を持つ。visual評価もLLM＋人間確認で、実userの好みや操作性ではない。短縮版はmain batchの数週後という交絡もある。28%→89%をゲーム制作へ転記はできないが、同一仕様の反復とfirst-try/repair/cost/visualの分離は移植できる。

■ 自分達の環境への適用
ゲーム制作では、最初のplayable diffを一つの総合点で判定せず、build/start、headless進行、入力応答、state transition、永続化、visualへ分ける。各criterionを first try pass / 症状だけを返した1回修正 / 未解決で記録し、最終成功率とintervention数を並記する。これなら「最後は動いた」が受け渡しまでの人手を隠さない。

toolは常備品ではなく故障別sensorとして割り当てる。compile/container/startupにはbuild logとsmoke test、headless loopには固定seedのstate invariant、UIにはbrowserでのrender・click・drag、見た目には同一viewport screenshotのfacet rubricを使う。browserを開いた事実を検証済みの根拠にせず、「何を操作し、何をoracleで照合したか」を保存する。逆にUIの触覚やdragが今回の変更点なら、browser toolを外す理由はない。重要なのはtool accessの有無でなく、主要failure classを観測できる判定項目があるかである。

最小probeは既存HTML prototypeの小改修1件でよい。同じbase commitから通常/高effortを各3～6 run反復し、初回build、初回playable、headless invariant、interaction regression、修正回数、cost、visual 4 facetを保存する。browser比較ではdragと画面状態のtestを事前固定し、screenshot巡回と分ける。勝率を恒久ルールにせず、failureとsensorの対応を見る。

design directiveは全文system promptを肥大化させず、prototypeごとの短いbriefとして使う価値がある。ただし「premium」「motion」を既定化せず、そのゲームのreadability、impact feedback、操作優先順位を具体化し、baseline機能が通った後のvisual passへ分離する。装飾差分の後にdrag/click/focus/低速時挙動を再実行する。これはplayable diffを早く出し、見た目の磨きがcore interactionを壊した時だけ戻せる可逆な制作サイクルになる。

■ メリット・デメリット
メリットは、同一仕様を90回反復し、最終機能点、初回信頼性、repair burden、visual、costを分離したこと。tool premiumをtoken内訳まで追い、design効果を1段落ablationで再現し、主要故障をcriterion単位で特定した。「初回成功」と「sensorが故障へ届くか」をheadless評価へ加える根拠になる。

デメリットは、単一task・小cell・観察研究なので因果と一般化が限定されること。testing toolの使い方はpassive寄りで、強いend-to-end oracleの評価ではない。visual 5点はuser playtest、readability、楽しさを測らず、design promptの語彙もdark themeやgradientへ偏る。移植時に危ないのは、xHighを常用すれば検証不要とみなすこと、Playwrightを外すこと自体を目的にすること、短いgeneric design directiveを全ゲームへ貼り回して同じ見た目とinteraction複雑性を増やすことである。

■ 判定
部分採用。数値の再現は保留し、first-try reliability、repair burden、failure class、sensor coverage、cost内訳を分ける評価設計を採用する。高effortは最初のplayable diffで小さく比較し、browser検証は主要故障に対応するoracleがある時に使う。design directiveはvisual pass限定の短いbriefとし、interaction regressionを必須の対にする。

■ URL
https://arxiv.org/abs/2607.02436v1
https://arxiv.org/pdf/2607.02436
