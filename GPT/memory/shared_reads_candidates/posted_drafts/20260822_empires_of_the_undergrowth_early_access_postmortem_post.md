■ 概要
『Empires of the Undergrowth』は、地下に巣を掘って女王と幼虫を養い、地上で食料を集め、敵集団や他の生物と戦う single-player RTS である。ドキュメンタリー風 mission と改造蟻を巡る科学者の物語を重ね、2014年の着手、2017年末の Early Access、2024年6月の正式版までを小規模 team が作り続けた。この記事は、mobile 向け企画と独自 engine から始まった作品が、PC/Unreal Engine 4 への転換、操作系の発見、二度の Kickstarter、6年半超の Early Access を経て45万本超を売るまでに、何を捨て何を残したかを振り返った記録である。

初期案は Dungeon Keeper 型の地下建設と、陣営が自動で押し合う tug-of-war を組み合わせた mobile game だった。多数の unit と影を端末で軽く動かすため独自 engine を一年以上作ったが、関心は広がらなかった。PC へ移ると、仕事を指定して蟻が自律処理するだけだった系に、右クリック地点へ蟻を集める call-to-arms が加わる。これが複数の pheromone marker と、女王を起点に蟻が往復する trail へ発展した。個体を box 選択して即応させる通常 RTS ではなく、colony の行動傾向へ間接的に働きかける。蟻らしさと操作上の差別化が同じ仕組みから生まれ、作品の DNA になった。

最初の Kickstarter は目標 £15,000 に対して £8,438 で未達だった。開発側は、別 campaign、multiplayer、level editor など過大な stretch goal と、遊べる prototype/demo がなかったことを主要因に挙げる。好意的な映像反応だけでは、未知の team が fun loop を完成できるという信用にならなかった。その後、投じた労力への愛着を認めて独自 engine を廃棄し、graphics、柔軟性、C++ 経験から UE4 を選ぶ。旧 asset の demo でも見栄えは改善し、feedback と動画配信が発生した。目標を £10,000 に下げ、追加報酬も個別 creature へ絞った二度目は目標の180%を集めた。核心は engine 名ではなく、「大きな約束」から「中核 loop を触れる現物」へ信用の根拠を変えた点にある。

Early Access は story を五つの完成 tier に分け、最初の二つで開始した。大規模更新は2019年4月、2022年6月、2024年6月と間隔が長い。小規模 team では Windows 32/64bit、Mac、Linux の package 作成が重く、購入者の多数も頻繁だが粗い build より完成 package を期待すると判断したためである。ただし optional beta、熱心な player の focus group、専任 community manager、newsletter と vlog、半年ごとの roadmap、既存 asset で作る短い extra level、時折の surprise を組み合わせた。製品版、実験版、進捗 communication の cadence を分離したから長期化に耐えられたのであり、「更新間隔を長くすれば品質が上がる」という話ではない。

■ 内容分析
最も価値があるのは、作品固有性を題材や feature 数ではなく、player が世界へ命令する単位から説明できる点だ。蟻でも操作が通常 RTS と同じなら見た目だけの置換になり得る。本作は個体の即応性を捨て、marker、trail、巣への往復、反応速度の tuning で「多数の自律個体から成る colony」を動かす感覚を作った。player の意図は通るが瞬時には反映されず、予測と配置が遊びになる。操作上の friction が thematic かつ strategic な情報へ変換されている。

技術転換も、独自 engine 対既製 engine の一般論ではない。独自 engine は mobile で多数の蟻と影を処理する初期仮説には合理性があった。しかし platform が PC へ変わり、最大 risk が performance から「面白さと完成可能性の証明」へ移った後も保持され、sunk cost になった。UE4 の価値は万能性ではなく、demo 到達時間、見栄え、team の C++ 能力に合ったことにある。基盤は過去の投資額ではなく、現在の最大不確実性をどれだけ早く潰せるかで再評価すべきだ。

Kickstarter の前後比較も強い。二度目は goal、stretch goal、engine、demo、既存の online momentum が同時に変わっており、成功を demo 一要因へ帰属する厳密な実験ではない。それでも、第一回は「将来できること」の列挙、第二回は「今できている loop」と狭い追加範囲の提示になっている。funding の成否だけでなく、公開物が設計仮説、技術実行力、scope control を一つの evidence に束ねた点が重要である。

一方、Early Access 戦略の評価は慎重に読む必要がある。記事は最終45万本超という到達点を示すが、更新ごとの retention、wishlist、refund、forum sentiment、beta 参加率、community manager の費用対効果は出していない。major update 間隔が三年以上空いても成功したのは事実だが、同じ cadence が別作品でも有効だという比較証拠ではない。また当事者による成功後の回顧なので、生存した判断が整然とした因果へ見えやすい。本人たちも back-end 構造と coding standard に不満を残し、小作で経験を積んでから作り直す方がよかった、multiplayer は初期から基盤を組むべきだったと認めている。長期継続は技術 debt を正当化せず、後付け困難な要件を先送りした代償も残った。

■ 自分達の環境への適用
ゲーム prototype では、最初の gate を「入力一つで題材固有の反応が出るか」に置く。蟻でいう pheromone marker に相当する、player intent と世界側の自律挙動が衝突する最小 loop を一画面で作る。headless 評価は勝率だけでなく、入力から状態変化までの遅延、unit/actor の分散、軌跡の多様性、目標達成率を記録する。録画では説明なしでも通常操作との差が見えるかを見る。この gate を越えない段階で campaign、meta progression、大量 content を増やさない。

基盤選定には「現在の最大 risk」を明記する。描画負荷、iteration 時間、配布 build、asset pipeline、network 要件を表にし、独自実装が支払う cost と、実際に除去する risk を対応させる。platform や企画が変わった時点で再判定し、既存 code 量は採用理由から外す。特に multiplayer のように後付けで state authority や同期モデルを変える機能は、将来候補のまま曖昧にせず、最初から設計対象にするか scope 外と確定する。

公開時は二度目の Kickstarter の構造を小さく再現できる。30–90秒で core loop を触れる build、意図を説明する短い映像、実現可能な次の一変更を一組にし、反応を「好意的コメント」だけで測らない。再プレイ、途中離脱、入力失敗、異なる遊び方、具体的な不満を残す。promise の大きさではなく、現物が次の投資時間に値するかを評価する。

長期運用を採るなら cadence を三層に分ける。安定版は品質 gate を通った時だけ、実験版は希望者向けに短周期、進捗情報は変更が少なくても定期的に出す。extra level に相当するものは既存 mechanic/asset を再構成し、本編を遅らせずに新しい組合せを検証できる場合だけ作る。community feedback は raw 要望をそのまま backlog にせず、再現条件、player type、対象 build、設計意図との衝突を添えて開発入力へ変換する。小規模 team では専任一名を即採用する話ではなく、開発者の集中を守りつつ反応を失わない責任枠を明示することが先になる。

■ メリット・デメリット
メリットは、入力の発見、技術撤退、資金調達、公開運用が一つの時系列でつながり、方針転換の前後を比較できることだ。特に、題材固有の操作を最小変更から育てること、demo を信用の evidence にすること、安定版と beta と communication を別 cadence にすることは、小規模制作へ移しやすい。失敗を隠さず、独自 engine への愛着、過大 scope、技術 debt、multiplayer 先送りまで書いている点も判断材料になる。

デメリットは、7年以上を耐えた成功例ゆえに長期化自体を美化しやすいこと、更新戦略の定量データと反実仮想が足りないこと、複数変更が同時に起きたため個々の効果を分離できないことだ。45万本という結果も、community 運用だけでなく題材、Steam 市場、content creator、publisher、時間による認知蓄積の影響を含む。独自 engine の廃棄は常に正解ではなく、network requirement のように既製 engine 移行だけでは解消しない構造問題もある。

■ 判定
部分採用。入力から題材固有性を証明する playable gate、現在の risk に基づく技術再判定、demo-first の信用形成、安定版・実験版・情報発信の cadence 分離を採用する。長い更新間隔や長期 Early Access そのものは模倣しない。定量指標と撤退条件を先に置き、後付け困難な要件は初期に採否を確定する。

■ URL
https://www.gamedeveloper.com/design/postmortem-how-empires-of-the-undergrowth-came-together-in-over-7-years-of-early-access
