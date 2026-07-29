# TASK 6 境界の声2種 実装・検証結果

## 実装

- `4759c7b73 game: add boundary voice state machine`
  - 食料残日数が14日以上から14日未満へ跨いだ時だけ声1を生成する。
  - 同じ食料境界の再発話は7日以上空け、待機中の声・跨ぎ基準・最終発話日を通常セーブで往復する。
  - 魚在庫がある時の塩または木炭の正量から0への跨ぎを別々に検出し、声2を生成する。
- `5036db4ac game: integrate boundary voices into Elena guidance`
  - buildを`v004.42.0-boundary-voices`へ更新した。
  - engine snapshotの観測だけで境界を検出し、経済挙動と`market_network`は変更していない。
  - 声1・声2をエレナの一言へ優先配信し、書状へは載せず、既存の読了時間後に自動既読とする。
  - 境界状態を通常セーブへ含め、旧セーブでは現在値を基準に初期化して過去の境界を誤報しない。

声1の文面は「状況、残量、原因、間に合う手」の順にした。3〜6月だけ「畑や漁師を建てれば間に合います」とし、7〜2月は建設を提案せず「会社の倉庫から食料を出すか、本土から輸入してください」とする。12〜2月は原因も「冬で畑の生産が止まっています」とする。

声2は次の固定文面で、塩と木炭を別々に知らせる。

- 塩: 「塩がなくなりました。魚を保存食にできず、獲れた魚は3日で腐ります。」
- 木炭: 「木炭がなくなりました。魚を燻製にできず、獲れた魚は3日で腐ります。」

## 季節処方のテスト固定

`tests/run.mjs`で春開始の実効暦12か月をすべて検査する。3・4・5・6月は建設処方だけ、7月から翌2月は蔵出し・本土輸入処方だけが現れ、相手側の語が混ざらないことを固定した。12・1・2月は冬の生産停止原因も検査する。

境界関連5件では、14日境界の跨ぎ、7日間隔、全12か月の処方、塩・木炭の別発火、魚なし時の抑止、セーブ往復、一言の器と自動既読対象を検査している。

## 実Chrome検証

2026-07-29、Google Chrome 150.0.7871.125本体をCDPポート9226、1440×900で操作し、作業ツリーを`http://127.0.0.1:8438/GPT/game/shioji/v004/`から読み込んだ。

実行:

```bash
SHIOJI_CDP=http://127.0.0.1:9226 \
SHIOJI_URL=http://127.0.0.1:8438/GPT/game/shioji/v004/ \
SHIOJI_BOUNDARY_SCREENSHOT_DIR=tests/artifacts \
node tests/browser_smoke.mjs --boundary-voices-only
```

結果:

```text
CHARTER ISLE v004 boundary voices smoke: PASS
```

実Chrome内で次を再現・確認した。

- 声1: 食料150荷・人口10人から139荷へ下げ、14日分以上から13日分への跨ぎで一度だけ発火した。春・3月の処方は「畑や漁師を建てれば間に合います」となった。
- 声2（塩）: 魚4荷がある状態で塩2荷から0荷へ跨がせ、保存食不能と3日腐敗の一言を発火した。
- 声2（木炭）: 魚4荷がある状態で木炭2荷から0荷へ跨がせ、燻製不能と3日腐敗の一言を発火した。
- 3件とも書状ボタンを表示せず、書状modalを開かず、一言の読了時間後に待機列から自動で消えた。
- runtime errorは0件だった。
- 表示アニメーション完了と不透明度1を待ってから画像を保存し、3枚を原寸で目視して文面の欠け・重なりがないことを確認した。

証拠画像:

- `GPT/game/shioji/v004/tests/artifacts/boundary_voice_food_spring.png`（1440×900、SHA-256 `82388b749a70a01aa2e2b044fc8c35ad768726dc5a298c1692a28a20f8fd5adb`）
- `GPT/game/shioji/v004/tests/artifacts/boundary_voice_salt.png`（1440×900、SHA-256 `17d828620eb1274afe876b51e098f6d381d682ab99ef8f6daf8e805c0d41e29f`）
- `GPT/game/shioji/v004/tests/artifacts/boundary_voice_charcoal.png`（1440×900、SHA-256 `90d10905bcdeeadc3d0bda675c6f991bf3f7977032fc196ced9010b9cf31b748`）

## テスト

- `node tests/run.mjs --match '境界の声'`: PASS（5件）
- `node tests/browser_smoke.mjs --boundary-voices-only`: PASS（実Chrome、声1・塩・木炭、自動既読、runtime error 0）
- `node tests/acceptance.mjs`: PASS（全章受け入れ、UI全8操作150日後とjournal再生が完全一致）
- `npm run test:focused -- '表示snapshot'`（engine）: PASS（1件）
- `node tests/run.mjs`: PASS（全111件、366.81秒）
- `node tests/food_delivery_save.mjs`: 既知不整合「運搬枠をまず食料に使う」で停止（期待6荷、現行実測3荷）。TASK 5時点と同じ先頭不整合で、TASK 6が変更していないengineの購入・運搬挙動に属する。

開始時から存在した`Claude/memory_backup/mir/.backup_info`と`memory_backup/mir/.backup_info`の差分は、本タスクのコミットへ含めない。
