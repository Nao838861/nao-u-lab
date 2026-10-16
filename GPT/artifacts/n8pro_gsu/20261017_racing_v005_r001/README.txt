EverDrive N8 Pro：MMC5Racing 3D v005 実機試験版 r001
2026-10-17 / 実機動作は未確認

動かし方
1. 本体の電源を切ってから、sdcard/GSU-RACING-V005 フォルダーごとSDへコピー。
2. N8 Proメニューで
   GSU-RACING-V005/GSU_MMC5Racing3D_v005_N8Pro_r001.nes を選び Start Game。
3. 初期化に数秒かかります。5秒ほど待っても黒いままなら、本体RESETを一度押します。
4. メニューに戻るときは電源を入れ直します。RESETはメニュー復帰用ではありません。

ROMと同じフォルダーの gsu.rbf は必須です。立方体用RBFとは互換性がありません。
既存の GSU-CUBE / GSU-SELFTEST フォルダーはそのまま残してください。
PCの play_mmc5racing_3d.cmd はこれまでどおりPC版を起動します。

操作
A: アクセル、B: ブレーキ/ドリフト、左右: 操舵
SELECT: 視点切替、上: ポリゴン表示切替、下: GRIP/DRIFT、START: 走行リセット
車・木・家・地面・物理・音は最新v005のデータ/プログラムを維持。

今回の検証
- 最新GSUの4視点、論理描画RAM 65,536バイトが参照出力と一致。
- 地面DSP 34カメラ/6,528行が整数参照計算と一致。
- 地面/透明合成/属性パレット 196,608画素が一致。
  表示・スプライト取得と外部メモリ転送の同時動作も確認。
- 実6502初期化/NMIの282,122外部バス操作、最初のGSU描画、
  完成画像のPSRAM転送とフロント切替をトップRTLで確認。
- Quartus: LE 6,054 / 6,272 ( 97 % )、M9K 30 / 30 ( 100 % )。
  内部setup最小余裕 6.774ns、hold 0.139ns。

実機でこれから確認すること
実物での初回起動、画面・音、外部SRAM/PSRAM/PPUのタイミング、継続走行。
回路シミュレーションの合格は実機動作確認とは区別しています。
GSUは25MHzです。PC版50MHzと同じ速度や、実機30fpsの維持は保証していません。
外部I/Oの遅延制約は未完了。NTSC用で、PAL・セーブステート・ゲーム内メニューは未対応。

黒画面/画像化け/停止があれば、電源投入直後とRESET後の違い、
画面・音の有無、本体型番とN8 Pro OS版が切り分けに役立ちます。

manifest.json: ROM/RBFハッシュとソースrevision
verification/: 合成・タイミング・RTL検証記録
source.zip: 回路/ツール/ライセンス。回路はGPLv3。
回路ソース: https://github.com/Nao838861/MMC5Racing
ゲームソース: https://github.com/Nao838861/nao-u-lab （GPT/projects/nes_superfx）
