■ 概要
この記事は、約6時間で作られた小型 dungeon crawler「rpg sketch 24」の戦闘設計を振り返った制作記録である。中核の着想は、攻撃と防御を一人の player character に持たせず、「player が直接操作する防御役」と「自律行動する高火力の護衛対象」へ分けることにある。主人公 Marie-Louise は丈夫だが攻撃性能が低く、status ailment を中心に敵の行動を止める技能を持つ。Jusztina は脆い代わりに敵を倒せるが、player は命令できない。したがって player の仕事は、敵が誰をどう傷つけるかと、味方 AI がどの敵を狙うかを読み、必要な threat だけを先回りして shut down することになる。

作者の狙いは単なる操作削減ではない。自律 character が常に最適な token として動くのではなく、ある程度一貫した癖を持ち、player がその癖を経験から学ぶことで、二人の間に協調と人格感を生むことだった。RPG Maker 2000 の AI は内部 logic が不透明で細かく制御できないが、Jusztina の実際の挙動は偶然よい範囲に入った。敵の弱点を有利なら突き、単発の最大 damage より kill 数を優先し、残 HP の少ない敵には MP を節約して通常攻撃を選ぶ。一方で、より安く強い Blast があるのに G-Blast を好む場合もある。この「だいたい読めるが完全には従わない」性質が、予測時の suspense、外れた時の frustration、当たった時の relief を生み、character を操作駒以上に感じさせた。

しかし作者は、この成功が戦術の深さへ十分つながっていないと自己評価する。二体の Trooper と一体の Warmage を見て、Jusztina が G-Wind で Trooper 二体を倒すと正しく予測できても、彼女は Trooper より遅く行動する。その round では敵の攻撃を受けた後に倒すため、予測しても防御選択の計算が変わらない。敵設計時に Marie-Louise の防御 skill との相互作用だけを考え、味方 AI と敵の speed order を同じ設計問題として扱わなかったことが原因だった。

外部 playtest からは、さらに多くの戦闘に「理想手」がなく、どの防御を選んでも別種の大きな被害を受けるという指摘が出た。作者自身も、選択後に勝った感触がないことを不満と認める。ただし、全 encounter を正解手で無傷に解ける puzzle にするのも望んでいない。被弾を残しながら判断を豊かにするには、防御 toolset、参加 character 数、enemy threat の種類、行動速度をどう組み合わせるかが未解決である。結論は、味方 AI の不完全な一貫性は関係性を生むが、その予測が player の次の一手を変え、結果差へ間に合うよう turn order と threat を設計しなければ、面白い観察が戦術にはならない、という反省である。

■ 内容分析
この prototype の最も鋭い点は、companion AI の品質を「最適行動率」で測っていないことだ。Jusztina が常に最大効率なら player は計算機を読むだけになり、完全 random なら学習不能になる。弱点利用、kill 優先、MP 節約という可読な優先則と、G-Blast への妙な偏りが同居することで、player は確率付きの mental model を作れる。人格感は台詞量だけでなく、「この状況なら彼女はこうするはずだ」という反復可能な予測から生じている。

ただし予測には少なくとも三条件が要る。第一は legibility で、player が過去の行動から傾向を抽出できること。第二は agency linkage で、その予測に応じて player 側の行動を変えられること。第三は temporal efficacy で、変えた行動が対象 event より前に結果へ作用することだ。本作は第一を満たし、Marie-Louise の status skill によって第二も形式上は持つが、Jusztina が敵より遅いため第三が切れている。ここが記事固有の失敗であり、AI の賢さを上げても直らない。必要なのは speed、target、threat window の encounter 設計である。

「理想手がない」という指摘も、単に難しいという意味ではない。複数の損失から選ぶ戦闘は成立するが、各選択の損失量が大きく、味方 AI の予測により順位が変わらなければ、player は意味のある trade-off ではなく被害の受容を選ばされる。無傷の唯一解を作らずに勝った感触を出すには、被害をゼロにする正解より、予測によって最悪の threat を消す、resource 消費を先送りする、次 round の kill を一手早める、といった局所的優位が必要になる。

player は AI の target を上書きせず、自分の防御で AI が働ける盤面を作る。直接 command を増やすほど自律性は薄れ、policy を完全に隠すほど失敗が理不尽に見える。行動 animation や target 表示で学習に足る signal を出しつつ、最後の揺らぎを残す必要がある。

評価の弱さは明確である。制作時間は約6時間、記事が示す外部評価は友人一人の指摘で、encounter 数、選択分布、被害量、予測成功率、再 play 結果はない。RPG Maker 2000 の不透明な既製 AI が偶然よく動いた事例なので、priority rule の再現性も示されない。作者の観察は設計仮説として価値が高いが、一般則の実証ではない。また制作工程が速い一方で formulaic に感じ始めたという反省は、prototype 生産速度と探索の新規性が別指標であることも示している。

■ 自分達の環境への適用
自分達の combat prototype では、味方 AI を高性能化する前に「予測が一手を変えたか」を測る。最小構成は player-controlled defender 一人、autonomous attacker 一人、役割の違う enemy 三種でよい。attacker には `weakness exploitation > kill confirmation > MP conservation > fallback preference` のような優先則を持たせ、最後に小さな揺らぎを入れる。各行動後に rule id、候補 target、選択理由を log し、画面上は理由を直接説明しすぎず、animation や target 表示で傾向を学べるようにする。

encounter は同じ敵構成で speed order だけを変えた A/B を作る。A では attacker が全 enemy より遅く、B では一部 threat より速い。playtest では「次の味方行動を何だと予測したか」「その予測で防御行動を変えたか」「変えた結果、被害、resource、次 round の盤面が改善したか」を一 decision ごとに記録する。予測正解率だけを上げても、行動変更率と結果差がゼロなら設計失敗と判定する。headless では全 encounter state から AI policy を固定 seed で回し、各 defense choice が threat ordering を変える state の割合を数える。

無傷の唯一解を避けるため、評価は perfect clear ではなく regret の幅で行う。各 turn に、最良選択との差、避けられなかった被害、予測により回避できた最大 threat、消費 MP、護衛対象の生存余裕を記録する。すべての選択が同程度の大損なら「正解がない」のではなく「区別できる価値がない」。一方、被弾は残っても最悪手と良い手に説明可能な差があれば、損失を選ぶ戦闘として成立する。

制作 cycle では、AI rule、enemy threat、turn order を別々に調整せず、一つの interaction table で管理する。各 enemy について、発動時刻、対象、被害種別、status 耐性、attacker が先に倒せる条件、defender が妨害できる条件を並べる。player test の原文は「AI が賢かった／馬鹿だった」という感想で丸めず、「何を予測し、何を選び、いつ結果が出たか」の trace と一緒に残す。これにより、人格の評価と戦術価値を混同せず次の diff へつなげられる。

■ メリット・デメリット
メリットは、player の操作量を増やさず二人で戦う協調感を作れること、完全最適でない AI の一貫した癖を character 性へ変えられること、攻撃を任せることで防御と threat 読みを主役にできることにある。policy が小さければ headless で予測可能性と結果差を網羅しやすく、speed order の A/B も安価に作れる。

デメリットは、可読性、不完全性、実効性の釣合いが崩れやすいことだ。AI が遅すぎれば予測は無価値になり、速すぎて敵を消せば防御役が不要になる。揺らぎが大きいと理不尽、小さいと自動処理に見える。直接 command や理由表示を増やしすぎると人格感を失う。さらに本記事の根拠は短時間の一 prototype と少数の感想であり、長期 play で癖が飽きに変わるか、複数 character で認知負荷がどう増えるかは未評価である。

■ 判定
採用。味方 AI の評価軸を最適行動率から、可読性、予測による player 行動変更率、結果へ間に合う時間的実効性の三つへ拡張する。まず speed order だけを変えた小型 A/B encounter と decision trace を作り、被弾ゼロではなく、予測が最悪の threat を減らしたかで判定する。AI の大規模化や直接 command の追加は、この最小検証で戦術価値が確認できるまで行わない。

■ URL
https://tunditur-unda.itch.io/rpg24/devlog/1564293/authors-notes
