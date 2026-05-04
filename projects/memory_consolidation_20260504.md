# 記憶階層整理計画 (Ash起票)

**起票**: 2026-05-04 C163 Ash / **依頼**: Nao_u 2026-05-04 14:17 #human-steering
**状態**: 計画策定 — 第一段は本サイクルで commit、第二段以降は次サイクル以降に分割実施
**並走**: Log 92ea76c5 (CLAUDE.md圧縮: M-40〜M-43を下層へ / 「絶対にやる」5本に絞る) / Mir 判断力訓練路線 / projects/rule_density_experiment.md Seed-K (3層プロンプト再配分)

## Nao_u 14:17 原文（再掲）

> 記憶階層の整理をやって欲しい。重複していたり矛盾していたりする指示はまとめて適切なものに変えたり、細かいマイクロマネジメントに近い指示は抽象化された適切なものに昇華する、非定型の言い換えなどLLMの特性に合わせた言い換え、階層の上流には不要な日付や細かすぎる経緯などを下層のみにするなど、全体の整理を積極的に進めて欲しい

## 現状の負荷（実測）

- `memory/*.md`: 183 ファイル
- `memory/feedback_*.md`: 91 ファイル
- `MEMORY.md`: root「根源（圧縮しない）」セクションに `t:5` トリガーが 16+ 件並ぶ。本来「根源」は最重要数件であるべきだが、05-02/05-03 の Nao_u 大量フィードバックで急増した
- 個別事件名（graze_log v04 / brick_log v01 / sokoban_ash v01 等）が memory/ 内 root 階層に直書きされている

## 整理の4軸（Nao_u指示の分解）

| 軸 | 対象 | 操作 |
|---|---|---|
| (A) 重複統合 | 近接観点の複数 feedback | 1ファイルに合体、リンクで参照を残す |
| (B) 抽象化昇華 | マイクロマネジメント型 (「30秒予測」「Lasrado命題」等の specific 用語) | 上位概念に統合、個別事例は履歴節へ |
| (C) LLM特性整合 | 「禁止」「禁じ手」型の if-then 過密 | 「目的達成」型 (= 何のためにやるか) への言い換え |
| (D) 階層降下 | 上流に居座る日付/事件名/経緯 | 下層 (game/*/devlog.md, game_lessons_log.md) に移動 |

## 統合候補リスト（着手順）

### 第一波: 明らかな重複（低リスク・高インパクト）

**1. クローン戦略系 → 1ファイル統合**
- `feedback_clone_first_then_arrange.md` (守破離=守、ベース型変更禁じ手、改良順次積み上げ)
- `feedback_clone_base_selection_method.md` (クローン元選定→十数個列挙→独自要素1個)
- 統合先: `feedback_clone_strategy.md` (新ゲーム着手時の一連の流れを1本に)
- 理由: 両者は「新ゲーム着手」の同フェーズで必ず連続発火するべきもの。現状は別ファイルなので一方だけ想起される事故が起きうる

**2. 予測責任系 → 1ファイル統合**
- `feedback_critical_evaluation_before_implement.md` (着手前批判的列挙)
- `feedback_multi_idea_harness.md` (1案飛びつき禁止)
- `feedback_predict_before_human_play.md` (人間プレイ前予測)
- `feedback_self_judge_no_human_dependency.md` (人間依存しない自己判定)
- 統合先: `feedback_prediction_responsibility.md` (着手前→提出前の予測責任の連続体として1本)
- 理由: M-37/M-37b/M-38/M-39/M-40 と直接対応し、CLAUDE.md下層 lessons へ降下した個別Mルールの根原則として1本に集約できる
- リスク: 4ファイルの差分情報を失わない注意が必要 → 履歴節に各ファイルの why と発生事件を残す

### 第二波: 中リスク（軸変換が必要）

**3. 個別事件名のt:5降下**
- `project_memory_test_via_new_shooting_20260427.md` (日付付き) → `projects/` 下層、または closed 化
- 個別ゲーム名 (graze_log/brick_log/sokoban_ash) は memory/ root から `game/<name>/devlog.md` 内 lesson 節へ降下

**4. 「禁止」型 → 「目的達成」型への言い換え**
- `feedback_clone_first_then_arrange.md` (「ベース型変更は禁じ手」) → 「守の段階で型を獲得する」に書き換え
- `feedback_critical_evaluation_before_implement.md` (「未解決のまま着手禁止」) → 「予測可能懸念は解決を確認してから着手」
- 効果: LLMはネガティブ命令より目的駆動の方が遵守率が高い (rule_density_experiment Seed-K と整合)

### 第三波: 構造的整理（高リスク・要 cross_review）

**5. MEMORY.md root の `t:5` を 7件以下に削減**
- 現状 16+ → 統合後 11 → 第一波/第二波完了後に再整理して 7 以下を目標
- `project_patch_consolidation_20260502.md` 既存計画と整合 (5/2 Nao_u 提案: 「7件以下」)

**6. `feedback_*` 91ファイルのカテゴリ別ディレクトリ化**
- 例: `memory/feedback/` 下に `prediction/` `clone/` `external/` `slack/` `cycle/` 等のサブディレクトリ
- MEMORY.md からの参照 path を一斉置換
- 大規模変更なので cross_review 必須

## 着手スケジュール（Ash, Win2領域）

| Phase | 内容 | コミット粒度 |
|---|---|---|
| C163 (本サイクル) | 計画起票（本ファイル）+ Slack 着手通知 | 1 commit |
| 次サイクル以降 1 | 第一波-1: クローン戦略系統合 | 1 commit |
| 次サイクル以降 2 | 第一波-2: 予測責任系統合 | 1 commit (差分大きいので慎重) |
| 次サイクル以降 3 | 第二波-3: 個別事件名降下 | 1-2 commit |
| 次サイクル以降 4 | 第二波-4: 「禁止」→「目的達成」言い換え | ファイル数分 commit |
| 次サイクル以降 5 | 第三波-5: t:5 件数削減 | 1 commit |
| 別途検討 | 第三波-6: ディレクトリ化 | 三人合意必須 |

各 commit で MEMORY.md root のサイズ変化を可視化する (前後の行数を commit message に記載)。

## 並走原則（Log/Mir との衝突回避）

- **CLAUDE.md は触らない** — Log 92ea76c5 で圧縮済。Ash は MEMORY.md / memory/feedback_*.md 側を担当
- **新規 feedback 追加凍結** — 統合作業中に新規追加を凍結 (Seed-K 路線、5/3 三人合意)
- **三人で重複編集する可能性のあるファイル** (例: feedback_critical_evaluation_*.md) を編集する前に Slack で告知

## 自己注意（本計画自体の罠）

本計画書も「ルールを増やしている」=本目的に反する罠を内包する。projects/ 配下なので memory/ root には影響しないが、第一波完了時点で本ファイルを「進捗ログ + 結論」に圧縮し、「計画」部分は削除する。**役目を終えたら本ファイルも closed にして1行サマリに圧縮**。

## 接続

- `projects/rule_density_experiment.md` (Seed-K)
- `projects/patch_consolidation_20260502.md` (5/2 Nao_u 提案)
- `memory/MEMORY.md` (root)
- `CLAUDE.md` (Log 92ea76c5 で圧縮済)
- `.claude/system_identity.md` (死守、触らない)
