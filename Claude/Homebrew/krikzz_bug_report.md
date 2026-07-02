# Bug report draft — EverDrive N8 Pro: MMC5 ExRAM extended-attribute corruption with 8×16 sprites

---

## 送信前チェック（Nao_u用・送る前に確認/記入）
- [ ] N8 Pro のバリアント（**72-pin (NES)** / **Fami** どちら？）を記入
- [ ] ファームは **v25.1123** で合っているか（Device Info で確認）
- [ ] 送り先: krikzz フォーラム（krikzz.com のサポート/フォーラム）に投稿、または krikzz のサポート窓口へ
- [ ] 添付: `repro.nes`（最小再現）。必要なら本編 `NesLaser3.nes` / `MonoSH.nes` も
- [ ] 動画URL（NesLaser3: https://www.youtube.com/watch?v=s4W4xk-zi1E ）を貼ると伝わりやすい
- [ ] 連絡先/名前は好みで調整

※ 本文は英語。下に日本語の要約もあり。

---

## Report (English — ready to send)

**Subject:** EverDrive N8 Pro — MMC5 (mapper 5) ExRAM extended-attribute background corruption with 8×16 sprites (fw v25.1123)

### Environment
- Cartridge: **EverDrive N8 Pro** ( _[fill in: 72-pin / Fami]_ )
- Firmware: **v25.1123** (latest at time of report)
- Console: Famicom/NES (real hardware)

### Summary
A homebrew game that uses the **MMC5 ExRAM extended-attribute mode** for the background, together with **8×16 sprite mode** and a heavy sprite load (about 8 sprites per scanline), renders **correctly on Mesen and on the original EverDrive N8**, but the extended-attribute background is **corrupted only on the N8 Pro**. Black lines appear on alternate scanlines of the extended-attribute graphics, and the corruption gets worse as more sprites are on screen.

### Affected / not affected
- ✅ Mesen (the game was developed and verified on it): correct
- ✅ Original EverDrive N8 (real hardware): correct
- ❌ EverDrive N8 Pro, firmware v25.1123: corrupted

### Symptom (in the full game)
- The normal tiled background is fine.
- A large boss ("big core") that is drawn via the MMC5 extended-attribute bitmap is corrupted.
- With one boss it is slightly wrong; as a 2nd, 3rd boss appear, more scanlines drop out, ending in **a black line on every other scanline** and a "lower vertical resolution" look.
- i.e. the more sprites on screen, the worse the extended-attribute background corruption.

### MMC5 features used by the ROM
- ExRAM **extended attribute mode** (`$5104` toggled 2→1: write attributes into ExRAM in mode 2, display in mode 1). Each 8×8 background cell selects its own 4KB CHR bank from ExRAM.
- **8×16 sprite mode** with split sprite/BG CHR (`$5120–$5123` for sprites, `$5124–$5127` for BG).
- MMC5 **scanline IRQ + sprite 0 hit** (used for scroll split).
- CHR mode 3 (1KB banks).

### Minimal reproduction (attached: `repro.nes`)
A minimal ROM that isolates the trigger:
- MMC5 mapper 5, ExRAM extended-attribute background made of **solid tiles** (so any per-scanline CHR fetch dropout is immediately visible as black horizontal lines). The background is a diagonal grid of white/red/green solid blocks.
- **8×16 sprite mode**, 64 sprites arranged as **8 sprites per scanline** over a band (Y ≈ 40–168).
- **Hold the A button** to move all sprites off-screen.

Expected (and what Mesen / original N8 show): a clean grid of solid blocks with a band of white sprites, **no black lines**.
On the N8 Pro (v25.1123): the extended-attribute background shows corruption / black lines, and **releasing/pressing A (adding/removing sprites) makes the corruption appear/disappear** — which points to the sprite-vs-background CHR fetch-phase detection under sprite load.

### Steps to reproduce
1. Copy `repro.nes` to the SD card and run it on the N8 Pro (fw v25.1123).
2. Observe the background blocks (look for black lines every other line).
3. Hold A (sprites hidden) → background should become clean; release A (sprites shown) → corruption returns.

### Also reproducible with the full homebrew
- `NesLaser3.nes` (mapper 5, PRG 256KB / CHR 512KB) — video: https://www.youtube.com/watch?v=s4W4xk-zi1E
- `MonoSH.nes` (mapper 5, PRG 1MB / CHR 512KB)
Both are correct on Mesen and the original N8, corrupted only on the N8 Pro.

### Likely area (observation, not a diagnosis)
The correlation with sprite count and 8×16 sprite mode suggests the **MMC5 sprite/background CHR fetch-phase detection** interacting with **ExRAM extended-attribute background fetches** may be the culprit on the N8 Pro implementation.

### Attachments
- `repro.nes` (minimal repro)
- (optional) `NesLaser3.nes`, `MonoSH.nes`

Thank you!

---

## 日本語要約（自分用メモ）
- MMC5拡張属性(背景)＋8x16スプライト多数、で **N8 Proだけ背景が1ラインおき黒線化**。Mesen・無印N8は正常。ファーム25.1123。
- 最小再現 `repro.nes` 添付。Aボタンでスプライトを消すと黒線が消える＝スプライト依存（フェッチ位相検出）を示唆。
- 本編 NesLaser3 / MonoSH も同症状。
