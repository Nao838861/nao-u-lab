# 全ブランチのmain統合

依頼原文:

> 色んなブランチの修正をmainに反映して。

## 完了した反映

`Nao838861/MMC5Racing` のmainへ `422ac2ddf142a811f2b6a868d5c21386199963cc` をpushした。対象の全6ブランチ先端がmainの祖先であることを確認。

- HUD・千鳥配置: `codex/hud-axle-load` / `33c259d`
- 旧HUD履歴: `codex/hud-friction-circle` / `7df40f7`
- CPU3台・性能改善・フォント・ランダム検証: `integration/persistent-rivals-60fps-20261013` / `dec8a22`
- 物理診断: `diagnostics/physics-study-20261013` / `e55d3ad`
- 転送・引継ぎ: `diagnostics/dot-git-write-20261013` / `bdb34e6`
- 別マッパー実験: `feature/nes-gsu-lab-20261013` / `85bddea`

旧HUDは現在の2×2表示に置換済みなので、現在のツリーを維持して旧履歴を合流。物理の非等価な実験やGSUは資料・別プロトタイプとして保持し、通常のMMC5レースへ適用しない。

## 作業場所と並行作業

開始時の `D:\HomeBrew\MMC5Racing` には別スレッドの未完了の統合作業があった。調査中に同スレッドが `92e672c`（CPU・HUD・モード統合）をmainへpushしたため、それを基点に `D:\HomeBrew\MMC5Racing_main_integration` / `codex/integrate-branches-20261014` へ分離して続行した。この作業ツリーは終了時clean、origin/mainと同じcommit。

開発本体には、その後のGRIP調整・初期選択・タイトル表示等の未コミット変更が進行している。mainへのpush後に本体のfast-forwardを試したが、README・build_direct.py・package_source.py・native.luaの未コミット変更との重複でGitが拒否した。stash・上書き・resetは行わず保全した。本体のローカルmainはまだ `92e672c`。**並行する調整が確定してから、新mainとの同期が必要**。本体で今ビルドすると、この未コミット調整も含むので以下の検証済みROMと同一とは限らない。

## ROMと競合解消

検証済みROMは `D:\HomeBrew\MMC5Racing_main_integration\build\direct\direct-axle-shared.nes` または同作業ツリーの `releases\MMC5_Race5_DirectUpload_AxleShared.nes`。

SHA256: `db733dddf8eb6eece1acbbdf364aead7977a39c92059555b1f3550548d0884ac`。

通常入口はmainの `build_release.py` / `build.cmd` を維持。旧checkpoint専用の入口へ戻さない。フォントAPIはmainのmodes/readable/compactとcheckpoint側のpersistentを両立。`92e672c` の全PRGは不変で、「/5」の字形10バイトだけ改善。モード別タイム・共有リプレイ破棄・車色・OAM40〜45のCPU車・56〜63の円・24/48/72pxの千鳥配置を維持する。

## 検証

DRIFT/GRIPの通常各1900フレーム、DRIFT dense/turns/fullとGRIP turns各1500フレーム、DRIFTランダム入力seed838861・GRIPランダム視点seed27各2400フレーム。8条件全てフレーム保持0・転送拒否0。DRIFT turnsの最大main時間18303 cyclesで、92e672cの検査と一致。

実6502のモード物理・独立タイム保存・ゴースト切替、フォントのPRG不変・非フォントCHR不変・128方向コース参照も確認。ソースZIP60,175,733Bを新規展開し、凍結基準版と通常版のSHA一致。実機は未検証で、有限の入力・状態注入検査。5周ライフサイクルは92e672cの既存証拠を保持し、今回その長時間試験は再実行していない。

開発側の詳細は `verification/branch-integration-20261014/README.md`、通常版のmanifestは `releases/main-release.json`。`releases/MMC5Racing_Rivals3_60fps_Checked.nes` はdec8a22の古いcheckpointとして残した別ROMであり、現在の通常版と混同しない。
