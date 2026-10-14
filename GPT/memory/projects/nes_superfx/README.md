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

## 最新：専用クリアと最大個数 v002

ユーザーの「RAM範囲フィルの速度を最優先、矩形フィルは低優先」「フレームバッファクリアの回路を追加し、処理落ち直前まで増やす」依頼を実装。[結果・RTL・ABI拡張](../../../projects/nes_superfx/demos/polygon/v002/README.md)。起動は`projects/nes_superfx/run_polygon_benchmark.cmd`、ROMは`GSU_PolygonBenchmark_A_v002.nes`。**最初は25MHz相当**で、A/Zが25→12.5MHzの順に６シーンを変更する。

範囲フィルは40 KiB RAM内の開始・長さ・２バイトパターンを指定し、25MHzで１バイト/clock。16 KiBクリアは0.65536ms。GSUと重ねず、完了後にGSU開始、実ROMの期限判定には待ちも含む。25MHzの最大個数は大13→13、中16→17、小24→26、二十面体13→13、重なる二十面体16→17、画面端八面体23→25。全12条件の最大と次個数失敗を各64姿勢の画素・提示間隔で確認し、A切替12×64姿勢も確認。水平スパン専用回路は検討のみで未実装。

提案ABI2にcapability `$5FE7` bit0、範囲フィル窓`$5FE8..$5FEF`を追加。旧版とABI1を維持し、対応しないコアは新ROMが検出して停止する。合成可能な独立VHDL回路とGHDL試験、エミュレーターのcontract試験を追加。**N8 ProトップへのABI2接続・RAM調停・Quartus Fit・実機は未確認**。回路側の外部リポジトリは変更していない。

## モデル表示テスト

同日の追加依頼で [回転する立方体](../../../projects/nes_superfx/demos/cube/v001/README.md) を実装。`run_cube.cmd` で起動する。GSUが8頂点を固定小数点行列で変換し、12辺をBresenham描画。固定CHRの2×2画素組合せで表示するため、ABI1と回路は変更していない。64姿勢の頂点・GSU全画素・PPU全RGBが一致。機能エミュレーターでは8 field更新。面塗り・隠面・透視・実機性能は未検証。

## 全画面ビットマップ・面塗り・個数計測

同日の「GSU RAMをPPU直接読出し」「フルシーンまで段階的に一気に完了」「白・水色・紫の面塗り１個30fps、縮小して個数計測」という指示を受け、[提案ABI2の実装と結果](../../../projects/nes_superfx/demos/bitmap/v001/README.md)を追加した。128×128→256×64→256×240を同じ座標変換経路で検証。40 KiB RAM（16 KiB×2画像＋8 KiB作業/コード）、native GSU OBJ配置、PPU nametable fetchの座標保持、STOP/flush後のVBlank交換。回路側の原本は変更していない。

起動は run_solid_cube.cmd、個数切替は run_cube_benchmark.cmd。追加依頼で１本のROMにまとめ、A（専用設定Zキー）で２→４→６→９→13→19→24→33→52→71個を順に変更する。辺長も各計測条件へ変更し、sprite HUDのN=/S=で表示する。固定条件を単独表示する場合は --edge 指定を使える。GSUが頂点変換・辺走査・span塗りを毎画像実行し、CPU画像転送は不要。64姿勢の全GSU画素と最終PPU RGB、および毎２NTSC fieldの提示・遅延0を検査する。配置上限と描画期限上限を区別し、期限上限は１個増やした失敗例も保存。詳細値は成果README/benchmark.jsonが正本。

回路側への入口は [ABI2_HANDOFF.md](../../../projects/nes_superfx/demos/bitmap/v001/ABI2_HANDOFF.md)。ABI2のRTL・40 KiBのFit・独立ポート/外部RAM帯域・実機性能は未確認。数値はMesen由来GSU時間モデルでの結果であり、FPGAの実測上限とは扱わない。

表示用の最新版は均等配置v002。上側256×212へ行数と行内の個数を分配し、画面全体へ等間隔に並べる。下28画素はHUD用。run_cube_benchmark.cmdの既定をv002へ変更した。ユーザーがv001の動作を確認し「チェック不要なのでROMを出して」と指定したため、v002は座標変更とビルドのみ。性能測定の正本はv001の結果。

## ゲーム向けの三角形描画能力の測定

同日の「立方体に特化せず、ゲームで実用的なポリゴン数を知りたい」という依頼で、[汎用三角形版と計測](../../../projects/nes_superfx/demos/polygon/v001/README.md)を追加。起動は run_polygon_benchmark.cmd。A（Z）で６シーン×２設定を切り替える。HUDのNは物体数、Cは12.5/25MHz相当、INは裏面除去前の投入三角形数。最終描画三角形数は結果表が正本。

GSUで９係数の３軸変換・透視・裏面除去・物体全体と物体内の深度ソート・XY画面端処理・面塗りを実行する。物体ごとに位相をずらし奥行きも変化させる。大きい面は16.16 DDAの直接span、小さい投影三角形は16行の局所配列を使う辺走査を選択。画像コピーや事前span、消去省略、エミュレーター本体の高速化を使わない。

同じCLSR=0/MS0=0の比較版と最適化版、別設定のCLSR=1/MS0=1を６条件で計測。各64姿勢の全GSU画素・PPU RGB・２field周期、次の１個の失敗を検査。GSU20ms以内の候補も画素・頂点・カウンターを検査。旧条件の極小立方体は71→75個だが、これをゲームの三角形数へ換算しない。

同一meshの複数インスタンスによる描画予算の目安。完成ゲームのAI・物理・音楽・複数mesh転送は未計測。フラット塗り・painter方式でZ-buffer/テクスチャー/半透明/照明なし。near/farを跨ぐ三角形は拒否し、幾何クリップは未実装。実機性能やRTL一致とは扱わない。
