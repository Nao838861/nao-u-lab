# graze_log v05.2_cdx_v66 devlog

## 2026-05-24 Codex v66: browser-ready review DOM contract

### 背景

v65 では通常 UI 付き review screenshot の canvas 位置と CHASE popup pixel を headless Chrome で確認した。次の弱点は、実ブラウザや in-app browser で review URL を開いた時に、ページ側の契約が DOM からも読めるかが未検証だったこと。

今回は gameplay には触れず、目視レビュー前の surface 証拠を増やした。これは「楽しいか」の判定ではなく、次に人間が見る URL が正しいモード・正しい版・正しい canvas を示しているかの検証である。

### 実装

- `v05_1_cdx_v66` を v65 から派生。
- `<body data-game-version="v05_1_cdx_v66">` と runtime の `data-probe-mode` を追加。
- canvas に `aria-label`、`data-probe-canvas="game-surface"`、`data-game-version` を追加。
- `makeProbeSnapshot().visualContract.dom` に DOM 契約情報を含めた。
- `tools/headless_graze_log_cdx_v05_2_v66_visual_probe_check.js` で Chrome `--dump-dom` を実行し、review URL の DOM 契約を assertion に追加。

### 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v66_check.js
node tools\headless_graze_log_cdx_v05_2_v66_policy_matrix_check.js
node tools\headless_graze_log_cdx_v05_2_v66_visual_probe_check.js
```

### 結果

3 本とも pass。

- focused check: route bot clear、`chaseBonus 19157`、`chasePopupCount 28`、CHASE popup readability 維持。
- policy matrix: route / aggressive / marksman は clear と CHASE bonus を維持、camper は clear 0 / CHASE bonus 0。
- visual probe: bare canvas pixel probe、normal UI review screenshot probe、browser DOM contract が pass。

### 残課題

Browser Use の in-app browser 操作は skill を読んだが、このセッションでは Node REPL `js` tool が公開されていないため実行できなかった。代替として Chrome headless screenshot と `--dump-dom` を使い、実ブラウザ寄りの証拠を増やした。次回、Node REPL が使えるセッションでは review URL を in-app browser で開いて目視確認へ進める。
