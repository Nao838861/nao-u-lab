# graze_log v05.2_cdx_v14 design_log

## 入力

Slack pending 指示:

> Log_cdx 、shot_logの当時の5時間セッションの記録を熟読して、私の指示なしに似たようなクオリティのゲームを作る方法を考えて、今作ってるゲームで実践して成果を見せて。

継続 directive:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 実装前判断

v13 は shot_log の dialogue_archive から MAX cue、ボス存在感、リカバー、clear-capable headless を入れた。今回の指示は「似た品質のゲームを作る方法」を求めているので、v14 では個別要素ではなく制作手順を反映する。

shot_log 5時間セッションから読むべき方法は、次の4点:

1. 波を「読ませる / 休ませる / 圧をかける / 回復させる」に分ける。
2. 中型敵は背景ノイズではなく、倒す価値と逃げる圧を持つ節目にする。
3. 見えない設計意図は HUD と検証に出し、作った側の思い込みを減らす。
4. シールドやAI補助は評価のために必要だが、緊張を消す量にしない。

## 設計サイクル

良いところ / 悪いところ:

1. v13 は clear-capable bot が通る。
2. v13 は MAX 到達が見える。
3. v13 はボス final cue が見える。
4. v13 は shield 6 で事故を吸収できる。
5. ただし shield 6 は緊張を薄める可能性がある。
6. v13 の波の意図は実装者には見えるが、画面上では読み取りにくい。
7. medium はまだ「早く倒す価値のある脅威」になりきっていない。
8. `auto_verify.html` は便利だが、評価軸がゲーム内に出ていない。
9. shot_log で効いたのは単発機能ではなく、対話で節目を作り直したこと。
10. 今回はその節目を v14 に露出させるべき。

改善案:

1. v13 を v14 にコピーする。
2. shield 初期値を 6 から 4 に落とす。
3. `START_SHIELDS` 定数を作り、HUD に `4` を明示する。
4. `WAVE_INTENTS` を追加する。
5. stage event ごとに `READ / REST / PRESS / RECOVER / BOSS` などの意図を割り当てる。
6. wave 開始時に意図 popup を出す。
7. HUD の1行目に現在の意図を出す。
8. medium の半径と HP を上げる。
9. medium に標準 reward gauge を付ける。
10. medium が長居すると `ANCHOR ESCAPING` を出し、逃げる圧を作る。
11. medium が逃げ始めると加速する。
12. v14 headless で wave intent を検査する。
13. v14 headless で medium threat / reward を検査する。
14. v14 headless で shield 4 を検査する。
15. pending directive を handled にする。

採用:

- v14 は「shot_log の方法」を、波の意図表示と中型敵の役割強化として実装する。
- 打ち返し弾や長大な新システムは入れない。今の graze_log の中心は graze / BOMB / Active DEF なので、既存ループを太くする。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v14_check.js
```

期待:

- finite stage / midboss / boss / clear が維持される。
- clear-capable bot が boss final cue を見て BOMB を使う。
- wave intent、medium threat、shield 4 が headless で検査される。
