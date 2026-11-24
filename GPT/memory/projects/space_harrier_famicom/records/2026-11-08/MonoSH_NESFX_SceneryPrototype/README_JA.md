# SFC遠景の独立試作とNESFX統合設計

2026-11-08。依頼: 「遠景の山の動きもSFC版準拠で作って。どうやって実装する？」

## 結論

山・森は地面textureへ焼き込まず、専用の2D遠景として合成する。元NESの遠景累積値を読み、SFCと同じ横速度・512px周期・地面カメラへの縦追従を再現する。原NESのゲーム進行、敵、自機、当たり判定には変更を加えない。

このフォルダは独立したC++参照実装・素材pack・検証のみ。v019 ROM、専用DLL、SDカード、RBFは変更していない。ゲームへ組み込んだ版ではなく、FPGA動作保証でもない。

## ソースで確定した仕様

参照SFC: ../MonoSH_NESFX_v001/reference/MonoSH_FX2

- game/v001/frame.s:171-195: 中央128からの横変位dxを使い、60Hz更新で山acc += dx*2、森acc += dx*4。プレイヤー非通常状態では加算しない。
- game/v001/ground.s:49-58,113-118 および cpu.s:431-436: X=(acc>>7)&511。Yスクロールは21-camera。正のdxでは地図を右へ読むので、画面上の遠景は左へ流れる。横移動端で停止せず積算を続ける。
- game/v001/assets/scenery.inc: FX_SCENERY_V=21。原NES offset 0..32をSFC camera 0..64へ対応させる。現在画はcamera=2*offset、中間画はprevious_offset+current_offset。
- tools/verify_game_display.py:118-127: 最終表示はOBJ、FX、森、地面、山、空の順。ただし森・山の元画像はmap127行より下が透明なので地面と重ならない。
- game/v001/RESULTS_20261009_GROUND_TIME.md と tools/build_scenery.py: 山と森の輪郭は全復元済み。山頂を2行削る古い仕様は誤解として撤回されている。投影原点104+cameraを保ち、見える地面だけ106+cameraから開始。遠景は旧位置から2px下。
- 元NES generated/nes_core/src/game.c のsigned player_xは中央0。reference/nes_support/src/draw_ground_bgfar_batch.s:52-89 には既に30Hzで山acc += player_x*4、森acc += player_x*8がある。SFC2更新分と一致するので新しいゲーム側積算処理は不要。
- 元NESのfrozen関数はaccを進めず、reset時はaccを0へ戻す。表示はその既存状態を尊重する。

## 実装の接続点

1. cpu.sのcamera/OAM snapshotと同じ時点で _bgfaru_scroll_acc と _bgfard_scroll_acc を読む。描画中にlive値を参照しない。
2. 現在・前回の16bit accを保持し、中間画は previous + signed16(current-previous)/2 とする。端の65535→0を単純平均すると山が256px飛ぶため禁止。通常の*4/*8差分は偶数なので端数は失われない。
3. reset、場面切替、補間snap時には中間画も現在値に固定する。停止・死亡は原NESの凍結済みaccを使う。山だけ別時計で勝手に動かさない。
4. 4段の既存表示queueへfarX 2B、nearX 2B、camera 1Bを追加し、世代番号とmidpoint/current位相を既存queueに従属させる。pending/visible値を分離し、既存地面/FX/OAMと同じVBlank commitでのみ切り替える。
5. NesRacingFx::FetchGroundBlockから8x1背景blockを作る際、地面より上でSceneryLayers::Sampleを読む。mapper内部yに+31して物理PPU yへ戻す。地面のパース係数du/dvは山へ適用しない。
6. GSUの非透明敵pixelが最優先。opaque-zero alphaもマスクに含める。背景側は森、山、空の順に選び、地面領域では既存地面を使う。Native OAMの自機/自弾/影は既存PPU属性・優先順位を維持し、遠景合成で書き換えない。
7. v019は投影地平線の次の行から地面が出る。SFC現行の上2行clipを組み込む場合は、地面の投影原点や列幅を動かさず、表示選択だけ106+cameraまで遠景/空にする。これはtextureの色変更だけでは実現できない。

SceneryLayers.hppは素材復号、上下左右のサンプル、wrap-safe中間補間、commit条件の独立実装。実際のROM register ABIとmapper接続は未実装。既存アドレスへ未確認で新registerを割り当てていない。

## 容量

SFCの山/森mapは横64タイル、使用する縦範囲は2タイル行(112..127)だけ。

- 共用2bpp CHR: 203*16 = 3,248B
- 山mapと森map: 2*64*2*2 = 512B
- 元SFCパレット: 128B
- 合計: 3,888B、header込みscenery_source.binは3,920B

v019の128KiB CHRは地面textureが0x2000..0x1AFFF、自機CHRが0x1C000から。実ROMで0x1B004..0x1BFFFが全ゼロを確認した。MSH5識別子をそのまま残し、blobは0x1B010..0x1BF5Fへ収まる。残り160B。敵atlas・自機CHR・地面textureは削らなくてよい。これは格納案であり、この試作ではROMへ書き込んでいない。

## パレット制約

SFC素材の透明・輪郭・RGBは完全に保持している。ただしNES画面へそのまま全色表示できるという意味ではない。

既存NESFX背景は8x1画素につき1つのNESパレット。空側は共通$09、灰$10、明緑$29、紫$14の4色を既に使用している。山の紫の明暗・白い稜線・森・敵をすべて別色のまま同じ8画素内へ入れることはできない。mapperで仮想レイヤーを増やしてもPPUのこの制約は消えない。

統合時は8画素blockの敵色を優先して保持し、そのblockで表せる色へ山・森を量子化する。空/山専用パレットを空いている背景paletteへ置く場合も、森や敵が同居するblockは既存パレットへ戻す必要がある。切替で輪郭や雪が失われないことを全画素で検査する。現時点で具体的なNES色選択・パレット切替は未実装で、reference GIFのSFC色を最終NES出力と誤認してはいけない。

## FPGAとtiming

遠景は16行の静的tile群なので、GSUへ毎フレームの山描画を追加しない。CPUの追加仕事は5B snapshot/queue/pending登録程度に抑える。

FPGAでは別途、tilemap/CHRの読み出し、2層優先・透明選択、8画素blockのpalette選択、pending→visible同期が必要。ずれた8pixel区間では各層が2tileにまたがり、最大4tile lookupと8bitplane byte読み出しが発生する。既存地面textureと同じ外部メモリを無制限に同時読み出しできるとは仮定しない。静的3.9KiBを初期化時cacheするか、次行の遠景を事前fetchしてscanline bufferへ置く設計とし、fit/BRAM/port競合/PPU締切を実測する。

現状の専用MesenはFPGA実装ではない。既存RBFは新しい遠景層を知らず、さらにMSH5の+31/HUD28tile/専用spriteCHRにも別差分があるため、この素材を入れただけのROMを既存RBFで起動して動作確認扱いにしない。

## 検証結果

実行: python -X utf8 build_test.py

- SFC full mapと元far.png/near.png: 262,144画素の透明と不透明RGB一致。
- compact C++ decoderと独立full-map decoder: 16,384画素一致。
- 全65,536累積開始値×横入力225段階: 14,745,600件の山/森中間補間・wrap一致。
- camera 0..64の全65段階: 地面開始行と隙間のない山裾を検査。
- 世代不一致、非VBlank、動画未準備でcommit拒否。同一世代・VBlank・準備済みでcommit成立。
- v019 ROM SHA-256を前後照合し不変。結果のhashとsource hashはresults/validation.json。

未実施: ゲームROM統合、実PPU上での敵/自機との同時表示、NES色量子化、FPGA synthesis/fit/timing、実機起動。これらをPASSとは報告しない。

results/scenery_motion_reference.gifは横移動で山:森=1:2を示す独立モデル。results/scenery_camera_reference.pngはcamera0/32/64とwrap直前。いずれも地面は境界を示す単色の仮表示で、ゲームの録画・製品画面ではない。
