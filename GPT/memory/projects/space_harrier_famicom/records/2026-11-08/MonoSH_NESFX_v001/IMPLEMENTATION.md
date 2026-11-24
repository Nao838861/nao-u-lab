# 第一弾の設計とABI

## SFC 2bpp版をどう利用したか

SFC側の8×8パレット属性つき物体を、そのままNESの色として流用することはできません。正しいRGBはbg_colorのpalette.bin、cells.bin、offsets.binから復元しました。灰色の代理PNGを実色とみなしていません。

参考にしたもの: Q8.8の縮小座標、透明画素、奥から手前への上書き、実画像と曲。今回のGSU回路はROM入力が接続されていないため、SFCのGETB/GETC・ROMbank画像・cache外コードは直接動きません。6KiBのRAM素材をLDBする512B cache内プログラムを新規に実装しました。

## メモリと命令

- NES $6000-$7FFFをGSU $8000-$9FFFの8KiB work RAMへ接続。
- $8000にcommand count u16、$8010から16B/command。
- commandはsource, x, y, width, height, stepX, stepY, reservedの各u16。
- $81F0-$81F3にGSU scratch、$8200-$99FFに32×32×6種のbyte-per-pixel atlas。
- atlas値0=透明、1=明色、2=緑、3=暗緑、4=opaque-zero。value4はCOLOR=4かつCMODE=$11でPLOT後、通常CMODE=$10へ戻す。単にCOLOR=0を書くのは誤りです。
- FBは256×192・2bpp固定。SCBR=$00/$10で交互。CPUで16KiB clearし、描画完了後の自動copyとMode7 readyを待ってNMIでcommit。

## フレーム手順

NMIが入力、ゲーム、音楽をnominal60Hzで更新。メインはNMI世代を前後比較してゲーム状態をsnapshotし、敵の奥行順、木、自機、弾の最大11コマンドを作ります。Mode7をback bankへ起動し、同じback bankのFBをclear、GSUを実行。$4FB0のreadyを待ち、ready変数を立てます。NMIが$4FE2へcommitしてfrontを交換。ゲーム更新を描画待ちに依存させていません。

スケールは32*256/sizeの整数Q8.8を使用。座標は描画前にCPUで矩形ごと画面内へ制限します。これは画面外の元画像を部分的に切り取る高度なclipではなく、矩形を内側へ寄せる簡易処理です。

## PPU色

racing_displayは8画素×1行に1つの最終パレットを返します。FX入力には4色＋抜きがありますが、地面と物体が重なる区間の最終出力は4色です。BG texture indexの地面側変換は0→slot3、1→slot1、2→slot2、3→slot0。FXは1→slot1、2→slot2、3→slot0、opaque-zero→slot3。

第一弾は全パレットのslot0/1/2を共用し、地面用slot3=赤茶、空用slot3=紫としました。textureの3/2で暗緑／緑の市松になります。現行回路への任意8×1属性追加は行っていません。

## 採用ハードウェア

基準RTL: C:[REDACTED_HOME_PATH]

採用RBFのreadback SHA-256: 30a7615d0a83aaf781bd18482289591348fbe8bc39506a4f177a121ade5127e6

既存RBFは変更せず、このROMもSDへ転送していません。別回路や通常NROMで動くことを保証しません。既存fitはM9K=30/30、LE=6248/6272のため属性RAMなどの追加には設計・fit・タイミング再検証が必要です。
