# EditFlightLabのF5で時間ボーナスが出ない問題

2026-10-04。対象: `D:\HomeBrew\FamiBASIC_Turbo_main`。ユーザー原文:

> D:\HomeBrew\FamiBASIC_Turbo_main\EditFlightLab.cmd  を実行してBASICからF5を押した実行でタイムボーナスが出なかったが、何か間違っているか？

操作は正しい。`tools/latest_flight_lab.py`は生成プロジェクト`build/basic_only/game`の指紋が`generated_files.json`と違えば編集保護のため生成元を呼ばず、保存済みBASICを開く。実際のmain側保存済みソースは2047行で、46000番以降のボーナス処理も各フックもなかった。前回の検証は隔離したmain生成版と比較版で、実際のmainの保存済み編集経路を見落としていた。比較版の起動ROM更新だけでは普段のmainのF5には反映されない。

修正 `8e090fab7971eb2d8015f305cf51af3d46a71086`、結果資料 `34b2b72` をmainへpush・実作業フォルダへfast-forward済み。起動時に未導入のB版へ時間ボーナスを追加し、更新前のフォルダを丸ごとバックアップする。ゲーム用BGと音素材の内容を保持。独自編集された入口・予約行には自動追加せず、更新中の外部変更も検出する。生成指紋は更新済み編集へ付け替えず、以後も編集保護を維持する。

最近のBGLOAD移行では描画が直接PPUからRAMバッファ経由へ変わっていた。TOTALは相対64、HIGHは96、コピーは70→102 B。カウントアップNMIはBGLOAD・ジングル開始後に設定し、転送中に画面を有効化しない。前後半をBANK 1/0の同じ物理窓へ配置した。保存済み効果音版と新規生成版は空きが違い、桁変換は旧版BANK 7・新しい効果音版BANK 6。効果音変換後も配置を確定する。終端にコロンのないRMCOPY行も更新する。

回帰26件（成功24・既存skip 2）。保存済み版の通常／早送り全編、新規生成版全編が機能成功・描画不一致0・再挑戦成功。750フレーム、22,000点、151,000→173,000点へ一度だけ加算。実TkのF5メニュー経路を通した保存→ビルド→起動要求のROMは全編検証ROMと完全一致。自作NESコアでも621フレームで本体コンパイル完了。実mainのcmdと同じvenvでも起動用ROMを更新し、SHAと容量を照合した。物理実機は未試験。

実mainのバックアップ: `D:\HomeBrew\FamiBASIC_Turbo_main\build\basic_only\edited_backups\before_boss_bonus_20261004_231937_979104`。実mainソースSHA-256 `e4b0986317ea5b7af4a75d85324835deba2adcf1ea73adcb9763e5af695b7a23`、ROM `07f172a91332dbb59dc762bad6281ef410c62a4106761d16a66f6fe1ded85696`。開いていたエディタを閉じて同じcmdを開き直し、F5を押す。再起動経路も素材・ソースを再変更せず同じmanifestを開くことを確認。

両版2048行・512変数・自動再配置0回。保存済み版は64,249/64,512 B、空き263 B・最小BANK 4 B、新規生成版は63,354 B・空き1,158 B・最小7 B。追加RAM 0 B。各BANK 256 B余裕目標とmainの60fps未達は継続。詳細・実画面は `D:\HomeBrew\FamiBASIC_Turbo_main\docs\editor_boss_bonus_20261004.md` と `docs/benchmarks/editor_boss_bonus_20261004/`。この追補は[前回の結果演出実装](boss_result_animation_20261004.md)の実main起動経路に関する注意を更新する。
