# graze_log v05.2_cdx_v40

v40 は v39 の `shield break -> relay -> side route` を維持しつつ、relay 後の左右 connector を単なる両側追加ではなく「最初に撃破した側へ route を確定する」構造に変えた版。

## v40 追加

- relay 撃破後に出る左右 connector へ `routeChoice` と `choiceDir` を付けた。
- 最初に撃破した side connector で `relayRouteChoiceCommitted` を立て、左または右の選択 flag を残す。
- 選んだ側だけに `dp_relay_committed_route` の follow-up heli を出し、横移動判断を chain 継続へ接続する。
- headless check に `relayRouteChoiceCommitted` を追加し、route 開放だけでなく route 選択が発火したことを検証する。

## 実行

`index.html` をブラウザで開く。`?bot=1&seed=12345` を付けると簡易 bot で自動進行する。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v40_check.js
```

期待:

- `relayPreviewUnlocks: true`
- `relayOpensSideRoute: true`
- `relayRouteChoiceCommitted: true`
- `botClearsWithBomb: true`

## 戻し手順

1. `routeChoice` / `choiceDir` の付与を削除する。
2. `spawnCommittedRoute` を削除する。
3. `killEnemy` の `relayRouteChoiceCommitted` 分岐を削除する。
4. headless check の `relayRouteChoiceCommitted` 条件を外す。
