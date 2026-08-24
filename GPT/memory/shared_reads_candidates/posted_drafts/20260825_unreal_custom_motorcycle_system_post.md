■ 概要
Ihor Fridman が Unreal Engine 5 で一年かけて独自 motorcycle core を作った記録。対象は linear road drama で、motorcycle がほぼ全編に出る第二の主人公である。Chaos Vehicles を二、三か月調整し、四度作り直して独自化した。理由は品質不足ではなく、四輪の A-to-B 移動を得意とする vehicle model と、物語中の二輪が通る state の不一致だった。

既製 model 上で gyroscopic effect、tire behavior、suspension response を補正すると、各 hack は単独で働いても相互作用が増え、物理ではなく補正間の干渉を debug する状態になった。二輪は四つの接地点を持つ車と違い、mass distribution が転倒するかを決める。低速では inverted pendulum として倒れ、記事では約7〜8 m/s、25〜30 km/h から自己安定域へ入ると説明する。安定は単純な wheel gyroscope だけでなく、steering geometry、mass distribution、tire behavior の組合せから生じる。一定の stabilizing torque は駐車場から高速まで均一に立たせ、速度域の遷移を消す。独自 model では三領域を個別 script にせず、同じ力学から創発させた。

決定打は「走行していない state」の列挙だった。kickstand 駐車、駐車中に倒される、走行中の転倒、平地や斜面で横倒しになって滑る、人が横から起こす、engine off のまま足で後退、惰性走行、bump start が必要だった。rider も見た目の mesh ではなく、位置・体重・動作が bike へ力を返す同一 mechanical system とした。collision は self-driving car 分野の、衝突後に反応するのでなく直前の scene 状態から physics を準備する発想を移植したという。

独自化で得た具体例が failure state である。転倒後に fade-out と respawn をせず、player が近づいて掴み、button を連打し、自然減少する gauge に抗して重い車体を起こす小 event にした。slide も速度を停止距離 curve で減衰する方式を捨て、slope が引く力と surface resistance のどちらが勝つかで決めた。同じ rule から、平地では数 m で止まる、緩斜面では長く滑って止まる、一定角度を越えると平坦部まで止まらない、という差が出た。静止摩擦を動摩擦より大きくした結果、静止した車体は少し急な斜面まで耐えるが、一度押されると滑り続ける狭い角度帯も生じた。

車体は転倒時に実際に突出する箇所で支え、地面側を向いた handlebar は起こしても勝手に中央へ戻らない。wheel は Pacejka model を出発点に大幅改変し、animation blueprint で欠けた物理を演じるのでなく、physics の実値を animation へ渡した。ground、contact、mass、rest state は肉眼で debug できないため、開発年のかなりの部分を診断表示へ投じた。著者の結論は、state の大半が移動なら engine 標準を使い、そうでなければ tuning では model の scope を越えられない、という条件付きの独自化である。

■ 内容分析
最も使える判断法は、component の機能表でなく object の全 lifecycle を先に列挙することだ。標準 system が扱わない「横倒し」「人が押す」「動力なし」「持ち上げる」が作品の中心なら、例外 patch は周辺機能ではなく主要 state を隠している。補正数が増えたこと自体より、補正同士を直す時間が元 model を理解・検証する時間を上回った点が境界の徴候になる。

もう一つの核は、正しい model が関連挙動をまとめて生むことだ。slope と resistance の一規則から停止距離、滑走継続、静止／動摩擦の履歴依存が出る。player が斜面から結果を予測でき、同じ原因が複数場面を説明するため、game feel の一貫性になる。一方、button 連打による引き起こしは、重量感と頑固さを短い interaction へ翻訳した意図的な演出である。記事は、どちらを model から出し、どちらを design するかを分けている。

診断 tool を simulation の前に作るべきだという反省も重い。独自 core は engine の profiler や debug view が自分の意味論を説明してくれない。1 cm の接触誤差、極低速の移動、認識した ground normal、center of mass、rest 判定を可視化しないと、animation・shadow・collision のどこが原因か切れない。「最後の1 cm は最初の1 m より高い」という表現は、動く prototype と信頼できる全状態 system のコスト差を示している。

ただし、これは比較実験ではなく一人の開発記録である。Chaos で期待通りにならなかった原因を著者自身も設定や理解不足の可能性込みで認めており、独自 core の精度、frame cost、platform 差、再現性、既製方式との blind user test は示されない。7〜8 m/s の安定域や bicycle 研究の説明も、この game の評価結果ではない。collision preparation の具体 algorithm、Pacejka 改変、suspension、two-stage damper の式も公開されず、再実装可能な技術仕様というより、model boundary を見抜く設計資料として読むべきだ。

■ 自分達の環境への適用
物理 prototype では、標準 component を触る前に state matrix を作る。行に停止、始動、低速、中速、高速、空中、衝突、転倒、斜面静止、斜面滑走、復帰、外力介入、動力喪失を置き、列に player input、期待挙動、標準 model の対応、必要 patch、診断 signal、失敗時の遊びを置く。主要 state の三割以上が scope 外、または patch 同士の干渉が二回以上再発した時だけ、独自 core の spike を比較対象にする。独自化を「より本格的だから」で選ばない。

headless probe は同じ初期条件と seed で、速度域を跨ぐ perturbation、傾斜角 sweep、surface resistance、mass shift、転倒姿勢、起こし中の入力中断を再生する。測定は転倒までの時間、姿勢収束、停止距離、滑り出し角と停止角の hysteresis、contact 数、penetration、energy 増加、rest 誤判定、frame cost。標準＋最小 stabilizer、patch 追加版、独自 spike を並べ、挙動誤差だけでなく debug 時間と例外数も比較する。

game design では failure を即 reset せず、情報・手触り・選択へ変換できるかを一 state だけ試す。転倒後の復帰なら、連打そのものを模倣せず、「重さを感じる」「途中で止めると戻る」「再挑戦に小さな緊張がある」という体験条件を置く。操作時間、離脱率、再失敗時の苛立ち、物語 pacing を測り、頻発する事故では短縮や skip を用意する。failure play は毎回楽しいとは限らず、希少性と文脈が必要である。

診断 overlay は実装後の補助でなく vertical slice の成果物に含める。ground normal、contact patch、center of mass、force、velocity、state transition、rest threshold を記録し、動画と数値 trace を同じ run id で結ぶ。成功 run だけでなく「正しそうに見える誤り」を regression fixture にする。これにより、感覚の違和感を後から説明可能な仮説へ変えられる。

■ メリット・デメリット
メリットは、作品固有の非走行 state を core から一貫して扱えること、failure を物語と遊びへ接続できること、少数の力学 rule から予測可能な派生挙動を得られることだ。rider、bike、surface を同じ system として扱えば、animation で物理不足を隠す箇所も減る。state 列挙は、既製か独自かの議論を好みから検査可能な scope 比較へ変える。

デメリットは非常に大きい。一年、四回の破棄、collision resolution、tire、suspension、animation integration、専用診断を一体で引き受け、engine 更新や platform 最適化の恩恵も自動では得られない。独自 model が「正直」に見えても parameter 同定が悪ければ別種の fake になる。物理的に妥当な転倒や復帰が、操作頻度、accessibility、pacing 上の正解とも限らない。移動が主目的の vehicle なら、二週間程度で済む標準 system と stabilizer の方が記事自身の推奨である。

■ 判定
部分採用。motorcycle core の再実装ではなく、全 state 列挙で標準 model の scope を判定する方法、patch 間干渉を独自化 trigger にすること、failure state と診断表示を最初から設計することを採る。独自化は state coverage、挙動一貫性、debug 時間、frame cost を標準案と同一 fixture で比較してから決める。定量証拠のない成功談は一般則にせず、境界発見の checklist として使う。

■ URL
https://80.lv/articles/creating-a-custom-motorcycle-system-for-unreal-engine-5
