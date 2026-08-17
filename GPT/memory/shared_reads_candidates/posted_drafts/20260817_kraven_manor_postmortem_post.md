■ 概要
『Kraven Manor』の game designer Ben Roye が、半ランダム生成の大構想を学生 project で実装しようとして破綻し、5部屋の linear horror と Room Table へ縮小するまでを振り返った postmortem である。初期案はボードゲーム『Betrayal at House on the Hill』に着想を得ていた。技術側が story room、exploration room、puzzle room、safe haven を組み、3種類の haunt から1つを選ぶ。順序を固定すべき物語要素だけ level designer が制御し、それ以外を structured randomness に委ねることで、player ごとに異なる館と replayability を作る狙いだった。

最初の Proof of Concept Technology は見かけ上成功した。modular asset により2週間半で約20分歩ける demo ができ、半ランダムな部屋接続も動いた。しかし player がすることは歩行と flashlight battery の補充程度で、証明できたのは生成技術と制作速度であって、遊びではなかった。次の Proof of Concept Gameplay では flashlight resource、projector、lock と key、voice acting、outdoor area、壁の変形、3D map を使う room shifting puzzle を足したが、先に大量生成した部屋を polish する時間を取れず、学生 project で扱える content 量を超えた。とくに structured randomness は、差を体感できるだけの部屋と haunt を揃えなければ利点が現れない。著者はこの段階を、面白く仕上げられると証明できなかった失敗と判定している。

vertical slice では bare essentials まで切り、structured randomness と多くの機能を廃止した。horror は音、照明、post-process、scare の上昇と下降を順序立てる必要があるため、Library、Wine Cellar、Bedroom、Entryway、Kill Room の5部屋を通る linear experience に変更した。一方、player が館の architect になる感覚は残し、room shifting を kernel of fun として Room Table に集約した。部屋 model を持ち帰る、entryway に接続する、door の向きを回す、既存の部屋の先へつなぐ、離れた room island への橋を作る、という5つの行為を一つの装置へ束ねた。さらに minute-to-minute の行為が薄い問題には、『Resident Evil』を参照した Examine mechanic を加え、光る object を調べる短い操作で story、雰囲気、puzzle clue を供給した。結論は、案の大きさを守るのでなく、何が体験の core かを問い直し、最良と思う案でも何度も壊して証明し直すべきだというものだった。

■ 内容分析
この記事で重要なのは、procedural generation の是非ではなく「content multiplier を払う前に、その構造が遊びを増幅するかを証明できていなかった」という失敗である。modular asset は部屋を速く作れたが、部屋ごとの行為、pacing、story、scare、polish まで自動的に増やさない。生成可能な接続数が増えるほど、組合せごとの破綻確認と、違いを意味ある体験にする authored content が必要になる。20分の demo は量の証拠にはなったが、移動以外の decision density が低く、production success を gameplay success と誤認させた。

scope down も単純な機能削除ではない。削った後に「Keep it scary」という体験目標を置き、linear 化を音響と演出の制御能力へ変換し、残した room shifting を Room Table の操作列へ再設計している。大構想の縮小で独自性を失わず、architect という感情だけを小さな system に濃縮した点が有用である。Examine mechanic も後付けの収集物ではなく、探索中の action 不足、物語の再導入、雰囲気づくりを一操作で解く。つまり一機能一問題ではなく、限られた機能を複数の設計目的へ働かせることで vertical slice を成立させている。

ただし評価根拠は弱い。記事は team 内の milestone 判断と完成後の自己省察が中心で、structured randomness 版と linear 版の比較 playtest、player 数、恐怖反応、完走率などを示していない。Room Table が実際にどれほど replayability や agency を生んだかも定量化されていない。linear horror なら常に優れるとも言えず、生成構造が成立しなかった主因には team 規模、期間、content authoring 能力がある。完成版が5部屋に限定された事実を一般的な正解にせず、「必要 content と検証面積を見積もった結果」として読む必要がある。

■ 自分達の環境への適用
新しい game prototype の最初の review に、機能一覧だけでなく `content_multiplier` と `proof_type` を置く。各機能について、成立に必要な enemy、room、animation、text、sound の variant 数、組合せ検査数、polish 対象数を概算する。動いたことを示す `technical proof`、minute-to-minute の選択がある `playable proof`、複数回でも差が意味を持つ `variation proof` を分ける。procedural room が3 seed で正しく接続しても、行為が移動だけなら technical proof 止まりと記録する。

小さな検証は同じ素材で2版作ればよい。A は5部屋を seed で並べ替える版、B は順序固定で音・脅威・clue を配置した版とする。headless では到達可能性、door orientation、必須 item の取得順、soft lock、各部屋の滞在時間、入力の種類、無操作区間を deterministic に測る。生成版の graph が壊れないことと、遊びが増えたことを分離するため、human review では最初の5分に起きた意味ある判断、予測できた演出、再訪時に変化として認識できた箇所を記録する。seed 差が通路順の違いに留まり、判断や緊張曲線を変えないなら variation proof は不成立とする。

scope を畳む時は、機能を個別に残す投票をせず、player に残したい感情を一文にする。そこから最小の player-authored action を選び、複数の役割を一つの装置へ束ねる。Room Table に相当するものが、移動先選択、進行可視化、収集の意味づけ、空間 puzzle、agency を同時に担えるかを見る。制作記憶には「削除した機能」だけでなく、削除理由、救出した感情、再統合先、technical/playable/variation のどの proof が不足したかを残す。後から似た大構想が出た時、機能名でなく失敗した cost 構造を recall できる。

■ メリット・デメリット
メリットは、早い technical demo による過信を防げること、procedural 構造の隠れた content cost を実装前に見える化できること、scope down を独自性の放棄ではなく感情の濃縮として扱えることにある。一つの操作を progression、narrative、puzzle に兼用すれば、小規模でも各 asset の寄与を高められる。deterministic な graph 検査と人の pacing review を分けることで、成立性と面白さを混同しにくい。

デメリットは、早期に content 数を見積もると未知の可能性まで切りやすいこと、linear 版が検証しやすいという理由だけで探索性を失う危険があること、複数目的を一装置へ束ねすぎると一箇所の失敗が全体を止めることだ。また action count や滞在時間は恐怖や agency の proxy にすぎない。headless pass を fun の証明にせず、少数でも人の反復 play と映像 review を残す必要がある。

■ 判定
部分採用。5部屋や linear horror という完成形は模倣せず、content multiplier の見積り、technical/playable/variation proof の分離、削減後に一つの感情を複数目的の操作へ再統合する手順を prototype review gate に採用する。生成構造は3 seed の成立だけで通さず、差が判断と体験を増やす証拠が出た時だけ拡張する。

■ URL
https://www.gamedeveloper.com/design/postmortem-kraven-manor
