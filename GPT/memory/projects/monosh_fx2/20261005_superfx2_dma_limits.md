# Super FX2とSNESのDMAタイミングと全画面転送の不足

2026年10月5日の仕様確認。NTSC、非インターレース、標準224行の出力を前提に、既存の帯域プローブとエミュレータの実装を照合した。新しいROM試験や実機測定は行っていない。

256×192・2bppを毎フレーム全転送するには12,288bytesが必要。上下各16行をforced blankにする現在の構成では、Mesen上で11,296bytesだけがVRAMに届き、992bytesが欠ける。不足しているのは保存用RAM容量ではなく、表示再開までのVRAM書き込み時間である。この構成の全転送が60Hzに収まらないという結果であり、256×192・2bppの60Hz更新があらゆる転送方式で不可能と確定したわけではない。

## 転送経路と二つのアクセス条件

GSUはカートリッジRAMへ描画し、SNES本体のDMAがそのRAMからPPUのVRAMポートへ画像を転送する。GSUからVRAMへ直接描く経路ではない。

転送元の条件は、カートリッジRAMをSNES側が読めること。GSUが稼働してRAMアクセス権を持つ間はSNES側から正常に読めない。通常は描画結果をflushしてSTOPし、停止を確認してからDMAする。バッファを2枚にしてもRAMのバス所有権は共通なので、同じカートリッジRAMでGSU描画と画像DMAを並行実行できることにはならない。GSU停止中はRANビットが残っていてもSNES側がアクセスできる実装であり、STOPとRANの明示的クリアを同一の必須操作として扱わない。

転送先の条件は、PPUがVRAM書き込みを許すこと。通常のVBlank、またはINIDISP $2100 bit7によるforced blankが使える。通常のHBlankにはこの許可がない。DMA自体は表示中にも開始できるが、VRAM宛ての書き込みは失われる。DMAが自動的に停止・待機して次のblankへ繰り越されるわけではない。

黒色のBG、window、レイヤー無効化、輝度0による黒画面はforced blankの代わりにならない。GSUの高さ設定を192へ変えてもPPUの自然VBlankは増えない。上下32行を実際にforced blankへする処理が必要になる。

転送経路と所有権の根拠は [プロジェクト設計](../../../projects/monosh_fx2/DESIGN.md)、[Mesen GSU RAM handler](https://github.com/SourMesen/Mesen2/blob/b9fa69ddc6d0a331fb103fdb5eef6904305703c2/Core/SNES/Coprocessors/GSU/GsuRamHandler.h)。VRAM許可条件は [Mesen PPU](https://github.com/SourMesen/Mesen2/blob/b9fa69ddc6d0a331fb103fdb5eef6904305703c2/Core/SNES/SnesPpu.cpp) のCanAccessVramと$2118/$2119、および [bsnes PPU](https://github.com/bsnes-emu/bsnes/blob/master/bsnes/sfc/ppu/io.cpp) のwriteVRAMで一致している。

## NTSCの転送時間と量

画像は256×192×2÷8＝12,288bytes＝12KiB。8×8の2bppタイルなら32×24＝768tile、1tile16bytesで同じ量になる。固定tilemapは初期設定後に毎frame全転送する必要はない。

DMAは1byteにつき8 master clocks。1走査線は原則1,364 master clocksで、そのうち40 clocksのDRAM refresh停止を引くと1,324 clocks、画像転送は理想化して165.5bytes/走査線となる。設定、割り込み、DMA起動、HDMAの費用はさらに引く。一次計測に基づく [Anomieのタイミング資料](https://raw.githubusercontent.com/gilligan/snesdev/master/docs/timing.txt) と [bsnes DMA実装](https://github.com/bsnes-emu/bsnes/blob/master/bsnes/sfc/cpu/dma.cpp) を参照した。

| 条件 | 概算転送窓 | 設定費用等を除く上限 | 既存Mesen試験で届いた量 |
| --- | ---: | ---: | ---: |
| 標準224行表示の自然VBlank | 37走査線 | 約6,123bytes | 6,051bytes |
| 中央192行表示と上下各16行forced blank | 69走査線 | 約11,419bytes | 11,296bytes |

192行の場合、下の黒帯16行→自然VBlank37行→次frameの上の黒帯16行を連続転送窓として使う。時間は約4.382ms。12KiBのDMAはrefresh込み概算約4.715ms、既存試験の計測区間では4.747msだった。理論上限でも869bytes不足し、開始位相や設定・HDMA等を含む既存試験では992bytes不足した。理論値と実測値の差123bytesの原因別内訳は未計測。

## 現在の試験で起きたこと

[既存の測定データ](../../../projects/monosh_fx2/probes/v001/results/dma.json) では192行の12KiB要求はscanline210付近から次frameの22付近までかかった。HDMAが表示を再開した後にもDMAが続き、その期間のVRAM書き込みが欠けた。VRAMを0へ初期化し、転送元を$FFにして実際に変化したbyteを数えているため、DMAの完了だけを転送成功と判断した結果ではない。標準224行の対照は14KiB要求に対して6,051bytesだけが届いた試験であり、14KiB全転送に成功した意味ではない。

同じ192行表示で10,240bytesだけを要求した対照では全byteが届いた。これは解像度を160行へ変更した試験ではない。OAM/CGRAMの毎frame更新や地面用HDMAはまだ加えていないため、実ゲームで使える画像転送枠はさらに減り得る。

GSUの描画速度を上げても12KiBの画像量とVRAM書き込み窓は変わらない。画像の圧縮も、VRAMへ展開後の全12KiBを送る方式ならこの不足を解消しない。DMA中は本体CPUも停止する。CPU→GSUの描画リスト転送はVRAM宛てではないのでVBlankに限定されないが、RAMの所有権とCPU停止時間は別途必要になる。

## 解決案の確度

差分tile転送は192行を保つ候補。既存の人工場面2枚では前後の描画矩形tileの和集合が320tile、5,120bytes、31転送区間だった。ただし実ゲームの連続frameや最悪sceneではなく、分割DMAの実行費用も未測定。

HBlank中だけforced blankを有効にして追加転送する案は、全12KiBと192行を維持する実験候補。通常のHBlankに単にHDMAを置くだけでは成立しない。GSU稼働中のRAM所有権、必要なら追加分のWRAM退避、PPUがそのtileを読む前の到着、BG/OBJの取得時刻、地面HDMAとの共存を検証する必要があり、実機成立は未確認。

黒帯の追加や転送を2frameへ分ける方法は予算を増やすが、表示高さや画像更新率を変える。現在の256×192・毎frame全転送要件を保った達成とは扱わない。方式を変更した実装はこの確認では行っていない。比較案の詳細は [DMA_OPTIONS](../../../projects/monosh_fx2/DMA_OPTIONS.md)、測定条件と限界は [RESULTS](../../../projects/monosh_fx2/probes/v001/RESULTS.md)。
