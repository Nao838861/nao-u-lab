# graze_log v05.2_cdx_v41

v41 は v40 の `shield break -> relay -> side route commit` を維持しつつ、headless 評価で使う telemetry をゲーム本体へ追加した版。

## 追加した評価信号

- 30 frame ごとの sample: 位置、gauge、chain、敵数、敵弾数、pressure、phase、targetVisible。
- sparse event log: start / route / kill / shieldHit / bomb / activeDef / clear / gameOver。
- style vector: target uptime、urgent frame 率、最大 pressure、danger spike、左右/上下切り返し、route intent switch。

## 実行

`index.html` をブラウザで開く。`?bot=1&seed=12345` を付けると簡易 bot で自動進行する。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v41_check.js
node tools\headless_game_style_compare_v001.js
```

## 判定方針

headless は「楽しい」を直接判定しない。今回の方法は、同じ入力条件と同じ記録頻度で、プレイ署名が変わったかを比較するためのもの。人間評価へ出す前に、clear だけでは見えない coverage / pressure / movement / emergency economy の差を拾う。
