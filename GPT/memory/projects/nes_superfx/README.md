# N8 Pro GSUマッパーのエミュレーター入口

2026年10月14日。ユーザーの「別スレッドのファミコン＋SuperFX2マッパーに先行してエミュレーターを用意する」依頼で作成。

- 実装・起動・再ビルド・限界：[projects/nes_superfx/README.md](../../../projects/nes_superfx/README.md)
- 起動：`D:\AI\Nao_u_BOT\GPT\projects\nes_superfx\run_gsu.cmd`
- 回路側正本：`C:\Users\owner\Downloads\MMC5Racing\development\superfx-lab\EMULATOR_HANDOFF.md`。参照commit `85bddea72743ca7b7b50b41e24b11c2df0416ea5`、ABI1。
- 最小目標は完了：mapper 0の無変更診断ROMを明示選択で動かし、緑背景・結果0。無効時は赤背景・結果1。演算／PLOTを壊した対照も検出。
- ABI1は8 KiB RAM、512byte cache、外部GSU ROM=00、固定CHR。ABI1にPPU直結を追加しない。後述のユーザー指示で提案ABI2を別選択名として実装。MMC5同居・正式mapper番号は未追加。
- Mesen 2.1.1からGSUを分離し、NES mapperへ接続した機能モデル。RTLとのサイクル一致、全命令互換、FPGA合成・実機性能は未検証。
- 標準Mesen UIは内蔵DLLを展開する。専用ランチャーのファイル共有ハンドルで上書きを防ぐ。直接 `runtime/Mesen.exe` を起動して専用DLLが戻ったら `tools/setup_runtime.py` で復元する。

FamiBASIC/MMC5向けの自作NESコア計画とは別。マッパー側リポジトリ・ゲーム・既存Mesenは変更していない。

## モデル表示テスト

同日の追加依頼で [回転する立方体](../../../projects/nes_superfx/demos/cube/v001/README.md) を実装。`run_cube.cmd` で起動する。GSUが8頂点を固定小数点行列で変換し、12辺をBresenham描画。固定CHRの2×2画素組合せで表示するため、ABI1と回路は変更していない。64姿勢の頂点・GSU全画素・PPU全RGBが一致。機能エミュレーターでは8 field更新。面塗り・隠面・透視・実機性能は未検証。

## 全画面ビットマップ・面塗り・個数計測

同日の「GSU RAMをPPU直接読出し」「フルシーンまで段階的に一気に完了」「白・水色・紫の面塗り１個30fps、縮小して個数計測」という指示を受け、[提案ABI2の実装と結果](../../../projects/nes_superfx/demos/bitmap/v001/README.md)を追加した。128×128→256×64→256×240を同じ座標変換経路で検証。40 KiB RAM（16 KiB×2画像＋8 KiB作業/コード）、native GSU OBJ配置、PPU nametable fetchの座標保持、STOP/flush後のVBlank交換。回路側の原本は変更していない。

起動は run_solid_cube.cmd、個数切替は run_cube_benchmark.cmd。追加依頼で１本のROMにまとめ、A（専用設定Zキー）で２→４→６→９→13→19→24→33→52→71個を順に変更する。辺長も各計測条件へ変更し、sprite HUDのN=/S=で表示する。固定条件を単独表示する場合は --edge 指定を使える。GSUが頂点変換・辺走査・span塗りを毎画像実行し、CPU画像転送は不要。64姿勢の全GSU画素と最終PPU RGB、および毎２NTSC fieldの提示・遅延0を検査する。配置上限と描画期限上限を区別し、期限上限は１個増やした失敗例も保存。詳細値は成果README/benchmark.jsonが正本。

回路側への入口は [ABI2_HANDOFF.md](../../../projects/nes_superfx/demos/bitmap/v001/ABI2_HANDOFF.md)。ABI2のRTL・40 KiBのFit・独立ポート/外部RAM帯域・実機性能は未確認。数値はMesen由来GSU時間モデルでの結果であり、FPGAの実測上限とは扱わない。
