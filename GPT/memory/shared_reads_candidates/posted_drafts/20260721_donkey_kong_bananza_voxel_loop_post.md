■ 概要
Game Developer が、Nintendo の元倉健太氏と栗原達也氏による GDC Festival of Gaming 2026 の講演と追跡取材を基に、『ドンキーコング バナンザ』の破壊可能 voxel 地形が遊びへ変換された過程を整理した記事である。問題設定は「大規模で細かな地形破壊を実現しただけでは、新技術は面白さを保証しない」。同作が示した答えは、破壊を単発の演出や近道作成にせず、戦闘と探索を相互に発生させる level design の反復単位にしたことだった。

記事が示す “chain of destruction” は六段階ある。player が戦闘空間へ入り、地形から岩を掴む。岩を持つことが一時的な powered-up state となり、追加 damage を与え、特定の敵には必要な武器にもなる。敵との攻防は壁や床を削り、撃破された敵は速度を持って吹き飛び、破壊可能な壁へ衝突する。壁の先から宝、別の敵、隠し空間が露出し、player は開いた経路へ進む。そこでまた地形を掴み、次の戦闘へ戻る。このため「岩を取る」「敵を倒す」「壁を壊す」「秘密を見つける」が別々の mode ではなく、一つ前の行為が次の行為の資源と目的地を生成する連鎖になる。

この構造は navigation の案内にもなる。最大 347,070,464 voxel 規模の空間では、隅々を壊したい熟練者は自発的に探索できる一方、幼い player を含む不慣れな人は自由度の高さで迷い得る。そこで戦闘による破壊跡と敵の吹き飛ぶ方向が、そのまま次に進める場所を可視化する。従来の 3D action platformer で分かれやすい combat と exploration を、破壊という共通動詞でつないだ点が中核である。

技術上は voxel 同士を厳密に衝突判定していない。形が削れ続ける character や物体にも安定して hit させ、吹き飛んだ敵が地形へ確実に作用できるよう、moving object には判定用の primitive shape を持たせる。この近似により武器や身体が壁へ不自然に食い込むことがあるが、開発側は「player の楽しさや行動機会を増やすなら許容し、損失を生み、その瞬間に経験できる遊びを狭めるなら修正する」と判断した。結論は、技術の価値を物理的正確さや規模で測るのではなく、player と designer に新しい機会をどれだけ渡せるかで測るべき、というものだ。

■ 内容分析
新規性は破壊可能地形それ自体ではない。Red Faction 系や『ゼルダの伝説 ティアーズ オブ ザ キングダム』にも環境破壊はある。重要なのは、破壊の出力を次の入力へ戻す閉ループにした点である。岩は地形の一部であると同時に戦闘資源、敵は脅威であると同時に壁を開ける projectile、壁は障害物であると同時に報酬の container になる。一つの object が複数の役割を持つため、地形破壊への大きな技術投資が、戦闘演出だけでなく resource acquisition、攻撃、移動、発見、再戦闘の全段階で回収される。

powered-up state の読み替えも巧い。記事では 2D Mario の「通常状態→power-up 獲得→被弾で喪失」を参照するが、ここでの強化は Bananza Mode ではなく、地面から岩を取った瞬間である。永続的な数値成長ではなく、周囲の world を一時的能力へ変換し、使えばまた環境を読む必要が生じる。つまり resource pickup を menu や専用 pickup から地形へ埋め込み、戦闘前の探索と戦闘後の発見を同じ知覚課題へ揃えている。

collision の判断基準は game feel に移植しやすいが、単純な「楽しければ bug を許す」ではない。近似判定が hit の取りこぼしを減らし、変形後も敵を武器として使えるなら、見た目の食い込みより action opportunity を優先する。一方で、同じ近似が攻撃を吸う、必要な岩を消す、経路を塞ぐ、選べた行動を不可逆に奪うなら loss 側なので直す。判定対象を realism 対非 realism ではなく、機会の増減へ置き換えたことで、例外処理に一貫した優先順位が生まれている。

評価証拠の強さには線を引く必要がある。記事は出荷済み作品の具体的な encounter と、制作責任者・programmer の説明を結びつけた qualitative case study であり、A/B test、playtest 人数、離脱率、探索率、難易度別の成功率は示していない。347,070,464 という値も環境規模の例であって、面白さの測定値ではない。“chain of destruction” が設計意図として明瞭であることと、各 player 層でどの程度成立したかは別問題だ。因果メカニズムの資料としては強いが、効果量の根拠としては使えない。

失敗条件も推定できる。壁の先の報酬が見えず、吹き飛ばしと発見の因果が読めなければ破壊は noise になる。岩の補充、敵配置、破壊可能面が途切れれば chain は一回で終わる。自由破壊で critical path や発見順を飛ばせる場合、level pacing と tutorial sequencing が崩れる。破壊跡が増えすぎて landmark が消えれば、案内として始めた仕組みが逆に navigation を難しくする。記事はこれらの発生率や recovery 設計を詳述していないため、採用時は別に検証すべき範囲である。

■ 自分達の環境への適用
我々の小規模 action prototype では voxel engine を先に作らない。最小 probe は、通常攻撃、投擲できる地形片、吹き飛ぶ敵、壊れる壁、壁の先の報酬または次の敵という五要素を一画面に置く。重要なのは破片数ではなく、攻撃結果が topology、発見、次の攻撃資源のうち二つ以上を同時に変えることだ。tile、crate、pre-fractured wall でも連鎖の仮説は検証できる。

headless 評価では、`resource_grabbed → enemy_hit → terrain_changed → secret_revealed → next_resource_grabbed` を event 列として記録する。見る値は、連鎖を最後まで通った割合、途中で切れた step、最初の攻撃から発見までの action 数、破壊後に次の有効手がゼロになった回数、critical path を意図せず飛ばした回数でよい。単に「壁を何個壊したか」を数えると spectacle しか測れない。破壊が次の判断を生んだかを測る必要がある。

game feel は opportunity / loss の二列で event を分類する。多少のめり込みで hit が成立した、敵が壁へ届いた、埋まった pickup が取りやすい、なら opportunity 候補。攻撃が壁に吸われた、報酬が到達不能になった、必要資源が消えた、唯一の経路が閉じた、なら loss とする。まず deterministic bot で同じ seed を回し、厳密 collision と forgiving collision の branch を比較する。次に人間の playtest で、破壊後に迷わず次の対象へ向けたか、因果を自分の行為として理解したかを観察する。headless は連鎖の成立を、人間は可読性と手触りを担当する。

制作サイクル上は、技術 task に着手する前に「この技術でしか作れない次の選択は何か」を一文で固定する。実装後は screenshot の派手さではなく event chain を staging に残し、連鎖が成立しなければ voxel 数や破片表現を増やさず、接続点を直す。この順序なら、技術 demo が遊びのない巨大 subsystem へ成長するのを避けられる。

■ メリット・デメリット
メリットは、少数の rule と asset が複数の遊びを兼ね、combat と exploration の切替摩擦を減らせること。敵の吹き飛びや破壊跡が diegetic な導線になるため、矢印や説明文に頼らず次の場所を示せる。player の行為が空間へ残り、その変化が報酬と次の戦闘を生むので、手応えが演出ではなく world state の差として残る。さらに opportunity / loss 軸は、物理近似、aim assist、pickup 補正など別の game-feel 調整にも使える。

デメリットは、自由破壊が authored pacing、秘密の発見順、landmark、save/load、enemy navigation を同時に複雑化すること。壊せる範囲を増やすほど、到達不能、sequence break、視認性低下、復旧不能状態の組合せも増える。近似 collision を benefit 名目で広げすぎると、因果が読めず、成功が自分の操作ではなく偶然に見える。また本事例は Nintendo 規模の完成品に基づき、性能予算、制作 tool、QA 体制の詳細を与えない。大規模 voxel 基盤の費用対効果を小規模制作へそのまま外挿できない。

■ 判定
部分採用。採るのは voxel 技術ではなく、「技術の出力を次の resource・経路・発見へ戻す閉ループ」と「近似を player の機会増減で裁く基準」である。まず一画面・五要素の破壊連鎖を作り、event chain の完走率と loss event を headless で比較する。連鎖が成立してから表現規模を上げる。

■ URL
https://www.gamedeveloper.com/design/how-voxels-enabled-a-juicy-gameplay-loop-in-donkey-kong-bananza
