■ 概要
『The Turing Test』の design director / writer David Jones が、18か月・約11万ポンドの小規模 production で first-person puzzle game を完成させ、約100万ポンドの売上、Steam 20万超 owner、全 platform 平均 Metacritic 76へ到達するまでの設計と代償を記した postmortem である。開始時の目標は、低予算で会社を生き残らせる、主人公を marketing icon にする、一つの puzzle mechanic を深く掘る、大きな story twist を持つ、の4つだった。記事は成功を production の成功と位置づけつつ、中心 mechanic の独創性不足、linear progression、秘密と販促の衝突、終盤の team fatigue まで自己批判している。

77個の puzzle room は個別 art で作らず modular workflow を採用した。外観の均質化は、章ごとの story room と大きな lighting change で区切った。first person にして animation 費を抑え、宇宙 station を舞台にして environment art を制限し、8 character に4 voice actor、store asset と custom art の混用、2つの character model、1つの exterior area など、予算制約を camera、setting、story 構造へ変換した。最初の3か月は1人、次の9か月は6人、最後の6か月は9人という増員で、puzzle と mechanic を小人数で作ってから full production へ移った。

puzzle 制作には実装を含め約1年、約250 work day を使い、平均すると3日に1室だが、実際には77室以上を作って統合・削除した。全 puzzle を white box で組み、local college の game design student に通しで遊んでもらい、各室後の fun と difficulty の主観評定、playtime を記録して difficulty curve を調整した。ただし数値で design の flair を均す危険を認識し、player behavior の観察をより重視した。それでも linear な順序のため、特定 puzzle を解けない player が別問題へ迂回できない。open structure はこの詰まりを緩和できるが、物語の順序と衝突するため採用しなかった。

著者が fatal flaw と呼ぶのは、基礎 mechanic がよく展開された一方、実質的には conventional な transport puzzle、視覚化された Sokoban で、Portal や Braid のような独創性がなかったことだ。後半には TOM が Ava と worker robot を操作する character swapping が加わり、視点切替と協力 puzzle が作品固有の強みになる。しかし「player は Ava ではなく TOM」という中盤の twist と一体なので、marketing、preview、review で最良の mechanic を見せられなかった。複数の human を切り替える初期案も、高品質な AI と animation を賄えず、1人の human と複数 robot へ縮めた。結論は、player が実際に過ごす場所へ時間と予算を集中し、scope を絞ったから完成できた一方、秘密の見せ場や基礎 mechanic の弱さは成功上限を作った、というものだった。

■ 内容分析
この記事の価値は、production constraint を単なる削減表ではなく、作品の知覚可能な形へ変換している点にある。animation が高いから first person、environment art が高いから宇宙、77室を個別造形できないから modular room、voice actor を増やせないから対立する2者の会話へ集中する。制約と fiction が同じ方向を向くため、安価な代替物を並べた印象を弱めている。一方、均質化は消えておらず、story room と lighting change を意図的な高密度箇所として配置する。全箇所を同じ品質へ上げず、反復する低コスト層と記憶に残す高コスト層を分けた production topology と読める。

white-box playtest も、平均 fun score の高い順に並べるだけではない。difficulty、playtime、行動観察を併用し、数値が滑らかでも解法発見の瞬間や個性が失われていないかを見る。ここでは telemetry が判断を代替せず、異常箇所を見つける索引になっている。ただし記事は tester 数、評定尺度、分散、離脱率、変更前後の比較を示していない。「somewhat reasonable」な curve という著者評価以上の再現性はない。game design student は一般 player より puzzle literacy が高い可能性もあり、77室を通しで評価した疲労や学習効果も分離されていない。

秘密 mechanic の問題は marketing だけではない。作品固有の breadth を量産前に検証しようとしても、twist を守ると外部 tester、publisher、store page に核心を見せにくい。結果として公表可能な前半の transport mechanic が第一印象を担い、最も強い character swapping は作品の半ばまで価値を証明できない。story surprise と mechanical identity を同じ一点へ重ねると、驚きは強くなるが、購入判断、早期 feedback、離脱前の差別化を同時に失う。秘密を守るか公開するかの二択ではなく、spoiler にならない公開用 hook と、後半で意味が反転する hidden depth を分ける必要がある。

■ 自分達の環境への適用
puzzle prototype では77問を作る前に、10問程度の mechanic breadth test を置く。最初の3問で基本 verb、次の4問で他要素との組合せ、最後の3問で視点・制御対象・ルール解釈の反転を試す。各問に `intended_insight`、`minimum_actions`、`observed_strategy`、`fun_rating`、`difficulty_rating`、`solve_time`、`reset_count`、`hint_point` を残す。headless solver は到達可能性、解の有無、最短手数、state explosion、soft lock を測り、人の観察は迷いの原因、誤った仮説、解けた瞬間の理解を記録する。solve time の曲線だけで順序を決めず、同じ数値でも新しい考え方を要求した問題を残す。

production review には「削減額」ではなく、制約をどの設計判断へ変換したかを書く。animation budget、unique environment 数、voice、camera、character AI、puzzle authoring 日数を同じ sheet に置き、player の滞在時間が長い箇所へ custom asset と検証時間が寄っているかを見る。

秘密 mechanic がある企画では、`public hook`、`hidden mechanic`、`reveal timing`、`pre-reveal retention` を別項目にする。公開 trailer や最初の10分で見せても twist を壊さない操作上の個性が一つもない場合、量産へ進めない。hidden mechanic は reveal 後だけテストするのでなく、内容を知らない tester 群と spoiler 許可群を分け、前者で到達率と期待形成、後者で mechanic breadth と販促可能な抽象表現を検証する。制作記憶には、秘密を守った結果失った feedback と、公開可能な代替 hook の有無を evidence として残す。

■ メリット・デメリット
メリットは、budget を作品設定と interaction の制約へ変換できること、art production 前の white box で大量 authoring の失敗を安く捨てられること、主観評定・時間・行動観察を併用して難度曲線と設計個性を両方守れることにある。

デメリットは、低予算最適化が overtime と team fatigue に転嫁されうること、modular workflow が視覚的・構造的な単調さを生むこと、linear curve が一部 player の完全な blocker になることだ。数値評価は tester 構成と session 条件に依存し、headless solver は驚きや美しさを測れない。秘密 mechanic の扱いは retention と発見の価値を人の playtest で比較する必要がある。

■ 判定
部分採用。white-box 量産前の mechanic breadth test、数値と観察の併用、制約を camera・setting・asset 配分へ変換する review sheet を採用する。さらに hidden mechanic とは別に spoiler-free な public hook を早期検証する。77室という量や linear structure は模倣せず、10問 probe で基礎 verb の独創性と reveal 前後の価値が確認できた場合だけ拡張する。

■ URL
https://www.gamedeveloper.com/business/postmortem-building-i-the-turing-test-i-around-a-secret-mechanic
