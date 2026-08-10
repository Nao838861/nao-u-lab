■ 概要
対象は “StreamArena: Toward Continuous, Interactive, and Long-Horizon Agentic Streaming Video Understanding”。streaming video agentの評価が短いclipとmultiple-choiceに偏り、「直近4 frameだけを見るbaseline」が複雑なmemory方式に並ぶこと、選択肢からlanguage shortcutを使えることを問題にした研究である。実運用に必要な、見続ける、過去を探す、未来条件を監視する、外部toolを呼ぶ能力を、hour-scaleのcausal stream上で同時に測る。

StreamArenaは7 domainから集めた243本のfull-length video、平均88.8分、範囲60～134.2分と、open-ended QA 3,646件で構成される。30名のPhD-level annotatorが各video約20問を作り、2名が相互検証、さらに第三者がquestion、answer、evidence、timestampを監査する。能力別にはreal-time perception 263問、historical retrospection 877問、multimodal tool use 1,732問、proactive interaction 774問を含む。

時間設計が重要である。retrospectionのevidence-to-query gap中央値は12.1分、四分位5.7～25.7分で、49問は証拠が1時間以上前にある。21.6%は複数のevidence segmentを統合し、最大15 segmentを要する。proactive taskは条件成立まで30秒以下、30秒～4分、4分超に層別される。responseはexact matchではなく、Gemini 3.1 Pro judgeがground truthのfactual coreを含むかbinary判定し、proactiveではtrigger timingも測る。

比較は、query時に最大128 frameを読むoffline model、最新30秒だけのrecent-window、過去をtext summaryへ落とす方式、visual memoryを内部圧縮する方式など5群。結果は設計上の三すくみを示す。recent frameは遠い出来事を回収できず、text summaryはvisual evidenceを失い、繰り返しvisual圧縮する方式は細部を保てない。さらにoffline modelは反応問題には強くても、causalに見続けていないためproactive triggerとpersistent stateを持たない。

提案するStreamMindはfrontend/backendの二層構成である。Front Workerは直近観測と会話stateから、即答、backendへのretrieval brief、未来条件を監視するMonitor Worker生成を切り替える。backendではMemory Writerがhierarchical event、entity relation、key frameを非同期保存し、Router、Recall、Search Workerが過去証拠や外部情報を探す。response-critical pathと重いmemory構築を分けるため、interactionを止めずにvisual evidenceを保持する。

StreamMindはstreaming system間で4能力すべて首位となり、能力別の最強baselineに対し53.7～228.1%改善した。同じQwen3.5-397B-A17B backboneとの比較では、pooled query-to-answer latencyを81.4秒から27.5秒へ66.2%削減し、accuracyは89.7%を維持した。ただし総合accuracy 44.5%で、人間referenceのreal-time 91.8%、tool 95.2%、proactive 91.5%からは遠い。結論は、長期理解を巨大context一発で解くより、即時反応と非同期の証拠記憶を別scheduleにする方が実用的だというものだ。

■ 内容分析
この論文の本質はmodel leaderboardよりbenchmark critiqueにある。短尺・選択式では、最後の数frameと回答候補だけで当てられ、persistent memoryを作るcostがscoreへ報われない。StreamArenaは質問時点より後のframeを見せず、動画内の対話履歴を保ち、long gap・multi-evidence・proactive triggerを入れることで、「見たことがある」と「継続的に理解していた」を分離する。

architecture上の重要点はmemory容量だけでなくscheduleである。すべてを一workerに処理させると、過去検索中に現在のeventを見失う。StreamMindは直近知覚、未来条件監視、memory書込み、過去検索を独立workerにし、観測時点までの共有memoryだけを使う。これはdeadlineが異なる仕事を分離するsystems designである。

一方、数値は慎重に読む必要がある。StreamMindは大型Qwen backboneを使い、異なるbaselineとはbackboneやtool条件が揃わない比較もある。shared-backboneのlatency比較は強いが、accuracyを約10%相対で落としている。open-ended判定は単一LLM judgeに依存し、tool-use scoreも最終回答の正しさで、toolをどう使ったか自体を保証しない。YouTube由来7 domainで、gameplay特有の高速HUD、微小effect、入力timingへの一般化も未検証である。

また、persistent multimodal memoryは保存すれば解決ではない。hierarchical event化で何を落とすか、key frame selectionが一瞬のUI変化を残すか、entity relationが誤結合した時に訂正できるかが失敗点になる。論文自身もrecent、text、compression各方式の損失を示しており、単一memory表現を正解としていない。raw video、event index、text summaryを役割別に残す必要がある。

■ 自分達の環境への適用
長時間gameplay playtestでは、headless telemetryとvideo evidenceを競合させず二層にする。frontendは毎秒の低cost signalから死亡、停止、同一地点滞留、UI open、派手な演出開始などを検出し、短いclipを即時bookmarkする。backendは非同期にevent index、entity、scene、HUD state、key frameを作り、後から「死亡の30秒前に何を見落としたか」「最初に鍵を見たのはいつか」をtimestamp付きで返す。

最小probeは30～60分の既存play動画3本でよい。質問をreal-time、retrospection、proactiveに分け、各10問程度を人手でtimestamp付き作成する。比較は最新30秒のみ、一定間隔のtext summary、key frame＋event indexの三方式。accuracy、evidence timestamp hit、response latency、storage量、false proactive alertを同じ表に置く。直近方式が勝つ質問だけならlong-memory導入価値はないため、10分超gapと複数segment統合を必ず含める。

死亡原因分析では、telemetryが示す「HPが0になった」ことと、映像が示す「警告effectが背景に埋もれた」「cursorがUIに吸われた」を接続する。backend recallは回答だけでなく根拠frameの時刻を返し、人がclipを再確認できる形にする。LLMの説明をground truthにせず、frame evidenceへのpointerを必須にする。

記憶システムにもschedule分離を移せる。Slack即時反応や作業中の短いrecallはfrontend、rawの整理、atom間関係、重複検出はbackendとして非同期化する。ただし両者は同じpersistent stateを読み、backend更新が完了していない時は「直近contextだけで回答した」と観測可能にする。これにより重い整理が対話を止めず、即答が過去証拠を捏造することも防げる。

■ メリット・デメリット
メリットは、telemetryだけでは見えない視覚的な失敗原因を長時間後から回収できること、即時monitoringと重いrecallを分離してlatencyを制御できること、長期memoryの価値をgap・multi-evidence・trigger timingで具体的に測れることだ。key frameとtimestampを返せば、playtest reportの検証可能性も上がる。

デメリットは、長時間videoの保存・推論costが大きく、細い弾、短いUI flashを落とし得ることだ。proactive workerはfalse alertで注意を奪い、memory writerの誤要約が後続recallを汚染する。worker分割はfailure modeを増やし、小規模prototypeには過剰設計になりやすい。

危ない移植は、大型multimodal stackを先に作り、どの質問を解くためかを後から探すことだ。まずtelemetryで答えられない視覚質問を固定し、recent-window baselineを破れるか確認する。raw映像を早期に捨てず、summaryやkey frameは索引として扱い、重要判定は原frameへ戻す。

■ 判定
部分採用。StreamMind全体や大型modelは導入せず、playtest評価で直近監視と非同期回顧を別worker・別metricにする。timestamp付き根拠、10分超gap、複数segment、false alertを含む小規模benchmarkを先に作り、recent-windowを明確に上回る場合だけ拡張する。

■ URL
https://arxiv.org/abs/2608.05703
https://arxiv.org/html/2608.05703
