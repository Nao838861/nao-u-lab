# graze_log v05.2_cdx_v28

1942 の序盤編隊を「抽象化」ではなく、原作画面座標 224x256 からのトレースカードとして再現する試作。

## 方針

- 「Galaga 的」「1942 的」といった名前だけの引用をやめる。
- 1942 の明示情報にある、赤5機/10機編隊、全滅報酬、下左右から出る低速ボーナス機、横から旋回する小型機、大型機前の護衛を wave 単位で写す。
- 各敵は `traceLine` または `traceBezier` の軌跡を追従する。速度は duration frame で制御する。
- 原作完全一致とはまだ言わない。公開資料から確認できる編隊単位を、できるだけ原作座標系で再現する段階。

## 実装した trace wave

1. `1942 red five V down`
2. `1942 left curl squadron`
3. `1942 right curl squadron`
4. `1942 red ten ladder`
5. `1942 bottom bonus plane L`
6. `1942 mirrored side curls`
7. `1942 screen width pass gap R`
8. `1942 bomber escort entry`
9. `1942 red five V repeat faster`
10. `1942 bottom bonus plane R`
11. `1942 boss warning red ten`
12. `1942 large bomber proxy`

## 遊び方

`index.html` をブラウザで開く。

自動検証プレイを見る場合は、エクスプローラーから `auto_verify.html` をダブルクリックする。

## ヘッドレス検証

```powershell
node tools\headless_graze_log_cdx_v05_2_v28_check.js
```

確認項目:

- 1942 trace source notes がある。
- 224x256 原作座標から 420x620 へスケールしている。
- 赤5機V、赤10機、左右 curl、下方ボーナス機、横幅 pass、大型機 proxy の stage flag が立つ。
- boss / clear / Active DEF / bot clear が通る。

## 参照元

- Arcade Database / MAME 1942: https://adb.arcadeitalia.net/dettaglio_mame.php?game_name=1942
- NES 1942 manual mirror: https://www.world-of-nintendo.com/manuals/nes/1942.shtml
