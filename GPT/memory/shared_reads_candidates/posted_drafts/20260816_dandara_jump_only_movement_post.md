■ 概要
Long Hat House の Joao Brant が、Dandara の「歩けず、面から面へ直線ジャンプする」移動をどう発見し、入力補助・戦闘・部屋設計・gamepad 移植まで育てたかを振り返った開発記録。出発点は奇抜な重力表現ではなく、touch screen の制約だった。既存 console 操作を仮想 stick と button に置き換えるのではなく、touch の開始と解放は button 同様に即時で、swipe なら一動作の中で開始・方向指定・確定を行える、と捉えた。初期案には歩行もあったが、角度の付いた面で歩行方向が意図とずれる一方、対向面へ跳ぶ動きは強い速度感を生んだため、歩行を削除して jump-only に絞った。

ところが、着地点を自由にすると速さと引き換えに、画面外への失敗、意図しない面への着地、修正のための戻りジャンプが増え、テンポが壊れた。そこで jump range を制限し、有効な白い target area がある時だけ跳べるようにした。指を離す瞬間の微妙な方向変化で aim が外れる問題には、最後の有効 aim を保存してそこへ跳ぶ補助を導入。さらに swipe が長いほど左右の raycaster の探索幅を広げ、素早い操作ほど許容を増やした。これは難度を一律に下げる補助ではなく、入力の不確かさだけを吸収して意図した高速移動を守る処理である。

移動制約は戦闘と level design も変えた。初期の長射程 machine gun と auto-aim は、画面外から無傷で敵を倒せて接近も探索も不要にしたため、短射程・広角・非 auto-aim の shotgun 型へ変更。近距離では複数 projectile が当たり高 damage になるため、敵の近くへ跳び込み、着地面と射角を選ぶ「dance」が生まれた。部屋側では、誤着地後に進行方向へ続けず一度逆向きへ戻される場所を mini dead-end と命名し、壁沿い jump、敵配置、camera trigger による視界遮断も含めて room の禁止条件へ変えた。後期 playtest はこの発見を助けたが、原因の定式化が遅く、level 全体を作り直した例もある。

gamepad では touch の直訳にも失敗した。左右 stick に移動と攻撃を分け、stick を離して確定する案は、stick の復帰が touch release より遅く、最後の方向が大きくぶれた。最終的には移動と攻撃を同じ stick で aim し、button で確定する文法へ再構成し、着地時に前の jump vector を反転して「次も前方」を保持する補助を加えた。記事の結論は、固有 mechanic は中心動詞単体では完成せず、入力装置の物理、intent 補助、武器の安全距離、失敗後の復帰経路、camera、別 controller の文法まで一体で反復して初めて機能する、というものだ。

■ 内容分析
この事例で最も使えるのは、「制約を個性にする」という抽象論ではなく、どの摩擦を残し、どの摩擦を消したかが具体的な点である。着地点の限定、last-valid aim、可変幅 raycaster は、空間判断そのものを代行していない。player はどの面へ行くかを選び、range と敵配置を読む必要がある一方、指を離す瞬間のノイズで選択が無効になる部分だけを system が肩代わりする。補助の設計単位を成功率ではなく「decision error と device error の分離」に置いている。

同様に、mini dead-end は単なる行き止まりではない。死亡も進行不能も起きないのに、入力ミス一回に対して逆方向への操作を一回余計に請求し、速度感を削る局所 topology である。記事はこれを感想のままにせず、進行意図ごとの pathway、壁との平行移動、敵が塞ぐ時間、camera が次の接地面を見せる時刻へ分解している。jump-only のように一手が離散的な game では、平均移動速度より「失敗後、何手で元の意図へ復帰できるか」の方が rhythm を説明しやすい。

一方、記事の評価には限界がある。「instant improvement」「comfortable tempo」といった判断は開発者観察と後期 playtest に基づき、補助あり／なしの成功率、device 別の aim error、room 改修前後の離脱率などは示されない。gamepad の vector 反転も多くの場合に効くとされるが、方向転換したい時の誤補助や熟練者への影響は定量化されていない。したがって、この実装値を移植するのではなく、失敗分類と比較方法を移植すべき資料である。

■ 自分達の環境への適用
移動中心 prototype では、同じ小さな test map に「自由着地」「有効面限定」「有効面限定＋last-valid aim」の三条件を用意する。headless 側は最短経路だけでなく、入力方向へ微小 noise を加えた時の valid landing 率、意図と異なる面への着地率、失敗後に元の進行方向へ戻るまでの追加 action 数を記録する。人間 playtest では controller 別に、狙いを変えた失敗と確定時ぶれを分けて申告する。補助の目標は全員を成功させることではなく、後者だけを減らすことに置く。

room 検査には各 landing surface を node、到達可能 jump を有向 edge とした graph を使える。主要進行方向ごとに、任意の誤着地 node から前方 route へ戻る最小 action 数を計算し、逆向き edge を必須とする場所を mini dead-end 候補として可視化する。ただし敵や camera は静的 graph に現れないため、敵占有時間と次 landing area の可視時刻を trace に追加する。これなら geometry の自動検査と、動的な「一時的行き止まり」を同じ recovery-cost 指標で扱える。

戦闘では武器射程を移動 verb から独立に調整しない。安全な landing node から敵を倒せる割合、攻撃に必要な最小接近 jump 数、最大 damage を得る位置の危険度を測る。遠距離から完封できるなら、damage だけを下げる前に range、spread、aim assist が位置取りを無効化していないかを見る。別 controller 対応も key mapping の完了ではなく、同じ intent が何 action・何回の方向確定で表現されるかを比較し、必要なら device ごとに補助を変える。

■ メリット・デメリット
メリットは、入力発見から level topology まで因果が連続しており、小規模 prototype でも検証項目へ落としやすいこと。特に last-valid aim と mini dead-end は、操作感という曖昧な問題を、入力確定時の noise と失敗後の追加 action に分ける語彙になる。また、武器射程を移動の価値から逆算するため、中心 mechanic が戦闘中だけ消える事故を見つけやすい。

デメリットは、Dandara 固有の白い target、重力方向、画面構成に強く依存し、そのまま一般化すると自由移動の価値まで削り得ること。補助を厚くしすぎれば aim の学習や精密操作を奪い、graph 検査だけを信じれば surprise や意図的な retreat を誤って欠陥扱いする。さらに記事には比較数値がないため、raycaster 幅や復帰 action の閾値は自分達の prototype で決め直す必要がある。

■ 判定
部分採用。採用するのは jump-only そのものではなく、device error と decision error の分離、失敗後の recovery cost、中心移動を無効化しない武器射程、controller ごとの intent 再表現という四つの検査軸。補助量や room の合否は、noise 付き headless trace と短い人間 playtest の両方で決める。

■ URL
https://www.gamedeveloper.com/design/game-design-deep-dive-i-dandara-i-s-unique-jump-only-movement-mechanic
