■ 概要
『Magnet Ball』は、学生9人が2012年3月から2013年1月に作った、磁力で block を相手 goal へ撃ち込む2人対戦物理ゲームである。IGF 入選には届かなかったが、崩壊しかけた企画を締切約2か月前に捨て、制作手順を作り直して完成へ運んだ記録である。

最初の「Senses Project」で team は会議で案を吟味したが、比較用 prototype を作らなかった。最初の実装も特定の design question に答えない粗い mechanic 再現で、「見えない物を探す puzzle」の反復以上の可能性を示せなかった。それでも世界設定、concept art、dynamic music が先に育ち、弱い gameplay を捨てられなかった。二本目は一 level を完成させて「悪くはない」まで改善したが、scope と速度では締切に間に合わなかった。

残り約2か月で企画を reboot し、design と programming を担える2人を core prototyping team にした。4週間で8本の計画に対し実績は5週間で5本。Fighting Blind は戦闘の浅さと勝利条件不足、Detonator は試行錯誤頼み、Particle Racer は一週間で操作感と collision に届かず中止、Runner は速度 penalty がなく切迫感を作れなかった。

最後の Magnet Man は磁力を使う一人用 platformer だった。physics は puzzle には不正確だが、debug room で block を投げる行為は楽しかった。作者の兄の「goal へ撃っているようだ」という指摘から、締切前夜に対戦 soccer 型へ転換。翌朝、team は数時間前に生まれた Magnet Ball を最も楽しい案として選んだ。制作中も全 task を design question に変え、「stage を増やす」でなく「新しい状況を生む stage は何か」と問うた。奪い合いの膠着には stamina などを試し、競合中の block を爆発させた。結論は量産自体でなく、player experience の問い、遊べる回答、版間比較の連続が企画を救ったというものだ。

■ 内容分析
重要なのは、最初の prototype も存在したのに役立たなかった点である。何を否定できるように作ったかが差を生む。初版は playable、比較条件、判断基準を欠いた。二版目は一 level を通して、「悪くはないが入選を狙える強さも完成可能性もない」という撤退判断を支えた。prototype は企画への賛成材料ではなく反証装置でもある。

5本は単純な idea contest ではない。第一印象と持続する深さ、派手さと解法理解、着想の魅力と期限内の実装可能性、genre 名と実際の pacing の差を露出した。Magnet Man の転換は、仕様上の用途より debug 中に反復された自発的行動を重視した結果である。意図と実際の遊びのずれから game の目的を再定義した。

production 中の「design question 化」も有用だが、質問文だけでは改善しない。膠着の例には、playtest で同じ block を双方が離さない状態を発見し、stamina など複数案を比較し、爆発が停滞解消と match の変化を同時に生むことを確認する一連の evidence がある。旧 prototype をすべて保存し、physics tuning は新旧版を同時に遊んで感触を比較した。進捗を feature 数ではなく、解いた不確実性と player experience の変化で測るためには、問いと版と観察が一組で必要になる。

ただし、記事の評価は開発者自身による単一 project の回顧である。参加者数を伴う playtest protocol、retention、勝率、操作習得時間、版間の定量比較はない。IGF 入選にも失敗しており、「project を救った」は商業的・審査的成功ではなく、完成と学習の回復を指す。5本も独立条件を揃えた実験ではなく、作者、genre、実装成熟度が違う。したがって、週次 prototype が一般に品質を上げるという効果量は読めない。

人的・技術的な代償も大きい。週1本は授業外時間を消費し、翌週に学業を取り戻す burn-out を招き、後半ほど prototype の投入 energy が落ちた。2人への集中は速度を上げたが、残る7人は meaningful な仕事を持ちにくく、team ownership と両立しなかった。prototype 用の Stencyl 2.0 を本制作まで使い続けた結果、feature 追加による performance 低下、Flash での gamepad 対応、共同編集機能不在と manual merge に苦しんだ。高速に学ぶ基盤と、複数人で出荷する基盤の選択は別問題である。

■ 自分達の環境への適用
短期 game prototype では、着手時に feature 名ではなく一つの design question と撤退条件を書く。形式は「問い／比較する変更／固定する条件／観測／判定／次の問い」でよい。たとえば「dash を追加する」ではなく、「dash は危険へ近づく risk と離脱手段の両方を生むか」と置く。同じ enemy seed と arena で dash 無し・有りを保存し、接敵回数、被弾、離脱成功、入力の使われ方を headless trace で比較する。人間 playtest では、意図した駆け引きが見えたか、単なる万能回避になったかを観察する。自動指標を面白さの代理にせず、再現可能な差分検出へ限定する。

各 playable diff には build hash、seed、操作列、短い録画、変更前 build、観察メモを結び付ける。旧版は archive ではなく比較対象として保持し、「現在版が良い」という単独評価を避ける。physics、camera、movement のような感触は単一 score に潰さず、同じ入力列の state trace と、交互に触った時の主観差を並べる。新規実装が問いに答えなければ、code が増えても iteration 完了とは数えない。

debug play から生じる逸脱も記録する。設計された objective と別に、繰り返し行われた操作、想定外の組合せ、見ていて反応が強かった瞬間を `emergent_action` として残す。Magnet Ball のような転換は偶然を待つのでなく、「何をしている時に作者自身が目的を忘れて遊んだか」を観測することで拾いやすくなる。ただし一度の笑いや novelty だけで pivot せず、最小の goal、対立、終了条件を足した版で再確認する。

制作サイクルには二つの gate を置く。探索 gate は、一人または極小 team が一問に答える最短実装を選び、code quality より反証速度を優先する。production gate は、採用案の後に runtime、input device、collaboration、asset pipeline、testability を再評価し、仮 tool を継続するか移植するかを決める。移植費だけでなく、残り期間の performance risk、共同編集費、platform 対応費を比較する。探索の sunk cost を production 基盤の採用理由にしない。

burn-out 対策として「週1本」を固定規則にしない。問いごとに timebox を置くが、prototype 本数ではなく、判定可能な build が何本できたか、回復時間を含めた総所要時間で見る。制作に参加しない役割には、idle のまま ownership を約束せず、playtest、観察記録、比較 review、次段階の asset spike など、現在の問いに効く仕事だけを明示する。仕事を作るために未確定案の content を先行生産しない。

■ メリット・デメリット
メリットは、会議で「良さそう」を競う状態を、遊べる差分と撤退可能な判断へ変えられることだ。design question は task を player experience へ接続し、過去版保存は感触の変化を再検査可能にする。期限内に core control へ届かない prototype 自体を scope warning と読むこと、debug 中の自発行動から本来の核を発見すること、停滞解消案を複数比較することは、短期制作へ直接移せる。

デメリットは、高速化を本数目標にすると疲労と粗製濫造を生み、designer-programmer へ判断権が集中することだ。小 team で成立した探索過程は大 team にそのまま拡張できない。問いの書き方が誘導的なら欲しい答えだけを確認し、playtest が少なければ novelty を持続的な深さと誤認する。旧版保存も build 条件や操作が揃わなければ比較 evidence にならない。仮 tool の速度は、採用後の性能・入力・協働負債と交換される。

■ 判定
部分採用。design question、判定可能な playable diff、旧版との比較、観察 evidence を一組にする制作単位は採用する。一方、週次本数、2人への恒常的集中、prototype tool の継続利用は標準化しない。headless trace で再現可能な挙動差を取り、人間 playtest で理解・感触・反復動機を確認し、探索 gate の後に production 基盤を別判定する。完成した feature 数ではなく、重要な不確実性を何件減らしたかを進捗として残す。

■ URL
https://www.gamedeveloper.com/design/magnet-ball-a-mega-postmortem-how-learning-and-adapting-on-the-fly-saved-an-ambitious-student-project
