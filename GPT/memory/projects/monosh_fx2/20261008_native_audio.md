# 標準SPC700のBGM・SE

ユーザー原文：
> ストリーム再生は無理だと思うので、普通にSFCで鳴る曲とSEを作れる？

実装先は `projects/monosh_fx2` のmain／2bppカラー版。4bpp実験分岐は触っていない。

メインテーマ六声＋SE二声をTAD v0.4.2で実装した。640拍、154BPM、約249秒ループ。音符はJK150 / SixtyTunesの公開採譜を六声へ削減し、録画音声のスペクトルも照合した。FM風の短い周期波形と打楽器を生成してBRRへ符号化する。SEは実発射、反射、敵爆発、転倒、死亡、ボス撃破。SFC向け編曲の初版で、原作の完全コピー・完全自動抽出ではない。ボス専用曲・音声は残る。

音源18,246bytesを起動時に転送し、ゲーム中はAPUIO命令だけ。GSU稼働中の`_fx_frame`からはRAMにビットを立て、GOが落ちた`render_finished`でROM上のAPIを呼ぶ。低RAM`$1600..1617`の24bytesとDP二byteを追加し、カラーRAMを`$0400..15FF`に分離。CPU WRAMコードは`$0000..FE8E`に収まる。通常ビルドは生成済み音源を使い、mido/TAD compilerは再生成時だけ必要。

配布ROM SHA256：`98ff99ececd91b3d641d822b005c83e63317c3dcf3edb813687b5fb490035088`。

16,000フィールド、曲tick32,255で一周30,720tickを通過、ポーズ中59フィールド不変、GO中API呼出し0回。短い再試験で六SEの命令受信直前のSPCを保存し、六種すべて非ゼロ・クリップなし・終端無音の波形を確認した。実ROM由来のBGM45秒とSE試聴MP3も保存。

同じ入力A、論理フレーム100..2099の2,000回で、音なし29.952069fps→音あり29.914797fps、差約0.12%。音の通知平均0.087132ms、最大0.127670ms。比較する自機・弾・反射弾・敵・ボス117bytes一致。SPC全RAM書き出しを伴う試験のタイミングは性能比較に使わない。現在のカラー版約30fpsという課題は維持され、60Hz版の数値を流用しない。

同じROMでplay6000、boss2600、objects360、scenery800、color240、pause650を通過。固定時刻の画像試験は`game_started`以降にfieldを数え、音源初期化中の未完成画面を採らないようにした。旧ステートはWRAMの旧コードを戻すので、開き直し・リセットで確認する。

入口：

- `projects/monosh_fx2/game/v001/RESULTS_20261008_NATIVE_AUDIO.md` — 出音・性能・画素回帰と残る差。
- `projects/monosh_fx2/game/v001/audio/README.md` — 出典・再生成・ライセンス。
- `projects/monosh_fx2/game/v001/results/native_audio_20261008/` — SPC、試聴、Lua、圧縮trace、全標本とmap。
- `tools/build_audio.py` / `test_audio.py` / `compare_audio_perf.py` / `archive_audio.py`。

性能比較の再実行には、resultsの `perf_baseline/baseline.sfc.gz` を展開して `.cache/tad/baseline.sfc`、同所の `game.lbl` を `.cache/tad/baseline.lbl` へ置く。比較元hashは `4ef5a95fec70a4ee3dfcf3b9f39ea38180aa138fd44b7709fed8b21704197025`。変更前の配布manifestも保存した。音源再生成時はドライバzipと採譜入力の固定hashを検査する。

公開先：`Nao838861/MonoSH_FX2` のmain、commit `a2ec83a1ff94e1c55929fbea3a9e4edc26e2dc21`。公開コピーからも再ビルドして同じROM hashを確認し、push後にclean・remoteとの差分なしを確認した。
