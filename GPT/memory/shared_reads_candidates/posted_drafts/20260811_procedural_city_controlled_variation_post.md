■ 概要
Unity 上で procedural city を組み立てる過程を、街区、建物外形、窓、色という異なる縮尺の制御問題として記録した devlog。最初に random points から Voronoi diagram を作り、得られた cell polygon を街区の大枠にする。道路を作るため各 polygon を単純に縮めると道幅が不均一になったため、外周点を cell の平均中心へ寄せ、隣接 cell との隙間を揃えた。だが数学的には毎回異なっても、出力は「似た polygon の集合」に見え、路地・小道・大通りの階層がない。そこで十分大きい cell の一部だけを分割する。ただし鋭角が多い形は後段の building algorithm を壊すため排除し、Voronoi が持つ自然な形を Lloyd's Relaxation で整えた基盤を壊さない範囲で複雑さを足した。

建物は cell 外周を footprint とし、高さと横断形状を random curve で決める。直線だけでは反復感が強い一方、全 curve を大胆に乱すと制御不能になったため、複数 curve のうち一つだけを広い変数範囲の “interesting” curve とし、残りは狭く安全な範囲へ制限した。各階の開始高さは curve を step ごとに評価し、目標 y 以上になる点を探す。single thread の runtime 生成なので細かい step を避け、得た高さを目標値へ clamp し、形状が curve と完全一致しない誤差を受け入れた。窓は curve 上で高速かつ等間隔に置けないため、角だけを curve、側面を straight line にした一階分の ring を作り、直線区間上へ補間して配置する。

色も RGB 各値の無制約 random では不快な組合せになった。そこで基準 hue を選び、color wheel 上の回転から harmony を作り、さらに tint と shade を派生させた palette 内だけで変化させる。個々の建物を綺麗にするだけでは都市全体がばらばらなので、cell 分割時に得ていた adjacency を再利用し、隣接 cell には高確率で調和色、低確率で対比色を伝播させた。結論は、乱数を全面へ均等にかけず、自然な大枠、安全域内の局所的逸脱、表示上の規則性、近傍間の相関へ分解することで、変化と統一感を同時に作るというものだ。

■ 内容分析
この記事で価値が高いのは、procedural generation の失敗を「seed ごとの差がない」「後段が壊れる」「見た目が不正確」「全体の統一感がない」に分け、異なる制御で直している点である。Voronoi は自然な cell を自動生成するが、それだけでは都市の機能的な階層を作らない。cell 分割は topology の変化を足す操作であり、curve の乱数幅は建物 silhouette の変化、palette 伝播は視覚的な相関を作る操作である。同じ randomness slider で全てを強めず、構造ごとに変化量を持たせている。

一方、外周点を平均中心へ寄せる道路生成は実装しやすいが、一般的な polygon offset と同じ保証を持たない。凹 polygon や細長い cell では、中心方向への移動が局所的な道幅を一定にするとは限らず、辺の交差や極端に小さい footprint を生む可能性がある。記事の「等距離」という説明は画像上の結果であり、幅の分散や無効 polygon 率は測っていない。cell 分割でも「小さすぎる」「鋭角が多すぎる」を避けたことは分かるが、閾値、再試行回数、seed failure 率は示されない。自然らしさを守れたという評価も作者の目視である。

“interesting curve を一つだけ” という折衷は、局所的な驚きを安全な骨格へ載せる設計として強い。全 curve が独立に大きく振れると silhouette が破綻し、全てが狭い範囲なら反復する。一軸だけを逸脱させれば、どの parameter が個性を担当したか追跡しやすい。ただし一つという数に普遍性はなく、curve 同士の相関、自己交差、床面積、重心、隣棟との衝突を保証しない。安全域が経験的な clamp に過ぎなければ、建物 scale や camera distance を変えた時に再調整が必要になる。

runtime 精度の扱いも示唆的である。curve sampling の step を粗くし、高さを clamp する判断は、最終用途が「各 floor の高さを揃える」ことであり、curve への数学的忠実度ではないから成立する。窓では逆に等間隔性が見た目へ直結するため、curve 近似を押し通さず straight segment の補間へ表現を切り替えた。つまり同じ geometry pipeline でも、誤差が許される輪郭と、規則性が必要な facade を分けている。ただし生成時間、triangle 数、building 数、step 幅別の誤差や frame budget は公開されておらず、single-thread 制約下でどこまで scale するかは不明である。

色の adjacency 伝播は都市全体へ連続性を与えるが、走査順に依存し得る。隣接先へ高確率で harmony、低確率で contrast を与えるだけでは、cycle を一周した時の矛盾、最初に選んだ cell の影響範囲、contrast が集中する条件が定義されない。また調和色は建物の用途、地区、移動可能性を伝える semantic layer とは別物である。画像としてまとまっても、gameplay 上の landmark や district 可読性を保証しない。この記事は完成した generator の定量評価ではなく、失敗観察と局所修正が対応した制作一次記録として読むのが適切だ。

■ 自分達の環境への適用
world / level generator では、random parameter を「基盤 topology」「局所逸脱」「反復規則」「近傍相関」に分ける。基盤は Voronoi や graph で通路と区画を作り、局所逸脱は十分大きい区画だけの split や一つの強い形状 parameter に限定する。反復規則は窓、足場、遮蔽、pickup 間隔のように player が距離を読む要素へ使う。近傍相関は palette だけでなく、敵 archetype、地形 motif、resource 密度を地区単位で緩やかに共有する。ただし gameplay 属性を色だけに従属させず、視認性と意味を別 test にする。

headless 評価は「生成できた seed 数」だけで終えない。多数 seed を固定し、無効 polygon、最小角、辺交差、最小通路幅、区画面積分布、split 再試行回数、建物 overlap、生成時間、mesh 数を記録する。多様性は parameter の分散だけでなく、道路 graph の次数分布、区画面積 histogram、silhouette descriptor、隣接 palette 差の分布で見る。同時に seed を画像へ対応づけ、人間が同じように見えると判断した pair を保存する。数学的に異なることと知覚上異なることを分けるためである。

小さな probe では、同じ seed 群に対して A: Voronoi のみ、B: 条件付き split、C: split + 一つの強い curve、D: 近傍 palette 伝播までを段階的に生成する。各段階で failure 率、生成時間、視覚 cluster 数、play path の幅と landmark 発見率を比較する。curve sampling は step 幅を振り、floor 高さ誤差と処理時間の knee point を探す。window や足場のように等間隔性が重要な要素は直線補間へ逃がし、曲線忠実度を上げるために runtime budget を浪費しない。

制作記憶には成功 seed の screenshot だけでなく、鋭角で後段が壊れた seed、中心縮小で道幅が乱れた seed、全 curve を乱して制御不能になった seed、無制約 RGB で破綻した palette を failure corpus として残す。generator の変更後に同じ seed 群を再実行すれば、見栄えの改善と失敗再発を比較できる。経験的 threshold は code 内の定数で終わらせず、対象 scale と観測した failure 条件を添える。

■ メリット・デメリット
メリットは、Voronoi の自然な基盤を保ちながら条件付き split で街路階層を足せること、強い乱数を一部 curve に限定して個性と安定性を両立しやすいこと、精度が必要な直線区間と誤差を許せる曲線を分けて runtime 負荷を抑えられること、既存の adjacency を色の局所調和へ再利用して都市全体の連続性を作れることにある。

デメリットは、平均中心への縮小が一定幅 offset を保証しないこと、形状除外と curve 安全域が経験則で scale 変更に弱いこと、走査順に依存する色伝播が全体制約を保証しないこと、作者の画像評価が中心で seed failure 率・性能・多様性の定量比較がないこと、見た目の多様性が gameplay 上の読みやすさや地区の意味へ直結しないことである。

■ 判定
部分採用。変化を topology・局所逸脱・規則性・近傍相関へ分け、各層で乱数幅を制御する設計と、用途に応じて curve 精度を捨てる判断は採用する。中心縮小、形状 threshold、palette 伝播はそのまま固定せず、seed corpus による geometry 検査、生成時間計測、知覚差と gameplay 可読性の観察を通して調整する。

■ URL
https://dellywelly.itch.io/city-generator/devlog/475849/how-i-created-a-procedural-city
