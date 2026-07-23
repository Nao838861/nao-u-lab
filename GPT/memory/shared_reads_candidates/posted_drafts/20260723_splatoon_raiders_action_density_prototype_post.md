■ 概要
対象は Game Developer の「Splatoon Raiders started off as a tower defense game」と、その情報源である Nintendo「Ask the Developer Vol. 22: Splatoon Raiders – Part 1」。題材は、4人協力の Salmon Run を一人用へ変換する際、単純な戦力補償ではシリーズ固有の手触りを失い、core gameplay の評価軸そのものを作り直した過程である。

開発初期の問題は明快だった。Salmon Run の敵は4人で処理する前提なので、一人で同じ群れを相手にすると難しすぎる。そこで最初の prototype は、多数の罠を配置し、罠と共闘して wave をしのぐ base-defense 型になった。戦力差は埋められたが、実際には要塞を組み立てた後、その成果を見守る時間が増えた。開発者はこれを「Splatoon らしくない」と判断した。

転換点は、シリーズ固有感を武器、インク、イカという名詞の集合ではなく、短時間に行う動作の構造として捉え直したことにある。敵を撃つ、床を塗る、ヒトとイカを切り替える、跳ぶ、位置を変える。Splatoon の強みは、こうした異質な行動が連続し、プレイヤーとキャラクターとインクが一体に感じられる action intensity にある。自動罠は見た目上の要素を残しても、プレイヤーからこの仕事を奪っていた。

そこで要塞構築を捨て、突進、高跳び、短時間の滞空など、プレイヤー自身の行動範囲を広げる gadget へ移行した。武器に加えて二つの gadget を装備し、使用後の cooldown 中は別の gadget や武器へ切り替える。選択肢を同時に使えるようにするのではなく、再使用待ちを互いに埋め合わせる三つの行動 channel として組んだ点が重要である。敵の大群に対して停止時間を減らし、状況に合う手段を高速に選ぶ状態を、開発者はスポーツの zone や熟練作業に似た “pleasant busyness” と表現し、これを Raiders の核と判断した。

評価は統制実験や数値比較ではなく、複数 prototype を触った開発チームの質的判断である。最初の prototype は「罠を置いて見る時間が長い」、後の prototype は「武器と gadget の交替自体が満足になる」という対照で選ばれた。同時に、初期版は難度が極端で操作にも慣れにくかったため、UI、sound、進行設計まで修正した。結論は、忙しさを増やせばよいのではなく、プレイヤーが自ら状況を読み、異なる手段を切り替え続け、その因果を理解できる密度を作ることだった。

■ 内容分析
この事例の価値は、prototype の失敗を genre の不一致で片づけなかった点にある。tower defense が悪いのではない。罠が敵を倒す時間には、配置結果を観察し、予測が当たったことを味わう別種の楽しさがある。しかし、その時間配分では「プレイヤーの身体が次々に別の仕事をする」という Splatoon の強みが前面に出ない。つまり失敗原因は機能の不足ではなく、agency の置き場所と単位時間あたりの行動構成だった。

また、最終形は action 数の無制限な追加でもない。二つの gadget に cooldown を置き、武器を常時の基底行動にすることで、一つの強い操作の連打を防ぎながら代替行動を残している。cooldown は単なる使用制限ではなく、「今使えないもの」から「今できる別の仕事」へ注意を移す scheduling 装置として働く。ここでは downtime の削減と situational choice が同じ仕組みから生まれる。

さらに Nintendo の一次資料は、pleasant busyness の失敗条件も示している。画面が過密なだけでは、背後から攻撃された理由が分からず、不公平感になる。このため sound team は Salmonid への命中音を damage 量で変えるなど、視界外を含む状況理解を音で補った。進行全体では忙しさを徐々に増やし、操作を学びながら高密度状態へ到達させた。高度な multitasking を入口の条件にせず、装備強化とプレイヤー自身の習熟を並行させている。

目的の削り方も一貫している。当初は Salmon Run のように Golden Egg を container へ運ぶ案があり、conveyor belt 型 gadget まで試したが、納品は gadget 戦闘の焦点を割くため削除した。一方、移動する理由は必要なので、卵を拾う要素は残した。これは「元モードの要素を残すか消すか」ではなく、各要素が action loop へ与える仕事だけを見て再編した例である。罠由来の設置 gadget も、最終的には敵を能動的に倒す方向へ絞られた。

ただし、記事から「行動切替回数が多いほど面白い」と一般化するのは危険である。公開資料には入力頻度、失敗率、初心者の離脱、長時間疲労、比較 playtest の人数がない。発売前の開発者 interview なので、採用案を説明する selection bias もある。観測できるのは設計仮説と prototype 間の因果であり、万人に対する効果量ではない。この限界を保ったまま、評価軸の作り方を借りるべきである。

■ 自分達の環境への適用
小型 action prototype では、機能一覧より先に「30秒の仕事配分」を比較する。二つの build で敵数と stage を揃え、30〜60秒の capture と event log を取る。記録するのは、攻撃・移動・回避・収集など意味の異なる行動への切替、主要手段が使えない時間、何も判断せず結果を見る時間、同一行動の連打時間、死亡原因を画面や音から説明できるまでの遅延である。単純な input 数ではなく、状況変化に応じた有効な仕事の交替を測る。

headless 評価では、`action_channel`、`cooldown_remaining`、`threat_visible`、`damage_source_known`、`player_controlled_effect` を時系列に残す。そこから、全手段が同時に塞がる区間、最適手段が一つに固定される区間、自動処理の結果待ちが支配する区間を検出できる。ただし pleasant busyness 自体は主観的な身体感覚なので、headless の値だけで合否を決めない。同じ seed の短い人間操作 capture を並べ、「忙しいが読める」「忙しいだけ」「暇だが先を考えている」を区別する校正資料にする。

実装 probe は小さくできる。一つの prototype に、A: 強力な設置物が自動攻撃する版、B: 短い cooldown を持つ移動技と攻撃技を交替する版を作る。敵の総耐久とclear時間を近づけた上で、B が待機を減らすだけでなく、位置取りや標的選択を増やすかを見る。次に情報 channel を一つずつ足し、被弾方向の音、cooldown 完了音、危険度の高い敵の音が、混雑時の原因理解を改善するか比較する。最後に序盤の敵数を下げ、行動 channel を段階解禁して、最終密度へ学習で到達できるか確認する。

制作サイクルへの残し方も変えられる。「この案は作品らしくない」という感想だけでは再利用できない。`identity_axis: active action diversity`、`failure: player agency moved to automation`、`repair: overlapping alternatives with cooldown`、`readability_support: audio + gradual escalation` のように、失敗した構造と修復原理を対で atom 化する。これなら別 genre でも、作品固有感を名詞ではなく時間配分として比較できる。

■ メリット・デメリット
メリットは三つある。第一に、「らしさ」を lore や asset の一致から、観測可能な player activity へ近づけられる。第二に、失敗 prototype を捨てるだけでなく、どの時間が期待した体験を奪ったかまで診断できる。第三に、cooldown、音、progression、objective 削減を別々の polish ではなく、行動密度を成立させる一つの系として扱える。

デメリットは、計測しやすい busy 指標が目的化しやすいことだ。切替回数を最大化すると、意味のない button juggling、状況を考える余白の消失、情報過多、疲労を招く。自動化や観察時間も、罠の予測、deck 構築、resource planning が核のゲームでは価値がある。また、開発者自身の熟練後の感触だけを基準にすると、初心者が可読性を獲得する前に脱落する。行動密度は genre 横断の正解ではなく、目標体験と一致しているかを調べる診断軸である。

■ 判定
部分採用。採用するのは、作品固有感を「短時間の有意味な行動構成」として prototype 間で比較する方法、cooldown を代替行動へ注意を回す装置として使う方法、忙しさと可読性・学習曲線を同時に検証する方法である。切替回数の最大化は採用しない。次の action prototype で、同じ敵条件の30〜60秒 capture と event log を使い、自動処理版と複数 action channel 版を比較する probe に落とす。

■ URL
https://www.gamedeveloper.com/design/splatoon-raiders-started-as-a-tower-defense-game-but-its-splatoon-ness-got-lost
https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-22-splatoon-raiders-part-1/
