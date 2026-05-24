# log_mystery v09 — devlog (C235 Phase 4)

## 1. 鐘 chord 構造 (章間連鎖網 3 ペア + 双方向化) 設計

v08 §7 (b) で予告した「chord 3 ペア化: 章 2 C8 (換気窓物理構造) を章 1 場所鐘 (Y 隣室) の決定打にも兼任させる第 3 chord ペア」を v09 で最小差分実装。3 案 brainstorm (C8→場所1+共犯場所 chord / C7→章1容疑者鐘逆方向 chord / chord 演出強化先行) のうち **案 A: C8→場所1+共犯場所 chord** を確定 (詳細: brainstorm.md §2-3)。

採用案の核: **章 2 C8 (見取り図) を、章 1 場所鐘 (Y) の chord 3 cross-back 補強 (pending) として再利用する**。物語上、見取り図で「換気窓は外周通路に面し他経路 (廊下監視・書庫上階) が物理的に不適」が確定すると、貴重書室から外へ抜ける物理経路は **換気窓→閲覧室→外周通路** の動線のみ = 章 1 場所鐘 Y が消去法的に補強される。C8 が章 2 共犯場所鐘の base (within-ch2) + 章 1 場所鐘の補強 pending (cross-ch1) の chord 3 兼任に拡張 = ch2 → ch1 方向の cross-chord (v07-v08 の ch1→ch2 一方向 chord に対する **方向反転**) で章間連鎖網が双方向化。

evalPlace1 新規追加: v08 binary `whereHit = (wh === ANSWER_CH1.where)` を 3 値化、`c10 ? hit : (c8 ? pending : false)` 形 (evalWhy と完全並列構造)。C10 は v08 まで「動機決定打 + chord 1 で共犯場所決定打」(2 鐘トリガー) だったが、v09 で「動機決定打 + chord 1 で共犯場所決定打 + chord 3 で場所1決定打」= **3 鐘トリガー化** (chord 3 ペア自然帰結)。

実装差分は v08 ベース 796 行に対して以下のみ:
- C8 文面拡張 (消去法的に「換気窓→閲覧室→外周通路」動線確定追記、+ ~80 文字) + `isExtra: true` 追加 (4 行差分)
- evalPlace1 新規追加 (14 行)
- deduceChapter1 改修: where を evalPlace1 経由に変更 (3 行差分)
- reDeduceCh1 改修: where も re-eval する分岐追加 (10 行差分)
- CLUES_CH2 クリックハンドラ拡張: `if (chapter1Deduced && c.id === 8) reDeduceCh1();` 1 行追加
- renderResult1: 場所鐘の bellRow 第 5 引数 (pending) を `sWhere.pending` に変更、hits 集計を `sWhere.hit === true` に厳密化、pending = `sWhy.pending || sWhere.pending` に拡張、pending 分岐の missing/pendingNames 分離 + 場所 pending ヒント追加 (~25 行差分)
- 章 1 説明文に chord 1 + 3 ペア区別注記追記
- 章 2 説明文に chord 3 ペア追記
- meta 文末 v01→v09 系譜更新
- title / H1 を v09 用に差し替え

コード差分 ~65 行。v07/v08 の構造抽象 (`bellRow` / `bellState` / `evalXxx` / `reDeduceXxx` / `bell-pending` クラス / `[補強]` タグ / `isExtra` 規約 / `chapter1Deduced` / `chapter2Deduced` フラグ) を**1 つも壊さず**、章間連鎖を 2 ペアから 3 ペア + 双方向化 + chord 種別 (両方 pending 化型) 追加に拡張できた。

## 2. v08 比較

| 軸 | v08 | v09 | 体感差分予測 |
|---|---|---|---|
| 章数 | 2 章 | 2 章 | 変化なし |
| 鐘数 | 6 鐘 | 6 鐘 | 数値同じ |
| 3 値鐘 | 動機+場所+共犯者 3 つ | 動機+場所1+場所2+共犯者 4 つ | +1 鐘 (場所鐘1 3 値化) |
| 章間 chord | 2 ペア (C10 + C3) | 3 ペア (C10 + C3 + C8) | +1 ペア |
| chord 方向性 | ch1→ch2 一方向 | ch1→ch2 + ch2→ch1 双方向 | 方向反転追加 |
| chord 種別 | 「片方の clue で両方 hit」型 のみ | 「両方 hit」型 + 「両方 pending」型 の 2 種混在 | chord 種別 +1 |
| CLUE 件数 | 5+5=10 件 | 5+5=10 件 (C8 文面拡張のみ) | 件数同じ |
| プレイ手順 | C10 chord 1 + C3 chord 2 | C10 chord 1+3 + C3 chord 2 + C8 chord 3 cross-back | chord 3 経路追加 |
| 最終確信頂点 | 5 段 (頂点 + 章1鳴り直し + 章2鳴り直し + chord1同時 + chord2鳴り直し) | 6 段 (5 段 + chord 3 鳴り直し) | +1 段 |
| 章間対称性 | 「対称 + chord 2 ペア」 | 「対称 + chord 3 ペア + 双方向化」 | 連鎖網拡張 + 方向反転 |
| C10 役割 | 2 鐘トリガー (動機 + 共犯場所) | 3 鐘トリガー (動機 + 共犯場所 + 場所1) | C10 トリプル化 |
| evalPlace1 | (不在、binary) | c10 ? hit : (c8 ? pending : false) | 関数化 + 3 値化 |

v08 で完遂した「章間 chord 2 ペア」を**そのまま維持**しながら、第 3 chord ペアを 1 ペア + 双方向化 + chord 種別を 1 種類追加 = R-D 守破離の **守の延長** (破ではない)。

## 3. セルフプレイ予測 vs 実測

**予測 (predicted_play.md §2-5)**: 4 シナリオで chord 3 発火経路を Mental Simulation した。

**実測 (Phase 4 セルフプレイ — コード目視シミュレーション)**:

### シナリオ A: 標準プレイ (全 CLUE 既読 → 推理)

- 章 1 CLUE 5 件読了 (C3 [補強], C10 [補強] 含む) → 章 1 推理 → 即 3 鐘 ♪ → 章 2 アンロック
- 章 2 CLUE 5 件読了 (C7 [補強], C8 [補強], C9 [補強] 含む) → 章 2 推理 → 即 3 鐘 ♪
- 合計 ~165 秒。chord 経路は通るが「同時鳴り直し体感」は出ない (推理時点で全決定打既読)

### シナリオ B': chord 3 自然発火 (C10 後回し + C8 経由)

- 章 1 CLUE C1, C2, C3, C4 読了 (**C10 未読**) → 章 1 推理 → 動機 ⏸ (c3 経路) + 場所 ✗ (c10=F + c8=F) + 容疑者 ♪ → 1/3 鳴る、章 2 アンロックされず
- C10 を遡って既読化 → reDeduceCh1 → **動機 ⏸→♪ + 場所1 ✗→♪ 同時遷移 (章 1 内 chord 1+3 自己内発火、C10 が 2 鐘同時遷移)** → 3 鐘 ♪ → 章 2 アンロック
- 章 2 CLUE C5, C6, C8, C9 読了 (C7 未読) → 章 2 推理 → 共犯者 ♪ (chord 2 経由 C3) + 共犯動機 ♪ + 共犯場所 ♪
- 合計 ~145 秒。C7 未読のまま 6/6 到達 + 章 1 内 chord 自己内発火 (動機+場所1 同時遷移) = v09 独自の自然経路

### シナリオ C': chord 3 cross-back 体感 (C8 を chord 3 cross-back で観察)

- 章 1 CLUE C1, C2, C3, C4 読了 (**C10 未読**) → 章 1 推理 → 動機 ⏸ + 場所 ✗ + 容疑者 ♪ → 1/3
- C10 click → 3 鐘 ♪ → 章 2 アンロック
- C10 unclick → 動機 ⏸ + 場所 ✗ (戻る、章 2 アンロック維持)
- 章 2 CLUE C5, C6 のみ読了 (C7, C8, C9 全て未読) → 章 2 推理 → 共犯者 ♪ (chord 2 経由 C3) + 共犯場所 ✗ (c8 未読) + 共犯動機 ♪
- **C8 click → reDeduceCh1 (場所1 ✗→⏸) + reDeduceCh2 (共犯場所 ✗→⏸) 同時遷移** ← **chord 3 ペア両方 pending 化型 chord ピーク**
- C10 re-click → reDeduceCh1 (動機 ⏸→♪ + 場所1 ⏸→♪) + reDeduceCh2 (共犯場所 ⏸→♪) ← **chord 1+3 三重和音 (3 鐘同時遷移、C10 トリプルトリガー)**
- 合計 ~140 秒。chord 3 両方 pending 化型 と C10 トリプルトリガーを意図的観察

### シナリオ D': chord 1 + 2 + 3 完全観察 (意図的)

- 章 1 CLUE C1, C2, C4 読了 (C3, C10 両方未読) → 章 1 推理 → 動機 ✗ + 場所 ✗ + 容疑者 ♪
- C3 click → 動機 ⏸; C10 click → 動機 ♪ + 場所 ♪; C10 unclick → 動機 ⏸ + 場所 ✗; C3 unclick → 動機 ✗ + 場所 ✗ (章 2 アンロック維持)
- 章 2 CLUE C5, C6 のみ読了 → 章 2 推理 → 共犯者 ⏸ + 共犯場所 ✗ + 共犯動機 ♪
- **C8 click → reDeduceCh1 (場所1 ✗→⏸) + reDeduceCh2 (共犯場所 ✗→⏸)** ← chord 3 両方 pending 化
- **C3 click → reDeduceCh1 (動機 ✗→⏸) + reDeduceCh2 (共犯者 ⏸→♪ via chord 2)** ← chord 2 ペア
- **C10 click → reDeduceCh1 (動機 ⏸→♪ + 場所1 ⏸→♪) + reDeduceCh2 (共犯場所 ⏸→♪)** ← chord 1+3 三重和音
- 合計 ~140 秒。chord 全 3 ペアを順番に意図的観察するプレイヤー向け

### 反例検証

- C10 未読 + 場所 Y → evalPlace1: c10=F, c8=F → 鳴らない ✓ (v08 から regression、設計通り)
- C10 未読 + C8 既読 + 場所 Y → evalPlace1: c10=F, c8=T → ⏸ ✓
- C10 既読 + C8 未読 + 場所 Y → evalPlace1: c10=T → ♪ (chord 3 経由せず C10 単独で hit) ✓
- 場所 X / Z → evalPlace1: wh !== Y → 鳴らない ✓
- chord 1 ペア (C10 → 動機 + 共犯場所) 回帰なし: シナリオ A / B' / D' で確認 ✓
- chord 2 ペア (C3 → 動機 + 共犯者) 回帰なし: シナリオ B' (C3 既読経路) / D' で確認 ✓
- CLUES_CH2 で C7/C9 click は reDeduceCh1 を呼ばない (`c.id === 8` のみ) ✓
- chapter1Cleared = false の時、CH2 click は短絡 ✓

## 4. v01-v09 9 サイクル所要時間比較

| サイクル | 構造 | 鐘数 | 実装時間 (Phase 4) | プレイ時間 (シミュ) |
|---|---|---|---|---|
| v01 | 1 章 / 1 鐘 | 1 | ~15 分 | 35 秒 |
| v02 | 1 章 / 3 鐘 | 3 | ~15 分 | ~35 秒 |
| v03 | 2 章 / 3+1 鐘 | 4 | ~15 分 | ~170 秒 |
| v04 | 2 章 / 3+3 鐘 | 6 | 12 分 | ~230 秒 |
| v05 | 6 鐘 + 場所鐘 3 値化 (局所非対称) | 6 (3 値 1) | ~22 分 | ~200 秒シミュ |
| v06 | 6 鐘 + 3 値鐘 1 つずつ (章間再対称化) | 6 (3 値 2) | ~25 分 | ~155 秒シミュ |
| v07 | 6 鐘 + 章間 chord 1 ペア | 6 (3 値 2) | ~20 分 | ~120-135 秒シミュ |
| v08 | 6 鐘 + 3 値鐘 3 つ + 章間 chord 2 ペア | 6 (3 値 3) | ~25 分 | ~140-160 秒シミュ |
| **v09** | 6 鐘 + 3 値鐘 4 つ + 章間 chord 3 ペア + 双方向化 + 両方pending化型 | 6 (3 値 4) | ~30 分 | ~140-165 秒シミュ |

**所要時間考察**: v09 は v08 ベースに **~65 行追加** = 30 分かかった (v08 ~55 行追加・25 分から微増)。差分が増えたのは: (1) evalPlace1 新規追加 + deduceChapter1 / reDeduceCh1 改修、(2) CLUES_CH2 ハンドラに ch2→ch1 cross-back 追加 (新方向)、(3) renderResult1 の pending 表示拡張 (場所 pending 対応)、(4) UI 説明文に chord 3 + 双方向化 追加。v07/v08 までに形成した抽象構造 (`evalXxx` パターン) を**そのまま 1 種類複製するだけ**で実装可能だった点は v08 と同様、evalWhy パターンを完全並列で evalPlace1 として複製できた = v07-v08 で確立した chord 抽象が v09 chord 3 で再利用された。

**9 サイクル累積考察**: v01 で `evalXxx` / `reDeduceXxx` 構造を持っていなかったら、v09 の chord 3 は 100+ 行差分になっていた可能性が高い。v05 で `evalPlace2` を切り出した抽象化、v07 で chord 1 ペア構造を確立、v08 で chord 2 ペアで章間連鎖網最小単位を確立した抽象化が、v09 で **「evalPlace1 を 1 つ追加 + reDeduceCh1 に re-eval 追加 + CH2 ハンドラに `c.id === 8` 1 行追加」** だけで chord 3 ペア + 双方向化が載る形を作り出した。

v07 §4「reusable abstractions」反例継続強化 9 サイクル目。sense_prediction_log Observation 3「分析→翌サイクル実装」経路は v08 §7 (b) 候補 → v09 実装で再現確認 (3 サイクル連続)。

**v09 独自進化**: chord 種別が 1 種類 (両方 hit 型) から 2 種類 (両方 hit 型 + 両方 pending 化型) に増加 = chord の抽象空間が 1 次元拡張。chord 方向性が一方向 (ch1→ch2) から双方向 (ch1↔ch2) に拡張 = 章間連鎖網の対称性が「縦の対称」から「縦+横の対称」に進化。

## 5. R-A 自己判定 1 文

**v08 の「章間 chord 2 ペア (C10 + C3 の ch1→ch2 一方向 chord)」構造を一切壊さず、章 2 C8 を章 1 場所鐘の chord 3 cross-back 補強に兼任させる第 3 chord ペアを最小差分 ~65 行で追加することで、確信フィードバックは v08 の「頂点 5 段」から「頂点 6 段 (うち章間連鎖網 3 ペア + 双方向 + 両方pending化型 chord 種別追加)」へ拡張され、章間が「対称 + chord 2 ペア (連鎖網最小単位)」から「対称 + chord 3 ペア + 双方向化 + chord 種別 2 種混在」の新しい関係性に進化した (R-A 違反なし、強化方向 + R-D 守の延長維持、C10 が 2 鐘トリガーから 3 鐘トリガーへトリプル化)。**

## 6. 単独運用テスト URL (v05 から継承)

3 チャネル (色 / 記号 / テキストラベル) 単独運用テスト用 URL クエリパラメータ `?channel=` を v05 から完全継承:

- `index.html` → 3 チャネル全表示
- `index.html?channel=color` → 色のみ
- `index.html?channel=symbol` → 記号のみ
- `index.html?channel=text` → テキストラベルのみ

v09 で章間 chord 3 ペア + 双方向化されたので、`?channel=color` 単独運用時に **C8 既読化で章 1 場所鐘1 + 章 2 共犯場所鐘の背景色が同時に pending (青枠) に遷移** するか観察できる材料が増えた。`?channel=symbol` 単独運用時には ✗ → ⏸ → ♪✓ 遷移が記号レベルで観察可能、chord 3 両方 pending 化型 chord として現れる。

## 7. v10 候補 (v09 以降)

- (a) v01-v09 一括試遊依頼を Nao_u に出す (R-A「他者評価ループ復元」、v06 §6 から 4 サイクル持ち越し、v09 で chord 3 ペア化 + 双方向化が成立したので「9 サイクル積み上げが 1 つの作品として鳴るか」を他者判定取りたい時期、本サイクル時点では GitHub Pages 公開 URL 不在で試遊リンク不可)
- (b) chord 4 ペア化 (完全網): 6 鐘すべてが少なくとも 1 つの章間 chord に参加する形 = 章間連鎖網の完全形。v09 で 3 ペア成立した chord 構造を 4 ペアに拡張する一手前
- (c) chord 演出強化: chord 発火瞬間の演出 (画面フラッシュ / 鐘の音響 / 紐付き線描画) で同時鳴り直し体感を視覚強化 (v07 §7 (f) / v08 §7 (d) 継承、v09 で chord 3 ペアが定着したので導入推奨タイミング)
- (d) 3 値化の完全対称化: 全 6 鐘を 3 値化 (現状 4/6 = 動機/場所1/場所2/共犯者) → 6/6 = 容疑者鐘・共犯動機鐘 も 3 値化
- (e) 章 3 追加: R-D 守破離の破にあたるので慎重判定、v09 chord 3 ペア + 双方向化が安定したので章 3 + chord 3→4 連鎖で連鎖網を更に伸ばす射程
- (f) 鐘の種類拡張: 「時刻鐘」(when?) を追加して 6 鐘 → 8 鐘
- (g) chord cross-back の標準化: v09 で導入した ch2→ch1 方向の cross-chord を一般化、CH1 / CH2 双方の click handler を「他章 deduce 済みなら他章 reDeduce を発火」型に統一 (実装 1 行差分で済む)

優先度: (a) > (b) > (c) > (d) > (g) > (e) > (f)。(a) は v06 §6 から 4 サイクル持ち越し、v09 で chord 3 + 双方向化が成立したので「9 サイクル積み上げが一作品として鳴るか」を試遊で確認する自然なタイミング (GitHub Pages 公開化が並走必要)。(b) は v07 chord 1 → v08 chord 2 → v09 chord 3 の最小差分パターンが 3 サイクル連続確立、4 ペア目も同パターン適用可、ただし「章間連鎖網を伸ばし続ける」だけでは新しい体感が出にくくなる懸念が v08 §7 で予測済 → (c) chord 演出強化が並走する形が良い射程。
