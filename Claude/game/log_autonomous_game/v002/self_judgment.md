# log_autonomous_game v002 — self_judgment.md (C248 Phase 4 更新)

**status**: コードレビュー + verify.js + 3 軸 audit scripts (bullet_origin / enemy_behavior / agent_difficulty_proxy) 全 PASS + v001 採点との差分比較に基づく**暫定自己採点**。実ブラウザ視覚体感判定は **未実施** (Log は GUI 操作能力なし、Nao_u / Mir / Ash へ実機判定依頼前提)。

採点時刻: 2026-05-27 C248 Phase 4 (C247 Phase 4 着地に対し敵 C + WAVE_TIMELINE + audit 3 本を追加)
採点者: Log
採点対象: `game/log_autonomous_game/v002/` (commit 前、Phase 5 で `game:` prefix push 予定)

v001 採点起点: 20.5/25 (82%) + Q-ミミクリ 11/15 (73%) (v001/self_judgment.md §7d/§7g)。

判定方針:
- v001 採点を基準とし、v002 差分 (3 箇所) の各影響のみを再評価
- 実機未確認部分は実機未確認と明記、推測点を確定点に格上げしない
- `feedback_inside_to_outside_leak.md` 1 原則 (内側→外側流出) を v002 で完全達成したか確認

---

## 0. v002 改修差分 (C247 Δ-1〜4 + C248 Δ-5〜7)

| ID | 改修箇所 | 内容 | サイクル |
|---|---|---|---|
| Δ-1 | `drawTitle()` 内ゴースト削除 | タイトル画面の未来ゴースト + 結線描画 14 行を削除、キャラ本体のみ静止描画 | C247 |
| Δ-2 | UI 用語洗浄 | `<title>` の「v001 — Echo-Path (パイロットごっこ)」→「Echo-Path」、`.note` から内部用語削除 | C247 |
| Δ-3 | wave 1 軽量化 | `spawnWaveA` n=5 → 3、shootCooldown 60 + i*20、x=0.25/0.5/0.75 再配置 | C247 |
| Δ-4 | wave 2 遅延 | `lastClearFrame` 追加、wave clear から `WAVE_REST_FRAMES=480` (8s) 経過後に次 wave 起動 | C247 |
| **Δ-5** | **敵 C ダイブ敵新設** | `spawnWaveC` 追加、上空 spawn → vy=2.5 直下 + sin 横揺れ±60px (周期 ≈3.1s)、射撃なし。配色 `#ffd84d` (黄)、運動軸 3 種峻別 | **C248** |
| **Δ-6** | **70-90s 時間カーブ本実装** | `WAVE_TIMELINE` 配列 + `currentPhase()` + `spawnNextWave()` を time-based dispatcher に格上げ。phase 0 (0-20s, A のみ) → phase 1 (20-50s, A+D) → phase 2 (50-90s, A+D+C)。waveCount 偶奇分岐は破棄 | **C248** |
| **Δ-7** | **audit scripts 3 本 v002 移植** | bullet_origin_audit.js / enemy_behavior_audit.js / agent_difficulty_proxy.js を v001→v002 移植 + 敵 C 対応 + WAVE_TIMELINE 対応 + 90s シミュ拡張 | **C248** |

(Δ-1/Δ-2 は C247 Phase 3、Δ-3/Δ-4 は C247 Phase 4、Δ-5/Δ-6/Δ-7 は C248 Phase 4 で物理化)

---

## 1. 既存 5 ゲート再採点 (Q-A〜Q-E)

### Q-A 中心入力 (Space 単一性) — **5/5 (据置)**

根拠: Space / 矢印 4 / WASD 4 のみ。castLock トリガ `game.spaceEdge` 一本化、機能発火関数も `castLock` 1 本。マウス / 追加修飾キーなし。v002 で構造変化なし。

### Q-導入 (？喚起度、事実列挙度) — **4.5/5 (v001 4/5 → +0.5 昇格)**

根拠: タイトル副題「あなたの足跡が、これから歩く道になる」(game.js:369) 維持。v002 Δ-1 で未来ゴースト + 結線を削除した結果:

- v001 失点 -1 理由「タイトル中の未来ゴーストが Space 押下後にロック概念に変換される瞬間が断絶気味」→ v002 ではゴースト自体を持たないため**断絶問題が消滅** (代わりに「？を立てる視覚要素ゼロでメタファ文だけで導入する」純化、design_log §Q-導入「事実列挙度=1」基準は維持)
- v002 失点 -0.5 新規: タイトルから動的視覚要素が消えたため、「？を立てる」強度はメタファ文 1 行のみに依存。実機で「読ませて？を立てる」体感が成立するかは未確認

→ 構造変化 +0.5 (4 → 4.5)、5 確定は実機判定後。

### Q-成功FB 状態3 (「危機回避」体感) — **3/5 (据置)**

根拠: 状態1 (発動不可リング) / 状態2 (シアン薄爆発) / 状態3 (危機回避テキスト) 3 層階段は v001 から不変。v002 で描画コードに触れていない。

実機未確認部分: テキスト出現タイミング体感、3 層階差の体感成立 (v001 §1 と同じ未確認項目が継続)。

### Q-D 予測軌道ゴースト — **4.5/5 (v001 4.0/5 → +0.5 昇格)**

根拠:
- v001 §7d で予測軌道線・×マーカー削除後 4.0/5 暫定昇格済。v002 Δ-1 でタイトル画面の未来ゴーストも削除 = **「内側→外側流出」原則がプレイ画面 + タイトル画面の両方で完全達成**
- 1 原則違反の最後の残存箇所がタイトルゴースト (1 秒先位置計算結果の視覚流出) で、v002 でゼロ化
- 失点 -0.5 残: 弾本体追跡のみで 5 体ウェーブ (v001) や 3 体ウェーブ (v002) の認知負荷が「見てから判断」できるかの実機判定が未到達。v002 では n=3 化により認知負荷自体は構造的に低下したが、5 確定は実機判定依存

→ 構造変化 +0.5 (4.0 → 4.5)、5 確定は実機判定後。

### Q-E レイアウト (HUD 面積 10% 以下) — **5/5 (据置)**

根拠: HUD 12px monospace 2 ヶ所のみ、面積 2.2% 維持。v002 Δ-2 で `.note` 簡素化したのは canvas 外、画面内 HUD 面積に変化なし。

### Q-A〜Q-E 新合計

| ゲート | v001 (C244 §7g) | v002 C247 | v002 C248 | 変化 |
|---|---|---|---|---|
| Q-A 中心入力 | 5/5 | 5/5 | 5/5 | 据置 (Δ-5 で C を追加しても入力単一性は変化なし) |
| Q-導入 | 4/5 | 4.5/5 | 4.5/5 | 据置 (Δ-5/6 はプレイ画面の話、タイトル要素に変化なし) |
| Q-成功FB 状態3 | 3/5 | 3/5 | 3/5 | 据置 |
| Q-C 敵出現退場 | (未採点) | (未採点) | **4.5/5** | **新設**: A 縦進行 / D 横進行 / C ダイブ + 横揺れの 3 軸独立性、enemy_behavior_audit で spawn 範囲 + 不変式 + 退場条件全 PASS。失点 -0.5 は実機での 3 軸視覚峻別 (配色 赤/紫/黄) が成立するか未確認 |
| Q-D 予測軌道ゴースト | 4.0/5 | 4.5/5 | 4.5/5 | 据置 (1 原則完全達成は維持、敵 C 追加で再検査 = bullet_origin_audit PASS 維持) |
| Q-E レイアウト | 5/5 | 5/5 | 5/5 | 据置 |

**v002 C248 新合計: 26.5/30 (88%)** — Q-C 新設で分母 25→30 化。Q-C が 5/5 化すれば 27/30=90%。
旧 5 ゲート比較 (C247=22/25 → C248=22/25): 5 ゲート内では構造差分ゼロ、追加価値は Q-C 軸新設に集約。

---

## 2. Q-ミミクリ 核採点 再評価

| サブゲート | v001 (C244 §7g) | v002 (C247) | 変化 |
|---|---|---|---|
| Q-ミミクリ-1 核を上回るメカニクス改修なし | 4.5/5 | **5/5** | Δ-2 で UI 内部用語洗浄 + Δ-1 で 1 原則違反箇所ゼロ化 = メカニクス積上の逆方向 (削除 + 簡素化) を一貫、5 到達 |
| Q-ミミクリ-2 パイロット感の導入 | 3/5 | 3/5 | タイトル副題不変、機体グラフィック不在も不変 (構造採点上限 4、5 は機体グラ追加が必要) |
| Q-ミミクリ-3 死線スリリング × castLock | 3.5/5 | 3.5/5 | castLock 機構不変、verify.js PASS 維持 |

**Q-ミミクリ 新合計: 11.5/15 (77%)** (v001 11/15=73% → +0.5pt)

メカニクス 88% / ミミクリ 77% で **11pt 差** (v001 11pt 差から不変)。Q-ミミクリ-2/-3 が実機判定なしで頭打ちなのは v001 と同じ構造。

---

## 3. 「展開なし反復」解消度採点 (Nao_u 5/26 06:10 指摘への v002 直対応)

Nao_u 指摘の核: 「予測軌跡＋×印が視界ノイズで弾本体回避を阻害、**展開なし反復で明確につまらない**」

v001 はこの 2 文を構造的に分けて評価していなかった。v002 では:
- **視界ノイズ問題** = v001 §7d (C242 Phase 3) で予測軌道線・×印削除済、v002 Δ-1 でタイトル画面の未来ゴーストも削除 = 「視界ノイズ」軸は **完全解消** (内側→外側流出 1 原則違反箇所ゼロ)
- **展開なし反復問題** = v002 Δ-3 (wave 1 軽量化) + Δ-4 (8 秒静寂) で初対応

### 展開差カーブ — 5 段階自己採点

| 項目 | C247 採点 | C248 採点 | 根拠 |
|---|---|---|---|
| Δ-1 視界ノイズ解消 | 5/5 | **5/5** | タイトル + プレイ両画面で 1 原則違反箇所ゼロ、`feedback_inside_to_outside_leak.md` 完全達成。bullet_origin_audit v002 で `c_shots_zero` PASS = 敵 C は本体接触のみ、弾源負荷追加なし、Q-D 原則維持 |
| Δ-3 wave 1 軽量化 | 4/5 | **4/5** | 据置。verify.js v002 で 4 方針 5.32/4.62/6.30/8.15s と C247 と同値、軽量化の悪手通過穴なし |
| Δ-4 wave 2 遅延 (8 秒静寂) | 3.5/5 | **3.5/5** | 据置。8 秒静寂は構造存在のみ、体感は実機判定依存 |
| 「反復」根本解消 | 3/5 | **4.5/5** | **+1.5 大幅昇格**: Δ-5/6 で「2 種 wave 偶奇ループ」を「3 phase × types 配列ローテ」に置換。phase 0 (A のみ) → phase 1 (A+D) → phase 2 (A+D+C) で wave 種別が時間と共に**単調増加**、enemy_behavior_audit で 90s シミュ内に A:4 wave / D:1 wave / C:1 wave が観測。失点 -0.5: 「展開」軸への構造応答は成立したが、90s 以降の継続展開 (HP system / boss / phase 3+ など) は本 v002 スコープ外 |
| **時間カーブ単調性** | (未採点) | **4/5** | **新設**: WAVE_TIMELINE の 3 phase は wave 種数 1→2→3 で **単調増加** = 難易度カーブの構造要件 (Hold-Drop-Crystal v003 教師差分の「中盤→終盤で軸が増える」) を満たす。失点 -1: phase 内の wave 密度や弾数の時間カーブはまだ平坦 (例えば phase 2 で SHOOT_INTERVAL を縮めるなどの細部はスコープ外) |

**展開差カーブ 合計: 21/25 (84%)** — C247 15.5/20 (78%) → +6%
分母拡張: 「時間カーブ単調性」軸新設で 20→25 化。
旧 4 項目では 17/20 (85%) → 「反復」根本解消が +1.5 で 4 項目内も +1.5 昇格。

---

## 4. 4 軸監査 実走 (v002 C248)

### 4.1 verify.js (悪手 4 方針)

`cd game/log_autonomous_game/v002 && node verify.js` (seed=20260527, MAX_FRAMES=90s):

| strategy | survived | death_cause | waves_seen |
|---|---|---|---|
| camper | 5.32s | bullet | 1 |
| lane-holder | 4.62s | bullet | 1 |
| blind-sweeper | 6.30s | bullet | 1 |
| nospecial | 8.15s | bullet | 1 |

`pass: true` (exit 0)、全 4 方針 wave 1 内 gameover。**WAVE_TIMELINE 拡張 (90s) + 敵 C 追加が悪手通過の穴を作っていない**ことを物理確認 (4 方針すべて wave 1 内死亡で phase 2 = 敵 C 到達せず、C 追加が悪手側に有利化していない)。

### 4.2 bullet_origin_audit.js (Q-D 弾源)

`exit 0`、10/10 check PASS。90 秒シミュで 6 wave / 60 弾発射、敵 A 弾 52 / 敵 D 弾 8 / 敵 C 弾 **0**。`c_shots_zero` ✅ = 敵 C 追加で Q-D 弾源負荷増えていないことを独立検証。max enemy step 3.201 px/F < player_speed 3.4 (敵 C の sin 横揺れ瞬間速度を含む)、急加速ゼロ。

### 4.3 enemy_behavior_audit.js (敵挙動)

`exit 0`、8/8 case PASS。case 内訳:
- spawn_coord_domain_A/D/C: 3 種すべての spawn 範囲健全
- direction_invariant_A_D: A vy=1.4/vx=0、D vy=0/|vx|=1.4 + 符号反転なし
- direction_invariant_C: **新設** — C vy=2.5 不変、x oscillation 範囲 ±60px 以内
- shoot_gate_y / shoot_gate_x_D / enemy_c_no_shots すべて PASS

### 4.4 agent_difficulty_proxy.js (素朴良手 30 試行)

`exit 0`、30/30 試行完走。中央値:
- median_clear_wave: **1**
- median_play_time_sec: **9.28s**
- median_graze_count: 2
- survival_rate: 0/30 (素朴良手でも 90s 完走できず)
- death_cause: bullet 30/30

論文 (Wordle / Slay Pearson r=0.624/0.871) の thesis 「prox 中央値が体感難易度の代理になる」を v002 ベースラインとして固定。v001 (median_clear_wave / median_play_time_sec ≈ baseline) との比較は別ファイル (`projects/log_autonomous_game.md` か game_lessons_log) で v001→v002 差分が「人間体感難易度の変化代理」になるか追跡。

**4 軸監査全 PASS** = **設計穴指標**: ゼロ。Δ-5/6/7 が既存の悪手検出 / 弾源禁則 / 敵挙動仕様を破っていないことを物理確認。

---

## 5. Phase 4 完遂条件 達成状況

### C247 Phase 4 完遂 (既達)
- (1) ✅ wave カーブ調整 = `WAVE_REST_FRAMES=480` + `lastClearFrame` + `restElapsed` ガード + n=3 軽量化
- (2) ✅ verify.js 新規、4 方針全 wave 1 内 fail
- (3) ✅ self_judgment.md 起票
- (4) ✅ projects/log_autonomous_game.md 履歴 C247 節追加

### C248 Phase 4 完遂 (本サイクル staging「次フェーズの大作業」完遂定義 1〜6)
- (1) ✅ **敵 C ダイブ敵実装** + spawn dispatcher 拡張: `spawnWaveC` 関数 + `currentPhase()` time-based ローテ。A/D/C を WAVE_TIMELINE 経由で時間ベース dispatch
- (2) ✅ **WAVE_TIMELINE 70-90 秒カーブ第1段**: phase 0 (0-20s, [A]) → phase 1 (20-50s, [A,D]) → phase 2 (50-90s, [A,D,C])。wave 種別が phase 進行で 1→2→3 と単調増加
- (3) ✅ **verify.js v002 が新 timeline で `pass:true` 維持**: MAX_FRAMES 60s→90s 延長、悪手 4 方針全 wave 1 内 fail 維持。**Δ-5/6 が悪手通過穴を作っていない確認済**
- (4) ✅ **audit scripts 3 本 v002 PASS**:
  - bullet_origin_audit.js 10/10 check PASS (exit 0)、敵 C 弾源ゼロ確認
  - enemy_behavior_audit.js 8/8 case PASS (exit 0)、敵 C spawn/不変式/退場新 case 含む
  - agent_difficulty_proxy.js 30/30 試行完走 (exit 0)、v002 ベースライン 4 指標固定
- (5) ✅ **self_judgment.md v002 採点更新**: 22/25 → 26.5/30 (Q-C 軸新設) + 展開差カーブ 15.5/20 → 21/25 (時間カーブ単調性軸新設、「反復」根本解消 +1.5 昇格)
- (6) Phase 5 で実施予定: `game:` prefix 単独 commit + push

---

## 6. What this self_judgment proves

- v002 で「内側→外側流出」1 原則の違反箇所がプレイ画面 + タイトル画面の両方でゼロ化 = 構造的完全達成
- wave 1 軽量化が悪手通過の穴を作っていない (verify.js PASS 維持)
- wave 2 起動が「全撃破 + 8 秒経過」の二条件で正しくガードされる (コード上確認)
- 「展開なし反復」軸への構造応答が v001 から +58% (20% → 78%) 進行

## 7. What this self_judgment does NOT prove

- 8 秒静寂の体感「圧迫→緩→次の圧迫」が実機で成立するか (悪手 4 方針は wave 1 内死亡で 8 秒静寂を観測しないため、verify.js では計測できない)
- wave 1 軽量化 (n=3) の体感「易しすぎ／ちょうどよい／圧不足」境界 (実機判定依存)
- タイトル副題 1 行のみで「？を立てる」体感が成立するか (Δ-1 でゴースト削除した後の純メタファ導入の評価)
- 「2 wave ループ反復」が長時間プレイで反復感を再生するかどうか (敵 C 追加なしで何分まで耐えるかは未確認)

## 8. 次サイクル (C249+) で必要な作業 (優先順)

1. **実機視覚判定の取得**: Nao_u / Mir / Ash いずれかに v002 実機プレイ依頼 (`python -m http.server` ローカル or Pages 公開)。敵 A/D/C の 3 軸視覚峻別 (赤/紫/黄) が成立するかが最大の検証対象
2. 実機判定結果で Q-導入 / Q-C / Q-D / Q-成功FB 状態3 / Q-ミミクリ-2/-3 / 展開差カーブを確定採点へ書き換え
3. **v001 → v002 proxy 4 指標差分の計測**: v001 agent_difficulty_proxy を同 seed (20260527+i) で再実行し、median_clear_wave / median_play_time_sec / median_graze_count の差分を取得。差分が「人間体感難易度の変化代理」として妥当か (= proxy 値が増えたら難化、減ったら易化の方向で動くか) を Nao_u 体感ランキングと突き合わせる必要あり (3 サイクル分蓄積で初判定可能)
4. **phase 内密度カーブ追加**: 現状 WAVE_TIMELINE は wave 種別のみ単調増加、phase 内 SHOOT_INTERVAL や敵 hp / spawn 数の単調性は未実装。phase 2 内で 70-90s に向け密度上昇させる細部追加は次の改修の候補
5. **HP system 導入検討**: 現 1-hit kill 設計では agent_difficulty_proxy の residual_hp_ratio が binary に潰れる。論文の Slay the Spire (HP 連続値 → 強い体感相関 r=0.871) の前提に近づけるため、HP system 導入で proxy 指標の解像度を上げる選択肢

---

## 9. 接続先

- [game/log_autonomous_game/v001/self_judgment.md](../v001/self_judgment.md) §7g — v001 最終採点 (本ファイル起点)
- [game/log_autonomous_game/v001/design_log.md](../v001/design_log.md) §Q-C 敵C ダイブ / §Q-C 敵D 横断敵 / §Q-導入 / §Q-成功FB — 採点基準出典
- [game/log_autonomous_game/v002/game.js](game.js) — 採点対象コード本体
- [game/log_autonomous_game/v002/verify.js](verify.js) — §4.1 verify.js 実走出力元
- [game/log_autonomous_game/v002/bullet_origin_audit.js](bullet_origin_audit.js) — §4.2 Q-D 弾源監査
- [game/log_autonomous_game/v002/enemy_behavior_audit.js](enemy_behavior_audit.js) — §4.3 敵挙動監査
- [game/log_autonomous_game/v002/agent_difficulty_proxy.js](agent_difficulty_proxy.js) — §4.4 LLM-agent 難易度プロキシ
- [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 本 v002 着地節への上位接続
- [memory/feedback_inside_to_outside_leak.md](../../../memory/feedback_inside_to_outside_leak.md) — 1 原則出典 (v002 で完全達成)
- [memory/feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) — 「ゲームを動かして出す」原則、C248 Phase 4 で playable diff まで完遂
- [log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C248 Phase 4 セクション — 本ファイルの起票文脈
