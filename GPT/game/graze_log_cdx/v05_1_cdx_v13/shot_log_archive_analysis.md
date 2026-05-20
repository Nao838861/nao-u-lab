# shot_log dialogue_archive 再分析

## 読んだログ

- `dialogue_archive/INDEX.md`
- `v01_creation_20260425_1421_59c1b48b.md`
- `v01_creation_20260426_1346_4ecd4e62.md`
- `v01_creation_20260426_1539_6ee45516.md`
- `v01_creation_20260426_1849_6b4b8db8.md`
- `v01_creation_20260427_0133_d5662c35.md`
- `v02_planning_20260517_1739_2718715a.md`
- `v02_planning_20260517_1014_62bdcbf3.md`

## 抜き出した指示と判断

1. Nao_u が直接 `shot_log v01` を編集し、自動連射、boss、path patterns を追加していた。つまり配置の成立は AI の初期案だけでなく、実プレイ中の直接調整で起きた。
2. `SPACE` は手動射撃から BOMB 専用へ変わり、auto-shoot 化した。これにより、プレイヤーの主判断は「撃つ」より「位置取り、ボム、被弾後リカバー」へ寄った。
3. target は「30秒オンボーディング casual」から「STG core fan」へ寄った。敵配置やボス追加は BACKLASH ではなく、短いSTGとしての骨格に再分類されていた。
4. 子供プレイで「至近撃破の打ち返し弾で死ぬ」傾向が出たため、近距離では理不尽な死因を避ける mercy が入った。
5. 敵爆発が弾と同系色で見にくいという指摘から、弾・敵・爆発の視認性分離が重視された。
6. BOMB 後の敵弾消去エフェクト、MAX 到達演出、中ボス/ボスの大型化が指示された。これはルール追加ではなく、既存の快感ループを見えるようにする増幅だった。
7. 30秒で死ぬAIでは定性評価できないという指摘から、ちゃんとクリアできるAIで測ることが必須になった。
8. Boghog / Toaplan 的 wave grammar check は、v01 を否定するものではなく、逃げ道、レーン偏り、重ね過ぎ、wave間隔を測るための評価軸として残された。

## v13 への反映

- 配置は v12 の `center column -> side sweep -> V clamp -> dive curtain -> medium anchor -> recovery fan -> cross pressure -> boss warning -> boss` を維持。
- MAX 到達時に `CORE CHARGED`、金色リング、短いフラッシュ、集中粒子を出す。
- 中ボスとボスの半径を大きくし、画面上で「節目」として読めるようにする。
- 圧が上がったぶん、被弾後リカバー用のシールド在庫を 6 にする。
- ヘッドレスは `simpleBot` がボス final cue を見て BOMB を使い、clear することまで検査する。
- `auto_verify.html` から可視の自動検証プレイを開けるようにする。

## まだ残る注意

v13 は shot_log の打ち返し弾を移植していない。今回の移植対象は、敵配置の密度曲線、節目の見せ方、リカバー可能性、クリア可能AIでの評価である。
