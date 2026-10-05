# ミサイル爆発の常時欠落を修正（2026-10-06）

依頼原文: 「常時ミサイル爆発がまったく出なくなっているように見えるので直して。」

前回の性能対策に不具合があった。24059行の`TICK_COUNT<>TICK_SEEN`が`WORKBANK 0`から、WORKBANK 4にある26628番地の時計を読んでいた。無関係なbank0の値との比較がほぼ常に不一致となり、通常負荷でもミサイル爆発の詳細描画枠を0にしていた。論理マーカーCHR194～199は透明なので当たり判定だけ残って絵が消える。

24059行を`IF SCAN_PHASE>=3 THEN MFLIMIT=0`へ修正。CPU RAM2018の走査線フェーズだけで遅い更新を判断する。WORKBANK 4にいる通常FX処理の8891行はそのまま。BASIC2048行を維持し、BANK7の余裕は5→9バイト。`frame_deadline` version 2、新規生成とversion 1保存版の移行の両方を修正した。既知の1行だけを変更し、対象行・CPU時計定義の独自編集は原本を部分更新せず拒否する。

同一SDKと保存済み素材を固定し、Mesenの全編で比較。HARD、道中7584更新、武器・レベル固定、無敵、左右移動・連射fixture。ボス撃破・音楽遷移・リザルト・再開、地形・背景画素・OAM・効果も照合。新しい検査では、通常負荷・画面中央の描画枠を検査し、詳細描画後のCPU OAMレコードがPPUの実OAMへ届くことを直接確認した。

| 固定素材の条件 | 通常負荷で描画枠0の判定 | 実PPUへの爆発転送 | 道中更新落ち | 平均/最大サイクル |
|---|---:|---:|---:|---|
| 修正前M2 | 3018 | 7 | 8 | 18392/33451 |
| 修正後M2 | 0 | 1560 | 11 | 19072/35392 |
| 修正後M1 | 0 | 1591 | 6 | 19089/30696 |

判定数は複数爆風について数えるのでフレーム数とは異なる。修正後の描画済みOAM未転送0、可視VRAM書込み0、ボス落ち0。Lv2の画面キャプチャで実際の爆発片も確認した。修正前は新検査が失敗し、旧検査が内部状態・コピーの整合だけを見ていたことを実証した。

前回の「M2の更新落ち88→8」は爆発欠落を含み、表示を保った改善として使えない。表示を戻すと負荷が増える。安定60fpsは引き続き未達。履歴メモと現行入口の記述を訂正した。

保存済み`D:\HomeBrew\FamiBASIC_Turbo_main\build\basic_only\game`は全ファイルを退避し、`src/main.bas`と`assets/project.json`だけを更新した。バックアップは`build/basic_only/edited_backups/before_frame_deadline_20261006_062500_662983`。原本SHA256 `cdbca4b39778ab5459f632d41eb4847f2d001296c13755e776636879d2056d66`、素材準備後 `6709809ced9a92c65613aeb5ab5f8996b44790b0c6effacedadac05e8f8f0a5a`。

検証中に別作業から爆発SEの長さ変更が入った。元の素材との同条件比較は残し、新しい音を保持して移行した保存版を別に凍結し、統合検査も成功した。M2の実PPUへの爆発転送1558回、不当な描画枠ゼロ・未転送0、道中更新落ち11・ボス0。

ただし別作業によるEASY曲・行整理の保存で旧判定も書き戻された。全ファイル指紋で検出し、この時点のROM配置は中止した。24058行に結合された旧判定にも対応する移行と回帰検査を追加し、別作業の編集を保って再移行。二回目のバックアップは`before_frame_deadline_20261006_062926_225955`、最終保存版2046行、原本SHA `43e6379d96c909b03a1715b2d15c7cf21c0124828d7ddab35afaa4e1ee160582`、素材準備後 `ed71b8da13513220409d56fe509badb5269295d674312d2e173f748ef385a79f`。実Saveは変更していない。修正コードは本流の別作業commit `33f1a0f`と合流し、`7884da4`へpush済み。

移行・入口15検査、容量整理9検査に成功。追加テストコマンドの対象名の誤記はモジュール読み込み時に判明し、実在する容量整理検査へ指定し直した。独立worktreeは`C:\Users\owner\AppData\Local\Temp\famibasic_missile_visible_20261006`、CSV・ROM・Lua・画面は`.tmp/`。本流の`docs/missile_visibility_20261006.md`と`docs/benchmarks/missile_visibility_20261006/comparison.json`が検証記録。

IDEを開き直してF5で更新済みの保存版を使用する。

再移行後の最終保存版M2も全編検証に成功。実PPUへの爆発転送1557回、不当な描画枠ゼロ・未転送0、道中更新落ち9・ボス0、平均19067・最大35392サイクル。検査開始からROM配置前まで保存版の全ファイルの指紋が一致。最終画面キャプチャでも爆発を確認した。

検証済みROMは`D:\HomeBrew\FamiBASIC_Turbo_main\build\missile_visible_20261006\game.nes`、SHA256 `0e57b3284342326480e82bc45c7249274f3e046113b845d3b8153622072e7a10`。Mesenで直接起動可能。前回案内した`build/weapon_perf_20261006/game.nes`も同じ修正版へ更新した。

修正commit `986cad6`、別作業との合流 `7884da4`、最終表示検証と訂正記録 `6c27c65`を本流mainへpush済み。主作業ツリーの無関係な変更は保持した。

## 最新ROMとエディタの起動（2026-10-06 08:36）

追加依頼: 「最新の修正を反映させたromとエディタ軌道を用意して。」

本流の現在のSDK（並行作業の未コミットのコンパイラ修正も含む）で`python -m tools.latest_flight_lab`を実行し、保存版を保ったままROMを再ビルドした。新しい入口は`D:\HomeBrew\FamiBASIC_Turbo_main\build\basic_only\game.nes`。ROM SHA256 `994194332c366819d59cc986b2cbcc6ec08df5ef14735254e82335227871291e`、SDK SHA256 `639f660f4290c4093d66110ad95c65b4de6cfdbac442d4022ad81f3f42272700`。BASICは直前の修正後2046行・`frame_deadline` version 2のまま、素材準備後ソースSHA `ed71b8da13513220409d56fe509badb5269295d674312d2e173f748ef385a79f`。

IDEと同じ自作コアをセーブ持込なしで起動し、333フレームでRUN、タイトルからゲーム開始後900フレーム・実行時エラー0を確認。これは起動と道中の短い確認であり、新SDKの全編再検証ではない。記録と画面は`build/latest_launch_20261006/{release.json,smoke.json,gameplay.png}`。

最新版入口の`--edit`で同じ保存版を新しいエディタ窓へ開いた。実PID45164のタイトルが`build/basic_only/game`を指すこと、編集UIのキャプチャ、起動ログの例外なしを確認。既存の編集窓は閉じていない。再起動用ファイルは従来どおり`D:\HomeBrew\FamiBASIC_Turbo_main\EditFlightLab.cmd`、F5でこの保存版を実行する。画面と窓情報は`build/latest_launch_20261006/{editor.png,editor_windows.json}`。

## Mesenの序盤スクロールと画面同期（2026-10-06）

ユーザー報告: 「MESENで遊ぶと弾を撃ってなくても序盤で背景がちょっとガクガクするんだが、これはアプリの処理落ちではなく画面同期の都合とかだろうか？60fpsとちょっとずれてると聞いたが。エミュレーションは正確でなくなってもいいのでこれを無くす設定とかMESENにある？」

`D:\HomeBrew\Mesen\Mesen.exe`は2.1.1（commit `137ae7ce3bf3f539d007e2c4ef3cb3b6c97672a1`）。同フォルダーの保存設定では`VerticalSync=false`、`IntegerFpsMode=false`、`EmulationSpeed=100`。設定変更は依頼されていないため、ここでは確認と手順案内だけを行った。

公式実装の[映像設定画面](https://github.com/SourMesen/Mesen2/blob/137ae7ce3bf3f539d007e2c4ef3cb3b6c97672a1/UI/Views/VideoConfigView.axaml)と[フレーム待機](https://github.com/SourMesen/Mesen2/blob/137ae7ce3bf3f539d007e2c4ef3cb3b6c97672a1/Core/Shared/Emulator.cpp#L700)を確認した。Settings → Video → GeneralにInteger FPS modeとVertical syncがある。NTSC NESは約60.0988fpsで、Integer FPS modeはfpsを整数へ丸めて60fpsの実時間ペースにする。約0.16%遅くなるが1フレーム内のCPU処理予算を増やす設定ではない。60Hz表示では非整数fpsとの差が約10秒で1フレームになる計算。Windowsの表示は60Hzまたは120Hzだと60fpsを均等に割り当てやすい。59.94Hzと60Hzは区別する。公式旧版の[説明](https://www.mesen.ca/docs/configuration/video.html#general-options)も60Hz LCD向けのInteger FPS modeの意図を明記しており、現行コードで継続を確認した。

最新版ROM `994194332c366819d59cc986b2cbcc6ec08df5ef14735254e82335227871291e`を同じ自作コアで無射撃・無移動・無敵の条件にし、序盤1200表示フレームを測定。bank4のカメラ座標が全1200フレームで1ピクセルずつ進み、同一座標の繰返し0。`build/latest_launch_20261006/no_fire_scroll_invulnerable.json`に保存した。無敵なしの600フレームでは260～394の135フレーム連続でカメラが止まったが、死亡演出による停止を混ぜないため比較条件を分けた。

これは自作コア内の更新の確認であり、Mesenの実入力・GPU提示・モニター同期は未測定。原因を同期と断定せず、Integer FPS mode + VSyncをONにして同じ序盤で比較するよう案内する。ゲーム側の残る更新落ちはこの設定だけでは解消しない。
