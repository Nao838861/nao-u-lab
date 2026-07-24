■ 概要
Fika Productions の『Don't Kill Them All』は、「軍勢を率いるなら道中の全てを殺し、破壊するほど得なのか。採取する資源まで消してしまわないか」という疑問から始まったターン制ストラテジーである。プレイヤーは攻撃的なオークを強化する一方、力を無差別に振るわせず、採取 node や戦場の資源を守らせる。通常の power fantasy が damage と stats の最大化へ向かうのに対し、本作は「得た力をどこまで使わないか」を判断対象にする。既製の戦闘へオークの外見を被せず、lore と主題を決め、それに合うよう design を変えた theme-first の企画である。

初期制作では戦術、戦闘、拠点建設を薄く同時に作る案と、一つを縦に完成させてから広げる案を比較し、後者を選んだ。最初に node protection、node gathering、予告された敵 AOE の threat management を含む encounter を作り、「戦闘で残した資源を何に使うか」という次の問いから camp 建設を導いた。守った資源で mud pit や workbench が建ち、拠点が目に見えて育つため、戦闘中の節制が単なる縛りではなく、帰還後の進行へ変換される。遠征と帰還は Darkest Dungeon、脅威の予告は Into the Breach、日ごとの活動と macro loop は Stardew Valley、unit への愛着は Wartales と XCOM を参照している。

raid は完全な procedural generation ではない。20×20 tile の地形と木などの set dressing は人が整え、room の前後関係も tree として指定する。その上で algorithm が room を置く領域を毎回変え、同じ access point を繰り返す感覚を弱める。個々のオークは agitation のような trait、武器、装備、移動手段を組み合わせるが、固定 class は提示しない。例えば agitation は射程許容量3・移動7を与え、war scythe や leap と組み合わせれば、player 自身が高機動役という archetype を発見する。外見は飾りだけでなく、その build と戦闘履歴を思い出す索引になる。

専任 modeler がいない制作制約には、等角投影で描いた2D asset から mesh を作り、camera に合わせて押し出す2.5D projection で対応した。太い textured line と単純な silhouette は zoom in / out と複数 unit の同時表示でも判別しやすくする。公開 demo では同じ bug の報告人数で修正優先度を決め、好反応の強い既存機能を予定済み system で増幅する材料にしている。結論は、主題を説明文に留めず、戦闘の制約、報酬、macro progression、unit 表現、制作 pipeline まで一つの因果へ通すと、少人数でも固有性のある戦略ゲームを組み立てられる、という開発事例である。

■ 内容分析
最も強い設計は「殺さないこと」を道徳点ではなく、失うと camp の成長が遅れる資源保存問題へ変えた点にある。戦闘中の node 保護と、帰還後に建物が増える視覚的 feedback の間に因果があるので、player は節制の意味を台詞ではなく結果として理解できる。ただし、保護対象が単なる追加 HP bar になれば主題は escort mission の言い換えに縮む。敵を早く倒す安全策と、AOE を誘導して資源を残す高収益策が同時に成立し、局面ごとに損失許容を変えられることが必要である。常に全資源保存が正解なら、reverse power fantasy ではなく唯一解の作業になる。

encounter を先に縦へ作った順序も重要である。拠点を先に大量設計せず、戦闘で何が残り、何が持ち帰られるかを確定してから消費先を作るため、macro system が core action から遊離しにくい。一方、記事自身が Stardew Valley 由来の年・日・活動 system は design 上は存在しても production は途中だと認めている。現在確認できるのは encounter→camp の短い loop の整合性であり、長期 progression の反復耐性、経済 balance、unit 喪失が愛着と再育成負荷へ与える影響までは検証されていない。

level 制作は「手作りか自動生成か」の二択を避け、品質を担う軸と変化を担う軸を分けている。歩行可能 ground、elevation、tileable な周辺装飾、room 接続 tree は人が制御し、room の配置領域だけを変える。この方式は encounter の意図と視認性を守りながら既視感を遅らせるが、構造上同じ tree を位置だけ変えても、player が攻略順や敵構成を学べば変化は表層化する。接続、目的、threat、資源配置のどこまで seed で変えるかを別々に測る必要がある。

unit 個体化には三層がある。trait と装備が戦術上の役割を作り、単純な顔・髪・silhouette が画面上の識別子になり、戦闘中の出来事が「蜘蛛の巣に絡まった個体」のような player 内 narrative を作る。class 名を先に与えず、組合せから役割を発見させるため、build は所有感を持ちやすい。ただし自由度が高くても、有効な組合せが少数へ収束すれば実質 class は隠れているだけになる。2.5D pipeline も同様に、modeler 不在を美術上の署名へ変えた好例だが、projection は modeling 工数を消す魔法ではなく、camera、遮蔽、mesh extrusion、当たり判定の規約を増やす。記事は工数比較や性能値を示しておらず、「短縮できた」は開発者の定性的評価として扱うべきである。

■ 自分達の環境への適用
短期プロトタイプには、長い拠点建設を作る前に「1 raid、3 encounter node、帰還後1 unlock」だけを実装する。各 node に敵、保存可能資源、予告 AOE を置き、攻撃で即座に敵を減らす行動と、押し出し・拘束・移動で資源を守る行動を競合させる。帰還時に保存量を一つの建物または次戦の新行動へ変換すれば、戦闘内の判断が戦闘外へ届いたかを最小差分で確認できる。

headless 評価では勝敗だけでなく、資源保存率、被弾、turn 数、AOE 予告後の回避・誘導率、unlock 到達までの raid 数を記録する。最大 damage を選ぶ baseline、資源価値を加えた policy、将来 unlock まで見る policy を同じ seed 群で走らせ、「保護戦略が常勝するか」「短期損失と長期利益の逆転が起きるか」を比較する。全 seed で保護一択なら資源価値を下げ、破壊一択なら camp feedback か非殺傷手段を強める。この検証なら主題を文章評価せず、異なる行動系列が生じる mechanic として判定できる。

level はまず少数の手作り room と接続 tree を正本にし、配置座標、敵、資源、threat の seed を分離して replay log に残す。同じ topology の座標だけを変えた版と、資源・threat まで変えた版を比較し、到達経路、選択 action、保存率が本当に変わるかを見る。unit は一つの trait、一つの武器、一つの移動 option、明確な silhouette から始め、固定 class 名を付けない。戦闘 log に「誰が何を救ったか」を残し、終了画面で短く再提示すれば、数値 build と固有の出来事を結べる。

制作サイクル上は、demo feedback を投票として採用せず、再現可能な bug 頻度、意図した mechanic への反応、未実装機能への期待を分ける。同じ bug の件数は優先順位に使えるが、好意的な声は母集団や継続率を保証しない。各 feedback を「既存仮説を支持」「新しい失敗条件」「scope 外」に分類し、playable diff と計測値へ戻せるものだけを次 cycle に入れる。

■ メリット・デメリット
メリットは、主題→戦闘制約→保存資源→拠点成長という因果が明快で、mechanic と報酬の不一致を見つけやすいこと、core encounter を先に縦へ作るため scope を制御しやすいこと、手作り topology と限定的なランダム化を分けて品質と反復性を両立しやすいことにある。trait・装備・外見・履歴を重ねる個体化は、少数 unit でも戦術的可読性と愛着を同じ asset から引き出せる。制作制約を2.5Dの見た目へ変換した判断も、足りない職能を品質低下にしない。

デメリットは、記事が単一 studio の自己報告で、定量 playtest、A/B 比較、工数、retention、長期経済の結果を示さないことにある。demo の好反応は selection bias を含み、Early Access 前の未完成 system を成功例として一般化できない。資源保護が常に得なら戦術は硬直し、unit の自由構成も dominant build が見つかれば名目上の自由になる。room の位置変更だけでは攻略の意味的変化が乏しい可能性があり、2.5D projection は camera と遮蔽の技術負債を増やし得る。採用時は美術様式や拠点規模を模倣せず、因果 loop と検証可能な分解だけを移植すべきである。

■ 判定
部分採用。theme-first、encounter から macro progression を導く順序、手作り品質と限定ランダム化の分担、unit 個体化の三層は、小規模ゲーム制作へ直接使える。一方、完成後の長期評価と定量証拠はないため、成功作品の処方箋ではなく、1 raid の playable loop と headless 指標で反証する設計仮説として採用する。

■ URL
https://80.lv/articles/behind-the-development-of-hand-drawn-strategy-game-don-t-kill-them-all
