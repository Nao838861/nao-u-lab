# 春開始の実装結果

## 実装

- `tutorial`（エレナと開拓）、`sandbox`（ゼロから）、`test`（見本の町）の新規開始へ、共通の暦オフセット60日を適用した。
- 経過日は従来どおり0日から始め、表示・季節生産だけを実効暦日61日（1年目3月1日・春）として扱う。注文、移民、教程の待機日数、月次会計などの経過日契約は変更していない。
- 暦オフセットをengine snapshotとview modelへ渡し、新規セーブでは保持する。`calendarOffsetDays`を持たない既存セーブ・従来world・従来リプレイは0日オフセットへフォールバックするため、従来の再現結果を維持する。
- 季節を参照するengine処理（文化消費、原価見積り、秋の食料目標、麦収穫、一次生産、理想日産）を共通の実効暦へ追従させた。経済定数、日次phase順、注文周期、会計周期は変更していない。
- 表示側の暦、地形季節、食料HUDの季節理由、漁場配置見積り、教程の秋予告を同じ実効暦へ追従させた。
- `market_network`関連ファイルは変更していない。

## 教程の絶対日参照監査

| 参照 | 判定と処置 |
|---|---|
| `tutorial_content.js` 秋の冬支度予告の月・年算出 | 暦依存。`model.day`直算から、暦オフセット対応の`islandCalendar`へ変更。春開始から180日後の9月1日に発火するテストを追加した。 |
| `food_readability.js` の冬判定 | 暦依存。食料HUDが春開始直後を「冬・畑が休み」と表示しないよう、実効暦へ変更した。 |
| `renderer.js`、`main.js`、`placement.js` の月・季節算出 | 暦依存。積雪・季節表示・漁の日産見積りを実効暦へ変更した。 |
| 教程の `model.day > 10`、注文到着の15日周期、期限比較 | 経過日依存。新規worldの経過日は0のままなので変更せず、開始暦から分離した。これにより既存の教程順序と注文周期を維持する。 |
| `startDay`、`elapsedDays`、`model.day - issuedDay`、30/90日観察窓 | すでに相対日数。変更なし。 |
| 書状本文の「○日目」、出来事・注文のday/due | 実イベントの経過日証拠。暦トリガーではないため変更なし。 |
| 春開始で変化した教程較正 | 初注文完遂を固定78日目から「到着後4日以内」へ相対化。注文比較は全seed一律黒字ではなく、3seed全体で黒字経路と見送り経路を検証するよう更新。第四章の見送り候補待ちは開始時点から600日の相対窓へ更新した。 |
| 生journalからの教程再生fixture | 新仕様で作ったjournalだけ春開始worldへ再生するよう追従。汎用engineの従来リプレイ初期値は変更していない。 |

## 検証

- v004 unit: 全99件のうち、下記master既存不整合2件を除く97件がPASS
- `node tests/run.mjs --match "可読性B|開始選択|教程Z"`: PASS（6件）
- `node tests/run.mjs --match "チュートリアル段(?:7〜9|1[0-9])"`: PASS（15件）
- `node tests/run.mjs --match "^(チュートリアル段(?:7〜9|1[0-9]|2[0-2]):|UI向上段11:)"`: PASS（依存fixtureを含む17件）
- master既存不整合より後ろの独立テスト: PASS（8件）
- `npm run test:tutorial-early`: PASS（seed11、初注文完遂day79、死亡0）
- `node tests/acceptance.mjs`: PASS
- `node tests/run.mjs --match "暦オフセット"`（engine）: PASS
- 分離した一時プロファイルの実Google Chromeで `--start-choice-only`: PASS
  - tutorial / sandbox / testの全モードで、経過日0、オフセット60、実効暦日61、HUD「春・3月」を確認した。

## master既存失敗の除外

- v004 unit:
  - `AH-3/4`: masterの`README.md`に旧語「製塩所」が残る一方、テストが同語を禁止しているため失敗する。
  - `UI向上段9: 需給を独立表示...`: masterのHTMLには価格を含む`data-chart`が4件ある一方、テストが3件を期待するため失敗する。
- `node tests/food_delivery_save.mjs`: 実装前から「運搬枠をまず食料に使う」が期待6・実値3で失敗する。今回の変更対象外。
- engine full suite:
  - 段36/45（成熟需要帯）
  - 段47（悪配置baseline）
  - 段49（8年帯）
  - いずれも `engine/design_log.md` と `WORK_ORDER_20260727_MULTI_MARKET.md` に、食料先行導入以降masterで継続中と明記された既存失敗。
- browser full smoke: 今回の3モード確認後、既存の教程文言期待「まだ売る場所がありません」に対して実文言が「まだ丸太を売る場所はありません」で停止した。今回追加した開始モード限定smokeは全緑。
