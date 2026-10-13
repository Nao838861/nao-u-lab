# 2026-10-14 開発最新版の取得とROM表示

ユーザー指示原文：

> 最新を取得してROMを見せて

`D:\HomeBrew\MMC5Racing` のmainをfetchし、差分なしの状態から `9e81ae8` へfast-forwardした。Gitの認証ヘルパーが最初のfetchで一時的に失敗したが、同じfetchの再実行で成功した。

HUD・CPU3台・直前に公開された物理最適化を含む開発最新版は `integration/persistent-rivals-60fps-20261013` の `0b4c7d6ce606dc47b3a02ca289b97a35534641fa`。mainより新しいこの統合版を開く方針をチャットで明示した。mainを別ブランチへ切り替えず、detached worktree `D:\HomeBrew\MMC5Racing_latest` に取得した。

`verification/persistent/results/rival-clock-summary.json` のcommandから全引数を読み、Python 3.10 / `D:\HomeBrew\CC65\bin` で再ビルド。単に `build.cmd` を実行するとCPU3台入りのこの候補にならないため、記録された全フラグを使う。

```powershell
cd D:\HomeBrew\MMC5Racing_latest
$env:CC65_BIN='D:\HomeBrew\CC65\bin'
$env:PYTHONUTF8='1'
$mmc5Build=(Get-Content -Raw verification\persistent\results\rival-clock-summary.json | ConvertFrom-Json).command
$mmc5Args=$mmc5Build.Split(' ') | Select-Object -Skip 2
python build_direct.py @mmc5Args
```

ROM：`D:\HomeBrew\MMC5Racing_latest\build\persistent-rival-clock\direct-rival-game3.nes`

SHA256：`585acb88fe875b08133c0731e7689f1b8461a1a02baa848d7ceba3e15b9159de`

公開済み `clock-identity.json` のROMハッシュと完全一致。`D:\HomeBrew\Mesen\Mesen.exe`（2.1.1）でユーザー向けに可視起動し、ウィンドウ名 `Mesen - direct-rival-game3` を確認した。

今回追加したのは取得・再現ビルド・ハッシュ照合・起動確認。性能の再検証は行っていない。既存検証ではnatural/dense/FULLの更新待ち0、turnsの1091レースフレームで5回残る開発候補。安定60fpsの完成版として扱わない。

ゲームのソース編集・新規commit・mainへの統合は行っていない。最新作業ツリーにはビルドで自動生成された `race-src/direct-abi.inc` の差分が残る。main側はcleanかつorigin/mainと一致。通常の `play.cmd` は既定の別ROMを開くため、この候補を見せるときは上記ROMの絶対パスをMesenへ渡す。
