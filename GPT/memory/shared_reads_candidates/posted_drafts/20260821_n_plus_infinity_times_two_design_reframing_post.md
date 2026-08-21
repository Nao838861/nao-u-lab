■ 概要
Metanet Software は新作 N PLUS INFINITY TIMES TWO を、N++ への online multiplayer 追加ではなく、N+ の multi-mode multiplayer を数十年分の経験で掘り直す別作品として設計している。出発点は、N++ の hardcore single-player platforming は十分に完成しており、同じ軸では有意な改善余地がないという自己評価だった。N++ 開発時には global level sharing と online multiplayer の両立が難しく、level editor を生かす前者を選んだ。community の高品質 level は選択の妥当性を示したが、local 限定の multiplayer がほとんど遊ばれない未解決点は残った。Ultimate Edition でも online 化の時間と費用を回収できず、資金面でも成立する新規 project にして初めて実現可能になった。

新作化した決定的な理由は、network 対応だけを後付けしても multiplayer の潜在力を使い切れないと判断したことだ。single-player と multiplayer では UI flow、presentation、player experience が根本から変わるため、2～4人が友人または matchmaking で遊ぶ前提から全体を再構成し、5つの game mode を用意する。設計軸を N から N++ へ伸びる「より洗練された single-player」の方向に延長するのでなく、それと直交する、未探索の multiplayer 空間へ向けたのである。

着想を具体化した観察が、2021年に community 主催で行われた8人の対面 tournament PN++W だった。Race Mode では、参加者が初見 level を相手と同時に読み解き、先に出口へ着いた player が rocket で残った相手を狙う。未知地形を解く競争、先着後の役割変更、観客が追える展開が同時に生まれ、local に閉じた mode を online 前提で再訪する根拠になった。

もう一つの起点は、N++ 開発中に約1か月試作した後で cut した Deathmatch である。これは N+ の Survival の問題を、player 同士が直接倒せる combat で解こうとしたものだった。方向に面白さは感じたが、十分に発掘・反復する時間がなく、半端な mode が製品全体の品質を落とすより、揃って良い状態で ship することを優先した。新作ではこの系譜を再検討し、Team Tag という有力 mode に作り直した。記事の結論は、cut を失敗として抱え込まず、一度完成品から外した未解決問題を、観察・資金・製品構造が揃った時に別の設計軸として回収する、というものだ。

■ 内容分析
この記事で重要なのは、三種類の判断を混ぜていない点である。第一に、N++ の single-player core は改善不能なのではなく、表現したかった内容を十分な品質で表現済みだと区切った。第二に、online multiplayer は欲しい機能でも、既存作への update では費用対効果が成立しないと認めた。第三に、大会で起きた初見攻略、同時競争、先着後の攻撃、観戦反応を、新作全体を組み直す設計証拠にした。創作上の余地、実装可能性、実プレイの需要を別々に確認して scope を変えている。

PN++W の観察は人気投票より情報量が多い。Race Mode の面白さを、未知 level の読解同期、互いに見える失敗、ゴール後の攻撃側への役割転換、viewer が追える勝敗変化に分解できる。攻略能力が競争と spectacle に変換された例である。大会用の新 level 制作は、burnout していた開発者を editor へ戻した。player 行動だけでなく content production にも feedback が返った点が固有である。

Deathmatch の扱いも有用だ。約1か月の試作に手応えがあっても、期限内に完成度を揃えられなければ切る。後年の Team Tag は古い prototype の復元でなく、N+ Survival の問題、N++ Deathmatch の直接 combat、新作の multiplayer-first な構造から再定義された。cut artifact の価値はコード量より、「何を解こうとして、何が不足したか」という未解決仮説にある。

ただし、この記事は announcement と設計回顧であり、完成後の評価報告ではない。確認できる外部観察は8人の一大会と festival での定性的反応が中心で、5 mode の内容、mode 間比較、retention、matchmaking 待ち時間、network latency、初心者と熟練者の格差、online で Rocket Murder Time が同じ強度を持つかは未提示である。Team Tag も開発者が有力と評価している段階で、旧 Deathmatch より良いことを示す比較試験はない。「直交方向なら市場がある」「観戦が楽しいなら継続率も高い」とまでは導けない。記事が強く示すのは設計仮説の作り方と scope 判断であって、新作の成功ではない。

■ 自分達の環境への適用
小型 game prototype では、完成した loop に level、敵、upgrade を足し続ける前に「同じ能力が別の関係で面白くならなかったか」を playtest log から探す。候補は、二人が同じ未知状態を同時に解いた瞬間、失敗が相手の判断材料になった瞬間、先に終えた人が観戦者や妨害者へ役割転換した瞬間、操作していない人まで結果に反応した瞬間である。これらを単なる盛り上がりとして記録せず、core action、player 間の情報、役割遷移、viewer 可読性の四列に分ける。既存 loop の縦方向追加と、この関係性を主役にする直交 prototype を比較できる。

実装 probe は既存 game を online 化する大工事から始めない。まず同一端末または deterministic な headless simulation で、同じ seed の未知 level を2 agent が同時攻略する条件を作る。baseline は独立 time trial、probe は相手位置を可視化する race、先着後に一度だけ hazard を置ける role transition とする。completion time だけでなく、勝者逆転回数、相手行動を受けた route 変更、先着後の入力継続、観戦状態から勝敗を説明できる event log、膠着・一方的妨害・退出相当の停止を記録する。headless は楽しさを証明するためでなく、競争が成立しない seed、永久妨害、先着有利の暴走を早く落とすために使い、残った条件を人間 playtest へ渡す。

制作記憶には cut_reason を「時間不足」だけで閉じず、problem、promising_signal、unresolved_risk、revisit_condition、evidence を残す。例えば「直接攻撃は反応を生んだ／spawn kill を解けなかった／役割制と短い round を試せる時に再訪」のように書く。次作で検索すべきなのは古いコードではなく、現在の設計条件で再検証できる未解決仮説である。一方、ship gate は現在作の品質で決め、将来価値がありそうという理由で半完成 mode を残さない。candidate lifecycle と同様、cut と disproved を分ければ、完成品の scope を守りながら探索資産を捨てずに済む。

採用判定は二段にする。第一段では、直交 prototype が既存 core の skill を再利用しつつ、player 間の新しい判断または役割変化を実際に増やしたかを見る。第二段では、その面白さを product にする時に UI、参加・退出、round flow、同期、失敗回復、観戦可読性まで作り直せるかを見積もる。後者を払えないなら「multiplayer 機能」として本体へ足さず、local probe の結果と再訪条件だけを残す。Metanet の事例から移すべきなのは新作化そのものではなく、面白さの証拠と製品化コストを別 gate にする判断である。

■ メリット・デメリット
メリットは、完成した core を無理に上方向へ膨らませず、playtest で偶発した関係性を新しい設計空間へ変換できることだ。既存の操作技能、level 制作知識、community を利用しながら、同じ内容の量的続編を避けられる。cut した案も、失敗理由と再訪条件を保存すれば将来の設計 option になる。半完成要素を ship しないため、現在作の品質と次作の探索を両立しやすい。

デメリットは、少人数 event の熱量を普遍的需要と誤認しやすいこと、local の即時反応が latency や匿名 matchmaking のある online で再現する保証がないことだ。multiplayer-first は netcode だけでなく UI、session flow、moderation、人口維持、観戦表示まで scope を拡大する。既存資産を使える安心感が、新規性の弱さや sunk cost を隠す危険もある。また cut 案を美化すると、当時解けなかった根本問題を再実装するだけになるため、旧 prototype の保存ではなく仮説の再診断が必要である。

■ 判定
部分採用。playtest で見えた面白さを「既存 loop の追加」か「直交する新しい関係性」かに分け、cut 時に未解決仮説と再訪条件を残す運用は採る。まず local / headless の小さな比較で失敗条件を削り、人間試験で役割変化と観戦反応を確かめる。少人数大会の反応だけで新作規模へ進む判断、online 化を価値そのものとみなす判断は採らない。

■ URL
https://www.metanetsoftware.com/2026/to-infinity-times-two-and-beyond
