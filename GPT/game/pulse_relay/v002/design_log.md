# design log

## 2026-05-23

ユーザー指示:

> では、v002をいったん消して、v001と無関係に、v001を参照せずにゼロからv001レベルのものを作ってみて。

実行:

- 既存 v002 を削除し、空ディレクトリから再作成した。
- v001 のソース、敵配置、数値、ルートは参照していない。
- `memory/game_design_rules.md` と `memory/game_self_misjudgment_prevention_20260523.md` を読み、設計前ゲートとして `design_trace.md`、`wave_intent_table.md`、`eval_timeline.md`、`visual_review.md`、`self_judgment.md`、`known_failures.md` を作った。
- 実装前に 3 回の設計サイクルを `design_trace.md` に残し、初期 draft を `delete-and-redesign pass` で破棄した。

実装:

- 新規タイトルは `Pulse Relay v002: Vector Wake`。
- 通常ショットで小隊を撃ち切り、graze/kill で溜めた pulse で敵弾を消して反撃 shard を撃つ。
- 敵 route は `entry / show / exit` を持つ。退場方向は役割と結びつけた。
- boss は 48 秒に出現し、3 phase で攻撃が変化する。

検証:

- `node verify.js`: OK。
- `node enemy_overlap_check.js`: OK。初期完成時は `pairOverlaps: 0`, `minGap: 2.29`。
- `node timeline_eval.js`: OK。初期完成時は balanced clear 70.23 秒、boring runs なし、visible-but-not-shootable runs なし。
- boss TTK: ideal normal 15.97 秒、pulse burst 11.77 秒。

調整で得た教訓:

- sideArc の overlap は、単純な間隔不足ではなく、退出する敵と反対側から入る敵が同じ画面端を使ったことが原因だった。直角 offset ではなく、出現 side のブロック化で解いた。
- bridge lance と diver の overlap は、bridge lance の退場 rail と diver の入場 rail が近すぎたことが原因だった。route の目的を保ったまま rail を変えた。
- timeline の boring は単発秒と連続 run を分けて読むべき。単発の息継ぎを消し切ることが目的ではなく、退屈な連続区間を防ぐことが目的。

## enemy/wave redesign pass

ユーザー指摘:

> 敵の出現パターンや軌跡、出現から退場までの緩急や、登場順、敵同士のシナジーなど、実装されたもののレベルが低い。

原因分析:

- 敵ルートを「重ならないこと」の関数として扱いすぎ、何のために入場し、どこで撃たせ、なぜ掃けるかの意図が弱くなっていた。
- wave の順序が敵種紹介の列になっていて、プレイヤー状態を「中央で撃つ」「横へ振られる」「pulse で切り返す」「boss 前に照準を戻す」と遷移させる設計になり切っていなかった。
- headless 指標は boredom/overlap/clear 可否を拾ったが、全敵が同じリズムに見える問題や、軌跡の攻撃的な緩急不足を直接検出していなかった。

対処:

- scout / sideLance / sideArc / diverCut / carrierWake の `entry / show / exit` 時間を短縮し、入場を鋭く、show を撃つための短い窓、exit を役割に沿った掃け方へ再調整した。
- `buildWaves()` を敵種紹介ではなく、プレイヤー状態の流れで組み直した。opening scouts、左右の orange lance、magenta cut、carrier setup cross、green carrier + answer arc、pre-boss cut、boss warning という順にした。
- overlap は直角 offset ではなく、出現間隔、同一軌跡上の位相、左右ブロックの時間分離で解いた。意図のない不格好なズレは避けた。
- carrier 前後は scout/cut/sideArc を支援として配置し、carrier 単体の HP 的な硬さではなく、横圧と pulse 判断で山を作るようにした。

再検証:

- `node verify.js`: OK。balanced clear 68.82 秒、aggressive clear 66.22 秒、conservative clear 69.88 秒、pulse-heavy clear 68.95 秒。
- `node enemy_overlap_check.js`: OK。`pairOverlaps: 0`, `minGap: 0.08`。かなり密だが、重なりは出していない。
- `node timeline_eval.js`: OK。boring runs なし、visible-but-not-shootable runs なし、heavy pressure なし。

残る疑い:

- `minGap: 0.08` は意図的に密度を残した結果だが、見た目上は窮屈に見える可能性がある。
- 実ブラウザの長時間プレイや動画ベースの motion review はまだ不足している。headless で通ったことを完成の同義にしない。

## formation/speed correction pass

ユーザー指摘:

> 編隊としてまとまりがない敵しか出てこないうえに、出入りが異常な速度になっている。敵アルゴリズムなどもいろいろ適切でないし、速度帯もチェックして。

原因分析:

- 前回の redesign は `boringRuns: []` と `pairOverlaps: 0` を満たすことへ寄りすぎ、編隊としての同方向性、同じ spawn gap、読みやすい lane progression を壊していた。
- route の `entry / exit` に三次の `easeIn/easeOut` を短い duration で使ったため、平均速度は許容に見えても終端速度が跳ねた。実測では scout exit max 43.95px/frame、diver exit max 47.18px/frame まで出ていた。
- 検証に速度帯がなく、異常な出入りを数値で検出できなかった。
- `verify.js` は 4 policy 中 2 policy clear で通る弱い条件だったため、conservative policy の失敗を完成判定が見逃す危険があった。

対処:

- `route_motion_check.js` を追加し、route/phase ごとの avg/max speed を検査するようにした。
- route 用に `easeSoft` を追加し、短い三次 exit ではなく、速度ピークが跳ねにくい補間へ変更した。
- scout / sideLance / sideArc / diverCut / carrierWake の duration、退場距離、show 中の動き幅を再調整した。
- wave の lane 列を、散ったパターンから「同じ方向、同じ gap、読みやすい上昇/下降 lane」を持つ小隊へ変更した。
- 21-23 秒の空白 run は carrier setup bridge を追加して埋めた。
- boss phase2/phase3 の弾数と cadence を調整し、全 headless policy が clear するようにした。
- `verify.js` は全 policy clear 必須へ強化した。

再検証:

- `node route_motion_check.js`: OK。scoutRail exit max 9.65、sideLance exit max 7.41、sideArc exit max 7.33、diverCut exit max 12.37、carrierWake exit max 4.41。
- `node enemy_overlap_check.js`: OK。`pairOverlaps: 0`, `minGap: 3.49`。
- `node timeline_eval.js`: OK。balanced clear 71.50 秒、boring runs なし、visible-but-not-shootable runs なし、heavy pressure なし。
- `node verify.js`: OK。balanced 71.50 秒、aggressive 66.65 秒、conservative 73.23 秒、pulse-heavy 72.95 秒で全 clear。

教訓:

- overlap/timeline 合格後でも、speed gate と formation coherence gate がなければ、見た目の質は壊れる。
- 敵の速さは「平均移動距離 / duration」だけでは足りない。補間のピーク速度を測る必要がある。
- lane 列は数値上ばらけていればよいわけではない。編隊として同じ意図を持つ方向、間隔、順序に見える必要がある。
## enemy-count/stage-flow correction pass

ユーザー指摘:

> 敵の出現数は倍くらいほしい。プレイヤーの移動速度に比べて、動きがひょこひょこ早すぎて狙って倒すのが困難。敵と敵の連携や組み合わせ感が薄くて、適当なパターンが繰り返し出てる感覚になり、ステージの展開がない。

原因分析:

- 敵数を増やす前の配置は、各敵種の紹介が中心で、同じ役割の波が短く出て終わるため、ステージ全体の「前振り -> 横圧 -> 優先目標 -> ボス前圧」の流れが弱かった。
- 速度調整は route 単体では通っていたが、プレイヤー速度との相対で見ると、entry/exit のピークが高く、狙って倒す時間が不足していた。
- 敵数を単純に増やすと、同一軌跡上で退場中の敵と次の敵が重なり、編隊ではなく交通渋滞に見えた。これは offset ではなく、時間軸・lane progression・左右ブロック分割で解く必要があった。

対処:

- 総出現数を 117 体に拡張した。内訳は scout 50 / lance 44 / diver 19 / carrier 3 / boss 1。
- `BOSS_START` を 60 秒、`STAGE_END` を 86 秒へ伸ばし、敵数増加を同一時間帯への詰め込みで処理しないようにした。
- opening scouts は広い rail で早い撃破 rhythm、orange lances は左右の返し、magenta cuts は短い show の優先撃破、carrier setup は横圧から carrier へつなぐ、green relay は carrier + arc + cut、boss warning はボス前の照準戻し、という段階に再整理した。
- route duration と boss 弾幕を再調整し、敵の「ひょこひょこ速い」印象を抑えつつ、show 中に狙える時間を残した。
- overlap は検証を緩めず、lane の直角方向 offset ではなく、出現間隔・左右ブロックの開始秒・lane の単調な進行で解消した。

再検証:

- `node game\pulse_relay\v002\enemy_overlap_check.js`: OK。`pairOverlaps: 0`, `minGap: 1.06`。
- `node game\pulse_relay\v002\route_motion_check.js`: OK。route/phase ごとの速度ゲート内。
- `node game\pulse_relay\v002\timeline_eval.js`: OK。balanced clear 81.45 秒、boring / notShootable / heavy runs なし。boss は 60 秒開始、balanced では約 21.45 秒。
- `node game\pulse_relay\v002\verify.js`: OK。balanced / aggressive / conservative / pulse-heavy が全 clear。boss duration は 18.22-22.67 秒。

残る注意:

- 敵数は増えたが、20-28 秒付近は意図的に息継ぎを作ったため、実ブラウザで薄く感じるなら carrier setup bridge を増やすより、次の波の予告弾や視覚演出でつなぐ方がよい。
- `minGap: 1.06` は近接した編隊密度としてはよいが、見た目でまだ窮屈なら、敵数を減らすのではなく同一 route 内の lane 幅を少し広げる。
## 2026-05-23 auto-shot / density / stage-flow correction pass

ユーザー指摘:

> 弾は撃ちっぱなしにして、spaceは違うことに使う方が良い。敵出現で何もない時間や敵の数が少ない時間が長い。過去作と比較してみて。横から出る敵が無意味に硬くて撃破できない。敵の展開が、縦→横→なにか→縦→横・・・・と同じ展開が二回繰り返して単調。二回目は中型敵と絡めるなど、ステージの展開が存在してない。これも記憶ログにある問題なのに解決できてない

過去作比較:

- shot_log v01 の記録値は target uptime 0.960、midgame shootable 16.31、midgame bullets 30.37、max empty 0.33s。これはかなり高密度なショット系の基準。
- graze_log_cdx v57 のゲーム相応な目標値は meanMidgameShootable 5.27、meanMidgameBullets 4.23、meanMaxNoShootableGapSec 1、meanMaxEmptyScreenGapSec 1。
- 今回の Pulse Relay v002 は、直前の測定で meanMidgameShootable 3.60-4.24 付近に落ち、13s/29s/36s/49s などに低 shootable の谷が出ていた。つまり「空白 run はない」と言えても、過去作の dense flow には届いていなかった。

対処:

- 通常ショットは常時 auto-fire に変更し、Space/X/Shift は pulse 用にした。`index.html` の入力表示も `Auto Shot / Pulse Space/X/Shift` に変更。
- 横から出る lance/sideArc の HP を下げ、横圧は「硬さ」ではなく出現間隔、横移動、弾圧、他 wave との絡みで成立させる方針に戻した。
- 13 秒付近の空白は `orange cleanup pickup` で埋めた。右からの返しが入る前に拾える小型を置き、単なる待ち時間にしない。
- 18-23 秒は `magenta recovery pickup` を追加し、diver の切り込み後に中央へ戻って拾える小型を置いた。diver と同じ出口を使って重ならないよう、lane を中央寄りに再調整した。
- 29-36 秒は二回目の縦横反復ではなく、`second phrase left/right anchor` という中型 carrier を入れ、`carrier setup bridge/cross/harvest connector` をその前後に置いた。二回目の展開は「中型を撃たせつつ周囲の小型と横圧を処理する」構造に変えた。
- 45 秒以降は relay tail と priority lead-in の lane を分けた。前座と切り込みが同じレーンを踏んで重なる失敗を、右端/左端の役割分離で修正した。

再検証:

- `node game\pulse_relay\v002\enemy_overlap_check.js`: OK。`pairOverlaps: 0`, `minGap: 0.58`。
- `node game\pulse_relay\v002\route_motion_check.js`: OK。route/phase ごとの速度ゲート通過。
- `node game\pulse_relay\v002\timeline_eval.js`: OK。balanced clear 84.53s、boring runs なし、low-shootable runs なし、visible-but-not-shootable runs なし、heavy pressure なし、meanMidgameShootable 4.71。
- `node game\pulse_relay\v002\verify.js`: OK。balanced/aggressive/conservative/pulse-heavy 全 clear。boss duration は 19.08-24.53s。

今回の教訓:

- 「空白 run がない」だけでは足りない。過去作比較の密度指標、特に meanMidgameShootable と low-shootable 秒を同時に見る必要がある。
- 敵を増やす時は、数値だけ増やすと exit 中の敵と次 wave の entry/show が重なる。必ず `intent -> lane -> spawn gap -> overlap check -> timeline` の順で直す。
- 二回目の同型展開は、そのまま繰り返さず、中型、回収小型、横圧、pulse 判断など、前回になかったプレイヤー判断を追加する。
