■ 概要
『桜花弾幕 / Sakura Danmaku』の postmortem は、AI と人間の能力境界に合わせて作品・技術・検証方法まで設計した八日間の制作記録である。完成物は六 stage、各 stage の midboss と boss、New Game+、17曲の procedural soundtrack を持つ東方風の縦弾幕で、外部 asset や build を必要としない単一の `index.html` である。初日に Stage 1 とルール一式が動き、残る content と balance が制作時間の長い tail になった。

作者が見いだした境界は「AI は個々の要素に強いが、要素同士と最適化する player の相互作用には弱い」というものだった。AI は弾幕・楽曲の生成と個別案の検査を担い、人間は目標体験からルールを逆算し、支配戦略、難易度、視認性、全体の一貫性を判断した。

象徴的なのは item 回収である。prototype では item が速く落ち、拾い損ねやすかった。AI は回収半径の拡大や自動回収 line の引下げという局所修正を提案した。作者は代わりに、射撃と focus を両方離すと移動速度が1.6倍になる新しい動詞を導入した。上方へ dash して回収し、危険になる前に戻る行動へ、素早い回収の score multiplier と100万点ごとの残機を接続した結果、欠点が risk/reward の中核になった。graze で8秒間の強化を準備し、通常なら死ぬ spell を突破する経済も同じく人間側で設計された。

product design では、無名の新作は面白さを証明する前の摩擦に耐えてもらえないと判断し、install、設定、tutorial、事前の難易度選択を置かなかった。これが単一 HTML、左右両手で使える入力、HUD と効果音による自己説明、New Game+ へ連鎖した。content は AI が生成したが、Stage 4 boss が Stage 3 より弱い、背景 lamp と敵弾を見分けにくい、Stage 5 の spawn が上方回収と衝突する、spell 破壊点が総 score の94%を占める、といった全体上の誤りは人間が棄却した。

技術側も同じ境界に合わせている。Canvas2D と Web Audio を使い、画像は primitive 描画、音は実時間合成、曲は小さな JavaScript data と synth にした。text だけで生成・修正でき、asset と code の意味がずれる経路を減らすためである。simulation は固定 1/120 秒 tick と seeded RNG で決定的にし、無入力の stage opening 全体を hash 化する golden fingerprint harness をAIが作った。refactor 前後の field が byte 単位で一致するかは機械検査へ渡し、面白さ、摩擦、全体の調和は人間が通しで見る。作者の結論は、AI が局所的な生成と検証を広く担えても、作品を system として読む仕事は残る、という分業である。

■ 内容分析
この事例の重要点は、「code はAI、design は人間」という職種名による分割ではない。同じ design や verification の内部でも、単体で閉じる判断と相互作用を読む判断に切り分けている。弾幕一個の形、曲一つの候補、refactor の挙動保存は局所 task にできる。だが、上方回収を促す score が中段 spawn と衝突するか、spell 得点が他の稼ぎを無意味にするか、背景の意匠が敵弾の視認を奪うかは、複数 subsystem と player の最適化を同時に見なければ分からない。この分類は、生成速度が上がった後に bottleneck が「何を作るか」から「組み合わせた時に何を壊すか」へ移ることを具体的に示している。

stack 選択も単なる Web 礼賛ではなく、仕事を model が扱いやすい text へ寄せた設計と読める。外部 asset と GUI editor を排除すれば、差分と依存を一つの媒体で追跡できる。ただし複雑な animation、手描きの固有性、engine の物理・editor・platform support が重要な作品では、boilerplate をAIが書けることだけを理由に engine を捨てると、保守や表現力で逆に高くつく。

golden fingerprint の位置付けにも注意が要る。固定 tick と seed は再現不能な差分を減らし、無入力 opening の hash は「この refactor が既知の軌道を変えたか」を高感度に検出できる。しかし同一 hash は正しさではなく、過去と同じであることしか示さない。無入力で通らない回収 dash、focus、graze、bomb、被弾後の状態、score の支配戦略は覆わない。意図した変更では fingerprint の更新が必要で、その時に悪化を基準値として承認する危険もある。deterministic harness は contextual playtest の代替ではなく、探索範囲を「変わっていない部分」と「判断が必要な部分」に分ける道具である。

記事は作者一人、一作品の自己報告で、AI を使わない比較制作、工数、生成案の採用率、player 数、完走率、死亡地点、難易度曲線、視認性 test を欠く。「AI の推薦と最終選択がほぼ一致した」という観察にも盲検比較はない。六 stage と17曲は throughput の証拠だが、面白さの証明ではない。AI 分業の普遍評価ではなく、作者の介入点と実際の不整合を開示した一次 postmortem として使うべきである。

■ 自分達の環境への適用
自分達の prototype では、作業を「生成」と「レビュー」に二分するだけでなく、局所検査と interaction 監査の表にする。AI に渡す局所 task は、弾 pattern、enemy archetype、曲 data、HUD 部品の生成と、schema、範囲、衝突、到達可能性、決定性の検査である。人間側には、難易度の単調性、危険と報酬の交換、画面上の識別、score の集中、複数 mechanic の死に組合せ、最適化後に残る選択肢を置く。各 content を単体で pass させた後、必ず既存 system との組合せ test を通す。

headless 評価には固定 tick と seeded RNG を採用しつつ、無入力 fingerprint だけで終えない。代表的な入力 trace と、回収優先、graze 優先、安全優先など複数 policy を replay し、初被弾時刻、画面内弾数、回避可能領域、stage 別 damage、score 内訳、残機収支を保存する。refactor では state hash の一致を見て、balance 変更では metric の分布と意図した差を比較する。特に一つの行動が総 score の大半を占める、前 stage より boss が弱い、報酬を取りに行く経路へ回避不能 spawn が出る、といった記事中の失敗を regression property に変えられる。

制作サイクルは、初日に rule-complete な一 stage を作り、内容量を増やす前に支配戦略を観察する順序にする。最初の通し play では「局所的に悪い箇所」ではなく、どの rule が他の rule を無意味にしたかを記録する。AI の提案が半径拡大のような parameter 調整に偏った時は、症状を消す案と、症状を新しい risk/reward に変える案を分けて出させる。その後も最終採否は、target experience と全体 economy への接続で決める。

記憶システムでも、atom 単体の schema、重複、出典、hash は deterministic に検査し、複数 atom の矛盾、候補を残す価値、ゲーム設計への転用は contextual review に残す。自動検査の通過を「記憶として有用」と混同せず、機械的事実と制作上の判断を evidence と共に分離する。

■ メリット・デメリット
メリットは、AI の得意不得意を固定した職能論にせず、task ごとに検証可能な境界へ落とせること、生成量が増えた後の coherence debt を明示できること、deterministic simulation により機械的回帰を安価に隔離できることにある。text と procedural data を中心にすれば差分追跡と再生成が容易で、小規模 prototype の試行速度も高い。欠点を parameter で隠さず、新しい動詞と economy に変える視点も mechanic 発見に使える。

デメリットは、一人の成功例を「AI は局所、人間は全体」という不変則にしやすいこと、全体判断を人間の直感という未計測の箱に残しやすいこと、単一 file と procedural 表現を目的化すると作品固有の美術・engine 機能・保守性を失うことだ。fingerprint は既知挙動の固定化にもなり、content の大量生成はレビュー量と組合せ数を増やす。生成時間が短くても、六 stage の balance が長い tail になった事実は、coherence 監査を先送りすると人間側の負債が膨らむことを示す。

■ 判定
部分採用。AI を局所生成・検査へ、人間をルール相互作用・支配戦略・全体 coherence へ分け、deterministic replay と計測値で接続する制作方法を採用する。単一 HTML と Web stack は普遍解とせず、text 差分と即時配布が主要価値の時だけ選ぶ。次の弾幕系試作では、一 stage の rule-complete slice、複数入力 trace、score 内訳、難易度順序、視認性確認を小さな検証単位として導入する。

■ URL
https://itch.io/devlog/1547545/ai-did-the-content-i-did-the-rules-a-bullet-hell-on-the-jagged-frontier.amp
