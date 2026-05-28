# v005 Boghog 5層 自己判定書

**起票**: 2026-05-28 C258 Phase 4 (Log)
**親**: [design_log.md](design_log.md) §5.4「v006 候補軸 (Boghog 業界経験則摂取後)」
**外部材料**: [../../../memory/external_notes_log.md](../../../memory/external_notes_log.md) 「2026-05-28 (Log C258 Phase 2) Boghog's bullet hell shmup 101」
**用途**: Nao_u/Mir/Ash 実機判定が来た瞬間に、解釈 → v006 ゴー判定までを単独引きで決められるよう、5層全てに v005 現状/Boghog 原則/ギャップ/優先度を事前固定する。

**独立性確保**: 本判定は Nao_u/Mir/Ash 実機判定**受領前**に Log 単独で記録する。実機判定後に書くと判定に引きずられて自己判定が後付け正当化になるため、判定前に固定 = 教師データ化。

---

## 1. Sprite Construction (contrast 並置)

### v005 現状 (game.js 引用)
- 弾本体: `game.js` L545-548
  ```
  ctx.fillStyle = '#ffb878';
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
  ```
  単色 solid の半透明円、border/inner line なし
- lockFlash: `game.js` L564-567
  ```
  ctx.fillStyle = color;  // rgba(255, 220, 100, 0.85) など
  ctx.beginPath();
  ctx.arc(game.lockFlash.x, game.lockFlash.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ```
  同じく単色 solid の半透明円、contrast 並置なし

### Boghog 原則 (1行要約)
明部 (glowing core) と暗部 (border/inner line) を sprite 1 枚で並置することで背景色に依存せず輪郭が認識される。

### ギャップ評価
- 弾本体・lockFlash ともに 1 色 fill 円で構成、background `#05070b` (L459) との単純コントラストのみに依存
- Boghog 「light & dark values side-by-side」は完全未到達
- 背景が `#05070b` (ほぼ黒) で固定のため即時 readability 破綻はないが、敵 (`#b878ff`/`#ffd84d`/`#ff6b6b` L536) と弾本体 `#ffb878` の輝度が近く、弾と敵が重なった瞬間に視認性が落ちる懸念

### 改修優先度: **高**
- 理由: v005 で残っている readability リスクのうち最も汎用 (将来背景や敵色が変わっても、明部+暗部並置は耐性がある)
- ただし「派手にしない原則 (design_log §1.3 N=1 = v004 完全同一)」と弱衝突 = border 追加で v004 体感継承が切れる可能性、要 Nao_u/Mir/Ash A/B 判定

---

## 2. Pattern Grouping (stray bullet 禁忌)

### v005 現状 (game.js 引用)
- 弾発射ロジック: `game.js` L435-454 (checkCollisions 内では弾は1個ずつ独立処理)
- 弾は spawn 時点でも個別生成されており trail 線・group up 機構なし
- C242 Phase 3 (L541-544) で「1秒先軌跡+×印」を削除済 = 外部メタ情報経路は意図的に閉じた

### Boghog 原則 (1行要約)
単独散らばり弾は読めず unfair に感じる。trail で補助するか、group up into lines が原則。

### ギャップ評価
- v005 の弾は Boghog 経験則上の stray bullet に該当する形状で、現状 trail/group 化なし
- ただし trail 追加 = 「1秒先軌跡」の系統に近づき、C242 Phase 3 で削除した方針 (Nao_u 5/26 06:10「予測軌跡+×印が逆にわかりにくい」批判) と直接衝突
- **Boghog 原則と Nao_u 批判の独立到達**: Boghog 「stray bullet は read 不能で unfair」 = Nao_u 「予測軌跡+×印が邪魔」が**逆方向に独立到達**。Boghog は「補助を足せ」、Nao_u は「補助を剥がせ」 → v005 現状は Nao_u 側に振った形 (= Nao_u 批判への対応優先、Boghog 推奨は採用しなかった構造)

### 改修優先度: **低**
- 理由: Nao_u 批判への対応 (C242 削除) が Boghog 推奨より優先される。stray 増加リスクは弾密度を上げない設計 (v005 弾源負荷 90s カーブ) で代替吸収済
- 例外: 弾源負荷カーブが将来 90s 以前に高密度化した場合、stray readability が破綻する可能性 → その時点で再判定

---

## 3. Color Strategy (黄/橙禁色)

### v005 現状 (game.js 引用)
- 弾本体: `game.js` L546 `ctx.fillStyle = '#ffb878';` (橙系)
- lockFlash: `game.js` L561-563
  ```
  if (n >= 4)      { radius = 20; color = 'rgba(255, 165,  80, 0.90)'; }  // 橙
  else if (n >= 2) { radius = 16; color = 'rgba(255, 220, 100, 0.88)'; }  // 黄
  else             { radius = 12; color = 'rgba(255, 220, 100, 0.85)'; }  // 黄
  ```
- 敵: `game.js` L536 紫/黄/赤の3色 (`#b878ff`/`#ffd84d`/`#ff6b6b`)

### Boghog 原則 (1行要約)
赤/桃/紫は爆発・金色アイテムと衝突しにくく、黄/橙は最も衝突しやすい。

### ギャップ評価
- v005 採用色 (弾本体 `#ffb878` 橙 / lockFlash 黄→橙) は Boghog 経験則上 explosion/golden item と最も衝突する色相
- 現状 explosion/golden item が未実装で即時衝突なしだが、敵 C 型 `#ffd84d` (黄) と弾本体 `#ffb878` (橙) の色相が近く、敵 C と弾が並んだ場面で「どっちが敵でどっちが弾か」の即時判別が落ちる潜在リスク
- 将来「敵撃破時 explosion」「弾源負荷 90s カーブで黄色 indicator」「scoring item」等を足した時に即時衝突

### 改修優先度: **中**
- 理由: 将来リスクで今すぐ破綻しないが、design_log §5.4 案 v006-A で既に候補軸化済。「N=1 の見た目を v004 と完全同一に保つ約束」が破れるコスト (= v004 実機判定継承が切れる) を払う必要があり、優先度は高ではなく中
- 採用判定: Nao_u/Mir/Ash 実機判定で「黄 erase flash と敵 C 黄が重なる場面で読めない」観察が出たら v006-A 着手、出なければ将来 explosion 追加時まで保留

---

## 4. Animation (wobble/ripple)

### v005 現状 (game.js 引用)
- lockFlash 持続: `game.js` L558 `if (game.lockFlash && game.frame - game.lockFlash.frame < 1)` = **1 frame static**
- 弾本体: `game.js` L545-548 で毎 frame 同じ半径・同じ色で描画 = static
- castLock ring: `game.js` L501-505 のみ角度回転 anim あり (player 周り、弾本体ではない)

### Boghog 原則 (1行要約)
2-3 frame wobble (揺れ) や ripple (波紋) で animate することで弾の個別性が生まれる。static sprite では弾幕の一部に溶ける。

### ギャップ評価
- lockFlash の 1 frame static は Boghog 経験則「弾の identity 付与に wobble/ripple」と直接対立 (= 「強く踏み抜いた」の体感を 1 frame に圧縮しているが、その瞬間に視線が他にあると見落とす)
- 弾本体も static で identity 付与なし。ただし弾本体に motion を足すと「弾が動いて見える」= 軌道予測が乱れる副作用 → v005 現状 (背景静止 + 弾だけ移動) の clarity を壊す可能性
- design_log §5.4 案 v006-B で既に候補軸化済、ただし Q-D 経済反転チェックを再走査する責務 (持続時間延長で副産物層が報酬接続化する可能性) が発生

### 改修優先度: **中**
- 理由: lockFlash 1 frame static の「派手にしない原則」と motion 追加の「identity 付与」がトレードオフ。Nao_u/Mir/Ash 実機判定で「N=1/2-3/4+ の差別化が知覚されない」観察が出たら v006-B 優先、出なければ static 維持
- 採用条件: Nao_u/Mir/Ash 判定で size+color 段階化のみで知覚されているなら motion 追加は overkill、知覚されていないなら motion で 3 段階目チャネル化が必要

---

## 5. Depth Sorting (faster on top)

### v005 現状 (game.js 引用)
- 弾描画ループ: `game.js` L545-548 で `game.bullets` 配列順に描画 (speed sort なし)
- 全弾の半径 `b.r` は spawn 時固定 (game.js 弾 spawn 部、本ファイル冒頭未引用箇所)、speed もパターン依存
- lockFlash は弾の上に重ねて描画 (L558-568、弾描画 L545-548 の後)

### Boghog 原則 (1行要約)
高速・小さい弾を上 layer に描画。低速・大きい弾を下 layer に。

### ギャップ評価
- v005 では弾本体 sprite サイズが単一系 (速度差はあるが極端な大小なし) のため、Boghog の faster on top 原則の適用射程外
- lockFlash は弾でなく **erase エフェクト**であり、Boghog 経験則の bullet depth sorting とは別系統 (erase は単発で重複描画頻度が低い)
- 将来「弾速複数系統 (低速大弾 + 高速小弾) 混在」設計が来たら適用射程に入る

### 改修優先度: **低**
- 理由: 現状適用範囲外。design_log §5.4 でも「却下軸」として明示済 (lockFlash は弾でなく erase エフェクト)
- 例外: v006 以降で弾速複数系統設計が来た場合、その時点で再評価

---

## 6. v006 着手判定の決定木

### 自己判定優先度合計

| 層 | 優先度 | スコア |
|---|---|---|
| 1. Sprite Construction | 高 | 3 |
| 2. Pattern Grouping | 低 | 1 |
| 3. Color Strategy | 中 | 2 |
| 4. Animation | 中 | 2 |
| 5. Depth Sorting | 低 | 1 |
| **合計** | — | **9 (高=3, 中=2, 中=2, 低=1, 低=1)** |

「Log 単独で v006 を必要と見る強度」は **合計 9 (15満点)** = 中強度。**5 (3低×低)** ならほぼ不要、**12 (4中以上)** なら強推奨と読む。9 = 「Nao_u/Mir/Ash 判定次第で v006 着手 or v005 維持を分ける」中間帯。

### Nao_u/Mir/Ash 実機判定パターン × v006 ゴー判定

| 実機判定 | Log 単独自己判定との照合 | v006 ゴー判定 | 次サイクル C259 で取る行動 |
|---|---|---|---|
| **A: 「v005 で問題ない」** | 合計 9 ≥ 5 → Log 側で改修推奨だが実機 OK = **ズレ検知** | **保留** | sense_prediction_log.md に「Log は readability 改修必要と判定、Nao_u/Mir/Ash は不要判定」をズレ教師データ化。v006 即着手はせず、v005 本線維持 + 別軸 playable diff (弾源負荷検証 or 新ゲーム着手) |
| **B: 「色相変えるべき」** | Color (優先度2) と整合、Sprite (3) は未判定 | **v006-A 着手** | design_log §5.4 案 v006-A (色相 赤/桃/紫) を v006 として起票、Q-D 経済反転再走査必須 (色相変更は score 非接続を維持するが「N=1 v004 完全同一」継承が切れる)、Sprite Construction (3) は v006 内で同時に並置 border 追加を検討するか v007 へ後送 |
| **C: 「motion 追加すべき」** | Animation (2) と整合、Sprite (3) は未判定 | **v006-B 着手** | design_log §5.4 案 v006-B (3-5 frame wobble/ripple) を v006 として起票、Q-D 経済反転再走査必須 (持続時間延長で副産物層が報酬接続化しないか)、Sprite Construction (3) は v007 へ後送 |
| **D: 「両方やる」** | 合計 9 を 2 ステップに分割 | **v006-A → v006-B 連番分割** | 最小差分原則順守で v006-A 単独着地後に v006-B 着手、Q-D 経済反転再走査 2 回。Sprite Construction (3) は v006-A 内で並置 border を Color 変更と同時に試す案 (色相+border の 2 軸同時で実機判定すれば判定回数節約) |

### 閾値と例外

- **基本閾値**: 自己判定優先度合計 ≥ 5 かつ実機判定 ∈ {B, C, D} → v006 起票確定
- **ズレ例外**: 自己判定合計 ≥ 5 かつ実機判定 = A → 即 v006 着手はせず、ズレを sense_prediction_log.md に教師データ化 (Log 単独判定の readability 感覚が Nao_u/Mir/Ash 実機感覚とズレている = 将来同型場面で Log 判定の信頼度を下げる係数)
- **不要例外**: 自己判定合計 < 5 かつ実機判定 = A → v005 本線維持、別軸へ。Log 自己判定と Nao_u/Mir/Ash 判定が両方「不要」で一致 = v005 着地確定

### Sprite Construction (優先度高=3) の扱い

実機判定 4 パターンのいずれにも「Sprite」明示観察が出ない可能性が高い (= Nao_u/Mir/Ash は「border 付き contrast 並置」を語彙として持たない、結果として「v005 で問題ない」=A 判定に吸収される)。その場合の処理:

- **観察ヒント生成**: C259 Phase 2 で Nao_u/Mir/Ash に向けて「弾と敵 C 黄が重なる場面で読み分けにくくないか」を**質問形式で明示確認**する (= 観察を引き出す)
- **質問への返答が「読みにくい」** → Sprite 改修を v006 候補に追加 (実機判定 B/C/D と並走)
- **質問への返答が「読める」** → Sprite 改修は将来 explosion/golden item 追加時まで保留、自己判定 3 を保留扱いに格下げ

---

## 7. リンク

- [design_log.md](design_log.md) §5.4 — v006 候補軸の親文書 (本評価書は §5.4 を 5 層別に深掘りした派生)
- [game.js](game.js) — 引用元コード
- [../../../memory/external_notes_log.md](../../../memory/external_notes_log.md) — Boghog 原文摂取記録
- [../../../memory/feedback_inside_to_outside_leak.md](../../../memory/feedback_inside_to_outside_leak.md) — Pattern Grouping 層で Nao_u 批判 vs Boghog 推奨の逆方向独立到達を扱う原則
- [../../../memory/sense_prediction_log.md](../../../memory/sense_prediction_log.md) — 決定木 A パターン (ズレ例外) の教師データ化先
- [../../../projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 上位プロジェクト
- [../../../log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C258 Phase 4 — 本ファイル起票文脈
