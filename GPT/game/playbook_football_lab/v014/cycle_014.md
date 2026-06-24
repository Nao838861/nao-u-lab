# サイクル014 自己判断

日付: 2026-06-24

## 観察

v013 で holding は見えるようになったが、Coach score の軽い減点だけだった。反則名が出るのに獲得やダウン距離へ影響しないのは、ルールとして一貫しない。

## 判断

このサイクルでは holding を試合進行へ反映する。accept/decline までは入れず、まず攻撃側 holding は10yd罰退、獲得取り消し、次ダウンへ進む簡易処理にする。

## 実装

- `holdingPlayers()` / `hasHolding()` / `enforceHoldingPenalty()` を追加
- 捕球後ラン終了時に holding があれば通常獲得を取り消す
- 10yd罰退と次ダウン/距離へ反映
- `HOLDING` バナーと結果カードへ反映
- snapshot に `holdingPlayers` を追加

## 次の候補

ブロック/反則の最低限の一貫性はできた。次は作戦編集の実用性として、ルート点削除とプレー保存へ進む。
