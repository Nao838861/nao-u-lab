■ 概要
Game Developer が No Brakes Games 創業者 Tomas Sakalauskas に、『Human: Fall Flat』の試作公開から10年、世界で6000万人超へ届くまでと続編開発を聞いたインタビュー。原作は solo developer の passion project から始まったが、成功後の課題は作者が高速に回していた physics 中心の反復を組織でも維持できるかだった。

Sakalauskas は途中で深刻な burnout を経験した。publisher の Curve Digital は外注で本人を engineering に集中させようとしたが、工程の分業は player experience を分断すると感じた。そこで Tenerife に studio を設け経験者へ運営を任せたものの、硬直した process が入り、level が review に届く頃には変更困難だった。文化を変えられず閉鎖し、強い tech team を持つ Lithuania の studio へ組み直した。

この判断の前提は、本人が本作を通常の仕様書駆動の level 制作ではなく、physics と engineering を核にした technology project と見ていることにある。先に system を作り、その相互作用から面白い behavior が創発するため、game design document だけでは設計を固定できない。現在の約40人体制では信頼できる人への委譲を進め、本人は game direction と physics programming に残る。一方、Curve は marketing、platform 展開、commercialization、継続的な企画を担当し、作者が作った「種」を長寿 franchise にする役割を担った。

続編は2023年の発表後、数年を費やしながらほぼ全面的に作り直された。別方向の physics を追った結果、原作を魅力的にした不器用さが消え、「硬すぎ、磨かれすぎ」の状態になったためである。一部の design beat は再利用するが、team が作品固有の tool と mindset を獲得し、immersion と physical reactivity を最優先する版へ移った。冗談めかした「2を中止して3を作っている」という表現は、番号変更ではなく、蓄積量に引きずられず identity の喪失を認めた reset を指す。

記事の結論は成功手順ではない。作者自身、6000万人へ届く方法は知らず、続編にも同じ結果を期待しないと明言する。金銭的成功ではなく「一本を完成して出す」「新しいものを作る」という制御可能な目標を置き、独自性が需要と出会う確率を得る、という限定的な主張である。

■ 内容分析
この記事の価値は、規模拡大を増員問題ではなく、feedback loop の遅延と作品 identity の破損として記述した点にある。solo 制作では physics を変え、level で試し、即座に戻せる。工程が専門分化すると review までに制作が積み上がり、違和感を発見した時には sunk cost が大きい。「review が遅すぎた」は、判断者へ届く時間と変更可能性が反比例した失敗である。局所的な throughput が上がっても system と level の往復が遅ければ、探索型作品の総学習速度は落ちる。

もう一つ重要なのは、「不器用さ」が欠陥ではなく design asset だったことだ。物理操作では、入力へ正確に追従しない身体、接触時の予想外の姿勢、回復の手間が slapstick、協力、即興を生む。通常の polish は遅延や揺らぎを減らし、成功動作を安定させるが、その改善方向が作品の価値関数と逆向きなら、技術品質を上げるほど個性を失う。続編の失敗は polish 自体の否定ではなく、何を滑らかにし、どの制御不能性を保存するかを言語化・計測しないまま、一般的な操作品質へ寄せたことにある。

「system から behavior が創発するので文書だけでは作れない」という発言も、仕様書を捨てる話ではない。文章が記述できるのは意図や制約までで、最終的な証拠は実行中の挙動にある。source of truth は document 単体ではなく、動く build、代表 scene、parameter、入力 trace、観察結果の組になる。「同じ mindset」も感性の似た人を集めるだけでは再現できない。作品らしさの判定を比較可能な playable artifact に落として初めて組織の知識になる。

ただし記事は因果を検証した postmortem ではない。失敗した studio の人数、review 日数、physics の技術差、player test は示されない。作り直せたのは原作の継続収益がもたらした例外的な余裕でもあり、runway の短い team なら studio 自体が終わり得る。publisher 選定も担当者との直感的な相性として語られ、契約条件は分からない。6000万人という結果から組織設計や「fresh idea」を成功原因だと逆算してはいけない。強く裏づけられるのは本人が経験した失敗の形であり、成功確率の一般式ではない。

■ 自分達の環境への適用
最初に採るのは、prototype ごとの「identity contract」である。企画語ではなく、play 中に観察できる3～5個の不変条件を書く。物理 action game なら、入力どおりに止まれない余剰運動、接触から姿勢を立て直す時間、object が連鎖的に反応する範囲、失敗が即死ではなく新しい状況へ続く割合などを候補にする。同時に、camera の引っ掛かり、入力取りこぼし、復帰不能のように単なる不具合として除く挙動も分ける。「不器用さを残す」だけでは両者を混同するため、保存する摩擦と除去する摩擦を対にする。

headless 評価では平均 clear time 一本に畳まず、固定 seed の再現 trace と parameter sweep を併用する。移動補正、関節 damping、接触反発、掴み判定などを振った build で、到達率、転倒回数、姿勢回復までの step、同じ入力から生じる終状態の幅、解法の分岐数を取る。数値は面白さの代理ではないが、「安定化した結果、毎回同じ正解動作だけになった」「randomness が強すぎて意図が効かない」という両端を検出できる。代表 trace には短い capture を結び、数値差を人が identity として評価する。

制作 loop には、灰箱、system 接続、演出追加の各段階に playable checkpoint を置く。変更コストが低い灰箱で「この physics だから成立するか」を判定し、通らなければ asset 制作へ進めない。各 review には build ID、仮説、parameter、観察、採否を残す。memory にも「磨いたら何が失われ、どの trace で気づいたか」を decision record として保存する。後の agent が一般的な polish を再提案した時、却下理由を検索できる。

小さな probe として、一つの physics scene を基準版、追従性を高めた版、揺らぎを強めた版で作る。同じ目標を初見 player と scripted input に行わせ、操作意図が届くか、失敗が笑える展開へ続くか、回復を試みたくなるかを別々に記録する。基準版より成功率が上がっても展開の多様性と再挑戦意欲が落ちるなら、polish が identity を削った可能性がある。逆に混乱だけ増えるなら、それは守るべき不器用さではない。

規模を増やす場合は人数より先に、核の挙動を誰が判定するか、何日・何段階以内に playable review へ戻すか、level をいつまで破壊的に変更できるかを決める。marketing や platform 対応を分離して制作者の集中を守る発想は有効だが、player experience を跨ぐ変更まで silo 化しない。委譲する業務と、同じ build を見て共同判断すべき業務を分ける。

■ メリット・デメリット
メリットは、作品らしさを slogan ではなく regression 対象にできること、一般的な polish が常に改善とは限らないと早期に検知できること、灰箱 review によって sunk cost 前に方向修正できること、headless trace と映像評価を組み合わせて創発挙動を再現可能な記憶へ変えられることにある。商業運用を適切に委譲すれば、作者が核の設計へ残りながら作品寿命を伸ばせる点も参考になる。

デメリットは、identity 指標を固定しすぎると続編の必要な変化まで regression と誤認すること、創発性を数値化しすぎると測りやすい挙動だけを残すこと、頻繁な review が判断者への bottleneck を作ること、parameter sweep が実際の player の意味づけを代替できないことである。「作者と同じ mindset」を採用条件にすると異論が消え、属人性も温存される。全面作り直しは強い選択肢だが、十分な runway がない project では早期縮小、限定修正、中止と比較しなければならない。

■ 判定
部分採用。短い playable feedback loop、保存する摩擦と除去する摩擦の分離、identity contract と代表 trace は直ちに導入する。一方、成功作だから可能だった全面 reset、直感中心の partner 選定、freshness と商業成功の結びつきは一般則にしない。まず一つの物理 scene で三つの挙動版を比較し、操作可能性と創発性を別軸で測る。

■ URL
https://www.gamedeveloper.com/production/-human-fall-flat-2-is-cancelled-we-are-making-human-fall-flat-3-no-brakes-games-founder-looks-back-on-a-defining-decade
