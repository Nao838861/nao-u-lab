# graze_log v05.2_cdx_v16

`v15` の graze window / Active DEF 報酬を維持し、DEF を押すべき瞬間を画面上で読みやすくした版。

## 起動

`index.html` をブラウザで開く。

可視自動検証:

```text
auto_verify.html
```

headless:

```powershell
node tools\headless_graze_log_cdx_v05_2_v16_check.js
```

## v16 の変更

- DEF ready かつ近距離弾が2発以上ある時、Active DEF 半径のリングを先に表示する。
- 同じ状態が72フレーム続いた時だけ `DEF WINDOW` を出し、HUD に `DEF n` を追加する。
- Active DEF 使用時に cue timer をリセットし、DEF cue が残り続けないようにした。
- headless check で DEF cue の発火、表示、DEF 後のリセットを確認。
