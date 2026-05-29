# log_autonomous_game v006 — design_log.md (出題側振幅増ブレスト + 1 案選定)

**起票**: 2026-05-29 C261 Phase 4 (Log)
**親**: [v005/design_log.md](../v005/design_log.md) §5.4「v006 候補軸」(C258 Phase 2) + [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) 「v006 検討メモ」(C257 Phase 3)
**前 version**: v005 (連続 erase 段階化、5/28 C256 着地、Nao_u/Mir/Ash 実機判定待ち)
**用途**: v005 自然延長として「出題側 (= 敵/弾源側) 振幅増」軸を物理化する次バージョンの design_log 骨格起票。本サイクル C261 では design_log まで、実装着手 (game.js / verify.js 改修) は v005 実機判定後の C262+ 以降に bound

---

## 0. 経緯補正 (Phase 4 staging 認識誤り)

C261 Phase 4 大作業 staging 指示は「**v004** design_log 起票」と書かれていたが、実態:

- v004 design_log は C252 Phase 4 で着地済 (5/27、案 A 弾消し報酬 雛形)
- v005 design_log は C256 Phase 4 で着地済 (5/28、連続 erase 段階化)
- v005/design_log §5.4 で v006 候補軸 (色相再検討 / motion 追加) も C258 Phase 2 で記録済
- projects/log_autonomous_game.md「v006 検討メモ」(C257 Phase 3) で v006 候補 3 軸 (敵バリエーション / HP system / 70-90s カーブ) を R-A/R-D/R-E 評価付きで起票済

staging Phase 1-3 が v005 まで進んだ事実 + projects 側 v006 検討メモを捕捉できていなかった = **自己認識ドリフトの観測点**。次サイクル Phase 1 step 0 で「対象プロジェクト最新状態確認 (game directory + projects ファイル両方)」を明示するルール候補として記録 (kaizen 起票はしない、N=2 同型観察待ち、`feedback_few_rules_big_effect.md` 順守)。

本 design_log は staging 指示の精神 (「次バージョン design_log 起票 + 3 案ブレスト + 1 案選定 + 持越ゲート」+「ゲームを動かして出す原則の game/ commit 系統補正」) を活かしつつ、対象を **v004 → v006** に補正、ブレスト軸を **出題側 (= 敵/弾源側) 振幅増** に特化して整理する。

---

## 1. v006 ブレスト: 出題側振幅増 3 案

各案の項目: 機構名 / 期待効果 (R-A 核強化観点) / 失敗 pre-mortem / 実装コスト 1 行。

### 案 (a) 敵射撃バリエーション (敵 B/C/D 追加)

- **機構名**: 既存敵 A (vy=1.4 単一垂直降下) に **敵 B (横スイープ)** / **敵 C (ダイブ)** / **敵 D (散弾)** から 1-2 種追加。Pulse Relay v003 教師差分 wave 構造を継承
- **期待効果 (R-A)**: 「踏み抜き対象の質変化」 = castLock で踏み抜く弾の出題側に質的バリエーションを与え、核体験「1 秒先賭けの成功」の対象空間を拡張。同一敵 A の単調反復から脱出 (5/26 06:10 Nao_u 「展開がなく繰り返し」批判への構造応答)
- **失敗 pre-mortem**: 敵バリエーション追加で「弾源の読みやすさ」が劣化、castLock 発動タイミング判断が「敵種類識別 → 弾速読み → 1 秒先予測」の 3 段階になり認知負荷が上がりすぎる懸念。NextMars 4 軸 (silhouette / contrast / effect hierarchy / depth sorting) が満たされないまま追加すると「視覚ノイズに飲まれた状態」になる (`feedback_inside_to_outside_leak.md` refine 節)
- **実装コスト**: game.js +30-50 行 (敵クラス追加 + spawn パターン + verify.js 4 悪手方針への regression 維持)、design_log 物理化 +1 commit

### 案 (b) 70-90s 時間カーブ phase 2/3 本体

- **機構名**: v002 で phase 0/1 (~50s 軽量化 + 8 秒静寂ガード) + v003 phase 2 漸変 (50-90s SHOOT_INTERVAL 90→60) まで着地済の続き = **phase 2 内 wave 構造を A+D ローテで強化** + **phase 3 (70-90s) 終端の山追加** (敵 spawn 密度 + SHOOT_INTERVAL 急峻化)。Pulse Relay v003 教師差分の時間カーブ正統継承
- **期待効果 (R-A)**: 「踏み抜く回数の積み重ねが意味を持つ時間軸層」追加 = 単発の castLock 成功体験を 70-90 秒のリズム全体で意味化、phase 終端の山で「ここまで生き残った価値」を体感的に補強。v005 連続 erase 段階化 (瞬間強度軸) と直交する時間軸増強
- **失敗 pre-mortem**: 70-90 秒カーブの「終端の山」が高すぎると wave 1 (~10s) でも死んでいる現状の悪手 4 方針が phase 3 到達前に死ぬまま = 終端の山が「飾り」になる懸念。verify.js 4 悪手方針 fail タイミングを保ちつつ phase 3 を物理的に体験させる導線設計が必要
- **実装コスト**: game.js +20-40 行 (WAVE_TIMELINE 拡張 + phase 3 spawn パターン + SHOOT_INTERVAL 急峻化)、verify.js +10-20 行 (phase 3 reach 計測)、design_log 物理化 +1 commit

### 案 (c) 出題タイミング/弾速の物理振幅 (バースト + 強弱混在)

- **機構名**: 既存 SHOOT_INTERVAL 線形漸変 (phase 2 で 90→60 frame) に **タイミング振幅** (定常 60 frame → ±20 frame ランダム振動 = バースト/間隔混在) と **弾速振幅** (既定 vy=3.0 → 高速 4.5 と低速 1.8 の混在) を追加。staging 指示「弾速の振幅」「出題タイミングの振幅」を統合
- **期待効果 (R-A)**: 「踏み抜くタイミングの正解が複数化」 = 単一の「1 秒先 = SHOOT_INTERVAL ÷ 60 × 50ms」予測が崩れ、castLock 区間内で複数の弾速/タイミングを同時処理する高密度体験を物理化。Echo-Path コア「1 秒先賭け」の不確実性を出題側で増やす
- **失敗 pre-mortem**: ランダム振幅は「予測不能」と紙一重 = castLock タイミングの正解が運要素化、Q-D 弾源原理「画面内 + 退場前」の読みやすさが崩れる懸念。Pulse Relay v003 教師差分「不確実性は核を冷やす可能性」(graze_log v01「単なる難化」事故と隣接)。R-A 核体験「予測が当たる/外れる/予測しなかった」の 3 層 FB のうち「予測しなかった」が支配的になりうる
- **実装コスト**: game.js +15-25 行 (SHOOT_INTERVAL ランダム化 + 弾速振幅)、verify.js +15-25 行 (4 悪手方針への regression 維持 + 振幅 audit 追加)、design_log 物理化 +1 commit

---

## 2. 1 案選定 + 選定理由 (R-A〜R-I による根拠)

### 選定: **案 (a) 敵射撃バリエーション (敵 B/C/D 追加)**

### 選定理由

- **R-A (核の楽しさ) 直接強化**: 案 (a) は「踏み抜き対象の質変化」で v005 が確立した「踏み抜いた弾の強度の物理表現」体験の対象空間を質的に拡張する。案 (b) は時間軸層の追加 = 直交軸増強で「冷やさない」が「直接強化」でもない。案 (c) は不確実性増加で核を冷やすリスクが (a)(b) より構造的に高い (R-A 順守判定で最強)
- **R-D (中心入力/型から始める、独自要素 1 つ)**: 案 (a) は Pulse Relay v003 教師差分 wave 構造の直接継承 = **型側**、独自要素ではない。3 つ目以降の独自要素積み増しに当たらない (R-D 順守)。案 (b) も型側だが時間カーブは v003 で既に第 1 段着地済 = 追加性が低い。案 (c) は staging 指示由来だが「ランダム振幅」は独自要素枠の使用に近い (R-D の積み増し警戒範囲)
- **R-I (判定依頼ではなく最終確認依頼)**: 案 (a) は v005 実機判定後に「敵 B/C/D のうちどれを優先するか」を Nao_u/Mir/Ash に最終確認依頼として出せる粒度 = R-I 順守可能。案 (c) はランダム振幅の数値選定が判定依頼に近づきやすい (Nao_u 判定資源を消費)
- **projects/log_autonomous_game.md v006 検討メモとの整合**: C257 Phase 3 で既に「(A) 敵バリエーション = 高 (第一候補)」と評価済。本サイクル C261 Phase 4 staging「出題側振幅増 3 案」の (a) と一致 = 検討の往復が消え判断の安定性が確保される
- **5/26 06:10 Nao_u「展開がなく繰り返し」批判への構造応答**: v002 wave 軽量化 + v003 phase 2 漸変 + v005 連続 erase 段階化までで「展開なし反復」体感を改善する方向に進めてきたが、敵側の質的多様性に手を入れていない = 案 (a) で初手着地

### 案 (b)(c) の処遇

- **案 (b)**: v007 候補軸として記録のみ、projects/log_autonomous_game.md v006 検討メモで既に「(C) 70-90s カーブ = 高 (第二候補)」と評価済、現状維持で次回再選定対象
- **案 (c)**: 本サイクルでは却下 (R-A 核冷やしリスク + R-D 独自要素枠使用の懸念)。ただし staging 指示由来のため記録は保持、v005 実機判定で「展開差が出題側で薄い」と指摘された場合に再評価候補として保持

---

## 3. v005 → v006 持越ゲート (8 ゲート + 拡張候補)

v003 design_log §4 で起票された 8 ゲートを v002 → v003 → v004 → v005 → v006 で継承維持する。各ゲートは v005 self_judgment 起票 (Nao_u/Mir/Ash 実機判定後) で正式採点される。v006 では「(a) 敵バリエーション追加で各ゲートが減点されないこと」を bound。

| ゲート | v005 暫定 | v006 暫定 (敵バリエーション追加) | 差分理由 |
|---|---|---|---|
| Q-A (中心入力) | 5/5 (維持) | 5/5 (維持) | Space castLock 1 入力は変更なし |
| Q-B (特殊3状態) | 4-5/5 (実機判定待ち) | 4-5/5 (維持) | castLock/resolveLock 3 状態 (蓄積中/弾なし hit/弾あり hit) は変更なし |
| Q-導入 (1 秒先賭けコンセプト導入) | 4/5 (実機判定待ち) | 4/5 (維持) | タイトル副題 1 行は変更なし |
| Q-成功FB (3 状態視覚階差) | 4/5 (実機判定待ち) | 4/5 (維持) | v005 連続 erase 段階化までで成立、v006 では非破壊 |
| Q-C (敵出現退場) | 4.5/5 (維持) | **5/5 暫定** | 敵バリエーション追加で出現退場ロジックの「単調反復」減点が解消見込み (5/26 06:10 Nao_u 批判 = Q-C 暗黙減点と同型) |
| Q-D (弾源/弾攻撃元) | 4.5/5 (維持) | 4.5/5 (維持) | 敵 B/C/D の弾源原理 (画面内 + 退場前) は敵 A 同等で設計、新規敵の弾源は spawn 時に SHOOT_GATE 通過確認必須 |
| Q-E (レイアウト/サイドパネル禁止) | 5/5 (維持) | 5/5 (維持) | UI レイアウトは変更なし |
| Q-F (日本語ログ) | 4/5 (維持) | 4/5 (維持) | trace logger は変更なし、新規敵 event 追加時のみ命名規約継承 |

### 新規ゲート候補 (1 つ以下に bound、staging 完遂定義 6 順守)

- **Q-Q (出題側振幅): 敵バリエーションが「読みやすさ」を劣化させていないか**: NextMars 4 軸 (silhouette / contrast / effect hierarchy / depth sorting) を敵 B/C/D に対して通過確認。verify.js 4 悪手方針 fail タイミングが v005 と同等以上を維持 (新規敵が悪手通過の穴を作っていない物理確認) + `--bullet-density-zero` mode の outcome が継承される (Echo 単独得失差ゼロ維持) を 2 条件 bound

8 → 9 ゲートで bound 内 (staging 完遂定義 6 順守、追加機構は 1 つ = Q-Q のみ)。

---

## 4. v006 で扱わない項目 (本サイクル明示スコープ外)

- **実装着手 (game.js / verify.js / index.html 改修)**: 本 design_log は **次バージョン骨格起票** のみ。v005 実機判定 (Nao_u/Mir/Ash) 到来前は実装着手しない (R-I 順守: 「判定でなく最終確認」、推測値に依存する改修判断を退路設計化しない)
- **案 (b) 70-90s カーブ phase 2/3 詳細**: v007 候補軸として記録のみ、本 design_log では深掘りしない
- **案 (c) 出題タイミング/弾速振幅**: 却下記録のみ、v005 実機判定で「展開差が出題側で薄い」指摘到来時に再評価対象
- **proxy 4 指標 Pearson 相関第 1 回計算**: v005 self_judgment 起票後の独立タスク (C262 以降)
- **v005 実機判定取得手順**: docs/games/log_autonomous_game/v005/ 公開済、Nao_u/Mir/Ash 接続経路は維持。判定取得状況確認は Phase 5 (日記) で実施
- **v005/design_log §5.4 v006-A 色相再検討 / v006-B motion 追加**: 本 v006 では「出題側振幅」軸を優先、erase 表現側 (= 自発成功フィードバック側) の改修は v007 以降のバックアップ候補に bound

---

## 5. 次サイクル以降の判断材料

- **C261 Phase 4 着地状況**:
  1. v006/design_log.md 起票 (本ファイル) — 3 案ブレスト + 案 (a) 選定 + 8+1 持越ゲート整理済
  2. game.js / verify.js / index.html v006 fork なし (実装は v005 実機判定後)
  3. v006 ディレクトリは design_log.md のみ
- **次サイクル C262 以降の候補手順**:
  1. **v005 実機判定取得**: Nao_u/Mir/Ash 接続経路で v005 self_judgment 起票 (3 段階差別化 N=1/2-3/4+ の知覚確認 + 「派手すぎないか」の自発コア化兆候判定)
  2. **v006 実装着手判定**: v005 実機判定後、案 (a) 敵バリエーションの優先種選定 (B 横スイープ / C ダイブ / D 散弾 から 1-2 種)
  3. **proxy 4 指標 Pearson 相関第 1 回計算**: v005 self_judgment の体感差分 + v002 baseline で 2 サンプル目を作る (第 1 回計算は 3 サンプル目 = v006 着地後)
- **本サイクル C261 自己ドリフト観測点**: Phase 4 staging「v004 起票」と実態 (v005 まで進行) のズレ = Phase 1-3 が対象プロジェクト最新状態の捕捉に失敗。次サイクル Phase 1 step 0 で「プロジェクト最新状態確認」を明示するルール候補として記録 (N=2 同型観察待ち、kaizen 起票はしない、`feedback_few_rules_big_effect.md` 順守)

---

## 6. リンク

- [../v005/design_log.md](../v005/design_log.md) — v005 連続 erase 段階化 (前 version)、§5.4 で v006 候補軸 2 案 (色相 / motion) 記録済
- [../v005/log_self_prediction.md](../v005/log_self_prediction.md) — v005 自己予測 (核体験 1 文化の起点)
- [../v004/design_log.md](../v004/design_log.md) — 案 A 弾消し報酬の事前ゲート骨格 (4 案 brainstorm 起点)
- [../v003/design_log.md](../v003/design_log.md) — 70-90s カーブ第 1 段着地、8 ゲート (Q-A〜Q-F) 起点
- [../v002/completion_report.md](../v002/completion_report.md) — v002 出荷文書 (does NOT prove 7 項目の起点)
- [../v001/design_log.md](../v001/design_log.md) — 8 ゲート仕様の最初の起票
- [../../../memory/feedback_self_risk_core_pitfall.md](../../../memory/feedback_self_risk_core_pitfall.md) — Q-D シート / 4 分岐 / 経済反転判定基準
- [../../../memory/feedback_inside_to_outside_leak.md](../../../memory/feedback_inside_to_outside_leak.md) — NextMars 4 軸 refine 節 (新規敵の readability 判定の起点)
- [../../../memory/feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) — game/ commit 系統補正の原則 (C261 Phase 4 が design_log のみ + 実装 commit ゼロでも次バージョン骨格起票で playable diff precursor を成立させる根拠)
- [../../../memory/feedback_few_rules_big_effect.md](../../../memory/feedback_few_rules_big_effect.md) — 新ルール起票ゼロ、既存 R-A〜R-I で判定する順守確認
- [../../../projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 上位プロジェクトファイル、「v006 検討メモ」(C257 Phase 3) で案 (a)(b)(c') 評価済
- [../../../log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C261 Phase 4 セクション — 本ファイル起票文脈 + 認識誤り補正記録
