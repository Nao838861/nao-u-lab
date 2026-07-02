# EverDrive N8 Pro — MMC5 バグ報告（投稿用）

## 送信前チェック（Nao_u用・投稿前に記入/確認）
- [ ] カート種別を記入: **72-pin (NES)** or **Fami**
- [ ] ファーム **v25.1123**（Device Info で確認）
- [ ] 送り先: krikzz フォーラム（krikzz.com のサポート/フォーラム）に投稿
- [ ] 添付: `repro.nes`（＋実機で化けたバリアント / 本編2本）
- [ ] 動画URL（任意）: https://www.youtube.com/watch?v=s4W4xk-zi1E

投稿時は下の `--- POST FROM HERE ---` 以降をコピペ。（カート種別だけ埋める）

---

--- POST FROM HERE ---

**Title:** EverDrive N8 Pro — MMC5 (mapper 5) ExRAM extended-attribute background corrupts with 8×16 sprites (fw v25.1123)

Hi, I think I found an MMC5 bug on the EverDrive N8 Pro. I'm a homebrew developer and one of my games renders correctly on Mesen and on the original EverDrive N8, but is corrupted only on the N8 Pro. I made a minimal repro ROM (attached).

**Environment**
- Cartridge: EverDrive N8 Pro ( **[fill in: 72-pin / Fami]** )
- Firmware: **v25.1123** (latest)
- Console: Famicom/NES, real hardware (NTSC)

**Where it happens**
- ✅ Mesen (I develop and verify on it): correct
- ✅ Original EverDrive N8 (real hardware): correct
- ❌ EverDrive N8 Pro, firmware v25.1123: corrupted

**Symptom**
My game draws a large object (a boss) as a bitmap using **MMC5 ExRAM extended-attribute mode**, on top of a normal tiled background.
- The normal tiled background is always fine.
- The extended-attribute object is corrupted: black lines appear on **alternate scanlines**, giving a "half vertical resolution" look.
- It gets **worse as more sprites are on screen** — with one object it is slightly wrong, and with several objects (more sprites per scanline) most of the object ends up with a black line on every other line.

**MMC5 features the game uses**
- ExRAM **extended-attribute mode** (`$5104`: switched to mode 2 to write the attribute bytes into ExRAM, then mode 1 to display). Each 8×8 background cell selects its own 4KB CHR bank from ExRAM.
- **8×16 sprite mode** (so MMC5 uses its sprite-vs-background CHR fetch-phase detection).
- MMC5 scanline IRQ + sprite-0 hit (used for a scroll split).
- CHR mode 3.

**Minimal reproduction (attached)**
`repro.nes` isolates the trigger with the smallest setup:
- MMC5 mapper 5, ExRAM extended-attribute background built from **solid tiles** (so any per-scanline CHR fetch dropout shows up immediately as black horizontal lines). The background looks like a diagonal grid of white/red/green solid blocks.
- **8×16 sprite mode**, 64 sprites placed as **8 sprites per scanline** over a horizontal band.
- **Hold the A button to move all sprites off-screen.**

What I see:
- On **Mesen and the original N8**: a clean grid of solid blocks with a band of white sprites, **no black lines**.
- On the **N8 Pro (v25.1123)**: the extended-attribute background gets black lines / dropout. **Holding A (removing the sprites) makes the corruption disappear**, and releasing A (sprites back) brings it back.

That A-button behavior is the key point: the background corruption is directly tied to how many sprites are being fetched, which points at the **sprite / background CHR fetch-phase detection** in the N8 Pro's MMC5 core, in combination with extended-attribute background fetches.

**Extra repro variants (in case the base one doesn't trigger it on your unit)**
- `repro_dense.nes` — 8×16 sprites, more than 8 per scanline (sprite overflow)
- `repro_8x8.nes` — 8×8 sprites, 8 per scanline
- `repro_8x8_dense.nes` — 8×8 sprites, overflow

**Also reproducible with the full games**
- `NesLaser3.nes` (mapper 5, PRG 256KB / CHR 512KB) — video: https://www.youtube.com/watch?v=s4W4xk-zi1E
- `MonoSH.nes` (mapper 5, PRG 1MB / CHR 512KB)

Both are correct on Mesen and on the original N8, and corrupted only on the N8 Pro.

**Steps to reproduce**
1. Put `repro.nes` on the SD card and run it on the N8 Pro (fw v25.1123).
2. Look at the background blocks — you should see black lines on alternate scanlines.
3. Hold A → sprites disappear and the background becomes clean; release A → the corruption returns.

**Expected:** extended-attribute background renders correctly regardless of sprite count (as on Mesen and the original N8).
**Actual:** extended-attribute background corrupts on alternate scanlines, scaling with sprite count.

Thanks a lot for looking into it — happy to provide more info, source, or other test builds.

--- POST END ---

---

## メモ（自分用・日本語）
- 要点: MMC5拡張属性(背景) ＋ 8x16スプライト多数 で **N8 Proだけ背景が1ラインおき黒線**。Mesen・無印N8は正常。ファーム25.1123。
- 決め手: **Aでスプライトを消すと黒線が消える** → スプライト/BGフェッチ位相検出の問題を示唆。
- 添付候補: `repro.nes`（本命）＋実機で化けたバリアント。だめなら本編 `NesLaser3.nes`/`MonoSH.nes`。
- 投稿先: krikzz.com のフォーラム（要アカウント）またはサポート窓口。
