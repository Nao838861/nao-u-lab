# Resonance Cdx v001 design_log

## 対象指示

- broadcast id: `broadcast-1779657780-322e0406bd`
- permalink: `https://nao-u-lab.slack.com/archives/C0ANECNV5DK/p1779657780988989`
- 原文: `全員、<https://nao-u-lab.slack.com/archives/C0ANQ9DRQ1K/p1779657471444199> からの一連の内容を分析して、当該ファイルに書かれたログなどもすべてを参照して、分析内容をslackに投稿して、その次のサイクルで各自の名前を付けた新しいプロジェクトとして自律的にこのようなゲームを生成して、どのくらいのものが作れるかを試してほしい。このプロジェクトは、どれだけ時間がかかってもよいから精度高く指示に従ってゲームを完成までもっていってほしい。あなたたちにどのくらいのことができるのか、これで確認したい。`
- 関連再発防止 broadcast: `broadcast-1779661734-358652e58a`
- 原文: `自動サイクルがローカルで作ったゲームを根こそぎ消した。全員再発しないように対策して。`

## 実装前判断

今回の目的は既存 Pulse Relay のコピーではなく、Pulse Relay v003 教師差分から抽出した「中心入力 1 つ、特殊システム 3 状態、対象物側マーカー、70-90 秒の学習/圧力/休符/山、bad-policy headless」を、Codex 名義の別ゲームとして物理化すること。

削除事故への対策として、既存 `game/pulse_relay/` と `game/graze_log_cdx/` は上書きしない。新規 `game/resonance_cdx/v001/` だけに playable を作り、stage もこの配下と headless check、staging、broadcast lifecycle に限定する。

## 採用案

タイトルは `Resonance Cdx`。プレイヤーは弾を撃たず、Space で ring を鳴らす。ring 範囲内の敵弾は反射弾に変わり、敵へ当たるとダメージになる。敵弾には 3 tone があり、tone は弾色と敵側/弾側マーカーで見せる。

特殊システム 3 状態:

- 発動不可: ring cooldown 中。プレイヤー周囲 ring を薄くし、内側 arc で復帰を示す。
- 発動可能だが意味薄: cooldown は終わっているが範囲内に弾がない。ring は細い実線。
- 発動可能かつ意味あり: 範囲内に弾がある。ring を強め、弾側に白い pulse marker を出す。

ステージカーブ:

- 0-4s: title で Space を押して開始。中心入力を身体的に教える。
- 4-12s: 1 tone の低速弾で ring 変換を学習。
- 12-25s: 2 tone を混ぜ、対象物側マーカーを見る理由を作る。
- 25-40s: chord wave で ring の価値を強く見せる。
- 40-58s: sweeper で横圧力を足す。
- 58-75s: boss chord。複数 tone の山。
- 75-88s: clear までの余韻。

## 懸念

v001 は最小 playable diff なので、音の比喩は視覚 tone に留めている。実音は入れていない。中心入力と対象物側マーカーの成立確認を優先した。

## 検証方法

`tools/headless_resonance_cdx_v001_check.js` で次を確認する。

- runtime error が出ない。
- route policy は複数 seed で ring を意味あるタイミングで使い、boss へ到達する。
- noRing / camper / emptyRinger は route より悪い結果になる。
- offscreenShots と abruptExits が 0。
- 3 状態の telemetry がそれぞれ観測される。
- 対象物側 marker frame が観測される。
