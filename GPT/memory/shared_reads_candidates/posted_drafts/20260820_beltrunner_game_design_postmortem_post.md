■ 概要
BELTRUNNER は、Asteroids 型の thrust-and-drift と岩の分裂を土台に、番号付き gate を降順に通る race へ変形した GMTK Game Jam 2026 作品である。約1,300行で、16 wave を完走できる小品として閉じている。出発点は中央の太陽を回る固定軌道上の番号付き標的を撃つ orbital shooter だったが、標的が「座った鴨」になり、Asteroids の面白さは射撃より予測不能な岩を避ける運動にあると判断して破棄した。ただし番号、強調表示、連鎖という部品は残し、Pilotwings や Wave Race 64 の gate race へ組み替えた。

導入は Donkey Kong '94 型の masquerade で、wave 1 はほぼ純粋な Asteroids として始まる。最初の命中で race clock が現れ、岩を片付けると中央に black hole が開く。wave 2 から初めて 5→4→3→2→1 の gate が出て、本当の遊びが開示される。既知の操作を先に身体へ入れ、新規規則の理解と操縦学習を同時に要求しない構造である。life はなく、gate 通過で増え、衝突で減る「時間」だけを生存・進行・報酬の共通資源にした。

16 wave は4 act×4 wave。Act I は pathfinding、II は一方向 gate による routing、III は回転 gate による timing、IV は両者の複合を扱う。各 act は「導入→練習→練習→締め」で、新規要素が出た時だけ短い説明を表示する。最初の playtest では円形 gate の横向き通過が見た目に反したため楕円へ変更した。つまり難度曲線は数値上昇ではなく、見分けられる課題を一つ加え、三回使わせる教材列として書かれている。

乱数は岩の出現辺・方向、gate 配置、power-up 散布まで単一 seed stream に集約される。同じ入力なら再起動後も同じ course になり、学習、replay、調整を同じ条件へ固定できる。drop も確率ではなく8撃破ごとに TIME→INVINCIBLE→STOP と循環する。さらに、強調された岩を順に割ると root・third・fifth・octave の声部が積み重なり、順番を誤ると歌声が消える。成功列を画面説明でなく「音が成立／欠落する」変化で伝え、完遂時だけ時間・無敵・停止を同時に得る EXTRA を出す。

制作後半では、画面端を最短経路として信頼できる real torus、凹 polygon と回転 ellipse の collider、ellipse 対 polygon の narrow phase、接触法線に沿う弾性反射を engine Jinks 側へ一般化した。作者の結論は、既知の運動を捨てず別の目的へ接続し、有限の course と決定論で学習を累積させ、作品が要求した基盤機能だけを engine へ戻すことで、短いコードでも「覚えて上達し、終われる」arcade game を作れるというものだ。

■ 内容分析
記事の強みは mechanic の列挙ではなく、没案から残す部品を選んだ理由が追えることにある。固定軌道を捨てたのはテーマとの不一致ではなく、回避判断が消えて入力の価値が薄くなったからである。その上で番号と連鎖だけを race へ移した。prototype の評価を「全採用／全破棄」にせず、面白さを生んだ動詞と再利用可能な表現へ分解している。

masquerade と4 wave cadence は別々の tutorial 技法ではない。前者は最初の認知負荷を既知操作へ逃がし、後者は新規規則を一度見せて終わらせず、失敗・認識・予測の三段階へ時間を与える。しかも wave data は前 wave との差分だけを書くため、「何を教える回か」が実装上も可視化される。内容を増やすより、課題の変化点を明確にする設計である。

決定論も単なる debug 用固定 seed ではない。course を場所として覚えられること、replay を再現できること、power-up の期待が計画へ変わることを同じ方針で束ねている。一方で「seed を変えれば同じ規則から等しく公平な course が出る」という主張は記事内で統計検証されていない。配置 generator が袋小路や局所的な難度偏りを作らない保証はなく、一つの良い seed を磨いた成果と generator の健全性は分けて読む必要がある。

評価証拠も controlled experiment ではない。最初の playtest が円から楕円への変更を生み、長時間プレイが太い円 collider や oversized AABB の不公平を露呈した、という反復設計の事例である。16 wave の完走率、各 act の失敗率、secret 発見率、seed 間分散は示されていない。したがって「4回なら教えられる」「音響なら発見される」を一般則にせず、検証すべき仮説として持つのが妥当だ。

特に優れているのは、見た目・規則・物理の契約を揃えた点である。楕円 gate を描いても collider が円や AABB のままなら、player は routing ではなく不可視の当たり判定を学ぶ。画面端が近道なら描画と接触も torus でなければならない。mechanic の面白さ以前に、表示から予測した結果が返ることを公平性の基盤に置いている。

■ 自分達の環境への適用
短編 arcade prototype では、まず8 encounter を2 act×4にして試せる。各 act の一行目に新規規則、残りに同規則の空間・速度・組合せ違いを置き、data file には前 encounter との差分だけを記録する。測るのは説明文を読んだかではなく、初見失敗位置、同型二回目の成功率、三回目の事前回避、act 終了時の再現成功である。三回使っても行動が変わらなければ、説明量より affordance または feedback を疑う。

headless 評価には seed、build hash、入力列を一組で保存する。固定 seed 3本で rule change 前後を比較し、さらに生成 seed 50本程度で completion、衝突数、最短経路長、gate 間安全余白の分散を見る。固定 course 上の上達と seed 一般化を別指標にすれば、暗記による成功を操作理解と誤認しにくい。音響 secret は headless だけでは評価せず、発音 event と正誤列を log し、人の playtest で「説明なし発見率」と誤操作後の復帰を確認する。聴覚へ依存できない環境には、和音と同じ情報を持つ控えめな視覚変化も用意する。

engine への昇格には二段 gate を置く。まず作品内の concrete fix として公平性を直し、別作品でも同じ契約が必要になった時だけ共通 primitive にする。ただし real torus のように描画・距離・collision が同時に一致しないと破綻する機能は、部分的な局所 hack を重ねず一つの opt-in world contract として実装する。検証は seam の辺・四隅、凹 shape、回転 ellipse を fixture 化し、見た目の占有領域と判定結果を screenshot と数値の両方で残す。

■ メリット・デメリット
メリットは、既知操作を入口にして新規目的を遅れて開示できること、有限の教材列で difficulty curve をレビューできること、固定 seed により tuning と regression を同条件で行えることだ。時間を単一資源にしたため、被弾・進行・報酬の価値交換も読みやすい。音の欠落を error signal にする発想と、表示形状へ collider を一致させる修正は、説明文を増やさず予測可能性を高める。

デメリットは、固定 course が探索より暗記を強め、少数 seed の磨き込みが generator 全体の品質に見える危険である。4 wave cadence も mechanic の複雑さや一回の長さに依存し、固定テンプレートにはできない。secret の音響依存は無音・聴覚差・騒音環境で失敗する。さらに作品固有の要望をすぐ engine 一般化すると、1,300行の完成物より基盤開発が主目的になり得る。記事の playtest は有用な質的証拠だが、成功率や seed 分散の定量結果はなく、移植時の測定が必要である。

■ 判定
部分採用。導入を既知操作へ接続すること、同一規則を複数 encounter で使わせること、seed・build・入力を固定した再現評価、表示と collision の契約一致を採る。4 wave という個数、完全固定 course、音だけの secret、作品一件での engine 昇格はそのまま採らず、学習曲線・seed 一般化・accessibility・再利用実績を gate にする。

■ URL
https://blog.gingerbeardman.com/2026/07/30/beltrunner-game-design-postmortem/
