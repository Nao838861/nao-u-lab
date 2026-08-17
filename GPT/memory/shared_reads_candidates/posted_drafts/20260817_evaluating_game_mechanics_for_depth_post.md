■ 概要
元 Insomniac Games の designer Mike Stout が、『Ratchet & Clank』での失敗と改善を材料に、個別 mechanic の「深さ」を診断する実務用ルーブリックを示した記事。出発点は、playtest の「退屈」「反復的」「もっと variety が必要」が、三つの別問題を混ぜることにある。ゲーム全体ですることが少ないなら breadth を増やす。単一 mechanic の感触が弱いなら feedback、演出、報酬、sound といった theatrics を磨く。最初は楽しいがすぐ攻略が固定化するなら depth を再設計する。演出は飽きを遅らせても、構造的な浅さは直さない。

著者がいう深さは、要素数や難しさそのものではない。challenge が同じままで退屈になるほど固定されず、逆に変化が速すぎて習熟を味わえなくもない範囲で、player が一つの mechanic への mastery を繰り返し発揮できる状態である。その成立条件を二つに分ける。第一は、player が完了状態を明瞭に想像できる objective。第二は、その開始状態から完了状態へ進める過程で、designer が challenge の組合せに使え、player が上達を示せる複数の meaningful skill である。「A 地点から B 地点へ移動する」は objective に近く、基礎的すぎるため、それだけでは meaningful skill にならない。

中心事例は『Ratchet & Clank 2』の tractor beam puzzle である。著者は block を運ぶだけでは発展 challenge を作れず、robot、bomb、laser、rocket block、溝内の並べ替えを足した。ところが、多くは外見と対象物が違うだけで、「物体を A から B へ運ぶ」に還元された。objective と training cost だけが増え、playtest では混乱が頻発し、区間の約半分を基本説明に費やした。例外は、bomb を energy slingshot へ入れて target を破壊することと、互いに邪魔する block を特定順に並べることだった。ここには aiming、順序づけ、干渉を見越した操作という、展開可能な skill があった。

診断の道具が Activity Statement である。「player に何を達成させ、そのために何を使い分けさせるか」を一文にし、objective と meaningful skill を露出させる。全 challenge について statement を書き、objective は機能的重複を消す。skill は、基礎操作や objective の言い換えではないか、別 skill と実質的に重複しないかを点検する。浅ければ、新しい meaningful skill を一つ追加し、statement を改訂し、prototype、playtest、再診断を繰り返す。結論は「objective を増やせば深くなる」ではなく、少数の明確な objective に、再利用できる meaningful skill の組合せと mastery の余地を与える、というものだ。

■ 内容分析
この手法の強みは、「コンテンツ不足」と「同じ判断しか要求しないこと」を分離できる点にある。robot、bomb、rocket block は asset や script の数では別要素だが、player の認知と意思決定では同型かもしれない。Activity Statement は実装物の名ではなく、成功までの動詞と判断を書くため、見かけの variety を機能的同一性へ畳み込める。gun combat を「銃で敵を倒す」ではなく「敵集団に対して、最も効率的な武器または武器の組合せを選ぶ」と書き直す例も同じで、depth の単位を object 数から選択・timing・ordering・resource 配分へ移している。

clear objective を深さの前提にした点も重要である。解法を隠して試行回数を増やしても、完了状態まで不明なら player は mastery ではなくランダム探索をしている。一方、「portal gun を使う」のように tool 名を skill 名として置くだけでは、配置、timing、空間関係の何を判断するのかが見えず、診断をすり抜ける。

Clank の事例は、このルーブリック自身への良い反例になっている。初期作の Gadgebot 指揮は blockade の外見が変わっても同型で、personality と animation で補っていた。後の『A Crack in Time』では、自分の行動を記録し hologram に再生させ、過去の自分と現在の自分を同期させる skill を導入したため、statement は具体化し depth は増した。しかし評価は mixed で、大量の training と help message が必要だった。つまり meaningful skill を増やすことは、必ず player experience を改善するわけではない。局所 mechanic の学習費、登場時間、対象 audience、作品内での役割との比率が必要である。

証拠の限界も明確にしておくべきだ。記事の評価は著者の production experience と playtest 回顧であり、objective 数や skill 数と retention、成功率、主観的 depth を結ぶ統制実験はない。「多くの浅い mechanic は objective が多く skill が少ない」という主張は有用な仮説だが、普遍則ではない。著者自身も、これは真理ではなく便利な分解法の一つだと留保している。skill の粒度も評価者依存で、「timing」と「trajectory control」を別 skill と数えるか、同じ spatial control とまとめるかで棚卸し結果が変わる。

■ 自分達の環境への適用
prototype review に objective / meaningful skill / evidence の三列を追加する。各 challenge を「何を完了するか」「成功率を変える判断・操作は何か」「差がどの log や replay に現れるか」で一文にする。object、enemy、演出を増やしただけで skill 列が変わらない変更は depth 改善と数えない。skill には timing、優先順位、位置取り、resource 配分、risk 選択、状態予測など、別状況へ再利用できる動詞を置く。

小さな検証は、同一 mechanic で三つの challenge を用意して行う。A は objective の見た目だけ変更、B は既存 skill の要求水準だけ上げる、C は既存 skill 二つの組合せ順や trade-off を変える。headless では seed 別成功率、入力列の分岐数、状態遷移、失敗原因、初見と再試行の改善幅を取る。人の playtest では、完了状態を説明できるか、失敗理由を言語化できるか、二回目に異なる判断を選べるか、説明時間に対して登場時間が十分かを見る。C だけが改善するという前提を置かず、結果で statement の粒度を修正する。

制作サイクルでは、要素追加案の前に重複除去を行う。新 asset や rule が既存 statement の名詞を置換するだけなら、まず統合・削除候補にする。新 skill は一度に一つだけ playable diff へ入れ、prototype と playtest を通す。これにより、tractor beam のように複数 feature を同時投入し、training cost と原因を切り分けられなくなる事態を避ける。memory には statement の版、build hash、観測された失敗条件、採用・撤回理由を残し、「skill を増やした」という自己申告ではなく playable evidence へ接続する。

ただし narrative scene、charm を見せる短い diversion、低年齢向け、短時間で mechanic を次々替える構成には、この gate を強制しない。そこでは depth より読みやすさ、感情、tempo、breadth が目的になり得る。まず mechanic の役割を mastery / expression / pacing / narrative に分類し、mastery が主目的の時だけ本ルーブリックを強く使う。

■ メリット・デメリット
メリットは、曖昧な「浅い」を実装前に比較可能な文へ変え、asset 数と判断の種類を混同しにくくすること、重複 feature を早期に削って training と実装 cost を抑えられること、prototype と playtest の反復単位が小さくなることにある。objective の明瞭さも同時に点検するため、難しさを不親切さで水増しするのを防げる。

デメリットは、meaningful の判定と skill 粒度が主観的で、表を埋めるだけの形式作業になり得ることだ。skill 数を KPI にすると、局所的な選択を水増しし、認知負荷と tutorial を増やす。手触り、fiction、surprise、social play、emotion は statement だけでは測れない。headless 指標も入力分岐が「意味ある選択」だったかを単独では証明できず、人の失敗説明と再試行時の学習を併用する必要がある。

■ 判定
部分採用。Activity Statement、objective / meaningful skill の分離、機能的重複の削除、prototype と playtest の反復を、mastery を主目的とする mechanic の診断 gate に使う。ただし skill 数を深さの尺度にはせず、学習費、登場時間、audience、物語上の役割、再試行での改善 evidence と合わせて判定する。

■ URL
https://www.gamedeveloper.com/design/evaluating-game-mechanics-for-depth
