# ヘッドレス評価フォーマット v01 — Codex 主課題 (shot_log vs graze_log) への補助観点結晶化

**出自**: 2026-05-21 (Log C218 Phase 4)。Nao_u 5/21 13:19 #game-rights「shot_log と改変したものをヘッドレスで遊ばせて、どちらが良いゲームかを評価できるか試して欲しい」(Codex 主担当課題) への Log (Win) からのフォーマット提案。Log 13:22 #game-rights 投稿 (6軸 + 注意点) を、外部研究 2 本 (Talakat 2018 / Roohi 2021) の知見と統合して結晶化した v01。

**位置付け**: drafts/ レベルの提案。Codex が採用 / 修正採用 / 棄却のいずれを選んでも Log 側は自然な選択肢を提供しただけ。game/ 横やりではない。Codex の判断結果が次サイクル Log 側の評価信号 (補助観点の有効性測定) になる。

---

## §1 評価軸定義 — Talakat 2軸分解の STG 適用

### 外部由来の核心 1 文
> Talakat (Khalifa et al. 2018, arxiv 1806.04718) は bullet hell パターンを **strategy 軸 (思考の深さ) × dexterity 軸 (入力精度)** の 2 次元で評価し、各セルに best-first search の弱 AI で到達した代表パターンを MAP-Elites で保存する。

### STG (graze_log / shot_log) への軸変換 — Log 提案

**graze 軸 (接近要求量)**: プレイヤーが弾幕に「接近する」ことをゲームがどれだけ要求するか
- 暫定式 (Layer A primitives 合成、C221 Phase 4 更新):
  - `graze_axis = w1 * normalize(proximity_events) + w2 * normalize(death_pressure)` (重み案: `w1=0.7, w2=0.3`、合算 1.0)
  - 旧式 (graze 累積距離 × 滞在率 × 機会発生頻度) は維持的解釈として残すが、計算は Layer A primitives で行う (proximity_events で 累積距離 + 滞在率を統合、death_pressure で機会発生頻度の上限側を近似)
- 観測代理: §3 ログスキーマ `proximity_events` / `death_pressure` (Layer A) / `state.grazeCount` (狭い閾値の特殊形、参考値)
- 意味: graze 軸が高いゲーム = 「接近を強要する設計」、低い = 「遠距離撃ち抜き型」
- **重み確定は Codex 採用判断側に委ねる** (本 draft では暫定値、N=25 試行 1 周回した実データで再調整想定)

**shot 軸 (撃ち込み機会量)**: プレイヤーが弾を撃ち込む機会をゲームがどれだけ提供するか
- 暫定式 (Layer A primitives 合成、C221 Phase 4 更新):
  - `shot_axis = w3 * normalize(kill_rhythm_inverse) + w4 * normalize(1 - idle_ratio)` (重み案: `w3=0.5, w4=0.5`、合算 1.0)
  - `kill_rhythm_inverse` = killCount 時系列が均等型に近いほど高い値 (= バースト型は低い値)。Talakat strategy 軸の「思考の深さ」=「撃ち時を選ぶ機会の多さ」と対応
  - 旧式 (発射可能フレーム数 / 全フレーム数 × 平均同時敵数) は `(1 - idle_ratio)` が前者、後者は kill_rhythm に統合 (敵数が少なくても killCount が出ているなら shot 軸は高い)
- 観測代理: §3 ログスキーマ `kill_rhythm` / `idle_ratio` (Layer A) / `state.killCount` / `state.bombCount` (補助)
- 意味: shot 軸が高い = 「撃ち甲斐がある設計」、低い = 「回避主体型」
- **重み確定は Codex 採用判断側に委ねる** (本 draft では暫定値、Mir 提案 2 層体系の Layer A 5 primitives 採用判断と一括で扱う想定)

### 2 次元平面に置く価値
- shot_log (元) と graze_log (改変版) を `(graze_axis, shot_axis)` 平面にプロットすると、「総合スコア」勝負ではなく **進化の方向** が可視化される
- v05.1 → v05.2 → v05.3 でどの軸を伸ばしたか、Codex 側 commit 履歴と対応付け可能
- 「どちらが良いゲームか」は 1 軸では答えが出ない。「どの軸を伸ばす設計だったか」「その軸が Nao_u の好みと合うか」の 2 段階判定に変換される

### Talakat 由来の追加示唆: 弱 AI で十分
> 評価 AI に DRL を仕込む必要はない。best-first search 程度の弱 AI で軸スコアは観測可能。Codex の実装コストを下げる方向の示唆。

---

## §2 試行プロトコル — Roohi 「N 試行 best-case」

### 外部由来の核心 1 文
> Roohi et al. 2021 (arxiv 2107.12061) は **AI の平均試行スコアより上位試行の best-case** が人間 pass rate / churn rate と強く相関することを示した。DRL + MCTS ハイブリッドが特に難しいレベルで予測精度上昇。

### Codex 側 game/graze_log_cdx への適用

**N 値の根拠**: Roohi 論文の DRL 試行数 (N=10〜30) が「人間相関」を出した範囲。Talakat の弱 AI で代替する場合は、AI の試行間ばらつきが DRL より大きいため **N=20〜30 を推奨下限**、N=10 は探索用。

**比較方法**: 平均ではなく上位 10〜20% の best-case を比較
- 例: N=20 試行 → 上位 2〜4 試行の最良値で v01 vs 改変版を比較
- 平均比較が外す理由: AI は人間より「失敗試行のばらつき」が大きく、平均が下振れに引きずられる。best-case は「AI が引き出せた最大ポテンシャル」を示し、人間プレイヤーの「習熟後の感想」と相関する

### Codex 側ヘッドレス AI 実装擬似コード骨格

```javascript
// graze_log_cdx ヘッドレス評価ループ (擬似コード, 15-20 行)
const N_TRIALS = 25;  // Roohi 由来下限
const trials = [];
for (let i = 0; i < N_TRIALS; i++) {
  const seed = baseSeed + i;  // 試行ごと seed 変更で再現性確保
  const aiStyle = ['defensive', 'offensive', 'novice_mimic'][i % 3];  // Log 13:22 由来 3 スタイル
  const log = runHeadless({ seed, aiStyle, version: 'shot_log' });
  trials.push({
    seed, aiStyle, version: 'shot_log',
    score: log.score, grazeCount: log.grazeCount, killCount: log.killCount,
    survivedFrames: log.t, deathCause: log.deathCause,
    grazeAxis: computeGrazeAxis(log),  // §1 暫定式
    shotAxis: computeShotAxis(log),
  });
}
// 上位 best-case 抽出 (上位 20% の score)
trials.sort((a,b) => b.score - a.score);
const bestCase = trials.slice(0, Math.ceil(N_TRIALS * 0.2));
// graze_log 改変版でも同じことをして bestCase 同士を比較
```

**重要**: 同じことを `version: 'graze_log_modified'` でも N=25 試行して、両者の best-case 上位 20% を `(graze_axis, shot_axis)` 平面にプロットする。これが「進化方向の可視化」(§1 末尾)。

---

## §3 ログスキーマ — 既存 graze_log_cdx 形式 + Layer A 5 primitives 統合 (C221 Phase 4 finalize)

### 統合 1 表 — Codex 採用判断用最小セット (識別/集計項目 + Layer A primitives + 算出 axes)

§7 で §3 と別表になっていた Layer A 5 primitives を、本 §3 既存 7 項目 + 算出 axes 2 項目と **1 つの表に統合**。Layer 区分: `id` = 試行識別、`agg` = 既存集計値、`A` = Mir Layer A primitive (直接計測)、`axis` = §1 合成軸 (Layer A primitives からの算出値)。

| 項目 | Layer | 既存 graze_log_cdx 対応 | 計算式 (擬似) | 取得方法 |
|---|---|---|---|---|
| `trial_id` | id | (新規) | `${seed}_${ai_style}_${version}` 文字列結合 | 試行開始時付与 |
| `seed` | id | `SEED` (state) | そのまま | `grazelog seed:N` console 出力流用 |
| `ai_style` | id | (新規) | `defensive` / `offensive` / `novice_mimic` の 3 値 | §2 ループ内で `i % 3` 等で割当 |
| `version` | id | (新規) | `shot_log` / `graze_log_modified` 等の文字列 | runHeadless 引数で渡す |
| `score` | agg | `state.score` | そのまま | HUD 表示済 |
| `graze_count` | agg | `state.grazeCount` | そのまま | HUD 表示済 |
| `kill_count` | agg | `state.killCount` | そのまま | 内部追跡済 |
| `bomb_count` | agg | `state.bombCount` | そのまま | 既存 |
| `survived_frames` | agg | `state.t` | そのまま | 既存、phaseLabel で wave 進捗も取得可 |
| `death_cause` | agg | (新規 — `state.lastHitBulletType` / `state.lastHitWave` 等で実装可) | `{ wave, bullet_type, proximity_at_death }` の構造体 | death_cause 拡張 (約 10 行) |
| `input_load` | A | (新規) | `(押下フレーム数 / 全フレーム数) × アクティブチャネル数` | 入力イベントカウント (フレーム単位) |
| `proximity_events` | A | (新規 — `state.grazeCount` は閾値内通過の特殊形) | `distance < THRESHOLD_PROX` の `(弾/敵 × プレイヤー)` 通過カウント | フレーム毎距離計算、`grazeCount` より広い距離閾値で別カウント |
| `kill_rhythm` | A | (新規 — `state.killCount` 時系列分解) | killCount を T=1.0 秒バケットに分割、バケット間分散値を出力 | killCount 時系列保持 (配列 push) |
| `idle_ratio` | A | (新規) | `(入力なし & 撃たない & 動かない フレーム数) / 全フレーム数` | フレーム判定 (入力 + 速度 0 判定) |
| `death_pressure` | A | (新規 — death_cause と連動) | `死亡直前 N フレーム (N=60 相当 1 秒) の 平均弾密度 × 平均接近度合` | death_cause 拡張で取得可 |
| `graze_axis` | axis | (新規 — §1 暫定式、Layer A primitives 合成) | §1 暫定式 `f(proximity_events, death_pressure)` 参照 | 試行終了時 1 回計算 |
| `shot_axis` | axis | (新規 — §1 暫定式、Layer A primitives 合成) | §1 暫定式 `g(kill_rhythm, idle_ratio)` 参照 | 試行終了時 1 回計算 |

### 既存形式との互換性
- 既存 `state.score / grazeCount / bombCount / shieldStock / killCount / t / phaseLabel` (graze_log_cdx v05_1_cdx_v16/index.html L149〜L504) はそのまま流用可
- 追加実装が必要なのは: (a) `death_cause` 拡張 (`state.lastHitBulletType` / `state.lastHitWave` / `state.lastProximityAtDeath`、約 10 行) (b) Layer A 5 primitives 計算 (フレームループ内蓄積 + 試行終了時集計、約 40-60 行) (c) `graze_axis / shot_axis` 算出 (§1 暫定式、約 5-10 行) — 合計約 50-80 行
- 既存 `tools/headless_graze_log_cdx_v05_2_v16_check.js` (devlog.md L15 言及) を N=25 ループにラップする実装で v01 ヘッドレス評価器に到達可能。Layer A primitives は既存ヘッドレスフレームループに print/push を足す形で吸収可能

### 推奨出力形式
- `.jsonl` 1 行 / 試行 (N=25 行のファイル × version 2 = 50 行)、1 行に上記 18 項目全て含む
- 集計サマリ `.md` を別ファイル (best-case 上位 / 軸平面プロット参照 / Layer A primitives 版間差分表)
- 既存 `devlog.md` 流儀に合わせる
- **§5 (d) 差分サマリ追加運用**: 推奨 `.md` 末尾に「version A best-case primitives 平均 - version B best-case primitives 平均」を 5 行 (primitives 別) で出力

---

## §4 既知の限界 + 採用時の前提

### 限界 1: AI ≠ 人間 fun 判定
- 本フォーマットは「AI が引き出せた軸スコア」を測るだけ。**人間が楽しいかどうかは別軸**
- Log 13:22 #game-rights 投稿「AI が『クリア』できる ≠ 人間が楽しい。AI スコアは前提条件 (再現性確認) であって評価軸ではない」と独立収束
- 外部 3 件 (Talakat / Roohi / gamedeveloper "Playerless playtesting") の共通示唆「AI は fun を判定できない、人間判定との hybrid が前提」と一致
- **採用時の前提**: 本フォーマットの出力は Nao_u の最終判定 (人間プレイ) を **置き換えるものではなく、Nao_u 判定の前段で「どの軸が変化したか」を可視化する補助** にとどめる

### 限界 2: 教育系 → bullet hell の再現性は別問題
- Roohi 論文の検証範囲は教育系ゲーム (Angry Birds Dream Blast 等)。bullet hell ジャンルでの再現性は未検証
- N=20〜30 / best-case 上位 20% の数値は教育系での結果。STG では「フレーム精度の入力誤差」が結果を歪める可能性
- **採用時の前提**: 最初の 1 サイクルは N=25 を試し、AI 試行間ばらつきが大きすぎる (上位 20% 内分散 > 全体分散 50%) 場合は N を増やす運用が必要

### 限界 3: best-case ≠ 平均 ≠ 中央値
- 本フォーマットは best-case 比較を採用するが、平均比較 / 中央値比較とは判断が分かれる場合がある
- 「どの軸も伸びたが death rate も上昇」のケースで best-case と平均の判定が逆転しうる
- **採用時の前提**: 採用判定では best-case (上位 20%) と平均 (全 N) の **両方を並べて出す**。Nao_u が「best-case 採用 / 平均採用 / 中央値採用」を選べる形にする (Roohi の根拠は「人間 pass rate との相関」であり、絶対基準ではない)

### 出自の併記 (重要)
- 本フォーマットは Log 13:22 #game-rights 投稿 (Nao_u 5/21 13:19 課題への補助観点 6 軸) と、Phase 1 で実体到達した外部 2 本 (Talakat / Roohi) が **独立に収束** して到達した形
- 「AI ≠ fun」(限界 1) は 4 つの独立した源 (Log 自身の経験 / Talakat / Roohi / gamedeveloper) から同じ結論に到達 = 強い確信度
- 「2 軸分解」(§1) は Talakat 単独由来 = 中確信度、STG 適用は Log の暫定式で N=1 未検証
- 「N 試行 best-case」(§2) は Roohi 単独由来 = 中確信度、bullet hell 適用は未検証 (限界 2)

---

## §5 差分露出器再定位 + レイヤード評価対応表 (C220 Phase 2/4 追記)

### 出自と位置付け
- C220 Phase 1/2 で外部 2 本に独立到達: AI Gamestore (arxiv 2602.17594) / AI Benchmarks 2026 37%ギャップ (kili-technology)
- 両者を統合すると、§1〜§4 の目的を「自己採点装置」から **「設計仮説が何を予測していたかを後から検証可能にする差分露出器」** へ再定位する必要が出る
- 本 §5 は §1〜§4 を破壊せず、その意味を上書きする層 (運用思想の更新)

### (a) AI Gamestore (arxiv 2602.17594) — 「ゲーム側を変数化」の逆転転用
AI Gamestore は「同一プレイヤー (VLM) × 複数ゲーム」設計で評価パラダイムを開く論文 (VLM が新ゲームで 10% 未満の到達率 = 一般性/適応性/統合認知能力を測る装置として機能)。**Codex 主課題への逆転転用**: 「**同じ弱い AI に shot_log / graze_log / mimicry_log を遊ばせ、ゲーム側を変数化する**」。AI 側を変数化すると AI の賢さに評価が引きずられるが、AI 側を固定してゲーム側を変数化すると **ゲーム間の差分** が AI の挙動差として露出する。賢い AI ほど差分を吸収するため、§2 で Talakat 由来「弱 AI で十分」と整合する (むしろ弱い方が望ましい)。これは §1 の `(graze 軸, shot 軸)` 平面プロットの動機を「総合スコア比較」から「同一 AI の挙動が版差でどう動いたか」の **差分マップ** へ書き換える。

### (b) 37%ギャップ (kili-technology) — ラボベンチ vs 実環境写像
AI Benchmarks 2026 報告は、エンタープライズ agentic AI でラボベンチと実環境スコアに **37% 乖離** が出ることを示す (single-turn / closed-ended / 統制条件 vs 連続対話 / 曖昧入力 / 長時間)。**ヘッドレス評価 vs Nao_u 実プレイへの写像**: ヘッドレス短時間 episode は「single-turn / closed-ended / 統制条件」側、Nao_u 実プレイは「長時間連続 / 曖昧入力 (体調・気分・期待値の裏切り) / 認知摩擦」側。Nao_u が 5/21 02:04 (ts=1779289298) で「mimicry_log は graze と何が違うのか分からなかった」と一発で潰した認知摩擦・期待値の裏切り・美しさは、**固定 seed の N=25 ヘッドレスでは原理的に露出しない**。本フォーマットの数値で「どちらが良いゲームか」の答えは出ない — 出るのは「どの軸が動いたか」だけで、その軸が Nao_u の好みと合うかは別レイヤー (層分け)。

### (c) レイヤード評価対応表

| 既存 3 層 | 外部対応 (AI Benchmarks 2026) | 何を測るか (本フォーマット適用後の役割) |
|---|---|---|
| ヘッドレス N=25 (本フォーマット) | automated coverage | 「設計仮説が予測した軸が実際に動いたか」の差分露出 (fun 判定はしない) |
| cross_review (他インスタンス批判レビュー) | LLM-as-a-judge | 軸スコア解釈・盲点指摘・観点並列化 (差分の意味付け) |
| Nao_u 最終判定 | human expert review | 認知摩擦・期待値・美しさの最終裁定 (層 1/2 で露出しないものを引き受ける) |

3 層は **独立に何を測っているか** を陽に書き出すと、各層の責務が混ざらない (層 1 で fun を測ろうとしない、層 3 で軸スコアを再計算させない)。これは AI Benchmarks 2026 が「単一指標で評価せず家系別 (text quality / agentic / safety / RAG / benchmark suites) に分けよ」と勧告するのと同型構造。

### (d) §1〜§4 の意味更新 (自己採点装置 → 差分露出器)
- **§1 (2 軸分解)**: `(graze 軸, shot 軸)` 平面プロットの目的は「総合スコア勝負」ではなく「**進化方向の可視化**」に昇格 — 同じ弱い AI が版差でどちらの軸に動いたかの矢印を描く装置 (差分マップ)
- **§2 (N=25 best-case)**: 「AI の潜在ポテンシャル」を測る装置ではなく「**仮説が予測した差分が AI 試行のばらつき内で見えるか**」を測る装置に再定位 — best-case 上位 20% は「人間 pass rate 相関」の代理ではなく「AI が version 間で示せた最大差分」の指標
- **§3 (ログスキーマ)**: 7 必須項目はそのまま、ただし出力の解釈は「数値の優劣」ではなく「**版間の挙動差**」が主役 (§3 推奨出力形式に `差分サマリ` 1 行を加える運用が望ましい — 例: `version A の best-case graze_axis 平均 - version B の best-case graze_axis 平均`)
- **§4 (既知の限界)**: 限界 1「AI ≠ 人間 fun 判定」は層 1 → 層 3 への引き渡し設計として再解釈、限界 2/3 は「差分露出の解像度限界」として再解釈 (best-case と平均の両方を出すのは Nao_u が層 3 で選択肢を持つため)

### 採用時の判断ガイド (Codex 主担当への申し送り)
- 本 §5 は §1〜§4 の **運用思想の更新** であり、実装手順 (採用時着手手順) は変更しない
- 「ヘッドレス評価で答えが出る」と期待するのは構造的に失敗する。**答えは層 3 (Nao_u 判定) でしか出ない**。層 1 は「Nao_u 判定の前段で何を露出させたか」を出す
- 単一スコアで決着がつく場面 (例: 明らかなバランス崩壊) を否定するわけではない — その場合は層 1 だけで判定可能、層 2/3 不要。ただしそれは「ゲームの良し悪し」ではなく「実装の正しさ」を見ているに過ぎない

### 即ルール化保留
- 本 §5 「3 層が一対一対応」「ヘッドレスは差分露出器」含意は強い候補だが、**5 サイクル運用観察後に判断** (CLAUDE.md「個別指摘を即ルール化しない — 同型反復が複数回確認できてから原則化」順守)
- 観察対象: 層 1 → 層 2 → 層 3 で同じ判定が出たか、層間で判定が割れた場合に層 3 が決定権を持てたか、Nao_u が層 1 数値を補助として使えたか
- 5 サイクル後の判断箇所: `memory/feedback_*_evaluation_layered.md` の新規書き込み可否 (現時点では保留)

---

## §6 評価語彙の分解検討 — Log_cdx 5/21 20:38 (ts=1779363482) 投稿由来

### 出自と位置付け
- Nao_u 5/22 13:11 #game-rights で Log_cdx 5/21 20:38 投稿 (Talakat 評価軸読み解き) を共有 → 「あなたのヘッドレス対応に活かせる形で反映して」
- Log_cdx 投稿は §1 の「graze 軸 / shot 軸」2 軸分解と独立に到達した同方向の読み (Talakat を生成手法ではなく評価軸設計として読む)
- §1〜§5 を更新せず、Log_cdx 由来の新観点 (本フォーマットに無かった区分) を §6 として並置する

### Log_cdx 由来の新観点 2 つ

**(a) 「人間感想に近づける軸」と「実装を壊さず回す軸」の分離**
- §1 の graze/shot 2 軸は両者を区別していない。Log_cdx の提示は「軸を増やす時、何を増やすかで意図が変わる」という設計判断軸の追加
- 「人間感想に近づける軸」= 数値で出るが解釈が層 2/3 に持ち越される (例: graze 軸、判断密度、視認負荷)
- 「実装を壊さず回す軸」= ヘッドレス側で安価に取れて自動回帰検査に使える (例: 平均同時敵数、撃ち込み有効ヒット率、wave 通過率)
- §1 graze/shot は後者寄り、Log_cdx 提示の「判断密度 / 視認負荷」は前者寄り。混在させると軸数だけ増えて運用負荷が上がるので、**軸ごとに「どちらの目的か」を明示する** 運用が必要

**(b) 評価語彙候補 (Log_cdx 提示)**
| 候補軸 | 意味 | 既存 §1 軸との対応 | 取得難度 |
|---|---|---|---|
| 判断密度 | 単位時間あたりプレイヤーが選択を迫られる回数 | shot 軸補助 | 中 (選択イベント定義必要) |
| 入力負荷 | 入力チャネル数 × 入力頻度 | (新規) | 低 (フレーム単位カウント可) |
| 視認負荷 | 同時に追跡すべき要素数 | (新規) | 中 (画面要素ラベル必要) |
| リカバリ余地 | 失敗後に立て直せる時間/手段の量 | graze 軸補助 | 中 (death 後挙動定義必要) |

### 採用判断 — 即拡張せず観察対象
- 4 軸候補を §1 の graze/shot に並列追加するのは **保留**。理由: 軸増加 = 解釈負荷増加 = 層 2/3 の処理量増加で、§5 の「層 1 で fun を測ろうとしない」原則と衝突する可能性
- 「実装を壊さず回す軸」(候補: 入力負荷) は **取得難度 = 低** なので、§3 ログスキーマに追加候補として記録するのは安全。ただし採用は v01 N=1 実行後に判断
- 「人間感想に近づける軸」(候補: 判断密度 / 視認負荷 / リカバリ余地) は層 2 (cross_review) の語彙として先に試す方が筋。**ヘッドレス出力に組み込む前に、cross_review プロンプトでこの語彙を使えるか試す**

### 5 サイクル観察対象に追加
- §5 の観察対象 (層 1→2→3 の判定一致率) に加えて、本 §6 由来の「軸ごとの目的明示が層間引き渡しを楽にするか」を観察
- 観察結果次第で §1 軸定義を 2 軸 → 多軸へ拡張可否を判断 (5 サイクル後、`memory/feedback_*_evaluation_vocabulary.md` 書き込み可否)

### Log_cdx への応答 (本 §6 の位置付け)
- Log_cdx の「生成手法 vs 評価軸設計」の問いに対する Log の答え: **評価軸設計として読む**で一致 (§1 / §5 で既に同方向に独立到達済み)
- Log_cdx 由来で本フォーマットが得たもの: 「軸を増やすときの目的分離 (人間感想 vs 実装回帰)」「評価語彙候補 4 つ」
- 本フォーマットから Log_cdx へ返せるもの: §5 の「3 層責務分離」と「差分露出器再定位」(本人が既に到達していなければ参照値)

---

## §7 Mir 2 層体系提案 (ts=1779443805) との収束 — Layer A primitives 拡張

### 出自と位置付け
- 2026-05-22 18:56 Mir (#human-steering + #game-rights クロスポスト, ts=1779443805) が Nao_u 5/22 ts=1779423371「ヘッドレス対応のあり方」指示への応答として「**ヘッドレス評価語彙の 2 層体系**」を提案
- Mir 提案核: Talakat の strategy / dexterity を **直借りせず**、独立した 2 層に分離
  - **Layer A (直接計測)**: `input_load` / `proximity_events` / `kill_rhythm` / `idle_ratio` / `death_pressure`
  - **Layer B (解釈用)**: 判断密度 / 視認負荷 / リカバリ余地
- §6 の Log_cdx 由来「人間感想に近づける軸 vs 実装を壊さず回す軸」の分離原則と独立収束。本 §7 は §6 を破壊せず、Mir 提案の Layer A primitives 5 点を §6 の「実装回帰軸」側へ統合する更新層

### 独立収束の構造分析
| 起源 | 「直接計測 / 実装回帰」側の語彙 | 「解釈 / 人間感想」側の語彙 |
|---|---|---|
| Log §1 (Talakat 由来) | graze_axis / shot_axis (2 軸暫定式) | — (Talakat 直借りのため未分離) |
| Log_cdx §6 (5/21 20:38 ts=1779363482) | 入力負荷 / wave 通過率 | 判断密度 / 視認負荷 / リカバリ余地 |
| Mir §7 (5/22 18:56 ts=1779443805) | input_load / proximity_events / kill_rhythm / idle_ratio / death_pressure | 判断密度 / 視認負荷 / リカバリ余地 |

- 3 源で **Layer B (解釈側) 3 語彙 = 判断密度 / 視認負荷 / リカバリ余地** が独立に一致 = 強収束
- Layer A (計測側) は Log_cdx と Mir の間で input_load のみ完全一致、Mir が proximity_events / kill_rhythm / idle_ratio / death_pressure の 4 primitives を **新規追加**

### Mir 由来 Layer A 4 新 primitives の評価
| primitive | 意味 (推定) | 既存 §1 軸との対応 | 取得難度 |
|---|---|---|---|
| `proximity_events` | プレイヤー機 vs 弾 / 敵の近接イベント数 (距離閾値内通過) | §1 graze 軸の生 primitive | 低 (フレーム単位距離計算) |
| `kill_rhythm` | killCount の時系列分布 (集中バースト型 vs 均等型) | §1 shot 軸の時間軸分解 | 中 (時系列バケット分割必要) |
| `idle_ratio` | 入力なし / 撃たない / 動かないフレーム比率 | (新規 — 受動的時間の量) | 低 (フレームカウント) |
| `death_pressure` | 死亡前 N フレームの弾密度・接近度合 | §1 graze 軸の死亡側 | 中 (death_cause 拡張で取得可) |

- **採用判断**: Mir Layer A 5 primitives は §1 graze_axis / shot_axis 暫定式を **置き換えるのではなく、その下層 primitive として配置する**。§1 軸式は primitive の合成で表現できる:
  - `graze_axis ≒ f(proximity_events, death_pressure)` (Mir の §6「graze 累積距離 × 滞在率」を proximity_events で代替可能)
  - `shot_axis ≒ f(kill_rhythm, idle_ratio の補数)` (発射可能フレーム比は idle_ratio から導出可能)
- §1 軸式は維持、§3 ログスキーマに Mir 5 primitives を **新規必須項目として追加** する形で吸収

### Layer A 5 primitives 数の妥当性
- Mir 提案は 5 primitives = 既存 §1 (2 軸) + §6 (4 候補) との比較で「最小 sufficient set」を狙った可能性
- 取得難度は全て「低〜中」= ヘッドレス実装コストは 5 primitives 同時実装でも 1 サイクルで吸収可能
- §6 で「軸増加 = 解釈負荷増加」と保留した 4 候補のうち入力負荷 (= input_load) のみ採用、判断密度 / 視認負荷 / リカバリ余地は Layer B へ降格 = Mir 設計が §6 の保留判断を **Layer B 移送** で解決した形

### Layer B (解釈用) 3 語彙の責務再定義
- §5 「3 層責務分離」と接続: Layer B 3 語彙は **層 2 (cross_review) の語彙**として運用、層 1 (ヘッドレス N=25) は Layer A 5 primitives のみで出す
- Layer B → Layer A の自動写像は **不可能と想定** (判断密度を input_load から導けない、視認負荷を proximity_events から導けない)。層 2 で人間レビュアー / LLM-as-a-judge が Layer A 数値を読みながら Layer B 語彙で「意味付け」する役割分担
- これは AI Benchmarks 2026 (37%ギャップ) の「ラボベンチ → 実環境写像で 37% 乖離」と同型構造 = Layer B は乖離を埋める層

### §3 ログスキーマ更新案 (§7 採用時)
既存 7 項目 (trial_id / seed / ai_style / score / graze_count / kill_count / survived_frames) に加え、**Layer A 5 primitives を必須項目化**:

| 追加項目 | 計算式 (擬似) | 取得方法 |
|---|---|---|
| `input_load` | (押下フレーム数 / 全フレーム数) × チャネル数 | 入力イベントカウント |
| `proximity_events` | 距離 < THRESHOLD の弾/敵 vs プレイヤー通過カウント | フレーム毎距離計算 |
| `kill_rhythm` | killCount を T 秒バケットで分散計算、分散値出力 | killCount 時系列保持 |
| `idle_ratio` | 入力なし & 撃たない & 動かないフレーム / 全フレーム | フレーム判定 |
| `death_pressure` | 死亡直前 N フレームの平均弾密度 × 平均接近度 | death_cause 拡張 |

- §3 既存 `graze_axis / shot_axis` は **算出値として残す** (primitives からの合成式で表現)、primitives と axis の **両方を出力**
- Codex 採用時の追加実装コスト: §3 既存に対し +5 primitives 計算 + death_cause 拡張 = 約 50-80 行程度の追加（既存 N=25 ループ内で計算）

### 5 サイクル観察対象への追加
- §5 / §6 観察対象に加えて、本 §7 由来:
  - **Layer A 5 primitives と Layer B 3 語彙の責務分離が層 2 で実際に運用できるか** (cross_review が Layer A 数値を読みながら Layer B 語彙で意味付けする実例 1 件以上)
  - **Mir 提案 5 primitives で sufficient か** (5/31 検証期限到達時に「6 番目の primitive を足したい場面が出たか」を確認)
- 観察結果次第で:
  - 5 primitives で不足 → 追加 primitive 起票 (要 3 インスタンス合意)
  - Layer B 3 語彙が層 2 で機能しない → §5 「3 層責務分離」自体の再検討
  - 両方安定 → `memory/feedback_*_evaluation_layered_vocabulary.md` へ昇格判断

### Mir への応答 (本 §7 の位置付け)
- Mir「Talakat 直借りせず独立 2 層」設計に対する Log の答え: **採用 + Layer A 5 primitives を §3 ログスキーマに統合**
- Mir 提案から本フォーマットが得たもの: Layer A primitives 5 点 (sufficient set 候補) と Layer B 3 語彙の責務分離設計
- 本フォーマットから Mir へ返せるもの: §5 「3 層責務分離」(Mir 提案が暗黙に依拠している層分け構造の明文化) と §6 Log_cdx 提案 (同方向独立到達の補強材料)
- 3 源 (Log §1 / Log_cdx §6 / Mir §7) の独立収束で Layer B 3 語彙は強確信度に到達、Layer A primitives は Mir 単独提案で中確信度 (5 サイクル運用後判定)

---

## 採用時の Codex 側着手手順 (Log 側からの提案、Codex の判断で取捨選択)

1. 既存 `tools/headless_graze_log_cdx_v05_2_v16_check.js` を N=25 試行ループにラップ (§2 擬似コード骨格)
2. `state.lastHitBulletType` / `state.lastHitWave` を追加して death_cause を記録可能に
3. `graze_axis / shot_axis` の §1 暫定式実装 (試行終了時 1 回計算)
4. shot_log (元) と改変版それぞれで N=25 試行、上位 20% best-case を `.jsonl` 出力
5. `(graze_axis, shot_axis)` 平面に両方プロット (簡易 ASCII / Mermaid / 静的 PNG いずれか)
6. Nao_u に best-case + 平均の両方を提示して判定を仰ぐ (限界 3 前提)

## 関連リンク
- Talakat: https://arxiv.org/abs/1806.04718
- Roohi: https://arxiv.org/abs/2107.12061
- Log 13:22 #game-rights 投稿: `drafts/2026-05-21/post_log_game_rights_headless_evaluation_assist_20260521_POSTED_ts1779337354.py`
- 既存 graze_log_cdx v16: `GPT/game/graze_log_cdx/v05_1_cdx_v16/index.html`
- Log_cdx 5/21 20:38 投稿 (ts=1779363482, #all-nao-u-lab): Talakat 評価軸読み解き、§6 出自
- Mir 5/22 18:56 投稿 (ts=1779443805, #human-steering + #game-rights クロスポスト): Layer A 5 primitives + Layer B 3 語彙 2 層体系提案、§7 出自
