# shot_log 実装基準の motion / wave 分析

## 分析対象

- 先生データ: `game/shot_log_cdx/v01_from_bd6c65a/index.html`
- 先生データの headless 実装: `game/shot_log_cdx/v01_from_bd6c65a/headless.py`
- 比較対象: `game/pulse_relay/v001/game.js`
- 数値比較スクリプト: `game/pulse_relay/v001/shot_log_motion_compare.js`

## 重要結論

今回の Pulse Relay が `shot_log` より鈍く見える原因は、単に補間が smoothstep だからではない。`shot_log` の `moveEnemy()` も区間補間に smoothstep を使っている。差は、`shot_log` が「短い入場」「射線に乗る時間」「退出」「次の小隊との重なり」を path primitive と wave layering で作っているのに対して、Pulse Relay は `curve` / `side` / `dwell` / `boss` の汎用 route に敵を流し込み、配置名だけで展開を作った気になっている点にある。

`shot_log` は 14 wave / 約 526 敵の規模で、1 wave の中に複数の小隊を遅延付きで重ねている。Pulse Relay は 9 block / 75 event で、敵数が少ないうえ、block 内の小隊文法が薄い。したがって、1 体ごとのパラメータを少し速くしても、`shot_log` 的な密度・切り返し・撃つリズムには戻らない。

`shot_log_motion_compare.js` の現在値では、`shot_log` は平均 spawn gap 7.17f、最大同時 active target 100、平均 active target 31.11。Pulse Relay は平均 spawn gap 66.92f、最大 gap 388f、route 内訳は `curve` 51 / `side` 18 / `dwell` 5 / `boss` 1。さらに `dwell` の y=150 到達は 304-360f かかる。ここから見ても、Pulse Relay の問題は「敵の速度を少し上げる」ではなく、「小隊単位の重なり、短い役割時間、退出 deadline を実装する」ことにある。

## shot_log の移動プリミティブ

| primitive | 実装上の動き | 効いている役割 |
|---|---|---|
| `pLineDown(x,endY,n,gap)` / `pTopDown` | 画面上から 140f で射線上の `endY` へ降り、160f でそのまま下へ抜ける。列内は 7-10f 程度で連続出現する。 | 正面射撃の快感を途切れさせない。単体ではなく列として撃たせる。 |
| `pVForm(cx,sp,endY)` | 5 体が 150f で V 字の到達点へ入り、140f で左右へ抜ける。遅延は中心から外へ 10f 単位。 | 視認しやすい形、短い狙い時間、退出方向の変化を同時に作る。 |
| `pSideSweep(left,y,n)` / `pSideEntry` | 横外から 110f で画面中央寄りへ入り、さらに 110f で反対側へ抜ける。20 体規模でも 10f ずつずらす。 | 横から来る敵を「撃ちにくいだけ」にせず、画面内を横断する射撃対象として成立させる。 |
| `pDive(x,ty)` | 100f で深い位置へ刺さり、40f で少し戻り、110f で斜め上へ抜ける。 | 下方向への圧と、すぐ抜ける鋭いアクセントを作る。ぬるい滞在ではない。 |
| `pLarge(x)` | 160f で入場、80f 停止、140f で上へ退出。 | 硬い敵に「狙う時間」と「期限」を作る。停滞し続けない。 |
| `pBoss(x)` | 180f 入場、800f 滞在、200f 退出。周囲に small / medium / large の燃料 wave を重ねる。 | boss が孤立してテンポを止めるのを防ぐ。boss 本体より、周辺燃料の重ね方が重要。 |

## Pulse Relay の現状差分

| route | 現状の動き | `shot_log` 基準での問題 |
|---|---|---|
| `curve` | 147f 相当で横外から目標 x へ曲線入場し、その後ゆっくり下へ流れる。 | 個体数が少ないため、曲線が「小隊の切り返し」ではなく単体のぬるい接近に見える。列・V・横断のような形が弱い。 |
| `side` | 93f で横から入場し、その後は sine drift と低速下降。 | `shot_log` の side sweep は反対側へ抜け切る横断運動だが、Pulse は入ったあと滞留する。横圧のメリハリが消える。 |
| `dwell` | y=150 まで速度 32-38 で降り、以後 sine drift。開始 y=-42 の場合、目標位置まで約 303-360f かかる。 | 硬い敵に狙う時間を作る意図はあるが、入場が長すぎて「狙わせる」前にテンポを落としている。`pLarge` の 160f 入場 + 80f 停止 + 140f 退出とは違う。 |
| `boss` | y=92 に最初から出現し、横 sine sway。 | 入場 cue、フェーズ感、周辺 fuel wave の同期が薄い。boss が stage 上に置かれているだけに見える。 |

## wave 構造の差分

`shot_log` の wave は、単発の出現列ではなく「同時に意味が違う小隊を重ねる」構造になっている。例えば W4 は `pVForm` 3 群に左右/中央の `pLineDown` を重ね、W11 は boss に large と small/medium の late fuel を重ねる。これは見た目の派手さだけでなく、「今撃つ対象」「次に視線を移す対象」「boss を撃ち続ける燃料」を同時に用意するための構造である。

Pulse Relay は `opening_curve_train`、`armored_gate`、`boss_relay_exam` などの block 名はあるが、内部は少数の `curveTrain` と `sideFeed` と単発 `armored` に寄っている。名前は set piece でも、実装はまだ「配置候補の列挙」に近い。今後は block 名ではなく、block 内に何個の小隊があり、それぞれがどの射撃行為を作るかをチェック対象にする。

## Pulse Relay を直す具体方針

1. `curveTrain` を主役にしない。`lineColumn`、`vBurst`、`diveSlash`、`crossSweep`、`largeDeadline` のような、入場・狙い時間・退出が明確な primitive に置き換える。
2. `sideFeed` は横から入って漂う敵ではなく、80-110f 程度で射線へ入り、さらに 80-120f 程度で反対側へ抜ける横断小隊にする。横から来る敵は「撃ちにくい障害物」ではなく「横断する撃破列」として設計する。
3. `armored` / `anchor` は `dwell` でゆっくり降ろさない。90-160f の速い入場、50-90f の狙い時間、90-160f の退出または危険化を持つ deadline enemy にする。
4. boss は y=92 に置くだけにしない。入場 cue、滞在中の燃料小隊、終盤の late fuel を設計し、boss 単体を撃たせる時間を長くしすぎない。
5. 1 block に 1 種類の出現しか置かない癖をやめる。最低でも「主射撃列」「横圧」「硬い deadline」「回復/燃料」のどれをどの秒に重ねるかを明示する。
6. 既存 game の文法を再利用する時は、ゲーム名や印象語ではなく、実装から primitive、frame duration、stagger、wave 内重なり、active target 数を抜き出して比較する。

## 次の実装ゲート

次に Pulse Relay を直す時は、以下を満たすまで完成扱いにしない。

- `shot_log_motion_compare.js` で、敵数・小隊数・最大 spawn gap・route/primitive 比率の差分を確認する。
- `dwell` のような長い crawl が主要な硬い敵に残っていないことを確認する。
- 各 block について、実装前に「何の小隊が、何秒に、何を撃たせるために出るか」を書く。
- 実装後に 1 秒ごとの timeline 評価だけでなく、motion primitive の比率と block 内 subformation 数を確認する。
- 「既存の最初に作った仮 wave のパラメータ調整」ではなく、primitive と wave grammar を作り直したことを差分で確認する。
