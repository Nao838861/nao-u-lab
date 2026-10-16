EverDrive N8 Pro：GSU診断・初期ワイヤーフレーム立方体
2026-10-17

SDへコピーするもの
  sdcard/GSU-SELFTEST フォルダー
  sdcard/GSU-CUBE フォルダー
各フォルダーのROMとgsu.rbfはセットです。両方のRBFは同じ内容です。
PC用のcmdやMesenはSDへコピーする必要はありません。

動かし方
1. N8 ProのOSは2.15以降を使用します。
2. 本体の電源を切り、上の2フォルダーをSDへコピーします。
3. N8 Proを起動し、GSU-SELFTEST/gsu-selftest.nesを選び、Start Game。
4. 緑背景の「GSU SELF TEST」と「0」が成功です。
   読み込み後に始まらなければ、本体RESETを押してください。
5. 電源を切って入れ直し、GSU-CUBE/GSU_Cube_v001.nesを起動します。
6. 自動で回転する白・水色・青の線画立方体が表示される想定です。
   ボタン操作はありません。粗い4倍拡大表示と遅い更新は初期版の仕様です。

この独自回路にはEverDriveのゲーム内メニュー復帰・セーブステートを実装していません。
メニューへ戻るときは電源を入れ直してください。
同じフォルダーに通常のゲームROMや別のRBFを混ぜないでください。
旧EverDrive N8用ではありません。

診断の赤画面に出る数字
1: GSU回路のID/ABIを検出できない（RBFの読み込みを確認）
2: GSUバージョンが一致しない
3: GSUの終了待ちがタイムアウト
4: 演算またはRAMの結果不一致
5: PLOT描画結果の不一致
立方体が赤画面で止まる場合も、まず診断ROMの結果を確認してください。

確認済みの範囲
- Quartus Prime Lite 24.1によるEP4CE6F17C8への合成・配置配線・RBF生成成功。
- 3,036/6,272 LE（48%）、RAM 69,632/276,480 bit（25%）。
- 内部クロックのsetup最小余裕6.851ns、hold最小余裕0.184ns。
- RTLシミュレーションでGSU診断と6502診断ROMの成功/失敗経路を確認。
- 立方体のGSUコード64姿勢、512頂点、133,120バイトのRAM/座標が参照値と一致。

未確認の範囲
- 実物のN8 Pro・ファミコンでの起動と画面表示。
- 外部CPU/PPU/PSRAMバスのタイミング。外部I/Oには未設定の遅延制約が残っています。
この配布物は実機試験用であり、実機動作確認済みという意味ではありません。
面塗り立方体、3Dレースv001〜v005、Mode7はこのRBFでは動きません。

試した結果は、本体型番・N8 ProのOS版・電源投入/RESET後の表示・診断番号を記録してください。

出自・検証資料
manifest.json: ROM/RBFのSHA256とソースcommit
verification/: 合成、タイミング、RTL検証の記録
source.zip: GSU回路・ビルドツール・立方体ソース・ライセンス
回路: https://github.com/Nao838861/MMC5Racing
立方体: https://github.com/Nao838861/nao-u-lab （GPT/projects/nes_superfx）
GSUコア: MiSTer SNES、GPLv3。source.zip内のライセンスと出自を参照。
