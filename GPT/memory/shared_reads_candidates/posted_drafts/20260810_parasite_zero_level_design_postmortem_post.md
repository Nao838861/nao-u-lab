■ 概要
対象は、『Parasite Zero』で level design、player leading、enemy design、背景、material 制作を担当した Jaedon Wallace による postmortem である。問題は、「探索する level」として先に作った空間を、後から確定した linear game にどう適合させるかだった。作者は当初、Dishonored や BioShock のように hub から複数の task へ出て戻る loop を想定し、同程度の区画をさらに足すつもりだった。しかし最初の区画だけで十分に大きく、複数 environment や、巨大な biome cylinder を回す puzzle も scope のため削除された。game が linear だと確定した時には、level は open-ended exploration 用に出来上がっており、遠端の区画を無視しても進行できるなど、導線の前提不一致が残った。

この不一致は単に「広すぎて迷う」だけではない。中心 mechanic の sound lure puzzle は、音を特定地点へ投げて enemy をそちらへ向かせ、背後を取る遊びとして設計された。ところが player は sprint で区画を通過できるため、意図された stealth 手順へ参加する理由がない。作者は sprint の削除も考えたが、終盤の時間不足から現状を受け入れ、行き先には番号 sign を大量に置く短期対処をした。さらに記事末尾では、grapple hook の射程を短くすべきだったと振り返る。長射程 grapple が広い level を要求し、広い level が高速移動を要求し、高速移動が sound lure を迂回可能にする、という連鎖である。個別には魅力的な traversal、vista、stealth puzzle が、同じ player behavior を支えていなかった。

対照になるのが boss level である。当初の大規模構成は制作量を理由に縮小されたが、最初から linear だと分かっていたため、light、shadow、set piece を使う player leading は main level より改善した。背景の巨大な肉質 web は Nanite mesh の overdraw が重く、約16 chunk に分割して画面外を cull し、残る負荷には裏側へ non-Nanite occluder mesh を置いて対処した。結論は、full-size level から game を決めるのではなく、まず一 encounter の小 level で game の形、移動、敵、中心 mechanic を確定し、その後に拡張するべきだった、という制作順の反転である。

■ 内容分析
この記事固有の価値は、失敗を asset 不足や誘導不足へ還元せず、「設計判断が互いの成立条件をどう壊したか」まで因果で記録している点にある。grapple range、level scale、sprint speed、sound lure の必要性、enemy の向き、linear progression は独立した仕様ではない。長射程 grapple を気持ちよく使える距離を用意すると移動時間が増え、その時間を短縮する sprint が必要になり、sprint が敵を操作する puzzle の費用を上回る。ここで sign を増やして解けるのは destination の認知だけで、puzzle を選ぶ動機や、迂回 route の優位は変わらない。player leading の問題に見えて、実際には traversal と stealth の報酬構造が衝突している。

boss level との比較も重要である。main level では用途が後から exploration から linear progression へ変わったのに対し、boss level は linear という制約を先に持ち、照明・陰影・大きな背景物を同じ進行方向へ従属させられた。これは厳密な比較実験ではないが、「誘導技法を追加したから改善した」だけでなく、「level の役割を先に固定したため、各技法の向きを揃えられた」と読める。scope cut 自体も悪ではない。boss 背景を流用しつつ playable space を縮めた判断や、Nanite web を chunk と occluder に分けた判断は、見せたい scale と実際に simulation する scale を分離している。main level にも同じ発想を早く適用できれば、巨大さは背景で保ち、sound lure が機能する encounter 空間だけを小さくできた可能性がある。

ただし根拠は一人の retrospective で、route ごとの通過時間、lure 使用率、迷走回数、backstab 成功率、playtester 数は示されていない。sprint を消した版、grapple range を短くした版、小 level 版の比較もない。作者の因果説明は妥当な仮説だが、広さだけでなく enemy の追跡性能、sprint の noise、resource reward、失敗時 penalty を変えても puzzle 参加率は変わり得る。Nanite 対策も hardware、Unreal version、mesh 密度、計測値がないので一般的な最適化 recipe にはできない。記事から採るべきなのは完成値ではなく、core mechanic の成立条件を level 制作前に同時検証する順序である。

■ 自分達の環境への適用
小型ゲーム試作では、最初の成果物を「世界の一部」ではなく、中心行動を一回だけ成立させる encounter にする。sound lure 型なら、入口、敵、遮蔽物、lure target、背後を取る route、出口だけを置き、30〜60秒で再試行できる大きさにする。同じ blockout で grapple range を短・中・長、sprint を無・遅・速に切り替え、意図 route と最短 bypass route を比較する。観測するのは、初回の出口到達時間、lure 投擲率、敵の向きを変えずに抜けた率、backstab 成功率、逆走・停止時間、能力ごとの使用回数である。「クリアできた」だけでなく、中心 mechanic を使うことが安全・速い・理解しやすい選択になっているかを判定する。

headless 評価では nav graph 上の到達可能 route を列挙し、sprint や grapple を使った時に encounter trigger、enemy perception、lure zone を丸ごと飛ばせないかを回帰検査する。能力値を変えるたび、意図 route と bypass route の所要時間差、危険 exposure、必要 input 数を出す。人間の playtest では、行き先を言語化できるか、lure を使う理由を説明できるか、失敗後に別の戦術を試したかを見る。sign 追加前後も比較し、sign で destination 理解だけが改善し mechanic 使用率が変わらないなら、誘導表示ではなく仕様連鎖の問題だと切り分ける。

制作 gate は三段にする。第一に一 encounter で中心 mechanic が迂回されない。第二に二 encounter を接続しても移動能力が一方を無効化しない。第三に背景、分岐、collectible を足しても意図 route の価値が残る。この順を通るまで full-size level を作らない。記憶には「grapple は何 unit」のような値だけでなく、mechanic、能力、level scale、誘導、観測指標の依存表と、どの probe で決めたかを残す。これにより後から game identity が変わった際、sign や asset の追加で覆う前に、どの前提まで戻すべきか判断できる。

■ メリット・デメリット
メリットは、scope 管理、player leading、mechanic の必然性を一つの検証可能な constraint graph として扱えること。一 encounter なら作り直しが安く、移動速度や射程の変更が stealth、経路長、視認性へ及ぼす影響を早期に露出できる。巨大さを背景へ逃がし、遊ぶ空間を小さく保つ考え方は、少人数制作でも spectacle と密度を両立しやすい。headless route 検査と短い人間 playtest の役割も分けやすい。

デメリットは、小 encounter で良い局所解が、そのまま複数 encounter の pacing や探索の魅力を保証しないこと。迂回をすべて禁止すると player agency や mastery を削り、意図解法の強制になる。高速通過が speedrun や熟練者向け選択として価値を持つ場合もあるため、「使わなかったら失敗」ではなく、初見でも mechanic の意味を理解し、使う／迂回する trade-off が成立するかを見る必要がある。また telemetry が選択理由を説明するわけではなく、定量値だけで誘導品質を決めるのも危険である。

■ 判定
部分採用。採るのは、full level より先に一 encounter で game identity と仕様依存を確定する制作 gate、そして traversal が中心 mechanic を迂回する経路を headless と playtest の両方で測る方法である。grapple range や sprint の削除を一般則にはせず、意図 route と bypass route の費用差を小さな probe で比較して決める。postmortem の因果は有力な仮説として保持し、自分達の再現 evidence が得られた部分だけを次の試作へ昇格させる。

■ URL
https://itch.io/devlog/1137764/postmortem-level-design
