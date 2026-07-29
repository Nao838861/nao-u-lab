■ 概要
対象は PC Gamer の特集 “The challenges of developing the colony sim, from Dungeon Keeper to Dwarf Fortress and beyond”。2026年7月に再掲された2017年の記事で、Dwarf Fortress、RimWorld、Maia の開発者取材から、colony sim の難しさを「自律する住民と player の関係を、読める出来事へ変換すること」として整理している。

出発点は、colony sim では player が住民を直接操作しない点にある。住民は欲求、感情、目標を持ち、環境や他の住民へ自律的に反応する。そのため、同じ設備や事件でも個体ごとに結果が変わり、長期観察から固有の物語が生まれる。一方で設計側には、player が何者で、どこまで命令できるかを先に決める必要が生じる。Dwarf Fortress は player を砦の “official will” と位置づけ、砦全体の建設や命令は出せるが、dwarf は自分の生活を持ち、極端な状況では命令に背く。この境界が、自律性を単なる pathfinding ではなく人格として感じさせる。

RimWorld は生成と物語の向きを反転させる。無数の simulation 結果から偶然よい物語が出るのを待つのではなく、物語を作るために生成を選ぶ。AI Storyteller は、wealth や遭遇済みの danger などを監視する story watcher と、その状態へ cargo drop、disease、raid などを返す incident generator から成る。目標は player を常に救うことでも殺すことでもなく、上昇と下降を持つ pacing curve に合わせること。苦境でも厳しい災害は起こり得るが、事件の強度と間隔を調整し、極端な challenge を drama として成立させる。

しかし director を足せば問題が解けるわけではない。部屋、item、trade、weather、hazard、敵対者、数十の agent の欲求が重なると、設計は自分の複雑性に沈む。Sylvester は player の学習量と注意を有限資源として扱い、新 mechanic がそれを消費するなら、任意化する、特定状況だけで発火させる、段階的に導入する、のいずれかへ再設計する。Maia はさらに「内部で計算されている深さ」と「player が知覚する深さ」の断絶を示す。colonist には約50の need があり、照明や社会的接触まで mood に影響するが、見えなければ存在しないのと同じである。そこで hunger、anger、fatigue のような明白な状態は animation、微妙な心理状態や基地の問題は procedural email と yes/no の提案で伝える。記事の結論は、simulation の価値は状態数ではなく、player が読み、関与し、結果を物語として受け取れるかで決まる、というものだ。

■ 内容分析
三作品の証言は、agency、pacing、complexity、information design を一本の因果鎖として読める。「player は何者か」が介入範囲を決め、その外で住民が自律するため、出来事の密度と振幅を director が整える。subsystem を増やすほど attention cost が上がり、内部状態を適切に外へ出せなければ理不尽さだけが残る。

Dwarf Fortress の procedural poetry の例は、feature growth の魅力と危険を同時に示す。tavern で楽器を演奏させたい要求が、procedural instrument、music、lyric、poetic form、dance へ連鎖した。各機能は世界の一貫性を強めるが、開発範囲と説明負債も連鎖的に増える。深い simulation は subsystem 数の合計ではなく、「前の機能が次の機能を必要とする依存 graph」で膨張する。したがって complexity budget は feature 件数では測れず、追加した状態が何個の生成器、UI、debug path、player の判断へ波及するかで測るべきである。

RimWorld の watcher と generator の分離は重要である。観測と介入を分けることで、同じ incident catalog でも pacing policy を交換できる。ただし watcher が wealth など少数の代理指標に依存すれば、実際の危機と数値上の余裕がずれる。director が生成した事件も simulation の因果に見えなければ、裏から難易度を操作された感覚になる。採用条件は、監視値が体験上の余裕を表すこと、介入が世界のルールで説明できること、厳しい事件の後に回復可能な選択が残ることだ。

Maia の二層伝達も、単なる UI の工夫以上の意味を持つ。animation は一覧性が高く interruption が弱い一方、複雑な理由や稀な問題を伝えにくい。email は因果と選択肢を直接書けるが、頻発すると inbox 処理へ退化する。重要度と曖昧さに応じて channel を変え、「常時読める徴候」と「判断を要求する説明」を分離している点が核である。約50 needs を50本の meter にするのではなく、player が行動を変えられる単位へ圧縮している。

この記事の評価根拠は、三作品の設計者による実装経験と作品間比較であり、control group、retention、理解度、事件分布の定量値はない。さらに本文は2017年時点の証言なので、現在の各作品の仕様を説明する資料としては使えない。価値は成功法則の証明ではなく、simulation が失敗する境界を具体化した設計仮説にある。

■ 自分達の環境への適用
多数 entity と連鎖 system を持つ prototype では、実装前に agency contract を一枚作る。各 action を「player が直接決める」「優先度だけ与える」「entity が自律判断する」「危機時に拒否できる」に分ける。headless run では成功率だけでなく、命令拒否の理由が state log から再構成できるか、同じ初期 seed で介入差が結果差へつながるかを見る。自律性があっても player の選択で未来が変わらなければ agency はない。

director は最初から事件生成を任せず、まず watcher-only で導入する。resource margin、直近の損失、回復手段数、操作密度を時系列で記録し、「緊張上昇→peak→回復」の区間を検出する。その後、固定 incident table から一種類だけ選ばせ、director なしの同 seed と比較する。評価軸は平均 score ではなく、dead time、不可逆な連続損失、回復選択肢の残数、同型事件の連打、介入理由の説明可能性にする。これなら pacing 改善と rubber-banding を区別できる。

mechanic 追加 gate には attention cost を入れる。新 mechanic ごとに、追加 input、常時監視する値、例外 rule、失敗時に必要な説明、既存 subsystem への依存辺を数える。高 cost なら削除だけでなく、任意化、状況限定、段階解禁のいずれかへ落とす。可視化は Maia と同様に二層化し、頻出で直感的な状態は色、動き、音、稀で複合的な状態は event log と短い選択肢にする。headless 側では内部 state と外部 signal の対応表を持ち、「重大な状態変化のうち player に観測可能だった割合」と「signal から原因へ辿れた割合」を測る。

記憶システムにも同じ原則を使える。atom や candidate に内部 field を増やすだけでは深さにならない。通常の recall で読む signal、異常時だけ出す lifecycle evidence、判断を要求する handoff を分け、情報量ではなく次の action が変わるかで保持価値を判定する。

■ メリット・デメリット
メリットは、simulation の厚みを「状態数」から「agency contract→pacing→attention budget→伝達」の接続へ置き換えられること。各要素を小さな deterministic probe に分解でき、面白さを直接測れない段階でも、理不尽な拒否、事件の連打、見えない因果、監視負荷を検出できる。watcher と generator の分離、状態ごとの伝達 channel 分けは、規模の小さい試作にも移植しやすい。

デメリットは、開発者証言中心で定量的な優劣が証明されていないこと、三作品の UI、規模、player 層が違うこと、2017年以後の改善を含まないこと。特に AI Storyteller を表面だけ模倣すると、少数の proxy に合わせて敵を増減するだけの不透明な difficulty control になる。needs を増やして log を詳しくしても、player の判断が変わらなければ複雑性と debug cost だけが増える。

■ 判定
部分採用。採用するのは player identity の明文化、watcher／generator の分離、attention cost を使う mechanic gate、状態の重要度に応じた二層伝達である。作品固有の約50 needs や万能 director は移植しない。まず一つの prototype で agency contract と watcher-only log を作り、同 seed 比較で pacing と因果可読性が改善した時だけ incident 介入を一種類追加する。

■ URL
https://www.pcgamer.com/games/strategy/the-challenges-of-developing-the-colony-sim-from-dungeon-keeper-to-dwarf-fortress-and-beyond/
