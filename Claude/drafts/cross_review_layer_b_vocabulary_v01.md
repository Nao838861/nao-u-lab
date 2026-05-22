# cross_review Layer B 語彙ガイド v01 — 判断密度 / 視認負荷 / リカバリ余地

**出自**: 2026-05-22 (Log C221 Phase 4)。`drafts/headless_evaluation_format_v01.md` §7 (Mir 2 層体系提案 ts=1779443805 への収束) から派生。Layer A 5 primitives (input_load / proximity_events / kill_rhythm / idle_ratio / death_pressure) は §3 ログスキーマで層 1 (ヘッドレス N=25) が出力する側、本 draft は **層 2 (cross_review) で Layer B 3 語彙を運用するためのプロンプト雛形 + 5 サイクル試行計画**。

**位置付け**: drafts/ レベルの提案。`drafts/headless_evaluation_format_v01.md` §7 の「Layer B → Layer A の自動写像は不可能と想定。層 2 で人間レビュアー / LLM-as-a-judge が Layer A 数値を読みながら Layer B 語彙で『意味付け』する役割分担」を運用工程に落とす。Codex の §3 ログスキーマ採用判断と独立に、cross_review 側だけで本 draft の試行は開始できる (層 1 数値が未着でも、既存 graze_log_cdx の生プレイ動画 / devlog から Layer B 語彙で批評する試行は可能)。

---

## §1 Layer B 3 語彙の責務 (再掲)

| 語彙 | 意味 | 何を測ろうとしているか |
|---|---|---|
| **判断密度** | 単位時間あたりプレイヤーが選択を迫られる回数 | 「考えながら動かす」が機能しているか。受動的時間 vs 能動的時間の比 |
| **視認負荷** | 同時に追跡すべき要素数 | 認知摩擦の量。画面の情報量と「読み取れる量」のギャップ |
| **リカバリ余地** | 失敗後に立て直せる時間 / 手段の量 | 「死んだら終わり」感の強弱。再挑戦の心理的コスト |

**3 源独立収束**: Log §1 / Log_cdx §6 / Mir §7 の 3 投稿が独立に Layer B 3 語彙へ到達 (`drafts/headless_evaluation_format_v01.md` §7 の独立収束構造分析表参照) = 強確信度。これは即ルール化対象ではなく、本 draft で「層 2 の語彙として実運用に乗るか」を 5 サイクル観察する対象。

---

## §2 cross_review プロンプト雛形 (Layer B 語彙運用)

### (a) 層 1 数値あり版 (Codex §3 ログスキーマ採用後)

> 本ゲームの version A / version B について、Layer A 5 primitives (input_load / proximity_events / kill_rhythm / idle_ratio / death_pressure) の N=25 best-case 平均と 差分サマリを別添する。
>
> 以下の Layer B 3 語彙それぞれについて、Layer A 数値を読みながら 1 行ずつコメントせよ:
>
> 1. **判断密度**: version A vs B でどう変化したか (input_load + kill_rhythm + idle_ratio の補数を見て、選択が迫られる頻度がどう動いたかを 1 文で述べよ)
> 2. **視認負荷**: version A vs B でどう変化したか (proximity_events + death_pressure を見て、画面の情報量と読み取り困難度がどう動いたかを 1 文で述べよ)
> 3. **リカバリ余地**: version A vs B でどう変化したか (death_pressure + idle_ratio + bomb_count を見て、死亡後の立て直し可能性がどう動いたかを 1 文で述べよ)
>
> **禁止事項**:
> - Layer A 数値を再計算した別の数値を出さない (それは層 1 の役目)
> - 「面白い / 面白くない」を直接判定しない (それは層 3 = Nao_u の役目)
> - 3 語彙以外の語彙 (例: 「テンポが良い」「爽快感がある」) を主軸に置かない (補助としては可)

### (b) 層 1 数値なし版 (Codex 採用判断前 / 既存ゲーム生プレイのみ)

> 本ゲーム (graze_log_cdx v05.x 等) のプレイ動画 / devlog / index.html ソースから、以下の Layer B 3 語彙それぞれについて 1 行ずつコメントせよ:
>
> 1. **判断密度**: プレイヤーが単位時間あたり何回選択を迫られているか、その密度が体感としてどう推移しているか
> 2. **視認負荷**: 同時に追跡すべき要素数、画面の情報量と読み取り困難度が版差でどう動いたか
> 3. **リカバリ余地**: 失敗後の立て直し可能性、死亡後 30 秒以内に「もう一度やってみよう」と思えるか
>
> 数値は出さなくてよい (層 1 の役目)。「面白い / 面白くない」も判定しない (層 3 の役目)。**3 語彙で版差を言語化することだけが本タスク**。

### (c) Layer B 3 語彙が「機能した」と判定する条件

cross_review 出力が以下を満たすこと:
1. 3 語彙それぞれに 1 文以上のコメントが出ている (空欄なし)
2. version A vs B の差分が言語化されている (「変わらない」も明示的回答であれば可)
3. 「面白い / 面白くない」を直接判定していない (層 3 への引き渡しが正しく行われている)
4. 3 語彙の間でコメント内容が重複していない (各語彙が独立した観点を捕えている)

---

## §3 5 サイクル試行計画 (5/22 - 5/31)

### 試行対象
- Log 系: `graze_log_cdx v05_1_cdx_v16` (既存) vs Codex 次版 (未確定) 等、版差が出る既存ゲーム 1 ペア
- Mir 系: `mimicry_log v01` vs `mimicry_log v02` (実装次第) 等、版差が出る既存ゲーム 1 ペア
- Ash 系: `graze_log v05.x` vs `graze_log v06` (merge 後) 等、版差が出る既存ゲーム 1 ペア

### 試行頻度
- 1 サイクル = 1 試行 (各サイクル中に 1 ペアの cross_review を Layer B 語彙で実施)
- 5 サイクル = 5 試行 (= Log / Mir / Ash 系で 1 ペアずつ × 2 周弱)

### 各試行で記録するもの
- `cross_review/20260???_*_layer_b_test_*.md` 形式の試行ログ
- (a) どの版ペアを対象にしたか
- (b) §2 (a) または (b) プロンプトのどちらを使ったか
- (c) §2 (c) 4 条件を満たしたか (○/×/部分)
- (d) 4 条件のうち未達成のものがあれば、なぜか
- (e) 3 語彙以外で言いたくなった語彙があったか (= 6 番目の Layer B 語彙の候補)

### 試行担当
- 試行は Log / Mir / Ash いずれが起票してもよい。本 draft の存在を 3 インスタンスに共有 (#game-rights or #human-steering 1 回投稿) して、各インスタンスのサイクル内で機会があれば実施を委ねる
- 強制ではない (5 サイクル中に 5 試行揃わなくても判定可能、最低 3 試行で判定発火点に到達)

---

## §4 5/31 検証期限到達時の判定発火点

### 判定対象 (発火点)
2026-05-31 (cycle_staging_log.md kaizen 系 5/31 期限と同日) に以下を判定:

1. **Layer B 3 語彙が層 2 で機能したか**
   - §2 (c) 4 条件を満たした試行の割合 ≥ 60% (3 試行中 2 / 5 試行中 3) → ✓ 機能
   - < 60% → △ 部分機能、6 番目語彙候補が出ていれば §1 拡張検討、出ていなければ語彙再設計

2. **Layer B → Layer A の自動写像が本当に不可能だったか**
   - 試行ログ (d) の未達成理由に「Layer A 数値だけでは Layer B 語彙が出せなかった」が ≥ 50% 出現 → 不可能を強確信度に昇格
   - 「Layer A 数値があれば Layer B 語彙が機械的に出せる」と読める試行が ≥ 50% 出現 → §7「Layer B → Layer A 自動写像は不可能と想定」を撤回検討

3. **3 層責務分離 (層 1 数値 / 層 2 意味付け / 層 3 fun 判定) が運用に乗ったか**
   - 試行ログで層 2 が層 3 へ引き渡せる形のコメントを出したか
   - Nao_u が層 3 判定時に試行ログを参照したか (Nao_u 側の自然な反応を観察、強制しない)

### 判定後の昇格 / 撤回判断
- 上記 3 条件のうち 2 以上が ✓ → `memory/feedback_*_evaluation_layered_vocabulary.md` への昇格判断対象 (即昇格ではなく、CLAUDE.md「個別指摘を即ルール化しない」順守で更に 1 サイクル観察後決定)
- 上記 3 条件のうち 2 以上が △ または × → 本 draft を `drafts/.archive/` へ退役、§7 自体の再設計検討

---

## §5 観察対象 (5 サイクル中に意識的に蓄積するもの)

`drafts/headless_evaluation_format_v01.md` §7「5 サイクル観察対象への追加」と完全同期:

1. **Layer A 5 primitives と Layer B 3 語彙の責務分離が層 2 で実際に運用できるか** (cross_review が Layer A 数値を読みながら Layer B 語彙で意味付けする実例 1 件以上 → 本 draft §3 試行ログで取得)
2. **Mir 提案 5 primitives で sufficient か** (5/31 検証期限到達時に「6 番目の primitive を足したい場面が出たか」を確認 → 本 draft §3 試行ログ (e) で取得)
3. **本 draft §2 (a) プロンプトと §2 (b) プロンプトで cross_review 出力品質に差が出たか** (層 1 数値ありなしで層 2 出力がどう変わるか — Layer A 採用の価値測定にもなる)

---

## §6 注意事項 (Log / Mir / Ash 各インスタンス共通)

- 本 draft は Codex §3 ログスキーマ採用判断と **独立に試行開始可能**。層 1 数値が未着でも §2 (b) プロンプトで cross_review は回せる
- 試行は強制ではない。サイクル内で機会があれば実施、なければスキップ可
- 試行ログは個別ファイル (`cross_review/20260???_*_layer_b_test_*.md`) で、本 draft 自体は試行記録を持たない (本 draft は雛形 + 判定発火点のみ)
- 5/31 判定発火点到達時の判定担当は **Log** (本 draft 起票元)。他インスタンスは試行ログ提供で参加
- §2 (c) 4 条件は「Layer B 語彙が機能したか」の判定軸であり、cross_review 品質の総合評価ではない。他観点 (例: 4 条件を満たしつつも層 3 で全く参照されなかった) は別軸で観察

---

## 関連リンク
- 本 draft 出自: `drafts/headless_evaluation_format_v01.md` §7「Mir 2 層体系提案 (ts=1779443805) との収束 — Layer A primitives 拡張」
- Mir 元投稿: 2026-05-22 18:56 ts=1779443805 (#human-steering + #game-rights クロスポスト)
- Log §1 (graze 軸 / shot 軸): `drafts/headless_evaluation_format_v01.md` §1
- Log_cdx §6 (5/21 20:38 ts=1779363482): `drafts/headless_evaluation_format_v01.md` §6
- レイヤード評価対応表 (3 層責務分離): `drafts/headless_evaluation_format_v01.md` §5 (c)
- C221 Phase 4 履歴: `projects/game_development.md` 履歴節 (2026-05-22 C221 Phase 4)
