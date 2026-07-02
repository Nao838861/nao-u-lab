# N8 Pro MMC5 バグ — 検証ログ / Fable引き継ぎ（このセッションの全記録）

最終更新 2026-07-03。このファイルが**現時点の最有力・最新の引き継ぎ**。
（先行の `N8Pro_MMC5_引き継ぎ.md` はSDカード設定など背景。repro調査の最新はこちら）

---

## 0. いま何を追っているか（1分）

Nao_u の自作NES `MonoSH` / `NesLaser3`（mapper5=MMC5）が、
**Mesen ◯ / 無印EverDrive N8 ◯ / N8 Pro（fw v25.1123）だけ描画が化ける**。
原因を特定して krikzz に報告するため、**N8 Proでだけ化ける最小再現ROM**を作っている。

**現状: 単体の書き込みストレスは全て緑（再現せず）。原因は「本編の複合的な動作でしか出ない」と判断。再現度を上げる方向で継続中。**

**次にやること: `xfer.nes` の実機結果待ち → 緑なら「切替PRGバンクから実行しながら書く」再現へ。（詳細は §6）**

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

→ **単一メモリへの書き込みはどのパターンでも取りこぼさない（緑）**。`xfer.nes` は「異なるカートメモリの交互アクセス」を初めて突く。

---

## 4. 確定した事実（ruled in/out）

- ✅ N8 Proは mapper5 対応、fw **v25.1123**（最新, Nao_u確認済み）。基本描画OK（sanity白）。
- ✅ **静止ExRAM拡張属性表示は正常**（repro.nes）。
- ✅ **WRAM($6000)書き込みは連続/ストライド/描画中いずれも成功**（wram/wram_stride/combo 緑）。
- ✅ **ExRAM($5C00)書き込みも連続で成功**（exram 緑）。
- ✅ Mesen・無印N8では本編は正常（Nao_u確認）。
- ❓ 未検証: **カートメモリ交互アクセス / 切替バンク実行 / NT書き混在 / $5104トグル中 / vblankオーバーラン / フル複合**。

---

## 5. 現在の作業仮説

単体で落ちない以上、**本編の複合シーケンス固有の条件**で書き込み(またはアービトレーション)が破綻している。候補:
1. **WRAM読み↔ExRAM書きの交互高速アクセス**（→ `xfer.nes` で検証中）
2. **切替PRGバンクから実行しながら書く**（本編は `$5114=$81/$84-$87` の先から書く。全テストは固定`$E000`バンクから実行＝未再現）★大きな未再現要素
3. **NT($2007)書きとExRAM書きの混在**（転送は両方やる）
4. **$5104を2↔1トグルしながら**の書き
5. **転送がvblankを溢れて画面描画中に書く**（PPUのExRAMフェッチと衝突）
6. 上記の**複合**（＝本編そのもの）

---

## 6. 次のステップ（Fableはここから続ける）

1. **`xfer.nes` の実機結果を確認**（緑/赤）。Mesenでも見て Pro固有か確定。
   - 赤 → 「交互アクセスで取りこぼす」で核心。報告文を書ける。
   - 緑 → 次へ。
2. **切替バンク実行版を作る**（最有力の未再現要素）: PRGを複数8KBバンク構成にし、`$5114=$81`等で切り替えた先に書き込みルーチンを置き、そこから WRAM/ExRAM を書く。`nes.cfg` を multi-bank に拡張（現状は固定16KB=$C000-$FFFF）。
3. さらに寄せる: NT書き混在、$5104トグル、レンダON中の転送(vblankオーバーラン再現)。
4. **フル忠実版 or 本編コード流用**: `transfer.s`/`clear_vbuf_fast.s`/`draw_bgfaru.s` を最小ハーネスで実行し、VBUF→NT+ExRAM をアニメ＋自己検証。
5. **フォールバック**: 最小再現が難しければ、**実機で確実に化ける本編 `MonoSH.nes`/`NesLaser3.nes` を報告に添付**（+ §1の観察 + §2のパイプライン説明）。krikzzはN8 Pro実機+Mesen+MMC5知識を持つので調査可能。

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
