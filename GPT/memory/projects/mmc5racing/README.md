# MMC5Racing 開発場所と作業入口

2026年10月14日の現行版は[GRIPの惰性・ブレーキ調整](20261014_grip_tuning.md)。[全ブランチのmain統合](20261014_main_integration.md) `422ac2d` も開発本体へ合流し、`b1072df` をorigin/mainへpush済み。GRIPを上段・初期選択とし、GRIPだけアクセルOFFを緩やかに、Bで前輪荷重を強めた。開発本体 `D:\HomeBrew\MMC5Racing` は同期済み・cleanで、通常の `play.cmd` から起動する。

このPCでは `D:\HomeBrew\MMC5Racing` を開発場所として使う。リポジトリは <https://github.com/Nao838861/MMC5Racing>、作業ブランチは `main`。ソースとビルド成果物は同リポジトリ、Codex側の作業記憶はこのディレクトリへ保存する。外部プロジェクト内に別の記憶システムやAGENTS.mdを増やさない。

## ユーザーの指定

現行GRIP調整は[惰性とブレーキの記録](20261014_grip_tuning.md)。CPU車・高速化・前後2×2 HUD・千鳥配置・モード別タイム・車色・最新フォントを保持する。通常の `D:\HomeBrew\MMC5Racing\play.cmd` は毎回再ビルドする。[最新CPU車・HUDとの初回統合](20261014_latest_integration.md)と[初回モード設計](20261014_modes_design.md)は経緯の記録。旧 `735ce36` は古いmainへのモード追加だけだったため、最新とは扱わない。

2026年10月13日の依頼原文:

> [https://github.com/Nao838861/MMC5Racing](https://github.com/Nao838861/MMC5Racing) を D:\HomeBrew に落としてきて、これをこのPCの開発場所にして。

IDEに残っていた `D:\HomeBrew\MonoSHFX2_4bpp30_20261008\play_4bpp30.cmd` は別プロジェクト。MMC5Racingの作業ではこちらの開発場所を使う。

## ビルドと起動

```powershell
cd D:\HomeBrew\MMC5Racing
.\build.cmd
.\play.cmd
```

`build.cmd` → `build_release.py` がCPU車・最新HUD・高速化一式を含むリリースROMを `build\direct\direct-axle-shared.nes` に生成する。Pythonは `C:\Users\owner\AppData\Local\Programs\Python\Python310\python.exe`、ca65 / ld65 は `D:\HomeBrew\CC65\bin`（V2.19）。`CC65_BIN` で変更可能。

`play.cmd` は毎回再ビルドして `D:\HomeBrew\FCEUX\fceux64.exe` で開く。`FCEUX_EXE` で変更可能。`play_hud.cmd` も同じ最新版をMesenで開く。隔離したMesenで両モードの通常走行・負荷試験・5周ライフサイクルを検証済み。人間の体感評価は未実施。

現行の正式ビルド入口は `build_release.py`。`build_direct.py` は個別フラグの比較・開発用で、引数なしではCPU車を含まない。`build.py` と `build_race.py` は基準版・中間生成に使う。Windowsでも、子Pythonの起動に実行中の `sys.executable` を使う。

## 初期セットアップの検証

セットアップcommit: `97f5fdc`。MMC5Racingの `origin/main` へpush済み、終了時はcleanかつahead/behindなし。

Windowsで `build.cmd` を実行し、リリースROMのSHA256が既存リリースと一致した。

```text
e823b1980f83245e5b19c336894fb043487fae615324a24b3d245147fd74b204
```

`CC65_BIN` を設定して `python package_source.py` を実行し、ZIPを新規ディレクトリへ展開して基準版・比較版・リリース版を再ビルド。3種類すべて既存のSHA256と一致した。結果は開発リポジトリの `build/portable-verification.json` と `build/windows-package-check.log`（git対象外）。

最初のチェックアウトではWindowsの自動CRLF化により、ハッシュ検証対象の `ui/font-patches.json` が不一致になった。入力テキストをLFへ戻し、`.gitattributes` でLFを固定して解消した。390ファイルの改行を戻したが、commitに含まれる意味のある差分は7ファイルのみ。固定アセットやゲームの動作は変更していない。

最初のZIP展開先での検証は、Pythonプロセスの異常終了と、同展開先での再実行時のpy65内部TypeErrorで失敗した。原因は未確定。新しい展開先で検証全体を再実行すると3種類とも成功した。この一時的な失敗を、ソースの不具合が修正された証拠や全環境での安定性保証として扱わない。

## 右側表示の改善（別ブランチでの開発履歴）

以下は合流前の履歴。現行はmainの `92e672c` にCPU車と最新HUDを統合済みで、通常の `D:\HomeBrew\MMC5Racing\play.cmd` から起動する。詳細と現行ハッシュは[最新統合の記録](20261014_latest_integration.md)を使う。

同日の後続修正で、敵車2台の横並びをやめ、3台を約24/48/72px前の千鳥配置にした。`codex/hud-axle-load` の `33c259d` をpush済みで、上記作業ツリーの `play_hud.cmd` はこのROMを開く。[開始配置のフィードバックと検証](design_log.md)を参照。HUDのOAM契約は変えていない。

2026年10月14日の最新HUDは[前後2×2への配置変更](20261014_hud_axle_layout.md)。ユーザーの訂正に従い、前輪2つ・後輪2つを同じ高さに整列し、荷重の円を低優先へ移動、限界超過時は円を赤くした。`D:\HomeBrew\MMC5Racing_hud_horizontal\play_hud.cmd` で確認できる。`codex/hud-axle-load` の `0f44fff` をpush済み。合流時のCPU OAMは40〜45、円は56〜63。旋回の負荷検査でフレーム保持が変更前5回から6回へ増えた制約も上記記録に残した。以下の10月13日の記述は初期版の履歴。

操作の実装済み変更は [操作調整の記録](design_log.md) を参照する。2026年10月13日の後続調整 `47e76f1` では、B保持＋A解放で減速と横滑り収束、両方解放で軽いエンジンブレーキと通常グリップ、B解放＋A保持で通常グリップへ戻して駆動を継続する。左右なしのA OFF＋Bは通常ブレーキ。現在の `build.cmd` / `play.cmd` はこの操作版を使う。上の初期セットアップSHA256は変更前の記録であり、現在のROMの照合値は開発側READMEと操作調整の記録を使う。

[時間表示と摩擦円の配置](20261013_hud_layout.md)と[実装・合流記録](20261013_hud_implementation.md)を参照する。現在周回・その周の時間・合計時間へ絞り、4輪摩擦円を復帰した。`77df5af` 基点の別作業ツリー `D:\HomeBrew\MMC5Racing_hud`、ブランチ `codex/hud-friction-circle` に実装し、本体 `bee2fc8` と点の優先順修正 `7df40f7` をpush済み。CPU車側との合流はまだ行っていない。

リリースは車軸内で接地点速度と符号付きスリップを共有する4輪モデルだが、4輪それぞれの荷重・力・摩擦円制限・飽和処理を残している。旧HUDは容量（摩擦係数×垂直荷重）で円を選び、制限前の要求力で点を動かしていた。これを復元し、点だけ視認性と走査線制約のため2×2pxへ統一した。

ソースの確認入口は `ui/race-ui.s`、`direct-runtime/build_hud.py`、`race-src/runtime.s`、`race-src/circle-fixed.s`、`physics/energy-source/physics-grip-circle.inc`。ビルド時に `ui/race-ui.s` が `race-src/race-ui.s` へコピーされるため、生成先だけを編集しない。フレーム予算とIRQ/NMIの制約は `FRAME_CONTRACT.md` を参照する。
