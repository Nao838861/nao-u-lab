# 元の走行音を接続した3D版

`run_racing_3d.cmd` で音ありv002を起動する。操作はv001と同じ。Zで加速、Xでブレーキ／DRIFT、左右で操舵、右Shiftで視点、上で地面、下でモード、Enterでリセットする。

元の配布ROMに入っているAPU矩形波2本のエンジン音・タイヤ音を接続した。音源を新しく模倣せず、復元済みWRAMの音ドライバとPRG127の `$FF00` を毎NMI呼ぶ。初期化はPRG109の `$B828`。モードは描画の一時領域から読まず、永続領域の `desired_mode` から旧 `$18` へ渡す。リセットの長いRAM復元中は `$4015=0` で消音し、復元後に原版の初期化処理を呼ぶ。

元の通常リリースには走行BGMがない。ゴール・記録更新のジングルはレース進行に依存するため、この自由走行版ではまだ鳴らさない。CPU車・周回・景物もv001と同じく未接続。

## 検証

- v001に対する変更はPRG bank0だけ。物理、音ドライバ、GSUコード・データ、CHRはbyte一致。
- GRIP／DRIFT × 25／50MHzの4条件で各1,000回、物理状態167bytesが音なしv001と一致。
- 各条件で音更新数と物理更新数が一致し、表示faultは0。
- 加速・旋回・ブレーキ・惰性入力でエンジン音量0/1/3、タイヤ音量0/2/3を観測。エンジン周期下位はGRIP81種類、DRIFT87種類。
- 同一モードの25／50MHz間で、最初の1,000tickのAPU音レジスター書込み2,400件が一致。描画負荷で音の進行を遅らせない。
- 視点・地面・モード切替、STARTリセット、描画範囲外からの復帰を再検証。

結果は [verification.json](results/verification.json)、[controls.json](results/controls.json)。実APUの録音は [engine_tire.wav](results/engine_tire.wav)、PCM検査は [wave.json](results/wave.json)。録音用Pythonホストでは既存のNESチャンネル音量が初期値0だったため、専用コアのホスト初期化で100を設定する。通常UIの設定はUI自身が適用する。

## 再現

```powershell
python tools/build_racing_audio.py --cc65-bin <cc65のbinフォルダー>
python tools/verify_racing_audio.py
python tools/verify_racing_controls.py --version 002
python tools/capture_racing_audio.py
```

固定したv001 ROMと付属ラベルから描画用データを取り出すため、GSUアセンブラーや元の2D版の再ビルドは不要。音なし版へ戻す場合は `python tools/launch_racing.py --version 001`。
