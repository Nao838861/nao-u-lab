# EverDrive N8 Pro — MMC5 バグ報告（投稿用・2026-07-03 原因確定版）

## 送信前チェック（Nao_u用・投稿前に記入/確認）
- [ ] カート種別を記入: **72-pin (NES)** or **Fami**
- [x] ファーム **v25.1123**（Device Info で確認）
- [x] 実機確認済み（2026-07-03）: `MonoSH_nes2.nes` / `NesLaser3_nes2.nes`（ヘッダのみNES2.0化）は N8 Pro で完全正常。最小ペア 09=赤 / 11=緑 も確定
- [ ] 送り先: krikzz フォーラム（krikzz.com のサポート/フォーラム）に投稿
- [ ] 添付: `09_wram_bankflip.nes`（赤=旧iNES） + `11_wram_bankflip_nes2.nes`（緑=NES2.0）
      （任意で `09_wram_bankflip.s` — 1ソースでヘッダ差のみと分かる）
- [ ] 動画URL（任意）: https://www.youtube.com/watch?v=s4W4xk-zi1E

投稿時は下の `--- POST FROM HERE ---` 以降をコピペ。（カート種別だけ埋める）

---

--- POST FROM HERE ---

**Title: MMC5 (mapper 5): $5113 PRG-RAM bank 1 aliases bank 0 with legacy iNES headers (N8 Pro fw v25.1123)**

First, thank you for the EverDrive. For NES/Famicom homebrew there is really
nothing else like it — being able to run my own code on real hardware, exactly
as it will run for anyone else, is what makes this hobby possible for me. I'm
grateful for the work you put into it.

I found a small compatibility issue and wanted to share a clean minimal repro
in case it's useful.

**Cartridge:** EverDrive N8 Pro (72-pin / Famicom: FILL IN), firmware v25.1123
**Affected:** mapper 5 (MMC5) ROMs with legacy iNES headers (no PRG-RAM size declared)
**Works correctly on:** Mesen, original EverDrive N8

## Summary

On N8 Pro, an MMC5 ROM with a legacy iNES header (byte 7 = $00, no RAM size
fields) appears to get only 8KB of PRG-RAM: selecting WRAM bank 1 via $5113
silently maps the same 8KB as bank 0 (bank 1 is an alias of bank 0). Games that
double-buffer data across two WRAM banks break in subtle, motion-dependent ways,
while simple single-bank RAM tests all pass.

The identical binary with a NES 2.0 header declaring 32KB PRG-NVRAM works
perfectly, which confirms it is the RAM allocation, not the MMC5 register
emulation.

## Minimal test ROMs (attached)

Both ROMs contain the *identical* program; only the 16-byte header differs.
While displaying an ExRAM extended-attribute background, the test continuously
writes value V to $6000-$6BFF in WRAM bank 0 ($5113=0) and complement ~V to the
same range in bank 1 ($5113=1), then reads both banks back and verifies.
Green screen = all reads match. Red screen (latched) = mismatch.

| ROM | Header | Mesen | N8 Pro v25.1123 |
|---|---|---|---|
| `09_wram_bankflip.nes` | legacy iNES (mapper 5, battery, no RAM size) | green | **red (immediately)** |
| `11_wram_bankflip_nes2.nes` | NES 2.0, PRG-NVRAM = 32KB (byte 10 = $90) | green | **green** |

The immediate red on 09 is exactly what bank-1-aliases-bank-0 produces: the ~V
written through "bank 1" is found in bank 0 on read-back.

## Why this matters beyond homebrew

Licensed MMC5 boards commonly carry more than 8KB of PRG-RAM: ETROM has 16KB
(2 x 8KB) and EWROM has 32KB. Many dumps of those games circulate with legacy
iNES headers that declare no RAM size, so they would hit the same aliasing on
N8 Pro. Mesen and the original N8 mapper pack allocate a larger default for
mapper 5, which is why the same files behave differently across devices.

## Suggested fix

For mapper 5 with a legacy iNES header, default PRG-RAM to 64KB (all 8 banks
reachable via $5113), as Mesen does. NES 2.0 headers should keep using the
declared size — that path already works correctly on N8 Pro.

## Background (how this was found)

My homebrew MMC5 game double-buffers a 1bpp framebuffer in WRAM banks 0/1 and
renders it through ExRAM extended attributes. On N8 Pro only, moving objects
showed interleaved rows of two different animation frames (static screens were
pixel-perfect). Every single-memory stress test was green — WRAM sequential /
strided / during rendering, ExRAM sequential, WRAM<->ExRAM alternating copies,
ExRAM writes inside a mid-frame forced-blank band, transfers executed from a
switched $5114 PRG bank. The only failing element was $5113 double-buffering,
and only with the legacy header. Patching just the header of the full game to
NES 2.0 (bytes 7/10 = $08/$90) fixes it on N8 Pro — confirmed on hardware.

Thank you again for everything you make. And from Japan — I hope peace returns
to your country as soon as possible.

--- POST END ---

---

## 日本語訳（参考・投稿はしない）

**タイトル: MMC5 (mapper 5): 旧iNESヘッダのROMで $5113 のPRG-RAMバンク1がバンク0にエイリアスする（N8 Pro fw v25.1123）**

まず、EverDrive をありがとうございます。NES/ファミコンの自作にとって、これは
本当に代え難いものです — 自分のコードを、他の誰の環境でもそのまま動くのと同じ
形で実機で動かせること。それがこの趣味を私にとって成り立たせてくれています。
作り込みに込められた仕事に感謝しています。

小さな互換性の問題を見つけたので、役に立つかもしれないと思い、きれいな最小
再現をお送りします。

**カート:** EverDrive N8 Pro（72-pin / Famicom: 記入）、ファーム v25.1123
**影響:** 旧iNESヘッダ（PRG-RAMサイズ無宣言）の mapper 5 (MMC5) ROM
**正常動作:** Mesen、無印 EverDrive N8

### 概要

N8 Pro では、旧iNESヘッダ（byte7 = $00、RAMサイズ欄なし）の MMC5 ROM に
PRG-RAM が 8KB しか割り当てられないようで、$5113 で WRAM バンク1を選ぶと
バンク0と同じ 8KB が見えます（バンク1がバンク0のエイリアス）。データを
2つの WRAM バンクにダブルバッファするゲームは、単一バンクのRAMテストは
すべて通るのに、動きに依存した分かりにくい壊れ方をします。

まったく同一のバイナリでも、NES 2.0 ヘッダで 32KB の PRG-NVRAM を宣言すると
完璧に動きます。これは MMC5 レジスタのエミュレーションではなく、RAM の
割り当てが原因であることを示します。

### 最小テストROM（添付）

2本のROMは中身のプログラムが完全に同一で、16バイトのヘッダだけが異なります。
ExRAM拡張属性の背景を表示しながら、WRAMバンク0（$5113=0）に値Vを、バンク1
（$5113=1）に補数~Vを $6000-$6BFF へ書き続け、両バンクを読み戻して照合します。
緑=全一致、赤（ラッチ）=不一致。

| ROM | ヘッダ | Mesen | N8 Pro v25.1123 |
|---|---|---|---|
| `09_wram_bankflip.nes` | 旧iNES（mapper5, battery, RAMサイズ無宣言） | 緑 | **即・赤** |
| `11_wram_bankflip_nes2.nes` | NES 2.0, PRG-NVRAM = 32KB（byte10 = $90） | 緑 | **緑** |

09が即・赤になるのは「バンク1=バンク0エイリアス」そのもので、バンク1経由で
書いた~Vが読み戻しでバンク0に見えています。

### homebrew に限らない理由

ライセンス品の MMC5 基板は 8KB を超える PRG-RAM を積むものが多く、ETROM は
16KB（2×8KB）、EWROM は 32KB あります。これらのダンプの多くが RAMサイズ
無宣言の旧iNESヘッダで流通しているため、N8 Pro では同じエイリアスを踏むはず
です。Mesen と無印N8 のマッパーパックは mapper5 に大きめのデフォルトを確保
するので、同じファイルでも機種によって挙動が変わります。

### 修正案

旧iNESヘッダの mapper 5 では、PRG-RAM のデフォルトを（Mesen 同様）64KB＝
$5113 で届く8バンク全部にしてください。NES 2.0 ヘッダは宣言サイズを使う
現状のままで問題ありません（そちらは N8 Pro でも正しく動作します）。

### 発見の経緯（参考）

自作の MMC5 ゲームは 1bpp フレームバッファを WRAM バンク0/1 でダブルバッファ
し、ExRAM拡張属性で描画しています。N8 Pro でのみ、動く物体が2フレーム分の
絵の行が交互に混ざった状態で化けました（静止画は完璧）。単一メモリの負荷
テストはすべて緑でした — WRAM連続/ストライド/描画中、ExRAM連続、WRAM↔ExRAM
交互コピー、フレーム内強制ブランク帯でのExRAM書き、$5114で切り替えたPRG
バンクからの転送実行。唯一失敗したのは $5113 のダブルバッファで、しかも
旧iNESヘッダのときだけ。本編のヘッダを NES 2.0（byte7/10 = $08/$90）に
するだけで N8 Pro で直りました（実機確認済み）。

改めて、いつも素晴らしいものを作ってくれてありがとうございます。そして日本
から — あなたたちの国に一日でも早く平穏が戻ることを祈っています。
