# FxRacing 敵車対応版をPCで動かす

`Nao838861/MMC5Racing` の固定コミット `a8d2a2d01fefc39665f01d22b80c80207ce088f7` で公開された、敵車対応・時間停止修正版ROMを、専用Mesen 2.1.1で実行する。旧GSU_MMC5Racing3D v005とは起動入口もROM形式も異なる。

## 起動

このPCでは `D:\HomeBrew\FxRacing\play_latest.cmd` を実行する。実体は本ディレクトリの `run_fx_racing_pc.cmd`。タイトルで右Shiftがモード変更、Enterが開始、Zがアクセル、Xがブレーキ、左右矢印が操舵。

ROMは `D:\HomeBrew\FxRacing\releases\FX_Racing_3D_20261025\FX_RACING_3D.nes`。ランチャーはSHA256 `b893f680e22fbd38b5aa47516bc7aef3564fb8e292b0403ab38aa33cba3b74dc` を照合する。配布ROMのバイト変更や測定パッチは行わない。RBFはPCでは使用しない。

## ビルドと検証

既存の固定Mesenソース、Visual Studio 2022、Mesen 2.1.1 UIを使う。依存導入は元のREADMEを参照する。

```powershell
python tools/build.py --fx-racing-pc
python tools/launch_fx_racing_pc.py --check-only --install-launcher
cmake -S . -B build
cmake --build build --config Release --target nesfx_racing_pc_contract
ctest --test-dir build -C Release -R racing_pc_contract --output-on-failure
python tools/verify_fx_racing_pc.py --mode 0
python tools/verify_fx_racing_pc.py --mode 1
```

`runtime_fx_racing_pc/` に専用DLLとUI・設定を配置する。標準Mesen、旧 `runtime_mode7`、2DのMMC5Racingは変更しない。UI起動時は既存の `core_lock` で標準DLLによる展開上書きを防ぐ。

実装は `src/NesFxRacingPc.h` と `src/FxRacingBoard.hpp`。公開RTLのバンク切替・GSU窓・単一描画RAMの別名参照・完成画像の保持・地面テクスチャ・タイトル用フォント・下部HUDの読出しを機能モデルとして追加した。既存のCPUとGSU命令実行器を使用する。ゲーム状態の強制注入や敵車の別実装は行っていない。

## 確認したこと

2026年10月26日、GRIP／DRIFTのそれぞれで、コールドブートから実際のパッド入力でタイトル開始、4500フレーム実行、ゲーム内時計3689tick（約61秒）、表示世代1934、敵車状態の変化、GSU／DSPエラーなしを確認した。レース中はアクセルを押さない条件。RAMの別名参照、CPUアップロード、表示外の穴、非同期範囲フィル、作業RAM保持の単体試験も通過した。

結果と画面は [results/fx_racing_pc_20261026](results/fx_racing_pc_20261026/)。通常UIでも新版タイトルを確認した。

## 機能モデルの範囲

実機のPSRAMコピーとバス調停は完了画像のコピーへ簡略化し、地面DSPは既存の暫定時間モデルを使う。EverDriveの起動時存在確認はレジスター応答で満たす。USBメニュー・実機の5秒無進行監視・外部停止は再現しない。拡張音源は追加していない。

このPCで遊ぶための実装であり、FPGAのサイクル一致・実機のフレームレート・長期安定性・自然入力での5周完走・全画面の画素一致を検証したものではない。
