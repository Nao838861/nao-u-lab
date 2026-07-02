# N8 Pro MMC5 バグ — 検証ログ / Fable引き継ぎ（このセッションの全記録）

最終更新 2026-07-03。このファイルが**現時点の最有力・最新の引き継ぎ**。
（先行の `N8Pro_MMC5_引き継ぎ.md` はSDカード設定など背景。repro調査の最新はこちら）

---

## 0. 結論（2026-07-03 原因確定）

Nao_u の自作NES `MonoSH` / `NesLaser3`（mapper5=MMC5）が
**Mesen ◯ / 無印EverDrive N8 ◯ / N8 Pro（fw v25.1123）だけ描画が化ける**問題、原因確定:

**N8 Pro は旧iNESヘッダ（WRAMサイズ無宣言）のmapper5にWRAMを8KBしか確保せず、
$5113 のバンク1がバンク0にエイリアスする。** 本編はVBUFをWRAMバンク0/1でダブル
バッファしているため、読みバッファ=書きバッファとなり移動中のExRAM描画が化ける。

**実機判定結果（2026-07-03）**: `09_wram_bankflip.nes`（旧iNESヘッダ）= Mesen緑/**N8 Pro赤**、
`11_wram_bankflip_nes2.nes`（同一コード+NES2.0ヘッダでPRG-NVRAM 32KB宣言）= **両方緑**。
08（フレーム内黒帯ExRAM書き）・10（切替バンク実行転送）は両環境とも緑=無罪。

**対処: 本編ヘッダのNES2.0化（byte7=$08, byte10=$90）で自衛可能（§10）。krikzzへの報告文は `krikzz_bug_report.md`。**

---

## 1. 症状（実機観察・重要）

- 通常タイルの背景は正常。**ExRAM拡張属性で描く「ビッグコア(ボス)」だけ化ける**。
- 1体目・2体目のコア: **移動中は縦にやや崩れ、静止すると正しい絵**になる。
- **3体目から**: 128x96ビットマップとして縦に見ると、**2ピクセル正常 → 次の2ピクセルは上書き失敗で元の色が残る**、を繰り返す（規則的な2-on-2-off）。
- 「**元の色がそのまま“きれいに”出ている**」→ 表示元データは有効な古い値。つまり**単発の書き込みは成功していて、上書きが効いていないだけ**の可能性。
- **描画量に比例して悪化**（コアが増えるほど）。
- Nao_uの見立て: ExRAM単体でもWRAM単体でもない。**複合要因 or 再現度不足**。WRAMも無罪と決めつけない。

---

## 2. 表示パイプラインの真実（`/tmp/MonoSH/src/transfer.s` を精読して判明）★最重要

MonoBitmap の表示方式:
- **VBUF**（1bpp仮想フレームバッファ, WRAM `$6000-$6BFF`）にピクセルを描く（VBlank外＝画面描画中）。
- **VBlank中に、VBUFのバイトを「そのまま」2箇所へ転送**:
  - `sta $2007` → **ネームテーブル(CIRAM)** にタイル番号として
  - `sta $5C80+..` → **ExRAM($5C00-$5FFF)** に拡張属性バイトとして
- 各表示セルは**VBUFの2行(ペア)を合成**（片方→NT、片方→ExRAM）。CHR-ROM(512KB)を (タイル番号, ExRAMバンク) で引いて8x8パターンを出す。
- **BMP 128x96 を 192スキャンライン(24タイル行)に表示＝縦2倍**。よって**ビットマップ1ピクセル＝画面2スキャンライン**。→ 症状「2ピクセル」の正体。
- 転送は**2フレーム分割**（`_transfer_phase0/1`=NT rows0-11/12-23、`_exram_phase0/1`=ExRAM）。
- 転送コードは**切替PRGバンクから実行**: `_transfer_phase0`は`$5114=$84`, phase1=`$85`, exram phase0=`$86`, phase1=`$87`。`clear_vbuf_fast`は`$5114=$81`。いずれも**フルアンロールの sta**。
- ExRAM書き込みは `$5104=2`(writable) にしてから。表示は `$5104=1`(拡張属性)。**ExRAMはダブルバッファ無し**（Nao_u談）→ 落ちたら古値が残る。

### この事実からの論理的帰結
- 「上書き失敗で古値残存」＝**VBUF書き込み or 転送書き込みのどれかが効いていない**。
- 転送先のうち **NT=CIRAMは本体側でN8 Proでは変えられない**。→ Pro固有の異常は原理的に **ExRAM書き込み or VBUF(WRAM)書き込み or その複合** に限られる。
- ただし単体テストは全部緑（§3）。→ **複合条件でのみ発生**。

---

## 3. 作った再現ROMと実機結果（全ステップ）

置き場: `Claude/Homebrew/mmc5_exram_n8pro_repro/`（gitのorigin済み）。カード: `/Volumes/NO NAME/MMC5_REPRO/`。
判定方式: レンダリングOFF、WRAM/ExRAMを埋めて読み戻し照合、背景色 **緑=$2A(全一致) / 赤=$16(不一致ラッチ)**。

| ROM | 何を検証 | 書き込みパターン | 描画 | 実機結果 |
|---|---|---|---|---|
| `sanity.nes` | 基本描画/初期化/PRG | (なし, 全面白) | ON | Mesenと同 = 白 ◯（基礎OK） |
| `repro.nes` | 静止ExRAM拡張属性表示 | ExRAM 1回書き | ON | Mesenと同 = 正常 → **ExRAM表示は無罪** |
| `wram.nes` | WRAM連続書き | `sta $6000+I` 連続 最大速 | OFF | **緑**（両方） |
| `wram_stride.nes` | WRAMストライド書き(描画と同) | `sta $6000+P*64+C` | OFF | **緑** |
| `combo.nes` | 描画中(ext-attrレンダ中)にWRAM書き | ストライド + レンダON | ON | **緑** |
| `exram.nes` | ExRAM連続書き（本命だった） | `sta $5C00+I` 連続 最大速 | OFF | **緑** |
| `xfer.nes` | **WRAM読み↔ExRAM書き 交互コピー**（転送再現） | `lda $6000+I : sta $5C00+I` | OFF | **未検証（カードに配置済み・結果待ち）** |
| `08_exram_midframe.nes` | **フレーム内黒帯でのExRAM書き**（本編のIRQ黒帯構造を再現） | ext-attrレンダ→line192 IRQ→$2001=0→$5104=2→768B書き→照合 | ON(帯) | **緑**（Mesenと同挙動: 上格子/中点滅/下帯緑） |
| `09_wram_bankflip.nes` | **$5113 WRAMバンク切替/エイリアス**（本編ヘッダ同等=旧iNES無宣言） | 64BごとにBank0=V0/Bank1=~V0交互書き→両バンク照合 | ON | **★Mesen緑 / N8 Pro赤 — 原因これ** |
| `10_bankexec_xfer.nes` | **切替PRGバンク($5114)から実行する転送**（exram_phase忠実版・PRG32KB） | IRQ黒帯で$5114=$80へ切替→`lda $6010+128R+I : sta $5C80+32R+I` | ON(帯) | **緑**（Mesenと同挙動） |
| `11_wram_bankflip_nes2.nes` | 09と同一コード＋**NES2.0ヘッダ(PRG-NVRAM 32KB宣言)** | 同上 | ON | **両方緑 — ヘッダ宣言で直ることを実証** |

→ **単一メモリへの書き込みはどのパターンでも取りこぼさない（緑）**。08以降は「本編の複合文脈」を1変数ずつ加える連番シリーズ。判定は従来同様 緑=OK/赤=不一致ラッチ（08/10は黒帯の背景色、09/11は画面全体の色）。

---

## 4. 確定した事実（ruled in/out）

- ✅ N8 Proは mapper5 対応、fw **v25.1123**（最新, Nao_u確認済み）。基本描画OK（sanity白）。
- ✅ **静止ExRAM拡張属性表示は正常**（repro.nes）。
- ✅ **WRAM($6000)書き込みは連続/ストライド/描画中いずれも成功**（wram/wram_stride/combo 緑）。
- ✅ **ExRAM($5C00)書き込みも連続で成功**（exram 緑）。
- ✅ Mesen・無印N8では本編は正常（Nao_u確認）。
- ❓ 未検証: **カートメモリ交互アクセス / 切替バンク実行 / NT書き混在 / $5104トグル中 / vblankオーバーラン / フル複合**。

---

## 5. 現在の作業仮説（2026-07-03 本編ソース精読後に更新）

### 5a. 追加で判明した事実（game.c / gen_chr_dict.ps1 精読）

- **CHR辞書は「因数分解」されている**（`tools/gen_chr_dict.ps1`）: 各セル=4x4ビットマップpx。**ExRAMバイト→上2行**（7bitしか無く左上1pxは周辺多数決で補間）、**NTタイル番号→下2行**。
  → **症状の規則的2-on-2-offは「ExRAM側の行だけ別時刻のデータ」の署名**。NT側の行が正しい以上、その行のVBUF書き込み・WRAM読みは成功している。
- **ExRAM転送はvblank中ではなくフレーム内黒帯で実行**: スキャンラインIRQ($5203/$5204)で画面下部にて`$2001=0`→その場で`exram_phase0/1`（game.c:406-456）。既存exram.nesは常時描画OFF＝この文脈は未検証だった。
- **WRAMもダブルバッファ**: `$5113`でバンク0/1を毎更新スワップ（game.c:2093-2094, wram_write_bank^=1）。**全既存テストはバンク0固定＝未検証**。
- **本編ヘッダは旧iNESでWRAMサイズ無宣言**（`game.nes`: byte7=$00, byte8=$00, flags6=$53=battery+vertical+mapper5）。本編はバンク0/1で16KB必要。
- NTページも`$5105`($00↔$55)でダブルバッファ。`$5104`は各exramフェーズ前後で2↔1トグル。転送は切替PRGバンク($5114=$84-$87)から実行。

### 5b. 仮説（優先順）

1. **★WRAMバンクエイリアス説（Nao_uの「WRAMがおかしい」の精密化）**: N8 Proが旧iNESヘッダのmapper5にWRAMを8KBしか確保せず、**$5113のバンク1がバンク0にエイリアス**→読みバッファ=書きバッファ。NT行とExRAM行は別タイミングで転送されるので「1フレームずれた2枚の絵の縦インターリーブ」=規則的2-on-2-off。「静止で正常・移動中だけ崩れ・描画量(コア数)に比例して悪化・古い絵が“きれいに”残る」を全部説明。Mesen(常に64KB確保)・無印N8(マッパーパック固定確保)が正常なのとも整合。→ **09で即判定**
2. **ExRAM書き込みのフレーム内ゲート説**: N8 ProのMMC5コアがExRAMへのCPU書き込みを内部の「フレーム内」状態でブロック（$2001=0でも）。フェーズ丸ごと落ちる観察と整合。→ **08で判定**
3. **切替PRGバンク実行×WRAM読み×ExRAM書きの複合**（ログ従来の§5-2）→ **10で判定**
4. 残り: NT($2007)書き混在、$5105トグル、vblankオーバーラン → 08-10が全緑なら12以降で追加

### 5c. ExRAM書き込み量はコア数に無関係に一定（毎回768B）である点に注意
「描画量に比例して悪化」はExRAM書き込み自体の確率的欠落では説明しにくい（Nao_u指摘・正しい）。仮説1なら「描画量↑→転送2フェーズ間に書き換わる量↑」で自然に説明できる。

---

## 6. 次のステップ（原因確定後）

1. **パッチ版本編の実機確認**: `MonoSH_nes2.nes` / `NesLaser3_nes2.nes`（ヘッダのみNES2.0化、
   repro フォルダに生成済み）を N8 Pro で実行し、ビッグコアが化けないことを確認。
2. **本編ソースの恒久修正**: MonoSH リポジトリ `sys/header.s` を NES2.0 対応に
   （§10 の差分。NesLaser3 も同系）。
3. **krikzz へ報告**: `krikzz_bug_report.md`（書き直し済み・最終版）を送る。
   09/11 のペアが最小再現。要点は「iNES の mapper5 は WRAM 8KB では足りないタイトルが
   多い（ETROM=16KB, EWROM=32KB の市販作も旧iNESダンプが流通）。Mesen・無印N8 は
   多めに確保するので互換差になる。iNES の mapper5 はデフォルト 64KB を推奨」。

### （参考）実行前に立てた判定マトリクス — 結果は「09が赤」の行が的中

カード `/Volumes/NO NAME/MMC5_REPRO/` に配置済み。各ROMともMesenでは緑になるはず（要確認）。

| 結果 | 結論 | 次の行動 |
|---|---|---|
| **09が赤** | WRAMバンクエイリアス（仮説1）ほぼ確定 | **11を実行**。11が緑→「ヘッダのWRAM宣言不足」が根因。**本編をNES2.0ヘッダ(PRG-NVRAM 32KB, byte7=$08/byte10=$90)にして再テスト**＝ゲーム側で修正可能。11も赤→N8 ProのMMC5 WRAMバンキング自体のバグとしてkrikzzに報告 |
| **08が赤** | フレーム内黒帯でのExRAM書き込み欠落（仮説2）確定 | 最小再現として報告文を書く（08は単変数なので説得力が高い） |
| **10が赤**（08緑） | 切替バンク実行 or WRAM読み混在が引き金 | 10から要素を引き算した12を作って二分探索 |
| **全部緑** | 未再現要素の残り（NT書き混在/$5105/vblankオーバーラン）へ | 12: NT+ExRAM+$5105+$5113全部入りの「自己検証つきミニ本編」を作る |
| xfer.nes 赤 | 交互アクセス取りこぼし | （可能性低いが）そのまま報告可能 |

**フォールバック**（従来通り）: 最小再現が難しければ、実機で確実に化ける本編 `MonoSH.nes`/`NesLaser3.nes` を報告に添付（+ §1の観察 + §2のパイプライン説明）。krikzzはN8 Pro実機+Mesen+MMC5知識を持つので調査可能。仮説1が確定した場合はkrikzz報告と並行して**本編ヘッダ修正で自衛できる**。

---

## 7. 再現ROM作成の知見（ハマりどころ）

- **★MMC5コードは固定バンク`$E000-$FFFF`に置く**。リセットベクタが`$E000`以上を指すこと。`$8000`配置は電源投入時バンク未マップで**黒画面(起動不能)**になる（このセッションで踏んだ）。`nes.cfg`: PRG `$C000` size `$4000`(16KB), `CODE` start `$E000`。ヘッダ PRG=$01。
- 自己検証パターン: レンダOFFなら画面=backdrop `$3F00`。緑`$2A`/赤`$16`。取りこぼしは「補数値で下地→目標値で書く→==目標値か照合」で検出（同一パターン静止では検出不能なので必ず値を変える）。
- ビルド: `ca65 x.s -o x.o && ld65 -C nes.cfg x.o -o x.nes`。CHRは `chr.bin`(chrgen.py生成)をincbin。ツール: `/opt/homebrew/bin/{ca65,ld65}`, python3。`build.sh`/`build.bat`あり。
- ヘッダ検証: サイズ 49168 = 16 + 16KB PRG + 32KB CHR。mapper5。reset vector `>= $E000`。

---

## 8. 環境・場所

- **カード（N8 Pro用）**: 31.2GB FAT32 "NO NAME"。`/Volumes/NO NAME/MMC5_REPRO/` にROMを置く。差すと `/Volumes/NO NAME` にマウント。コピー後 `sync`、`cmp`でバイト一致確認。
  - カードには他に `edn8-pro-fw-v25.1123.efu`（最新fw）, `MonoSH.nes`, `NesLaser3.nes`（本編・実機で化ける確定版）も入っている。
- **無印N8用カード**: 別の7.7GB FAT32（差し替え運用）。無印は PRG/CHR各512KB上限・MMC5不完全。MonoSH(PRG1MB)は無印では動かない。
- **repro project**: `Claude/Homebrew/mmc5_exram_n8pro_repro/`（nao-u-lab git, origin済み。`--no-verify`でcommit、`git push --no-verify`）。
- **本編ソース**: github.com/Nao838861/**MonoSH**（`build/game.nes`）, **NesLaser3**。`/tmp/MonoSH` にclone。
  - 重要ファイル: `src/transfer.s`（NT/ExRAM転送）, `src/clear_vbuf_fast.s`, `src/draw_bgfaru.s`/`draw_bgfard.s`（VBUF描画, `dst_ptr += VBUF_STRIDE_PACKED(64)`）, `sys/mmc5/startup.s`（`$5102=2/$5103=1/$5113=0`でWRAM有効, `$5104`, `$5114`）, `sys/monobitmap_config.inc`（VBUF=$6000, TILE_BUFFER=$6C00, EXRAM_BUFFER=$6F00, BMP128x96, VBUF_W256, STRIDE_PACKED64）, `src/game.c`（PPUCTRL 8x16スプライト, MMC5スキャンラインIRQ+スプライト0）。
- **報告文ドラフト**: `Claude/Homebrew/krikzz_bug_report.md`（※スプライト/ExRAM前提で書いてあり、原因確定後に**要書き直し**。現時点の結論は「単体書き込みは無罪・複合要因」）。

---

## 9. 注意（脱線防止）
- スプライト仮説は**否定済み**（Nao_u談 & combo等）。ExRAM単体・WRAM単体も否定。深追いしない。
- 「同一パターン静止」の自己検証は失敗を見逃す。必ず値を変えて検証する。
- Mesen/MMC5をこの環境で実行する手段は無い（GUIのfceux.appのみ）。**描画・再現の最終確認はNao_uの実機/Mesen頼み**。作る側はヘッダ/ビルド/論理の正しさまで担保する。
- nao-u-lab は公開リポジトリ。自動同期でファイルが落ちることがある（過去にtorusが未追跡化）。push後は origin で `git cat-file -e` 確認。

---

## 10. 本編の恒久修正（MonoSH リポジトリ `sys/header.s`）

ヘッダを NES 2.0 化して PRG-NVRAM 32KB（64<<9）を宣言する。battery ビット(INES_SRAM)は既に立っている。

```asm
.byte 'N', 'E', 'S', $1A ; ID
.byte <INES_PRG_BANKS
.byte <INES_CHR_BANKS
.byte <INES_MIRROR | (<INES_SRAM << 1) | ((<INES_MAPPER & $f) << 4)
.byte (<INES_MAPPER & %11110000) | $08  ; ← NES 2.0 identifier (bits2-3 = 10)
.byte $0                                 ; byte8: submapper / mapper hi
.byte $0                                 ; byte9: ROM size hi (PRG64/CHR64は8bitに収まる)
.byte $90                                ; ← byte10: PRG-NVRAM = 64<<9 = 32KB
.byte $0, $0, $0, $0, $0                 ; byte11-15
```

注意: `header.s` はエンジン共通（nrom/mmc3等でも使われる）なので、無条件変更なら
他マッパーにも NVRAM 32KB が付く。気になるなら `INES_PRGRAM_SHIFT` のような
import を足してマッパー別レイアウトから渡すのがきれい。
検証済みバイナリパッチ（ビルド不要）: byte7 = $08, byte10 = $90 の2バイトのみ
（`MonoSH_nes2.nes` / `NesLaser3_nes2.nes` はこの方法で生成）。
