■ 概要
Housemarque の senior level designer Henri Mustonen が、twin-stick shooter『Nex Machina』で「緊張を維持する」を敵数や速度だけの問題にせず、部屋へ入った瞬間の情報提示、敵 wave の文法、移動誘導、部屋間 transition まで貫く設計原則へ落とした記録である。目標は “Instant action. Eliminate downtime as much as possible”。各 level は約15〜30秒で終わり、player は入室から1秒未満で layout、最初から見える救助対象、初期配置の敵を読み、何をどの順で処理するか決める。限られた時間で全目標を同時達成できないため、緊張の核は反射速度だけでなく、即時の優先順位づけに置かれている。

その「1秒の計画」を成立させるため、通行可能領域と壁を色で明確に分け、隠れて安全になれる場所を減らした open layout を使う。強度を上げたい部屋では player spawn を中央へ寄せる。救助対象は開始時から全員見せ、敵に捕獲される threat を重ねることで、layout 上の目標地点と時間制約を同時に作る。初期配置敵は着地直後の空白をなくすだけでなく、その部屋で後から展開する敵構成の予告にもなる。

敵は個体ごとでなく spline、portal、area spawner の group として配置し、type、数、方向、出現間隔を調整する。特に spline の形は認識しやすく、反復時には player が未出現部分を頭の中で補完できる。多数の独立 spawner をばらばらの周期で長く動かすのでなく、短い間隔のまとまった challenge にすることで、「どの列が完了し、次に何が来るか」を学習可能にした。出現 trigger は時間経過と撃破 event を混ぜる。これにより毎回まったく同じにはならない一方、wave と phase の規則は残る。

enemy role も明示的で、dash を要求する射撃敵、secondary weapon を使わせる高耐久敵、行動自由度を残す雑魚を組み合わせる。同じ要求を重複させる敵より、異なる対処を要求する敵同士の synergy を優先する。終盤では最後の敵を強調し、撃破した瞬間に短い minigame と次 level への移動を自動開始する。旧版にあった出口まで歩く工程は、終了位置によって無意味な移動時間が変わり flow を切るため廃止した。world も当初約50 level から15 level へ削減した。

評価は統制実験ではなく、fan test の観察と長期の反復 play が中心である。初見で好感触でも、一週間繰り返すと欠点が見える level は作り直した。結論は、緊張を「常に大量の敵を出すこと」と同一視せず、瞬時に読める規則、短い challenge、明確な役割、ほぼ途切れない transition を揃え、chaos の中に学習可能な order を作ることだった。

■ 内容分析
この記事の強みは、pressure と readability を反対概念にしていない点にある。player を中央に置き、逃げ場を減らし、救助期限を重ねれば圧力は上がる。しかし同時に地形の色、初期敵、見える救助対象、recognizable な spawn shape を渡す。難しさを「情報不足」から作るのでなく、情報は読めるが優先順位を即決しなければ崩れる状態から作っている。これは unfair surprise と meaningful pressure の境界として使える。

wave の規則性も単なる暗記ではない。time trigger は player の都合を待たず盤面を悪化させ、kill trigger は処理速度に応じて進行する。両者を混ぜると、player は大まかな phase を予測できるが、前の判断による盤面差まで固定されない。反復で形を覚えるほど先読みの余地が増え、初見の survival challenge が score attack の route planning へ変わる。wave は content の列ではなく、熟達によって読み方が変わる grammar になっている。

一方、記事には completion time、death position、救助率、疲労度などの比較値がない。「一週間後にも楽しい」は制作チームの反復判断であり、downtime 削減の一般的な優位を証明したものではない。常時注意を要求する構造は短い arcade run には合うが、探索、物語理解、長時間 session では休止を奪う。15〜30秒の部屋と数秒の breather という時間スケールを外して原則だけ移植すると、緊張ではなく認知飽和になる。

また open layout と clear enemy role は authoring を簡単にする魔法ではない。狭い layout は同じ enemy set でも許容誤差を減らし、役割の組合せ次第で急に破綻する。見た目上わかりやすい spline でも、弾幕、effect、救助 threat が重なった実画面で読めなければ意味がない。spawner 単体の規則性ではなく、全 layer を重ねた時の可読性を評価する必要がある。

■ 自分達の環境への適用
短時間 combat prototype では、各 room / wave の authoring schema に `one_second_plan`、`initial_threat`、`movement_pull`、`spawn_shape`、`trigger_type`、`enemy_role_mix`、`transition_cost` を持たせる。`one_second_plan` は作者の攻略文ではなく、「開始時に見える根拠から最初の二行動を選べるか」を書く。敵編隊は座標列だけで保存せず、line、arc、pinch、center burst など再認可能な shape と、その shape が要求する移動を紐づける。

headless 評価では面白さを直接判定せず、設計意図が時系列に現れたかを測る。入室から初入力までの時間、最初の目標切替時刻、同時 active spawner 数、未処理敵の蓄積率、wave 間無入力時間、最後の敵撃破から次の操作可能状態までの時間、危険領域間の移動量を記録する。同一 seed の baseline bot と planning bot を比べ、規則を学んだ replay で被弾率や救助順が改善するかを見る。改善しなければ、shape が読めないか、読めても意思決定に使えない可能性がある。

小さな probe は3部屋で足りる。A は独立した長周期 spawner を5本、B は同じ総敵数を2〜3個の compact wave、C は B に time / kill trigger の混合を入れる。総敵数と enemy stats を固定し、初見と5回目で survival、目標達成、入力停滞、盤面予測誤差を比較する。さらに撃破後に出口へ歩く版と自動 transition 版を分け、短縮時間だけでなく、次 room 冒頭の誤入力や疲労の増減も見る。休止は一律削除せず、意図した呼吸として残す区間と、ただの移動待ちを区別する。

■ メリット・デメリット
メリットは、少ない部屋でも一つずつに明確な phase と学習可能性を持たせられること、敵の追加より配置・時刻・役割の組合せで challenge を増やせること、初見可読性と反復 route 改善を同じデータで検査できることにある。transition 監査は、操作できない時間や終了後の歩行など、combat 本体以外で失われる flow も可視化する。

デメリットは、休止削減が作品固有の tempo に強く依存し、長時間では疲労と単調な高圧を生むこと、規則性が強すぎると発見が作業化すること、複数 layer の effect が authoring 上の明快さを実画面で壊すことだ。headless 指標も、速い初入力を良い判断と誤認したり、最短 transition を常に優秀と判定したりしうる。映像 review と人の反復 play を外せない。

■ 判定
部分採用。wave grammar、1秒計画、enemy role、transition cost を authoring と telemetry の共通語彙にする。downtime は全面削除せず、意図のない待ちだけを除く。3部屋 probe で初見可読性と反復学習の両方が改善した要素だけ、次の敵編隊制作へ展開する。

■ URL
https://www.gamedeveloper.com/design/game-design-deep-dive-maintaining-tension-in-i-nex-machina-i-
