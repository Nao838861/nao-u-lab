■ 概要
この記事は、thatgamecompany で『Sky: Children of the Light』の環境制作を担当する Flora Yu が、環境美術を「美しい背景」ではなく、移動・物語・感情・実行性能を同時に成立させる playable space としてどう設計しているかを説明した制作事例である。中心にあるのは、プレイヤーが最初の数秒で何を見るかを起点に、wayfinding、空間の感情曲線、人物尺度、描画予算を一つの設計へまとめる考え方だ。

wayfinding は三つの距離に分けられる。遠距離では landmark、silhouette、spatial anchor により大まかな方角を示す。中距離では道、材質、高低差、framing、反復 motif により領域間のつながりを読む。近距離では色のまとまり、prop、sign、局所照明、固有形状により現在地を識別する。色を足す前に grayscale で value contrast、明るさ、silhouette、開いた構図を確認し、明示的な矢印を置かなくても mental map を作れる視覚階層を狙う。

具体例は Season of Two Embers の市場と Season of Duets の concert hall である。市場は似た tent と狭い道が連続し、そのままでは方向を失いやすい。そこで tent より高い建造物、吊り飾り、頭上の要素、色の塊を参照点にして、密度と生活感を保ちながら案内する。concert hall は、狭く静かな水路を船で進んだ後に大空間が開く compression-release で期待と発見を作る。中央 stage は一つの決め camera だけでなく、水辺、回廊、側道、高所など複数の観覧位置から読めるよう sightline を組む。大人数を収容する hall の尺度に、子供の avatar に合う席、机、蝋燭、布、草花を重ね、少人数でも冷たく空虚に見えない親密さを補う。

performance planning も最後の軽量化工程ではない。layout 初期から、低性能端末、player camera、同時に見える geometry・collision・lighting・material・dressing を考える。main path、主要 gameplay、物語の焦点へ detail budget を寄せ、背景は silhouette と奥行きの役割へ絞る。壁、曲がり角、地形、大型建築、tent は世界観を作るだけでなく sightline と occlusion を制御し、隠れた detail の描画を止める。結論は、環境の各要素を均等に豪華にせず、プレイヤー体験への寄与に応じて視覚的・技術的な重みを配ることが、詩的な空間を実機上で保つ、というものだ。

■ 内容分析
この記事の強みは、視線誘導、感情、美術、最適化を別々の checklist にせず、同じ空間構造の異なる作用として扱う点にある。市場の背の高い構造物は landmark であり、都市の階層感を示す物語要素であり、視線を tent 群の上へ逃がす混乱対策でもある。壁や tent は生活の痕跡を載せる器であると同時に occluder である。concert hall の水路は移動経路であると同時に、速度を落として reveal を遅らせる時間設計である。装飾を後から足して性能を削るより、layout の段階で体験と cost の交換条件を判断できる。

特に重要なのは、感情を色名だけで設計していないことだ。入口の狭さと静けさ、移動時間、開けた瞬間の視野、stage の最高輝度、周辺の低い視覚活動、硬い石と柔らかい布、巨大な room と player-sized detail が連鎖して「期待→発見→集まり」を作る。感情は単一 asset の属性ではなく、移動中に変わる contrast の系列である。「青いから寂しい」「暖色だから安心」のような一対一対応を避け、camera と身体の経験として検証できる。

一方、これは統制実験や定量比較を報告する研究ではなく、担当 artist による制作知の言語化である。市場の迷いや concert hall の親密さが、どの程度改善したかを示す迷走率、注視、frame time、滞在時間、人数別評価は提示されていない。Sky 固有の浮遊移動、第三者 camera、stylized な画面、social space、既存の光表現へ依存する部分もある。また、色のまとまりは色覚差、表示端末、画面輝度で崩れ、landmark は自由探索を好む人には過剰誘導になり得る。したがって、記事は完成済みの処方箋ではなく、空間を観測可能な仮説へ分解するための設計語彙として強い。

評価で見るべきなのは、作者の意図を説明できるかではなく、初見の人が実際にどこを見るか、どちらへ進むか、どんな言葉で気分を表すかである。さらに、狙った視線誘導が成立しても、探索の余白、複数経路、偶然の発見を消していないかを別軸で見る必要がある。記事末尾の「他者に遊んでもらい、見た場所・進んだ場所・感じた mood を意図と比べる」という助言は、この限界を補う最小の評価法になっている。

■ 自分達の環境への適用
小規模 prototype では、環境制作前に一枚の intention sheet を置く。各区間について、最初の注視点、遠・中・近距離 cue、進んでほしい方向、狙う感情語、compression と release の位置、同時表示 budget、背景へ落とす要素を書く。美術、level design、performance を別工程にせず、白箱の時点で同じ表を使う。重要なのは項目を増やすことではなく、一つの壁、一つの光、一つの高さが何役を担うかを明記することだ。

playtest は 3～5 人の初見観察から始められる。開始後 3 秒の camera 向き、最初の移動方向、最初に立ち止まった地点、目標到達までの逆走・停止、区間ごとの自由記述の感情語を記録する。終了後に簡略 map へ landmark を描いてもらえば、mental map が成立したかも見える。狙いと一致しない時は sign を足す前に、value contrast、silhouette、framing、高低差、頭上 cue のどの scale が欠けたかを切り分ける。任意寄り道を一つ置き、「進行方向は分かるが探索は選べる」状態を確認する。

headless 評価は感情そのものを断定せず、構造 proxy に限定する。nav graph 上の分岐数、目的地までの迂回率、camera から landmark が見える区間率、reveal 前後の可視面積差、main path と背景の detail density、同時表示 object・material・light 数、occlusion 後の draw 対象差を seed ごとに保存する。これで「迷わせたい区間」と「意図せず迷う区間」、「大きく見せたい reveal」と「単に重い広場」を分けられる。最終的な感情判断は人の自由記述と画面記録へ戻し、headless score を感情の代用品にしない。

実装 probe は一つの部屋で十分である。同じ geometry に対し、A は局所 sign と色だけ、B は遠距離 landmark・中距離 framing・近距離 cue を重ねる。さらに reveal 前の通路幅と長さ、player-sized props の有無を切り替える。到達時間だけでなく、初手、停止、camera の振り戻し、感情語、frame time を比較する。B が迷走を減らしても視線や経路が一様になりすぎるなら、landmark の見せ方か寄り道の余白を弱める。この小さな比較なら、記事の原則を恒久ルールへ直結させず、playable diff で再現性を確かめられる。

記憶システムには抽象語だけを残さず、`intended_first_read`、`macro_mid_micro_cues`、`emotion_sequence`、`player_scale_reference`、`visibility_budget`、`observed_route`、`observed_mood_words` を一組の evidence として保存する。そうすれば後の制作で「compression-release を使う」と想起するだけでなく、どの prototype、camera、人数、性能条件で効いたかを比較できる。

■ メリット・デメリット
メリットは三つある。第一に、環境美術を gameplay の後工程から外し、白箱段階で視認性と感情を検査できる。第二に、一つの構造物へ landmark、物語、occlusion の役割を重ねるため、小規模制作でも asset 数を増やさず密度を作りやすい。第三に、初見の注視・経路・感情語と、同時表示 cost を同じ scene 単位で照合でき、見栄えと性能の対立を具体的な配分問題へ変えられる。

デメリットは、事例の成功を裏付ける比較値がなく、Sky の美術様式と social play から一般化しすぎる危険があることだ。複数 scale の cue を全部強くすると、画面が説明的になり、迷う楽しさや個人の発見を減らす。感情語は人、文化、同伴者、音、物語文脈で変わるため、空間だけの効果と断定できない。occlusion と detail budget も engine、camera、端末で利得が変わる。導入時は、美術規則として固定せず、cue の強さ、探索余白、人数、camera、frame cost を含む局所比較として扱う必要がある。

■ 判定
部分採用。遠・中・近距離の wayfinding、compression-release、player-sized detail、layout 起点の visibility budget を、同じ初見 playtest と性能記録で検証する枠組みとして採用する。Sky の具体解や感情色の対応は一般則にせず、一室の A/B probe で視認性・探索余白・感情語・frame cost が同時に改善する範囲だけを次の制作へ残す。

■ URL
https://80.lv/articles/how-to-design-emotional-game-environments-for-sky-children-of-the-light
