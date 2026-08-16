■ 概要
The Wandering Band の Ben Wander が、Airborne Kingdom の「都市全体を移動させる」mechanic が city-builder の経済、研究、world layout、探索報酬、制作体制までどう再編したかを解説した開発記録。初期 prototype は地上の村を空へ持ち上げただけで、見た目は魅力的でも genre の定型との差が弱かった。転機は right-click-to-move、開発者の言葉では「RPG のような移動」を加えたこと。個々の unit ではなく、player が指定した地点の上空へ都市全体が飛ぶようになり、浮遊都市という設定が背景から中心動詞へ変わった。

この動詞は既存 system と自然に接続した。資源へ遠い worker を送る代わりに都市自体を資源へ近づける。technology は menu 内で時間を待つ tree ではなく、地上の point of interest を探して解放する in-world research になる。都市が大きくなるほど移動に必要な力が増え、Propulsion が成長に伴う infrastructure cost になる。つまり移動は探索 button ではなく、採集距離、研究、都市規模の三つへ同時に作用する経済判断になった。

ただし最初の world 案は、巨大な資源塊の間に広い無人地帯を置く構成で、長距離移動中の操作が薄かった。実際に心地よい flow を作ったのは、遠方の目的地へ飛びながら camera を回し、近くの小資源塊へ worker を割り当て、都市が離れたら次へ再配置する反復だった。各地域だけで全資源を永続供給できないようにし、world を tile に分けて地域ごとの資源量を記録し、場所ごとの差を残しながら balance を取った。都市と資源塊の最大距離を越えると worker は自動解除され、資源は大塊ではなく trail 状の小 clump として次の移動方向を示す。この低レベルの asset optimization が、長距離航行の空白を埋める mini-loop になった。

移動が柱になると、「探索できる」だけでは足りず、「探索する価値のある world」が必要になった。settlement は市民、artifact は特別な建築、dye と metal ruin は外観 customization を与え、biome、day/night、暗闇の光、峡谷の雲、point of interest ごとの物語が追加された。producer が level design へ役割を移すほど制作領域も広がり、チームは city-builder の economy/balance と open-world adventure の discovery を並行して作ることになった。最終的に都市は一つの character、建築物はその stat upgrade とみなせる構造になった。記事の結論は、独自性は新 mechanic の存在ではなく、その mechanic が既存 genre の複数 system を相互依存へ変えた時に生まれる、というものだ。

■ 内容分析
重要なのは「一つの mechanic を全 system に入れる」という量の話ではない。都市移動には、接続が三種類ある。第一は代替で、遠征距離の問題を都市の接近へ置き換える。第二は負荷で、都市成長が Propulsion 要求を増やし、便利な移動を無償にしない。第三は誘導で、資源 clump と最大採集距離が次の移動を促す。中心動詞が報酬だけでなく cost と world signal を持つため、移動する理由と留まれない理由が同じ economy から生まれている。

資源 trail の役割も単なる breadcrumb ではない。player は遠方の目的地を設定した後も、camera、worker、距離を短い周期で更新する。大目標の travel と小目標の gather が同時進行し、都市の位置が変わるたびに最適割当も変わる。これにより、移動の待ち時間が economy の再判断時間へ変換される。一方で距離超過時の自動解除は、移動した結果として古い命令が無効になったことを system が整理する後処理であり、中心動詞を増やす時には「既存 state をどう終了させるか」まで設計対象になる。

記事の弱点は評価の定量性である。地域ごとの資源量を chart し、最大距離を慎重に tune したとは書かれるが、実値、条件比較、player 行動の分布、economy 破綻率は出ていない。「comforting tempo」や探索の成功は開発者の反復結果で、資源再割当を忙しい作業と感じる player、移動先を見失う player、都市拡大で Propulsion が過剰な税になる条件は示されない。また発見物を増やすほど content cost が膨らみ、systemic な city-builder が手作り open world の量に依存する危険もある。したがって記事は完成 balance の資料ではなく、中心動詞から dependency を見つける設計監査として読むのが妥当である。

■ 自分達の環境への適用
system-driven prototype に固有 verb を加えた時は、verb 自体の面白さだけで pass にせず、dependency map を作る。縦軸に resource acquisition、research、growth cost、world navigation、reward、state cleanup を置き、各 system が verb に対して「代替」「負荷」「誘導」「終了処理」のどれを持つか記録する。接続が演出だけなら、Airborne Kingdom 初期 prototype と同じく設定上の差に留まっている可能性が高い。

最小 probe は二条件でよい。固定拠点から worker を送る版と、拠点そのものを動かす版を同じ資源総量で作り、headless trace で移動一回あたりの採集先変更数、無操作時間、resource 枯渇までの時間、成長一段あたりの移動 cost、古い worker 命令の dangling 数を取る。移動版で判断が増えても、単に再割当 click が増えただけなら不採用。遠方目標と近傍最適化が干渉し、移動先・成長・採集優先度の選択が変わるなら接続が生きている。

world 側は大塊配置と trail 配置を同じ resource budget で比較する。到達経路の分岐数、camera を動かした回数、発見物を視認して目的地を変更した回数、同一地域への滞在時間を測る。人間 playtest では「次に何を探すか分からない」と「やることは分かるが手数が多い」を別の失敗として記録する。前者には landmark や trail、後者には自動解除・再割当 UI・採集範囲の調整が効くため、混ぜると content 追加で操作疲労を隠してしまう。

制作サイクルにも適用できる。新 mechanic の採用時点で、必要になる content family と担当領域の増加を見積もる。探索を柱にするなら、資源だけでなく機能報酬、外観報酬、物語報酬の最低三系統を少数作り、どれが route 変更を起こしたかを先に観察する。反応しない報酬を大量生産しない。記憶には「mechanic を追加した」という atom だけでなく、どの system がどう再編され、どの旧 state に cleanup が必要になったかを decision evidence として残す。

■ メリット・デメリット
メリットは、genre に固有 verb を足す時の確認範囲が明確になること。中心動詞を economy の代替、成長負荷、world 誘導、state cleanup に接続すれば、表面的な novelty で終わりにくい。大移動と小さな資源再配置を重ねる考え方は、待ち時間を判断時間へ変える設計としても使える。dependency map と短い A/B probe にすれば、完成 world を作る前に system 接続の有無を検査できる。

デメリットは、接続数を増やすこと自体を目的化しやすいこと。全 system が中心動詞に依存すると、一つの balance 変更が economy、level、UI、narrative へ波及し、調整範囲と制作費が急増する。資源 trail は探索を誘導する反面、最適 route を一本道にし、再割当 mini-loop は tempo ではなく作業になり得る。記事に数値比較がない以上、Propulsion cost や最大距離を模倣せず、判断密度、操作負荷、content cost を別々に測る必要がある。

■ 判定
部分採用。採用するのは「都市を動かす」題材ではなく、固有 verb を既存 system の代替・負荷・誘導・終了処理へ接続する dependency 監査と、長い移動に短い判断 loop を重ねる検証法。接続数ではなく、player の選択変化が観測でき、content 増加が許容範囲に収まる場合だけ本実装へ進める。

■ URL
https://www.gamedeveloper.com/design/deep-dive-an-economy-of-discovery-behind-the-movement-of-airborne-kingdom
