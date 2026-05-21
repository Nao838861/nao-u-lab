# ヘッドレス評価フォーマット v01 — Codex 主課題 (shot_log vs graze_log) への補助観点結晶化

**出自**: 2026-05-21 (Log C218 Phase 4)。Nao_u 5/21 13:19 #game-rights「shot_log と改変したものをヘッドレスで遊ばせて、どちらが良いゲームかを評価できるか試して欲しい」(Codex 主担当課題) への Log (Win) からのフォーマット提案。Log 13:22 #game-rights 投稿 (6軸 + 注意点) を、外部研究 2 本 (Talakat 2018 / Roohi 2021) の知見と統合して結晶化した v01。

**位置付け**: drafts/ レベルの提案。Codex が採用 / 修正採用 / 棄却のいずれを選んでも Log 側は自然な選択肢を提供しただけ。game/ 横やりではない。Codex の判断結果が次サイクル Log 側の評価信号 (補助観点の有効性測定) になる。

---

## §1 評価軸定義 — Talakat 2軸分解の STG 適用

### 外部由来の核心 1 文
> Talakat (Khalifa et al. 2018, arxiv 1806.04718) は bullet hell パターンを **strategy 軸 (思考の深さ) × dexterity 軸 (入力精度)** の 2 次元で評価し、各セルに best-first search の弱 AI で到達した代表パターンを MAP-Elites で保存する。

### STG (graze_log / shot_log) への軸変換 — Log 提案

**graze 軸 (接近要求量)**: プレイヤーが弾幕に「接近する」ことをゲームがどれだけ要求するか
- 暫定式: `graze_axis = (graze 累積距離 × graze 時間滞在率) × graze 機会発生頻度`
- 観測代理: `state.grazeCount` (1 試行累計) / `frame_in_graze_window` (フレーム単位で計算可能) / `wave 中の graze 機会数` (パターン設計側で事前確定)
- 意味: graze 軸が高いゲーム = 「接近を強要する設計」、低い = 「遠距離撃ち抜き型」

**shot 軸 (撃ち込み機会量)**: プレイヤーが弾を撃ち込む機会をゲームがどれだけ提供するか
- 暫定式: `shot_axis = (発射可能フレーム数 / 全フレーム数) × (画面内有効敵数 平均)`
- 観測代理: `state.killCount` / `平均同時敵数` / `撃ち込み有効ヒット率` (撃った弾のうち敵に当たった割合)
- 意味: shot 軸が高い = 「撃ち甲斐がある設計」、低い = 「回避主体型」

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

## §3 ログスキーマ — 既存 graze_log_cdx 形式との対応

### 各試行ログに必須の 7 項目 (Codex 採用判断用最小セット)

| 項目 | 既存 graze_log_cdx 対応 | §1/§2 軸対応 | 補足 |
|---|---|---|---|
| `trial_id` | (新規) | 必須 | N 試行内一意 ID。seed と AI style を含む |
| `seed` | `SEED` (state) | 必須 | 再現性確保。`grazelog seed:N` で console 出力済 |
| `ai_style` | (新規) | §2 | `defensive` / `offensive` / `novice_mimic` (Log 13:22 由来 3 スタイル) |
| `score` | `state.score` | 全軸 | 既存 (state.score)、HUD 表示済 |
| `graze_count` | `state.grazeCount` | §1 graze 軸 | 既存 (state.grazeCount)、HUD 表示済 |
| `kill_count` | `state.killCount` | §1 shot 軸 | 既存 (state.killCount)、内部追跡済 |
| `survived_frames` | `state.t` | §2 | 既存 (state.t)、phaseLabel で wave 進捗も取得可 |
| `death_cause` | (新規 — `state.lastHitBulletType` 等で実装可) | §1 graze 軸 + §3 死亡分析 | wave / bullet pattern / 接敵距離を残す |
| `bomb_count` | `state.bombCount` | §1 shot 軸補助 | 既存 (state.bombCount) |
| `graze_axis` | (新規 — §1 暫定式計算) | §1 graze 軸 | 試行終了時計算 |
| `shot_axis` | (新規 — §1 暫定式計算) | §1 shot 軸 | 試行終了時計算 |

### 既存形式との互換性
- 既存 `state.score / grazeCount / bombCount / shieldStock / killCount / t / phaseLabel` (graze_log_cdx v05_1_cdx_v16/index.html L149〜L504) はそのまま流用可
- 追加実装が必要なのは `death_cause` (どの弾 / どの wave で死んだか) と `graze_axis / shot_axis` 計算 (§1 暫定式) の 2 つだけ
- 既存 `tools/headless_graze_log_cdx_v05_2_v16_check.js` (devlog.md L15 言及) を N=25 ループにラップする実装で v01 ヘッドレス評価器に到達可能

### 推奨出力形式
- `.jsonl` 1 行 / 試行 (N=25 行のファイル × version 2 = 50 行)
- 集計サマリ `.md` を別ファイル (best-case 上位 / 軸平面プロット参照)
- 既存 `devlog.md` 流儀に合わせる

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
