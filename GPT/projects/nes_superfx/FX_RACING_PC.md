# FxRacing 敵車対応版をPCで動かす

`Nao838861/MMC5Racing` の固定コミット `a8d2a2d01fefc39665f01d22b80c80207ce088f7` で公開された敵車対応・時間停止修正版を基に、Selectの4視点切替を復旧したROMを専用Mesen 2.1.1で実行する。旧GSU_MMC5Racing3D v005とは起動入口もROM形式も異なる。

## 起動

このPCでは `D:\HomeBrew\FxRacing\play_latest.cmd` を実行する。実体は本ディレクトリの `run_fx_racing_pc.cmd`。タイトルで右Shiftがモード変更、Enterが開始、Zがアクセル、Xがブレーキ、左右矢印が操舵。

レース中は右Shift（Select）で、高い追従 → 俯瞰 → 車載 → 近い追従の4視点を循環する。長押しは1回だけ変更する。公開版では入力処理が希望視点の更新を飛ばしていたため、その分岐を復旧した。[原因、差分、検証](demos/racing/select_fix_20261026/design_log.md)。

通常のROMは `releases/FX_RACING_3D_CameraFraming_20261026.nes`、SHA256 `053090050fc0a5554740219ef5ffdbe4e234cff413bebd65ecfeda1ec0e64da4`。視点②を低い近接追従で少し下寄り、④を2D版と同程度の縮尺の真上視点で大きく下寄りに調整した。①と③は維持する。[調整値・比較検証](demos/racing/select_fix_20261026/design_log.md)。RBFはPCでは使用しない。前回のCameraTune版も比較用に保持する。

Select接続のみを修正した `releases/FX_RACING_3D_SelectViewFix_20261026.nes` と、元の `D:\HomeBrew\FxRacing\releases\FX_Racing_3D_20261025\FX_RACING_3D.nes` も保持し、明示指定で比較起動できる。

## ビルドと検証

既存の固定Mesenソース、Visual Studio 2022、Mesen 2.1.1 UIを使う。依存導入は元のREADMEを参照する。

```powershell
python tools/build.py --fx-racing-pc
python tools/build_fx_racing_select_fix.py
python tools/build_fx_racing_camera_tune.py
python tools/build_fx_racing_camera_framing.py
python tools/launch_fx_racing_pc.py --check-only --install-launcher
cmake -S . -B build
cmake --build build --config Release --target nesfx_racing_pc_contract
ctest --test-dir build -C Release -R racing_pc_contract --output-on-failure
python tools/verify_fx_racing_pc.py --mode 0
python tools/verify_fx_racing_pc.py --mode 1
python tools/verify_fx_racing_camera_fix.py
python tools/verify_fx_racing_camera_tune.py
python tools/verify_fx_racing_camera_framing.py
```

`runtime_fx_racing_pc/` に専用DLLとUI・設定を配置する。標準Mesen、旧 `runtime_mode7`、2DのMMC5Racingは変更しない。UI起動時は既存の `core_lock` で標準DLLによる展開上書きを防ぐ。

実装は `src/NesFxRacingPc.h` と `src/FxRacingBoard.hpp`。公開RTLのバンク切替・GSU窓・単一描画RAMの別名参照・完成画像の保持・地面テクスチャ・タイトル用フォント・下部HUDの読出しを機能モデルとして追加した。既存のCPUとGSU命令実行器を使用する。ゲーム状態の強制注入や敵車の別実装は行っていない。

## 確認したこと

2026年10月26日、GRIP／DRIFTのそれぞれで、コールドブートから実際のパッド入力でタイトル開始、4500フレーム実行、ゲーム内時計3689tick（約61秒）、表示世代1934、敵車状態の変化、GSU／DSPエラーなしを確認した。レース中はアクセルを押さない条件。RAMの別名参照、CPUアップロード、表示外の穴、非同期範囲フィル、作業RAM保持の単体試験も通過した。

結果と画面は [results/fx_racing_pc_20261026](results/fx_racing_pc_20261026/)。通常UIでも新版タイトルを確認した。

Select復旧版では、両モードの4視点循環、長押し時の単一切替、タイトルのモード選択、修正前後1667回のゲーム状態一致、実PPUの4視点画像を確認した。結果は `results/fx_racing_select_fix_20261026/`。修正前の不具合を示す `select_camera_result.json` は履歴として保持する。

視点②・④の調整版は `results/fx_racing_camera_tune_20261026/`。両モードの1667回のゲーム状態一致、①・③のカメラ不変、4視点切替、GSU/DSPエラーなしを確認した。通常計算とNMI先読み計算の両方を更新し、符号付き係数と距離の14,364組で6502実行結果を照合した。

下寄りへの再調整版は `results/fx_racing_camera_framing_20261026/`。②は車体が約12px下がり、④は自車の地面位置がy96→約166（256×192表示領域）になる。両モードの1667回のゲーム状態一致と4視点切替を確認。通常・NMI先読みの両方について、正負の距離係数と角度係数の27,702組を6502で実行し、期待値と一致した。

## 機能モデルの範囲

実機のPSRAMコピーとバス調停は完了画像のコピーへ簡略化し、地面DSPは既存の暫定時間モデルを使う。EverDriveの起動時存在確認はレジスター応答で満たす。USBメニュー・実機の5秒無進行監視・外部停止は再現しない。拡張音源は追加していない。

このPCで遊ぶための実装であり、FPGAのサイクル一致・実機のフレームレート・長期安定性・自然入力での5周完走・全画面の画素一致を検証したものではない。
