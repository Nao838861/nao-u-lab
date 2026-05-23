# Pulse Relay v002 design trace

この v002 は、既存 v001 のソースや敵配置を参照せず、空の `v002` から作り直す。目的は「v001 レベルに近い、遊べる 2D シューティング」を、記憶に残した失敗防止ゲートを使って自律的に再現すること。

## 持ち込む blocker

- 記憶を読んだだけで満足しない。各 blocker を今回の wave と検証へ翻訳する。
- checklist を短い見出しへ要約しない。元の失敗、防ぎたい誤認、今回の具体対象、完了証跡、未達なら何が起きるかを書く。
- overlap 0 を目的化しない。重なりなし、撃ちやすさ、密度、テンポを同時に見る。
- teacher 分析は今回は v001 を参照できないため、記憶に残っている「短い入場、射線時間、掃け、次小隊との関係、小隊密度」を文法として使う。ただし v001 の数値や実装は使わない。
- 最初の wave は draft とし、delete-and-redesign pass で少なくとも一度作り直す。
- headless だけでなく、代表区間の見た目レビュー相当を秒単位の状態と軌跡サンプルで確認する。

## 企画核

タイトル: Pulse Relay v002: Vector Wake

プレイヤーは小型機を操作し、通常ショットで敵を倒す。敵弾に近づくと `pulse` が溜まり、`X` または `Shift` で短い円形パルスを放つ。パルスは近い敵弾を消し、消した数に応じて反撃リングを撃つ。通常弾で隊列を撃ち切る、危険な瞬間だけ pulse で切り返す、という二段のリズムを作る。

画面上の約束:

- 敵は出現方向、攻撃方向、退場方向が役割とつながる。
- 敵の移動は `entry / show / exit` を持つ。全員が同じ rhythm で動かない。
- 隊列は撃ちやすい rail 上に揃えるが、同一 rail で重ならないよう spawn gap と entry speed を先に調整する。直角 offset は使わない。
- ボスは瞬殺させない。通常ショット理想火力と pulse 反撃込みの高火力の両方で TTK を見る。

## 設計サイクル 1: 粗い案の評価

良いところ 30 件:

1. 通常ショットと pulse の二層で、単なる避け撃ちより判断が増える。
2. pulse は敵弾を消すため、危険を攻撃へ変える手触りがある。
3. graze で charge するため、逃げすぎると攻撃機会が減る。
4. 敵隊列を rail 上に置くと撃ち切りやすい。
5. 小隊単位の入場にすればテンポを作りやすい。
6. side lance は横圧を作れて、上から来る敵と違う読みが生まれる。
7. dive 敵は短い緊張を作れる。
8. carrier 敵は pulse の使い所を作れる。
9. boss に phase を持たせると終盤の山場を作れる。
10. 背景を控えめにすれば弾と敵が見やすい。
11. 入場を速く、射線滞在を短くすると撃ち切り感が出る。
12. 退場を役割ごとに変えれば「意志を失った」感じを避けられる。
13. 画面内同時数を 4-8 程度に保てば処理対象が明確。
14. pulse の半径を可視化すれば使う判断が読みやすい。
15. enemy color を役割に対応させれば学習しやすい。
16. boss の弱点を中央に置けば射線を作れる。
17. side wave と top wave を交互に置くと単調さが減る。
18. 1 秒ごとの指標で退屈秒を探せる。
19. route 関数を共有すれば headless と browser が一致する。
20. deterministic seed で検証しやすい。
21. wave intent table を作ると後付け説明を避けやすい。
22. entry/show/exit の分割は見た目レビューの観点になる。
23. boss TTK を理論計算できる。
24. overlap check を route 単位で実装しやすい。
25. player shot speed を高めれば命中待ちのもたつきが減る。
26. enemy HP を小隊ごとに変えれば撃ち切りリズムが作れる。
27. pulse の cooldown を短めにすれば使って楽しい。
28. 弾速差で threat の性格を変えられる。
29. 短いステージなら繰り返し評価しやすい。
30. local file だけで動けば確認が容易。

悪いところ 30 件:

1. pulse が強すぎると避けなくなる。
2. pulse が弱すぎると存在意義がなくなる。
3. graze charge が見えにくいと理不尽になる。
4. side wave が長すぎると撃てない時間になる。
5. dive が速すぎると初見殺しになる。
6. carrier が硬すぎるとテンポを止める。
7. rail を揃えすぎると単調になる。
8. 全 route を同じ easing にすると同じリズムに見える。
9. overlap check だけを見ると密度が死ぬ。
10. boss HP を低くすると瞬殺される。
11. boss HP を上げすぎると作業になる。
12. 弾が多すぎると自機と敵の読みに集中できない。
13. 弾が少なすぎると pulse が不要になる。
14. 背景演出が強いと視認性が落ちる。
15. score 表示が大きいと画面を邪魔する。
16. auto aim bot 前提に調整すると人間とずれる。
17. 早い入場だけだと疲れる。
18. 遅い入場だけだともったりする。
19. 横敵が画面外から撃つと不公平になる。
20. 敵の退場が長すぎると残敵感が邪魔になる。
21. 敵の退場が速すぎると撃ち逃しが分からない。
22. 被弾後無敵が長すぎると緊張が落ちる。
23. 被弾後無敵が短すぎると連続被弾する。
24. pulse の入力が keyboard layout 依存だと遊びにくい。
25. mobile 対応はこの版では重い。
26. wave が短すぎると学習前に終わる。
27. wave が長すぎると変化が薄れる。
28. boss phase が変わったことが見えないと山場が伝わらない。
29. 検証 scripts が game logic とずれると信用できない。
30. visual review を省くと不格好な movement を見落とす。

改善案 30 件:

1. pulse は max 100、graze と kill で溜める。
2. pulse は弾消し + 反撃 shard にする。
3. pulse は charge 50 以上で発動、強さは charge 量で変える。
4. player 通常ショットは高弾速の 2way narrow にする。
5. scout は top から縦 rail に入り、短く止まって下へ抜ける。
6. side lance は side から S 字で中央射線に乗り、進行方向へ抜ける。
7. diver は斜め入場、短い照準、斜め退場にする。
8. carrier は画面上部で短く横移動し、弾を撒いて上へ戻る。
9. boss は 3 phase、中央、左右 drift、中央突進予告にする。
10. wave 0-10 秒は top scout で撃つ基本を提示する。
11. wave 10-20 秒は side lance で横圧を提示する。
12. wave 20-33 秒は diver と scout を重ねる。
13. wave 33-45 秒は carrier と side lance で pulse を要求する。
14. wave 45 秒以降 boss warning。
15. route ごとに easing を変える。
16. spawn gap は同一 rail で 14-18F から探索する。
17. side lance は 16F gap、entry 50F、show 50F、exit 45F を初期案にする。
18. scout は 13F gap、entry 36F、show 45F、exit 36F を初期案にする。
19. diver は 26F gap、entry 30F、show 20F、exit 48F を初期案にする。
20. carrier は 80F gap、HP 高め、弾多めにする。
21. overlap threshold は半径合計の 0.85 倍にする。
22. timeline は visible, shootable, bullets, nearBullets, pulse, bossHp を出す。
23. boss TTK は damage per second から理論計算する。
24. visual review は route sample の秒単位位置で代替する。
25. HUD は小さく上端にまとめる。
26. background は grid と star streak のみ。
27. 色は scout cyan, lance orange, diver magenta, carrier green, boss white/red。
28. death effect は小さく、弾視認性を優先。
29. stage clear 後は score と rank を出す。
30. docs に検証結果と未達を残す。

筋の良い案:

- 「pulse を危険の報酬にする」案は、避け、撃つ、近づくを一つの loop にまとめる。懸念は pulse が強すぎると通常避けが不要になること。
- 「route を entry/show/exit に分ける」案は、重なり、メリハリ、退場の自然さを同時に扱える。懸念は実装が長くなること。
- 「小隊密度を spawn gap で詰める」案は、直角 offset の不格好さを避けられる。懸念は速すぎると初心者が撃ち切れないこと。

## 設計サイクル 2: draft を捨てて再設計

削る判断:

- 最初の案では carrier が pulse 専用すぎる。carrier なしでも pulse を使いたくなるように、通常 wave に graze 可能な aimed slow 弾を混ぜる。
- side lance を S 字だけにすると全員同じ rhythm になる。前半 side は直線的な横圧、後半 side は浅い arc に分ける。
- boss warning を長く取りすぎるとテンポが落ちる。45-48 秒の 3 秒だけにする。

良いところ 30 件:

1. scout は最初の撃つ対象として明確。
2. scout の下抜けは撃ち逃しの結果が見える。
3. side lance は横へ避けるプレイヤーに圧をかける。
4. diver は移動予告が強く、短い緊張になる。
5. carrier は pulse の山を作る。
6. boss warning は次の山場を予告する。
7. phase boss は瞬殺検出に向く。
8. 色分けは視認性に寄与する。
9. route sample で重なり原因を見やすい。
10. 同一 rail gap 調整で隊列感を保てる。
11. visual review を秒で書くと後から追える。
12. pulse charge を HUD に出すと判断が見える。
13. enemy bullet を小さくすると避けやすい。
14. player hit radius を小さくすると納得しやすい。
15. boss HP bar で山場の持続が見える。
16. score multiplier はなくても主題がぶれない。
17. stage length 70 秒程度は評価しやすい。
18. restart button なしでも R で再開できる。
19. mouse を使わないので操作が単純。
20. deterministic headless は regression に使える。
21. `design_trace` に破棄理由を残せる。
22. `known_failures` で先送りをごまかしにくい。
23. `self_judgment` で人間依存問題を分けられる。
24. wave table が後付け説明を防ぐ。
25. boss TTK を理論値で見れば瞬殺を避けやすい。
26. timeline で 0-10 秒と boss 前の空白を拾える。
27. side と top の交互配置で同じ rhythm を避けられる。
28. carrier 弾は pulse の使い所になる。
29. boss phase の bullet pattern を変えれば終盤に変化が出る。
30. 全体が canvas 1 枚で完結する。

悪いところ 30 件:

1. document が多いと形式だけになる危険。
2. browser visual の人間確認は完全自動ではない。
3. headless bot が上手すぎると難度を誤る。
4. pulse を使わないプレイヤーでも進めすぎるかもしれない。
5. side wave が狭いと避け場が減る。
6. scout が多すぎると単調になる。
7. diver と side が重なると unfair になりやすい。
8. carrier の弾が多すぎると視認性が落ちる。
9. boss phase が長すぎると stage 前半の印象が薄れる。
10. boss phase が短すぎると瞬殺感が戻る。
11. player speed が速すぎると避けが雑になる。
12. player speed が遅すぎると side 圧が理不尽になる。
13. enemy shot aimed が正確すぎると避けにくい。
14. enemy shot aimed がずれすぎると圧がない。
15. route easing が派手すぎると撃ちにくい。
16. route easing が薄いとまたもったりする。
17. wave 間の空白を詰めすぎると息継ぎがない。
18. wave 間の空白を空けすぎるとテンポが落ちる。
19. boss 弾を pulse 前提にすると charge がない時に詰む。
20. charge 入手が kill 寄りだと避けの報酬が弱い。
21. charge 入手が graze 寄りだと危険行動を強制する。
22. `routeCoverage` のような指標を作るとまた数字偏重になる。
23. overlap threshold が甘いと見た目で被る。
24. overlap threshold が厳しいと密度が死ぬ。
25. visual review を自動化しないと主観が残る。
26. index.html だけだと asset の豊かさは限定的。
27. sound がないためテンションに限界がある。
28. mobile 非対応は評価対象を絞る。
29. stage clear 後の replay はない。
30. 実装時間が長くなると検証が薄くなる危険。

改善案 30 件:

1. Bot は perfect aim ではなく cooldown と horizontal preference を持たせる。
2. headless は conservative, aggressive, pulse-heavy の 3 policy を走らせる。
3. visual review は route sample と manual note を両方残す。
4. pulse は max charge 100、発動で 65 消費に固定する。
5. graze は 10F ごとに 1 charge 程度に制限する。
6. kill は 8-18 charge を敵種で変える。
7. player speed は 4.4 px/F、focus なしにする。
8. player hit radius は 4、sprite radius は 10。
9. enemy bullet speed は 2.2-3.4。
10. side lance bullet は遅め aimed。
11. diver は弾を少なくし、体当たり圧を避ける。
12. carrier は radial 6-way を 2 回までにする。
13. boss HP は理想通常 13-18 秒、pulse 込み 9-13 秒を狙う。
14. boss は 48 秒出現、stage 72 秒 clear 目安。
15. wave 0 は scout 5 体 x 2 rail。
16. wave 1 は side lance 6 体。
17. wave 2 は diver 4 体 + scout 4 体。
18. wave 3 は side arc 5 体 + carrier 2 体。
19. wave 4 は boss pre adds 4 体。
20. boss は minion を呼ばず、本体 pattern で山を作る。
21. overlap check は 60Hz で全 enemy pair を見る。
22. timeline は 1 秒ごとに JSON と markdown summary を出す。
23. verify は 3 policy の clear/survival/boss damage を見る。
24. README に操作と検証を書く。
25. known_failures は「音なし」「完全な動画確認なし」を明記する。
26. delete-and-redesign pass の結果をここに追記する。
27. route 関数は named にし、意図を code comments で短く残す。
28. enemy spawn data に `intent` を持たせる。
29. boss TTK script は verify に入れる。
30. stage rank は damage, clear, pulse use で出す。

筋の良い案:

- 3 policy headless は、単一 bot のハックを避ける。懸念は実装が増えること。
- boss TTK target を先に決める案は、瞬殺を防ぐ。懸念は高 HP による作業感。
- visual review の秒数記録は、見た目の問題を残しやすい。懸念は実際の動画ではないこと。

## 設計サイクル 3: 実装方針

選ぶ方針:

- Game model を `game.js` に置き、browser と Node 検証で同じロジックを使う。
- v001 は参照しない。新規の route 名、wave 名、数値、敵種で構成する。
- 実装後に overlap/timeline/verify を走らせ、必要なら数値調整する。

良いところ 30 件:

1. browser と Node の差分が減る。
2. wave table から spawn data へ写せる。
3. tests が v002 内で完結する。
4. route 名で意図を追える。
5. boss TTK を同じ constants から計算できる。
6. docs と code の対応を確認しやすい。
7. stage が短く、何度も評価できる。
8. pulse の可視化でプレイ判断が見える。
9. enemy colors が役割を伝える。
10. wave 変化が時間で追える。
11. top, side, dive, carrier, boss の差がある。
12. route easing が違うため rhythm が単調になりにくい。
13. 同一 rail の gap 調整で編隊が保てる。
14. straight-only への退行を避ける。
15. exit reason を route に埋め込める。
16. no-overlap と密度探索ができる。
17. bot policy 差分で難度の偏りを見られる。
18. visual review を docs に残せる。
19. known failures を隠さず残せる。
20. self judgment を後で更新できる。
21. code が単一ファイル中心で扱いやすい。
22. assets なしで動作が安定する。
23. local file で起動できる。
24. controls が標準的。
25. 反撃 shard で pulse の派手さが出る。
26. boss phase で終盤が変化する。
27. warning で唐突さを減らせる。
28. route sampling で重なり原因を調べられる。
29. TTK target で boss 瞬殺を検出できる。
30. stage clear までの playable loop がある。

悪いところ 30 件:

1. v001 と完全比較はしないため「v001 レベル」の客観性は限定的。
2. sound がないためテンションは音付きゲームより落ちる。
3. image asset がなく、見た目のリッチさは canvas primitive 依存。
4. bot は人間の認知負荷を完全には再現しない。
5. route sample は動画確認の代替にすぎない。
6. v001 を参照しない制約で teacher 実装分析はできない。
7. docs の量が増え、更新漏れが起こりうる。
8. pulse が強すぎる可能性は最後まで残る。
9. boss HP 調整は実プレイで変わる可能性がある。
10. keyboard ghosting は未確認。
11. browser performance は環境依存。
12. collision radius の納得感は目視依存。
13. 難度は上級者には低い可能性。
14. 初見には pulse が分かりにくい可能性。
15. manual tutorial は入れないため、HUD で理解させる必要がある。
16. enemy death animation は簡素。
17. score system は浅い。
18. replay 保存はない。
19. option/menu は最低限。
20. boss attack variety は 3 phase の範囲。
21. stage 後半で弾数が増えすぎる可能性。
22. side lance が撃ちにくい可能性。
23. diver が threat として弱い可能性。
24. carrier が硬すぎる可能性。
25. pulse charge economy が過不足になる可能性。
26. clear rank が恣意的になる可能性。
27. mobile/touch 非対応。
28. gamepad 非対応。
29. visual review は自分の評価に依存する。
30. commit 前の検証に時間がかかる。

改善案 30 件:

1. verify で boss ideal TTK を出し、9 秒未満なら HP を上げる。
2. verify で no pulse policy を走らせ、pulse なしでも完全には詰まないか見る。
3. verify で pulse-heavy を走らせ、pulse が強すぎないか見る。
4. overlap check で最小距離と該当 route を出す。
5. timeline で 0 visible 秒が 2 秒以上続いたら失敗。
6. timeline で shootable 0 が長い場合は wave を調整。
7. nearBullets が高すぎる秒を確認。
8. bossHp が 3 秒以内に 0 になるなら失敗。
9. visual review で 0-10 秒の scout density を確認。
10. visual review で side lance gap を確認。
11. visual review で diver の入退場が自然か確認。
12. visual review で carrier がテンポを止めないか確認。
13. visual review で boss 導入が唐突でないか確認。
14. pulse charge が平均 20 未満なら graze/kill charge を増やす。
15. pulse charge が常時 max なら消費か獲得を調整。
16. scout が重なるなら gap を増やすより entry speed を先に見る。
17. side が重なるなら path progress と spawn delay を見る。
18. 直角 offset は使わない。
19. route を linear だけにしない。
20. entry は速く、show は撃ちやすく、exit は役割に沿って明確にする。
21. boss phase で色と弾 pattern を変える。
22. HUD に controls を短く出す。
23. README に「v001 未参照」を明記する。
24. known_failures に制約由来の限界を書く。
25. self_judgment に自律検出項目を書く。
26. docs と code の wave 名を一致させる。
27. stage clear で final stats を表示する。
28. death しても R で再開。
29. pause は P。
30. no external deps にする。

筋の良い案:

- 「同一 game model を検証と画面で共有」は、検証の信用を上げる。懸念は code が肥大化すること。
- 「5 証跡ファイルを completion gate にする」は、記憶の読み捨てを防ぐ。懸念は形式的になることなので、各ファイルに具体変更か未達理由を残す。
- 「v001 未参照で、記憶から抽出した文法だけ使う」は、今回の指示を守りつつ過去の学びを使える。懸念は v001 同等の客観比較ができないこと。

## delete-and-redesign pass

初期 draft では、scout -> side -> diver -> carrier -> boss の単純な順番だった。これを破棄し、後半では side と carrier、diver と scout を重ねる構成へ変える。理由は、単体 wave だけでは各敵が別々に出るだけで、緊張の重なりや撃つ優先順位が生まれにくいから。

破棄した案:

- 全 wave を 10 秒ずつ完全分離する案。理由: rhythm が単調で、敵が順番に紹介されるだけになる。
- side lance を全員同じ S 字にする案。理由: 同じ rhythm に見え、前回の「全部同じパターン」に近づく。
- carrier を boss 前だけに出す案。理由: pulse の学習が遅すぎる。

採用する再設計:

- 0-9 秒: scout で基本の撃ち切り。
- 8-18 秒: scout の終わりに side lance を重ね、左右移動と撃ち切りを混ぜる。
- 18-30 秒: diver を短い緊張として入れ、同時に少数 scout を置く。
- 30-45 秒: carrier と side arc を重ね、pulse の使い所を作る。
- 45-48 秒: warning と小型敵少数。
- 48 秒以降: boss 3 phase。
