# MonoSH FX2：CPU更新とGSU描画準備の高速化

2026年10月5日。[プロジェクト](../../../projects/monosh_fx2/README.md)、[結果](../../../projects/monosh_fx2/game/v001/RESULTS.md)、[操作](../../../projects/monosh_fx2/game/v001/README.md)。前段の表示修正は [20261005_display_fix_v001.md](20261005_display_fix_v001.md)。

## 現状

製品ROMは256×180表示、内部256×192・2bpp。Stage 1、被弾・転倒・復帰、ボス撃破・次周まで動く。標準Mesen・GSU100%・追加走査線0で18,000fieldの通常進行が平均55.11fps。31死亡・30復帰、全EM0経路、全EM1状態、自然なボス撃破・次周を確認。表示間隔15,036回が1field、1,470回が2field、3field以上0。序盤2,400fieldは起動込み59.55fps、表示間隔は全2,377回が1field。

CPU平均7.28ms・最大13.09ms、GSU平均8.43ms・最大20.23ms、合流平均9.18ms・95%点15.76ms、DMA平均1.50ms・平均2,439bytes。前回35.31fpsから改善したが、192行・全場面60fpsは未達。

序盤profileのCPU7.51msからpacketソート・コピー2.65msと地面表0.92msを除くと約3.94ms。ロジック・描画リスト生成などの残り区間は当初の4ms見込みに近い。ただしCPU全体4msとは言わない。

## 実装

- 65816のframe更新順、自弾・反射弾、通常自機移動、敵弾dense削除・DDA、EM0更新、EM1開き状態、Stage接触、ボス履歴投影・描画・自弾判定。C経路を参照として維持。
- CPUが10byte `FxDraw`をpriority昇順・同priority Z降順に安定ソートし、MVNでGSU STOP中だけ送信。GSUがraw矩形をclipし、ROM $5Eの表からQ8.8 UVを準備。
- GSUが前回の描画tileだけ消す。今回範囲はRAM $0580、消去した前回範囲は$0800。最後の32列走査で和集合を作り、$0600へDMA区間を書く。CPUはSTOP後に区間だけ読む。
- 64byte以内の隙間はまとめ、bytes+区間数×64が12,000以上なら全12KiB一本。bytes+区間数×128が9,216以下の時だけ220行目まで転送開始を許す。通常進行の実開始は最遅222行、全転送は約4.84ms・line18完了で23行目の表示再開に間に合う。
- 水平2倍・等倍・半分・1/4と、反転等倍・半分・1/4の7packed経路。2倍の末尾0〜7pxを検査。その他はQ8.8汎用参照。

表示の5点は修正を維持。地面BG3を行別H/V、奥行き帯に緑四色、遠景BG4のYと上下帯のH、FB BG2は固定V。地上物・地面は65カメラ×81距離表・下端207を共用する。

## 検証と見つけた誤り

C/nativeは通常5,632更新、ボス2,847更新で全状態と有効描画矩形が全byte一致。比較入力は関数入口の変数だけでなくcc65 stack上の実引数も揃える。ボスfixtureは物理fieldではなく論理更新数で時刻を揃える。元NES実機の全frame一致ではない。

1,713更新目のEM1中央laneの発射がずれていた。LDXがZ flagを書き換え、lane=0の判定を外して発射が遅れていた。CMP #0を明示して修正し、比較と10試験をやり直した。通常進行・全画素一致だけではAI時刻の保存を保証できない。

DMA完了のfieldは量によって境界をまたぐので、完了時刻の差を表示間隔にすると0や偽の長い間隔が出る。表示間隔は203〜223行に来るDMA開始fieldから集計する。旧完了時刻集計は`dmaCompletionIntervals`に残した。fpsは画像数ベースなので変更なし。

10試験でVRAM全12,288bytesとFBを3,098回、独立描画95場面の49,152画素を照合。三カメラの最終RGB全61,184画素と原本投影表・四色も一致。原本34ファイルのhash一致。製品SHA256は `953d5aa44ed2c6c985b9ba10695ac99525880df766d15ecdc72a6e6dca9c4675`。

## 次回

再現は `python -X utf8 projects/monosh_fx2/tools/verify_game.py --equivalence`。全転送比較は `compare_renderer_modes.py`、旧CPU準備版の比較は `compare_transfer_modes.py`。どの測定もROM hashを区別する。再ビルド中のROMをMesen試験に使わない。

同じ最終ソース・入力・18,000fieldで全転送51.82fps、部分転送55.11fps。比較後に既定ROMの再ビルドが製品と同一hashになることを確認。比較後の`build/game_v001/long`は全転送の一時測定なので、そのままarchiveしない。製品版のログ・画像は`game/v001/results`へ保存済み。

設定は`game/v001/config.json`でGSU UV/clipと部分転送が既定。`--full-transfer`、`--cpu-clip --cpu-uv --partial-transfer`で比較でき、フラグなしで既定に戻る。描画情報を10byteで詰めるので、旧`FxCommand`20byteの型だけからwireを解釈しない。

残る重い場面はGSU最大20.23ms。任意倍率の参照、透明区間を飛ばす描画、最大表示寸法の原画配置、残るC更新が候補。原画は高さ128までの2枚/bank配置で、近距離に拡大参照が残る。音・実機確認は未実装・未実施。ユーザーは処理落ちと上下のcropを許容してまず遊べる移植を依頼しているが、192行と全場面60fpsの未達を隠さない。
