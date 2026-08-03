■ 概要
Freehold Games の Jason Grinblat による『Sproggiwood』の設計ポストモーテム。3人の中核メンバーがパートタイムで約2年開発した短時間型 roguelike である。狙いは hunger、inventory 管理、真の permadeath などを外しつつ、procedural encounter、player と monster の規則上の対等性、多様な選択肢という核を15分程度の session に圧縮することだった。

当初案は dungeon crawler と town builder の hybrid で、「town 自体が character」という構想だった。dungeon で資源を得て、town で村人を農業・鍛冶・交易へ割り当て、その生産物が冒険者の装備へ戻る。mobile 市場を意識して IAP も組み込もうとした。しかし town と dungeon は各々が独自の複雑さを持ち、両者を結ぶ作用は弱かった。季節 event、建物への村人配置、道路による動線設計など個別には興味深くても、dungeon の tactical play と意味のある相互作用を作れず、実態は「二つの直交したゲーム」になった。IAP 用に content を購入単位へ刻むことも、望んだ progression と合わなかったため、開発途中で dungeon 中心の premium game へ絞った。

うまくいった核は、小さな encounter を procedural に組み合わせる設計である。数 turn 内に踏まないと slime を生む puddle と、近くの対象を tongue で引き寄せる frog は、それぞれ単純だが、同時に出ると「puddle を踏む直前に frog に引き離される」という状況を生む。さらに frog の予兆を見た player が近くの monster と位置を交換し、monster を引かせることもできる。個別規則が読み取れ、同じ規則が player と enemy に作用するため、組合せが理不尽な例外ではなく tactical な発見になる。

大きな転換点は報酬 loop の修正だった。初期版では power を town で購入し、dungeon に入ると構成が固定され、run 中の成長は chest の equipment が中心だった。遅れて導入した survey では、推薦意向は比較的高い一方、gameplay の compelling 評価が約6.5/10に留まった。playtester は、次の power のために gold を貯めていても冒険中の即時報酬が足りないと指摘した。そこで各 dungeon を一人の adventurer の成長 arc と見なし、level-up と power 選択を run 内へ移した。短い session の中で早く頻繁に選択が発生し、power を取る順序そのものが高難度 dungeon の攻略戦略になった。

一方、残した town は恒久 upgrade と装飾を提供する storefront に近く、見た目ほど gameplay 上の目的を持たないと感じられた。全 class 共通の enchantment は均衡していても似て見えたため、後に class 固有の rare item を加えて非対称性を戻した。文明化の暴力性を扱う物語も mechanics が前景化せず、大半には埋もれた。結論は、固定設問の survey を早期から反復すること、theme を mechanics へ浸透させること、整然とした system に少量の非対称性を入れることの三点である。

■ 内容分析
最も重要なのは「要素を減らした」事実ではなく、複合 game の結合度を見直したことだ。town と dungeon の間に資源の受け渡しがあっても、それは連携の証拠にならない。片方での判断が他方の選択空間・risk・解法を変えず、単なる unlock や数値供給に留まるなら、player は二つの loop を交互に処理しているだけである。Sproggiwood の初期案は、機能数では豊かでも decision の因果が薄く、少人数チームが二作品分の調整費を負う構造だった。

対照的に puddle と frog の例は、低い局所複雑性から高い状況多様性を作る。成立条件は、各要素の trigger と結果が短時間で読めること、複数要素が同じ盤面変数に作用すること、player が介入できること、enemy にも同じ法則が通ることだ。組合せ数だけ増やしても、予兆が読めない、対処不能、例外処理が多い場合は emergence ではなく事故になる。この記事が示す価値は procedural generation 自体より、組み合わせられる規則の設計単位にある。

報酬 loop の修正も「報酬を増やす」話ではない。session 長が15分なら15分後に reward があればよい、とは限らない。player が現在の run で仮説を立て、その結果を見て次の build 選択へ進む周期は、session より短く閉じる必要がある。power 選択を run 内へ移すと、報酬が同時に次の tactical decision になり、meta progression と moment-to-moment play の断絶が縮む。推薦意向と compelling の差を分けて読んだ点も重要で、art、theme、将来性への好感が高くても、現在の操作と判断が弱い可能性を見逃さない。

失敗側では、balance、theme、presentation の三つの「整っているのに届かない」が並ぶ。共通 enchantment は公平でも驚きが薄く、物語は深くても行為を変えず、town は美しくても選択密度がない。品質は player が認知し、選び、結果を経験する経路で測るべきだ。

ただし証拠には限界がある。これは単一作品の制作者による回顧で、survey の標本数、設問文、分散、NPS の実数、変更前後の比較、継続率や売上は示されない。level-up 移動と完成版の改善に因果関係があるという説明はもっともらしいが、A/B test ではない。二年の反復を経た完成作の知見を、短期 prototype にそのまま一般化することもできない。

■ 自分達の環境への適用
新しい game prototype では、複数 loop を実装する前に「A のどの判断が B の何を変えるか」を表にする。資源が移るだけ、恒久数値が上がるだけなら弱い結合と見なし、片方を削るか、同じ状態変数を巡る risk と選択へ統合する。headless 評価では、各 subsystem の利用回数だけでなく、A の行動後に B の選択分布が変わった割合、二つの規則が同一 encounter で発火した回数、その際に player が複数の有効解を持てた割合を記録する。

短時間 game では、1 session の平均長だけでなく「意味のある選択→可視結果→次の選択」までの turn 数を reward latency として測る。最初の5分について、成長選択が一度もない区間、獲得した資源を session 中に使えない区間、同じ行動が続く区間を trace で検出する。Sproggiwood 型の変更を試すなら、meta 側にある upgrade の一部を run 内へ仮移植し、選択順が攻略を変えるか、単なる早期強化になるかを比較する。

encounter は単体 checklist だけでなく pairwise test を作る。各 mechanic について、予兆、作用対象、共有する盤面変数、player の介入手段、enemy への対称適用を記録し、二要素を組み合わせた seed を headless で反復する。勝率だけでなく、状態遷移の種類、同一解への収束率、回避不能 damage、読み取りから結果までの猶予を出す。予想外だが説明可能な遷移は残し、説明不能または一択化する組合せは外す。

playtest survey は自由記述だけにせず、compelling、操作の理解、即時報酬、再試行意欲など少数の固定設問を継続する。数値には build、seed、session 長、経験者か初見かを併記し、発言原文と telemetry を結ぶ。theme も感想ではなく、誰を助け、何を犠牲にし、価値判断に関係する mechanic を選んだかで、行為への表出を評価する。

■ メリット・デメリット
メリットは、scope 削減、system interaction、報酬周期、非対称性、theme の伝達を一つの設計問題として読めることだ。特に「短い session には、さらに短い feedback loop が要る」「balanced な選択肢でも記憶上は同質化する」「二つの mode 間に通貨が流れるだけでは hybrid にならない」は、prototype の早期 gate に使いやすい。単純な規則の pairwise 検証は headless test とも相性がよい。

デメリットは、事後説明なので捨てた案の完成度と比較条件が不明なこと、約6.5/10 以外の定量根拠が薄いこと、商業的成功や retention まで検証していないことだ。また非対称性は、投入量を誤ると可読性と balance を同時に壊す。run 内成長も万能ではなく、恒久 progression の長期目標を弱めたり、序盤の定型 build を固定したりしうる。採用時は「特徴を足す」処方ではなく、結合度、reward latency、選択分布という観測可能な仮説へ分解する必要がある。

■ 判定
部分採用。複合 loop は通貨接続ではなく decision の相互作用で判定し、短時間 prototype では session より短い reward latency、pairwise encounter test、固定 survey 設問を導入する。run 内成長と非対称 item は有望な手段だが、元記事に比較実験がないため原則化せず、小さな build 差分で telemetry と playtest 原文を照合して採否を決める。

■ URL
https://www.gamedeveloper.com/design/design-postmortem-story-driven-roguelike-sproggiwood
