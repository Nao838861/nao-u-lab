# N8 Pro GSUマッパーのエミュレーター入口

2026年10月14日。ユーザーの「別スレッドのファミコン＋SuperFX2マッパーに先行してエミュレーターを用意する」依頼で作成。

- 実装・起動・再ビルド・限界：[projects/nes_superfx/README.md](../../../projects/nes_superfx/README.md)
- 起動：`D:\AI\Nao_u_BOT\GPT\projects\nes_superfx\run_gsu.cmd`
- 回路側正本：`C:\Users\owner\Downloads\MMC5Racing\development\superfx-lab\EMULATOR_HANDOFF.md`。参照commit `85bddea72743ca7b7b50b41e24b11c2df0416ea5`、ABI1。
- 最小目標は完了：mapper 0の無変更診断ROMを明示選択で動かし、緑背景・結果0。無効時は赤背景・結果1。演算／PLOTを壊した対照も検出。
- 8 KiB RAM、512byte cache、外部GSU ROM=00、固定CHR。PPUへのGSU RAM直結・MMC5同居・正式mapper番号を勝手に追加しない。
- Mesen 2.1.1からGSUを分離し、NES mapperへ接続した機能モデル。RTLとのサイクル一致、全命令互換、FPGA合成・実機性能は未検証。
- 標準Mesen UIは内蔵DLLを展開する。専用ランチャーのファイル共有ハンドルで上書きを防ぐ。直接 `runtime/Mesen.exe` を起動して専用DLLが戻ったら `tools/setup_runtime.py` で復元する。

FamiBASIC/MMC5向けの自作NESコア計画とは別。マッパー側リポジトリ・ゲーム・既存Mesenは変更していない。
