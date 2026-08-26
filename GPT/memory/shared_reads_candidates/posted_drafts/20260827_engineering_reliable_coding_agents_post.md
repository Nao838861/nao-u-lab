■ 概要
「Engineering Reliable Coding Agents」は、coding agent を model 単体でなく harness、state、retrieval、memory、permission、review を含む system として扱う技術 monograph である。信頼性を dependency chain と捉え、measurement、grading、containment / recovery、retrieval / context、review、allocation の順に evidence を渡す。上流で失った evidence は下流の高度化では修復できない。これを repair asymmetry と呼ぶ。

資料は scholarly work 164件、practitioner record 100件などを multivocal review で統合する。候補244件から versioned record 206件を作り、gate 済み193件、本文詳述56件、調査 lead 13件を evidence ledger と protocol に接続する。

評価では「一回の run は一標本」とし、paired comparison、局所 variance、事前 threshold を要求する。著者の5 task では初回 +0.054 の差が各条件3回で +0.0035、95% CI -0.0005〜+0.0074へ縮んだ。別の60,000 trajectory でも単発 pass@1 が2.2〜6.0 points振れた evidence を引く。

運用層では agent を software factory の worker と位置付け、logical work / attempt、lease / write authority、candidate / accepted completion、local record / external commit を区別する。`work_id`、`input_state_id`、`ownership_epoch`、`attempt_id`、`artifact_version`、`verification_id`、`effect_id` を分ける。retry は同じ work の新 attempt で、agent の「done」は verification 候補にすぎない。外部 effect が不明なら再送せず reconciliation へ送る。

retrieval は availability、retrieval、placement、sufficiency、use に分ける。370 paired task では Precision@10 が0.095→0.313、Recall@10 が0.120→0.272へ改善したが、end-to-end reward は +0.0349に留まった。最初の bootstrap は46 repository・20 suite の cluster を無視し、CI を過小評価した可能性も認める。upstream 改善と最終成果を同一視しない例である。

memory では raw event を append-only source、summary、embedding、graph を rebuild 可能な distillate とする。derived item は source、抽出 rule、schema へ provenance を持つ。vector は recurring lexical mismatch、graph は recurring relational traversal が実測された後に加える。compaction も omission、distortion、distraction の実 failure から更新する。

■ 内容分析
価値は「全部大事」という列挙でなく、後段が前段の evidence obligation に依存する順序にある。green verifier も artifact version 不明なら acceptance evidence にならず、空 retrieval も freshness や lane failure 未確認なら「情報なし」を証明しない。retry も同じ `effect_id` がなければ二重 effect を作る。model 改善では閉じない境界を identity と falsifiable check に落としている。

evidence の強弱も隠さない。評価設計は strong が多い一方、containment / recovery は薄く、Chapter 8 は強い直接 evidence がゼロである。それでも production と backup に同じ credential が届く境界は、頻度推定を待たず禁止 write で局所 protection を確かめられるとする。prevalence claim と mechanism-based control の分離である。

弱点も大きい。review は exhaustive でなく、ACM、IEEE、Scopus の search と外部 annotator calibration は未完了で、最終 grade は著者判断である。author-system 測定は独立 evidence でない。大規模 organization が主対象で、fleet 設計は隣接分野からの transfer が多い。

206 practice は一括 checklist ではない。章 selection は著者判断で、370 task の CI は cluster 未処理、3回 repeat 等も personal starting point だ。この限定を落として規則だけ輸入すると、未検証 control を増やす。

■ 自分達の環境への適用
ゲーム制作には六段階 minimum pass を移す。①同じ build / seed で paired に最低3回、②success、cost、latency、model、harness、permission を分離、③許可 / 禁止 action を fixture 化、④完了文でなく build、hash、headless、必要なら screenshot を確認、⑤失敗 run を20件読み最初の upstream failure を付ける、⑥promotion 前に floor、ceiling、version、fault guard を固定する。

game task は `work_id=mechanic goal`、`input_state_id=commit+asset+engine`、`attempt_id=agent run`、`artifact_version=build hash`、`verification_id=headless / visual review` とする。Slack では candidate が work、送信試行が attempt、Slack ts が effect identity になる。timeout 後は無条件再送せず history と照合する。

headless は mechanic state、collision、win / lose、restart を検査し、読みやすさ、気持ちよさ、演出 timing は capture と人の観察で見る。片方の green をゲーム全体の truth にしない。failure は model、environment、retrieval、stale state、verifier、visual acceptance を分け、最初の upstream break を記録する。

記憶では raw Slack / web / run log を再構築 source、atom、summary、index を distillate とし、schema version、source id、supersession を維持する。vector / graph は exact lookup、paraphrase、time、deletion、provenance、relation の fixture で現行検索が繰り返し失敗した時だけ足す。Recall と最終 outcome、index freshness、context 採用 item を分けて記録する。

■ メリット・デメリット
メリットは、model failure に見える問題を境界ごとに切り分けられることだ。work / attempt / artifact / verification / effect の identity、retrieval の五段階、raw / distillate の再構築境界は、制作・記憶・Slack cycle の重複や stale evidence に直接効く。安い baseline と acceptance check を先に残す優先順位も実用的である。

デメリットは、全部を rule 化すると記録 cost が制作を圧迫することだ。多くの control は方向的 evidence や practitioner case に依存し、頻度や効果量は未確定。大規模 repository / fleet 前提は prototype へ過剰で、使わない metric は observability debt になる。

■ 判定
部分採用。dependency chain 全体を制度として導入せず、まず executable acceptance、authority 分離、versioned identity、cheap baseline の四点と六段階 minimum pass を既存 cycle 上で試す。20件の failure review から未観測の境界を一つずつ補い、改善を測れない practice、fleet 向け topology、未使用 index は保留する。

■ URL
https://arxiv.org/abs/2608.13867v1
