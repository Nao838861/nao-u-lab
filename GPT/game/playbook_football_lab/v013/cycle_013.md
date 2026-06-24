# サイクル013 自己判断

日付: 2026-06-24

## 観察

v012 で `blockQuality` は入ったが、画面上では接触品質の強弱だけで、押し込んだのか、抜けられたのか、反則気味に絡んだのかが分かりにくい。

## 判断

次はブロック結果の分類。いきなりペナルティヤードまで入れるとゲーム進行の調整が大きいため、まず `drive / shed / holding / engaged` を状態として出し、Coach score にだけ軽く反映する。

## 実装

- `classifyBlockResult()` と `setBlockResult()` を追加
- `drive / shed / holding / engaged` の4結果を導入
- 結果ごとにリング色を変更
- HUD、snapshot、replay frame に結果を保存
- holding 時は Coach score に軽いペナルティ

## 次の候補

holding を本当の反則としてダウン距離や獲得ヤードへ反映するか、先に作戦保存/編集性へ進むかを判断する。
