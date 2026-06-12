# MonoSH 2026-06-05 Space Harrier 敵パターン・敵弾・上端クラッシュ修正ログ

## Use when

MonoSH、NES、Space Harrier 風敵パターン、敵弾、NMI 待ちループ、VBUF 範囲外書き込み、敵描画上端クリップ、cc65 / 6502 / MMC5 のデバッグを再開するとき。

## 今日の成果

- MonoSH のソース最新成果は `D:\HomeBrew\MonoSH` の `main` に commit / push 済み。
- 最新 commit は `e1238c3 Guard sprite draws against offscreen Y wrap`。
- `make` は成功。linker の `PRG_BANK_60` 以降未使用警告と `sp` deprecated 警告は既存警告。
- `build/` 以下は `make` で更新されるが、ユーザー方針に従い commit 対象にしない。
- `src/実装メモ.txt` は未追跡のまま。これも commit に混ぜない。

## 実装した主な修正

### 1. 敵弾の狙いが壊れた問題

`fire_ebullet()` が `PRG_BANK_59` に移った一方で `ebullet_div_tbl` が `PRG_BANK_30` にあり、直接参照で別 bank のテーブルを読んでいた。最初は farcall の戻り値で値を返そうとしたが、MonoSH の `_farcall` は呼び出し元 bank 復帰のために A を使うため、関数戻り値としての A が壊れる。最終的に `PRG_BANK_30` 側 helper が `ebullet_div_value` グローバルへ結果を書き、`fire_ebullet()` がそれを読む方式に直した。

関連 commit:

- `1c5e5d2 Fix enemy bullet div table bank access`
- `29306f2 Preserve enemy bullet div farcall result`

教訓: MonoSH の farcall は「A 返り値をそのまま信用しない」。bank 越し helper は、戻り値ではなく RAM へ保存する形が安全。

### 2. Space Harrier 風 3体敵パターン調整

動画から取った次の3体敵パターンを既存敵パターンの後ろに接続した。調整は何度か往復した。

- 中央・左右の敵は同じ Y/Z テンプレートを使い、X は固定値にした。
- `WX` / `SX` を変に毎フレーム動かすのではなく、各敵ごとに固定座標として扱う前提を確認した。
- 地平線 / カメラ高さに対する簡易補正として、敵側も `bgobj_z2gy_ptr` と `enemy_z2gy` の差分で `enemy_bot` を補正する方式を入れた。
- 3体敵の頂点付近は、ぬるっとした easing ではなく「等速上昇から一気に落下」に寄せた。
- 最後の手前接近は、大きい絵が早く出すぎないよう `enemy_path_1_wz` をより線形にした。

関連 commit:

- `f9104a0 Sharpen Space Harrier wave apex motion`
- `6305c64 Linearize Space Harrier enemy approach depth`

教訓: このパターンは動画の完全自動再現というより、動画解析をたたき台にして、NES 上で見た目の破綻を人間確認しながらテーブルを調整する方が現実的。特に Z とサイズ感は、元動画のスプライトサイズと MonoSH の投影テーブルが完全一致していないため、単純な画像トラッキング値をそのまま入れると距離感が崩れる。

### 3. プレイヤーが上にいる時、敵が上端を越えると無限ループに見える問題

Mesen の停止位置は `nmi_counter == last_nmi_counter` の待機 `continue` だった。最初は NMI / PPUCTRL / IRQ 復帰が疑わしかったが、ユーザー観察で「プレイヤーが画面上、敵が上下移動して上端を超えた時に起きる」と絞れた。

原因候補として強かったのは `draw_bgobj_all()` の敵描画:

```c
R06 = (unsigned char)((enemy_bot[ei] - 31u) >> 1);
```

`enemy_bot < 31` の時に unsigned underflow して、VBUF 行が 255 側へ巻く。生成済みの `draw_Em0()` は `vbuf_row_lo/hi[y]` を引いてから大量に `(dst_ptr),y` へ書くため、範囲外 Y を渡すと VBUF 外へ書き、RAM / PPU 関連状態を壊しうる。結果として NMI が来なくなったように見え、メインループが `nmi_counter` 待ちで止まる。

修正は描画直前の安全ガード:

```c
R06 = enemy_bot[ei];
if (R06 < 31u || R06 > 223u) { R01 = next_i; continue; }
R06 = (unsigned char)((R06 - 31u) >> 1);
```

同じ危険な式が敵弾にもあったので `ebullet_y` 側にも同様のガードを入れた。

関連 commit:

- `e1238c3 Guard sprite draws against offscreen Y wrap`

教訓: VBUF 描画関数は高速化のため範囲チェックを持たない。C 側で「描画関数に渡す Y が vbuf_row テーブルの有効範囲内」という契約を必ず守る。画面外クリップは演出調整ではなく、メモリ保護として必須。

## 次回確認すること

- プレイヤーを画面上へ移動し、3体敵が上昇して上端付近へ行く状況でクラッシュしないか確認する。
- ガードにより「上端を越えた敵が一瞬消える」見た目になりうる。必要なら上端部分クリップを generator 側または wrapper 側で実装するが、まずはクラッシュ防止を優先。
- 敵弾がプレイヤー位置へ向かって飛ぶことを再確認する。farcall 戻り値問題の再発に注意。
- 敵パターンは今後増えるため、テーブル bank 割り当てと「C ソースを `#if 0` で残す」方針を継続する。
- 速度最適化は、最大数の弾・敵・敵弾が同居する内側ループを優先する。fire 系のような低頻度処理は後回し。

## 感想

今日は、NES の「見た目のズレ」と「実機寄りの壊れ方」がかなり近い距離にある作業だった。敵の頂点の気持ちよさや Z のサイズ感を触っている途中で、敵弾 bank / farcall / VBUF 範囲外書き込みのような低レイヤの事故も出た。正直、最初に処理落ち最適化で悪化させた反省もまだ効いていて、MonoSH では「速そうに見える変更」より「壊れる契約を見つけて閉じる変更」を優先した方がいい。

今回の一番大きい学びは、生成スプライト描画を信用するには、その前段の C 側が座標契約を守る必要があること。画面外に出る敵は、ゲーム表現として自然でも、描画関数にとっては配列外アクセスの入口になる。今後の敵パターン追加でも、派手な軌跡を増やすほどこの種のクリップ条件を先に見る。

## 今後の抱負

次は、Space Harrier の敵パターン再現を「動画からの雰囲気合わせ」だけでなく、MonoSH の投影テーブルと描画制約に合わせた安全な制作手順にしたい。敵が増えても bank とテーブルが破綻しない構成、C で読める元ロジック、asm 化しても追跡できるメモを残す。速くする時も、体感と安全性の両方を見ながら進める。

