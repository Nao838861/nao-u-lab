# SA-1 / 4bpp / 60fps 独立検証（進行中）

## 最新状態（2026-10-10、00a8973）

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
