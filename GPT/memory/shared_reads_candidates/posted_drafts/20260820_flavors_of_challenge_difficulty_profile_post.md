■ 概要
Brett Moody の GDC 2026 講演は、ゲームの「難しさ」を一本の難易度で表すと、なぜ難しいのか、誰のどの能力を要求しているのか、離脱を防ぐには何を変えるべきかが見えなくなる問題を扱う。提案は、challenge を Reasoning、Physicality、Randomness、Endurance、Out-Game Resources、Representation、Interpersonal Skills、In-Game Resources の8種へ分解し、その量と提示の仕方の配合を difficulty profile として読むことだ。

Reasoning は「次に何をすべきか」という明示・暗黙の問いに答える負荷で、批判的思考、演繹、pattern recognition を含む。Physicality は計画を実行へ移す負荷で、反応速度や手眼協応、精度などを指す。Randomness は行動前に条件が与えられ対応を選べる input randomness と、行動後に結果が決まり制御しにくい output randomness を分ける。Endurance は一回の実行精度ではなく、集中や技能をどれだけ長く維持するかである。

Out-Game Resources は課金だけでなく、setup、意味のある play、作業化した tedium、入力後に何もできない waiting として消費される時間、さらに作品側が教えないゲーム外知識を含む。Representation は暴力、恐怖、差別、喪失など題材と表現を受け止める情動的負荷である。Interpersonal Skills は相手の意図を読む共感、非言語 cue、交渉、teamwork、欺き、明確な伝達など。In-Game Resources は装備、能力、通貨、回復、進行上の蓄積を用いて challenge を下げる余地を指す。

講演は8軸を0–10で三つの具体例へ当てる。Getting Over It は Reasoning 5、Physicality 9、Endurance 9、Randomness 0、Out-Game Resources 0、Representation 3、Interpersonal Skills 0、In-Game Resources 1。失敗で山の麓まで滑るため、実行と持久の負荷が突出し、成長を character upgrade で肩代わりできない。Sekiro の Guardian Ape は Reasoning 7、Physicality 8.5、Endurance 7、Randomness 5、Out-Game Resources 2、Representation 6、Interpersonal Skills 2、In-Game Resources 6。技の学習、短い攻撃窓、約6分の集中、状態異常、猟奇的造形、強化資源が同時に効く。Titan Souls の Eye Cube は順に4、5、2、3、2、2、0、1で、一撃で終わる短期戦ゆえ持久負荷が低い。同じ「難しいボス」でも配合が異なることを示す比較である。

後半は高難度を単に薄めず、プレイヤーが続けられる条件を12項目にする。現実の技能成長とゲーム内成長を組み合わせる、並行 challenge へ pivot できるようにする、負荷の種類を変える、報酬で次の方向を示す、勝利以外の努力も報いる、大きな challenge を早く予告する、quit より retry を容易にする、run-back のような time-tax を避ける、再開時に完全なゼロへ戻さない、苦労に意味を与える、共通の敵と narrative stakes を作る、というものだ。結論は、難関を越えた記憶を成立させるには challenge の配合だけでなく、momentum、learning、purpose を最大化する必要がある、という設計論である。

■ 内容分析
この枠組みの強みは、「敵HPを下げるか」という量の調整より前に、負荷の正体を診断できる点にある。Guardian Ape で実行窓を広げること、run-back を短くすること、強化資源を増やすことは、いずれも体感難度を下げうるが、それぞれ Physicality、Out-Game Resources、In-Game Resources という別の介入であり、得られる体験も違う。狙った緊張を残しながら脱落要因だけを外すには、この区別が効く。

特に有用なのは、プレイ時間を一括で cost とみなさず、play、tedium、waiting、setup に分けた点と、Randomness を入力前後で分けた点である。失敗後の再挑戦が30秒でも、その30秒が新しい判断を含むなら学習になりうる。一方、同じ道を安全に走るだけなら time-tax であり、失敗の意味を増やさない。乱数も、先に盤面が提示されて対応を考える場合と、正しい行動の後に結果だけ覆る場合では、公平感と学習可能性が異なる。

ただし、これは経験的に妥当性を検証した尺度ではない。三作品の採点者は講演者で、rater 間一致、player sample、離脱率との相関、軸の独立性は示されていない。0と1、8.5と9の差を測定差として扱う根拠はなく、Guardian Ape の次手が読みにくいことを Randomness 5 と呼ぶ部分には、敵AIの確率性とプレイヤーの情報不足が混ざる余地もある。Representation も作品内容だけでなく年齢、文化、経験で大きく変わる。従って profile は比較のための診断仮説であり、客観 score や自動合否判定器ではない。

また8軸は完全に独立しない。攻撃予兆が読めない時、それは Reasoning、Representation による視認性、Physicality の反応時間の複合かもしれない。資源集めの反復は In-Game Resources を増やす一方、Out-Game Resources の tedium を増やす。重要なのは数値を埋めることではなく、「どの観測からその負荷だと判断したか」と「一軸を下げた時に別軸へ負担を移していないか」を記録することである。

■ 自分達の環境への適用
短期ゲーム制作では、ゲーム全体ではなく boss phase、wave、puzzle、retry loop を単位に profile を作る。各軸を0–10で精密に採点するより、low / medium / high と根拠 event を一組で残す。例えば「予兆から被弾まで420ms」「弱点発見まで3試行」「死亡から操作再開まで11秒」「同じ安全区間を毎回8秒移動」「強化なしでも到達可能」のように、実装から再現できる観測を添える。狙った主軸と、意図せず混入した副軸を分ける。

headless 評価では全8軸を一つの自動 score にしない。取得できるのは、state transition から推定する Reasoning の分岐数、入力 timing と成功窓による Physicality、seed 別結果分散による Randomness、戦闘継続時間による Endurance、retry latency と無入力待ちによる Out-Game Resources、所持資源と勝率差による In-Game Resources までである。Representation と Interpersonal Skills は画面・文脈・人間同士の解釈が中心なので、headless は観測不足として明示し、人間 playtest へ渡す。

小さな probe は同一ボスの三 variant でよい。A は攻撃窓だけ広げる、B はcheckpointを直前へ置く、C は失敗後に消耗品か情報を一つ残す。初勝利までの試行数だけでなく、再挑戦率、死亡から再入力までの時間、同じ死因の連続数、学習で回避率が上がった技、終了理由を比較する。A は Physicality、B は time-tax、C は momentum と In-Game Resources への介入であり、「易しくなった」だけでは区別できない効果を測れる。

制作サイクルでは、設計時に target profile、実装後に observed profile、playtest 後に revised profile を残す。差分が大きい軸だけ修正候補にし、全軸を平均して一つの難易度へ戻さない。記憶 system には数値より、challenge 単位、build hash、観測根拠、介入、結果を atom として保存すれば、別作品でも「time-tax を減らしたが主軸の実行負荷は維持できた」といった再利用可能な lesson になる。

■ メリット・デメリット
メリットは、難度調整の会話を「難しい／簡単」から、負荷の種類、学習可能性、再挑戦 cost へ移せることだ。狙った高難度を保ちつつ、不要な待ち時間や出力後乱数だけを削る判断がしやすい。具体例と12の処方があるため、設計レビューから小さな実装差分へ接続しやすく、headless で測れる軸と人間確認が要る軸も分離できる。

デメリットは、0–10表示が精密さを装いやすいこと、軸が重なり原因帰属を誤りうること、個人差が大きいことだ。8軸を毎場面で埋めると記録コストが増え、数字合わせが目的化する。講演には player study がなく、12の処方も因果効果を比較した結果ではない。特に努力報酬や再開 bonus は、失敗の損失を無効化しすぎると作品固有の tension を壊すため、profile と行動ログの両方で確認する必要がある。

■ 判定
部分採用。8軸を客観尺度として導入せず、challenge ごとの診断語彙と介入仮説として使う。まず Physicality、Randomness、Endurance、Out-Game Resources、In-Game Resources の観測可能な5軸と retry friction を記録し、Representation と Interpersonal Skills は人間レビューへ残す。三 variant probe で再挑戦率と学習曲線を比較し、主軸を維持したまま不要負荷を減らせた場合だけ制作サイクルへ定着させる。

■ URL
https://media.gdcvault.com/gdc2026/Slides/Moody_Brett_FlavorsOfChallenge.pdf
