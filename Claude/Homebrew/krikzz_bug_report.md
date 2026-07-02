# EverDrive N8 Pro — MMC5 バグ報告（投稿用・2026-07-03 原因確定版）

## 送信前チェック（Nao_u用・投稿前に記入/確認）
- [ ] カート種別を記入: **72-pin (NES)** or **Fami**
- [ ] ファーム **v25.1123**（Device Info で確認）
- [ ] **パッチ版本編（MonoSH_nes2.nes）の実機確認結果を最終段落に反映**
- [ ] 送り先: krikzz フォーラム（krikzz.com のサポート/フォーラム）に投稿
- [ ] 添付: `09_wram_bankflip.nes`（赤=旧iNES） + `11_wram_bankflip_nes2.nes`（緑=NES2.0）
      （任意で `09_wram_bankflip.s` — 1ソースでヘッダ差のみと分かる）
- [ ] 動画URL（任意）: https://www.youtube.com/watch?v=s4W4xk-zi1E

投稿時は下の `--- POST FROM HERE ---` 以降をコピペ。（カート種別だけ埋める）

---

--- POST FROM HERE ---

**Title: MMC5 (mapper 5): $5113 PRG-RAM bank 1 aliases bank 0 with legacy iNES headers (N8 Pro fw v25.1123)**

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
NES 2.0 (bytes 7/10 = $08/$90) fixes it on N8 Pro. (CONFIRM AFTER HW TEST)

--- POST END ---
