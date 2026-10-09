# SA-1 / 4bpp / 60fps 独立検証（進行中）

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
