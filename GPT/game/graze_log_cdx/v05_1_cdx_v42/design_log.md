# graze_log v05.2_cdx_v42 design_log

## 対象 directive

Slack pending の game directive は今回なし。`game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active` を対象にした。

Nao_u 指示原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか、Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

直近 directive の焦点:

> v41 の simple bot は clear し、BOMB も使用する。さらに headless telemetry で coverage / pressure / movement / event trace を取れる。次は graze_log 側にも複数 bot style を追加し、shot_log と同じ policy split で比較する。

## 実装前判断

v41 ではゲーム内容を変えずに評価信号を増やした。次の最小 playable diff は、敵配置やスコアをさらに動かすことではなく、同じ stage を複数方針で走らせて「どこが変わったか」を見られるようにすることだと判断した。

使った過去知見:

- `Playable / Headless 評価`: 起動と clear だけでなく、playthrough の中身を観測する。
- `Balance / Rule Space`: 単一 score ではなく、policy ごとの signature で比較する。
- `Feedback / Rights / Human Judgment`: headless は人間評価の代替ではなく、人間が問題にした差分を検証可能にする補助。
- v41 の学び: telemetry は器として有効だが、bot が 1 種だけだと比較の解像度が足りない。

## 設計サイクル 1

良いところ / 悪いところ 30 件相当の要約:

- 良い: v41 の route bot は clear し、coverage / pressure / movement / sparse event を記録できる。
- 良い: shot_log 側には center / aggressive / defensive / sweeper の policy split がある。
- 悪い: graze_log 側は route bot だけで、shot_log と同じ比較軸に乗らない。
- 悪い: 「どちらが良いゲームか」を単一 bot の結果だけで見ると、bot 適性に引っ張られる。
- 悪い: ただし多 policy を入れすぎると、ゲーム改善ではなく評価器作りだけが肥大化する。

改善案:

- v41 を v42 にコピーし、ゲームの敵配置・score ルールは維持する。
- `botStyle=route|aggressive|defensive|panic` の 4 種に限定する。
- `summarizeEvalTelemetry()` に `botStyle` を入れ、比較 script が policy を識別できるようにする。
- pass 条件は「どれが良いか」ではなく「方針差が観測できるか」に限定する。

採用案:

- `route`: v41 相当。
- `aggressive`: target 寄せを強め、前に出て撃破数を増やす。
- `defensive`: 弾回避重みを上げ、長い chain を残しやすくする。
- `panic`: 危険時に端へ逃げ、高 pressure / early failure を出す。

## 設計サイクル 2

検証条件の見直し:

最初は「aggressive は target uptime が上がる」「panic は movement switches が減る」と仮定したが、実測では targetVisible は敵がプレイヤーより上にいる時間であり、攻撃性の直接指標ではなかった。また panic は端逃げの反転が増えた。そこで条件を実測可能な signature に変更した。

最終条件:

- route は v41 までの成立条件を維持する。
- aggressive は route より killCount が多い。
- defensive は route 以上の maxChain を出す。
- panic は route より urgentPct が大きく、緊急処理が増える。
- style compare では panic が route より早く崩れ、pressure が高い。

## 懸念

- `panic` は人間の焦りを再現するものではなく、危険時の極端な端逃げ policy でしかない。
- `defensive` は invincible check では clear するが、style compare の通常条件では gameOver になる。これは「守り寄りが必ず生き残る」という意味ではなく、route を外すことで boss 前の処理が崩れることを示す。
- headless の policy split は評価方法の改善であり、面白さの判定ではない。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v42_check.js
node tools\headless_game_style_compare_v002.js
```

2026-05-21 実行結果:

- `headless_graze_log_cdx_v05_2_v42_check.js`: pass。route は clear / grade S / kill 140 / maxChain 18 / bomb 1。policy split も true。
- `headless_game_style_compare_v002.js`: pass。shot_log の既存 policy split と、graze_log の route / aggressive / defensive / panic split を同一 report に出力。

主要観測:

- route: clear、score 85530、kill 140、maxChain 18、urgentPct 0.036。
- aggressive: clear、kill 164。
- defensive: maxChain 22。
- panic: style compare で 30.73 秒 gameOver、urgentPct 0.221。

## 次の作業

style compare v002 の report を JSONL に保存し、v42 以降の version 間で signature diff を見られるようにする。特に `panic` の movement switches は高すぎるため、「人間の panic」ではなく「端逃げ policy」と明記して扱う。
