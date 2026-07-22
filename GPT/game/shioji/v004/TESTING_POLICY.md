# 変更範囲別テスト方針

小さな修正のたびに全章・engine全件・8年監査を連結しない。変更したファイル名だけでなく、変えた契約に応じて次のレベルを選ぶ。

## レベル1 — 文書・CSS・表示だけ

- 対象例: 文言、余白、色、静的DOM、engineへ渡さない表示処理。
- 実行: 構文確認。操作に触れた場合だけ関連する実Chrome smoke。
- 省略: v004全章、acceptance、engine、8年監査。

## レベル2 — v004のUI・教程

- 対象例: ボタンイベント、シート再描画、目標、書状、行動導線。
- 実行: `node tests/run.mjs --match "<関連テスト名>"`、必要なら`npm run test:tutorial-early`、操作面は`npm run test:browser`。
- 省略: engineを変更していなければengine全件と8年監査。

## レベル3 — engineの軽微な契約変更

- 対象例: 局所的な発火条件、既存操作の小さな境界条件。経済定数、保存則、日次phase順、物資変換量を変えないもの。
- 実行: `node tests/run.mjs --match "<関連テスト名>"`を`../engine`で実行し、影響するv004のfocused testを1本以上実行する。`--match`時は長期workerを起動しない。
- 省略: engine全件と8年監査。ただし関連テストで状態保存・決定論が疑われたらレベル4へ上げる。

## レベル4 — engineの根幹変更・公開前総点検

- 対象例: 経済定数、人口・飢餓、移民、物資保存、会社会計、日次phase順、物流容量、長期安定帯、複数章に跨るセーブ契約。
- 実行: `npm test`、必要な3 seed較正、`npm run audit:stable --prefix ../engine`、実Chrome。

## 個別コマンド

```bash
# 第一章の表示手順どおりに進める代表seed回帰
npm run test:tutorial-early

# v004の名前一致テストだけ
npm run test:focused -- "チュートリアル段5|チュートリアル段6"

# engineの名前一致unitだけ（長期workerなし）
cd ../engine
npm run test:focused -- "最初の生産適格注文"
```

テストを省略した場合も、最終報告には「どの契約を変えなかったため何を省略したか」を残す。
