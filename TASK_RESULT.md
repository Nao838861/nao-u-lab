# 初雪・雪解け・初腐敗の事件化 実装結果

## 実装

- buildを`v004.40.0-season-events`へ更新した。
- 実効暦の12月1日（春開始オフセットでは271日目）に初雪、3月1日（361日目）に雪解けの一言を毎年キューへ積む。
- 表示暦と事件暦を同じ「0日目/1日目=3月1日」の規則へ統一した。実Chrome監査で検出した1日ずれ（270日目は11月30日）を修正済み。
- 魚・野菜の品目別腐敗累計を読み取り専用snapshotへ公開し、初めて増えた日に各品1回だけ発話する。
- 季節事件と初腐敗は既存のエレナ一言の器へ流し、読み終えると自動既読になる。常設説明や書状は追加していない。
- 初腐敗の発話済み状態、前回観測した腐敗累計、発話待ちキューを通常セーブへ保存する。旧セーブは現在累計を基準にして過去の腐敗を初腐敗として誤発話しない。
- エンジンの経済挙動、`market_network`、既存の大量腐敗報せは変更していない。

## 台本全文

1. 初雪: 「初雪です。畑は春まで止まり、魚は1日20荷から5荷に減ります。蓄えと漁で春を待ちます。」
2. 雪解け: 「雪が解けました。畑が動き始めます。」
3. 魚の初腐敗: 「魚が傷んで捨てられました。魚は3日と持ちません。」
4. 野菜の初腐敗: 「野菜も傷みました。野菜は30日ほど持ちます。」

## UI向上段9の解消

既定グラフから生産性グラフを外し、食料・人口・取引資金の3枚へ戻した。

判断理由:

- `READABILITY_DESIGN_20260725.md`、`README.md`、`design_log.md`はいずれも、統計の既定表示を「食料・人口・取引資金の3グラフ」と明記している。
- 空間生産性の設計意図で必要なのは、島全体の現在値、30日前差、実生産/理想生産、距離損失、近隣直接取引を読めること。これらは統計内の生産性診断カードに残っており、既定グラフを4枚へ増やさなくても主要な判断材料を失わない。
- したがって、後発の空間生産性グラフを既定へ常設して正典を4枚へ改訂するより、既定3枚の情報階層を守り、生産性は診断カードで読む方が既存方針に整合する。

## 実Chrome検証

Google Chrome本体の隔離プロファイル、現在worktree専用のローカルサーバー、CDPスモークを使い、1440×900で確認した。

- 実行: `SHIOJI_CDP=http://127.0.0.1:9227 SHIOJI_URL=http://localhost:8437/game/shioji/v004/ SHIOJI_SEASON_SCREENSHOT_DIR=tests/artifacts node tests/browser_smoke.mjs --seasonal-events-only`
- 結果: `CHARTER ISLE v004 seasonal events smoke: PASS`
- 初雪: 271日目、HUD「冬・12月」、雪に覆われた地形・冠雪、初雪台本を確認。
- 雪解け: 361日目、HUD「春・3月」、緑へ戻った地形・樹木、雪解け台本を確認。
- 初腐敗: 同じ実プレイで魚・野菜とも腐敗累計が増え、`announcedSpoilage=["fish","veg"]`になったことを確認。各一言は自動既読され、季節事件の前後で常駐しない。
- 画像:
  - `GPT/game/shioji/v004/tests/artifacts/season_event_first_snow.png`（1440×900、SHA-256 `fd8f921db591ea0a5e80413f7b9fd803b65bcf07f352d0fc3ef17fe4653cf2fd`）
  - `GPT/game/shioji/v004/tests/artifacts/season_event_thaw.png`（1440×900、SHA-256 `b9d10d31f64412f2a3425191495982af548445c6c7ffaf88ed746550bb85ee3d`）

## テスト

- `node tests/run.mjs --match '季節事件|UI向上段9: 需給|空間生産性UI: 建物・市場圏'`: PASS（5件）
- `npm run test:focused -- '表示snapshot'`（engine）: PASS（1件）
- `node tests/acceptance.mjs`: PASS（全章受け入れ、UI全8操作150日後とjournal再生が一致）
- `node tests/browser_smoke.mjs --seasonal-events-only`: PASS（初雪・初腐敗・雪解け、画像2枚）
- `npm test`: 既知の先頭不整合 `tests/food_delivery_save.mjs`（食料優先購入の期待6荷、現行実測3荷）で停止。
- `npm test`を構成するengine全件を単独実行: 今回関連のsnapshot試験はPASS。既知の長期較正不整合（段36/45、段47、段49）は残存し、今回の表示専用snapshot追加とは無関係。

今回解消対象だった`UI向上段9`の既定グラフ`4 !== 3`はgreenになった。
