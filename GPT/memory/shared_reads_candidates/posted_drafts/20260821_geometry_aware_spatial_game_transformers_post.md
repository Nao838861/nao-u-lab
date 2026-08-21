■ 概要
Wenji Fu「Do Geometry-Aware Positional Encodings Help Transformers in Spatial Imperfect-Information Games?」は、盤面を token 列へ平坦化した Transformer に六角形 map の幾何を与えると、空間関係の理解、隠れた敵位置の belief、行動模倣、実戦勝率のどこまで改善するかを分解して調べた研究である。対象は不規則な hex map 上の非対称な海戦追跡ゲームで、片側は艦を隠して脱出・得点を狙い、もう片側は過去の目撃と成功／失敗した捜索から位置を推定して迎撃する。

比較するのは位置情報なし、矩形の行列座標と相対 bias を使う RectRel、二軸の AxialRoPE、hex の cube 座標 q,r,s（q+r+s=0）へ回転を分配する HexRoPE、さらに graph 距離と辺の可用性を bias に加えた HexRoPE+Graph である。backbone と学習予算を揃え、評価を四段に分ける。第一段は方向、hex 距離、通行不能辺込み BFS 距離を当てる制御 probe。第二段は既存 bot の行動を正解にせず、合法 random walk と観測尤度から列挙した exact-Bayes posterior を教師にする隠れ標的追跡。第三段は 1,000 局と 10,000 局の行動模倣。第四段は四方式・三学習 seed を両陣営で三種の既存 opponent と戦わせる 7,200 局の固定 seed 対戦である。

制御 probe では HexRoPE が方向 0.984、hex 距離 0.977、graph bias が blocked-edge BFS 0.927 と、幾何と位相で得意な表現が分かれた。exact belief では HexRoPE が位置情報なしより、D6 回転・反転 test orbit の posterior cross-entropy を 0.278、大きい radius-4 map で 0.329低減し、両方とも階層 bootstrap の95%信頼区間がゼロを跨がず、Holm 補正後 p<0.001だった。模倣精度も 1,000 局では位置情報なしより4.63ポイント、RectRel より2.05ポイント高いが、10,000 局では差が1.55／0.41ポイントへ縮小する。幾何 bias は少量データ時の表現負担を軽くする。

しかし集計勝率では HexRoPE－位置情報なしが -1.56ポイント、95%信頼区間 -4.50〜1.17で改善を確認できない。幾何 bias は belief 推定と低データ模倣を改善しても、戦略的多様性、相手適応、長期 credit assignment を供給しない。

■ 内容分析
この研究の最も使える部分は新しい encoding そのものではなく、能力を四つの因果段階へ切り分けた評価設計である。probe だけなら attention が方向や距離へアクセスできるとしか言えない。exact-Bayes 課題は旧 bot の癖を教師から排除し、負の観測を含む posterior 更新を測る。offline imitation は既存 policy の行動再現、対戦は自分の行動で次の状態分布が変わる閉ループ性能を測る。上流で改善し下流で消える位置を特定したことで、「精度が上がったから AI が賢くなった」という短絡を防いでいる。

encoding 間の結果も単純な順位ではない。RectRel は D6 consistency の JS divergence が 0.0047で HexRoPE の0.0095より良く、D6 の belief CE も僅かに良い。一方、radius-3 学習中に更新されない外周座標を含む radius-4 では CE が11.008へ崩壊する。対して座標ベース RoPE 群は2.096〜2.200に留まり、この split では AxialRoPE が最良だった。したがって証拠が支えるのは「学習済み絶対座標より coordinate-based rotation の map-size 外挿が頑健」という範囲であり、HexRoPE の普遍的優位でも、物理的な回転・反転への自動 equivariance でもない。

Graph bias も期待より限定的である。blocked-edge CE の HexRoPE 比改善は -0.00147、expected-distance error は -0.00349で信頼区間はゼロを跨がないが、top-1 と Brier は有意差なし。removed edge のような位相は連続的な hex 幾何とは別に与える価値があるものの、追加構造が gameplay を強めるほどの効果は示していない。

勝率の不一致には具体的な中身がある。HexRoPE は Germany 対 V11 で0.727対0.670と位置情報なしを上回る一方、Britain 対 Yanfu では0.337対0.457と大きく下回る。RectRel より捜索反復を減らしても、捜索分散は有意に増えず、British units を最近の情報周辺へ集中させる傾向が残る。集計勝率は「改善なし」という一語ではなく、役割・相手依存の長所と新しい失敗行動を相殺した値である。

限界も明確である。単一ゲーム、小さい map、単純化した一隻 random walk の belief 課題で、模倣教師は expert や solved policy ではなく state-machine、進化、script、random policy の混合である。固定 seed は初期乱数を対応させるが、行動後の状態軌跡までは同一でない。policy と gameplay の学習 seed は三本だけで、7,200局を独立標本のように扱えない。gameplay 比較も探索的であり、一般的な優劣へ外挿すべきではない。

■ 自分達の環境への適用
自分達の headless 評価には architecture の移植より、四段階の分離を採用する。隠れ状態を持つ prototype ごとに、①距離・方向・遮断辺などの deterministic probe、②ルール列挙または小規模 solver が出す belief gold、③固定 replay の action imitation、④固定 seed の閉ループ対戦／playthrough を別 artifact として保存する。各段を合否一個に潰さず、どこで改善が消えたかを build hash と共に記録する。

最小 probe は同一 backbone の `no spatial feature` と `geometry feature` を比較し、少量／十分量データ、対称変換、map-size 外挿、blocked topology を test split として分離する。belief は cross-entropy だけでなく Brier、calibration、expected map distance、変換前後の consistency を測る。gameplay は総勝率に加え、陣営×opponent ごとの勝率、発見 turn、探索 coverage／反復／分散、unit crowding、route diversity を出す。seed を合わせた差分と信頼区間を使い、game 数を増やす前に学習 seed の不足を明記する。

ゲーム制作サイクル上の採用 gate は三つにする。第一に、geometry feature が gold belief を改善すること。第二に、その差が既知 map 内だけでなく対称変換か map 外挿の少なくとも一方で残ること。第三に、閉ループでは総 score に加え失敗行動の分布が悪化していないこと。上流二段だけ通れば「表現部品として採用、policy 改善は未達」と記録し、勝率まで一括で成功扱いしない。

記憶システムには `representation_metric`、`belief_metric`、`imitation_metric`、`closed_loop_metric` を別 atom／field にし、同一 experiment id で結ぶ。これにより後の制作で「belief は良くなったが Britain 側の search crowding が悪化した」のような反例を recall できる。Phase 3b の probe としては、既存の hidden-state mechanic 一件に gold posterior の小さな列挙器を足し、10〜20 seed の行動ログと比較するのが妥当である。

■ メリット・デメリット
メリットは、幾何表現の効果を data efficiency、対称性、外挿、位相、実戦へ分解でき、offline metric の改善を完成した AI の強さと誤認しにくいこと。exact label と固定 seed、階層 bootstrap、matchup 別 telemetry は headless regression の再現性を高める。少量データで差が大きい点は、短い prototype 制作にも相性がよい。

デメリットは、gold belief を列挙できる mechanic に適用範囲が限られ、複雑な複数 entity や人間らしい推測では計算量と定義コストが増えること。encoding の追加は戦略学習を代替せず、内部精度だけを目的化すると制作上の価値が逆転する。単一 game と三学習 seed の数値を設計標準へ固定するのも危険であり、architecture 比較より先に観測 schema と failure telemetry を整える必要がある。

■ 判定
部分採用。HexRoPE を標準部品として直ちに導入するのではなく、表現・belief・模倣・閉ループを分離する評価 protocol と、対称変換／map-size／blocked-edge／matchup 別の failure slice を採用する。幾何 encoding は少量データか外挿に課題がある prototype で対照実験し、gold belief の改善と閉ループ行動の両方を確認できた場合だけ production policy へ進める。

■ URL
https://arxiv.org/abs/2608.14982
