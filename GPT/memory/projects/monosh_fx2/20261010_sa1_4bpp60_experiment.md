# SA-1 / 4bpp / 60fps 独立検証（進行中）

## 最新状態（2026-10-10、4085735）

独立分岐へ `4085735` をpush済み。**60fps未達、goal継続。試遊releaseはf8dbe7cのまま。** `--fixed-map-delta` と `--fixed-map-delta-dma` を実装・検証したが、共に遅く不採用。現行fixedmap/residentの800field/644表示/168画面一致に対し、CPU直接map更新版v6は800/638/168、ROM列から区間DMA版v3は800/634/168。DMA版の先頭120表示も全画面一致。比較packetは同世代で一致。4正常試験・初期失敗・ROMスナップショットを `results/20261010_fixed_delta/` へ保存、zip SHA `2079c78d1710f3163d91c76661885598eb45039d59934208bc7ee838bb180b10`。

mapの旧・新mask差分生成はSA-1、WRAMに1472B×8 record所有枠。直接版は40変更tile以下をCPUで更新し、多ければfull-map。DMA版は変化した同じ表示状態の連続tileを最大48記述子にまとめ、自然番号列/透明列のROMから送る。どちらも表示直前にだけmap更新し、費用をDMA予算へ予約する。消去CHRの節約よりmap更新の設定費用が重かった。

初期失敗の根本原因を補足：v1/v2/v3はGSUへ置いたCPU helperの後でCODEへ戻していなかったため、後続のblank table等の配置が変わった。v4は`lda $0000,x`がdirect-pageにassembleされ、WRAM DBRを使わずlistが読めなかった。`a:$0000,x`へ修正。builderに後続`fx4_wait_obj_blank`がCODE内に残るassertを追加。VRAM各byteへのemu callbackはホスト実行を大幅に遅くしたので撤去し、map入口/出口・各DMA入口/出口のblank検査へ戻した。未完走の計測器試験を速度比較に混ぜない。

次は、現在のbullet-shapes-ROM＋no-history＋bullet-residentと、過去に単独では遅かったVRAM4面を組み合わせ直す。ビルドは従来best_cmd（contiguous-chr-dmaあり）へ `--bullet-mask-arithmetic --bullet-shapes --bullet-shapes-rom --vram-four-shared --redraw-no-history --bullet-resident` を追加し、fixed-map/deltaは外す。`movestress_detinput_captureburst_fourshapes_v1_tracepalette` の800field試験でMesenは終了、Python画素照合中。完了までROM/LBLを変更しない。ユーザーMesen PID70064を操作しない。

## 過去の中間点（2026-10-10、f8dbe7c）

独立分岐へ `f8dbe7c` をpush済み。**60fps未達、active goal継続。** 試遊ROMを固定map・no-history・bullet-residentの検証済み版へ更新した。`D:\HomeBrew\MonoSHSA1_4bpp60_20261010\play_sa1.cmd` から起動。release SHA `0098322453fe5ea231e39a237bcf7b603764c70b6515b89b2b8be91594d844ad`。旧公開ROMe5e4741は履歴。道中1900field/1750logic/1743表示/147画面一致・2field遅れ8回、ボス1900/1748/1741/147・遅れ9回、反転四辺fixture120画面一致。固定map一式10試験を `results/20261010_fixed_map/` へ保存、zip SHA `a351758ad1c263e79e5d5995ae7886b2a82ca904ab36139929779ac7800a621a`。

固定配置はCHR二面byte0000/6000、共有BG1map BC00（有効BC40..C1FF）。遠景map C200/CA00、自機C400..C77F、草を残余へ移し、遠景・草126tile全byte維持。毎フレーム1472Bのmap転送を省く一方、二世代前の占有領域も送って消す。`--contiguous-chr-dma` は外す。`--redraw-no-history` で未使用の旧packet640B保存を省略し、`--bullet-resident` で連続敵弾のI-RAMコード再コピーを省く。左端の実行時scanは15566kernel/474877位置一致だが地面爆発が遅く未採用。

現行releaseの連続捕捉 `movestress_detinput_captureburst_fixedmap_resident_v1_tracepalette` は800field/651logic/644表示/168画面一致。遅れ8回中7回は世代542..551のCHR約10..11KBが原因。前回と全く同じtileは256..544Bだけで、全面pixel比較の費用に見合わない。次は未commitの `--fixed-map-delta`：現在占有領域だけCHRを送り、消えたtileは共有mapをtile0へ変更する。map更新はflip時のみ、差分list/full-mapはWRAMの各recordが個別所有。初回v1は表示切替の期限超過で失敗、費用予約を増やしたv2を試験中。試遊releaseは変更しない。user Mesen PID70064を停止しない。ビルドROM/LBLは試験とPython画素照合の完了まで変更しない。

## 過去の中間点（2026-10-10、56d4265）

独立分岐へ `56d4265` をpush済み。**60fps未達、active goal継続。公開ROMはe5e4741のまま。** 敵弾6/7/8/37の透明形状651種類を色と分離して共有コード化した。コードbookは51,018BでC3へ置き、元の起動時PPU画像を23,433Bへ可逆圧縮しC2後半へ移した。素材・縮小寸法・反転を維持。ROMの実命令・99,095行・786,516word・96,659 clipを静的照合。四辺fixtureは120画面一致。

v6は全幅および左だけclipの行をC3から直接実行し、右clipだけI-RAM0500へコードをコピーする。独自07D0のJML gateをJSLで呼ぶ（07F0の既存stubはRTS終端なのでJSLで呼ぶとstack破損する）。期限を2走査線早め281として実際の非表示時間内を検査。道中1900field/1736表示/146画面一致、ボス1900/1709/146。初表示151fieldなので起動90fieldの従来版とは単純な枚数比較をしない。v5 IRAM版は道中1800/1622/145、ボス1800/1615/144。8試験を `results/20261010_bullet_shapes/`、zip SHA `46e94e1d9715f2a3384be8869aaffae6c518e658bec61a582580995e68e1af6c` へ保存。v6 ROM SHA `e9032d62275e024236bde27c21216f9bb229130bf6b2681eba1c6b5e4d232ee4`、snapshot `build/sa1_game/bulletshapes_v6_build/`。

通常のinputPolled入力は起動時間差で最初のjoyreadが変わり、世代1からpacketが違う。比較用scenarioに `detinput` を含めると `_fx_read_input` の復帰時にlogic%240に応じた同じ入力を注入する。v6 deterministic道中1900/1734/146、2field遅れ16回。従来opaque8の同入力試験はfield669/line22で実際の非表示時間外DMAとなり失敗。現在は従来版にも `--dma-guard-lines 2` を加え、1900fieldの `movestress_detinput_bulletopaque8_guard2_tracepalette` を再計測中。ROM/LBLはその完了まで変更しない。

次は未commitの `--fixed-map` を検証する。24KiBのCHR二面をbyte0000/6000に置き、BG1固定mapをBC00へ。表示されるmap BC40..C1FFと、遠景map C200/CA00、草OBJ、自機OBJ C400、地面D000..E8EF/F000..FFFFを重複なく配置する。遠景・草126tileは配置前後で全byte一致。現行方式から毎フレーム1472Bのmap転送とSA-1のmap生成を除けるが、同じVRAM面の二世代前の占有領域も送って消し残しを防ぐ必要がある。現在は実装のみ・ROM未ビルド/未検証。固定mapの転送先は自然tile位置であり `--contiguous-chr-dma` を使えない。ユーザーMesen PID70064を停止しない。

## 過去の中間点（2026-10-10、ff8c0e3）

独立分岐へ `ff8c0e3` をpush済み。**60fps未達、active goal継続。公開ROMはe5e4741のまま。** `10e85ed`で4面CHR＋共有mapの5試験を保存（長道中1688/1800、ボス1676/1800、各146/145画面一致）。従来最良1689を超えず不採用。`ff8c0e3`では描画命令の準備だけのSA-1移行7試験と敵弾合成5試験を保存。ROM実行・内部RAMコード・内部RAMコード＋配列とも長道中1683/1800、最後のボス1669/1800。移行対象はOBJ除外・安定ソート・カラー弾寸法変換・コピー。ゲーム更新・自機OBJは本体に残した。内部RAMの同じアドレスへ後続JITも載るので、ソートcallbackはprepare..finishedの間だけ有効にする。配列版952Bを0300..06B7へ配置。結果は `results/20261010_packet_offload/`、zip SHA `53eedf9655976804a88b6ec796a4a6084f4c01e922c3f70dd3d1b3c24073da30`。

敵弾の透明マスク計算をnibble零検出に変え、65536通りで一致。道中1689/1800。完全不透明8wordの展開コピーを追加すると1690/1800・146画面一致、反転/色/縮小/四辺fixtureも120画面一致。結果 `results/20261010_bullet_mask/`、zip SHA `8cbacab0847c00785f66f0d7d8891f4b3130e17759d8d6d3f0668e57e6bca7e0`。平均・一部の更新だけで60fpsとはしない。


## 過去の中間点（2026-10-10、a5a59e2）

独立分岐へ `a5a59e2` をpush済み。**60fps未達、active goal継続。公開ROMはe5e4741のまま。** 低・高byte分離マップの4試験を保存した。`--split-map-dma` は800/704枚/129画面一致、1800/1686枚/146画面一致。`--split-map-mvn`追加は800/704/129、1800/1688/146。既存最良1800/1689枚を上回らず未採用。各VRAM面の旧high=25範囲と新範囲の和を転送し、旧25から24へ戻るタイルも修復する。MVN版はROM番号列からBWへコピーする。原画像・生バッファは維持。証拠は `results/20261010_split_map/`、zip SHA `cc0203ebe4f09554fe44a1889acd43bfc8b660c8339e117d7a7efef8d4134379`。MVN版800のPython検証中にgenerator already executingが出たため、同じ保存データ・ROM・ラベルで全129枚を再照合した。画像一致を確認済み。


## 過去の中間点（2026-10-10、5b96551）

独立分岐へ `5b96551` をpush済み。**60fps未達、active goal継続。公開ROMはe5e4741のまま。** 走行中の試験はない。現在ROMは従来最良の引数へ `--prefix-table --dirty-iram` を追加した安全修正版費用表で、SHA `9f53a0f0a79e75062f4615cbd69c84060a37d48c3bd453658c4c29748c430c02`。1800field/1685枚/146画面一致・2field遅れ26回で最良1689枚/22回を上回らない。証拠は `results/20261010_map_probe/`。初回は計測専用MesenCore.dllの0xc0000005（Windows Application Errorで専用exeパス確認）で完了JSONなし。同一ROM再実行は正常完了した。ユーザー用Mesenは操作しない。

`tools/analyze_sa1_map_transfer.py` は保存VRAMを読み、低byte736Bと高byteの更新範囲を計算する。先頭120世代は全捕捉・highが全て24のため、736B削減できる余地を確認。後半は60世代ごとの捕捉なので旧ページ状態をunknown扱いにして削減量を出さない。重い捕捉画面ではhigh=25の範囲最大398B。低・高byteの別配列生成とPPU転送はまだ未実装。旧ページの高byteが25だった範囲を24へ戻す必要がある。

別の未実装候補は4×12KBのVRAM面。各面のmapを末尾2800へ置き、CHRをtile0透明・1..319動的とし、map末尾の非表示8行（2E00..2FFF）の16tileもCHRへ回すと335動的tile。道中の実測最大325tileを上回るが全場面の上限・残りC000..FFFFの16KBへ地面6384B、地面map4096B、遠景2048B、近景1984B、player896B、遠景mapの実使用256B等を再配置できるかは未検証。遠景mapは64列32行のうち24/25行だけ読むので、未使用部分へCHR/OBJを置く現行手法を維持する。4ページのCHR baseは0/3000/6000/9000（4KB境界）ならPPUのbase制約を満たす。現行map0800/CHR1000..3fffを単に4面へ広げる案は64KBを超えるため不可。

次は従来最良（費用表・compact-gameなし）へ戻し、まずマップ低・高byte分離を試す。raw+6040..631F=736B low、6320..65FF=736B highなら現在1472B領域内で収まる。prefix費用表は6600..66BF、追加メタデータは66C0以降が候補。CPUが転送先VRAM面を選ぶ時点で、旧high範囲と新high範囲の和を計算して実転送量へ反映する必要がある。まだコード変更していない。

## 過去の中間点（2026-10-10、54566d8）

独立分岐へ `54566d8` をpush済み。**全体60fpsは未達、active goal継続。公開ROMはe5e4741のまま。** 新しい比較証拠は対象repoの `game/sa1/v001/results/20261010_compact_game/`（11試験、zip約25.7MB）。現時点で走行中の試験はない。現在のbuild ROMは比較用の遅いゲームSA-1移行版であり、公開へ反映しない。

`--compact-memory` と `--sa1-game-compact` を実装した。前回の「C3と02:8000が空き」という候補は誤りで、C3は起動時PPU画像、02:8000はcompiled-groundを格納していた。最終配置はゲームCODEを既存C1共有、RODATAを02:8000へ複製、本体WRAMもRODATA8000/BSS6000/COLORBSS2000へ移す。SA-1は2225=1Bで6000..7FFFをBW43:6000へ対応させる。固定scratchは7800..7AFFへ移し、DP退避5000/5100、入力5200、C stack7C00、hardware stack7FFF。ゲーム状態だけ複製し、raw7面を維持する。音声イベントとソート用リストはアクセス可能なBSSへ移した。stack境界の検査値・C stack復帰・SA-1の本体演算器書込を検査する。ボス爆発の高さ計算は本体乗算器へ触れない同値計算へ置換した。

起動時PPU画像を23,433Bへ可逆圧縮してC2後半へ置き、C3は地面生成コードへ転用した。地面コードの呼び先も変更。元の02:8000ゼロ消去元を03:F000へ移し、零1KBの維持をROM生成後にassert。これを移し忘れた初期試験の576B不一致も保存した。起動は約64field遅くなるが画素は維持する。配置のみ変更版は800field/641枚、初表示154、画素128枚一致、2field遅れ6回。以前の初表示90の705枚版と表示開始後の遅れ回数は同じ。

SA-1ゲーム＋期限4行確保は800/616/128、CPU費用表＋dirty-iramで608/128。本体IRQをWRAM実行する `--game-irq-wram` は609/128。ROM上でゲーム完了をspinする代わりにWRAMでWAIする `--game-wait-wai` は620/128、ゲーム更新平均3.13→2.32ms。世代別の描画命令は配置のみ版とそれぞれ622/614/615/626世代完全一致。初期SA-1ゲームは表示切替が非表示を越えた。期限4行確保でも費用表FastROM IRQのボス戦で26行まで遅れ、失敗扱い。停止まで135画面は別に画素比較済み。

WRAM IRQのボス長区間は1800/1317/139、WAIでは1800/1406/141。WAI版の表示間隔1field1172回、2field225回、3field6回。色・反転・縮小・四辺clip fixtureは313field/120枚全一致。WAI最終ROM SHA `df8a32666241be15eaa261bb4a83437bb52f65d0e9ebbbd85fccb42374c395bb`。raw7面を保っても、SA-1でゲーム更新を行う構成は従来最良を上回らない。ROM競合の寄与は推測を含む。全体最良は引き続き前回の `movestress_directsparse3_opacity_long_tracepalette`、1800/1689/146、2field遅れ22回。最良にはcompact-memory/SA-1ゲーム/費用表/dirty-iramを含めない。

次は従来最良へ戻して転送量を削る候補を検討する。未実装の候補は毎表示1472Bのマップを低・高byteへ分離し、高byteの24/25の変化範囲だけ送る方法。動的tile IDは非透明tileの走査順に増え、high=25となるのはID>=256なので、前回の同VRAM面のhigh=25範囲と今回範囲の和を修復すれば高byte全送信を省ける可能性がある。ただしSA-1での分離費用が追加されるため、map生成時から2配列へ書く方式・2tile一括書込等の費用も検討が必要。CC95で生BWを読むこと、2115/2118/2119の増分方式、prefixでCHRのみを送った後のmap再開、3ページそれぞれの旧high範囲を正しく扱う。まだ実装していない。元の素材・表示領域・描画世代は変えない。

ROM/LBLはMesen実行・画素比較中に変更しない。user Mesen PID70064は停止しない。新しい別リンク・BW40全複製の再実装を繰り返さない。build_command.txtと比較JSONを正本にする。

## 過去の中間点（2026-10-10、f1389c4）

独立分岐へ `f1389c4` をpush済み。**全体60fpsは未達、active goal継続。公開ROMはe5e4741のまま。** 新しい比較証拠は対象repoの `game/sa1/v001/results/20261010_idle_bullet/`（14試験、zip約31MB）。元の画像・色・輪郭は維持する。この時点で走行中のテストはない。

現在の長区間の最良は `movestress_directsparse3_opacity_long_tracepalette`、1,800field/1,689枚・146画面一致、表示間隔2fieldが22回。SHA `f08c1564011b8948cf6c190150e3c60c8f0870ed444d2daa23226821f9b7f6ec`。従来prefix-fastromだけの1,681枚/30回の遅れより改善したが、60fpsとはしない。基本はraw7面・VRAM3面のdirect-sparse、prefix-fastrom、展開DMA、IRQだけFastROM、全左端hint、bottom-slack、bullet-words、aligned/exact dirty等。追加は `--idle-clear --bullet-left-fast --bullet-opacity --contiguous-chr-dma`。費用表とdirty-iramはこの最良版には含まない。

`--idle-clear` はBW43:07A0の7word busyを本体CPUが公開し、SA-1待機中に空き面の占有帯を消す。平均消去1.5→0.4msだが重い連続描画中には待機時間が少なく、単独の長区間は1,682枚。左にはみ出した敵弾は端を抜けたら高速ループへ戻す。`--bullet-opacity` は圧縮行ヘッダ2Bへ4画素wordの不透明判定16bitを持たせ、余分な16word以降は通常マスクへ戻る。色・反転・寸法・四辺clipの120画面を照合した。連続CHRはまとまり先頭だけVMADDRを書き、途中再開時にも先頭を再設定する。32/64B隙間の結合は800field/704枚で改善しない。

部分転送の線形選択は平均約1ms・最大1.9msを使う。SA-1累積費用表で二分探索を約0.3msにする版、本体CPUが収集済みWRAMから累積表を作る `--prefix-cpu-table` も実装。しかし初期費用表はIRQ内で本体除算器を使っていたので、ゲーム処理との競合を避けROM表引きへ修正した。検証器はIRQ内4202..4206書込で即失敗。修正前の費用表3試験は `performanceComparisonEligible:false` として速度比較から除外。修正後CPU費用表+dirty-iramは800field/701枚・129画面一致、SA-1最大21.664msで全体は改善しない。現ROM SHA `fcf20d2b0a069b9c7f68d347df06288b82e9bd90b711ad0596d5e69e2b468947` はこの修正後版。全5,992境界・4,998kernel/140,509左端clipを再照合済み。

次はゲーム処理分離のメモリ配置を小さくして再検討する。旧 `--sa1-game` はBW40の64KB全複製でraw7→5面となり800field/669枚だった。未実装の候補は別リンクのSA-1ゲームコードを空きC3（physical430000..43FFFF）へ、近いRODATAをbank02:8000（physical010000..017FFF）へ、BSSをSA-1の6000..7FFF BW窓（2225=1B、BW43:6000..7FFF）へ置く構成。ゲームのDP保存はBW43:4000等、C stack7C00/hardware stack7FFFとしraw7面を保持する。別リンク・再配置、出力shadow、原ゲーム動作、stack深さ、RODATA容量の監査が必要。まだ着手していない。ROM/LBLは検証・照合中に変更しない。user Mesen PID70064は停止しない。

## 過去の中間点（2026-10-10、996f992）

独立分岐へ `996f992` をpush済み。**全体60fpsは未達、active goal継続。公開ROMはe5e4741のまま。** この時点で走行中のテストはない。比較証拠は対象repoの `game/sa1/v001/results/20261010_compact/` に集約した。以下の古い「走行中」は過去の中間状態であり、現在の状態ではない。

通常二面転送の長区間の最良は1,800field/1,678枚・145画面一致（IRQだけFastROM、全左端hint、展開PPU DMA、bottom-slack）。表示間隔2〜3fieldが残る。SA-1へ転送一覧の生成を移す `--fallback-sa1` は800field/696枚・129画面一致。入口の16bit即値指定不足による初期版の破損も保存した。`--pixel-delta` は698枚・129画面一致だが重い場面で比較に7〜12msかかり採用しない。

実packet1,684世代の最大非透明325tile、透明32Bとmap1,472Bを含む11,904B。理想容量モデルではVRAM三面で先行転送可能だが、描画・CPU変換費用を含めた実測では未達。`--vram-prefetch3` はVRAM byte0000/4000/8000の三面、map0800、CHR1000以降、透明128番、動的129..511番の383tile上限。固定BG2後半を6000→4000へ移した。CPU変換版800field/690枚・129画面一致。手動転送pumpを追加しても690枚。次描画依頼後へ変換を遅らせる `--defer-stage` と非表示中の遅いflipを許す `--late-flip` は683枚・129画面一致で改善しない。元PNG・縮小・色・輪郭は変更なし。

部分DMAの32B丸め後に0Bとなる実バグを修正。0指定はSNESで64KB転送になるので丸め後ゼロなら延期する。検証器には実420Bのゼロ長、固定BG2 CHR上書き、実2107切替のblank確認、三面mapからの全画像復元、入れ子IRQ時間集計を追加。失敗例は証拠zipのfailedへ保存。現在ROM SHA `1836b70c997e7b6c362d8ee9a266b27230e86b0dae6722eded80a4f9d3122ef6`、三面CPU変換+pump+defer+late版。全5,992境界・4,998kernel/140,509左端clipをこのROMから再照合済み。

次は本体CPUからゲーム処理をSA-1へ移す試作。本体CPUにゲーム・変換・PPU転送が重なるため。候補設計はBW40へゲーム状態を分離してraw面を7→5、SA-1 IRQでC1コードを実行、DPとhardware stackを切替、出力のみWRAMへ戻す。SA-1は本体I/O・WRAM7Fへアクセスできないので入力・ground・far ROM表・divisionの監査が必須。まだ未実装。CODEはFED7付近まで使い、追加helperはGSUへ置く。検証中にROM/LBLを変更しない。user Mesen PID70064を停止しない。

## 過去の中間点（2026-10-10、6ae4a91）

独立分岐へ `6ae4a91` をpush済み。**全体60fpsは未達、active goal継続。公開ROMはe5e4741のまま。** 新しい比較証拠は `game/sa1/v001/results/20261010_compact/`。SA-1だけで透明タイルを詰めるdenseは800field/672枚で遅い。SA-1で位置表だけ作り、本体CPUがキャラクタ変換DMAで必要タイルをWRAMへ並べる `--cpu-pack` は800field/692枚・129画面一致。CPU全体もFastROMにすると短い試験は693枚だが、1,800fieldでは1,628枚・145画面一致で従来1,675枚より悪化。CPU全体のFastROMは採用しない。

大きな草・木（asset0/3、幅90以上）の左端は、元のcompiled行コードの途中命令へ接続する `--left-hints` を実装。初期Aも保存し、I-RAM0300..06FFの専用ループで実行。1,114kernel×35,237clip位置の独立命令照合、実ROMの左端fixture120枚の画像一致を確認。5,992aligned境界表も一致。原素材・縮小・透明形状は変更なし。

検証器はIRQの管理処理の終了時刻ではなく、420Bの実DMA開始、VRAM/OAM DMA完了、210Bへの実ページ切替書込みでforced blank/VBLANKを確認する。初期cpu-packはHDMA表示開始後のページ変更をこの検査で検出し、失敗例としてzipへ保存した。予約を増やした後の結果だけを採用。cpuStageJobsは現commitでは最後の1472Bマップ転送を含まないことに注意。

現在走行中は `movestress_cpupack_sa1map_long_tracepalette`、1,800field。CPU本体はWRAM、IRQとステージ変換はC1 FastROM。ビルドは従来deep7の全フラグから `--unroll-ppu-dma` を外し `--cpu-pack --irq-fastrom --bottom-slack --dirty-iram --wide-clear-min 64 --left-hints` を加える。`--fastrom-cpu` は外す。ROM/LBLを試験中に変えない。IRAM配置・CPU stagingなど詳しくは対象ソースとcompact報告を見る。全体60fps未達のまま作業を終了しない。

## 過去の中間点（2026-10-10、29dc82e）

専用分岐へ `29dc82e` をpush済み。**全体60fpsは未達。active goal継続。公開ROMはe5e4741のまま。** 敵弾の反転は圧縮した全横縮小データで対応した。native codeを16KiB/65KiBへ保持する方式も試したが、接近する弾の寸法が毎フレーム変わりcold生成が多い。弾だけを4画素単位の直接合成にすると、道中1,800field/1,675枚、表示間隔1fieldが1,647回、2fieldが15回、3fieldが10回へ改善した。SA-1最大27.055205ms。4弾種×3色×4反転×5寸法×四辺clipの120枚と道中145画面が独立参照に一致。原PNGは変更なし。証拠 `results/20261010_bullet_words/`。

現在未commitの `--dense-tiles` は、非透明8x8タイルだけを各raw BW面の先頭へ詰め、BG1マップで戻す試験。非表示の先頭8行（1KiB）が余白になり、同じ面で安全に詰められる。元rawは `sa1_draw_done` で保存し、最終VRAMはマップで復元して照合する。詰め直した先頭範囲も次回消去履歴へ追加する。マップは各raw末尾+0x6040へ1472B保持し、端guard32Bを避ける。BG1属性は元と同じ0x2400、空文字32番、非透明文字33番から。マップは初期化ROM→BW DMA、残りは同一bankの直接読書き。`dense_game.s` 全ホットループはI-RAM0300..06FFへロードする。SA-1 worker0200..02CEとCC02E0は保持。描画後だけ上書きし、次sprite/jobで弾・端用コードを再ロードする。

CC幅8px（2231=01）で詰めた文字を送り、その後CCを停止して生マップを送る。CHRは裏ページ、マップ更新は一括で収まる時のみ。最初のdenseは800field/565枚（127画面一致）、同一BW直接処理は639枚（128画面一致）、ゼロマップ一括化・不要INY除去で673枚（129画面一致）。詰め直し費用は重く、全体60fpsはまだ未達。元の通常方式で重い生成番号546～549も約11.4～11.7KBの転送として残る。

現在の試験は `movestress_dense197b_tracepalette` 800field。dense専用にV-IRQを197行へ早めるが、forced blankと実転送は203行以降を維持する。Hカウンタも使うDMA予算、小flip予約1300units/player2400unitsは未検証。先の200行IRQ版はfield650/生成546でIRQ終了が23行となり失敗した。未検証予算を元の方式や配布ROMへ混ぜない。テスターはDMA終了とページ切替終了時の実際のforced blankもassertする。ROM/LBLは走行中に変えない。

denseのビルドは以前の全フラグへ `--bullet-cache --row-dirty-exact --bullet-words --dense-tiles` を加え、`--unroll-ppu-dma` を外す。通常4画素版はdenseを外しunrollを戻す。未commitは `dense_game.s` / `sa1_dense.py` / builder / tester。検証・最適化を続ける。

## 過去の中間点（2026-10-10、13966f3）

専用分岐へ`13966f3`をpush済み。active goal継続、ゲーム全体の60fpsは未達。公開ROMはe5e4741のまま。途中比較19件の証拠は`results/20261010_prepare/`へ保存した。転送記述子の隙間結合、IRQを200行から準備・203行から転送、CPU準備の前倒し、安定連結リストソート、端退避の内部RAM専用コード、地面HDMA表生成の専用化、整列境界の直接反映、広い帯の1KiB一括消去を実装。空帯で獲得していないDMA使用権を解放していた点も修正。PPU転送24記述子分を展開し、IRQ専用一時変数を使う。

SHA `b96563957e06e46e7fdb2910a12bd2a94a234900fb870e19d81b7343e53ac128`はボス移動・射撃1,800field/1,710枚、評価1,707間隔すべて1field、146画面FB/VRAM/OAM/CGRAM/地面表一致。単発SA-1最大19.73435ms、7枚保持の遅延で平準化する。ただし長い道中は870枚後にSA-1が停止。PC00:839Cの`unsupported_hflip`へ入り、敵弾flags=$22による上下反転が未対応だった。ボスだけの成功を全体の成功とはしない。

反転弾だけ元のQ8.8 samplingで画素描画する修正は、独立fixtureで一致したが道中1,800field/1,302枚、SA-1最大84msで遅い。現在未commitの`--bullet-cache`を検証中。敵弾6/7/8/37の全横縮小・色・左右反転・横位相をROMの圧縮行へ保存し、上下反転は元のサンプル行を選んでBW43:4000..7FFFの16KiBへnative codeと11B行call chainを生成・保持する。64エントリの索引はBW43:0400..05FF、世代/カーソルは0700/0702。ROMは8MiB内、payloadEnd=8106060、FF索引55,081B。全5,992境界表は最終ROMから一致確認。fixture120枚で4弾種×3位相×4反転×5寸法・四辺clipを二巡照合して一致。ただしcold cacheで4枚の大弾を出すfixtureは最大84ms。実道中の`movestress_tracepalette_bulletcache`1,800fieldを検証中。ビルド中・検証中にROM/labelsを変えない。

現在のビルドは前回コマンドに`--stack-band --early-request --list-sort --small-edge-jit --compiled-ground --unroll-ppu-dma --wide-clear --bullet-cache`を追加する。`tools/sa1_game_compiled.py`、`tools/sa1_bullet_cache.py`、`game/sa1/v001/bullet_cache_game.s`が新方式。通常敵弾の既存コンパイルドを圧縮行へ置換して容量を確保した。元のPNGは変更していない。`test_sa1_game.py`はmanifest/labelsとfinal_stateも保存し、21行を越える転送終了を禁止する。最初の反転fixtureは`--presents 120 --frames 1800 --scenario flipfixture_cache_tracepalette`。

次の候補はnative code生成ループをI-RAM0300..06FFへコピーして実行すること。今はROM上から小さい命令を多数実行しておりcold生成が遅い。0200..02CFworker・02E0キャラクタ変換・0700macroJITを避ける。消去用0300のPHD列は消去完了後なら上書きでき、次jobで再ロードする。0500/0600の端退避コードも次spriteで再ロードされる。ロード時はDMA使用権をtryで取り、PPU使用中ならMVNへ退避する。依頼は自律継続であり、未達のままgoal completeにしない。

## 前回状態（00a8973）

専用分岐へ `00a8973` をpush済み。**全条件60fps未達、active goal継続、公開ROMはe5e4741のまま。** 7枚BWバッファの先頭に1KiBの保護領域を置き、移動時の先頭行11B不一致を修正した。遠景はBG2、近景は54個の8px OBJと48〜52px幅のソフト描画を合成し、元画像との独立照合を追加。近景OAMを512水平位置分のROM表へ保持しCPU準備時間を削減した。表はC0の未使用BOOT複製とDEの旧背景表を再利用し、DA〜DDの地面パレットとDFの自機画像を保護する。

**旧865af048...のdeep7計測は無効。** pipeline末尾のBOOT segmentからCODEへ戻しておらず、INIDISP HDMAが別データを参照していた。raw/VRAM一致やfield間隔だけでは実表示を保証できなかったため、速度の根拠から除外。CODE復帰を修正し、実際の2100書込みで非表示期間維持を検査する。証拠 `game/sa1/v001/results/20261010_deep_near/` に無効理由も保存。

修正後c2d081...は移動450field/358枚/123画面一致。ただしボス移動1800field/1317枚、1field977回・2field289回・3field44回・4field4回で未達。現d3640d1c...（OAM ROM表）は短い移動450field/360枚/124画面一致、全て1field間隔。長いボス移動では1800field/1589枚、1field1512回・2field31回・3field45回だが、240枚目でFX側パレットの一色が変わるため**画面検証不合格**。短い成功を全条件達成としない。

直近の主因は転送descriptorが48個を超えた時に全面23552Bへfallbackし、裏面転送に3field必要となる点。描画済みqueueが残るのでCPU不足だけではない。まず小さい隙間をまとめて48個以内へ再生成し、全量fallbackを減らす。CGRAM破損の書込み位置・時刻も追跡中。検証中にROM/labelsを再ビルドしない。SNES版の武器は単一であり別NES版の武器と混同しない。

現ビルド: `python tools/build_sa1_game.py --pipeline --pipeline-direct --pipeline-irq --pipeline-depth 8 --deep-bw --prefill-pipeline --prefill-count 7 --redraw-all --merge-dma --large-edge-cache --triple-bw --fast-dma --linear-shape --cpu-code-copy --cpu-edge-copy --packet-shapes --native-background --native-near --row-dirty --row-dirty-aligned --wait-slots --occupancy --accurate-dma-budget --transfer-mask --front-mask --visible-mask --stack-band`。

## 前の状態（82973f0、deep7初期値は後に無効判定）

専用分岐へ `82973f0` をpush済み。**全条件60fpsは未達、active goal継続。公開ROMはe5e4741のまま。** 縦8位相の圧縮表5992通りを最終ROMから元画像へ照合済み。ボス1200field/1104枚/136画面一致、表示間隔1field1093回・2field7回・3field1回。証拠 `game/sa1/v001/results/20261010_aligned/`。

移動試験の240枚目でraw先頭行11B不一致。stack-bandを外しても同じ。左端・上端にかかるcompiled spriteのindexedアドレスが隣bankへ書く疑い。不可視扱いで検証を緩めない。front-mask初期版は一括転送に収まらない画像で停止するため、裏面全量転送へのfallbackを追加した。末尾の停止も60fps判定へ加えた。

未commit試作 `--deep-bw --pipeline-depth 8 --prefill-pipeline --prefill-count 7`。BW各32K枠の0400/8400から24Kを7枚保持し、先頭1KiBを保護領域とする。43:0000..7FFFはscratch。record0は低byte=bank、高byte=FB offset。占有履歴432000、counter432740、mask432800/2880/2900/2980、BG header433800、8版BG strip434000..7FFF。metadataはWRAM7E:A000、ground水平表と旧boss draw-order表はROMへ移しCPUDATAを2000..9FFFに収める。BW busy7枠、metadata8枠、開始前7枚の描き溜めで約100msの遅延増加。

当時の試作sha `865af0480703ebdec942b4c406d94397e4e9246435132fd1890948a9bb4b1483` の計測は、上述のHDMA segment不備により無効。成功例として扱わない。

## 前の状態（f57b93e）

専用分岐へ`f57b93e`をpush済み。**全条件60fpsは未達、active goal継続。公開ROMはe5e4741のまま。** 背景をBG2へ移し、元の遠景・近景を14行の合成stripとして保持する。8版をBW43:8000..BFFFへ置き、整数横スクロールが変わった時だけ2KiBを更新する。地面の反転共有・VRAM再配置は全2048map要素一致、検証はFB/VRAM/BG2と地面CHR/map保護を確認する。

`--native-background --row-dirty --row-dirty-bands`は不透明輪郭の横範囲を8行ごとにROMへRLE保持する。全1,492寸法は維持、追加RLE13,860B、payload末尾7D5979・FF索引50,977Bで8MiBに収まる。道中600field/514枚・126枚一致、表示開始後の間隔はすべて1field。しかしボスは`--wait-slots`併用でも1200field/1084枚・136枚一致、2field間隔30回が残る。道中一条件の成功を全条件達成としない。証拠`game/sa1/v001/results/20261010_native_background/`。

再現: `python tools/build_sa1_game.py --pipeline --pipeline-direct --pipeline-irq --pipeline-depth 5 --redraw-all --merge-dma --large-edge-cache --triple-bw --fast-dma --linear-shape --cpu-code-copy --cpu-edge-copy --packet-shapes --native-background --row-dirty --row-dirty-bands --wait-slots`。道中の514枚はwait-slots追加前の別hashなので同一ROMの結果に混同しない。

起動時release flag $1E未初期化により最初のSA-1 jobが重複する場合があり、STZ $1Eを追加した。初回全面描画はこの問題を画素検証で見えなくしていた。producerは$0188へ世代を常時送りSA-1は$0198へ開始世代を保存、Luaが実jobの連続性も確認する。背景$0194/$0196も明示初期化する。native backgroundでは全raw FB三面を初期ゼロ化し、初回全面転送を省く。

未commitの次の試作: `--transfer-mask`。消去は三世代の帯状外接範囲を維持し、PPU転送だけを各物体のtile bit集合へ絞る。BW43:6800=current mask、6880=previous、6900=二世代OR。離れた物体の間を送らない。descriptorは24個までで、超える場合は既存帯方式へfallback。`backgroundbandmask`600fieldを検証中。ビルド中・検証中にROM/labelsを上書きしない。ボスDMAが大きい場面が次の焦点。左右移動・武器切替・長時間はまだ不足。

## 以前の状態（a578989）

専用分岐へ`3312524`、`a578989`をpush済み。**60fps未達、active goal継続。公開ROMはe5e4741のまま。** 最良の検証済み構成は下記。道中600field/505枚・126枚一致（2field間隔3回）、ボス1200field/1079枚・135枚一致（2field間隔29回）。条件付きCPU edge MVNとpacket indexごとのshape再利用を追加した。証拠は`results/20261010_pipeline_overlap/`。

`--pipeline --pipeline-direct --pipeline-irq --pipeline-depth 5 --redraw-all --merge-dma --large-edge-cache --triple-bw --fast-dma --skip-far-clear --linear-shape --cpu-code-copy --cpu-edge-copy --packet-shapes`

SA-1へのソート分担は描画完了時だけjob2で行い、ボス72回・全順序一致でも表示枚数は変わらない。FastROM CPU実行は503枚で悪化、開始時三画像の描き溜めは504枚。直接planarの全寸法コードは30.3MBで8MiBに入らない。いずれも採用しない。

`a578989`はVRAM面ごとのdirty世代履歴とS-CPUの別ソートを検証した。適応更新`--adaptive-vram`はBW43:6000以降に二面分の未反映dirty・直近4世代の履歴を置き、短い更新は表示面へ一括、大きい更新は裏面へ分割する。旧試作と異なり43:04C0..051Fへ重ならない。画素一致だが道中495枚・ボス1059枚に悪化。radixは修正後1078枚、全キーbucket初版1035枚、priority別の実在範囲だけを走査する現行bucket1079枚。全ソートを独立した安定ソートで照合した。radix初期1103枚は順序不一致だったため速度根拠から除外。未使用bucketへ前回のheadが残った原因を修正し、検証ツールにも両方式の順序検査を追加した。公開版へ採用しない。証拠`results/20261010_vram_sort/`。

次の作業は**遠景のBG2化**。まだ未実装。Mode1のBG2は未使用、channel7はBG4HOFSへのHDMAでMode1では使われない。遠景14×512は反転共有で64tile/2048B、地面2bpp512tileを上下左右反転共有すると399tile/6384Bで1808B空く。VRAMのCB80..CDFF、CE80..CFFF、E900以降へ遠景tileを分散できる。BG2 CHR base C000、map base C000の64×32とし、BG1で未使用のmap row24..25（C600とCE00）をBG2用に共有する。channel7のTM HDMAで遠景14行だけBG2を表示し、BG2 VOFSは102-ground、HOFSはfar。FX rawからfarだけ外しnearは維持。dirty背景領域は近景の82..91へ狭め、far x変化をraw dirtyに数えない。**skip-far-clearは必ず無効化**（farを描かなくなるので消去が必要）。FB独立参照とPPUの合成画面、地面タイルの反転再配置を検証してから評価する。現在のROM buildはbosskeyrangesの試作であり公開releaseとは別。

## 過去の中間点（2026-10-10 08:15頃）

専用分岐へ `58d16da` をpush済み。**60fps未達、active goal継続。公開ROMはe5e4741のまま。** 最新の検証済み構成は下記。道中600field/502枚・126枚一致、ボス1200field/1078枚・135枚一致。ボスの2field間隔は30回残る。ROM SHA `265cddcd70885c38a3155b3b9468340766c51940341ff2ca8988a35c4497ac42`。証拠 `game/sa1/v001/results/20261010_pipeline_stageclip/`、生成 `tools/report_sa1_pipeline_stageclip.py`。

`--pipeline --pipeline-direct --pipeline-irq --pipeline-depth 5 --redraw-all --merge-dma --large-edge-cache --triple-bw --fast-dma --skip-far-clear --linear-shape`

`--skip-far-clear`は遠景が全byteを上書きする14行の事前消去を省く。SA1 workerの空き29Bに全処理を置けず、設定をBOOTのhelperへ分離した。`--linear-shape`は同じ幅に対応する高さが最大4個しかないことを利用して順に比較する。ボス平均SA1時間11.47→11.16ms程度。順序・色・輪郭は独立参照と一致。

追加の比較と棄却:

- 現在の `--staged-conversion` は **WRAM 7E:A000..FFFFの24KiB一面**。初期8KiB往復方式とは異なり、変換BW→WRAM、PPU転送WRAM→VRAMでBWへ戻さない。地面runs/valuesと未使用ボスdraw_order_base/midをROMへ移し、BSS末尾9FA0、BOOT末尾F3DE付近。描画用DMA排他をPPU期間から外せるが、S-CPUへの追加転送・先行変換のタイミングで負け、道中494/600・ボス1010/1200（126/134枚一致）。既定にしない。
- `--clip-edges --fast-left-clip` は可視幅64px以下の左端だけROM行コードの可視先頭を二分探索する。同じ行コード・curの結果をDP B6..BEへmemo。各spriteでBA=FFFFへ無効化。道中499/600・126枚一致で最良502枚を越えない。BRAnch距離181Bの箇所はJMPへ修正済み。右端は従来の1024B退避方式。
- 表示中のVRAM面を一括更新する試作は、初版38枚目で予算不足の待ち続け、設定費用込み版は240枚目のVRAM不一致で棄却。途中412枚などを性能の根拠に使わない。実装・flagを削除した。
- `pipe_flip`を直接計測する `flipMs` を各presentationTimesへ追加。最大約0.60ms（自機CHR更新含む）、通常約0.21ms。しかし2200予約を900/1900、1500/2400へ下げた二案とも長時間検証でline23越境として棄却し、flag・実装を削除。予約はDMAの見積り誤差も吸収している。`pipe_try_fast_dma`のbytes/32見積りはmaster8.25/B相当だが、実DMAは大口平均8.64/B・固定費込み最大9.0/B付近。切替実時間だけから予約を詰めない。

次に検証する候補は、画面端の退避・復元だけをPPU DMA要求中にSA1命令で代行すること。過去のcpu-fill/cpu-far/code-copyは効果がなかったが、草の端で4ms近いDMA待ちがnative時間へ混ざる例がある。DMA engineと異なる命令経路で待ちを減らせるか、別flagで画素・境界を検証する。未実装。旧メモの「変換済みBWRAMへ先行保持」はハードウェアBW→BW DMA不可のためWRAMへ変更済み。

## 前の状態（2026-10-10 07:50頃）

専用分岐へ `b0928e0`（三画像保持・まとめ転送）、`d28453c`（上端のROM直接呼出しとCPU負荷検証）をpush済み。**60fps未達・active goal継続。公開ROM/launcherはe5e4741から更新していない。** 道中600field/502枚・126枚一致、ボス1200field/1077枚・135枚一致まで改善。道中2field間隔6回、ボス31回が残る。固定field数で進行量が異なるので厳密な同一packet速度比ではない。証拠は`results/20261010_pipeline_buffers/`と`results/20261010_pipeline_tail/`。

有効な途中構成は `--pipeline --pipeline-direct --pipeline-irq --pipeline-depth 5 --redraw-all --merge-dma --large-edge-cache --triple-bw --fast-dma`。`--temporal-sort`も安定順・画素一致を確認したが表示枚数は同じ。上端にはみ出すspriteは、行呼出し列の最初の可視行からROM末尾のRTLまで呼べる。I-RAMへ行列をコピーせず、ボスの一枚が約5.5ms→約2.3msになった。

I-RAM workerは195B（0200..02c2）、CC buffer02e0..02ff、edge guard0300..06ffを1024Bへ拡大、JIT0700..07ef、trampoline07f0。行切詰めfallbackをROMへ移して空けた。退避・復元のDMA排他はchunkごと。三面BW40/41/42の再利用には三世代のdirtyを消去へ使い、PPU二面には二世代だけ送る。前者と後者を同一にすると転送が増える。BW43:0400/0460にraw二履歴、04c0にPPU向け二世代合成を保持。初回は履歴を明示初期化する。

`--fast-dma`は全descriptorが非表示時間へ収まる場合だけ垂直counterの毎回確認を省く。残りbytesをmetadata+34に保持し、部分転送後も減算。96units/descriptor＋bytes/32のrefresh分を見積り、従来の2200/700予約を維持する。収まらなければ32B単位の分割へ戻る。

棄却した探索: `--padded-pipeline`は512px作業面から中央をdirty領域のみコピー。草は約1.7msへ改善したがcopy/wait平均4.7msが加わり464枚/600field。`--cpu-code-copy`、`--cpu-fill`、`--cpu-far`はPPU DMA待ち中に通常命令で小さいコピー・消去・背景を代行する案。個々の画素一致は確認したがボス1050〜1070枚で直接tailの1077を改善しない。条件付きcode-copy初版でAの転送長を戻し忘れた版は画素不一致で棄却し修正済み。`--shape-cache`の2048B BWRAM寸法cacheも1077枚のまま。`bosscpu`という測定はcpu-farビルド失敗後に一つ前のcpu-fill版を測った名前であり、cpu-far評価には使わない。関数内にPPU IRQが入るので、経過時間を純粋な演算費用にしない。packet初期化/sort/copyを分離し、IRQ時間を引いた計測を追加した。

### いま実装・検証中: 先行キャラクタ変換（未commit）

新フラグ `--staged-conversion`（direct/IRQ/large-edge必須）。SA-1が完成したbitmapを、S-CPUのCC DMAでBW→WRAM2180へ変換し、逆DMAでWRAM→同じBW bankの8000..dfffへ保持する。24KiB最大でも8KiBずつ中継できる。PPUへの転送は普通のBW→VRAM DMAとなり、SA-1描画用DMAの223xをVBlank中に占有しない。コードは`game/sa1/v001/pipeline_stage.inc`。collectorがmetadataのsourceoffsetをcompactな8000+cursorへ直す。元のFB0..5fffと世代は保持し、テストのFB/VRAM独立照合を継続する。

WRAM8KiB（7e:c000..dfff）を空けるため、地面のhorizontal_runs8680B＋horizontal_values10368BをRODATA→BOOT ROMへ移す。runsはf:00xxxx、valuesは3byteポインタ[hv],yで読み、色/形/HDMA表の値は変更しない。BOOT末尾e2fe、CPUDATAを2000..bfffに制限しBSS末尾b084。地面の読出しは`rom_ground()`が生成し、既存分岐はそのまま。

PPU IRQではSA-1 DMA要求と223x設定を省く。collectorでの変換はSA-1 idle時にREQを立て、CC15/DDA02e0で変換し、95で止めてREQを落とす。変換がIRQを遅延させた場合は、live counterで表示期間ならPPU処理へ入らずRTIする。SEI中の変換をいつ行うかは今後の最適化課題。現時点は180field/85枚のFB/VRAM一致まで確認し、600field `staged` を実行中。60fps達成宣言禁止。

staging末尾のREQ解除で、8bit LDA #0→REP #20だけではBの上位が残って011Eへ0200等を書き、SA-1が待ち続ける不具合が出た。REP後に16bit LDA #0を入れて修正した。初回ハング時のlogic4/presents2結果は棄却。失敗時テストはstate全項目をfailure_state.txtへ保存する。Mesenにemu.convertToJsonはないのでpairsで書く。

次のアクションは現在の600field試験の完了を読み、同じROMでboss1200fieldを検証すること。ROMがロード済みでもPython終了時のlabels SHAを現ファイルから読むので、テスト中にROM/labelsをビルドし直さない。ビルド失敗後に古いROMを測らないようexit_codeを確認してからテストを呼ぶ。

## IRQ・コピー削減後の検証済み中間点（2026-10-10 07:00頃）

`282bce8` を専用分岐へpush。**60fps未達、active goal継続、公開ROMはe5e4741のまま。** 現在の有効な再現は `python tools/build_sa1_game.py --pipeline --pipeline-direct --pipeline-irq --pipeline-depth 5 --redraw-all --merge-dma`。同じROM SHA `d880ab4d23e177cf259f353be9659fb15cd6268cc9225823865b78dea051226e` で道中600field/484枚（126枚FB/VRAM一致、表示間隔1field455回・2field26回）、ボス1200field/946枚（133枚一致）。証拠は `results/20261010_pipeline_irq/`。既定経路も160field/68枚一致を再確認。現在buildのROMは最後の既定再確認でe5のものになっている。

SA-1 IRQの重要点: S-CPU2200=80で要求、SA-1が220B=80でackしてB1を設定し011C=2で許可を返す。その後**IRQ handlerは直ちにRTIし、DMAを使わないnative描画をPPU転送中も続ける**。DMA_beginだけはREQ011Eが落ちるまで待つ。S-CPUは新要求前に011Cを0にし、前の許可2を誤って再利用しない。DMA_beginの保存P（16bit PHA後の3,s）へI=1をORしてからPLPする。PLP直後にSEIするだけでは、その間にIRQが来てDMAレジスタ競合になり得る。DMA_endでCLIする。S-CPUにはSA-1描画完了IRQも送り、mainの待ちをWAIへ変更。

metadata/地面表は最大五世代。三つを超える地面表はCOLORBSSへ追加し、最初に明示clearする。WRAM→BW packetは2180逆方向DMA、BW→WRAM descriptorは通常方向DMAへ変更。検査用packet二重コピーを除きLuaで保存。自機OAMはmetadataから直接DMAし、24B＋high8Bも検査する。横帯descriptorの近い隙間をまとめ、32B単位で時間の端へ分割する。時間予約は未表示切替2200units、既に切替済み700units。これより小さい予約では走査線23・24へ超過したため採用しない。

`--redraw-all` は消去をdirty bandに限定しながら、全スプライトを元順序でnative描画する。変更領域外でも全体を同じ順序で描き直せば前後関係が壊れず、画素照合で一致した。`--clip-edges` は画面端だけ行コード切詰めへ戻す案で459枚/600fieldと遅い。`--transfer-tiles`（clearはbandのまま）は462枚で遅い。保持しているが既定へ採用していない。`bossirq`という旧scene名は、旧テストが`scenario=='boss'`しか判定しなかったため**通常道中でありボス評価には使わない**。現在は`scenario:match('^boss')`。本表bossは正しいボス試験。

物体別計測を追加（objectJobs）。重いのは画面端の草asset0、幅111×高さ59、中心X=-48など。最大12.83ms。一方、重い道中の実際の隠れ画素は約2〜20%で、全隠れcommandも少なく、遮蔽だけでは本命ではない。端の退避はIRAM256Bに合わせてheightを細かいchunkへ分け、各chunkで両端行も退避するため、DMA設定回数が多い。

次の具体案（未実装）: **512px幅の作業FB40（stride256、中央表示byte offset64）＋256pxのcompact snapshot41/42**。以前の全中央コピーではなく、転送descriptorが示す二世代分の変更だけをcompactする。native草のはみ出しを左右128pixelの余白へ捨て、端の退避を不要にする。素材は変更しない。

- 新flag例`--padded-pipeline`は`--pipeline`必須、`--pipeline-direct`/`--merge-dma`/`--transfer-tiles`と排他（snapshot copierがdescriptor一つ=8行を前提）。CPU側は既存非directのBW41/42へ渡す。
- compiled macro chain生成の`dy*128`を`dy*256`にし、cache key/ファイルもstride別にする。native row kernelそのものは同じ。全1492寸法は維持。payload<=7E0000を再確認。
- rendererのrowbase/背景baseはy*256+64、clear tile baseはtileY*2048+64、行increment256、dirty tile indexはphysical rowbase>>9 &FFFC。背景のbg_boundsも>>9。128という表示幅定数は変えない。
- fast spriteBaseはtop*256+floor(left/2)+64。画面に見える幅<=128のspriteは左右余白に収まり、edge cache不要。幅最大はasset1=136、他は0=114、2=80、3=110、5/39/40/41=128等。opaqueBBoxのleft<-128pxまたはright>384pxなら、既存の行コード切詰めfallbackで可視0..128byteだけを描く。
- `pipeline_sa1.s` snapshot: descriptorのtile-linear offsetからleftByte=(offset&03FF)/8、dest=(offset&FC00)+leftByte（stride128）、source=2*(offset&FC00)+64+leftByte（stride256）。8行をBW40→IRAM0600→BW41/42、source+=256、dest+=128。排他helperは維持。snapshotはunion2 dirty、作業FBは直前画像なのでclear/renderは現dirtyだけ。
- native codeの0200..05C0、CC05C0、scratch0600、JIT0700分離を維持。Luaのprefetch時保存FBはcompact済みなので通常256pxとして照合する。

## 先行描画の検証済み中間点（2026-10-10 06:30頃）

専用分岐へ `8c95d5d` をpush。**60fps未達、active goal継続。公開ROMはe5e4741のまま。** `--pipeline` はBW40へ描いた結果の差分をBW41/42へコピー、`--pipeline --pipeline-direct` はBW40/41へ交互に直接描画する実験。直接方式は描画前に二世代分の変更領域を合成し、前々回の面から現画像を作る。画像コピーを省く代わりに再描画が増える。

`pipeline_cpu.inc` が512B×3のmetadata、画像BWのbusy、先行転送先CHRを管理する。OBJ・地面HDMA参照先・packetを同世代として保持。一度のVIRQ203で最大一回だけ表示し、余った非表示時間で次の画像を未表示CHR面へ転送する。地面bufferの再利用待ちは`_fx_build_ground`入口へ移し、他のゲーム処理を先行する。色・形・物量は変更していない。

同じ直接方式ROM SHA `894d6801365e9b357cf7001930ce6cf43af90395608512cb92c3b7d401e5feb3` で道中600field/444枚・ボス1200field/830枚。独立参照とのFB/VRAM一致は125/131枚。道中表示間隔1field380回・2field59回・3field2回、ボス1field557回・2field264回・3field6回。道中SA-1最大33.534ms、ボス29.496ms。既定版より道中が遅く、ボスは進行量が増えたが、固定field数比較はpacketが異なるため厳密な速度比ではない。証拠は`results/20261010_pipeline/`、生成`tools/report_sa1_pipeline.py`。既定経路も160field/68枚の全画素一致を確認。

重要な修正・罠:

- S-CPUからSA-1 DCNT($2230)は書けない。SA-1側がB1を設定し、011C=2で変換DMA許可を返す。011Eが要求。共有DMAレジスタの競合を防ぐ。
- 協調方式では大きいnative call chain中に許可が返せずPPU転送開始が遅れるため、現在最大8行のchunkへ区切る。I-RAM worker <=05C0、CPUキャラクタ変換buffer05C0、edge cache0600、JIT0700。
- 解放待ち中にDMA待機へ入った際、job0を見てdoneを下げただけでは、S-CPUが次job1を書いて解放を見失う。DP1Eへ解放状態を保持し、外側wait_releaseが必ず次jobへ進む。
- 各descriptor直前に213Dの9bit垂直カウンタを読み、次fieldの22行までの残量を170 units/line（master/8）で計算し、表示切替等2800unitsを予約する。固定予算だけではIRQ遅延を吸収できない。
- **Mesen callback内の直接Lua assertだけではエラーがPythonへ伝わらない場合があった。** `cb()`でpcallし、failure.txt＋emu.stop(1)をPythonが確認するよう変更した。世代欠落・順序違いと非表示期間超過の検査を強化。従来からPythonで行う画素照合は独立して有効。
- Lua `f:write(assert(value,'message'))` はassertが二引数とも返すため、画像末尾へmessageまで書く。`f:write((assert(...)))` とする。

次の有望な改善は、DMA排他をscanlineごとから8行程度のまとまりへ移すこと、SA-1 IRQでnative実行中も短時間で転送要求へ応答すること。S-CPU2207/8へSA-1 IRQ vector、SA-1側220A=80、S-CPU2200=80で要求、SA-1側220B=80でack可能（Mesen source確認）。DMA critical中はSEI、終了でCLIし、IRQ handlerはレジスタ全保存とDBR/DP0化が必要。まだ未実装。既定ROMを勝手に新実験版へ更新しない。

## 最新の中間到達点（2026-10-10）

専用分岐へゲーム統合ROMを追加し、`e5e4741` までpush済み。元のFX2/4bpp30分岐は変更していない。起動は `D:\HomeBrew\MonoSHSA1_4bpp60_20261010\play_sa1.cmd`、ROMは同フォルダ `releases/MonoSHSA1_4bpp_experimental.sfc`。**動く中間版であり、60fpsは未達・作業継続中。active goalをcompleteにしない。**

現行ゲームでソフトウェア描画に左右・上下反転が使われていない条件を明示し、全1,492寸法・色位相・横2画素位相をコンパイルドコードとして8MiB ROM内へ保持。自機OBJの反転は従来通り。単純な全反転・全横位相の汎用コンパイルド展開23.8MBとは区別する。正常な向きの実ゲーム用コードは約5.73MB、連続行の呼び出しコード込みのpayload末尾8,201,045bytes、FFバンクはlookup専用。`tools/sa1_game_compiled.py`、`renderer_game_macros.s`、`fast_game.s` が現行経路。

SA-1で差分矩形をタイルに丸めて描画する。512px幅の余白バッファから256pxへ集める処理が最大約6msかかったため、256px幅へ直接描く方式へ変更した。画面端から隣の行へ書く部分だけをI-RAM $0600..06ffへ退避・復元し、行コード用$0700..07efと分離する。近景も生成コード化。キャラクタ変換DMAの最大幅は32タイル＝256px（MesenのSharedRegister 2231でも5にclamp）。PPU二面には直近2フレームの変更を送り、非表示期間内に切り替える。転送の開始期限は量とdescriptor数から保守的に求める。S-CPUでは同じ地面HDMA表の再生成を省く。

現行ROM SHA256は `50056e02049e39f49b95f3efc281b369eff1cd611abe6727e56a06efd977b1c4`。同じROMで道中600field、ボスfixture1200fieldを検証。完成FBと独立した画像合成、さらにSNES形式へ変換した参照と転送済みVRAMを照合し、道中125枚・ボス131枚が一致。完成画像数は道中466・ボス785、表示間隔は道中1field424回／2field37回／3field2回、ボス1field495回／2field252回／3field35回。起動初期を除くSA-1最大時間は道中21.451ms、ボス21.930ms。S-CPUのフレーム処理は道中平均7.057ms・最大11.041ms、ボス平均9.669ms・最大14.094ms。**平均時間だけで達成扱いしない。**

以前の0field間隔を「同じ表示field内の重複」とした解釈は撤回する。MesenのendFrameは走査線225で発生するため、203..224の完了だけ次の通知fieldへ補正し、225以後・翌field冒頭は現在の通知fieldとして数える。203以後を全て+1した旧計測が0を作った。現行テストはこの補正と、切り替えが非表示期間内であることのassertを持つ。

証拠と再現手順は `game/sa1/v001/results/20261010_game/report.md`、同JSONと `pixel_evidence.zip`。CPU各処理、SA-1の消去・背景・native描画、転送準備走査線・待ち時間を分けて記録した。bucket sortも順序一致を確認したが実ゲームでは速くならず既定は挿入ソート。透明bboxのlookupは高さを二分探索する。Z/priorityだけが変わっても、同じ並べ替え位置の描画8byteが同一なら変更に数えない。次は離れた変更箇所の間を含む横帯を、変更タイルのbitmapへ置き換え、まずPPU転送量を減らす。完全なゲーム進行・全操作経路の検証も引き続き必要。

注意: `tools/run_probe.py` の `lua()` はPython boolを `True` / `False` のまま出してしまう。テストのboolは明示的に `true` / `false` へ変換している。65816の分岐先でMフラグが8bitなのにca65 smart解析が16bitと推定するとCMP即値の長さが壊れてBRKになる。端のコード切り詰めでは `.a8` を明示して修正済み。負のX座標を足した直後のcarryを次の余白加算へ持ち込まないようCLCも必要。

## 2026-10-10 06:05 JST以降の作業メモ

`60c6278`まで専用分岐へpush済み。個別tile DMAは既定に採用しない。`--tile-dma`で32bit×24行bitmap、3tile以下の隙間を連結し、run単位の消去とPPU転送を試した。同じ471回分のpacket traceがbyte単位で一致する条件で、完成470枚までbandsは604field・SA-1平均7.469ms／最大21.437ms・平均転送4116.6bytes、tilesは683field・平均9.024ms／最大24.281ms・平均3739.5bytes。双方125枚FB/VRAM一致。準備・走査・細かい消去の設定で負ける。証拠は`results/20261010_tiles/`。`--presents`指定で同じ論理進行を比較でき、全packetを`packet_trace.bin`へ保存する。既定をbandsへ戻した。公開ROMは引き続きe5e4741の中間版で、60fps未達。

次に実装する方向は表示より先に描くpipeline。平均SA-1時間は余裕があるが単発21msがあるので、完成画像を先行保持して順番に表示する。まだ実装していない。案:

- BW40は現在の差分描画の作業面を維持。BW41/42を交互の完成画像snapshotにする。描画後、直近2画像分のdirty unionをBW40→I-RAM→snapshotへコピーすれば2画像前のsnapshotを更新できる。SA-1 DMAはBW→BW直通できず4cycles/byteなので追加費用は実測が必要。
- S-CPUはゲーム処理を最大2画像先まで先行する。既存の地面/空HDMAは三重bufferなので、現在表示＋次の表示＋描画中の3枠を越えて先行してはいけない。3個のmetadata recordをslot循環にし、次slotが現表示なら次の`_fx_frame`を待つ。入力遅延は最大2frame程度増える。
- COLORBSSをmetadata用にする。CPU CPUDATAのBSSはFA8E付近まであり、FE00まで約880Bしか余らない。pipeline時は未使用bucket sort objectをlinkせず、COLORBSS0400..09FF等に512B×3recordを置く。各recordにsourceBank、descriptor count/position、VRAMpage、世代、背景位置、packet数、自機OBJ136B、地面7pointer、descriptor144B。検査用packet640BはBW43:4000+slot*0400に別保存する。
- S-CPU V-IRQを180/203で交互に使う。180でSA-1 DMA停止要求を立て、203でPPU DMAと表示切り替え。IRQはCのA/X/Y/D/DBR/Pを保存する。NMIはfield counterのみ。IRQ内でS-CPU乗除算器を使わない（割り込まれたゲーム処理と衝突する）。固定の保守的な転送budgetからdescriptor費用を引く。地面paletteのWRAM DMAはchannel0を使うので、producer側でPHP/SEI/PLPしIRQとのregister設定競合を避ける。
- キャラクタ変換DMAはSA-1の2230..2239とI-RAMを使い、SA-1の描画用DMAとそのまま並列にできない。DMA開始前のhelperでbusy=1を立ててからCPU requestを確認し、requestがあればbusy=0にして待つ。S-CPUはrequest=1後にbusy=0を待って223xを使用する。この順序なら競合しない。native sprite code（DMAなし）はCPU DMA中も進められる。SA-1の各DMA setupはmode/source/dest/lengthを全て再設定し、begin/endで囲む。clearは行毎、farはwrapを含む1行、near/fast/JITはROM→I-RAMコピー、edge cacheは各コピー、snapshotはBW→I-RAM→BWの一対。SA-1doneでDCNT=B1を立てる旧処理はpipelineでは削除し、CPUが転送ごとに設定する。
- CC DMAのI-RAM書込先は05C0の32Bへ移す。0700のJITや0600のedge cacheと競合させない。現在workerは約1007Bで0200..05EFを使うので、packet setupの`next`..row開始前をBOOT ROMへ移し、JMPでつなぎ、worker末尾<=05C0をassertする。IRQ中もnative実行を続けるためこの分離が必要。
- 最初はIRQで完成snapshotを送る基本構成を作り、その後VRAM prefetchを加える。VRAMは2面しかないので、毎field一回だけ表示を切り替えた後、空いた反対面へ次のsnapshotを残りの非表示時間で先行転送する。完了しても次fieldまで切り替えを保持する。10KiB超の単発転送を前後の余裕へ分散できる。古い表示面へ書かず、途中画像を表示しない。
- snapshotは全CHR転送完了時に再利用可能、metadataと地面bufferは表示から外れるまで保持。検査はprefetch完了時にsnapshot FBを保存し、実表示時に同じ世代のVRAMとpacketへ照合する。表示間隔は既述の225補正を維持。完成していないのでgoal complete禁止。

## 依頼原文（再掲）

また別の分岐として、SA-1を使ったソフトウェアレンダリングで60fps/4bppスプライトが描画できないか試してみてほしい。
絵のデータは今のままで、SA-1でどこまでできるか。まずはいまFX2でやっているのと同じ手法でどのくらいの速度差が出るか試してみて、縮小の全パターンをメモリに保持する方法を試してみて、それでも速度が足りないところがあればコンパイルドスプライトまで順番に試してみて、60fpsを達成する所まで自律的に進めてみて。

## 分離と現在地

- 専用worktree: `D:\HomeBrew\MonoSHSA1_4bpp60_20261010`。
- GitHub分岐: `experiment/sa1-4bpp-60fps-20261010`。remote `Nao838861/MonoSH_FX2`。既存4bpp30/mainへpushしない。
- 分岐元: `957eeee`。4bpp30の草・爆発・顎・地上爆発先頭と最新音声修正を含む。
- 初期検証commit `ec214e0` を専用remote分岐へpush済み。作業は継続中。**ゲーム統合・60fps表示は未達**。
- Active goalあり。達成していないためcompleteにしない。ユーザーは自律継続を指定。
- ソース `game/sa1/v001/`、ツール `tools/*sa1*`、生成物 `build/sa1_v001/`。元の素材は変更していない。

## 再現可能な実測

`game/sa1/v001/results/20261010_probe/report.md` と各JSON、`pixel_evidence.zip` に保存。実SA-1・GSUをMesen通常クロックで走らせ、反転・四辺clip・重なり・既存道中/ボスpacketの55場面を独立画素合成と全画素照合。

背景は両CPUとも空、自機OBJ・ゲーム処理・音・VRAM転送は含めない。SA-1のCPU側kernelをI-RAMに置き、S-CPUはWRAM WAIで待機。時間はmaster clock。

- SA-1画素単位: 最大描画216.165ms、全面消去込み220.750ms。
- 全事前縮小画像＋画素単位packed読出し: 最大描画240.271ms、総244.857ms。倍率計算を省くだけではblitterの支配を解消しない。
- コンパイルド: 最大描画16.785ms、総21.371ms。4画素wordを不透明なら直書き、部分透明はAND/OR。比較fixtureの91寸法のみをコード化しており、全寸法対応と混同しない。
- 全寸法の行共有＋不透明区間SA-1 DMA: 全1,492寸法が8MiB ROMに収まるが、最大描画32.622ms、総37.208ms。
- FX2の同じ55packetも全画素一致。二半面合計・消去込みなのでSA-1純描画列と単純に最大値比を取らない。

縮小寸法抽出はsmooth_depth後のstage/enemy/boss、開敵32..36、地上爆発4枚、カラー自弾寸法、拡大タイトル、比較fixtureを含む。1,492寸法・8,232変種をROMアドレスから全て読み戻して一致確認。全保持場所はROMでありBW-RAMではない。SA-1 BW-RAM 256KiBには全量が入らない。

全縮小の素朴なコンパイルドは横位置・反転を含めると約23.8MBで8MiBを超える。現時点の最重要制約は全量保持と高速blitterの両立、消去約4.6ms、未統合のPPU DMA帯域。60Hzロジックだけで達成扱いしない。

## 次の検証

全画素を毎回再描画する構成の改善が必要。透明形状だけを共有する生成コード＋色データ、長い不透明行のDMA、前回と同じpacket領域の再利用、変化したtileだけの消去・描画・転送を試す。描画方式の比較だけで止めず、既存ゲーム処理・地面/空HDMA・自機OBJ・音を統合し、完成画面の60field/s表示を実PPUで測る。

最終的な技術判断で避ける誤り: 全寸法のRAM保持とROM保持の混同、計測ROMを遊べるROMとして案内、平均描画時間だけの60fps宣言、元絵や物量を削って達成扱い、エミュレータ増速、hostで描画してSA-1性能扱い。
