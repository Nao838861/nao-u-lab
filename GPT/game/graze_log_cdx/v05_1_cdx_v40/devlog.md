# graze_log v05.2_cdx_v40 devlog

## 2026-05-21 Codex v40: relay 後の side route を選択として確定する

## 背景

v39 は relay 生存中に locked route preview を見せ、relay 撃破で左右 route が開くようにした。ただし開放後は左右 connector が両方出るため、プレイヤーの行動が「全部撃つ」に戻りやすい。v40 は最初に撃破した side connector を route 選択として確定し、選んだ側だけへ follow-up を出す。

## 実装

- relay 撃破後に出る左右 connector へ `routeChoice` / `choiceDir` を付けた。
- `spawnCommittedRoute(dir,x,y)` を追加し、選んだ側だけに `dp_relay_committed_route` follow-up を出すようにした。
- `killEnemy` に、最初の `routeChoice` 撃破で `relayRouteChoiceCommitted` と左右どちらかの flag を立てる分岐を追加した。
- v39 の `relayShowsLockedRoutePreview`、`relayPreviewUnlocks`、`relayOpensSideRoute`、BOMB final cue は維持した。
- headless v40 check に `relayRouteChoiceCommitted` を追加した。

## 検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v40_check.js
```

結果は `design_log.md` に追記する。

2026-05-21 実行結果:

- `relayRouteChoiceCommitted: true`
- `relayRouteChoiceLeft: true`
- `relayRouteCommittedFollowup: true`
- `relayPreviewUnlocks: true`
- `relayOpensSideRoute: true`
- `botClearsWithBomb: true`
- bot: `killCount=140`, `maxChain=18`, `bombCount=1`, `grade=S`

## 戻し手順

1. relay side connector の `routeChoice` / `choiceDir` を削除する。
2. `spawnCommittedRoute` を削除する。
3. `killEnemy` の routeChoice commit 分岐を削除する。
4. headless check の `relayRouteChoiceCommitted` 条件を外す。
