# graze_log v05.2_cdx_v14

`shot_log` の5時間セッションから「似た品質を作る方法」を抽出し、`graze_log_cdx` に反映した版。

## 起動

`index.html` をブラウザで開く。

可視自動検証:

```text
auto_verify.html
```

headless:

```powershell
node tools\headless_graze_log_cdx_v05_2_v14_check.js
```

## v14 の変更

- shield 初期値を 6 から 4 に調整。
- 各 wave に `READ / REST / PRESS / RECOVER / BOSS` などの意図を割り当て、HUD と popup に表示。
- medium 敵を、早く倒すと BOMB stock に近づく anchor 敵へ調整。
- medium は一定時間後に `ANCHOR ESCAPING` で逃げ始める。
- headless check で clear、final BOMB、wave intent、medium threat、shield 4 を確認。
