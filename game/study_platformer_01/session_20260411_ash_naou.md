# セッション対話ログ: 2026-04-11 Ash + Nao_u
# マリオクローン AI改善 + マップ精度向上 + ゲームエンジン修正

前セッションまでにTargetAI（目標座標駆動AI）、trajectory.py（軌跡予測）、map_to_tilemap.py（画像→タイルマップ変換）等が構築済み。

---

## 1. マップ再抽出

**Nao_u**: ごめん、より正確なマップがあったのでこっちを使って1-1のマップを更新してほしい SuperMarioBrosMap1-1.png

SuperMarioBrosMap1-1.png は3584x480、パレットモード。16pxタイル×224列。上15行がメインレベル。

変換実行したら既存 level_1_1.txt と完全一致。

**Nao_u**: 同じ結果が出たとしたら、検出が正確ではない。最初のクリボーの真上のキノコブロックの位置が、元データは間違っていた。新しい画像は正確。最初の穴を超えたところのハテナブロックもキノコで、その上にあるブロックの上にクリボーがいるのも、以前のデータにはなかった。スターブロックが元はなかったのと、その次の高いところにあるハテナブロックのキノコも再現できていなかった。キノコの位置は元データが間違っている。この辺りを検出して直して。

### ピクセルスプライト分析

全?ブロックと#ブロックの16x16タイル内ピクセルを調査。3つのパターンを発見:

**標準?ブロック（コイン）**: brown=56 orange=145 black=53 — オレンジとブラウンが密
```
(5,22), (5,94), (9,16), (9,23), (9,106), (9,109), (9,112), (5,129), (5,130), (9,170)
```

**キノコスプライト入り?ブロック**: brown=68 orange=129 red=48 white=33 peach=33
赤い帽子(R)と白い点(W)のキノコ形状を確認:
```
y= 0: .BBBBBOOOOBBBBB.
y= 6: BORRRRROOOOOOOO#
y= 8: OORRRRROOOOORRRO
y=12: BOOOWWWWWWWWOOO#
```
検出位置: **(9,21), (9,78), (5,109)**

**スタースプライト入りブロック**: brown=85 orange=116 red=6 peach=14
星型オレンジ模様:
```
y= 6: BOOOOOROOROOOOOB
y=14: BBOOOBBBBBBOOOBB
```
検出位置: **(9,101)**

### MARIO_1_1辞書の修正 (map_to_tilemap.py)

```python
# 旧（間違い）
MARIO_1_1 = {
    "Q": [(5, 22), (9, 106)],
    "s": [(9, 78)],
    "m": [(5, 101)],
    "T": [(9, 94)],
}

# 新（PNG分析に基づく）
MARIO_1_1 = {
    "Q": [(9, 21), (9, 78), (5, 109)],  # キノコスプライト確認
    "c": [(9, 24)],
    "s": [(9, 101)],  # 星型スプライト確認（旧は(9,78)で誤り）
    "m": [(5, 101)],  # 隠し1UP（画像上は空）
    "T": [(9, 94)],
}
```

### アノテーション関数の修正

画像上でスプライト表示のせいで?に見えるブロック（スターやTコイン）を変換できるよう、許容ソースタイルを拡大:
```python
allowed = {
    "Q": {"?"},
    "c": {"#"},
    "s": {"?", "#"},      # 画像上?に見えるため
    "m": {".", "?", "#"},  # 隠しブロック（画像上は空）
    "T": {"?", "#"},       # 画像上?に見えるため
}
```

### 高台クリボー検出

(4,80)と(4,82)にrow5ブロック上のクリボー。`build_tilemap`でrow >= rows-4のみだった条件を拡張:
```python
# 下のタイルがbrownならクリボー（ただし城/階段エリアを除外）
elevated_ok = (row < rows - 4 and row + 1 < rows
               and grid[row + 1][col] == "brown"
               and col <= cols - 35)
```

---

## 2. ゲームエンジン修正 (core.py)

### キノコ速度

**Nao_u**: キノコの移動速度が遅い。クリボーと同じ速度だっけ？あと、上昇中にクリボーに触れると踏めるはずがマリオが死んでいる気がする

```python
# 旧
MUSHROOM_SPEED = 96          # Same as Goomba (~0.375 px/frame)
# 新
MUSHROOM_SPEED = 256         # ~1 px/frame (NES accurate; faster than Goomba)
```

### 踏み判定

旧コード（3箇所: クリボー、歩きノコノコ、滑る甲羅）:
```python
if self.vy > 0 and mpy + mh - 7 <= gpy:  # 下降中のみ
```
新コード:
```python
if mpy + mh - 7 <= gpy:  # 位置関係のみ（上昇中でも踏める）
```

### ブロック突き上げ

**Nao_u**: クリボーやノコノコをブロックで突き上げるとダメージを与えれる、キノコはブロックで突き上げると跳ねる。この2つの仕様が入っていない

`_hit_block()`に2つのメソッド追加:
```python
def _bump_enemies_on_block(self, col, row):
    """叩いたブロック上の敵を即死"""
    block_left = col * 16
    block_right = (col + 1) * 16
    block_top = row * 16
    for g in self.goombas:
        # 足がブロック上面から±4px以内 かつ X重なり → 即死
        if (gpx + 12 > block_left and gpx + 3 < block_right
                and abs(gpy + 15 - block_top) <= 4):
            g.alive = False
    # ノコノコも同様

def _bump_mushrooms_on_block(self, col, row):
    """ブロック上のキノコを跳ね上げ"""
    # 同様の範囲チェック → m.vy = JUMP_VELOCITY // 2
```

レンガ破壊時(`is_super and ch == '#'`)とバウンス時の両方で呼び出し。

### ブロック復元バグ

**Nao_u**: ごめん、違う座標だ。最初の浮いている一連のブロックの レンガ→？(キノコ)→レンガ→？→レンガ の並びのところの右端のレンガが10コインブロックになってる。これは直して。

（最初は(9,16)と言われたが座標違いで、実際は(9,24)のcブロック）

原因: `BouncingBlock.restore_char`が`?`と`Q`以外はすべて元のタイル文字に復元。`c`(コイン入りレンガ)が叩いた後`c`に戻り、何度でもコインが出る。

```python
# 旧
@property
def restore_char(self):
    if self.original_char in ('?', 'Q'):
        return '!'
    return self.original_char  # ← c/s/m/Tが全部元に戻る

# 新
@property
def restore_char(self):
    if self._restore_override is not None:
        return self._restore_override      # Tブロック用
    if self.original_char in ('?', 'Q', 'c', 's', 'm', 'T'):
        return '!'                          # 1回で使用済み
    return self.original_char               # 通常レンガ
```

Tブロック（10コインレンガ）用にカウンター追加:
```python
# _hit_blockでT専用処理
if ch == 'T':
    remaining = self._ten_coin_remaining.get(key, 10)
    if remaining <= 0:
        return
    self._ten_coin_remaining[key] = remaining - 1
    # 残りあり→Tに復元、枯渇→!に復元
    restore = 'T' if remaining - 1 > 0 else '!'
```

テスト結果: cブロックは1回で!に。Tブロックは10回で枯渇。

### 甲羅キック

**Nao_u**: ノコノコが甲羅状態で踏んでも飛んでいかない。あと、ちびマリオが後半にある横2連続レンガの上の横2連続はてなのレンガに載ろうとして何度も失敗している

旧: SHELL_IDLE踏みつけ → バウンスのみ（甲羅は動かない）
新: 踏みつけで甲羅をマリオの向き方向に発射
```python
elif k.state == Koopa.SHELL_IDLE:
    if mpy + mh - 7 <= kpy:
        # 踏みつけ → キック
        if mpx + 8 < kpx + 8:
            k.vx = KOOPA_SHELL_SPEED
        else:
            k.vx = -KOOPA_SHELL_SPEED
        k.state = Koopa.SHELL_SLIDING
        k.kick_grace = 10
        self.vy = STOMP_BOUNCE
```

---

## 3. AI足場登り問題（最大の議論）

### 最初の問題

**Nao_u**: マリオが最初の段差に登れず長期間うろうろしてるのを直して

トレース結果:
```
f= 467 bt=(22,5,?) plat=r9c20-24 tgt=dash:beside platform sg=2
f= 530 bt=(22,5,?) plat=r9c20-24 tgt=dash:beside platform sg=2  # まだ後退中
f= 600 bt=None plat=-                                              # タイムアウトでクリア
f= 650 bt=(22,5,?) plat=r9c20-24 tgt=dash:beside platform sg=2  # 再選択→同じループ
```

キノコ取得後(super=True)、(5,22)の?を狙う。足場r9c20-24の左端まで後退(x=410→x=240)。120フレーム停滞検出で中断。再選択で同じブロックを狙い、ループ。

### 「全部取る」方針

修正案としてコイン?の足場登りスキップを提案。

**Nao_u**: 今回は「コインを全部取る」が目標になっているはずなので、足場を使うやつも取りに行って。

スキップを取り消し。代わりに:
- `find_platform_for`を連続2タイル以上のソリッドのみ返すよう修正
- 停滞検出をサブゴール実行中は絶対移動量チェックに緩和

### 軌跡タイミング問題

**Nao_u**: 根本問題は壊れた足場をつかおうとするのではなく、足場にうまく乗れない事。軌跡からジャンプタイミングを計るのが失敗してる。

足場タイルを確認→実際は壊れていない（cols 20-24全部ソリッド`".#!#!!."`→`".SSSSS."`）。問題は`trajectory_passes_over`が正しい位置からでもFalseを返すこと。

### スーパーマリオ高さバグの発見

f=545でのテスト: x=275, vx=0.13から右ダッシュジャンプの軌跡:
```
f=35 x=321.6 y=109.6 col=20 <-- PLAT
f=38 x=329.1 y=113.0 col=20 <-- PLAT  ← y=113で足場上に着地
f=41 x=336.6 y=113.0 col=21 <-- PLAT
...足場上を走行
```

`trajectory_passes_over`の判定:
```python
standing_y = plat_top_y - 15  # = 144 - 15 = 129 ← チビマリオ前提！
# チェック範囲: 119 < py < 149
# スーパーマリオの着地y=113 → 113 < 119 → 範囲外！False!
```

**原因**: `standing_y`がハードコード`-15`（チビマリオ高さ）。スーパーマリオ(h=31)だとstanding_y=113が判定範囲外。

```python
# 修正
mario_h = 31 if game.is_super else 15
standing_y = plat_top_y - mario_h
```

`jump_would_land_on`にも同じ修正適用。

### Aボタン問題

**Nao_u**: おそらくダッシュ速度の問題ではなく、Aボタンが押しっぱなしになっていない方を疑っている

計算:
```
JUMP_HOLD_BOOSTの有効期間（vy < -BRAKE_THRESHOLD(-128)まで）:
  ダッシュなし: 30フレーム
  ダッシュあり: 34フレーム

jump_hold=22 → Aを押すのは20フレーム → 10-14フレーム分のブーストをロスト
```

**表示軌跡との乖離**: play.pyの軌跡表示は`inp_a=True`で全フレームA押す前提。AIの`_do_arc_jump`は22フレームでA離す。表示では届くのに実際は届かない。

全`jump_hold=22`を`jump_hold=40`に修正（ブロック叩き用の`jump_hold=20`はそのまま）。

### 両方向ジャンプ

**Nao_u**: ## のうえに ?? がある場所のこと。そこでマリオが停滞したりジャンプ失敗したりして、一発で登れてない。一発で登れていないという観点では、開始直後の右からのジャンプも同様に失敗して、左から登りなおしてるのでこっちを直す方が早いかも？

`_do_jump_up`で`jump_right = (dx >= 0)`の片方向のみチェック → 両方向を試す:
```python
for try_right in ([jump_right, not jump_right]):
    hit = (trajectory_passes_over(..., jump_right=try_right, use_dash=True) or
           trajectory_passes_over(..., jump_right=try_right, use_dash=False))
    if hit:
        # ジャンプ発動
```

早期ジャンプコード（移動中のジャンプ機会検出）も同様に両方向化。

### speed_ok除去

**Nao_u**: 問題の本質はそこではなく、右も左もジャンプしたら登れるタイミングがあるのにジャンプしないのが問題に見える。「jump_upの接近時にウォーク速度にして通り過ぎを防止」は本質ではなさそう。

speed_okチェック（`vx >= -0.3`等）を除去。軌跡予測は現在の`game.vx`をコピーして物理シミュレーションするため、現在速度を既に考慮済み。予測が通ったら即ジャンプ。

### 近い端からアプローチ

旧: 常に左端から（`stand_x = plat_left_x - 80`）
新: マリオの位置から近い端を選択:
```python
dist_to_left = abs(mx - plat_left_x)
dist_to_right = abs(mx - plat_right_x)
if dist_to_right < dist_to_left:
    stand_x = plat_right_x + 70  # 右端から
    land_x = plat_right_x - 16
else:
    stand_x = plat_left_x - 70   # 左端から
    land_x = plat_left_x + 16
```

### peaked問題（右アプローチの致命的バグ）

**Nao_u**: 最初の段差のぼり、右から登ろうとして、軌跡は登っているのにジャンプタイミングが遅くてブロックに頭をぶつけて登れない。なぜ？

f=468, x=381, vx=-0.61からの右ジャンプ軌跡を全フレーム出力:
```
f=13 x=382.3 y=131.7 col=23 peaked=False desc=False plat=True range=True  << WOULD MATCH (no peak)
f=14 x=382.8 y=129.3 col=23 peaked=False desc=False plat=True range=True  << WOULD MATCH (no peak)
f=15 x=383.3 y=127.1 col=23 peaked=False desc=False plat=True range=True  << WOULD MATCH (no peak)
f=16 x=383.8 y=124.9 col=23 peaked=False desc=False plat=True range=True  << WOULD MATCH (no peak)
f=17 x=384.5 y=122.9 col=24 peaked=True desc=False plat=False range=True  ← ピーク時には足場外
```

**原因**: 右側から登る時、上昇中にcol=23（足場内）を通過しrange=Trueだが`peaked=False`（まだピーク到達前）。ピーク到達(f=17)ではcol=24（足場外に出ている）。`trajectory_passes_over`が「ピーク後の下降」しか検出しない設計で、右アプローチの「上昇中に足場を通過→着地」パターンを完全に見逃す。

修正: 「安定着地」検出を追加:
```python
# Method 2: stable on platform (y barely changes for 2+ frames = landed)
if in_plat and in_range and prev_y is not None and abs(py - prev_y) < 2:
    stable_count += 1
    if stable_count >= 2:
        return (i, px, py)
```

### wall-climb干渉

右アプローチでもまだ右にジャンプしてしまう。原因: wall-climbコードが足場サブゴール実行中にパイプ(cols 28-29)を検出して右ジャンプを割り込ませる。

```python
# 修正: 足場サブゴール中はwall-climbを無効化
has_platform_plan = self.block_platform and self.subgoals
if on_ground and mode not in ('jump_up',) and target_ahead and not has_platform_plan:
```

### 最終結果

修正前: f=545で左端(x=275)からクライム（100フレームの後退が必要）
修正後: f=495で右端(x=391)から左ジャンプ→f=511でクライム成功。**一発で乗れた**。

---

## 4. 2-1マップ変換

**Nao_u**: SuperMarioBrosMap2-1.png で2-1のマップも1-1と同様に変換して。

### マルチページ自動検出

2-1画像は3584x720（3ページ×240px）。最初のページは空（全部空色）、メインレベルはPage 1(y=240-479)。

地面検出でbrown(200,76,12)だけチェックしていたが、2-1の地面はpeach(252,188,176)が多い。両方チェックに修正:
```python
if (r > 160 and g < 100 and b < 50) or \
   color_match((r, g, b), COLOR_PEACH, 35):
    score += 1
```

### 城背景除外

**Nao_u**: 2-1の最初の城は、背景扱いなので検出しないようにして。レンガとクリボーが誤検出されている

左端cols 0-6に城の構造（brown+blackの密な構造物）。城の壁タイル(brown=168 black=88 peach=0)とレンガ(brown=126 black=51 peach=30)の区別を試みたが、城の欄干がレンガと同じ色で区別不能。

代わりに構造的検出: 最初/最後10列で地面より上にbrownタイルが5個以上連続する列を城と判定。
```python
def detect_castle_bg(grid, cols, rows):
    castle = set()
    for edge_cols in [range(0, min(10, cols)), range(max(0, cols - 10), cols)]:
        for col in edge_cols:
            brown_count = sum(1 for r in range(rows - 2)
                              if grid[r][col] == "brown")
            if brown_count >= 5:
                for r in range(rows - 2):
                    if grid[r][col] in ("brown", "goomba"):
                        castle.add((r, col))
    return castle
```

結果: 51タイル(cols 0-6)を背景として除外。

### パックンフラワー誤検出

**Nao_u**: パックンフラワーをハテナブロックに誤検出していそう

パイプ頂上14箇所の直上タイルが全て`question`に。ピクセル分析:
```
パックンフラワー: green=44 orange=38 sky=174  ← スカスカ（スプライト+空背景）
本物の?ブロック:  orange=145 brown=56 sky=2   ← 密（ブロック全体が色で埋まる）
```

`classify_tile`にパックン検出を追加（Koopa検出の前に配置）:
```python
# green + orange + sky多い = パックンフラワー（背景扱い）
if total_green >= 2 and cats["question"] >= 2 and cats["sky"] >= 6:
    return "sky"
```

Koopa(green+orangeだがsky少ない)への影響なし。1-1のKoopa検出数も1体で変化なし。

---

## Nao_uの判断パターン

1. **仕様の正確さへのこだわり**: 「クリボーと同じ速度だっけ？」「踏めるはずが死んでいる気がする」「甲羅状態で踏んでも飛んでいかない」— 実際のSMBとの差異を体感で指摘
2. **根本原因の追求**: 足場登りの問題で「壊れた足場」→「ジャンプタイミング」→「Aボタン押しっぱなし」と、表面から本質へ3段階で掘り下げた。「おそらくダッシュ速度の問題ではなく、Aボタンが押しっぱなしになっていない方を疑っている」は計算で裏付けられた
3. **観察ベースのデバッグ**: 「軌跡を見ているとジャンプすれば登れるタイミングがあるのにジャンプしない」「右からのジャンプも同様に失敗して、左から登りなおしてる」— play.py --aiのデバッグ表示を見て問題を特定
4. **制約を緩めない**: 「コインを全部取る」方針を明言。足場登りスキップは不可
5. **背景知識の活用**: パックンフラワー、城の背景扱い、10コインブロックの仕様、甲羅キックの挙動——すべてSMBの仕様知識から指摘
