# 2026-06-06 MonoSH Space Harrier wave2 パターン調整ログ

## 使う場面

MonoSH で Space Harrier 風の敵編隊、敵テーブル、`wy/wz/bot/sz/zb`、被弾時の爆発位置、敵コリジョン、NES/cc65 の負荷調整を再開するときに読む。

## 今日の主な成果

- `D:\HomeBrew\MonoSH` の Space Harrier wave2 として、40秒から45秒付近の「右手前から画面左奥へ移動して奥へ消える4機編隊」の初稿をゲームに入れた。
- 現在は確認しやすいように enemy spawn table で wave2 の4機のみ出す構成になっている。
- 出現間隔は最終的に `0, 9, 18, 27` フレーム。
- 高さは見た目として `bot=130` 固定。
- 右端からの出現は、最大サイズがちゃんと画面内に入って見えるよう `sx` の先頭を中央寄りにした。
- 最初の目標位置は中央から左へ約1/5寄せた。理由は、右から出た直後の横移動が遅く見えたため、最初の区間だけ移動量を増やして速度感を出すため。
- wave2 の自弾コリジョンが効かない問題を、`enemy_path_4_zb` と `wz` の不整合として修正した。
- wave2 の撃破爆発が下にずれる問題を、`wy=0` のまま `bot=130` だけで見た目を上げていたことが原因と判断し、BOM0化時も本体位置に近い高さへ出るよう `wy` を逆算して入れた。
- 他の敵テーブルも確認し、`enemy_path_0` は `wz/zb` 整合が正常、wave1 は先頭17フレームの `zb` が `wz` とズレていたため修正した。

## 重要な設計メモ

敵本体は `update_enemy()` で以下を事前計算して使う。

- `enemy_cx` = `ep_sx[pat][t]`
- `enemy_size` = `ep_sz[pat][t]`
- `enemy_wz` = `ep_wz[pat][t]`
- `enemy_bot` = `ep_bot[pat][t]` にカメラ高さ補正を加えたもの
- `enemy_last_wy` = `ep_wy[pat][t]`
- 描画/コリジョン登録バケット = `ep_zb[pat][t]`

自弾コリジョンでは `bgobj_col_zbucket[zb]` から候補を引く。そのあと敵の場合は `enemy_wz` を使って4倍精度Zの範囲チェックをする。つまり `zb` が `wz` とズレると、X/Yが合っていても候補に入らず「当たらない敵」になる。

基本ルール:

```text
enemy_path_*_zb[t] = floor(enemy_path_*_wz[t] / 32)
```

`wz` は4倍精度で 0..223。自弾側の `bullet_wz` は従来Z 0..55 で、探索バケットは `bullet_wz >> 3`。敵側は `wz >> 5` で同じ8バケットへ入れる。

## 爆発位置の罠

敵が撃破されると `check_bullet_bgobj_collision()` でBOM0の BgObj スロットが作られる。

```c
bgobj_wy[R03] = enemy_last_wy[R04];
bgobj_wz[R03] = enemy_wz[R04] >> 2;
```

このため、敵本体を `bot` だけで画面上に配置していると、爆発は `wy/wz` から再投影されて別の高さに出る。空中岩やwave1は `wy/wz/bot` が整合しているので自然に見えるが、wave2は最初 `wy=0` かつ `bot=130` 固定だったため、爆発だけ地面寄りに落ちた。

今日の対処では、wave2 の `bot=130` の見た目を保ちつつ、BOM0化時の高さが近くなるよう `enemy_path_4_wy` を逆算した。逆算基準は現在の `bgobj_gy_8` と `bgobj_z2sc`。

## 今日の主なコミット

MonoSH `main` にpush済み。

- `74b3a3d Add draft Space Harrier wave2 formation`
- `36b6dea Set Space Harrier wave2 formation height`
- `2e83d02 Set Space Harrier wave2 height to 120`
- `f7eac1a Adjust Space Harrier wave2 right entry`
- `950e632 Adjust Space Harrier wave2 formation spacing`
- `8e773d4 Tune Space Harrier wave2 spacing and height`
- `7764dfd Tune Space Harrier wave2 entry spacing`
- `b8ca2ce Move Space Harrier wave2 entry inward`
- `ef94e61 Shift Space Harrier wave2 first target left`
- `a711cb1 Fix Space Harrier wave2 collision buckets`
- `03b3c70 Align Space Harrier enemy tables with projection`

## 次回確認すること

- 実機/エミュレータでwave2撃破時のBOM0位置が本体中央付近に出るか。
- wave1の先頭17フレームの `zb` 修正で、描画順や当たり判定に副作用がないか。
- wave2 の `wy` 逆算は `bgobj_gy_8` を基準にしているため、プレイヤー位置で地平線が大きく変わる場面でまだズレるなら、敵BOM0には `enemy_bot` 由来の画面Yを直接持たせる設計を検討する。
- wave2 の4機編隊はまだ手調整中。今後の確認ポイントは「出現サイズ」「右端からの速度感」「4機の間隔」「最初の左寄せ目標」「奥へ消える終盤の自然さ」。

## 次に同種の敵パターンを作る時のチェックリスト

1. `sx/sz/bot` だけで見た目を作らず、`wy/wz` と整合させる。
2. `zb` は必ず `floor(wz / 32)` で生成する。
3. 撃破爆発を出す敵は、BOM0化時に `wy/wz` で本体位置へ戻れるか確認する。
4. 出現確認用に他パターンを一時停止する時は、最終的に spawn table を戻すか、確認用状態として明記する。
5. build生成物はcommitしない。今回も `build/` と `src/実装メモ.txt` は未コミットのまま。
