MonoSH NESFX v020 / SFC準拠の遠景の山・森
2026-11-08

通常ROM: build/MonoSH_NESFX_v020_SfcScenery_UNTESTED.nes
専用DLL: runtime/MesenCore.dll
実ゲーム動画: results/scenery_final/MonoSH_NESFX_v020_invincible_scenery.mp4
最終検証: results/final_validation.json

実装
・v019を独立コピーし、遠景をゲームへ組み込みました。地面textureやGSUの敵画像へ山を焼き込んでいません。
・山と森は別の2D層です。SFCと同じ512px周期で、森は山の2倍速。左右入力を保持した画面端でも流れ続けます。
・元NESに残る _bgfaru_scroll_acc / _bgfard_scroll_acc を読みます。元NESの30Hz加算x*4/x*8はSFC60Hzのx*2/x*4の2更新分と一致します。ゲーム側の計算は変更していません。
・中間画は16bit循環差分の半分で補間し、65535→0付近で逆方向へ飛びません。停止・死亡・resetの元NES状態を尊重します。
・上下位置はSFCのVOFS=21-camera。現在画のcamera=2*ground_offset、中間画は前後のoffsetの和。山は地面のパース拡大縮小を受けません。
・投影原点104+cameraを維持し、表示だけ地面上2行をclipして106+cameraから地面を出します。山頂を削る古い誤仕様は採用せず、SFCの全輪郭を保持しています。
・遠景5Bを既存cameraレコード末尾へ追加(14→19B)。mid/currentとも4段queueに固定し、地面の裏bankへ保存、FX/OAM/地面と同じVBlankで表示します。
・優先順位はGSUの非透明敵画素が遠景より前。遠景は森→山→空です。自機・自弾・影のnative PPU OAM属性は元のままです。

パレット
・指定どおり、パレット選択は空か地面かだけです。8×1の絵柄・敵・透明部を見てパレットを切り替えません。
・共通は暗緑$09、灰$10、明緑$29。空専用は紫$14、地面専用は中間緑$19。全PPUパレット32Bがv019と一致しました。
・山は共通灰、森は共通の緑2色＋灰に量子化しています。SFCの山の紫の階調や雪の独立した白は、この指定色数では再現できません。
・試作中に山用追加パレットを選ぶ方式を作りましたが、既存の指定に反するため撤回しました。最終ROM/DLLには含みません。

容量と変更範囲
・SFC遠景の203共有tile3,248B＋2層map512B＋元パレット128B、header込み3,920B。
・CHRの既存空き0x1B010〜0x1BF5Fへ格納。MSH5識別子、自機CHR、地面texture、敵atlasを削っていません。
・地面textureのPRG/CHR両コピー、自機CHR8KiB、元NESソース、音源、GSUソースをバイト比較して保存を確認しました。
・元v019 ROM/DLL、既存SDカード、RBFは変更していません。
・追加register $4F90〜94は遠景pending、$4F95〜99は表示中のread-only確認用です。このABIは今回の専用Mesen用で、既存RBFは対応していません。

検証
・独立prototypeでSFC元画像262,144画素の透明/RGB一致、compact decoder16,384画素一致、14,745,600件のwrap補間を確認。
・最終合成368,640ケース: 全て空palette1。FX前景色が不変、FXの透明部分では空だけでなく山/森を含む全背景画素のcode/実色が不変。
・camera全65段階×192行: 地面clipより下は旧合成とバイト一致。
・最終ROM/DLLとv019を1,201回の正確なpre-core_tick境界で比較。元NES151項目850B、元OAM256B、入力、frame_count/logic_tick/draw_countが全一致。
・29.95秒/1,800 PPU fieldの実録画。midpoint899/current901標本の全てで、表示中の遠景状態がqueueの世代/位相と一致。山4回・森7回の16bit wrapを確認。
・左右端-112〜112と全ground_offset0〜32を通過。音声ストリーム・非無音を確認。
・動画は通常ROMの元SELECT入力で無敵をONにした実PPU出力です。RAM書換え、録画後のゲーム画面差替え、ゲームフレーム補間はしていません。追加キャプションは画面外の余白です。

速度・未検証
・同じ1,800field入力をv019でも実行。最終logic_tick905、draw_count905、present_count1805、queue_drop2、starvation3は両版で一致しました。
・内部のlate_fieldsカウンタはv019の45に対しv020は55でした。これは新たに10映像frameを落としたという意味ではありませんが、追加のCPU処理負荷があります。
・密な場面の既存の表示待ちは残っています。連続60fps性能は保証しません。
・FPGA RTL、合成/fit/BRAM/timing、実NES本体、全ステージクリアは未検証です。既存RBFへこのROMを載せただけで動くとは主張しません。
・途中版の計測は履歴として残しています。最終結果は必ず results/final_validation.json、results/core_identity_optimized/comparison.json、results/scenery_final を見てください。

再ビルド(ROGXboxの既存SDK/Mesen host objectが必要)
python -X utf8 build.py
python -X utf8 tools/build_palette_core.py
python -X utf8 tools/test_scenery_composite.py

最終ROM SHA-256
064805f8cab02ee127731cea55ba4878f59adca4e07492bac22d304bd7854224
最終DLL SHA-256
65f2c97f544e804f1ff64e66ab8a04e2c4fea3e1cbe030d37359008c4150af80

SFC根拠
../MonoSH_NESFX_v001/reference/MonoSH_FX2/game/v001/frame.s:171-195
同 ground.s:49-58,113-118 / cpu.s:431-436
同 assets/scenery.inc / RESULTS_20261009_GROUND_TIME.md
同 tools/build_scenery.py / tools/verify_game_display.py
元NES: reference/nes_support/src/draw_ground_bgfar_batch.s:52-89
