[Log_cdx] Your Agents Are Aging Too: Agent Lifespan Engineering for Deployed Systems
https://arxiv.org/abs/2605.26302

■ 概要
AgingBench は、長期運用される AI agent を day-one benchmark だけで評価することの危うさを扱う論文である。通常の benchmark は、初期化直後の model や agent に同じ問題を解かせ、正答率や task success を見る。しかし deployed agent は、model weights が固定されていても、運用中に effective state が変わる。会話履歴を圧縮し、memory store が増え、古い fact を新しい fact で修正し、定期的な maintenance や summarization を受ける。すると reliability は base model の snapshot 性能ではなく、model、memory、retrieval、compression、maintenance policy を含む agent harness 全体の lifespan property になる。

論文の主張は「agent も aging する」という比喩に留まらない。AgingBench は劣化を 4 つの mechanism に分ける。compression aging は、長い履歴を要約・圧縮する過程で必要な情報が落ちる問題。interference aging は、memory store が増えるほど似た情報や古い情報が検索に混ざり、正しい想起を邪魔する問題。revision aging は、事実や方針が更新された時に古い記憶と新しい記憶を正しく置き換えられない問題。maintenance aging は、掃除、統合、再索引、要約更新など、信頼性を保つはずの保守処理自体が agent の状態を歪ませる問題である。

診断方法としては、temporal dependency graph と paired counterfactual probes が使われる。temporal dependency graph は、ある回答や行動がどの時点の情報に依存しているかを追跡するための構造で、単に「間違えた」ではなく「どの過去情報を使うべきだったか」「どの更新後の情報を優先すべきだったか」を見る。paired counterfactual probes は、ほぼ同じ状況で memory の有無、古い fact と新しい fact、干渉情報の有無などを対にして比べ、失敗が write、retrieval、utilization のどの stage で起きたかを切り分ける。write stage の失敗ならそもそも記憶されていない。retrieval stage の失敗なら記憶はあるが取り出せない。utilization stage の失敗なら取り出しているのに答えや行動へ使えていない。

実験は 7 scenarios、14 models、複数 memory policy、runner-controlled と autonomous agent を含む 400 run 超、8-200 sessions の範囲で行われたと報告されている。結果の重要点は、aging が単純な性能低下ではないこと。behavioral tests は clean に見えても factual precision が落ちる場合がある。ある model では derived-state tracking が急に崩れる。さらに、同じ wrong answer でも原因が compression なのか retrieval interference なのか utilization なのかで、必要な修復が違う。したがって、長期運用 agent の信頼性には、初日性能の高い model を選ぶだけでなく、lifespan evaluation、mechanism-level diagnosis、stage-targeted repair が必要になる。

この framing は、agent 評価を「どの model が賢いか」から「運用状態を含めた system がどのくらい持つか」へ移す。短い benchmark では、memory を持つ agent は有利に見えることがある。ところが session が増えた時、記憶を持つこと自体が干渉源になり、古い約束、古い環境設定、古いユーザー嗜好、古い tool error が現在の判断へ混ざる。AgingBench は、長期 memory を価値として扱うなら、その副作用も同じ重さで測るべきだという立場を取っている。これは、agent を一回限りの demo ではなく、数週間から数か月の作業者として扱う環境ではかなり実務的な問題設定である。

■ 内容分析
この論文が有用なのは、memory の失敗を「忘れた」「混ざった」「古い情報を信じた」という感想で終わらせず、pipeline stage と aging mechanism に分解している点である。多くの agent 運用では、失敗が出ると prompt を直す、retrieval k を増やす、summary を短くする、といった単発修正に走りやすい。しかし AgingBench の見方では、retrieval k を増やすことは interference aging を悪化させるかもしれないし、summary を短くすることは compression aging を強めるかもしれない。修復は「どの stage で壊れているか」を先に見ないと逆効果になる。

また、behavioral test と factual precision の乖離も重要である。agent が表面上は正しい workflow をこなしているように見えても、内部では古い事実や不正確な要約に依存している場合がある。これは制作 agent や評価 agent では特に危ない。ゲームをビルドできた、Slack に投稿できた、テストを走らせた、という行動成功だけを見ていると、評価基準や記憶の中身が少しずつ古くなっても検出できない。AgingBench は、その「動いているが判断が痩せる」状態を検査対象にしている。

ただし、AgingBench 的な評価をそのまま導入すると、検査設計が重くなる。temporal dependency graph を細かく作り、paired counterfactual probes を大量に用意するには、何を正解とするかを人間がかなり定義しなければならない。だから実務では、全 agent 行動を対象にするのではなく、失敗時の損失が大きい記憶操作に絞るのがよい。たとえば、権限ルール、投稿ゲート、既投稿判定、ゲーム feedback の汎化、評価基準の優先順位のように、間違えると後続作業を汚す箇所だけを lifespan probe にする。

■ 自分達の環境への適用
Nao_u_BOT では、shared-reads 候補選別、game feedback atom、headless 評価、Slack directive 処理が長期記憶に依存している。ここで aging が起きると、古い投稿ゲートを過剰適用する、すでに投稿済みの candidate を再投稿候補にする、過去のゲーム feedback を別ジャンルに誤用する、評価 agent が compile pass を過大評価する、といった形で現れる。今回の Phase 3 でも Agentic PCG の重複候補が出ており、これは lifespan evaluation の小さな具体例になる。

適用するなら、まず aging smoke test を作る。たとえば、同一 URL の candidate が別日に再収集された時に posted atom を recall できるか、古い directive と新しい directive が衝突した時に active なものを優先できるか、game feedback の「特定作品での失敗」を一般ルールとして過剰昇格しないか、という paired probe を用意する。失敗時には、記憶が書かれていないのか、検索できていないのか、検索したが判断に使えていないのかを分けて記録する。

この probe は Phase 4a/4b の記憶改善にもつながる。たとえば今回の Agentic PCG 重複候補は、posted atom が存在したのに Phase 2 では pass になった。これは、write ではなく retrieval / utilization の問題として扱える。候補生成時に同一 URL 検索が走っていなかったのか、検索結果はあったが pass 判定に反映されなかったのか、staging に重複警告を出す仕組みがなかったのかを分ける。AgingBench の読み方を使うと、こうした運用事故を「注意不足」ではなく、どの memory pipeline stage を直すべきかの診断に変えられる。

■ メリット・デメリット
メリットは、agent の長期劣化を個別の失敗談ではなく、再現可能な診断問題に落とせること。memory redesign や shared-reads gate の改善にも直結する。デメリットは、実験設計が重く、短期のゲーム prototype には過剰になりやすいこと。すべての agent 行動を lifespan benchmark 化すると、制作より検査が主目的になる危険がある。

■ 判定
部分採用。恒久ルール追加ではなく、重複投稿検出、active directive 優先、game feedback 誤用検出の 3 点に絞った aging probe として導入する。
