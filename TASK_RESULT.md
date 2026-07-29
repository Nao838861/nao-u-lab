# 品目詳細面 実装結果

## 開始時の引き継ぎ確認

- `codex/goods-detail`へ切り替えた直後の`ddec04e0a`（前タスクの旧セーブ互換性テスト補強）が直前コミットだった。
- 作業ツリーの`TASK_BRIEF.md`は前タスクのままだったため、正本`GPT/game/shioji/v004/EXAM_LOOP_DESIGN_20260729.md`の決定記録・第2巡5と識字の実装原則から品目詳細面のbriefを復元した。
- 開始時から存在した`Claude/memory_backup/mir/.backup_info`と`memory_backup/mir/.backup_info`の時刻差分は、今回のコミットへ含めず保全した。

## 実装

- buildを`v004.41.0-goods-detail`へ更新した。
- 需給カード全体を一つのボタンとして維持し、行のどこを押しても専用の品目詳細面へ開くようにした。カード内に押し分けボタンは置いていない。
- 詳細面へ次の5要素を実装した。
  1. 既存`goods_sprites.js`を使う大きな品目絵
  2. 性質一言。専用台本8品は出会いの一言を逐語で再掲し、残り10品も現行engineの用途・製法を平易な一文で示す
  3. 日持ちの絵。魚は3日、野菜は30日を「新鮮→傷み始め→傷んだ」の同じ絵の変化で示し、現行engineで腐敗しない品は品目絵と∞で示す
  4. 製法アイコン式。原料品＋作り手→製品を文章でなく共通品目絵の式にした。保存食の木炭は任意、銑鉄・鉄材の燃料は石炭／木炭の択一として現行挙動に合わせた
  5. 選択品の相場グラフ。現在相場と期間平均の2線を品目詳細内に表示する
- 統計から個別品目の相場グラフを撤去し、食料・人口・取引資金の既定3グラフだけに戻した。
- 「需給へ戻る」で元の品目行へ戻り、キーボードフォーカスもその行へ復帰する。
- PCは左右2段＋全幅グラフ、スマホは1列へ組み替え、横スクロールを発生させない。
- engineの経済挙動、セーブ形式、`market_network`は変更していない。

## 実Chrome検証

Google Chrome本体を隔離プロファイル、CDPポート9226、1440×900と390×844の端末エミュレーションで操作した。

- 実行:
  `SHIOJI_CDP=http://127.0.0.1:9226 SHIOJI_URL=http://localhost:8438/GPT/game/shioji/v004/ SHIOJI_GOODS_DETAIL_SCREENSHOT_DIR=tests/artifacts node tests/browser_smoke.mjs --goods-detail-only`
- 結果:
  `CHARTER ISLE v004 goods detail smoke: PASS {"pc":{"goods":"tools","elements":5,"pricePaths":2},"mobile":{"goods":"fish","elements":5,"pricePaths":2}}`
- PC: 木製品カードの中央を実マウスイベントで押し、5要素、出会い文の再掲、腐らない表示、丸太→木工房→木製品、相場2線を確認した。
- スマホ: 魚カードの中央を押し、5要素、3段階の日持ち絵、約3日、漁師→魚、相場2線を確認した。
- 両方で詳細面・ページの横overflowなし、runtime error 0、戻る後の元行フォーカスを確認した。
- 2枚を原寸で目視し、絵・文・式・グラフの欠け、見出しや閉じるボタンの重なり、建築欄との衝突がないことを確認した。
- 証拠画像:
  - `GPT/game/shioji/v004/tests/artifacts/goods_detail_pc_tools.png`（1440×900、SHA-256 `778f13766f5f16059877940c8b5bcb0e542c5d9badfdddf939cda4c9b9fabf92`）
  - `GPT/game/shioji/v004/tests/artifacts/goods_detail_mobile_fish.png`（780×1688、端末CSS幅390×844・device scale factor 2、SHA-256 `0f300b1457748c8ef2b899f36f083fb53cbf1b5eb02625c4ee8615dda11b75ac`）

## テスト

- `node tests/run.mjs --match '品目詳細|UI向上段9|UI O〜R|版番号'`: PASS（4件）
- `node tests/run.mjs`: PASS（全106件、325.72秒）
- `node tests/acceptance.mjs`: PASS（全章受け入れ、UI全8操作150日後とjournal再生が完全一致）
- `npm run test:focused -- '表示snapshot'`（engine）: PASS（1件）
- `node tests/browser_smoke.mjs --goods-detail-only`: PASS（PC・スマホ、各5要素・相場2線・戻る・横overflow・runtime error）
- `node tests/food_delivery_save.mjs`: 既知不整合「運搬枠をまず食料に使う」で停止（期待6荷、現行実測3荷）。前タスクと同じ先頭不整合で、今回変更していないengineの購入・運搬挙動に属する。

今回変更した表示層とv004全106件、受け入れ、関連engine snapshotはすべてgreenである。
