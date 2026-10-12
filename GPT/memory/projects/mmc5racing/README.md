# MMC5Racing 開発場所と作業入口

このPCでは `D:\HomeBrew\MMC5Racing` を開発場所として使う。リポジトリは <https://github.com/Nao838861/MMC5Racing>、作業ブランチは `main`。ソースとビルド成果物は同リポジトリ、Codex側の作業記憶はこのディレクトリへ保存する。外部プロジェクト内に別の記憶システムやAGENTS.mdを増やさない。

## ユーザーの指定

2026年10月13日の依頼原文:

> [https://github.com/Nao838861/MMC5Racing](https://github.com/Nao838861/MMC5Racing) を D:\HomeBrew に落としてきて、これをこのPCの開発場所にして。

IDEに残っていた `D:\HomeBrew\MonoSHFX2_4bpp30_20261008\play_4bpp30.cmd` は別プロジェクト。MMC5Racingの作業ではこちらの開発場所を使う。

## ビルドと起動

```powershell
cd D:\HomeBrew\MMC5Racing
.\build.cmd
.\play.cmd
```

`build.cmd` は車軸内共有モデルのリリースROMを `build\direct\direct-axle-shared.nes` に生成する。Pythonは `C:\Users\owner\AppData\Local\Programs\Python\Python310\python.exe`、ca65 / ld65 は `D:\HomeBrew\CC65\bin`（V2.19）。`CC65_BIN` で変更可能。

`play.cmd` は `D:\HomeBrew\FCEUX\fceux64.exe` を使う。`FCEUX_EXE` で変更可能。ROMがなければ先にビルドする。今回エミュレーターの起動・実プレイは実施していない。

READMEにある現行の正式ビルド入口は `build_direct.py`。`build.py` と `build_race.py` は基準版・中間生成に使う。Windowsでも、子Pythonの起動に実行中の `sys.executable` を使うように修正済み。

## 初期セットアップの検証

セットアップcommit: `97f5fdc`。MMC5Racingの `origin/main` へpush済み、終了時はcleanかつahead/behindなし。

Windowsで `build.cmd` を実行し、リリースROMのSHA256が既存リリースと一致した。

```text
e823b1980f83245e5b19c336894fb043487fae615324a24b3d245147fd74b204
```

`CC65_BIN` を設定して `python package_source.py` を実行し、ZIPを新規ディレクトリへ展開して基準版・比較版・リリース版を再ビルド。3種類すべて既存のSHA256と一致した。結果は開発リポジトリの `build/portable-verification.json` と `build/windows-package-check.log`（git対象外）。

最初のチェックアウトではWindowsの自動CRLF化により、ハッシュ検証対象の `ui/font-patches.json` が不一致になった。入力テキストをLFへ戻し、`.gitattributes` でLFを固定して解消した。390ファイルの改行を戻したが、commitに含まれる意味のある差分は7ファイルのみ。固定アセットやゲームの動作は変更していない。

最初のZIP展開先での検証は、Pythonプロセスの異常終了と、同展開先での再実行時のpy65内部TypeErrorで失敗した。原因は未確定。新しい展開先で検証全体を再実行すると3種類とも成功した。この一時的な失敗を、ソースの不具合が修正された証拠や全環境での安定性保証として扱わない。

## 右側表示の改善

操作の実装済み変更は [操作調整の記録](design_log.md) を参照する。2026年10月13日、アクセルOFF＋B＋左右で弱いブレーキ、アクセルOFF＋B＋左右なしで通常ブレーキを追加した。現在の `build.cmd` / `play.cmd` はこの操作版を使う。上の初期セットアップSHA256は変更前の記録であり、現在のROMの照合値は開発側READMEと操作調整の記録を使う。

[時間表示と摩擦円の配置](20261013_hud_layout.md)と[実装・合流記録](20261013_hud_implementation.md)を参照する。現在周回・その周の時間・合計時間へ絞り、4輪摩擦円を復帰した。`77df5af` 基点の別作業ツリー `D:\HomeBrew\MMC5Racing_hud`、ブランチ `codex/hud-friction-circle` に実装し、`bee2fc8` をpush済み。CPU車側との合流はまだ行っていない。

リリースは車軸内で接地点速度と符号付きスリップを共有する4輪モデルだが、4輪それぞれの荷重・力・摩擦円制限・飽和処理を残している。旧HUDは容量（摩擦係数×垂直荷重）で円を選び、制限前の要求力で点を動かしていた。これを復元し、点だけ視認性と走査線制約のため2×2pxへ統一した。

ソースの確認入口は `ui/race-ui.s`、`direct-runtime/build_hud.py`、`race-src/runtime.s`、`race-src/circle-fixed.s`、`physics/energy-source/physics-grip-circle.inc`。ビルド時に `ui/race-ui.s` が `race-src/race-ui.s` へコピーされるため、生成先だけを編集しない。フレーム予算とIRQ/NMIの制約は `FRAME_CONTRACT.md` を参照する。
