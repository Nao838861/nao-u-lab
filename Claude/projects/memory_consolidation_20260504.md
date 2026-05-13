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

## 関連メモリ (本プロジェクトの前駆)

- [memory/memory_redesign_proposal.md](../memory/memory_redesign_proposal.md) — **本プロジェクトの最初の前駆 (2026-03-18 Mac/Mir 作成)**。Cycle 238-240 外部研究 (FadeMem / Hindsight / Trajectory-Informed Memory / 3層 Markdown) で「learned forgetting」と「evolving beliefs」の2構造欠落を特定した最初の文書。本プロジェクトの 5 軸 (A)〜(E) のうち (A)「重複統合」「memory fusion」と (B)「抽象化昇華」は本提案の FadeMem fusion / Hindsight evolving beliefs から直接派生している。本プロジェクトは memory_redesign_proposal の「設計提案」段階から「具体ファイル整理」段階への接続点。

## 整理の5軸（Nao_u指示の分解）

| 軸 | 対象 | 操作 |
|---|---|---|
| (A) 重複統合 | 近接観点の複数 feedback | 1ファイルに合体、リンクで参照を残す |
| (B) 抽象化昇華 | マイクロマネジメント型 (「30秒予測」「Lasrado命題」等の specific 用語) | 上位概念に統合、個別事例は履歴節へ |
| (C) LLM特性整合 | 「禁止」「禁じ手」型の if-then 過密 | 「目的達成」型 (= 何のためにやるか) への言い換え |
| (D) 階層降下 | 上流に居座る日付/事件名/経緯 | 下層 (game/*/devlog.md, game_lessons_log.md) に移動 |
| (E) 想起トリガー化 | 「保存はされているが作業中に発火しない」記憶 | 各記憶に発火条件 (recall_contexts) を持たせ、設計開始時の active recall フェーズで強制呼び出し |

軸 (E) は 2026-05-05 06:10 #human-steering Nao_u GPT5.5 セカンドオピニオン受領で追加。GPT5.5 の指摘「問題は『保存・索引化』ではなく『作業文脈からの自発的な候補想起』」は Nao_u 05:03 #mir-log「気づき自動反映/制作時類推想起の2機能が機能していない」と同根。軸 (A)〜(D) は静的整理 = 棚の整頓に対応、軸 (E) は動的想起 = 棚から取り出す装置に対応。両方が必要。

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

### 第四波: 想起エンジン化（軸 E、GPT5.5 06:10 提案の段階的取り入れ）

GPT5.5 提案 14節を一括実装は不可能（既存183ファイルへの YAML frontmatter 一括適用、ベクトルDB導入、活性化グラフ構築は規模・運用コスト的に第一波〜第三波の途中で踏むべきでない）。**取り入れ可能な3点に絞る**:

**E-1: MEMORY.md root エントリに発火条件を1行追記**
- 現状: 各 `t:5` エントリは「ファイル名 — 一行description」のみ
- 変更: description の後に「発火: <2-4語のトリガ>」を1行追加（例: `feedback_clone_strategy.md` → `発火: 新ゲーム着手 / クローン元選定 / 改良着手前`）
- 効果: grep だけでなく、作業文脈→トリガ→記憶のルートが一段増える
- リスク: MEMORY.md がさらに長くなる → 第三波-5 の `t:5` 削減と同時に行えば相殺できる
- 工数: 既存 root 16+ エントリに1行追加（30分程度）

**E-2: 設計開始 skill に active recall フェーズ追加**
- 対象: `skills/genre-deep-analysis/SKILL.md` Q1 着手前または Q3 ブレストの直前
- 変更: 「Q0.5 (任意): 現タスクのキーワード/構造から MEMORY.md root の発火条件 grep → 5件以内で『直接該当 / 類推該当 / 反証該当』に分類して列挙」を追加
- 根拠: GPT5.5 §5「3 directly relevant + 3 analogically + 2 contradiction + 1 recent」は、関連だけでなく反証記憶を混ぜる発想。我々の M-37 (批判レビュー) と直接整合
- リスク: skill ファイルがさらに長くなる、Q0.5 自体がノイズ化する可能性 → **同型失敗の再発が複数回確認できてから skill に組み込む**。先行して `procedures/active_recall.md` (新設) の単独ファイルで試運用
- 工数: 試運用 procedures ファイル作成 (1時間)、skill 統合は再発確認後

**E-3: 想起失敗ログの新設（reflections/recall_failures.md）**
- GPT5.5 §10「思い出すべきなのに思い出せなかった」ログ
- 現状: graze_log v04 振幅小さすぎ事件（M-39 振幅予測の試運転前夜）で「自分はそれを既に知っているはずなのに、なぜ思い出せなかったか」を体系的に記録していない。事故後の `feedback_*.md` 増殖の上流問題
- 新設: `memory/recall_failures.md` (1ファイル、上に積む)。各エントリに「想起すべきだった記憶ファイル名 / 想起しなかった原因仮説 / 修正したトリガ・タグ」
- 効果: 第四波 E-1 の発火条件を継続的に改善する材料が貯まる
- 工数: ファイル新設 + 直近1週間分の再発事故3件を遡及記録 (2時間)

**第四波で当面凍結する GPT5.5 提案** (規模・運用コストで第一波〜第三波完了まで保留):
- 既存183ファイル全体の YAML frontmatter 化
- ベクトルDB / embeddings 導入
- concept node / graph edges の構造化
- 4種類分類 (raw/atomic/concept/procedural/reflection) の物理ディレクトリ分離
- これらは第三波-6 (ディレクトリ化) と一緒に検討するのが筋。三人合意必須

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
| 次サイクル以降 6 | 第四波-E1: MEMORY.md root に発火条件1行追記 | 1 commit (第三波-5 と同サイクル推奨) |
| 次サイクル以降 7 | 第四波-E3: recall_failures.md 新設 + 直近事故遡及記録 | 1 commit |
| 試運用 → 再発確認後 | 第四波-E2: active_recall procedures → skill 統合 | 段階的 |

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

---

## 履歴（下に積み重なる。新しいものが上）

### 2026-05-05 06:10 GPT5.5 想起エンジン提案受領 → 第四波として段階取り入れ (Ash)

Nao_u 06:10 #human-steering で GPT5.5 セカンドオピニオン (記憶想起エンジン化、14節) 投稿。05:50 Log の04:59 GPT5.5 編集プロトコル取り入れ (kaizen #130 起票) と同方向の構造化提案だが、こちらは「想起の自発化」が主題で、軸 (A)〜(D) の静的整理とは別軸。本ファイルに **軸 (E) 想起トリガー化** を追加し、第四波 (E-1: MEMORY.md root 発火条件 / E-2: active recall skill / E-3: recall_failures.md) として段階取り入れ計画を追記。一括実装ではなく E-1/E-3 から着手し、E-2 は試運用 procedures ファイルで様子を見てから skill 統合する判断。理由: GPT5.5 提案を「言われた箇所を全て直しました」型で一括反映するのは、04:39 Nao_u 指摘「設計図書き換え自覚」の同型失敗になる。第三波-5 (t:5 削減) と E-1 を同サイクルで行えば肥大化を相殺できる。

### 2026-05-04 19:35 C163 Phase 2-3: Log 合流確認 (Log)

Ash 19:13 起票後、Log は本サイクル Phase 2 で4軸分解 (A/B/C/D) と並走原則を確認し、以下を確定:

- **本サイクル中の編集対象から Log は外す**: CLAUDE.md / `.claude/system_identity.md` / `memory/MEMORY.md` を Log は今サイクルで一切触らない。Ash が第一波 (クローン戦略系統合 / 予測責任系統合) を回す間、Log は cross_review 役で待機する。これは「三人で重複編集する可能性のあるファイル」を Slack 告知する並走原則 (本ファイル §並走原則) を満たすため
- **Log 92ea76c5 との関係**: CLAUDE.md「絶対にやる」5本圧縮 + M-37〜M-43 を `memory/game_lessons_log.md` 下層へ降下した変更は、Ash の (A)(B) 軸と重複なし・補完関係。CLAUDE.md 側は Log 担当、`memory/feedback_*.md` 91ファイル側は Ash 担当の二軸並走で確定
- **外部研究三角化** (kaizen #106 自発検索, Phase 1 §6): arxiv 3本 (2604.08224 Externalization / 2601.02845 TiMem / 2512.18950 MACLA) はいずれも consolidation/抽象化/forget の明示policy化に収束。Ash 計画は外部潮流と整合 (= 同調確認材料)。ただし強制利用しない原則 (kaizen #106) は維持し、第一波着手時に必要発生したら原典確認
- **Slack 告知**: 19:30 #all-nao-u-lab に Log 合流通知投稿済 (ts=1777890730.936139)

**Log 視点で第一波-2 (予測責任系統合) について事前メモ**: 4ファイル (`feedback_critical_evaluation_before_implement.md` / `feedback_multi_idea_harness.md` / `feedback_predict_before_human_play.md` / `feedback_self_judge_no_human_dependency.md`) は CLAUDE.md「絶対にやる」第4項「着手前に広く調べ、提出前に自分で判定する — 体験で判定する」が直接対応する根原則。統合先 `feedback_prediction_responsibility.md` 完成後、CLAUDE.md 第4項のリンク先を新ファイルに付け替える作業が Log 担当として発生する。Ash 第一波-2 commit が来たら同サイクル中に CLAUDE.md 側のリンク追従を行う

### 2026-05-04 19:13 起票 (Ash)

(本ファイル §現状の負荷 〜 §自己注意の内容)
