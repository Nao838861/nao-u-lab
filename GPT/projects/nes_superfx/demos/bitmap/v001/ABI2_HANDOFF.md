# PPU直接ビットマップ表示の提案ABI2

2026年10月14日。ユーザーの指示で、エミュレーター側に実装し、NESのROMから検証した仕様。**現行N8 Pro RTLのABI1と互換な追加機能ではない。RTL側の実装・合成・Fit・実機確認は未完了。** 現行RTLや別スレッドの作業ディレクトリは変更していない。回路側が次の実装へ進む時の引き継ぎとして使う。

## メモリー

| GSU RAMアドレス | 大きさ | 用途 |
|---|---:|---|
| 0000..3FFF | 16 KiB | フレームA |
| 4000..7FFF | 16 KiB | フレームB |
| 8000..9FFF | 8 KiB | モデル、係数、描画リスト、走査線作業領域、実行コード |

有効RAMは40 KiB。画像は256×256・2bppとして確保し、NESへは最大256×240を表示する。GSUのCMODE bit4を立てたOBJ/256行配置を共通の物理形式とする。4 KiBの単純な連続バンクへGSUの画像を詰め直す処理はしない。

512byte命令cacheはGSU本体のものを保持する。外部GSU ROM入力はABI1と同じ00。描画プログラムはGSU RAM9C00..9FFFへ配置し、PBR=70、R15=9C00で起動する。今回の面塗りコードは392byteで、CACHE命令から512byte窓へ収まる。

表示側はPPU専用、描画側はGSU専用として、同時読書きを可能にするメモリーポートが必要。CPUはGSU停止中だけ8 KiB窓からRAMを操作する。エミュレーターの独立ポートモデルから、現行FPGAの内蔵RAMで収まること・外部PSRAMの調停や待ち時間が成立することは導かない。

## CPU窓

従来のGSU MMIO/cache窓5000..52FF、ID5FF1=53、リセット5FF0=A5は維持する。ABI版5FF2は02。

| CPUアドレス | 読書き | 内容 |
|---|---|---|
| 5FE0 | R/W | 表示mode：0=固定CHR、1=中央128×128、2=中央256×64、3=全画面256×240 |
| 5FE1 | R/W | CPU RAM窓の8 KiBページ。0..4 |
| 5FE2 | R/W | 現在の表示フレーム0/1。書込みで完成した画像を採用 |
| 5FE3 | R/W | fault。bit0=表示中RAMへの書込み、bit1=GO中の採用、bit2=無効なpage/mode/address、bit3=VBlank外の採用。1を書いたbitをクリア |
| 5FE4/5FE5 | R | 採用世代、下位/上位 |
| 6000..7FFF | R/W | 5FE1で選んだ共有RAMページ |
| 5FD0..5FD7 | R | **エミュレーター計測用**。直近GOからSTOPまでのGSU基準clock数、little endian。RTLの既存レジスターとは扱わない |

ソフトリセットはGSU状態と表示mode/page/front/fault/generationを初期化し、RAM内容は保存する。mode=0、page=4、front=0に戻る。

5FE2への書込みはホストのNMI/VBlank処理で行う。GO停止とRPIXによる描画cacheのflushを先に完了する。未完成なら採用せず、前の画像を保持する。エミュレーターではNESの走査線241..260以外の書込みを拒否する。RTL側はこの契約をCPUからどう保証・検出するかを実装時に決める必要がある。

## PPUの読み出し

CPU IRQで64行ごとの切り替えを行わず、PPUのnametable fetchからcoarse X/Yをラッチする。attribute fetchでは更新しない。次のpattern fetchはそのタイルの画像座標を使う。これにより前走査線末尾の先読みも、同じnametable行へ対応する。

- mode1：タイル列8..23、行7..22。画面位置64,56へ128×128を表示。
- mode2：タイル列0..31、行11..18。画面位置0,88へ256×64を表示。
- mode3：タイル列0..31、行0..29。全画面256×240。
- 画面外のmode領域は0を返す。attributeは0、パレットは共通4色。
- 背景はpattern table 0000を使う。PPU 1000..1FFFは固定CHRの第２tableを残し、sprite用HUDに使える。スクロール0、背景attributeは共通パレット。本格的な固定CHR背景HUDとの合成は未実装。
- 段階試験・固定個数の計測ROMはsprite無効。A切替ROMだけ、pattern table 1000の文字spriteで個数と辺長を表示する。GSU画像RAMとsprite用固定CHRは別経路。

mode3の64行帯は、ラッチした画像Yの上位から0/1/2/3を選ぶ。960タイルを8bitタイル番号だけで区別せず、nametable fetchの行情報をpattern fetchまで保持する。PPU側のtile内row/planeをGSUの隣接plane byteへ変換する。

物理画像アドレスは次の式。frontの16 KiBオフセットを最後に加える。

    tile = ((y & 128) << 2) + ((x & 128) << 1)
         + ((y & 120) << 1) + ((x & 120) >> 3)
    byte = tile * 16 + (y & 7) * 2 + plane

C++での接続実装は src/BitmapBoard.hpp と src/NesBitmapFx.h。mode1/2/3は同じ経路を使う。GSUのnative配置に対応しているため、X=127/128、Y=63/64・127/128・191/192の境界を含めて検証する。

## 検証と次の回路作業

GSUが生成する位置識別パターンを、128×128、256×64、256×240で最終PPU全画素まで照合する。回転立方体はGSUが頂点変換と面塗りを毎回実行し、完成画像の世代・VBlank採用・2 field周期を検査する。GSU停止時だけCPUへRAMを返し、表示中のbankは描画しない。

回路側では、まず上記アドレス変換を同じ境界パターンで照合し、次にGSU/PPUの独立ポートとCPUアクセスを実装する。40 KiB RAMとGSUのFit、外部RAMを使う場合の帯域・待ち・M2/PPU非同期タイミングを検証する。今回のGSU時間モデルのベンチマークを、FPGA実装の性能保証として使わない。
