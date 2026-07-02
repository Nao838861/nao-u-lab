# EverDrive N8 Pro MMC5 バグ調査 — 引き継ぎメモ

Mac で進めた内容を Windows PC で続けるための記録。最終更新 2026-07-02。

---

## 0. これは何の作業か（30秒サマリ）

Nao_u の自作NESソフト（**NesLaser3** と **MonoSH**）が、

- **Mesen（開発環境）で正常** ✅
- **無印 EverDrive N8（実機）で正常** ✅
- **EverDrive N8 Pro（実機・最新ファーム 25.1123）でだけ描画が化ける** ❌

という状態。切り分けの結果 **N8 Pro の MMC5 実装（ExRAM拡張属性モード）バグ**と結論。
→ **krikzz に報告して直してもらう**のがゴール。そのための**最小再現ROM**を作成中。

**次にやること（TODO）**は本メモ末尾の「9. 次のステップ」を参照。

---

## 1. 症状（化け方の詳細）

- 背景（星などの通常タイル）は**正常**。
- **ビッグコア（ボス）**の描画が化ける。
  - 1体目：少し絵が化けながら出る
  - 2体目・3体目…と増えるほど悪化
  - 最終的に **1ラインおきに黒線** が入り、**低解像度化**したような絵になる
- つまり「**スプライトが増えるほど、拡張属性で描く背景ビットマップが1ラインおきに欠ける**」。

---

## 2. 対象ソフトと解析結果

いずれも **mapper 5 (MMC5)**、iNESヘッダ正常（ファイルサイズ＝ヘッダ記載と完全一致）。

| ソフト | リポジトリ / ファイル | PRG | CHR | 備考 |
|---|---|---|---|---|
| NesLaser3 | github.com/Nao838861/**NesLaser3** → `NesLaser3.nes` | 256KB | 512KB | 動画: youtube.com/watch?v=s4W4xk-zi1E |
| MonoSH | github.com/Nao838861/**MonoSH** → `build/game.nes` | **1024KB(1MB)** | 512KB | 「MonoBitmap」エンジン。PRG1MBはMMC5上限 |

- 取得方法（Windowsでも同じ）: `gh api -H "Accept: application/vnd.github.raw" repos/Nao838861/MonoSH/contents/build/game.nes > game.nes`
  （または GitHub から直接 raw ダウンロード）

---

## 3. 本編が使っている MMC5 機能（＝バグの舞台）

MonoSH のソースを読んで確認した使用機能:

- **ExRAM 拡張属性モード（`$5104` を 2⇔1 でトグル）**
  `src/transfer.s` … `$5104=2`（ExRAMを書込可能RAMに）→ 拡張属性バイトをExRAM($5C00-)へ書く → `$5104=1`（拡張属性モードで表示）。
  拡張属性モードでは背景の各8x8セルがExRAMの1バイトで **4KB CHRバンクを個別選択**し、512KBのCHR-ROMからビットマップを合成する（＝ビッグコアの絵）。
- **8x16スプライトモード**（`src/game.c`）
  `PPU_CTRL = ... | CTRL_SPRITE_8x16`。コメントに「$5120-$5123=スプライト用 / $5124-$5127=BG用」。
  → MMC5は「今スプライトのCHRフェッチか、背景のCHRフェッチか」を**PPUフェッチから位相検出**して使うレジスタを切り替える。ここが実装依存。
- **MMC5 スキャンラインIRQ + スプライト0ヒット**（`src/game.c`, `MMC5_IRQ_BASE_LINE`）でスクロール分割。
- **CHRモード3（1KBバンク, `$5120-$5127`）**。`sys/mmc5/startup.s`, `sys/mmc5/chr.s`。

**バグの主犯（仮説）**: 8x16スプライトモードでの **スプライト/BGフェッチ位相検出**が、N8 Pro実装だと**スプライトが多い（1ラインに8枚級）ときに崩れ**、拡張属性の背景CHRフェッチが交互ラインで誤バンク/空になる → 1ラインおきの黒線。スプライトが増えるほど悪化する挙動と一致。フラッシュカートはPPU自体を変えないので、無印とProの差＝MMC5の作りの差、という点も裏付け。

---

## 4. 切り分け結果（結論の根拠）

- Mesen（リファレンス精度）で正常 → **ROMはMMC5仕様に準拠して正しい**
- 無印N8でも正常
- N8 Pro（**最新ファーム 25.1123**）でだけ化ける
- → **N8 Pro側の残存バグ**。Nao_uのコードの問題ではない。

### N8 Pro ファームの MMC5 修正履歴（changelog より）
すべて古いバージョンで、最新25.1123に含まれる。2025年の更新はMMC5コアに触れていない＝**今回のケースは未修正の残存バグの可能性が高い**。
- EDN8-V2.07 (2020): 「MMC5 ExRAM fix by domgetter」「IRQ and sram mapping fix for MMC5」
- EDN8-V2.09: Improvements for MMC5
- EDN8-V2.12: Fix for MMC5

---

## 5. ハードウェア / SDカードの現状（Mac側でセットアップ済み）

### N8 Pro 用SDカード（31.2GB, FAT32）
- `edn8-pro-fw-v25.1123.efu` … 最新ファーム（krikzz公式, 3,622,976バイト）
- `NesLaser3.nes`
- `MonoSH.nes`（MonoSHの `build/game.nes` をリネームしたもの）
- N8 Proは mapper5 をフル対応（公式 mappers.png で緑＝対応, 228マッパー対応）。新しい個体（2025年以降）なのでEDN8フォルダは実機が自動生成。

### 無印N8 用SDカード（7.7GB, FAT32）
- 既存の EDN8 フォルダ＋Nao_uの自作ROM多数（既存は変更していない）
- `MonoSH.nes` を追加済み
- ⚠ **無印N8は PRG/CHR 各512KBが上限**。MonoSHはPRG1MBなので**無印では起動しない見込み**（NesLaser3=256KBは上限内）。無印での確認対象は主にNesLaser3。

---

## 6. 最小再現ROMプロジェクト（このフォルダの中身）

場所: `nao-u-lab/Claude/Homebrew/mmc5_exram_n8pro_repro/`

| ファイル | 役割 |
|---|---|
| `repro.s` | 本体アセンブリ（MMC5 ExRAM拡張属性 ＋ 8x16スプライト最小構成） |
| `chrgen.py` | CHR生成（solidタイル。8×4KBバンク） |
| `nes.cfg` | ld65リンカ設定（mapper5 / PRG32KB / CHR32KB） |
| `build.sh` / `build.bat` | ビルド（Mac / Windows） |
| `repro.nes` | ビルド済みROM（65,552バイト。ヘッダ検証済み: mapper5, PRG32KB, CHR32KB） |
| `chr.bin`, `repro.o` | ビルド生成物 |
| `README.md` | 再現ROMの説明 |

### 再現ROMの狙い
本編の中核（**ExRAM拡張属性で背景 ＋ 8x16スプライトを各ライン8枚**）を最小化。タイルは全て solid（8ライン塗り）なので、**CHRフェッチが1ラインでも欠けると黒い横線として即見える**。

- **Mesen / 無印N8（正常）**: 斜めの白・赤・緑 solid ブロック＋上部に白いスプライト帯。黒線なし。
- **N8 Pro（バグ想定）**: 背景ブロックに1ラインおきの黒線。
- **Aボタン押下中**: スプライトを画面外へ隠す → 黒線が消えれば「スプライト依存＝フェッチ位相検出の問題」を実証。

### ⚠ 未検証事項
Mac側では **N8 Pro実機での再現確認はできていない**（ビルド成功・ヘッダ正常まで）。
**Windowsでまず Mesen で正常表示を確認 → N8 Pro実機で黒線が出るかを確認**すること。

---

## 7. Windows での続行手順

### 7-1. ツール準備
- **cc65**（ca65/ld65 を含む）: https://cc65.github.io/ からWindowsバイナリ入手、`bin` を PATH に追加。
- **Python 3**: PATH に。
- **Mesen**: 既に開発で使用中のはず。
- （任意）**gh CLI**: ROM再取得用。

### 7-2. 再現ROMのビルド
```
cd Homebrew\mmc5_exram_n8pro_repro
build.bat
```
→ `repro.nes` が生成（`build.bat` が無ければ次を手動実行）:
```
python chrgen.py
ca65 repro.s -o repro.o
ld65 -C nes.cfg repro.o -o repro.nes
```

### 7-3. テスト
1. Mesen で `repro.nes` → 黒線が出ずきれいに出ることを確認（ベースライン）。
2. N8 Pro のSDへコピー → 実機起動、黒線が出るか確認。
3. Aボタンを押し引きしてスプライト有無で変化するか確認。

---

## 8. もし最小再現ROMで再現しなかったら
`README.md` の「次の一手」参照。順に:
1. スプライト密度を上げる（1ラインに9枚以上でオーバーフローさせる）
2. 本編同様に MMC5スキャンラインIRQ + スプライト0ヒット を足す
3. スプライトを8x8に変える／CHRモードを変える
4. それでも出なければ **本編2本（MonoSH.nes / NesLaser3.nes）を報告に添付**（実機で確実に化ける確定版）

---

## 9. 次のステップ（TODO）

- [ ] Windowsで `repro.nes` を **Mesen** で確認（クリーンであること）
- [ ] `repro.nes` を **N8 Pro実機** で確認（黒線が出るか＝再現成功か）
- [ ] 再現した → **krikzz へバグ報告**（下記テンプレ）。repro.nes を添付。
- [ ] 再現しなかった → 「8. 次の一手」で強化 or 本編2本を添付
- [ ] （必要なら）report を英語で清書

### krikzz バグ報告テンプレ（英語, 下書き用の骨子）
> **Subject:** EverDrive N8 Pro — MMC5 ExRAM extended attribute corruption with 8x16 sprites (fw v25.1123)
>
> **Summary:** A homebrew using MMC5 (mapper 5) ExRAM extended attribute mode ($5104=1) for the background, combined with 8x16 sprite mode and ~8 sprites per scanline, renders correctly on Mesen and on the original EverDrive N8, but the extended-attribute background gets corrupted on the N8 Pro (firmware v25.1123). Black lines appear on alternate scanlines, and it gets worse as more sprites are on screen.
>
> **MMC5 features used:** ExRAM extended attribute mode (mode 1), 8x16 sprite mode with split sprite/BG CHR ($5120-$5123 sprite / $5124-$5127 BG), MMC5 scanline IRQ + sprite 0 hit, CHR mode 3.
>
> **Repro:** minimal ROM attached (repro.nes). Clean on Mesen; corrupted on N8 Pro. Holding A hides all sprites and the corruption disappears, which points to the sprite/background CHR fetch-phase detection under sprite load.
>
> **Also reproducible with:** the full homebrew ROMs NesLaser3.nes and MonoSH.nes.

---

## 10. 参考リンク
- N8 Pro ファーム: https://krikzz.com/pub/support/everdrive-n8/pro-series/firmware/
- N8 Pro マニュアル: https://krikzz.com/pub/support/everdrive-n8/pro-series/n8-pro-manual.pdf
- 対応マッパー表: https://krikzz.com/pub/support/everdrive-n8/pro-series/mappers.png
- changelog: https://krikzz.com/pub/support/everdrive-n8/pro-series/firmware/changelog.txt
- MMC5 (nesdev): https://www.nesdev.org/wiki/MMC5
- cc65: https://cc65.github.io/
- リポジトリ: github.com/Nao838861/MonoSH , github.com/Nao838861/NesLaser3
