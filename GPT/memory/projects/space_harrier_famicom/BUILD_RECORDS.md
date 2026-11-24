# 版別の原資料と測定条件

以下はプロジェクト相対の原資料名。実機ファイル名・派生版・旧機種のものを取り違えないための索引。公開資料に同梱した原文は `records/`、元のやり取りは [日別記録](README.md#開発の時系列) を参照。

| 原資料 | 内容 |
| --- | --- |
| `MonoSH_NESFX_v009_BulletRaster/docs/V009_RENDER_REPORT.md` | v005→v009。大きな敵弾を含む同条件のボス描画最大時間18.86→11.34ms。ゲーム全体・実機fpsではない |
| `MonoSH_NESFX_v010_Interpolated/docs/V010_PIPELINE.md` | 4パケット、6502とGSUの重複実行、NMI/OAM、約30Hz処理の補間、遅延 |
| `MonoSH_NESFX_v034_RestoreOriginalPalette/README_V034_PALETTE_RESTORE.md` | 一体化されたゲームASMのベース候補。v034単体は11/11採用ROMではない |
| `r11_stage_camera_unroll_20261109/README.txt`、`RESULT.json` | 固定操作の専用Mesen試験で道中とボス各3,000/3,000新規表示 |
| `r11_stage_supply_20261109/results/FINAL_RESULT.json`、同版配布ZIPの `README_JA.txt` | 6,000フィールドの道中からボス戦中までの試行と、STARTで切り替える独立のボス試行。30Hzロジック＋補間表示。移動・射撃ありも別測定 |
| `r11_full60_opt_20261110/README_FULL60_JA.txt` | 自機だけでなく、敵・弾・ボス・当たり判定も60Hz化。開始・死亡など一部演出や表示の間に合わなかった場面も区別 |
| `r11_perf60_20261110/release/SpaceHarrier_r11_PerformancePass3_GroundSelected_Windows/README_JA.txt` | 6,000フィールドの後期最適化。59.898fps、遅れ17。EM1は姿勢が変わる時に画像を供給。描画命令の供給と画像転送は別 |
| `red_eye_v034_r9_shared_red_effects/deliverables/REPORT_JA.md` | 局所的な黒を維持しつつ、既存の赤を爆発やボス弾へ共有する工夫 |
| `r11_ground_palette_trials_20261111/README_PALETTE_TRIALS_JA.txt` | 暗`$19`・中`$2A`・明`$39` を使ったA〜E案。網点なし、1px固定網点、粗い網点など |
| `r11_ground_camera_sync_20261111/CAMERA_PATCH.json` | 地面とオブジェクトの投影を揃える差分 |
| `r11_sky09_commonwhite_20261111/EXPERIMENT.json` | 共通白・空`$09`の最終パレット差分。それ以前の一体化済みソース全体ではない |
| `r11_sky09_hardware_release_20261111/HARDWARE_RELEASE_STATUS.json` と `final_sd_layout/FINAL_SD_LAYOUT_RESULT.json` | 実機起動と基本動作、SD保存版の読み戻し照合。採用ROMはSHA-256先頭`67b651e8`、対応回路は`a815d020` |

## 実機最終版の識別

- ROM SHA-256: `67b651e8e71477dbd216efbc730cfdc033be7df5371071ad123a76664f212511`
- 対応マッパー SHA-256: `a815d020706a5729d2eeed270c95fc8f1eb4bb8b2a7bc31fc52142409c66799c`
- 11/11の基本動作はプレイヤー・敵・地面スクロールを約30秒確認。長時間全編・音・厳密な実機fpsの検証とは別。
