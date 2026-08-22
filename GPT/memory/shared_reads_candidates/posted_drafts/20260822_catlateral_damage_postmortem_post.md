■ 概要
Chris Chung が、2013年の 7DFPS game jam で作った『Catlateral Damage』を、約1年9.5か月かけて製品化した過程の振り返り。原型は、小さな寝室を猫の一人称視点で歩き、moon jump と視点移動に連動する前足で物を床へ落とすだけの prototype だった。報道拡大を受けて本格開発へ進み、Kickstarter では目標4万ドルに対し61,944ドルを調達。支援者の猫を level や playable character にする作品固有の reward が、総額のおよそ3分の1を占めた。

成功点は、資金が尽きる前に出荷するための scope 管理と content pipeline である。third-person view、multiplayer、level editor、猫ごとの特殊能力などを切り、単純な mechanics、low-poly art、全 object 共通の texture と shader によって3D assetを素早く統合した。少数の手作り level では replayability が足りないと見て procedural generation に切り替え、必要箇所は外部協力を得た。発売時に致命的 bug はなく、launch 自体は円滑だった。

一方で、早く完成させる判断は core design にまで及んだ。premade room を順番に解く puzzle、部屋の開閉と upgrade を持つ roguelike、全 house を開放して side objective と random event を置く構造を経て、締切前には high score と機能を持たない unlockable だけの infinite-runner に縮小した。猫になって物を落とす着想と collectible は最初の10分には効くが、長く遊ぶための challenge、progression、depth にはならなかった。数百個の object も player から見れば同じ「床へ落とす物」であり、一回の session で大半が露出するため発見も尽きる。終盤に正式 QA、meetup での playtest、polish を削ったことで、非致命的 bug だけでなく、この設計上の浅さを直す機会も失った。著者の結論は、商業的・制作上は成功したが、scope を守る代償として何を削るかの質には改善余地があった、というものだ。

■ 内容分析
この記事の重要点は、削減対象によって結果が正反対になったことにある。third-person や multiplayer は独立した大機能で、切れば実装・animation・network・QA の面積をまとめて減らせる。共通 pipeline も asset 追加費用を下げ、出荷可能性を高めた。対して core loop の比較検証、外部 playtest、feedback は、残した機能が面白いかを判定する能力である。ここまで切ると、作業量は減っても設計上の誤りを発見できない。前者は製品面積、後者は観測能力の縮小であり、同じ scope cut として扱えない。

procedural generation の評価も分ける必要がある。配置変更は空間の反復感を遅らせるが、replayability の問題が「interaction の同質性」なら組合せ数を増やしても体験は増えない。記事が挙げる weight、friction、吸着、反発、moving target は、見た目ではなく action に対する結果を増やす案である。content 量は asset count ではなく、player が区別できる因果関係の数で測るべきだった。procedural system は差異を生成せず、用意された差異を再配置するだけである。

また、toy と game の境界に対する自己分析も有用である。自由に壊せる遊びを challenge や score で無理に game 化する必要はない。著者自身、実験や探索を報いる mechanics を増やして toy 性を深める別解を挙げている。問題は goal が弱いこと自体ではなく、自由遊びを選ぶなら object 間相互作用と驚きが必要で、目標遊びを選ぶなら skill、progression、選択の蓄積が必要なのに、最終版が両方の中間に残ったことだ。開発中に puzzle、roguelike、open house、infinite-runner と構造が遷移した履歴は、この product thesis が固定されないまま production が先行した証拠と読める。

評価上の限界もある。これは発売直後の開発者自身による postmortem で、retention、session length、completion rate、売上推移などの定量データや、各 design 案の比較実験は示されない。「10分以上続かない」「toy に近い」「playtest があれば改善できた」は経験に基づく妥当な診断だが、因果の実証ではない。また Kickstarter と報道の成功には、猫という題材、動画映え、当時の animal simulator 文脈が影響しており、そのまま別作品の集客法へ一般化はできない。使うべきなのは表面的な procedural 化や奇抜な題材ではなく、削減が検証能力を壊していないかを見る構造である。

■ 自分達の環境への適用
短期 prototype から playable build を伸ばす時、backlog を三分類する。A は「核を検証するため必須」、B は「核が成立した後に広げる」、C は「魅力的だが別ゲームを増築する」。最初に切るのは C、次に B であり、A の playtest hook、telemetry、replay、比較可能な build、最低限の feedback は最後まで守る。機能一覧だけで scope を測らず、「この削減後も面白さの仮説を反証できるか」を cut review の固定項目にする。Catlateral Damage で言えば multiplayer は C だが、object ごとの機械差を比較する test room と終盤 playtest は A である。

content 制作では、見た目の asset 数と機械的な interaction class を別々に数える。例えば物を壊す game なら、100個の見た目違いを追加する前に、軽い／重い、滑る／止まる、連鎖する、跳ね返す、逃げる、状態を変える、といった因果差を5種類だけ実装し、同じ room seed で比較する。headless 評価では、object type ごとの接触回数、連鎖長、選択された行動の偏り、初見 event までの時間、同一戦略の連続成功率を記録する。ただし「面白さ」を一つの score に潰さない。headless は全 object が同じ処理へ収束していないか、特定行動だけで解けないかを検出し、人間 playtest は驚き、手触り、理解、もう一度試したい動機を観察する。両者の役割を分ける。

制作サイクルでは、one-sentence core promise を固定し、5分・15分・30分時点で新しい判断が生じるかを列挙する。各 content は新しい見た目、操作、結果のどれを増やすかタグ付けし、feature cut ごとに「工数削減量」と「失う観測量」を別記する。締切直前でも代表 build を外部視点で遊び、bug、迷い、単調化、feedback 欠落を分けて残す。記憶 atom には成功した cut だけでなく、見えなくなった failure signal も evidence と共に保存する。これで「削って完成した」を「独立機能は削れたが検証経路を削ると core の浅さが固定された」という知識に変えられる。

polish も最後の装飾ではなく、残した mechanic の可読性として優先順位を付ける。記事の crosshair は、近くの小物を拾える時、植物などを噛める時に表示が変わる。これは粒子や駄洒落と同列の飾りではなく、contextual action を伝えて player の試行を増やす feedback である。polish backlog を「理解を助ける」「入力結果を強める」「世界観を足す」に分ければ、時間がなくても最初の二つは core 検証の一部として保護できる。

■ メリット・デメリット
メリットは、少人数制作で有効な削減原則が具体的な失敗と対になっていること。巨大機能を切る、asset 規格を共通化する、不得意分野だけ協力を得る施策は採用できる。content の価値を個数でなく機械差で見ること、procedural generation を replayability の自動解決策としないこと、QA と playtest を観測装置として守ることは、短期制作と headless 評価の両方に効く。

デメリットは、記事が単一事例の自己評価で、定量的な player behavior や各案の比較結果を欠くこと。猫写真 reward の成功、報道拡散、動画映えは題材固有で再現性が低い。また機械差を増やせば必ず深くなるわけではなく、差が認知できない、戦略選択へ結びつかない、組合せが chaos になる場合は production cost だけ増える。procedural 化も generator の開発・debug・例外処理を伴うため、短い作品では手作りの方が安いことがある。したがって採用単位は手法名ではなく、小さな比較 build で差異が知覚・選択・再試行につながるかという検証である。

■ 判定
部分採用。機能削減、共通 pipeline、限定的な外部協力は制作速度の原則として採用する。一方、core design、playtest、可読性 feedback は削減対象ではなく、残した範囲の品質を測る最低限の計器として保護する。procedural content と interaction 追加は一般解にせず、同一条件の小さな比較 build で機械差と反復動機が増えた場合だけ導入する。

■ URL
https://www.gamedeveloper.com/audio/postmortem-chris-chung-s-catlateral-damage
