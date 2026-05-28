# log_autonomous_game v005 — design_log.md (連続 erase 視覚段階化)

**起票**: 2026-05-28 C256 Phase 4 (Log)
**親**: [v004/design_log.md](../v004/design_log.md) §5「次サイクル C254 以降の候補手順」§2「HP system or 連続 erase パワーアップ」
**前 version**: [v004/design_log.md](../v004/design_log.md) (案 A 雛形 = 弾消し報酬 1 frame 黄 12px 固定)
**用途**: v004 案 A の自然延長。同一 castLock 内で連続して弾を消した時のサブリミナル段階化を追加 (score 非接続を維持して経済反転リスク低を継続)。

---

## 0. v004 自然延長としての位置づけ

v004/design_log.md §5「次サイクル C254 以降の候補手順 §2」で明文化された候補:

> HP system or 連続 erase パワーアップ: 案 A を score 非接続のまま「連続 erase で flash が大きくなる/色が変わる」のみで段階表現する案。score を介さない経済反転耐性の延長

本 v005 は **「連続 erase で flash が大きくなる/色が変わる」だけを最小実装** する。HP system は導入しない (= v004 「案 A は score 非接続のため意味希薄」と同じ理由で、HP 導入は score 軸を間接的に作る = Q-D 経済反転判定を再走査する責務が発生するため、v005 では切り離す)。

### 採用優先度根拠 (= 着手ゲート充足の物理的根拠)

- **v004 self_judgment**: 5/26 06:10 Nao_u 「展開がなく繰り返し」批判への構造的応答が v004 では design 中心、playable 展開未追加で残課題化 (staging Phase 2 §2-4 自己照合表で「未解消」と明記)
- **「揃えるための 1 手」**: v005 で「連続 erase = 体感差別化の 1 手」を物理化することで、v004 で残った「展開なし反復」の小プロトタイプを 1 段進める
- **Generator commit 系統補正**: C254-C256 で `game:` commit ゼロ予定 (= rule: 偏重)、本 v005 で `game:` commit 1 本を出すことで commit 系統を Generator 側に寄せる ([feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) 順守)

---

## 1. v005 機構仕様 (最小差分: v004 game.js から +10〜15 行)

### 1.1 game.js 変更点

#### (a) `game.lockFlash` に `count` フィールド追加
- 既存: `{ x, y, frame }` (v004)
- 改修: `{ x, y, frame, count }` (v005、count = `game.echo.bulletsErased` の現在値)
- `game.echo.bulletsErased` は v004 から既に echo 単位カウンタとして実装済 = 新フィールド導入なし、参照を1箇所追加するだけ

#### (b) 描画ループの lockFlash 分岐で 3 段階分岐
```
N=1       → 黄 (rgba(255, 220, 100, 0.85)), 半径 12px = v004 既定値完全維持
N=2-3     → 黄 (rgba(255, 220, 100, 0.88)), 半径 16px
N=4+      → 橙 (rgba(255, 165,  80, 0.90)), 半径 20px
```

#### (c) logEvent('bullet_erased', ...) に count 追加
- 既存: `{ x, y }` (v004)
- 改修: `{ x, y, count }` (v005、LLM プレイヤー側教師資料として連続度を保存)

#### (d) trace meta game フィールド + window expose 名のみ v004 → v005 変更
- meta: `'log_autonomous_game/v004'` → `'log_autonomous_game/v005'`
- window: `__logAutonomousV004` → `__logAutonomousV005`

### 1.2 追加行数

- 機構コードのみで +10〜13 行 (lockFlash 段階化の if 分岐 7-8 行 + count 埋め込み 1 行 + logEvent 引数 1 行 + コメント 2-3 行、空行除く)。staging 上限 25 行を遵守

### 1.3 v004 機構との非破壊接続

- castLock 発動条件 (trail >= ECHO_FRAMES) = 変更なし
- resolveLock 判定 (echo.hit の有無) = 変更なし
- 弾 erase 機構 (`b.alive = false`, `echo.bulletsErased += 1`) = 変更なし
- 1 frame flash 持続 = 変更なし (描画は 1 frame に閉じる、複数 frame 残光化はしない)
- 敵本体接触 = 変更なし (castLock 中でも GAMEOVER 遷移)
- N=1 の見た目 = v004 と完全同一 (= 「v004 を遊んだ Nao_u/Mir/Ash 視点で N=1 の体感が変化していない」 = v004 実機判定の継承可能性を最大化)

---

## 2. Q-D 再判定 (v005 連続段階化追加版)

§2 brainstorm 時点 (v004 design_log §2) で確定した「案 A 経済反転リスク低」を、v005 段階化追加を前提に再判定:

- **緊張の発生源**: 両方バランス維持。castLock 発動 = 自発 / 消去対象 = 外発 / **段階化 size/color は外発依存量 (連続 erase 数) の物理表現** = 外発が無いと段階化も発火しない (verify.js --bullet-density-zero で全方針 bulletsErased=0 = 段階化発火ゼロを継承確認)
- **(自発要素の位置)**: コア機構入口 + 副産物層は依然 score/gauge/lockResults 非接続 = 報酬経路は visual feedback の段階表現に圧縮されたまま。Every Extend Extra (4 分岐 d) 方向への drift なし
- **30秒で死ぬ要素**: あり継続 (敵本体接触 + 弾源負荷 90s カーブ)。段階化追加は描画 size/color のみで game ロジックを変えないため死ねる条件は v004 と同一
- **経済反転チェック**: ゲージ蓄積源は依然なし。`bulletsErased` は引き続き観測カウンタのみで報酬経路を作らない。**段階化 flash は「視覚チャネル拡張」であって「報酬量増加」ではない** = 「敵を倒さない方が得」の構造的成立条件は v004 と同様に無し。verify.js `--bullet-density-zero` で物理的に再確認
- **美しいプレイ**: 「敵弾の動きを見て 1 秒先到達地点を予測し castLock で弾幕を踏み抜ける」維持。段階化追加で「**踏み抜けた弾数の物理表現が画面に現れる**」 = 連続段階化は「強く踏み抜けた」の visual proof = コンセプト強化方向

### Q-D 5 項目通過確認 (v004 §2.A.3 と完全並列)

| Q-D 項目 | v004 状態 | v005 状態 (段階化追加後) | 変化 |
|---|---|---|---|
| 緊張の発生源 | 両方バランス | 両方バランス維持 | 不変 |
| (自発要素の位置) | コア入口 + 副産物層 非接続 | コア入口 + 副産物層 非接続 | 不変 |
| 30秒で死ぬ要素 | あり (4 悪手 fail 維持) | あり (regression test 継承) | 不変 |
| 経済反転チェック | ゲージ蓄積源なし | ゲージ蓄積源なし (段階化は視覚チャネルのみ) | 不変 |
| 美しいプレイ | 踏み抜き + 弾消し可視化 | 踏み抜き + 弾消し可視化 + **連続度の visual proof** | 強化方向 |

**結論**: v005 段階化追加は Q-D 5 項目すべて v004 同等以上 (4 項目不変 + 1 項目強化方向)。経済反転リスク bound 継続。

---

## 3. v004 → v005 差分要約

### コード差分 (game.js)
- ファイル冒頭コメント v004→v005 改修方針へ書き換え
- `game.lockFlash` 型コメント拡張 (count フィールド明記)
- `checkCollisions` 内の弾 erase 分岐で `count: game.echo.bulletsErased` 埋め込み + logEvent 引数 count 追加
- 描画ループの lockFlash 分岐で 3 段階 if 分岐
- trace meta game フィールド v004→v005、window expose 名 V004→V005

### ファイル差分 (game/log_autonomous_game/v005/)
- game.js: v004 から +10〜13 行 (機構) + コメント書き換え
- verify.js: target string と version コメントのみ v005 へ変更 (構造的 pass 条件は完全に v004 継承)
- index.html: title + expose 名のみ v005 へ変更
- design_log.md: v004 内容を v005 内容で完全上書き (本ファイル)
- log_self_prediction.md: v004 内容を v005 内容で完全上書き

### 出荷物
- v005/ 5 ファイル (game.js / verify.js / index.html / design_log.md / log_self_prediction.md)
- docs/games/log_autonomous_game/v005/ 物理コピー
- docs/games/log_autonomous_game/index.html に v005 リンク追加 (最新マーク)

---

## 4. v005 で扱わない項目 (本サイクル明示スコープ外)

- HP system / Echo クールダウン調整 → 次サイクル以降
- 案 B (撃破連鎖) / 案 D (生存時間スコア) の並行実装 → 次サイクル以降
- 案 C (軌道再走破) は Nao_u 相談前提のため永久に保留
- 経済反転 audit (verify.js 拡張 §2) は v004 と同様 score 非接続のため意味希薄、次サイクル以降の案 B/D 着手時に対で起票
- N=4+ の橙化が「実機で派手すぎる」と判定されたら v006 で 4+ を黄維持 + 半径のみ拡張に巻き戻す案 (本サイクルでは橙を採用、Nao_u/Mir/Ash 実機判定待ち)

---

## 5. 次サイクル以降の判断材料

- **C256 Phase 4 完了状況 (2026-05-28 着地時)**:
  1. v005 機構実装済 (game.js +10〜13 行)
  2. verify 2 mode 双方 pass 維持 (default exit 0 = regression 継承 / --bullet-density-zero exit 0 = Echo 単独得失差ゼロ継承)
  3. docs/ 公開 + index リンク追加で Nao_u/Mir/Ash が触れる経路維持
- **次サイクル C257 以降の候補手順**:
  1. **実機判定**: v005 game.js を localhost で実プレイ。3 段階の差別化 (N=1 黄 12px / N=2-3 黄 16px / N=4+ 橙 20px) が知覚されるか + 「派手にしすぎていないか」(= 自発コア化兆候 = Echo を打ちすぎたくなる衝動) を Nao_u/Mir/Ash で実機判定取得
  2. **段階化が知覚されない場合の巻き戻し案**: N=1 と N=2-3 の差 4px が小さすぎる可能性 → 半径差を 4→6 (12/18/24) に拡大 or 色相を黄→黄緑→橙の 3 色相違いに変更
  3. **段階化が派手すぎる場合の巻き戻し案**: N=4+ の橙を黄維持 (色相変化なし、半径のみ拡張)、または持続 1 frame を 0.5 frame 風に α 下げ

### 5.4 v006 候補軸 (2026-05-28 C258 Phase 2 追記、Boghog 業界経験則摂取後)

C258 Phase 2 で Boghog's bullet hell shmup 101 (shmups.wiki, CAVE 系 danmaku 設計指南) を WebFetch 厚読み (#shared-reads ts=1779972076.794739/.823599/.849019 3連続投稿、合計 8178 chars) し、v005 連続 erase 段階化に対する独立検証 + 色相衝突警告を取得。v006 として 2 案を候補軸化、**本サイクル C258 では実装しない (記録のみ)**。

- **案 v006-A: 色相再検討 (黄/橙 → 赤/桃/紫)**
  - 根拠: Boghog 経験則「reds, pinks and purples...are less likely to clash with commonly used colours, unlike traditional yellow and orange bullets which tend to overlap with explosions & golden items」 = 黄/橙は explosion/golden item と最も衝突する色相。v005 採用色は将来「敵撃破時 explosion」「弾源負荷 90s カーブで黄色 indicator」追加時に衝突
  - 候補色相: 赤 rgba(255,80,80) / 桃 rgba(255,150,200) / 紫 rgba(180,120,255)
  - リスク: castLock の「強く踏み抜いた」感は黄系で直感的に強い (光が爆ぜる印象)、桃/紫だと弱まる可能性 → Nao_u/Mir/Ash 実機判定で A/B 比較必須
  - 「N=1 の見た目を v004 と完全同一に保つ約束」は破れる → v004 実機判定の継承が切れる、再判定コスト発生
- **案 v006-B: motion 追加 (3 段階目チャネル化)**
  - 根拠: Boghog「CAVE bullet sprites will quickly reveal all kinds of wobble and ripple animation which catch the player's eye and give each bullet a unique identity」 = static sprite では弾識別性が弱い、wobble/ripple で identity 付与される
  - 仕様: N=2-3 で 3 frame wobble (半径 16±2 振動) / N=4+ で 5 frame ripple (半径 20→24→16→20 拡縮)。size/color に motion を加えて 3 チャネル差別化
  - リスク: lockFlash 1 frame static 制約 (描画は1frameに閉じる) を 3-5 frame に拡張 = Q-D 経済反転チェックを再実行する責務 (持続時間延長で「強く踏み抜いた」体感量が増え、副産物層が報酬接続化する可能性)
- **採用判定タイミング**: v005 Nao_u/Mir/Ash 実機判定受領後 (C259 以降)。実機判定が「N=1/2-3/4+ の差別化が知覚されない」だった場合は案 B (motion 追加) を v006 優先候補に、「色相衝突 (黄 erase flash と弾源負荷黄 indicator が同時に存在する場面で読めない)」が観察された場合は案 A 優先に
- **却下軸**: Boghog の depth sorting (faster on top) は lockFlash 適用範囲外 (lockFlash は弾でなく erase エフェクト)、Sprite Construction (contrast 並置) は v005 改修対象外 (castLock 中の弾本体 sprite 改修は別プロジェクト射程)
- **独立到達確認 (本原則の R 層昇格判定材料)**: Boghog「Single stray bullets are hard to read and can often feel unfair」 = Nao_u 5/26 06:10 「予測軌跡+×印が逆にわかりにくい」批判と独立到達。`memory/feedback_inside_to_outside_leak.md` 末尾に追記候補マーキング済 (R 層昇格判定は C259 以降、source 数: Nao_u + NextMars 5/27 + Boghog 5/28 で 3 source 同方向)

---

## 6. リンク

- [../v004/design_log.md](../v004/design_log.md) — 案 A 雛形仕様 (本 v005 の前 version)
- [../v003/design_log.md](../v003/design_log.md) — 70-90s カーブ第 1 段
- [../../../memory/feedback_self_risk_core_pitfall.md](../../../memory/feedback_self_risk_core_pitfall.md) — Q-D シート出典
- [../../../memory/feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) — `game:` commit 系統補正の原典
- [../../../memory/feedback_few_rules_big_effect.md](../../../memory/feedback_few_rules_big_effect.md) — 最小差分原則
- [../../../projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 上位プロジェクトファイル
- [../../../log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C256 Phase 4 セクション — 本ファイル起票文脈
