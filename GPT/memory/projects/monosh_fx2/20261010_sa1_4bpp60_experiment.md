# SA-1 / 4bpp / 60fps 独立検証（進行中）

## 現在の継続地点（2026-10-13、467520d）

467520dを独立SA-1分岐へcommit/push済み・clean。60fps未達・goal active。公開ROMは変更なし。前段da1936aの境界修正・hint圧縮に続き、`--stack-explosions-wide`（幅91追加）、`--stack-explosions-right-only`（右端で切れる物だけ）、`--stack-explosions-iram`（helperを0300へコピー）を検証した。全1492寸法と元素材を保持。実行中のテストなし。

通常道中800field：wide_v1は654logic/643表示・168実PPU画面一致・2field間隔6回・最大24.074ms、右端限定wide_v2は655/644・168一致・5回・最大23.312ms、内部RAM版iram_v1も655/644・168一致・5回・最大23.312ms。元BW配置表645/4回、公開固定配置647/4回を超えない。幅91 asset41中心x255/bottom201は元5.462→追加3.604→右端限定3.595→IRAM3.519ms。画面内のx182/bottom191は元1.549に対して無条件stack4.454msと悪化するため、右端限定が必要。経過時間はIRQ/共有バスの影響込み。

wideは613共有record/54,752B。圧縮hint後ろ7DB3C0..7DFFFFと7EB000..7EC3FFも使用、7E0000..7EAFFF予約は維持。613kernel/21,315右byte境界が静的一致。右端限定とIRAMの境界fixtureは各700field/559logic/548表示全一致・末尾停止0。wide_v2の初回host画素検査のみPython `generator already executing` で終了し、同じ保存済み548画面を同じ条件で再検査して全一致。検査条件は変更せず、初回/再実行script/logを証拠へ保存。iramは通常runnerで全完了。

IRAM helperは03:E400原本→0300..0509（522B）。worker0200..02D5と05C0転送作業域の間に収まり、リンク後の領域検査を追加。DMA可能時はSA-1 DMA、PPU要求中はMVNを使う。row gateは0700。current buildROMはiram_v1 SHA e97cb62ff475ac84e5fec7bb7807ead27e9fae302a1401253d41ea645fb57e62、snapshot fifostackexpiram_v1_build。wide_v1 SHA d8ea4aec…、wide_v2 SHA17d4b39c…のsnapshotもある。証拠 `results/20261013_stack_wide/` ZIP43,349,969B、SHA ce99f0450d91fdcf1c995644232fe82f87b8c005fb769231d4c926b2865ec695。

**次は逆順STAのnative行を元のcompiled ROMへ統合する案。** `tools/analyze_sa1_reverse_explosions.py` のreverse_rowは右wordからLDA/AND/OR/STAを出し、clip境界の開始命令へ入れる。1104kernel/38,662右byte境界は元nativeと静的一致。単純に追加コピーすると40/41幅94だけ45,465B、幅94/91は81,444Bで空きを超える。二重保持を避けるため、`tools/sa1_game_compiled.py` のrow_entryへ対象asset/widthだけ逆順生成を選ぶflagを足す候補。行内word同士は非重複なので、全行を実行する既存fallbackも同じ画素になる。left-hints対象0/2/3/5は順序を変えず、40/41の対象寸法のみ変える。rowcache keyに逆順flag、compiled cache keyにもflagが必要。元のforward行を保持せず追加分を減らせるかまず容量測定、その後右clip専用helperで元の逆順ROMへ途中接続する（普通のSのままX=raw行、0700にJML行、JSL000700→行RTLで復帰、偶数/奇数右端guard byte保持）。ゲームへの統合・速度は未検証。PEAのS/map切替を省ける可能性がある。

過去のtile cache試算は `tools/analyze_sa1_tile_cache.py` と `results/20261010_queue_depth/README.md`：41連続画面の楽観LRUでも512tile時95%が新規。ハッシュ等の費用を含まないのでキャッシュ案を速度改善扱いしない。`--left-runtime-scan` も過去に全静的境界・fixture通過だがゲーム9待ちのまま、爆発の一部が遅く不採用。既存結果を再発見して同じ試験を繰り返さない。

## 前段の継続地点（2026-10-13、da1936a）

独立SA-1分岐へda1936aをcommit/push済み。60fps未達・goal active。公開ROMはSHA9934d77b…を維持。新しいstack描画は幅94の爆発40/41、高さ73/74、横位置偶奇に対応する。追加30,712B、330共有record。DF8000..DF91FFは既存近景が使用中なので空き扱いしない。実際に使うのはDF7020..DF7FFF、DF9200..DFBFFF、FEC400..FEFFFF。helperは03E400、return gateはIRAM0700。最大8行/8KiB境界ごとにstackを元へ戻してIRQ応答の機会を作り、PPU DMA中もnative描画は続ける。

道中800fieldのv1/v2/v3/修正後v4/圧縮併用は全て655logic/644表示・168実PPU画面一致・2field間隔5回、最大SA-1は23.577/24.754/22.158/22.169/22.673ms。比較元BW配置表645表示/4回と公開固定表647表示/4回を超えないので公開しない。対象外の幅91/88の右端爆発が最重処理として残る。次は圧縮で空いた領域へ幅91を追加する。

長い境界fixtureで共有処理のバグを発見した。旧v2/v3は172画面一致後に停止し、不合格へ訂正。stackを外した旧BW配置表ROMでも再現。edge_cached_game.sのtop+sourceFirstで出たcarryをrowCountへ持ち越し、1行余計に退避。幅28・chunk16で本来504Bが532Bとなって0300..04FFを越え、0500の小幅edge JITを零で上書きした。rowCount加算前のCLCで修正。v4の500fieldは347表示全一致・停止0、圧縮併用も同じ347全一致。test_sa1_game.pyにstackfixtureと停止/高さ循環不足のassertを追加。元native行とstack行は330kernel・11,696右端byte境界一致。

`--left-hints-compressed` は8境界ごとの基準値と0/1/2/4の2bit差分＋256B LUT。4,998kernel・77,751境界をnative命令由来の開始位置へ全照合し、50,079→25,514B、24,565B削減。payloadEndは7EC39F→7DB3A7（bank予約域の丸め回避も含む）。左端fixture320fieldは170表示/120保存画面一致、停止0。既存hintは全て保持。追加候補領域はalign(7DB3A7)..7E0000および7EB000..7EC400で、配置前の全零検査が必要。7E0000..7EB000は予約のまま。

証拠 `results/20261013_stack_explosions/`、ZIP50,398,965B、SHA aac36a2b2cf385fa7b11bc8acf6f5b71e1c9faf986a4a5832aee4eac27e82b0f。現行buildROMは圧縮併用版、build/sa1_game/fifostackexpcompressed_v1_buildにsnapshot、v4はfifostackexp_v4_build。各比較の元ROM/LBL/MAPは証拠ZIPにも固定。v1..v3はCLC修正前の履歴測定、現行sourceで同じコマンドを実行しても同SHAにはならない。通常ゲームの60fpsは未達。限定fixtureでgoal60fpsAchieved=trueでも全体達成扱い禁止。テスト処理は完了しており実行中なし。ユーザーMesenの現在PIDは36580（D:\HomeBrew\Mesen\Mesen.exe）、触らない。

## 以前の継続地点（2026-10-11、3ac5852）

実装側6de7d38（CPU範囲計算三方式）、3ac5852（8行stack試験＋追加容量）をpush済み・clean。60fps未達・goal active。公開ROMはSHA9934d77b…のまま。CPU分担は不採用、次はstack描画のゲーム統合を検討する。実行中のテストはない。ユーザーMesen PID70064は触らない。

CPU範囲計算を前画面のSA-1描画と重ねた全移動版は579logic/576表示、167実PPU画面一致、最大SA-1 16.475ms。ただしCPU範囲計算が最大12.260ms、CPU本来のゲーム処理が最大10.974msあり、2field間隔70/3field1と悪化。小さい物のみCPUへ移す版は605/602表示・168一致・46待ち・最大20.134ms。縮小pattern検索だけCPUへ移す版は645/634表示・168一致・14待ち・最大20.937ms。全件800field・共通packet一致。`results/20261011_cpu_dirty/`、ZIP12,160,047B、SHA c3a37658258b4b55e88ababaf9bf56d0457ac7a28a0cbfc7c0e2526f12443885。

`tools/sa1_cpu_dirty.py`。D=0400、作業7EF000..F13F、upload先BW432C00..2D3F（mask96/帯bounds96/shapePtr128）。`--cpu-dirty` 全移動、追加`--cpu-dirty-small`大小分担、追加`--cpu-dirty-shapes`検索のみ。初期版のassembler define不足・raw shape_gameのstride7→現在10変換漏れ・検索のみ版の既存shape書戻し値不足は修正した。失敗版v1/v2/cpushapes_v1は比較から除外し、全移動v3・小物v1・検索v2のみ採用。無関係なROM参照mapping不具合ではなく、10byte表へ7byte strideで検索したことが停止原因だった。

stack試験は `build_sa1_planar_probe.py --packed-stack --row-calls --stack-batch 8`＋`test_sa1_probe.py`。55fixture全一致、最大描画5.528169ms/消去込み10.116275ms。一行ごとのmap/stack設定9.233msから改善。8KiB境界・描画順を越えない最大8行単位で設定・復帰する。位置・寸法検索/ゲーム/PPUは未統合。`results/20261011_stack_batch/`、ZIP156,468B、SHA70f45333b4746019d78060ade9f885c6f6a417d067dc0889a3364185dfad1453。probeROM SHA2ae9c315…、build/sa1_v001/packed_stack_rowsに全画素証拠。build/sa1_gameとは別なので混同しない。

`analyze_sa1_stack_capacity.py`は既存native rowを逆順PEA/PHAへ変換し、末尾JML000700の想定で追加容量を測る。幅94の爆発40/41なら330kernel/23,215B＋右clip表3,644B＋8B行descriptor4,704B＝31,563B（lookup/padding除外）。40のみなら14,863B。39/40/41全ては50,924Bとなり空きに収まらない。元の全1,492寸法のfallbackを残して、最も重い右clipの40/41幅94だけ加速する候補。まだゲームへ追加していない。

次の案：元ROMのDF7000..DFBFFF（20KiB）とFEC400..FEFFFF（15KiB、left hint後ろ）が全零・未参照であることを確認して、40/41幅94のstack row・clip表・descriptorを追加。native row末尾のJML000700はIRAM gateへ戻す。gateはhardware Sを保存・復帰し、8行/8KiB境界ごとにIRQを許可する。右clipは逆順codeの先頭をhintで飛ばし、選んだword末尾へSを置けば可視prefixだけを描ける。word読みは既存DB/raw XでLDA abs,X、部分透明はAND/OR/PHA、不透明はPEA。右端guard byteと奇数phaseを保持する。左clipにはそのまま適用できないので従来fallbackへ。サイズ・色・物量は変えない。普通のrowを全部stackへ置換するとfallback喪失や容量増大になるので、追加対象を絞って実測する。

## BW-RAM専用配置表・消去の検証（2026-10-11、607b101）

実装側607b101までpush済み。固定map差分を現在のPPU配置で再測定し、direct639表示（2field間隔10、0/3間隔も残る）、DMA640表示（10待ち）。FIFOのmap初期化fallbackをDB切替＋32word展開・記入を8word展開にしたfast-fillは642表示/6待ち。配置表を12record専用のBW-RAM領域に維持して退避DMAを省く版は645表示/4待ち、広幅消去閾値32との合成は644表示/5待ち。各800field・168画面・実PPU参照・同一世代packet一致。公開固定map版647表示/4待ちを超えず、公開ROMは変更していない。証拠 `results/20261011_bw_map/` zip30,610,717B、SHA `00bac2dde3080d02d59be38627255071023a63376235ef1c490fe28d7da7ca73`。60fps未達・active goal継続。

新flag `--vram-fifo-fast-fill`、`--vram-fifo-map-bw`。後者はbank40/41/42それぞれ6C00/71C0/EC00/F1C0の1472B×12表。CPUはsubmit時IRAM01A8/01AAへlow/bankを渡し、collectでrecord+60/+62へ保存。SA-1はそこへ直接map生成し、rawはCHR転送完了で解放できる。既存bottom-slackの248行末までの描画は表を壊し得るので、BW専用map時だけ208行末（CMP209）までに制限した。初期fifobwmap_v1/fifobwdirty_v1は800fieldの168画面が一致したが、この未検査配置のため除外。安全版fifobwmap_v2 SHA94c0c2e1…を保存。リンク後の実表でraw（先頭保護1024B＋208行）、累積表、12mapの非重複をassertする。

607b101のpushは新しい証拠zipのloose object `199a2037da3601e58f85c104e220041d254a0636` のzlib破損で一度失敗。作業ファイルのgit hashが同じことを確認し、破損objectを共通git dirの `codex-object-quarantine/…_20261011` へ保管、`git hash-object -w`で再作成。`git cat-file blob`の全bytes一致とSHAを確認してpush成功・clean。commitをresetしたり他worktreeを変更していない。

**mask-clear試作は四件完了、1beca9cでpush済み・不採用。** 41画面の実画素で占有タイル平均6844B、帯の外接範囲平均9593B（約29%空白）。七rawの占有maskをBW432300..43259Fへ保持し、old maskを432600へ出す。idle-clearで消した帯のmaskも零にする。CPU命令のみのfifomaskclear_v1は637表示/168一致・最大SA-1 25.791ms、DMA優先fifomaskdma_v1も637/168一致・最大23.962ms。8bit表引き＋隣接run結合のfifomasktable_v1は640表示/8待ち、さらにgap2統合も640/8待ち。全件800field/168実PPU画素一致/共通世代packet一致。証拠 `results/20261011_mask_clear/`、ZIP16,244,158B、SHA d801a84736cbe3d1cbcf57f7dbffeb01018227bced60ac2d86fc382d7749d5af。消去量削減より設定・走査費用が勝つ。公開ROMは変えていない。

**`--near-rom` は2636c83でpush済み・不採用。** `near_rom_game.s`＋`tools/sa1_near_patch_rom.py` の `cyclic()`。近景中央48/52pxの旧コードコピーを、ROM直実行8px断片と端4px断片に置換。全512開始位置×9行を持ち、8pxはFE0000から41,952B/1992kernel、4pxはFEC400から13,525B/445kernelで収まった。左端hintのpayloadEnd 7EC39Fより後ろ・全零の未使用域をassertしてから4px側を置く。旧全窓コードの共有容量測定は165,953Bで45KiB枠を越え、分割しても収まらなかったので使わない。素材・境界・表示範囲は従来どおり。

最初のfifonearrom_v1は共有07F0 stubをJMLに変えたあとJSLに戻さず、後続spriteの戻りstackを壊した。速度比較から除外。v2では毎行終了時opcode22へ戻し、800fieldで655logic/644表示・5待ち、168画面実PPU一致、共通packet一致。最大22.743112ms。ROM SHA85ef9503bc2122af76371cc76e455a3e3bf3809d67a19a08d294f5e147baa7dc。`results/20261011_near_rom/`、ZIP4,054,525B、SHA2336ff463ad4ad4cb8e0b86ec118c5274cc8435a10337cdc947889eb6b8a30a3。公開版は変えていない。

**右端処理三件は689e0abでpush済み・不採用。** `--right-clip-jit --right-clip-fast` はhelperをROMから実行し、後方STA走査で可視prefixを求めてMVNコピーするが634表示、2field13/3field1、最大33.211msで遅い。逆向き走査は56,172kernel・1,092,812境界で元描画＋クリップと一致。`--right-clip-window` はIRAM0780..07FF末尾へ一行を置き、元のROMコードを実行し、0800以降の書込無視で右端を落とす。IRAM上端128BはBW432C00へ退避・復元。最初に0F80..0FFFをmirrorと取り違えたv1は458byte不一致で除外（MesenのIRAM handlerでは0800..0FFFはread0/write無視）。正しいv2は638表示・2field9/3field1、最大27.233ms。`--right-clip-window-min 17 --right-clip-window-direct` のv3は空行を飛ばし、収まる行はrawへ直接実行し、小さいはみ出しは従来経路へ戻す。645表示/4待ち、最大22.309630ms。爆発一つで6.3→5.3msの例はあるが全体改善なし。全三件800field/168実PPU一致/共通packet一致、v2/v3は現在のコマンドで再ビルドしたSHAも同じ。`results/20261011_right_clip/`、ZIP12,189,826B、SHA52a7b9c025db713f0ae211278ba85c81344090da5ee7c9dfd03ab881161f13f9。

**WRAM投影表版は6d324d8でpush済み・不採用。** FIFO必須条件を `projectionRom OR vramFifoMapBw` に緩め、後者でCPU CODEが0..FFFFに収まるassertを追加。CODEサイズFFC2（65,474B）。`fifobwwram_v1`は800field/656logic/645表示・168実PPU一致・4待ち・最大22.330117msで、BW配置表版を改善しない。ROM SHA554177b13a79f7a1fc451d8837651bee3d611db0143846eaa3d37ad42c30305a。証拠 `results/20261011_wram_projection/`、ZIP4,052,813B、SHAb461b81e9fda62bf3a4a3a5f1c2286b8b21a7e945853f1d525c6f148c9bdd51f。全縮小のleft hint拡大容量も測定済み（39追加だけで36,666B・hash87.9%、40追加でhash113.9%）。未回答の敵弾OBJ案は適用していない。

## 配置表のCPU移動は不採用（2026-10-11、11e9e6e）

実装側11e9e6eをpush済み・clean。`--vram-fifo-cpu-map`でSA-1は次画面の描画を先に開始し、S-CPUが前画面の1472B配置表をWRAM 7FA000以降へ生成する。record+62は0未着手/2生成中/1完成で、未完成のmapではflipしない。SA-1のmap生成とcollect時のBW→WRAM退避DMAを省く。CPUの初期化は614表示/34待ち、初期化だけROM→WRAM DMAにした `--vram-fifo-cpu-map-dma` も632表示/16待ち（各800field）。両方168画面一致、実PPU参照と同一世代packet一致。公開版647表示/4待ちを超えず未採用。公開ROMのSHAは9934d77b…のまま。60fps未達・active goal継続。

証拠 `results/20261011_cpu_map/`。zip SHA `ad7ff71029a392d45dcb446de7c3591c86e8d9589fc81cb1b1eefa07b8681fe0`、12,752,421B。成功版はfifocpumap_v4（SHA4762e3cb…）、fifocpumapdma_v1（SHA683e58c5…）。v1のWRAM関数呼出しbank00誤り、v2のraw source base未除去、v3の修正箇所誤りによる無表示を比較から除いた。CODEの論理番地はbank00のoffsetなのでCPU JSLは7F0000+symbol、COLORBSSへのlong読出しは7E0000+symbolが必要。フレーム全体のmap初期化をCPU storeで行う費用が大きい。

反転正規化の理想タイルLRUでも41連続画面・512容量で8335要求/7916miss（94.97%）。1536でも7744miss（92.91%）。表示/待機中の保護・hash等の実装費用抜き。速度改善の証拠ではない。CPU配置表と反転キャッシュ案は採用しない。

次に確認する候補は固定mapの差分更新の再測定。`20261010_fixed_delta` の旧結果は実PPU配置誤りで無効になったが、現在の固定map配置＋累積費用表でdirect/DMA差分版はまだ再測定していない。full-maskのみ638表示で不採用済み。候補実装は未変更・未測定。敵弾OBJの条件確認は未回答なのでOBJへの変更は行わない。ユーザーMesen PID70064を操作しない。

## 直接planar・敵弾・スタックの追加比較（2026-10-11 0時頃、8341e55）

実装側は8341e55までpush済み・clean。公開ROMは変更なし。ac1d816の `results/20261010_planar_probe/` は55fixtureの固定位置コンパイル比較。packed7.583ms、planar8.440ms、bitplaneごと11.813ms、辞書planar20.514ms（描画だけ）。全件画素一致。ただし配置検索・ゲーム・PPUを含まず、全縮小コードをROMへ収録したわけでもない。全寸法の素材別密辞書は6,893,196bytes（本体・fallback等を除く）。plane別コード共有も28MB/32MBで8MiBに収まらない。128KiBの行コードRAM LRUはピーク41画面13,522行に9,936miss・974,025生成bytes（最大36,041B/画面）。zip SHA `7832520b0696708ad02698306b66342611d9250ce83d13e5595689d2511cb927`、1,371,972bytes。

2bae54bの `results/20261011_clear_bullet/` は三件800field・168画面一致・実PPUとpacket確認済み。消去DMA待機645表示/6待ち、画面内敵弾高速経路646/5、FIFOとの合成642/6で、公開版647/4を超えず。zip SHA `b7d553bd614c77f6fc9be6c2f25107297899e851c31190f5fcd0d351a77faebd`、12,315,389bytes。敵弾初回v1はビルド終了前に開始したので自分のテストだけ停止・v2再測定し、v1を除外。新flag `--wait-clear-dma`、`--bullet-interior`。後者はIRAM019Eを使うためcpuPackDoubleと併用禁止。

8341e55の `results/20261011_stack_probe/` でPEA描画55fixture一致。固定位置のfixture全体でstackを使うと5.546ms、同条件packed通常7.583ms。行ごとの通常呼出し7.085ms、map設定・S復帰を行ごとに行うstack版9.233ms。割り込み停止の長い固定位置版をゲームへ混ぜない。初回はDB=40で2225へabsolute書込みした誤りをlong bank0書込みへ修正して全件再実行済み。zip SHA `1860a190337aae289880a1175a5749b4a6d441a203ce6384a204ecc7c1ae6a98`、1,001,644bytes。

**次の独立候補：少数行のstack描画を一まとまりにする方式（未実装）**。SA-1 BW mirrorは8KiBなので、raw物理行の64行境界を越えない最大12行のblockで一度だけ2225とSを設定・復帰する。通常JSL/RTLをS=画像のまま使えないため、row kernel末尾をJML $0007E0とし、IRAM gateが次の行プログラムへ跳ぶ。18byte/行のmacro例は LDA #dy*128+end-1 / CLC / ADC $F8 / TAX / AND #1FFF / ORA #6000 / TCS / JML kernel。Xは元BW bankの行右端、Sは対応するBW mirror。PEAは不透明word、透明を含むwordはLDA負offset,X / AND mask / ORA value / PHA。隙間はTSC/SEC/SBC gap/TCSで飛ばす。gateはLDA $01B4 / CLC / ADC #18 / STA $01B4 / JMP ($01B4)（counter初期0700）。12行×18=216Bで0700..07D7、gate07E0..07ECを避ける。終端はRTLでなくJML block_doneを付け、保存したSへ復帰してPHP/SEIを戻す。rawbank/pageを選ぶ2225への書込みはDB40なので必ずlong bank0で行う。

これにはcompiled_game_packingの行stride11→18、fast helperの呼出し変更、コンパイルkernel置換、clipped pathの新しいsoft row parserが必要。全normal kernelとstack kernelを二重保持すると8MiBを超えるため、stackのPEA/BD..PHA/skipを読んで端のwordだけ合成するfallbackを作り、leftHints/smallEdgeJit/rightClipJitは新試作で無効にする案。高速経路は画面内のspriteだけに制限して行がBW pageを跨がないようにする。現時点のROM/LBL使用テストは全て終了。goalはactive、60fps未達。敵弾OBJ質問は未回答のため未変更、ユーザーMesen PID70064を操作しない。

**設計の訂正・具体化（未実装）：IRAMへ18B行プログラムをコピーする必要はない。既存fast_base_readyもROMプログラムへ直接跳んでいる。** ROMの18B/行プログラムを直接実行し、IRAM 0700付近のreturn gateからROM次行へJML間接で戻る。program counter 01B4..01B6、残り行数01B8、保存S01B0。fast_invokeはPHP/SEIして正常Sを保存し、DB=raw bank、2225初期map、counter=rows+ffirst*18、remaining=flast-ffirstを設定してJML [counter]。行macroは上記18B、rowcodeは末尾JML $000700。gateはremainingを減らし0なら正常S/PLP/DB0/RTSで呼出元へ復帰、残りがあればcurrentX &1F80==1F80の時だけ2225をincrement（64物理行ごとの8KiB境界）、counter低16に18を加えてJML [counter]。ROMプログラムはbank内配置なのでcarryなし。IRQ停止が長くならぬよう各行gateで011EのCPU要求を確認し、要求時は正常Sへ戻しCLI/JSL sa1_dma_poll/SEIを行い、次行macroでSを設定し直す。X/Aは次行macroが作り直す。IRQが01B0..01BBを触らないことは実装前に確認する。

stack rowcodeはprefix不要。各不透明wordはPEA immediate（3B）、masked wordはLDA negativeOffset,X/AND mask/ORA value/PHA（10B）。Xは行右端なのでoffset=wordLow-lastByteを16bitで格納。透明の穴はTSC/SEC/SBC gap/TCS（6B）。通常rowcodeより短くなるため、18B macroの増分を吸収できる見込み。soft partial parserはPEA→mask0、BD..PHA→mask/value、3B 38 E9 gap 1B→position減算、5C→終了を読む。source pointerはmacro+14、行右端logical byteはrowx+(macroImmediate-dy*128)。wordLow=right-1を0..126ならword書込み、-1ならhigh byteだけ、127ならlow byteだけ合成し、word処理後right-=2。元行codeを二重に置かない。native fullfastは画面の左右に入る物体だけ、それ以外のrowはこのsoft parser。bottom/top clipもfast_invokeのremainingで止められるのでcopy不要。実装時は既存fast helperの11*first/dyとrow_partial算術を18へ直す。

## 可変長VRAMの実装と実測（2026-10-10 23:40頃、af1a97b）

可変長VRAM FIFO、WRAMへの配置表退避、定数時間の割当、記述子コピーの省略、配置表と区間生成の統合を実装し、af1a97bをpush済み。六件とも800フィールド・168画面一致・実PPU参照確認・固定配置版との描画packet一致。表示枚数は638/638/641/642/639/642、表示待ち11/10/7/6/6/8回。開始前の完成保持11枚も6回の待ちが残る。最良の固定配置版647表示・待ち4回を超えず公開版へ未採用。60fps未達・active goal継続。証拠zipは `results/20261010_vram_fifo/evidence.zip`、26,554,307bytes、SHA256 `dea7e58b6bbe3091e65da2a5998f1cf1c644d1cada63006fe68de475475010ea`。

FIFOはBC20未満の1505物理タイル、8KiB境界ごとのゼロタイルを避ける。配置計算は529,760入力を参照計算と照合済み。最初の実装のmap境界bit10衝突を修正。続く画素判定はチェック側が64KiB VRAM折返しを欠いていたため修正して同一ROMをfifo_v3として再検証した。初期二件は比較から除外。退避mapは7FA000..7FE500でCPU CODEのA000境界assertを追加。最新ビルドはfifofusedraw_v1、公開ROMはSHA9934d77b…を維持し、ROM/LBLを使うテストは終了している。

新方式では負荷の山でSA-1側の完成キューが空になり、準備コストが効く。敵弾OBJの任意質問は未回答なので変更していない。次の候補は直接planar描画の圧縮データ方式。全横8位相の完全コンパイルコード30MB超は不可能と判定済みだが、データ方式の容量・実行費用は未評価。従来のpacked 4bpp描画→キャラクタ変換DMAを省けるか、まず元絵のままサイズを測る。ユーザーMesen PID70064を操作しない。

## 追加比較（2026-10-10 23時頃、9c6bbcb以降）

保持数12・VRAM起動時先行保持・四面専用配置表の累積費用表・投影表ROM化・16bit DMA開始を検証し、9c6bbcbをpush済み。続く合成設定を含む5件は全件800フィールド・168画面一致・実PPU参照確認済み。固定配置の保持数12/16bit DMA開始は647表示・4回の2フィールド間隔で改善なし。三面先行保持の四面CHRは644表示、四面専用配置表は643表示、余裕短縮＋16bit開始の合成も643表示。証拠は `results/20261010_queue_depth/`、zip SHA256 `ce3306b16711a9d193ac47f725d6d9ab2ccc40135c4cb9deacd5c28e1a0c995c`（18,176,868bytes）。公開ROMは4b39e4dの同じSHAのまま。60fps未達・active goal継続。

四面CHR先行保持でmap参照前のraw再利用が壊れる不具合を修正（SA-1元BW面の解放をflip後へ移動）。起動時prefillの七面要求も最初の転送後は繰り返さない。失敗試作は比較集計から明示的に除外した。COLORBSSへ移したpipe_statusの未初期化は撤回しBSSに残した。保持数12ではsky/ground_horizontal_keysをCOLORBSSへ移し、near OBJ/prefix表も12枠へ増やす。

楽観的タイルLRUの41連続画面分析でも512タイルで約95%が新規となり、費用を含まない試算でも再利用効果が小さい。次は固定面を捨て、SA-1が可変長のVRAM FIFOを割り当てる試作。`tools/analyze_sa1_vram_fifo.py` と `vram_fifo_capacity.json` は容量・BG1の32KiB参照窓だけの試算（速度証明ではない）。軽い場面8～9枚、ピーク付近4枚。静的素材は固定配置版と同じBC20以上、BG1 map C000、BG2 CHR A000を想定。8KiBごとの固定ゼロtileを予約すれば空mapのDMA雛形を維持でき、SA-1の全map CPU埋め直しを避けられる。元BWのmapは表示まで保持し、raw解放をflip後にする構成から試す。ユーザーへ送った敵弾OBJ併用の任意質問は回答未着なので、OBJへの変更は行っていない。

## 最新状態（2026-10-10、4b39e4d / eafca7a）

公開ROMを4b39e4dの固定配置＋SA-1累積転送費用表＋部分転送版に更新し、push済み。ROM SHA256は `9934d77b85913187be8d3ebd8315f854718eb24b08492204ce8b3288f620146c`。800フィールドの負荷集中試験は647表示・168画面一致、道中1900フィールドは1744表示・147画面一致、ボス1900フィールドは1742表示・147画面一致、反転fixtureは120画面一致。同一ROMの実PPU参照位置と非表示期間中の転送も検証した。**60fps達成ではない。** 証拠は `results/20261010_fixed_table/`。起動はSA-1独立フォルダの `play_sa1.cmd`。

eafca7aもpush済み。追加5試験（四面VRAM＋費用表、転送余裕短縮2種、空白タイル省略、三面VRAM＋費用表）は全て800フィールド・168画面一致・実PPU参照確認済み。表示数は順に645/647/644/638/643で公開版を上回らず、未採用。証拠は `results/20261010_transfer_followup/`（zip SHA256 `b1bd022e8c1b92c96c5a16f18c3ad352d28d396eac4f58e80e90f19ffa7bd898`）。

現時点の独立した次の試行はmetadata保持数8→12。raw BWは7面のままで、ground/near/prefix表も同じ深さに拡張する。COLORBSSへ移す変数は初期値に注意（pipe_statusはBSSに残す）。2026-10-10 22:36 JST頃、敵弾だけOBJを併用する構成も試してよいか、任意の条件確認を非同期で送った。回答未着の間は依存するOBJ変更を行わず、ソフトウェア描画の改善を続ける。ユーザーのMesen PID70064を止めない。

## 最新状態（2026-10-10、5570ab4）

**重要な検証訂正。固定map・map差分・VRAM四面の過去の正常表示判定は無効。** 検証器が意図したVRAM配置を復号し、PPUの実際のCHR・配置表の開始位置を照合していなかった。固定mapのBC00は2KiB整列を満たさず、遠景CHR指定も8KiB制約に違反。四面は210Bのシフト量/BG2指定が誤り、12KiBの奇数面に必要なタイル番号128補正も欠けた。旧報告JSON/本文に訂正を追記した。ROM/証拠自体は履歴として残す。

`5570ab4` を専用分岐へpush済み。PPU状態を各捕捉世代で保存し、実参照位置で画素復号する検査を追加した。修正固定mapはBG1 map C000、BG2 CHR A000、far map C600/CE00、自機C800。遠景・草126tileはそのまま移動。修正版4試験を `results/20261010_ppu_layout/` に保存、zip SHA `0dda205298f2f0a2f977581a09fddff1043f54a76c2e5ef8f0abc229b90fba29`。道中1900/1743表示/147一致、ボス1900/1741/147一致、反転四辺120一致、爆発区間800/644/168一致。release SHA `7459afffd844ab008959d7183a374aa1f037673f68a0a3ab39fb48e70acaa48d`へ差し替えた。**60fps未達、active goal継続。**

同commitには、表示検証が不完全だった四面＋最新弾コード/費用表/WRAM先行変換の7試験も訂正付きで保存。最大21..24ms、表示644以下/800で、正常表示の採用根拠に使わない。四面コードのPPU修正は実装したがまだ再試験していない。

次の実行中試験は修正固定mapへ `--dirty-iram` を追加した800field、`movestress_detinput_captureburst_fixedmap_dirtyiram_v1_tracepalette`。Python検証まで完了する前にROM/LBLを変更しない。修正版固定mapの重い区間は世代542..551、SA-1総15..22ms、dirty約3.3..3.8ms、clear約2..5ms、CHR10..11KB。通常は1field表示で、道中は2field間隔8回が残る。公開版は修正固定mapを維持し、未検証試作を反映しない。ユーザーMesen PID70064を操作しない。

## 過去の中間点（2026-10-10、4085735、PPU参照未検証）

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
## 最新状況（2026-10-10、4593806）

SA-1独立分岐へ4593806をcommit・push済み。**60fpsは未達で、active goalは継続。** 公開ROMはPPU位置を検証済みの5570ab4版を維持する。新しい比較13件を `results/20261010_transfer_trials/` へ保存した。証拠zip SHA `58df646d65b935588ee54a4bedc81c43bd1df8a4db97d4ea06c84cae565bdacc`、52,031,727bytes。全件800フィールド・168画面一致・実PPU参照位置確認。固定配置＋SA-1転送費用累積表＋部分転送は644表示から647表示へ改善（2フィールド間隔7回→4回）。比較コマンドはcommands.jsonに保存。起動準備を含む表示枚数を800で割ってfpsとはしない。

独立VRAM四面（335tile）は642表示、共有map四面は645表示、WRAM一面変換631表示、二面変換629表示、SA-1描画フェーズだけ変換628表示、右端JIT627表示。dirty-IRAMと広幅消去の閾値32は644表示。固定配置の累積表でsmall reserve1600/player2700/prefetch300、gap64結合、退避JIT64バイト幅までの拡張はいずれも647表示で速度改善なし。失敗したfourOwned_v1（Luaホスト時間切れ）とdoubleStage_v1（IRQのWRAMバンク固定による画素不一致）は除外し、修正・再試行版を比較した。次は共有map四面＋累積表＋部分転送の800fieldテスト `movestress_detinput_captureburst_fourtable_v1_tracepalette` が進行中。Python画素照合終了までビルドROM/LBLを変えない。ユーザーのMesen PID70064を操作しない。

## 最新状況（2026-10-13、47f8ee8）

独立SA-1分岐の47f8ee8をcommit・push済み。60fps維持は未達、active goalは継続する。公開ROMはSHA `9934d77b85913187be8d3ebd8315f854718eb24b08492204ce8b3288f620146c` を維持。今回の逆順native行・左右clip hintの5試作と境界テストは `game/sa1/v001/results/20261013_reverse_native/` に保存。証拠zipは92,928,655bytes、SHA `99a5572d63dea030846f63cc2fbb3b0c37d206db5d486bb347dbe94640f35de5`。

右端からはみ出す爆発40/41の幅91以上を右wordから生成し、不可視命令を飛ばす。全1,492寸法を維持し、単体の幅91・中心255の爆発は約5.462ms→2.784ms。別表v1は800field/644表示・2field間隔5回。右端ポインタを行headerへ埋めたv2と左端爆発39へhashを追加したv3は643表示・6回で悪化。左端の草木0/2/3/5（幅64以上）と爆発39（幅79以上）もheader直接ポインタにしたv4、および右端別表＋左端headerのv5は645表示・4回。既存BW map方式と表示枚数は同じで、最良更新とはしない。左端の幅79・中心25の爆発はv3の6.519264ms→v4の4.515378ms。v4最大SA-1は22.783620ms、v5は22.778591ms。

静的に全寸法/native行90,854回/弾158,688回の元ROM一致、逆順1,557kernel/右端59,519境界、左端6,326kernel/190,929ケースの一致を確認。左端104,953hint境界を75,687→37,761bytesへ圧縮し、v4/v5は49,152bytesのhash表を廃止。検証は実ROMの全対象寸法からheaderをたどり、補助列挙JSONだけに依存しない。実PPUを含む道中各168画面、境界はv1右548/v3左500/v4左500・右548/v5右548画面で一致・末尾停止なし。v5の最初のホスト実行はPython Fraction例外、次はMesenプロセス終了で完走せず比較から除外。同一ROMの再実行で800field/168一致が完走した。原因をROMまたはホストに断定しない。

現在buildはv5、SHA `7124eab2f29ffca6904f68d1c7ee705933dd0b341bbb0082db9366468fc4a7fb`。snapshot `build/sa1_game/fiforeverseexp_v1_build`〜`v5_build`、コマンドは今回results/commands.json。道中v5成功scenarioは `movestress_detinput_captureburst_reverseexp_v5_retry2_tracepalette`。性能測定の途中でROM/LBLを書き換えない。ユーザーのMesen PID36580（D:\HomeBrew\Mesen\Mesen.exe）は操作しない。現在自分のMesen試験は全て終了。

残る表示落ち時は完成画像の待ち行列が空でSA-1が描画中。単なる切替設定やFIFO追加で解決したとは扱わない。描画/消去の負荷集中をさらに削減する。直接planar方式は既に `results/20261010_planar_probe/` で容量・速度・128KiB code cacheまで棄却済み（全8位相native約28MB、楽観的code cache miss多数）。S-CPU全体のFastROM移動も過去に悪化しているので繰り返さない。

## 追加の長時間ボス比較（2026-10-13、a0bb3b3）

a0bb3b3を独立SA-1分岐へcommit・push済み。60fpsは未達、goalはactiveを維持する。現在自分の試験プロセスは全て終了、worktreeはclean。公開ROMは変更しない。

逆順native v5をボス1,900fieldへ延長すると1705logic/1702表示、146画面一致、2field間隔45回、最大SA-1 19.229351ms。公開固定map版の1748/1742・147一致・2field間隔8回より悪い。最大SA-1時間だけで判断しない。新flag `--left-flame-hints` は素材31の幅64/66を全3色phase×横2位相でleft-inline対象へ追加するが、1698表示・2field間隔47回/3field間隔1回と悪化した。投影表をWRAMへ戻しても同じ表示間隔。旗は比較用のopt-in、採用しない。炎の単体でも中心14/6等で遅くなる。追加の左端静的検証6,546kernel/196,569ケース/108,103hint境界は正しい。

炎専用fixture `leftfixtureflame_flameinline_v1_complete_tracepalette` は450field/300表示全画素一致。表示metaから幅64高さ63・幅66高さ65×phase0/1/2×中心7位置×bottom3位置の全126ケースを確認。最初の汎用500画面fixtureは一部phase組み合わせが抜けるため全位相の証拠にしない。専用テストで位相とbottom周期を独立化した。証拠 `results/20261013_flame_inline/evidence.zip` は26,833,627bytes、SHA `ebebbf0d639b53ae504a2596cce25a075124368d9325a9b96e386ed2f76dbb31`。

現在buildはflameinline v2（WRAM投影）、SHA `46f9654f372fd695443b4daa041ab4062a055bdcbe23cacdebca7f3118f1faa4`。snapshot `fifoflameinline_v1_build`（ROM投影）/`fifoflameinline_v2_build`（WRAM投影）、各コマンドは追加results/commands.json。これを次の基準にしない。炎flagを外した逆順v5か既存配布版へ戻して比較する。

次の有力な具体候補は右端爆発の寸法拡張。道中の残る待ち区間（v5 field695..725）には素材41の幅76/82/85/88があり、現在のmin91では高速化対象外。幅88・中心234・bottom209は4.863839ms、幅85は4.030121ms。まず既に指定可能な `--reverse-explosions-min-width 88` を逆順v5条件で試す。native payloadEnd=0x7DF0D5、0x7E0000まで3,883B、0x7E0000..7EB000は使用不可。右端別表は21,988B、DF7080..8000/DF9200..C000/7EB000..7F0000へ置き、末尾は6,147B使用・約14KB残る。min85以下ではselectorが現在の0xA0B枠を越え得る（min91は12項目、8B/項目）。allocator開始を後ろへ移す等の拡張が必要。nativeコードは元の行を置換するため、全追加分を二重保持と見積もらない。

WRAM投影版でもDF0000..6FDEには非zeroデータ8,130Bが残る。以前の記録に「空いたROM28,638B」とあるが、この領域を実装の検査なしに空きとして再利用しない。直接planar、8位相cache、FastROM全移動等の棄却済み実験を繰り返さない。

## 右端の寸法拡張と容量圧縮（2026-10-13、d9179a4）

d9179a4e55fabecad0262806c1c5cabee8fa8df7を独立SA-1分岐へpush済み。60fps未達でgoalはactive、公開ROMは変更しない。結果はresults/20261013_reverse_widths/README.mdとcomparison.json、6証拠zip合計79,708,216bytes。全11試験に末尾停止なし。現在自分の試験プロセスは全て終了。

幅88の8byte行情報版は道中800field/656logic/645表示/168実PPU画素一致・2field間隔4回で従来v5と同じ。右hintを8項目checkpoint＋2bit差分（減少0/1/2/4）へ圧縮すると7,973→4,130B、全行情報27,143→23,300Bになるが、644表示・5回へ悪化。幅88の6byte行情報版は22,399Bで境界fixture348画面一致・最大8.843395ms、道中は未計測。6byteはcode low16/hint low16/control16（origin/2、extent/2、最大16種code bank、hint DF/FE bank）で全範囲・偶数・bank制約をassertする。

幅85の6byte版は26,243B、645表示・4回・最大22.766392msで全体改善なし。幅82の6byte＋hint圧縮版は24,028B（hint9,236→4,826）、644表示・5回・最大22.772725ms。新flag --reverse-full-row-fastで全体が見える行の解読を省くと境界fixture9.918206→9.700860ms、道中は同じ。幅79は右行情報領域不足でビルド失敗、native/left payloadEnd=8,313,425。失敗途中のROMを試験しない。全1,492寸法/native90,854行/弾158,688行を元ROM照合し、幅82は2,430kernel/88,204右端境界、左6,326kernel/190,929ケース一致。

stackfixturemin_*を追加。各348実PPU画面を照合し、表示metaから素材40/41×全対象高さ×横13位置×上端7位置の全組合せを検査する。幅88は高さ68/69、幅85は66/67で各364ケース、幅82は高さ64で182ケース。起動時の素材38/42は組合せ集計から除く。短いfixtureの表示成功をゲーム全体60fps扱いしない。

現在buildは幅82 v2、ROM SHA c7d2601f121be6640d93c80e1c8ddf20621f3d6beb7171160b2d5123854936b4。幅79の失敗後にv2を再ビルドし、snapshotのSHAと一致を確認した。snapshotはfiforeverse88_v1_build/v2/v3、fiforeverse85_v1_build、fiforeverse82_v1_build/v2。コマンドは今回results/commands.json。炎flagは全てOFF。

ホストのPython 3.10がsilent exit1した原因についてWindows Application Errorでpython310.dllの0xC0000005（03:04:19/02:34:26）とpython.exe不明module（03:09:22）を確認した。計測専用MesenCore.dllにも02:34:53の同種記録。ユーザーMesen PID36580は操作しない。bundled Python 3.12.14（C:/Users/owner/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe、NumPy2.3.5/Pillow12.3.0）へ検証を切り替え、静的/実行照合が完走した。根本原因や完全解決は未確定。

Git commit時にも新しいreverse88_v1_evidence.zipのloose blob 005875237bc63eee9b48c36f339e00293309a2baでzlib incorrect data checkが発生した。common gitはD:/AI/Nao_u_BOT/GPT/projects/monosh_fx2/.cache/github_export/.git。元zipのSHA256とblob header込みSHA1を照合し、壊れた内部コピーをbuild/sa1_game/git_corrupt_<sha>.zlib.brokenへ退避後、readonly属性を一時解除して同一内容をzlibで復旧、属性を戻した。push成功。6つ全ての証拠zipについて、保存SHA256およびcommit内blobの全byteが元ファイルと一致することも確認した。原因は断定しない。

次は右行情報を3byte程度のhint pointerだけにし、code pointer/originを既存native行から参照して重複をなくす方式を検討する。8→6byteの算術decodeも圧縮hintも実行費用があるため、容量だけで採用しない。幅79/76の全画像を維持しつつ対象を広げ、同じ道中/ボスで表示間隔を測る。DIRTY-IRAM単純追加、直接planar、PEA stack、SCPU FastROM全移動など既存棄却を繰り返さない。

## native行を再利用する3byte別表（2026-10-13、9cd254d）

9cd254dを独立SA-1分岐へcommit・push済み。前turnは3byte行情報実装・6試験の証拠を得たprogress。60fps未達、goalはactive。worktreeはclean、自分の試験プロセスは全て終了。公開ROMは変更しない。

--reverse-records-nativeを実装。各行はhint pointer3Bだけを別表に置き、code pointerをnative chainの+8、originを+1からrow*128を引いて復元し、extentをkernel headerから読む。開始行はnative chainをfirst*11、hint列をfirst*3進め、毎行11/3ずつ進める。compact/inlineとの併用は禁止。既存の全素材・全寸法を維持する。

幅79・非圧縮hint版は別表21,003B、hint9,813Bで収まった。SHA 8a2a2b4018203004f76829e04a286b2314e3a44d29a36af5fa1d1f0a54c01808。道中800field/655logic/644表示/168PPU画素一致、2field間隔5回、最大23.144466ms。幅76非圧縮は別表領域不足でビルド失敗、性能根拠へ使わない。幅76圧縮版は別表18,007B、hint10,219→5,357B、SHA 34e035dfcb49d1ba375595a246e33b41841d12a014de658df592860daccbad65。道中800/654/643/168一致・2field間隔6回・最大24.105575ms。最良の幅91 v5（645表示/4回）を更新しない。

専用stackfixtureminは各500field/348PPU画面一致。幅79は高さ61/62、幅76は59/60、素材40/41×横13×上端7の各364ケースを表示metaで確認。右端静的検証は幅79の2,726kernel/97,388境界、幅76の3,030kernel/106,488境界が一致し、native90,854行/弾158,688行/全1,492寸法を元ROMへ照合。左は従来6,326kernel/190,929ケースを維持。

--left-byte-constant-scanも別の比較用opt-inとして実装。途中のSTAから再開する時の直前LDA検索だけAを8bitにしてmaskを省く。草木・爆発の専用fixture500PPU画面一致・最大13.419768msだったが、道中644表示/5回・最大25.606418msと悪化。命令数減少だけで採用しない。SHA a924a80c6fc185469dbfe32b2593834d9a48af86a0b11f34cba81de24400633fで、現在のbuildはこの比較版。snapshot fifoleftbytescan_v1_build。新基準として採用しない。

証拠はresults/20261013_native_records/、zip46,319,653B、SHA f8b6d8044ea3ec24c2bb518cc205f754f78b4a0acb27116cfdda6152a6ecf7e0。commands.jsonとreport_sa1_native_records.pyで再現・集計できる。今回はGitの破損は起きずpush成功。全6試験は末尾停止なし、道中共通logicのpacketは配布固定map版と一致。

次の具体候補はI-RAM helperの繰り返しコピー削減。左helperは423B、逆順幅79非圧縮354B/幅76圧縮465Bで全て0300..04FF内。小さいedge JITは0500へ、大きいedge退避はビルド変換後0300..04FFへ、bullet words workerも0300へ置く。既存bullet residentは019Cを使い、非bulletのprepareで毎回0へ戻すのでそのまま共有tagには使わない。07FC..07FFは現在コードに参照がなく、row call chainは0700..07EF、JSL patchは07F0..07F4。ただし実装前に最新生成コードも再検索する。

helper再利用を試す場合は、rendererのsa1_clear_startでtagを無効化し、left/reverseロード完了時に別のtagを立て、bullet workerの0300コピーと大きいedgeの退避で明示無効化する。small edgeの0500コピーが重ならないようleft/reverseのsize<=0200をassertする。単なるコード先頭signature比較は部分上書きや画素との偶然一致を検出できないので採用しない。弾・左右端・通常描画を意図的に混ぜたfixtureを作り、cache hitと各evictionの後も全PPU画素一致を確認し、道中/ボスの表示間隔を測る。根拠なくhelperを常駐扱いしない。

## clip helper再利用と遮蔽上限（2026-10-13、77c28a4）

77c28a4を独立SA-1分岐へpush済み。前turnはcacheの実装と3試験、遮蔽解析の証拠を得たprogress。60fps未達、goalはactive。worktreeはcleanで自分の試験プロセスは全て終了。公開ROMはSHA9934d77b85913187be8d3ebd8315f854718eb24b08492204ce8b3288f620146cのまま。

--clip-residentを実装したが未採用。07FC tag（1左/2右）で0300..04FFのhelper再コピーを省き、rendererのclear開始・stack clear準備・弾workerコピー・大きなedgeの退避で明示無効化する。size<=0200をassertして0500以降のsmall edgeと重ねない。既存019C bullet residentとは分離。全試験のROM SHA2a194adb6075f789f1c17b5f76e32d87f362931ae96578e0151ba9d3f37886b0、snapshot fifoclipresident_v1_build。

道中800field/655logic/644表示/168PPU画素一致、2field間隔5回、最大23.108428ms。従来v5の645表示/4回を改善しない。cacheログは左hit9/miss59、右miss10/hit0と機会が少ない。ボス1900field/1705logic/1702表示/146一致、2field間隔43回＋3field間隔1回、最大22.375747ms。従来v5（1702表示・2field間隔45回・最大19.229351ms）も改善しない。配布固定map版のボス1742表示/2field間隔8回より悪い。共通logic packetは配布版と一致。短いfixtureと最大時間だけで採用しない。

新clipfixture_*は連続左爆発、弾7、大きいedge42、左右切替と連続右爆発を混ぜる。最初のframes600/presents240は194表示で上限に達したため、これを240合格の根拠にしない。user commentaryの240という誤りも194へ訂正済み。完了版はframes1000/presents240で706field/240PPU画面一致、末尾1field、左hit240/miss720、右hit239/miss240。弾とedgeによる有効helper破棄も各240回。ログから両hit/missと実際の破棄を検査するverify_clip_cache_coverageを追加。原寸/全縮小/native/弾/左右境界の静的照合も従来通り一致。

flag OFF再ビルドが従来v5のSHA7124eab2f29ffca6904f68d1c7ee705933dd0b341bbb0082db9366468fc4a7fbへ完全に戻ることを確認し、現在buildはこのOFF版。snapshotと実行ROMを混同しない。証拠はresults/20261013_clip_resident/、zip14,978,493B、SHAd6401e0aa287224ad474acbf9dba2c9f8739fb658dc72ef1c98878ee8a22e241。

次の根拠として、既存配布固定map版の世代530..570連続41画面で遮蔽を解析した。analyze_sa1_occlusion.pyは元絵と同じ縮小・反転から各spriteを独立合成し、最終sprite画素が保存FBと一致することを確認。word区切りはglobal x=0固定ではなく、spriteのleft byteを基準に0/2px位相でずらす。このprobeはwidth<=128をassertし、両viewport端に同時にはみ出す物体を除く。

454,780描画画素のうち後の物体に隠れるもの84,326（18.54%）。有効word126,381のうち非透明画素が全て隠れる21,292（16.85%）。遮蔽生成・判定・コード分割の費用を含まない楽観的上限で、実装速度結果ではない。奥のwordの全非透明画素が後の描画で覆われるなら、元のback-to-front順のままそのwordを省いても最終画素は保てるので、必ずしも全描画順の逆転やunder-blendは不要。

analyze_sa1_opaque_rects.pyで行全体に限定すると、隠れる4,705word（3.72%）。手前の爆発39/40/41の最大不透明矩形だけで奥の行を省く場合は71word（0.056%）しかない。矩形内部の全画素不透明もassert。矩形/行全体だけの遮蔽実装を有望扱いしない。JSONと解析入力41画面も証拠へ保存した。

次は手前の大きな爆発の「各行の最長不透明span」で、奥の4画素wordを何個安全に省けるか上限を測る候補。矩形whole-rowでは効果が乏しいので、word単位と区別する。元のcompiled kernelを実行途中で止めるにはROM自体を書き換えず、IRAMへのrowコピーとRTL/JML patch等の費用が増える。opacity maskを元コードから毎回デコードするだけでは描画を二度読む費用が大きいので、少量の事前span表と分割実行の容量・時間を測ってから採用を決める。direct planar辞書は既に描画20.514ms、全planeコードは28MB超で棄却済み、full-frame tile cacheも95%新規tileなので単純に繰り返さない。

## 不透明span・native分割の実SA-1比較（2026-10-13、953a6a2）

953a6a2を独立SA-1分岐へcommit・push済み。60fps未達でgoalはactive。これは計測と方式選択のprogressで、ゲームへ新機能を統合してはいない。worktreeはclean、自分の試験プロセスは全て終了。ユーザーのMesen PID36580を操作しない。ゲームbuildは逆順v5 SHA7124eab2f29ffca6904f68d1c7ee705933dd0b341bbb0082db9366468fc4a7fb、公開ROMはSHA9934d77b85913187be8d3ebd8315f854718eb24b08492204ce8b3288f620146cのまま。Python3.12で全検証を実行した。

結果はresults/20261013_opaque_spans/。証拠zip3,567,061B、SHA646eee00067d47e69a4b7be9114fe9d73d73653a8411f7bb59554bf7d47b5970。元のpacket/FB82ファイル、基準ゲームROM、専用probe ROM/labels/全596FB/実行ログを収録した。tools/report_sa1_opaque_spans.pyとcommands.jsonで再現・集計する。

tools/analyze_sa1_opaque_spans.pyで前の連続41画面を解析した。手前の爆発39/40/41幅64以上の各行で最長の完全不透明区間を1つ取り、奥の4画素word全体が含まれる場合だけ省く。合併13,840word、単一の手前spriteで13,686word（全126,381wordの10.83%）。2区間でも13,847wordで上積み小。矩形bboxの重なり面積最大を選ぶ方法でも、この標本では最良の選択と同じ削減量。省いたwordを元の順序で再合成して最終全sprite画素一致を確認。既存左右helperの対象に該当する省略は0、右min76へ広げても603word。画面内の素材40等が中心で、端のhelper拡張だけを実装しても効果が乏しい。

行全体省略は1,269word・118行・29連続区間（約1%）。現在のnative順で先頭に連続して隠れるwordに限っても13,465wordあり、spriteごとに左右どちらの向きを選ぶ上限と同数。この数はA依存・hint解読・chain更新の費用を除く。

tools/analyze_sa1_opaque_capacity.pyで全front対象76寸法のspan表はraw9,558B、行RLE10,527B。爆発39/40/41の幅49..79・5,665kernelのprefix境界はraw46,452B、圧縮24,675B、初期A込み232,218B。selector/pointer費用は別。tools/verify_sa1_native_fragments.pyは実ROMの8,096行・5,665kernel・77,421境界を入力FBに依存しないsymbolic表現で検証（任意prefix/suffix組合せ597,916区間に相当）。繰り返しSTAから再開する13,663境界とcross-word入力依存なしも検査した。

実SA-1の計測用game/sa1/v001/renderer_fragment_probe.s（389BのI-RAM worker）とtools/probe_sa1_native_fragments.pyを追加。build/sa1_fragment_probeへ別ROMを作り、108通りの2爆発と元の41 packetを各4方式で描く。最終ROM SHAfdace89548d4f22316261028933c6860a7538c190ca478ead6ca81b18b019dc7。全596FBが元画像の独立合成と一致。これは背景・CPU物理・音・変換・PPU転送を含まない描画microprobeであり、実PPU596画面一致や60fpsゲームの証拠ではない。viewport clipping・遮蔽候補選択・表形成はホストで事前計算した楽観的条件。

隠れない連続行をnative chainへまとめた最終比較では、道中41packetの描画時間合計がbaseline174.955553ms、prefix-DMA196.159736ms（+12.12%）、prefix-MVN196.438542ms（+12.28%）。2爆発108例も234.832338→261.085020/266.681821msへ悪化し、いずれも速いケース0。途中のprefixコピー＋suffix直接呼出方式は採用しない。

コピーなしの事前生成oracleでは、隠れる先頭命令だけを飛ばす。最初の残存命令がSTAなら直前のLDA即値またはLDA abs,X（BD）まで戻り、余分な隠れたwordも描くことで外部からAを初期化しない。内部だけ隠れる行はfallback、全隠蔽行はcall自体を除去する。全描画をnative chainへ事前生成しているため、形成・patch費用は未測定。道中で12,535wordを実際に省き、25画面が速く16画面同じ。時間合計160.786994msで約8.10%短縮、最良約19.85%。2爆発108例は165.846109msで約29.38%短縮。ゲーム全体で8%速い、60fps達成とはしない。

初回microprobeにはDMA clear起動レジスタの順序誤りがありFB不一致。次の一時版は計測開始callbackが行loop先頭と重なり最後の1行だけを測っていた。コメンタリの「全ケースで遅い」はこの時点では根拠不適切と訂正した。開始点をNOPでloopから分離し、各jobで開始callbackが1回だけとassertする。未groupの遅いdescriptor版をbaselineに残すと小さい改善が見えるが、これも最終判断へ使わない。最終596画面とnative chain基準の結果だけを上記の根拠にした。除外ログはevidence/excludedへ分けた。

次の具体候補は、コピーせず元nativeの安全なLDA/BD位置から再開する実ゲーム実装。既存11B行chainのJSL pointerだけをI-RAMの0700..07EFでpatchできれば、毎行9B descriptorを解釈する今回の遅い方式を避けられる。suffixがSTAの場合は直前loadまで戻すhintを作り、A初期化の追加命令を不要にする。全行が隠れる時のchain除去やprefix-table検索には実費があるので、oracleの8.1%をそのまま改善見込みにしない。

容量の案（まだ未実装）: 全front span raw9,558BはFF lookupの未使用末尾（used55,081B、残10,455B）へ入れる候補。assets39..41×幅64..128の65段×2B selector=390B、各widthのheight/pointer16列を小さくすれば収まる可能性があるが、実alloc/assertが必要。後方の安全再開hintはまず削減が大きい素材40・幅49..79のみに絞り、他寸法は従来へfallback。全1,492寸法・素材・色・物量は保持する。現行native/left末尾7DF0D5、7E0000まで3,883B、7E0000..7EB000は予約、右別表末尾後は約14KB。全3素材の境界表＋pointerを無条件に追加すると不足する。圧縮hintのdeltaが0/1/2/4以外になる場合のfallbackも既存compress実装を読む。

新helperを0300..06FFへ置く案も未実装。現workerは0300未満、小さいJIT0500とbullet worker0300へ重なるため、両横端に収まる対象だけを処理し、helperコピー時に019C bullet residentを明示無効化する必要がある。decline時にrendererのc0/c2 opaque boundsを壊さない。dirty計画・PPU契約は変えない。道中800/ボス1900で実PPU画素・共通logic packet・表示間隔を測り、成功後は長時間へ進める。

## 不透明先頭省略のゲーム統合とraw直接参照（2026-10-13、6e872b6 / 65756d3）

6e872b6（圧縮hint版の実ゲーム統合）と65756d3（inline raw hint・明示記録したバンク詰め物の再利用）を独立SA-1分岐へcommit・push済み。60fps未達でgoalはactive。今回の実装は正しいが表示間隔を改善しなかったため、どちらも未採用。worktreeはclean、試験プロセスは全て終了。ユーザーMesen PID36580には触れていない。buildは追加flagを外した逆順v5 SHA7124eab2f29ffca6904f68d1c7ee705933dd0b341bbb0082db9366468fc4a7fbへ完全復帰。公開ROMは9934d77b85913187be8d3ebd8315f854718eb24b08492204ce8b3288f620146cのまま。Python3.12使用。

`--opaque-prefix` は素材40・幅49..79・左右viewport内・反転なしのときだけ実行。後のpacket物体から素材39..41・幅64以上・反転なしでbbox交差面積最大の1個を選び、各行の最長完全不透明spanに隠れる先頭wordを省く。他素材・寸法・端のfallbackを残す。native行の直前LDA/BDへ戻るsafe hintを使い、外部A初期値を不要にする。0700..07DBへ20行ずつ既存11B chainをコピーし、JSL pointerだけpatchする。作業コードは0300..06FF、コピー時に019C bullet residentを無効化する。decline時にc0/c2を壊さない。

全front76寸法のspan表はFF lookup未使用末尾へ10,221B（末尾65302、残234B）。圧縮版はsafe hint10,807B、raw/2bit差分/4bit差分を最小選択。初回v1は4bit差分rank=0のBEQがCMP#2のflagsを読んで余分な差分を加え、世代545の8Bが不一致。v2でLDA rankを追加して修正。v1を性能判断から除外。v2 fixture300PPU画面が一致した。

v3は入り口を3BのBRL/CLC+RTL+NOPへ揃えた同配置比較。control/activeのlabelsが完全一致する。control800field/655logic/644表示・168PPU一致・2field間隔5回・最大23.185999ms。有効版は800/653/642・168一致・2field間隔7回・最大25.394100ms。実省略は19物体、655行patch、653行の開始位置前進、全隠れ1行。存在しない機能同士を比べたのではなく、実行費用が削減量を上回った。ボス1900/1703logic/1700表示・146PPU一致、2field44回/3field1回・最大19.062849ms、ここは対象物体0。

静的検査tools/verify_sa1_opaque_prefix.pyは全76spanを元PNG alphaから独立再計算し、1828kernel/2656行/23807word境界でsymbolic画素と安全なLDA/BD再開を検証。圧縮hint206raw/582差分2bit/1040差分4bit。全1492寸法・native90854行・弾158688行、右59519境界、左190929境界も既存検証と一致。fixtureは299構成画面で対象27寸法・front76寸法・中心8・top7の各要素を通過、全直積とは主張しない。300PPU一致のうち最初1枚は通常ゲーム画面。

証拠results/20261013_opaque_prefix/、zip25,552,943B、SHAd8e85b474c276ef1d54d4919616b5ad5c0cb7bb951e38bdaee002883e85d48fc。ROM/labels/Lua/全summary/packed FB/VRAM/PPU状態/画面RGB/省略ログを収録。tools/report_sa1_opaque_prefix.pyで集計。v3 active ROM SHA296c8b81b9162702a64c11c493ad864bf25070ee5ddc2152bc5081bd681ecaea、control d70e39070bddb7dc3690e96319880e4644cc085d54c567396a8a4c10495e41dc、fixture v2 19f4f61b0111e77dbb669d616b30dc6c6203284bd7f9abc7754f934e6ecd0620。

次に`--opaque-prefix-inline-raw`を実装。hint23807Bをkernel2B headerの直前へ置き、pointer3Bと圧縮展開を省いた。最初はcompiled allocationが7F0000へ達して容量不足。この失敗を速度判断へ使わない。allocator自身が記録した各bank丸めの空きへdeferred dirty表12,567Bをfirst-fitし、既存--reverse-records-nativeも併用して収めた。予約領域400000..440000/591300..600000/7E0000..7EB000を候補へ含めず、bank跨ぎを禁止。任意のゼロbyteを空きと推測していない。payloadEnd8310872、worker467B（653Bから縮小）。

raw v5有効は800field/654logic/643表示/168PPU一致・2field6回・最大26.086926ms。同配置controlも800/654/643/168一致・2field6回・最大23.184229ms。省略19物体/655行/653前進/全隠れ1行。rawで圧縮版より1枚増えたことを遮蔽自体の改善と見なさない。同配置比較では効果なし。raw fixture481field/303logic/301PPU一致、構成300画面で同じ全要素を確認、7091行patch/7077前進/3117全隠れ。

raw初回v4の監視は、省略選択前に別の弾workerがIRAMの同じcallbackアドレス048Fを実行して偽のbank不一致を出した。opaqueActiveを選択からexport opaque_prefix_finishedまでに限定するよう修正して全試験をv5名で再実行。以後のcallbackはこの実行区間でgateする。v3圧縮版では当該偽反応は観測していないが、今後の配置変更では無条件IRAMアドレスhookに依存しない。

新tools/verify_sa1_dirty_shapes.pyは元PNGの各色phaseのalpha和から全1492寸法のboundsを再計算し、全5992個の縦位相dirty表を実ROMへ照合。小さい743寸法は従来通りdirty表0。gapの範囲・予約避けも検証。raw hint1828kernel/23807境界、既存native/弾/左右端も一致。証拠results/20261013_opaque_raw/、zip18,903,064B、SHAd3725d82f2e13f8536f92bcd5eaafe48ca12ec30921f5228abc768a6ba2d34ac。active ROM6d72391a46d9fc9b6c5de063afa942dc85a5768d6137531a4f73b45f9b5e8580、control1a645606283649e4189254810ba61f2906344c6ffee226e23cd9800da74cd51a。tools/report_sa1_opaque_raw.pyで集計。

次は遮蔽の設定費をさらに追加するより、最良公開版fixedtableの遅延内訳を基準に戻す。逆順v5/FIFOのボス1702表示/45遅延より、公開fixedtableの1742表示/8遅延が良いので、前者を全場面の最良と誤認しない。既存summaryからbuild/sa1_game/public_baseline_hotspots.jsonを作成済み（未追跡の参考解析）。道中最大job557/field706: total22.048517ms、draw15.055823、dirty3.295484、clear2.952517、bg0.744694。0.5ms超の物体だけを記録するobjectJobsでは素材3が6.113346、41が4.550485、40が1.768753、10が1.525613ms。全物体合計ではない。ボス最大job1623/field1777: total21.865999、draw14.675141、dirty4.700969、clear1.773689、bg0.716199ms。記録対象は素材31炎5.418659、10が4.739708、14が1.090641ms。周期的な他の重いboss job1074等は炎31だけで8.004368ms。

公開ROMに一致するsnapshotはbuild/sa1_game/fixedtable_long_v1_build（同名fixedtable_v1_buildも存在）、計測元はmovestress_detinput_captureburst_fixedtable_v1_tracepalette / bossmovestress_detinput_fixedtable_long_v1_tracepalette。results/20261010_fixed_table/README.mdとcomparison.json、tools/report_sa1_fixed_table.pyが入口。report_sa1_fixed_table.pyはreleaseを更新する副作用があるので、解析目的でそのまま再実行しない。公開版の再現build引数をmanifestから復元し、まずSHA一致を確認してから次の変更を比較する候補。

未実装の候補: 炎31の左clipは--left-flame-hints（圧縮hint＋直前LDA検索）を既に試し、1698表示へ悪化した。同じものを単に再試験しない。炎は全2寸法×3phaseの220kernelと小さく、raw開始位置＋必要A即値の3B表をkernel直前へ置けば、圧縮展開とSTA再開時のROM逆走を減らせる可能性がある。ただし約7千境界×3Bの容量、IRAM再ロード、layout差の実費を測る必要があり、まだ速度改善と主張しない。道中の草木にも同じ表を全量追加すると容量が大きすぎるため、まずflameだけの容量算定と単体probeから選択する。今回のgapの実再利用はdirty metadataに限りnativeの自己改変やIRAM拡張はしていない。

## 炎の直接clip表と、草木全体の初期値辞書の容量（2026-10-13、4b3c97b）

4b3c97bを独立SA-1分岐へcommit・push済み。前turnは新実装・4試験・容量算定を行ったprogress。60fps未達、goalはactive。自分のMesen試験は全て終了し、ユーザーMesen PID36580は操作していない。公開ROM SHA9934d77b85913187be8d3ebd8315f854718eb24b08492204ce8b3288f620146cは変更しない。現在buildは下記の現行固定map基準（a9bcd247...）で、前turnの逆順v5ではない。

公開fixedtableと同じ設定を復元したが、現行ソースではROMはバイト一致しなかった。旧manifestとの共通項目はSHA以外全て一致し、実ROM差分23506B、低位の参照アドレスが1増えた箇所等がある。理由を特定したとは主張しない。旧公開ROMの性能を新変更前と見なさず、現行ソースの固定mapを新たに1900field測定した。SHAa9bcd2478e39f479b641ededc38d77abe4e693d2b958d1bd7b4f7ab20af603f7、snapshot flame_currentbase_build。引数列はresults/20261013_flame_direct/commands.jsonのbaseline（先頭tools/build_sa1_game.py、pythonは付けていない）。最初vram-prefill-count3ではfixed-mapの上限1によりassert失敗し、1へ修正した。性能判断に失敗buildを使わない。

--flame-direct-hintsを追加。炎31・幅64/66のnative行の2B header直前へhint pointer3Bを付け、各左clip境界は開始命令byte1B＋初期A2B。繰り返しSTA再開時のLDA逆走を不要にする。全3色phase×左右2pixel位相を保持。tools/sa1_flame_direct.pyのencodeで表生成し、compiler内のpoolと明示記録bank gapsへ割当。unique表は2490Bと予想より小さい。worker438B、補助データのgap利用合計10329B、最終payloadEnd8256430。草木は従来hash経路のまま。reverse/left-inline/left-flame/dirty-IRAM/residentとの同時指定は禁止。フラグOFFのROMは現行固定map基準のSHAへ完全復帰を確認した。

--flame-direct-hints-bypassは同じnative/補助表とhelperを保持し、fast gateの炎用BNEをBRAへ変えて従来経路へ戻す比較。active/controlはlabels完全一致、ROM差はbranch opcode1＋checksum4の計5B。active SHAdcbcb9ab7311093706e10d40e98354e3682e9122103f065266ae42634b377557、control7a58f1c94bd5bded1c28f09815ea6d0f176a7fdc664c60f536478b12842be61d。snapshot flame_direct_v2_build / flame_direct_v2_control_build。

ボス1900fieldは基準/active/control全て1750logic/1743表示/147PPU全画素一致。基準は2field間隔8回と同field内更新1回、最大18.954549ms。active/controlはともに2field7回、最大22.392881msで完全に同じ表示間隔。合計枚数だけfpsと見なさない。直接表はactiveで42job/2151行、control0行を実測し、機能が通っているのに遅延を改善しないと判断。共通1748世代のpacketも基準と一致。新方式は採用しない。

leftfixtureflame_direct_v2_tracepaletteは449field/307logic/300表示・全300PPU画素一致、末尾停止なし、最大9.348394ms。2寸法×横7(-40,0,16,30,64,128,250)×bottom3(40,120,205)×色3の全126組合せを表示metaから検証。直接表は131job/7442行。fixture自身は1field表示のためsummary.goal60fpsAchievedがtrueになり得るが、軽いfixtureの成功はゲーム全体の達成証拠ではない。親goalを完了にしない。

tools/verify_sa1_flame_direct.pyは220kernel/768行参照/5640byte境界を2種類の下地で元native全行へ照合（繰返しSTA境界188）。symbolic全入力の証明とは言わない。verify_sa1_reverse_explosions.pyへ--native-onlyを追加し、reverseを使わない版も全1492寸法・native90854行・弾158688行を旧ROMへ照合できるようにした。reverse falseではminimum256、右clip別表は読まない。通常reverse検証の分岐は維持。既存草木4998kernel/140509clip位置と全5992dirty縦位相表も一致。IRAM監視はsa1_left_hint_drawで炎選択時にactive、left_hint_finishedで解除し、flame_direct_row hookをgateする。

証拠results/20261013_flame_direct/、zip20,490,896B、SHA0d537867d289f0dc670d682bb71dcf7bbde73066e3db407c0bbe4213ba9a7b46。ROM3本、labels、Lua、全summary、VRAM/PPU状態、RGB、FB、行実行ログ、静的検証を収録。tools/report_sa1_flame_direct.pyで集計。commands.jsonはそのままPythonに渡す引数配列、baseline/active/controlを記録している。全てPython3.12。

次の有望な未実装候補をtools/analyze_sa1_direct_hint_capacity.pyで算定した。現行基準の全草木4998kernelは、初期A直書き3B表がunique3011種/154698B＋header pointer14994B。既存hint50079B＋hash49152Bより約70KB増え、そのまま全量追加は厳しい。一方、初期A値は全体で94種類だけだった（実CGRAM色数ではなくpacked4pixelのCPU accumulator値）。開始位置byte1B＋A辞書番号1Bにすればunique表103132B＋辞書188B＋header14994Bとなり、既存表を置換した増分は約19KB。既存gap約10KB＋末尾余裕約15KBを使えば収まる可能性がある。実allocator容量と速度は未検証。direct_left_capacity.jsonに全94値（sorted）と数値を保存した。炎だけの最大時間が悪化したからといって草木全体のhash除去まで不可能と一般化しない。

次turn案（下記9592649で実施済み）: --direct-left-hints等を独立opt-inとして作り、素材0/2/3/5幅64以上の全kernelを2B境界表＋3B pointer headerへ変更する。全flagOFFは現行固定map基準SHA一致を保持。既存hash49152Bを完全に除くため、sa1_left_hints.buildに新しいinline/indexed modeが必要。A辞書はCGRAMと無関係でゲームの色を変えない。sorted値94個をあらかじめ求めるか、compilerの生成順で辞書を作って最後に188Bを割当し、fixed-size far参照用のincを初回placeholder→再linkで確定する。cache hit時にもincと辞書addressをmetadataから復元する。table2Bを読んでlow8を開始byte、high8*2を辞書indexにし、A初期値を1回long loadすればhash探索とLDA逆走をなくせる。bank境界と予約ROMをassertし、全1492寸法・全clipbyte位置・dirty表・元絵とPPUを検証後、道中800とボス1900を測る。同じ初期値検索をinlineせず反復する旧--left-byte-constant-scanや--left-flame-hintsの再試行に戻らない。

## 草木の直接左端表を実装・比較（2026-10-13、9592649）

9592649を独立SA-1分岐へcommit・push済み。60fps未達、goalはactive。新方式は採用せず、buildは現行固定map基準a9bcd247へ戻した。公開ROM9934d77bも維持。ユーザーMesen PID36580は操作せず、自分の試験プロセスは全終了。

--direct-left-hintsは素材0/2/3/5幅64以上の全4998kernelを対象に、header前3B pointerと境界ごとの開始命令byte1B＋初期A辞書index1Bを置く。共通初期値は生成順の94値・188B。hash検索とLDA逆走を除いた。unique3011表103132B、header14994B、gap再利用11535B、payloadEnd8319685で8MiB内。worker313B、initialValueTable=16708105。compiler cache/metadataからincを再生成し、二段階linkでもlabel一致。default flagOFFはSHAa9bcd247への完全復帰を確認。試験ROM SHA61b2a071fdcacf2303bf198ce5672fd6e3ce615f875448be1a26468f164b8973。snapshot build/sa1_game/direct_left_v2_build。

道中800fieldを現行ソース基準でも新測定: movestress_detinput_captureburst_directleft_currentbase_tracepaletteは654logic/647表示/168PPU全画素一致、間隔1:640/2:4、最大22.002049ms。active directleft_v2は653logic/646表示/168一致、1:638/2:5、最大22.961669ms。direct helperは53job/1394行/素材0,3,5で実行された。共通652世代packet一致。草木hash除去は全体改善にならず不採用。同配置無効controlは実施していないので、ROM配置差とhelper単独効果を分離したとは言わない。

ボス1900field activeは1750logic/1743表示/147PPU一致、1:1733/2:7、最大19.036217ms。既存新基準は同1750/1743/147、0:1/1:1731/2:8、最大18.954549ms。共通1748世代packet一致。active対象草木経路は0行のため、ボスの間隔差をこの最適化の効果とは扱わない。

leftfixtureindexed_directleft_v2_tracepaletteは1749field/1607logic/1600PPU全画素一致、末尾0、最大15.116072ms。全69寸法×横中心14(-40,-39,0,1,16,17,30,31,64,65,128,129,250,251)×上端3(-20,30,180)の2898直積を表示metaから確認。30175行/750job/全4素材を通過。初回CLIは画素照合後のcoverageで、通常ゲームの最初1画面（asset38/42）までfixtureと数えてassert失敗。present00001_meta.binだけをfixture coverageから除く修正後、保存済み全metaを再検査し2898直積合格。Mesen自体は再実行していない。通常初期画面を含む1600画素照合は初回で完了しており、失敗ログ・修正後host検査ログも証拠へ保存した。軽いfixture.goal60fpsAchieved=trueを親goalの成功に流用しない。

verify_sa1_left_hints.pyにindexed初期値対応とsymbolic検証を追加。4998kernel/140509clip位置で実行一致し、さらに可視wordの元下地mask/valueの記号式を比較して任意の下地入力でも一致することを確認。left_hints_verified.jsonにsymbolicClipBoundaryChecks=140509/arbitraryFramebufferInputsVerified=true。全1492寸法/native90854行/弾158688行、全5992dirty縦位相表も保持。

証拠results/20261013_direct_left/。evidence.zip36649593B、SHAfc6235cbd10bbcd617036b64f49892890a285885282902dd3b54d289f8a975a5。tools/report_sa1_direct_left.pyが全5scenarioと2ROM、Lua/VRAM/PPU/RGB/FB/packet/直接行ログ/静的結果を収録。commands.jsonは前項flame_directのbaseline＋--direct-left-hints。実行はbundled Python3.12。

次の焦点として基準hotspotを再確認。最悪field706はSA1total22.002049=draw15.037943+dirty3.269317+clear2.952517+bg0.742273ms。右端で切れる爆発41幅94高さ74中心265/bottom203が単体7.117012ms、40幅94中心267が6.854781ms。objectJobsは0.5ms超だけの記録で全物体合計ではない。既にreverse91～76、native3Brecords、可視prefixコピー、IRAM右窓を試して全画面では退行。過去の右端試験入口results/20261011_right_clip/README.md、20261013_reverse_native、reverse_widths、native_records。単体の改善を全画面改善と混同しない。dirty-IRAMも過去に試し遅延が増えて不採用（20261010_map_probe）。同じ案を新案として繰り返さず、まだ測っていない構造上の費用を探す。

## 左右二面の容量算定と、コピー不要のCC1実転送（2026-10-13、ceac64c/47ca1a8）

ceac64c（算定）と47ca1a8（独立転送ROM）を独立SA-1分岐へcommit・push済み。60fpsは未達、goalはactive。game本体は現行基準a9bcd247、公開9934d77bのまま。新probeは別のbuild/sa1_split_cc1で、gameのbuild ROM/LBLを変更しない。自分のMesenは全終了、ユーザーのMesenは操作しない。

新候補は「512px幅へ描いて中央をコピーする旧padded-pipeline」の再試行ではない。通常256px幅のbitmapを二面用意し、それぞれ中央128pxだけを可視域とする。余白は左右64px。左はglobal x0..127の物体をx+64、右は128..255の物体をx-64で描き、各面のpacked byte32..95を連結する。全素材・寸法・色・painter順は維持する。中央を跨ぐ物体は二回描く。最大幅128程度の爆発は画面の左右端で切れていても余白内に収まりやすい。一番左へさらに外れた物体は従来の端helperが必要。

Mesenのcached source .cache/Mesen2（commit b9fa69ddc6d0a331fb103fdb5eef6904305703c2）のSa1.cpp:325でCharConvWidthはmin(value>>2&7,5)、最大256px。512pxのままCC1を読む新案はこのエミュレーターでは使えない。一次ソースURLはresults/20261013_split_viewport/README.mdへ記載。実機の未定義値を測ったとは言わない。PDF manualはweb fetchが13MB上限で失敗し、コードを根拠にしている。

tools/analyze_sa1_split_viewport.pyで現行基準道中packet_trace653件を解析。元6264物体→二面6965、native命令byte＋11B行macroは5248257→6137718（1.169477倍）。端は左239/右365→左15/右2（604→17）。重い530..570の41packetではnative1062117→1123641（約5.79%増）、左43/右57→左8/右0。全41packetのホスト参照絵を二面から連結し、原画の元256px絵へ全画素一致。速度測定ではなく命令量算定。圧縮弾6/7/8/37はこの入力に0件。dispatch/clear/dirty/転送/キュー費は含めず、速いとはまだ言わない。analysis.jsonに全653件、originalとsplitを保存。

1画像は2×192×128=49152B、三画像147456B。既存deep-BWの40/41/42各bankの0400/8400を一画像の二面として使えば、native stride128を変えずデータ生成も再利用できる候補。raw七画像→三画像となるため描き溜め減少の退行を測る必要あり。元のdirtyをglobal256pxのまま計算し、消去・転送sourceだけ左右へ写像する案。中央を跨ぐrunはsplitしdescriptorが増える。wide-clearが余白を余分に消さないよう、消去量/設定費も要検証。表示中央128pxの境界はword整列している。余白は表示しないが、generic左/右端保護が動く遠方offscreenケースは残す。

コピーを省ける転送条件は実DMAで確認済み。新game/sa1/v001/split_cc1_probe.sとtools/probe_sa1_split_cc1.pyは小さいSA1 workerとSCPU DMAループを持つ独立8MiB ROM。ホストが二面bitmapを生成しBW40/41/42へ置くので「SA1描画したprobe」ではない。SA1 workerが2230=B1、2231=15、SDA=bank:0400、DDA=07C0でCC1を開始する。SCPUが各band中央16tileずつ、左source0500+band1024/右source8500+band1024からPPU DMAし、source baseを変更せずvirtual +8000の右面を正しく変換できた。SNES VRAMの実24576Bを期待planar絵へ照合した。

41ゲーム画像＋全16色・各行/tile/左右が異なるpatternの42jobが全画素一致。bank40/41/42を全て通り、prefix metadata用6A00/EA00のguard128Bも変更なし。ROM SHA6c23de6bd25d8ac19479fb7d2598934379a370db370624f2c8395f33b8374669。48descriptor/24576Bの全画面転送は10.115903～10.117765ms。常時forced blankなのでVBLANK内に収まった証拠ではない。ゲームでは引き続きdirty転送が必要。初回ROM header名が1B長いlink失敗は修正し、失敗ログもarchiveへ入れた。失敗版の性能値なし。

証拠results/20261013_split_viewport/cc1_transfer_evidence.zip402378B、SHA87e7c66d09a4539404f25ea94129e13a035d45971a9fef92b73f2b810165dee6。ROM/LBL/cfg/map/Lua/入力二面/期待と実VRAM/timings/logを収録。cc1_transfer.jsonはhost入力・描画未測定・game未統合・forcedblank・visibleRasterTimingVerified=falseを明記。probeは単独python tools/probe_sa1_split_cc1.pyで再現。

次turnは実SA1描画の費用を測る段階。案1: test_sa1_game.pyへsplitfixture専用のpacket replayを追加し、保存済み530..570の41packetを「元256px」「左面+64」「右面-64」の123jobで順に繰り返す。元のfull描画と左右合計drawMsを比較し、全fixtureのVRAM/PPU/絵と中央再合成を検証する。元packetのdepth/painter順・phase・flipを維持し、sourceから選択した物体だけを各面へ送る。ホストでspriteを実描画するのではなく、fx_packetへ座標/寸法を渡して既存SA1rendererに描かせる。既存logic_finished fixture注入部が入口（test_sa1_game.py658以降）。最初通常ゲームframeはcoverageから除くが画素照合する。こうしたfixtureではゲーム時計は元通りでもpacketが試験内容に置き換わるので、summary.goal60fpsAchievedをゲーム達成証拠に使わない。IRQ/転送競合やCPU物量がjob間で異なるため、単独測定を最終性能とせず傾向を見る。

必要なら次に専用renderer replay ROMで純描画を測り、統合へ進む。統合では二面のnative f8 offset/rawbankは0400/8400、元dirty tile x<16はCC1source band*1024+256+x*32、x>=16は+8000+band*1024+256+(x-16)*32へ写像できる。source base0400の同bankなのでbank切替なし。元の可視転送byte数は増やさないが、descriptor分割・三面キュー・消去loopの費用は増え得る。この項の時点では未実装。続く項で実測と統合の結果を記録する。

## 左右再生・二面統合・近景packedコピーの実測（2026-10-13、0b4a31f/7b0fcb6）

独立SA-1 branch experiment/sa1-4bpp-60fps-20261010へ0b4a31f（再生）と7b0fcb6（ゲーム統合比較）をcommit・push済み。60fps未達、goalはactiveのまま。公開ROM SHA9934d77bは変更していない。最後に通常buildへ戻し、ROM SHAが現行一面基準a9bcd2478e39f479b641ededc38d77abe4e693d2b958d1bd7b4f7ab20af603f7へ完全一致することを確認した。正常道中130表示/120全画素照合の最終smokeも終了コード0（279field/137logic、最大7.241609ms）。起動play_sa1.cmdの配布ROMは既存のまま。ユーザーのMesenを操作しない。全自前Mesen試験・report processは終了済み、未回収handleはない。

再生はtools/sa1_split_fixture.py + test_sa1_game.pyの--split-fixture-source。実packet530..570の41画面を一面・左+64・右-64の123job周期でSA-1へ渡す。500PPU/VRAM/RGB全画素照合、165組の左右sprite再合成一致、全41画面・499packetの全byte対応が通過。平均draw9.933918→左右計6.837607ms（約31.17%短縮、136/165組で高速）。ただしdirty2.956178→3.927190、clear0.977020→2.984176、bg0.712409→1.484172、total14.579524→15.233144（4.48%増）。通常一面ROMを使う部分画面fixtureなのでゲーム統合・二面同時所有権の試験ではない。近景stripは元位置へ描き、左右再合成はsprite alpha内だけを比較する。各表示のstripを含む全画像は通常PPU検査で照合。fixture.goal60fpsAchievedは強制false。

初回fixtureは最初の通常packetが注入hookより先に取得される位相差を無視してhost verify失敗。後続の全packet列から一意な位相1を決定するよう修正してMesenを再実行。v2は全検査とterminal終了コード0。証拠drawing_replay_evidence.zip11225934B、SHA c821d50da594575338295daced011ef2979e2fa270e94f41fe00ab18df87c666。再生500presentsは712fields/507logic、間隔1=435/2=62。これを全ゲームfpsとして使わない。

ゲーム二面統合はtools/sa1_split_viewports.py、game/sa1/v001/split_clear_game.s、build_sa1_game.pyの--split-viewports。三raw画像＝bank40/41/42各0400・8400。metadata pipeline_depth8は維持、rawbusy回転だけ14→6、prefill_count3。全体dirty計算は一回、occupancy raw履歴7→3、VRAM二世代前の履歴は維持。元packet順に左可視0..127に掛かる物体を+64で一回、右128..255に掛かる物体を-64でもう一回描く。draw_startのhookが二回走らないよう初回のみに置き直した。draw後019A/10を0400へ戻してtransfer/prefixを作る。01B0..01B9はpass/消去/旧近景の一時状態で、既存参照に重複がないことをrgで確認。未対応flag組合せはassert。

global dirty範囲をold raw画像の左右中央へ写して消去する。最初は先行消去なし、次に三組用idle-clearを追加した。idleは転送完了したbankだけ、左右の必要面を消し終えてから履歴を空にする。元の消去helperの32B以上を1KiB wideにする候補も実測したが、余白まで転送する費用が勝ち退行。--split-wide-clear-min32で現在の候補を作れる（default128でhalf最大64Bなのでwide不使用）。否定試験の途中でhelperへ分岐を追加しているため、初期noidle/idle ROMの正本はsnapshotのROM SHAとtrace。全候補を現在のsourceからbyte同一に再buildしたと主張しない。

転送maskのrunは最大256B（8tile単位）なので、512B half/band境界を跨ぐmergeだけを止めればdescriptorが半面に収まる。最大48枠は従来通り。超えたときは各half内の隙間を広く送るfallbackを繰り返す。sourceは元band+globaltileから左0500+band*1024+tilex*32、右8500+band*1024+(tilex-16)*32へ写す。CC1 base0400のまま、中央CPUコピーなし。全output jobで個数<=48、各sourceのhalf内位置100..300、元global座標とVRAM destination、sum bytes==0118をLua assert。recordの208..495内に収まる。prefix表6A00は192B以下。実PPU/VRAM/RGBと原画の全画素照合も通す。

道中800fieldは、基準647表示/2field待ち4/最大22.002049ms。二面noidle645/7/20.486214、二面idle646/6/19.571201、wide32=644/8/20.794540、二面packed近景647/5/19.094790。一面packed近景647/4/21.831450。全6方式168画面一致。最大SA-1だけ短くなっても全体表示は改善しない。重い41世代の二面packed平均はdraw7.531129/dirty2.996940/clear3.724563/bg0.357297/total14.609929ms。基準は9.707632/3.046567/2.734632/0.788555/16.277386。出力準備やIRQ/PPU競合は別費用（最大output21.742612ms）。

1900fieldボスは基準1743表示、間隔0=1/1=1731/2=8、最大18.954549ms、147画面一致。二面packedは1612表示、間隔1=1471/2=137/3=1、最大23.344771ms、144画面一致で大幅退行。中央128pxの境界を跨ぐボス・弾を両面に描くため。対称二面の固定128px境界は不採用。全sceneの共通packetはbyte一致（split boss1613世代、road各647～650世代）。三raw化で先行消去の機会・描き溜めも減り、最大drawだけで判断してはいけない。

近景だけの新候補は--split-near-packed/--near-packed。元background4.binの512×9pixelを偶数・奇数位相ごとにpacked化し、横wrap用に各行を二回連結する9216BをFE0000へ置く。旧近景compiled code用45KiB内の置換で、他sprite code/hintに重ねない。build時、全512scroll×9行×左右9216区間について、透明0も含めて元pixelと一致することを検査。sprite前にstripを置くので0も直接書ける。0700..0703にMVN/RTLの一時workerを作り、destination bankを0102から設定。各copyでPHB/PLBしDBRを戻す。spriteの0700一時codeとは時間を分け、07F0の呼出opcodeを変えない。SA-1がROM→BWを実コピーし、ホスト描画はしない。二面bg約1.28→0.36ms、一面bg約0.79→0.31msへ短縮。

一面--near-packedは従来の七raw画像を維持し、near_patch_game.sのpainting部分だけを変える。ROM SHA3fb3e2e93f0a6b7332e23068f0cfcb5580c7ec9ea25c3a178b65fdf0ae7d9645。ボス1746表示、間隔1=1739/2=4、最大18.662054ms、147画面一致。output最大20.222494ms（基準20.641728）。道中の待ち4回はそのまま。微改善の独立opt-in候補として残し、公開ROMへはまだ採用していない。全9scenarioとも共通世代までpacket全byte一致し、素材・全縮小pattern・順序・時計を維持した。

二面初回buildはBOOTが2B不足し、消去helperをGSUへ移して解決。最初の130表示smokeはverifierが0102の上位byteをmaskせずbank値assertで停止した。bank&255へ修正してMesen再実行し130表示/120画面合格。その後の800/1900試験は全てexit0。失敗logを削除せず保存した。summary.jsonができただけで終了と扱わず、必ずexec terminalを回収した。

新結果入口results/20261013_split_viewport/README.md・integrated_comparison.json・integrated_commands.json。integrated_evidence.zip39838107B、SHA0350d67810ff0fd34635bbb46c295626f75da4685b941c5f1d48cc488e8dc8f7。6ROM・全9scenario・Lua/PPU/VRAM/RGB/FB/metadata/packet/timing/labels/logを収録。tools/report_sa1_split_integrated.pyで再集計できる。build snapshots: flame_currentbase_build、split_integrated_noidle_build、split_integrated_idle_v1_build、split_integrated_wide32_v1_build、split_integrated_packed_v1_build、near_packed_v1_build。全てbuild/sa1_game以下。再生reportはtools/report_sa1_split_replay.py。Pythonは必ずbundled3.12を使う。

次の構造候補は未実装。固定±64pxの描画biasを維持したまま、可視域の分割境界だけ64pxまたは192pxへずらすと、ボス中央128pxを二回描く費用を避けられるかもしれない。ただしN64は右canvasの左端(global64)で新たなclipを生み、N192は左canvasの右端(global192)で新たなclipを生む。重い爆発を境界に掛けると旧helperが戻り、かえって遅くなる可能性が高いので、まず全道中・ボスpacketのopaque bounds/nativeBytes/clip countsをtools/analyze_sa1_split_viewport.pyの計算を拡張して比較する。nativeBytesは速度ではない。二面のbiasは変えず、CC1 sourceはleft=origGlobalTileByte+0500、right=origGlobalTileByte+8300で境界に依存しない形にできる（band分は元global offsetに含む）。N64/128/192は8tile mask byte境界なのでrun自体を追加splitせずmerge条件の変更で対応可能。ただし消去・idle・近景の切れ目とverifierも変更が必要。分割位置をフレームごとに動かす案は旧paddingの絵が新可視域へ出る危険があり、rawごとの履歴や両面のpadding消去を別途設計するまで実装しない。

一面packedの最大爆発の端費用は依然主要なボトルネック。以前のreverse/右prefix/MVN/native records/IRAM右窓・草木direct hintsを新案として繰り返さない。二面の単独描画31%短縮も全体fps達成に流用しない。近景短縮は確認できたが全体60fpsはまだ未達で、goalをcomplete/paused/blockedへ変更しない。

続けて30d22d8を実装branchへpush。tools/analyze_sa1_split_viewport.pyに--boundary64/128/192を追加し、±64のbiasを固定した六案（道中/ボス×3）を全packetで算定。境界ごとの246組のhost参照再合成は全画素一致。sourceROMは基準a9bcd247でbuild/配布ROMを変更しない。結果boundary_analysis.json、README末尾に要約。nativeBytesは可視行のみでbottom slack・圧縮弾worker・helper・dispatch/clear/dirty/PPU/キュー費を除く。opaque boundsでの選択で実装の保守的な全geometry選択より少なくなる場合あり。速度未測定。

道中のnativeBytes/左clip/右clipはN64=5981064/404/0、N128=6137718/15/2、N192=5964063/7/374（基準5248257/239/365）。重い41世代はN64=1334739B/84/0、N128=1123641/8/0、N192=1385319/4/63。非対称案では重い場面の命令量も端helperも増える。ボス全体はN64=39629280/1788/0、N128=48584001/0/198、N192=42678396/0/2332（基準35953050/267/222）。重複は減っても新境界のclipが大幅増。対称二面の既測退行を改善する確証がないので、64/192版の実装はまだ行っていない。

次の別構造の調査候補（未検証の推測）：現行のSA-1 jobはnew dirty計算→old raw消去→近景→sprite→転送準備を直列に行う。old raw消去は本来、そのrawの旧occupancyだけあれば着手できる。S-CPUがnew dirty/mask/occupancyを並行計算し、SA-1が旧rawの消去・描画を先行する形へ依存関係をほどけないか。過去--cpu-dirtyは全体退行しており、同じ試験を繰り返す前にresults/20261013_cpu_dirty等の実際の入口をrgで探して、serialized待ちと新案の違い、SCPU実測cost、BW/ROM bus競合、両CPUのqueue所有権を読むこと。dirty3msを単に遅いSCPUへ移すだけでは改善しない。new dirtyが不要な描画開始・old history消去と、new transfer metadataが必要になる時点の依存関係を図にして可否を確かめる。最大draw15ms+clear約3msのburstが残るので、planner並行化だけで達成するとはまだ言わない。

## 2026-10-13 消去端の探索は不採用、座標変換短縮に小さな改善

実装branchへ`cb2d99e`をcommit/pushし、clean/upstream一致。results/20261013_mask_bounds/README.md・comparison.json・commands.jsonが入口。通常buildは基準a9bcd247へ戻し、130表示/120画面照合、279fields/137logic、最大7.241609msのsmoke合格。公開ROM9934d77bはそのまま。60fpsは未達でgoalをcomplete/paused/blockedにしない。ユーザーのMesen PID36580へ触れていない。

前節のCPU並行planner案を調べた結果、過去版は既にSA-1前frameとS-CPU次packetのdirty計算を並行実行していた。実入口はresults/20261011_cpu_dirty。全移管ではSCPU dirty最大12.259937ms＋logic最大10.973740ms、576表示/70二field待ち＋一回三field待ちへ退行。small版602表示/46待ち、shapes-only634表示/14待ち。単純な並行移管を未試験案として繰り返さない。

`--mask-bounds`を追加。物体ごとの帯左右端更新を省き、完成した432800の24×32bitタイル集合からI-RAM0120/0122の新消去端を一度だけ求めてoccupancyへ渡す。byte探索表512BとGSU helper。`--mask-bounds-wide-table`はbyte位置ごとの加算も表へ畳み込み2048Bにする。DP E0/E2（初版はE4/E6も）を一時使用、直後のoccupancyはそれらを初期化する。元版は空矩形により空帯0..0/128..0が混在し、非空帯でも余分に広い端を持つ。基準版traceのjob122/band19と330/band3で「常に厳密な外接範囲」というverifier仮定を棄却。元版は集合包含、新版は厳密一致で判定し、実画像全byte一致で消し残しを確認した。初版表拡張は出力ループが256項目のままでjob3に失敗。1024項目へ修正してwide_v2を最初から再実行し、失敗Lua/メッセージも証拠へ保存した。

新`tracebounds`計測は各jobのgen2B＋集合96B＋新消去端96Bを保存、LuaとPythonの独立bit探索で検査。全描画完了jobの24576Bバッファも保存して比較。道中800fieldの全6方式で168画面の元絵/FB/VRAM/PPU/RGB照合が通り、基準との共通652～653世代はpacket・タイル集合・全バッファがbyte一致。表探索方式で消去範囲が減ったのは12帯だけ。範囲計算の費用の方が高かったため不採用。

別の`--dirty-tile-round`は元の範囲計算を維持し、dirty4箇所＋row_dirty2箇所のLSR×3/ASL×2をAND #FFF8/LSRへ短縮。16bit Aの全65536値で結果が同じ、Cはどちらも0、N/Z/Vも同じ。道中全653世代で元の新消去端も完全一致。素材や転送範囲を変えない小さな改善としてopt-inで保持する。

道中800field結果（表示枚数/二field間隔回数/最大SA1ms）: 基準647/4/22.002049、表探索646/5/24.153347、表拡張646/5/22.108860、表拡張＋近景packed647/4/22.883726、座標短縮647/4/21.850168、座標短縮＋近景packed647/4/21.789173。重い41世代の平均dirty/clear/draw/bg/totalは基準3.046567/2.734632/9.707632/0.788555/16.277386ms、座標短縮単独3.000763/2.736524/9.718337/0.786349/16.241973、組合せ2.956205/2.659678/9.661603/0.307372/15.584858。表探索＋近景の改善は近景によるもので探索の採用根拠にしない。

組合せ版の新1900fieldボス試験は1747表示、間隔1=1741/2=3、最大18.603014ms、最大output20.163455ms、147画面合格。前の基準1743表示/二field8回、近景単独1746/4回より少し改善。基準との全共通packet1748世代一致。ボスは1752描画完了バッファを保存、1753dirty範囲を検証（最後のjobは描画完了前に計測終了）。基準ボスには全世代FB traceがないので、全ボス世代を直接FB比較したという主張はしない。独立PPU照合は147画面。

全1492寸法/native90854行/弾158688行を旧ROM94c0c2e1へ照合し、dirty5992縦位相表を元alphaから再計算した。組合せROM SHA6fdf2ba35fff0904fdc6f7f8dc7c67bf6586b1fe523d51241518018f09226d7e、snapshot build/sa1_game/maskbounds_roundpacked_build。wide合格f6eb2f85、初版mask bcad3084、packed mask fe726ee2、round単独2691a9a9。通常buildと混同しない。evidence.zip45,162,325B、SHA8a95f73f9eed025bb953c9c8162ca95ad2c14e0fb4926c5f7352e575a22c04bb。6ROM＋今回6道中/1ボス＋過去2ボスの全9シナリオ、labels/map/全buffer/metadata/PPU/VRAM/RGB/Lua/logを格納。tools/report_sa1_mask_bounds.pyで再集計。default復元smokeはzip作成後でローカルのみ。全Mesen/host検証のterminal exit0を回収済み。

次のボトルネック: 組合せ道中job549はdirty3.622155＋clear5.509638＋bg0.301435＋draw12.355945＝21.789173ms。job557 draw14.694790。job429の右端爆発41（94×74、centerx265、bottom203）だけで6.206934ms。40/41の右端爆発とold raw消去を優先する。元素材/物量/クロック/縮小寸法の削減で達成扱いしない。

次の未実装候補: 現行large_edge_cacheは既に全native描画の前後で、隣接行のはみ出し部分だけをI-RAM0300..06FFへ退避・復元している。edge_prepareはshape全体bbox C0/C2を使って全行共通幅C4、最大22行のchunk限界DAを決める。PPU変換中011E!=0（または幅<9）ではedge_cpu_game.sが既にMVNでコピーするので「MVNに変える」は新案でない。07EC..07EFがMVN/RTLの一時worker。次は既存の8行帯alpha表で、実際にはみ出さない帯を省き、退避幅を帯ごとに小さくできるか、まず実packetからコピー量と追加解読費を算定する。位相/左右flip/odd nibble/上下端/キャッシュ所有権とchunk境界を維持し、最初は40/41の非反転経路だけに限定してfallbackを残す案。CPU copyだけでなくDMA側も同じwidth履歴で復元する必要がある。過去reverse/right-prefix/I-RAM右窓の再実行にはしない。

512px一面をCC1で直接変換すれば中央コピーを消せるという思いつきには注意。ローカル.cache/Mesen2/Core/SNES/Coprocessors/SA1/Sa1.cpp:325はCharConvWidth=min((value&1C)>>2,5)、ReadCharConvertType1はtilesPerLine=1<<CharConvWidth、4bpp bytesPerLine=tilesPerLine*4。現行MesenのCC1は最大256px stride128Bで、stride256Bの512px rawをそのまま読み出せると仮定できない。未測定の512直接案を完成扱いせず、過去512paddedの平均4.7ms中央コピー退行と区別する。

## 退避DMA切替・遅延JIT・alpha帯・1024B cacheの比較（2026-10-13、0d6323a）

SA-1独立branchへ0d6323aをcommit・push。60fps未達、goal active。公開ROM SHA9934d77bは変更しない。通常buildをa9bcd247へ完全復元し、279field/137logic/130表示・120画面全照合のsmoke終了コード0、最大7.241609ms。全自前Mesen・host検証・report processは終了済み。ユーザーMesen PID36580には触れていない。

tools/sa1_edge_band_guard.pyにsource変換、build_sa1_game.pyにopt-in flagを追加。--trace-edge-cacheは命令列を変えずfastのsave/restore後labelを公開。実測すると従来small-edge-jitは32B以下をDMAが空いていてもCPUコピーしていた。--edge-dma-min 9/13で空きDMAへ回し、--edge-lazy-jitで512Bコードロードを最初のCPUコピーまで遅延。寸法・offset・chunk長は先に確定し、読み込みとbank patch完了前に使わない。幅10/12はCPU、14以上は空きDMAの方が速い傾向。PPU変換中011E!=0は従来CPU経路を維持する。

--edge-band-guardは40/41の非反転・右端・元cache幅<=32・w>=32/h>=24だけ、既存8行alpha帯RLEを走査してchunkごとの右端を求める。01B0をロード済みwidth tag、01B2原幅/01B4active/01B6table/01B8bankに使用。split/clipresident/dirtyIRAM/gameoffloadなど重複組合せをassert拒否。幅0は退避なし、元chunk長・512B上限を保持。帯縮小で77chunkが短くなり、片道110828→105252B。ただし判定費用が勝って退行。v2は非active helper呼出しを省く。game/sa1/v001/edge_band_guard_game.sがhelper。v1 snapshotに旧helper/sourceを保存、同じflagでも現在のsourceでv1がbyte同一になるとは主張しない。

--edge-jit-max12は幅<=12だけ512B cacheとJITを使用。幅>=13はJITを使わず元の1024B cache/DAを維持し、DMA空きならDMA、使用中ならMVNを使う。広いcacheは0500..06FFの旧JITを上書きするが、そこでJITを実行せず次の小さい退避では必ず再ロードする。bandguardとの組合せは未対応として拒否。右爆発41（job429,width94,height74,left218,top109）は基準5chunk/退避復元4.140ms→4chunk/2.591ms。ROM SHA24bac32420842cb352a0c81b9446ac80ab70f54667e3591643eb0b33a04d5c46。snapshot build/sa1_game/edgeguard_large12_build。

道中800fieldの全7方式は647表示、1field間隔640回/2field間隔4回、168画面の原画/FB/VRAM/PPU/RGB照合に合格。共通653世代の全24576B FB・packet・転送集合・消去端が全byte一致。基準は前回roundpacked SHA6fdf2ba3（通常default a9bcではない）。最大SA1/重い41世代の平均draw/平均total(ms): base21.789173/9.661603/15.584858、dma9=21.789173/9.693766/15.617022、lazy9=21.582909/9.579424/15.449196、lazy13=21.582909/9.567116/15.434367、band13v1=21.547522/9.728546/15.649490、band13v2=21.551620/9.679592/15.588872、large12=21.566240/9.542950/15.432164。遅延版では最初のsave区間にJITロード費が移るので、guard区間の合計だけを旧版と比較しない。

band13v1の1900fieldボスは1744表示・最大18.749402ms。基準との共通1749FB/packet、1750mask/消去端一致だが表示退行。large12の1900fieldボスは基準と同じ1747表示、1field1741/2field3、最大18.623222ms、最大output20.183662ms（基準18.603014/20.163455よりわずかに遅い）。147画面照合、共通1752FB/packet・1753mask/消去端の一致に合格。改善候補の一部は速いが全体表示は改善していないのでdefault/公開へ採用しない。

large12のstackfixturewideは450field/307logic/300表示、300枚すべてPPU/VRAM/RGB照合合格。40/41両方、94x73/94x74/91x71、左右13位置/上下7位置を通る。最大cache924B、512B超660chunk。DMA1931/JIT332/MVN85回。JIT実行直前に全512Bとbank patchを毎回assert。道中1584回・ボス2108回でbank40..43、幅2/4/6/8/10/12に合格。fixtureのsummaryはfixturePresentationEveryFieldを別記しgoal60fpsAchieved=falseへ強制する（試験packetへの置換をゲーム達成と誤認しない）。全1492寸法/native90854行/弾158688行、dirty5992縦位相表の独立元画像照合も合格。

初回band harnessはpatternsを定義前に参照しPythonで停止、import位置を直してからMesenを実行。初回large12道中は画素合格したがedge_cacheのmode文字列がJSON引用されていなかった。引用を修正して同一ROMを800field最初から再実行したlarge12_v2を比較に使用。初回Lua/log/summaryは証拠に保存。lazy17はbuildだけで未実測、性能証拠に数えない。

results/20261013_edge_guardにREADME/commands/comparison/default_restore、evidence.zip60,570,284B、SHA ed7c4e481d44eb84b02fc7b6a9ab3334e813779273a26ae62ca8400b566bce73。7候補ROM・全road/boss/fixture・全buffer・labels/map/Lua・VRAM/PPU/RGB・退避/JIT/転送ログ・独立検証結果・small_edge_templates.binを保存。tools/report_sa1_edge_guard.pyで再集計。GitHubは50MB推奨超過の警告だけでpush成功。残件を隠して完了扱いしない。

次に注目する待ち: large12道中の欠落visiblefield692/696/699/702では、IRQ末尾のqueue ready=3/3/3/4、rendering=1、complete=0、flipped=0。キューが空になった描画待ちではない。前後のtransfer総量10～11KB台、fast_dmaの部分転送がfield692に1440B、699に1280B、702に640B残り、翌field表示へ持ち越す。field695 gen546は11744B/count41/cost14826/available0のfast拒否記録もある。次はrenderの平均短縮を繰り返すだけでなく、転送開始・区間・conversion/descriptor所有権・実blank期限のどこで残量が出たかを具体的に計測する。queue/fast/rejectedログはlarge12_v2にある。底/上の表示領域や物量を削って達成扱いしない。全ゲーム/全武器/敗北4000field監査もまだ必要。

## 転送期限の実測・探索展開・計画一本化（2026-10-13、d1887f3）

SA-1 branch `experiment/sa1-4bpp-60fps-20261010`へd1887f3をcommit・push、clean/upstream一致。60fps未達でgoal active。公開ROM9934d77bは変更なし。通常build a9bcd247へ復元、279field/137logic/130表示・120画面照合、最大7.241609ms、terminal終了コード0。自前Mesenとホスト検証/reportは全て終了。ユーザーMesen PID36580には触れていない。

`--trace-transfer-deadline`は命令を変えずlabelをexport。660..720fieldのIRQ/選択/CC設定/予算/探索/全量と部分転送/420B/完了/flipを記録。SCPU C1 codeはROM物理410000+label、GSU01:8000は8000。DMA送信先はPPU state vramAddressから読む（最初のbaseだけwrite-only2116から読んだので当該項目は使わない）。pipe_reserved labelでavailableは保存前、算出値はA。

基準large12 SHA24bac324の世代543はIRQ197、setup198、time_left200、prefixplan201、再time_left202、fastbegin207:366、初420B208:220。部分転送は翌field692の6:1204で止まり1440B残り、pause9:198、次IRQで転送完了215→flip216。転送選択・二度の時刻取得に数行費やしている。描画済みキューは残っていた。

tools/sa1_prefix_unrolled.pyの`--prefix-unrolled-search`は累積費用表の最大48記述子を32/16/8/4/2/1の6段に展開。候補アドレスをpfMid=endで範囲検査、cost<limitの厳密不等号、YをPHY/PLYで復元。探索単体SHA5548f118の800fieldは647表示・4待ち、最大21.312856ms、168画面一致。早くなる箇所はあるが表示待ちは減らない。

tools/sa1_transfer_deadline.pyの`--dma-budget-table`は(deadline−mappedline)*170を512word ROM表へ置換。mappedlineは実0..196→+262、197..202→203/hpoint0、203..511→そのまま。到達する最小mapped203、281−guardを過ぎればFFFF。旧式の締切/切替2200/2300/先行900を維持する。PHX/PLX後にAを再ロードしてN/Zを復元。表末尾のsegment漏れに注意。

`--prefix-one-pass`は全量費用算出→time_left→prefixplan→time_leftの二重処理を、累積表から一度で選択する経路へ置換。途中分割済みbytes/costを差し引いたあと一度time_left、末尾costが収まる場合は6段探索も省略。pfLow==pfHighならpfPartial=0、pfBytesを使って従来の全量完了経路へ進む。部分選択時の余裕384byte相当。`--prefix-full-reserve192`は全量判定だけ余裕192、部分の384とflip/prefetch余裕は維持。既存`--dma-word-start`を組み合わせ、単独の効果とは主張しない。

一本化384 SHA b69e6e4115f5c54c07e117675f8595c9061e2557e45b1022db3c09176cc7e28d、snapshot deadline_onepass_build。道中800/655logic/648表示、間隔1=642/2=3、最大21.456449ms。ボス1900/1754logic/1747表示、間隔1=1741/2=3、最大18.614561ms。道中待ちvisible693/696/700はready3、complete0でVRAM転送持越し。世代543はfast203:794、翌2:168で完了→3:16flipして旧版の待ちを解消したが別世代の待ちが残る。

一本化192 SHA f685de707b32c4390b49cadf2ed51b05da446ed331eaa74421d499d59f4a9c4f、snapshot deadline_full192_build。道中800/655logic/648表示、1=642/2=3、最大21.494164ms。ボス1900/1755logic/1748表示、1=1743/2=2、最大18.615120ms。世代546は41記述子11744B、累積費用14524。384版field695 start12のlimit14444で最後128B(cost190)を除外していた。192版は全量を選び翌field696の8行でflip。ただし他の進行位相が変わり道中待ち総数は同じ。ボス待ちはlarge12の3→2へ一回改善。まだ0ではないので公開/defaultに採用しない。

全road各168画面、boss各147画面の元画像/FB/VRAM/実PPU参照/RGB照合。road共通653世代以上の全24576B FB、packet、転送集合、消去端が一致。bossも前回large12との共通FB/packet等一致。全1492寸法/native90854行/弾158688行を基準94c0c2e1へ照合し、dirty5992縦位相表を元画像alphaから独立照合して合格。

runtimeは各pipe_fast_begin直前にpfTablesを線形走査し、pfDesc/pfBytesが正しいとassert。途中分割済み長は元累積bytesから元descriptor長を復元し、現在のrecord+208の残量を引く。9個の元爆発40/41（94x74、3列×3段）を描く`transferfixture`を追加。描画はSA-1自身、hostはpacket設定のみ。384/192両方500field/150logic/142表示、全142画面一致。384は467選択/168途中再開/最大2848B、192は465/169/2816B、最大27記述子。共通149世代のFB/packet/mask/消去端一致。fixtureは2～3field間隔、末尾2field程度は正常な試験途中で終了したもの。goal60fpsAchieved=falseへ固定し、ゲーム達成に数えない。

tools/verify_sa1_prefix_unrolled.pyは実ROMの65816命令を最小interpreterで59024探索条件、全量判定入口から58148条件（実費用上限内）、Y復元と厳密不等号を検証。予算512line×512hpoint=262144条件を旧式へ照合。384/192両ROMで合格。初回interpreterの物理位置10000誤り、ADC absolute/DEC未実装は修正して全件再実行。unsupported opcodeは無視しない。

不合格: 最初のbudget_tableはGSUへsegmentを切替えたまま末尾でCODEに戻していなかった。include後のwait_blank/blank_table/math4までGSUへ漏れた。SHA d4250fceのall道中/fixtureは画素検査を通ったが、正常表示/性能の証拠から除外。最初の一本化SHA6f5372f6はfield145 line203 value35のHDMA unblankで停止。最後に`.segment "CODE"`を明示し、blank_tableをexportしてCODE<10000をbuildassert、静的検査とテスト起動前も13byte実ROM表を照合する。修正版b69eは同SHA再build確認済み。最初の不合格一本化ROM本体は上書き済みで残っていない（all不合格ROMは保存）。初回onepassのbra172超過もJMPへ修正してから実行。

成果物: results/20261013_transfer_deadlineのREADME/commands/comparison/default_restore、evidence.zip42,304,565B、SHA db5b34fe9fbe9491c8039bb6e8dafbbbb6a85e4ee02e5bec18e791651872d867、CRC合格。4road/2boss/2fixtureのROM/生成source/labels/map/Lua/FB/VRAM/PPU/RGB/転送ログ/静的検査を保存。invalid_*は不合格資料、採用記録と区別。tools/report_sa1_transfer_deadline.pyで集計。通常復元は20261013_flame_direct/commands.json['baseline']をbuildする（mask_bounds_build.py baseでも同じa9bc）。通常smokeはmovestress_detinput_deadline_default_restore_tracepalette。goalはactiveのまま。

次の具体候補: 現行pipe_flipは先頭でpipe_start_blankを待ち、その後にrecord→WRAM1d04..1d16/player4_present/fx4_page/pipe_obj_pointerの準備まで実blank内で行う。これらの状態準備を197～203行へ前倒しし、jsr update_ground_pointers直前だけでblankを待つopt-inを検討する。HWのHDMA送信元がこのmetadata自体を読んでいないこと、IRQがmainを止めていること、PPU/OAM/HDMAポインタの実更新はblank内であることを確認し、実PPU/全画素/待ち回数で測る。未実装・未測定なので改善と主張しない。別候補の3×16KB VRAMキューは元vram_prefetch3にあるが、固定map二面とmap転送費の違いがあり、過去の四面/FIFOをそのまま再実験しない。全ゲーム/全武器/敗北4000field監査はまだ必要。

## 切替準備・宛先事前計算・短いI/O・転送予約（2026-10-13、47d4abe）

SA-1独立branchへ47d4abeをcommit・push済み。60fps未達、goal active。8方式の道中、3方式のボス、2方式の分割fixtureを比較しても前回full192の道中3待ち/ボス2待ちを減らせなかった。通常buildをa9bcd247へ戻し、279field/137logic/130表示・120全画素一致・最大7.241609ms、terminal exit0。公開ROM9934d77bは維持。自前Mesen/ホスト検証/reportは全て終了し、ユーザーのMesen PID36580には触れていない。

--early-flip-prepareはpipe_flip先頭のpipe_start_blankをWRAM状態準備の後、update_ground_pointersの直前へ移す。命令数は同じ。実行時にHDMA各channelの表/間接参照が1C00..1DFFを読んでいないことと、実PPU更新はline203以上または21以下の非表示内であることをassertする。ROM e71a4be4。道中648表示/3待ち/最大21.502638、boss1748/2/18.487823。early preparationは道中607/648、ボス1653/1748で通ったが表示改善なし。

--prebank-dma（tools/sa1_prebank_dma.py）はSA-1の0198世代が奇数ならページ3000、偶数なら0の宛先をfixed_descriptorで準備する。496-pageをC0へ置き、元のSBC即値をSBC C0へ置換。S-CPUのdescriptor毎のADC pipe_fast_pageを省く。汎用分割経路も絶対宛先のまま進める。初回の対照41062794は費用表57を維持して道中648/3/21.402904。現在の同flagは省いた命令分4を割り引くので、初回対照は同じflagだけでROM再生成できない。初回ROM/生成source/ca65引数は証拠に保存。commands.jsonはその履歴と、現在のprebank_current（未測定の単独cost53版）を区別する。

--dma-short-ioはprebankと併用し、DMA展開区間のみPHB/PEA0000/PLB/PLBでDB=00、WRAM読出しをlong、4305/4302/2116書込みをabsoluteへ変更。D=4200、Y=FE01のSTY0Bは維持。終端でD=0とDB=7Eへ戻す。費用をさらに2割引き、combinedの記述子費用51。ROM1a2603a9、道中648/3/21.539141。初回harnessがcpu.dbという不存在キーで停止したが、stateはcpu.dbr=126/D=0だった。cpu.dbrに修正し同一ROMを最初から実行したv2のみ性能比較に使用。初回Lua/failure/stateを別保存。

--dma-unroll-count16/20は一回のDMA展開を12個から増やす。16版d1eb892bは道中648/3/21.486900、20版4f16803aは648/3/21.449186、boss1748/2/18.607484。20版CODE=FFF9 byteで残り7byteしかなく、追加CODEを安易に重ねない。展開ブロックは23byte/descriptor。DB/D復元、generationから求めたpageと実recordページの一致、表示中ページへ送らないこと、SA-1元descriptor/WRAM再開descriptorのsourceと絶対宛先・範囲・総byte数を実行時にassertする。

--prefix-refresh-sixteenth（tools/sa1_prefix_refresh.py）は従来n+n/32+n/128にn/16を足す。32B単位なので3*(n/32)を利用し、SA-1累積表とSCPUのpartial控除を揃える。small1600/player2400、16展開を併用したcf48fb40は道中647/4/21.457753で退行。500field fixtureは153logic/145表示、全145枚一致、prefix455回/partial214回/最大2784B、ページ所有権490回/途中再開309回。新費用式も元の式も最終harnessはSA-1の累積bytes/costを独立再計算して照合する。

--tail-flip-reserve1400はCHR更新なし・record残量1024B以下の場合だけ予約1400にする。bulk2200/player2300は維持、旧グローバル低余裕の失敗を繰り返す一律値変更ではない。16展開併用f89c8876は道中648/3/21.426837、boss1748/2/18.470223で待ち改善なし。fixture500field/152logic/144表示・全144枚一致、prefix468回/partial123回/最大2048B、所有権489回/途中再開323回。fixtureは2～3field更新でgoal60fps=false、ゲーム達成に使わない。

既存sparse-merge-gap32も現行基準へ追加して55a44cc6、648/3/21.387446で変わらず。8road全て168枚原画/FB/VRAM/実PPU/RGB照合、共通654世代の全24576B FB/packet/mask/消去端一致。boss3本は各1900field/1755logic/1748表示/147枚照合、共通1753世代の全FB等一致。2fixtureは前回full192と共通149世代FB等一致。各候補7ROMで実命令59024search/58148full、予算262144条件/Y復元/blank HDMA tableを検証。最終tail ROMの全1492寸法/native90854行/弾158688行、dirty5992縦位相表の独立原画alpha照合も合格。

20展開とtailの表示待ちvisible693/697/701ではready3、rendering1、complete0、flipped0。即時の描画キュー枯渇ではなくVRAM転送待ち。SA-1 maxだけの小差で採用しない。descriptor_costのraw間隔診断にはVBLANK/NMI/HDMA/refresh等が含まれ、最大を純粋な設定命令費と扱って費用を勝手に下げない。

成果物はresults/20261013_flip_prepareのREADME/commands/comparison/default_restore、evidence.zip68,401,354B、SHA9fc0ce409883079a81ebccedcebeaa41f54a1c440f328ff3e1a6fca46fcde90a、CRC検証済み。tools/report_sa1_flip_prepare.pyで集計。8候補ROM、各試験の全buffer/実PPU/VRAM/RGB、Lua/labels/map/生成source/転送記録/独立検証を保存。GitHubの50MB推奨警告は出たがpush成功。既定復元は.cache/deadline_restore.py（前回flame_direct/commands.jsonのbaseline）でa9bc。同smokeはmovestress_detinput_flipprepare_default_restore_tracepalette。

次の具体probeはtools/probe_sa1_fixed_front_mask.py。前回full192の実占有maskについて、current|prev1とcurrent|prev2の転送集合を比較した。後者のbyte数/descriptor数が実DMA記録57世代と一致。重い530..570の41世代で前者は平均484.683B、cost523.049相当小さい。gen543は10400B/39→10048B/38、544は10752/38→10080/39、546は11744/41→10176/36（1568B節約）、547は10944/38→10752/38、549は11648/39→10944/42。build/sa1_game/fixed_front_mask_probe.jsonを証拠に保存。

このprobeは前面一括更新が常に選べるという静的集合比較で、gameIntegrated=false/goal=false。実速度・追加準備費・ownershipは未実装。過去adaptive-vramは準備費で道中495/ボス1059へ退行したためそのまま再実験しない。固定map sparse/prefixの現行で、各VRAMページの実内容世代/占有maskを管理し、前面には全量が一回のblankに収まる時だけ書く案の費用を先に調べる。二面の内容は動的に選ぶとprev2とは限らず、SA-1は7世代先を準備しているので単純な0198 parity事前加算も使えない。SA-1/SCPUのどちらがいつmask/list/prefixを作るかと、描画完了キューからの遅延を測る必要がある。改善見込みだけで実装成功・60fps達成と主張しない。固定map24KB×3は72KBになりVRAM64KBへ収まらず、単に三面化もできない。全ゲーム/全武器/敗北4000field監査もまだ必要。

## 2026-10-13 継続: 前面差分のS-CPU準備費と同一画素tileの上限（60fps未達）

検証分岐へ26ea1c5（前面差分単発診断）と4ac7ea4（裏面同一画素の上限診断）をcommit/push。childはclean/upstream一致。目的はactiveのままで、前面VRAM更新・60fps達成は未実装。公開ROM9934d77b…を変更せず、既定検証ROMはa9bcd247…へ復元済み。280field smokeは138logic/131表示、原画・実PPU/VRAM/RGB120枚照合、maxSA1=7.241609ms。ユーザーのMesen PID36580のみ残存し、触っていない。

前面差分の準備費を実S-CPUで測るため、game/sa1/v001/fixed_front_probe_cpu.s、--fixed-front-probe --fixed-front-probe-generation Gを追加。現在/prev1 maskを各96B DMAでWRAMへコピー、最大48descriptor、累積byte/costを構築。pipe_collectのmetadata取り込み後/ack公開前で指定世代だけ動作し、test harnessはreturn直前に終了。前面への実転送はしない。毎世代走らせるとIRQ期限を越えるため、現在のbuildは1..65535の世代指定を必須としている。CPUレジスタ/SP、mask履歴、全descriptorとprefix、最終合計をLuaが独立検査。

最終sample543 e5ee8147664623e27ad332f7e7089dadfd8156a7898b953114f9f1bbecacd680は8.788174ms（copy0.152906/planning8.282337/remember0.352931）、10048B/38descriptor。sample546 a27f6e9bd0ec85a28b3a01763b1c0cc82320e4df629a5e756f7d67f14c72ab3fは8.515327ms（0.154582/8.022062/0.338684）、10176B/36。sample549 75afa4dbc903d4bd88efffa568511715a93603ec13439428b3000c7d3a8fccbfは9.690337ms（0.149181/9.178540/0.362616）、10944B/42。backとの差の削減は352/1568/704B、費用式差×8 master/21477.272で0.157189/0.711822/0.209710ms相当。後者は実DMA時間差ではなく見積もり。S-CPUでこの方式を毎フレーム行うのは費用過大として不採用。SA-1移植時の速度を推定で合格扱いしない。

3本は現行harnessで再実行し、計測前まで134/138/142表示の原画・実PPU/VRAM/RGB照合。旧full192と各543/546/549世代の24,576B全FB、packet、占有mask、消去端が完全一致。各ROMの探索59024/全量判定58148/予算262144条件/Y保存/blank HDMA表CODE内配置を検証。gen543/546/549のCPU計算値は前回の静的front-mask probeとも一致する。sampleのゲーム速度/表示頻度を60fps実証に使わない。

初期失敗は保存して速度証拠から除外。v1 SHA6ebf238e…はGSUの01:B437を81:B437と誤認し、spriteデータ側へ分岐。SA-1 ROMの80..BFは物理+200000で、00..3Fミラーではない。v2 SHAff88f787…はFRONTCPUをDATALOAD先頭に挿入してRODATAコピーをずらした。v3 SHA8ba16783…はRODATA/DATAの後へ移しただけで、C2のゼロ余白をBSS初期化に使うbootの前提を壊した。bootはC2:0000の64KB全体を7E:2000へMVNしwrapするため、空きROMをコード置場とみなさない。最終コードは.segment GSUで実01:xxxxをJSL、テーブルも同じROMバンク。buildにRODATA_LOAD=C20000/コードbank01 assertを追加。

v4 SHA71609ae7…はDMA開始直後のexec callbackでcurrent maskの検査が止まり、REP後にNOP2個を足したv5で再検査した。v5 cdac4f51…は215世代のlist照合を通るがfield384/line27で表示中のpage flipが起きて既存検査が停止。継続版は正常表示/60fpsの証拠に使わない。前面更新を実装していないのに遅い診断をcritical IRQへ入れること自体が危険と確認した。v5 ROM・生成ソース・失敗状態は証拠に保存。最終3本は上記単発構成と新harnessで再実行し、異常なし。

成果物results/20261013_front_cpuはREADME/commands/comparison/default_restore/evidence.zip。zip17,701,626B、SHA3db4a1e917fd259c13e7be79a43abddc1cdef12abee25ac29bc8305b4a626456、CRC合格。tools/report_sa1_fixed_front_cpu.pyで集計。build/frontprobe_sample{543,546,549}_final_buildとmovestress_detinput_captureburst_frontprobe_sample{G}_final_tracepalette_tracebounds_tracedeadlineに生データ。現在のlive ROMは復元済みなので、この3本を調べる時は保存snapshotを使う。

追加のsource-only probeはtools/probe_sa1_fixed_back_pixels.py。commit済みtransfer_deadline/evidence.zipのroad_full192全FB654世代とmask、flip_prepare/evidence.zipの既存back集合計算を読み、current対g-2の16word/tileを比較。キャッシュに依存せず再生成できる。元back集合のbyte/descriptor/costは全対象世代で既存probeに一致。530..570の10189占有tile中同一は445=4.37%、95.63%は変化。厳密な画素比較を費用ゼロと仮定しても平均347.317B/世代しか減らない。543=10400→10016（384B）、546=11744→11296（448B）、549=11648→11232（416B）。過去pixel-deltaで比較7～12msになった失敗を、そのまま再実装しない。比較順序のgreedy診断は21646word/41世代、順序[9,0,15,14,1,4,8,5,11,13,6,10,12,2,3,7]だが、実命令速度・改善の証拠ではない。results/20261013_back_pixels/README/comparisonに全世代と入力SHAを保存。

ここまで前面CPU再計算・同一画素比較はいずれも採用見込みが低い。前回の固定map full192最良道中648表示/800field・2field待ち3回とboss1748/1900・待ち2回を改善したわけではない。次は同じCPU plannerやpixel-deltaを再試行せず、転送の構造自体（既存VRAMへ再利用可能な素材や、描画順・OAM/走査線制限を保った部分native化等）の資源上限を先に確認する。検証前に成功を主張しない。

## 2026-10-13 継続: 転送時期・部分予算と実DMA時間（5a80a6e、60fps未達）

独立branch experiment/sa1-4bpp-60fps-20261010へ5a80a6eをcommit/push、child clean/upstream一致。6構成とも基準full192の道中648表示/800field・2field間隔3回、ボス1748表示/1900field・2回を改善できなかった。goal active。公開ROM9934d77b…は維持、live検証ROMをa9bcd247…へ復元し280field/138logic/131表示/120画面照合/max7.241609ms、Mesen・Pythonともexit0。ユーザーMesen PID36580には触れていない。

--defer-ready-collect（tools/sa1_collect_schedule.py）はIRQ最初の収集を維持し、pipe_choose_target側の二度目だけ、active targetまたはread slot readyなら省く。main/IRQ双方のpublish世代連続性、pending/done/3198一致を検査した。collectschedule_v2 SHA752f5d03…は647表示/4待ち/max21.475726ms。先行宛先/shortIO/16展開/tail1400併用2a3e6c3f…は648/3/21.416966。省いたうちcompletion pendingだったのは3回だけで効果が小さい。最初のv1はharness export不足なので性能証拠から除外。

--transfer-request-line190（tools/sa1_transfer_deadline.py）は4209、wait_actual_blank下限、time_leftのpreblank mappingだけ変更。blank203/解除22/HDMA13Bは変更なし。request190_v1 SHAb6033815…は647/4/21.583561。--prearm-transfer-line190（tools/sa1_prearm_transfer.py）は190行で要求だけ発行しmainへ戻り、197行の第二IRQで既存転送へ進む。grantを第二IRQで消さない。prearm190_v2 SHAe4d6e1a1…は647/4/21.517165。late判定は194行以上なら197行まで待って同IRQで直接転送。196行指定e357014b…は648/3/21.554693、late経路654回・実197/198/200行を検証。190版issued654/transfer654/late0。先行IRQでも表示改善なし。

--partial-transfer-reserve900（tools/sa1_partial_budget.py）は全量判定失敗時だけraw予算から900+384を控除しprefixを選ぶ。最後のdescriptorを必ず残す。全量・flip予約は維持、従来tail1400は1024B以下/CHRなしのみ。初期版にはpipe_time_leftが期限超過returnすると前回raw予算が残るバグがあった。1300/900版の画面照合成功も採用候補から隔離。旧tail SHA5668da59d649d520af70b0fcbaa5b00d15af3f3e849cb7b1c369817db0618f65を同SHA再生成し、field697/line25/masterClock249118568の非blank DMA開始を再現した。pipe_time_left冒頭で必ずstz pipe_unreservedする修正後、最新静的検証は旧ROMをexpected rejectionにする。Mesen stop後callbackが進んで失敗状態が上書きされたため、test_sa1_game.pyも最初の異常を保持するよう修正。再現ではline25の最初の状態を保存できた。

修正版partialbudget900_tail16_v2 SHA2a276ed8eaf290beb7f210d14ee1ae90439284631903036a3dc3e2c7abeae827は道中648/3/21.429072、ボス1748/2/18.492386。fixtureは500field/161logic/153表示/全153画面一致、prefix460/途中descriptor再開60/最大partial1248B。前回tail16の144表示より増えたが2～3field更新で60fpsではない。6road各168画面、boss147画面の元画像/FB/VRAM/実PPU/RGB照合、共通653世代以上の24576B全FB/packet/mask/消去端一致。探索59024/全量58148/予算262144/Y復元/blank表CODE配置を検証。修正版は冒頭ゼロ化も確認。元1492寸法/native90854/弾158688、dirty5992縦位相表の独立原画alpha照合も合格。

DMA traceはtracedmacost scenarioでSTY420B直前とDMA後次LDA実行後を記録。ROM blockの先頭BD/BF・末尾840B・stride26/23・終端A90000を検査。基準f685de70…とROM同一のdma_cost_base_v2は648/3/21.494164。1400sample/387840BをmasterClockで80complete groupへ対応付け、prefix選択個数/byte/世代一致。窓末尾の1groupは除外。NMIでfieldがgroup途中に変わるためfieldだけで対応させない。実group−費用式の差は−994～+1228master tick（平均+145.525）。重い543/546/549は−538/−226/−152、一方小groupは+1000程度もある。個別extraTicksは設定全部を含まず、groupは設定/NMI/HDMA/refresh等を含むので一律の費用割引に使わない。

source-only plane pair probeも保存。currentとg-2のlow2/high2planeを別比較し16B転送単位、48descriptor制限、gap結合込みで重い530..570平均429.268B/世代の節約上限。543/546/549は144/128/208B、比較・CC1配置・実速度は未検証。改善実装と主張しない。

成果物results/20261013_transfer_schedulingはREADME/commands/comparison/default_restore/evidence.zip。zip78,774,495B、SHA0f504c60dd4fc13954fcce3c9f0269a66c7788d4b0d279d8c9c90922768bec8d、CRC合格。tools/report_sa1_transfer_scheduling.pyで再集計。ROM/source/labels/map/Lua/FB/VRAM/PPU/RGB/転送/静的検査、隔離旧版と同SHA再現scriptを保存した。GitHub50MB推奨警告のみでpush成功。default復元は従来.cache/deadline_restore.py、smoke movestress_detinput_scheduling_default_restore_tracepalette。全own runtime終了確認済み。

次は予約や要求時期だけの微調整・CPU mask planner・同一画素比較を繰り返さない。残った待ち世代の転送構造と素材再利用の資源上限を確認する。元の画素/縮小/描画順を保ち、OAM/走査線上限を先に測ること。全ゲーム/全武器/敗北4000field監査は依然未完了。SA-1最大21ms自体も別のボトルネックで、転送待ち解消だけで全編60fpsを宣言しない。
