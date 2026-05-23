# Pulse Relay v001 設計ログ

## 狙い

`shot_log` 系で得た「撃つ対象を絶やさない」「単発 wave で空白を作らない」「ボスを孤立させない」という反省を入口に、短編の縦スクロール STG を作る。今回の固有メカは、近付いた敵弾を Space のパルスで白い反撃弾へ変換する `Pulse Relay`。

既存ゲームのソースは見ず、記憶と LLM の一般知識だけを使った。参照したのは記憶上の教訓、設計ルール、検証プロセス。

## 指標運用ルール

ユーザー指摘を受け、指標は合否をハックするためではなく、プレイ体験のどこを疑うかを決めるために使う。閾値を満たしたら完成ではなく、指標が示した現象を「何のために見ているのか」へ戻して解釈する。

- `visibleEnemies`: 撃つ対象が画面に存在するか。空白や退屈の疑いを見る。
- `shootableEnemies`: 自機の射線に乗る対象があるか。敵はいるのに撃てない時間を探す。
- `enemyBullets`: 外発の緊張量。多さ自体は正義ではなく、反撃先なしに増えた時は悪い。
- `nearBullets`: パルス判断が自然に発生するか。自発カスリを強要していないかを見る。
- `conversions`: 固有メカが実際に使われているか。多ければ良い指標ではない。
- `relayHits`: 変換が攻撃快感へ接続したか。低い時は敵配置か反撃角度を疑う。
- `damage`: 難度スパイクの場所。被弾ゼロを目指す指標ではなく、学習前の急死検出。
- `bossHp`: 山場が進むか。ボス到達後に削れない時は燃料、攻撃接続、HPを疑う。

## 実装サイクル

### 初期実装

通常ショット、敵弾、ライフ、ボス、パルス変換、固定 wave、Node で回せる `verify.js` を入れた。初期評価では旧式の route AI が 20 秒前後で落ち、ボスに到達しなかった。

### 時系列評価の導入

`timeline_eval.js` を追加し、1 秒ごとに `visibleEnemies / shootableEnemies / enemyBullets / nearBullets / conversions / relayHits / damage / bossHp` を記録した。複数方針として `route / aggressive / defensive / camper / noPulse / pulseHeavy` を比較した。

最初の時系列では、13-20 秒付近に「敵は多いが射線に乗らず、弾だけ増える」時間が出ていた。これは `shootableEnemies` と `enemyBullets` の数字を満たしていないからではなく、プレイヤーが撃てないまま圧だけ受ける体験になっているため問題と判断した。

### Wave 修正

`shot_log` の教訓に合わせ、単発ではなく小集団を維持しつつ、硬い敵の重ね過ぎを削った。中盤の bruiser を減らし、weaver と scout のレーンを左右に散らし、ボス前後に燃料を残した。`wave_grammar_check.js` では wave 数、レーン分散、HP負荷、ボス中の燃料数を見るようにした。

### 反撃弾の修正

変換数は出るが `relayHits` が低い時期があった。これは「パルスが防御ボタンに見え、攻撃快感へ接続していない」問題と解釈した。点数補正ではなく、変換弾の初速を近い敵へ軽く向ける形へ変更した。ホーミングではなく、撃ち返しが目で追える程度の誘導に留めた。

### ボス調整

route はボス到達後に長く粘るが、ボスを倒し切れない状態だった。これは到達率では見逃すべきではないので、短編プロトタイプとしてボスHPとボス中の燃料密度を下げた。最終的に route は 5 seed で 64 秒前後クリアする。

## 2026-05-23 評価結果

`node verify.js`

- mechanic: `converted 5`, `conversionHits 2`
- route 3 run: すべて `state clear`
- 代表値: `time 64.08`, `score 12800`, `lives 2`, `converted 18`, `conversionHits 5`, `damageTaken 2`

`node timeline_eval.js`

- route: `clearRate 1`, `bossReachRate 1`, `meanTime 64.08`, `meanScore 12800`, `meanConverted 18`, `meanRelayHits 5`, `meanDamage 2`
- noPulse: `clearRate 1`, `meanTime 56.75`, `meanScore 12200`, `meanConverted 0`
- aggressive / pulseHeavy: 19 秒前後で落ちる。これは「突っ込み過ぎる方針は死ぬ」というチェックとして残す。
- camper: 20 秒前後で落ちる。画面下に留まるだけでは解けない。

noPulse もクリアするため、パルスは必須攻略ではない。これは弱点でもあり、初心者向けの逃げ道でもある。今回は v001 として「使うとスコアと演出接続が増え、被弾しても route が立て直せる」位置付けで完成扱いにした。

`node wave_grammar_check.js`

- severe warning なし。
- warning は `dense_pacing_gap` 1 件。W3 drill から targets まで 1.3 秒で、意図したチュートリアル的重ねとして許容した。

## 残る弱点

- noPulse がクリアできるため、固有メカの必須性は弱い。
- `shootable_gap` と `bullets_without_targets` はまだ残る。ボス前後で回避優先の route が射線を外す秒が多い。
- ヘッドレス AI は人間の楽しさを代表しない。route がクリアしたことは最低限の到達性であり、面白さの証明ではない。
- ブラウザでの目視プレイは今後さらに必要。今回はヘッドレスと設計ログでの自己評価が中心。
