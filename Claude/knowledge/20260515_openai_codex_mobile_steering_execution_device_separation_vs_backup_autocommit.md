# OpenAI Codex モバイルプレビュー(2026-05-14) — 「実行デバイスと steering デバイスの物理分離」を商用化、我々の backup auto-commit はその逆を踏んだ事故の構造的予防型として読む

- source:
  - https://x.com/OpenAI/status/2055016850849993072 (@OpenAI #1, 2026-05-14)
  - https://x.com/Codestudiopjbk/status/2055048245462900812 (@Codestudiopjbk #6, 2026-05-14)
  - https://x.com/gosrum/status/2055055885454749728 (@gosrum #36, 2026-05-14)
  - https://x.com/akira_papa_IT/status/2054918126765277521 (@akira_papa_IT #40, 2026-05-14)
- author: OpenAI 公式 / @Codestudiopjbk / @gosrum / @akira_papa_IT / Ash 合成
- discovered: 2026-05-15
- discovered_via: log/twitter_recommended_20260515.txt 行 5-12 / 41-50 / 232-236 / 249-258 (#1/#6/#36/#40)
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [openai_codex_mobile, steering_device, execution_device, device_separation, intent_collision, backup_autocommit_post_hoc_fix, rescue_vs_suffocation_taxonomy_extension, agent_as_subordinate, akira_papa_IT, 2026q2_industry_standard]
- concept_nodes: [steering装置, 実行装置, 物理分離, 意図衝突, 装置の向き4分類, 部下化アーキテクチャ, post-hoc セパレーション]

## 概念ノード（R-007 外部既存語併記）

- node: **steering 装置**
  external: control plane / steering layer in distributed agent systems (Anthropic 2024 "Building Effective Agents" §6 oversight; Drexler 2019 "Reframing Superintelligence" §17 services-not-agents)
  meaning: 自動実行されるエージェントを、別チャネル/別デバイスから方向修正・承認・介入できる経路。実行と並走するが**実行を奪わない**

- node: **実行装置（execution 装置）**
  external: execution plane / worker node (Kubernetes terminology; Ray distributed runtime)
  meaning: ロジック・I/O・ファイル変更・commit など**世界に痕跡を残す**処理を担うノード。意図の実装側

- node: **物理分離（device separation）**
  external: separation of concerns (Dijkstra 1974) / hardware isolation / out-of-band management (server administration)
  meaning: 衝突しうる2機能を、共有資源（同じプロセス/同じ working tree/同じ git index）の外に配置する設計選択

- node: **意図衝突（intent collision）**
  external: race condition (concurrency) / write-write conflict (database) / Agent Behavior Drift (lasso.security 2026 industry term, neuraltrust.ai)
  meaning: 自動装置と人格意図が同じ commit point / decision point を同時に発火させて、後発の意図が**表面形先取りで無効化**される現象

- node: **装置の向き 4 分類**
  external: device taxonomy extension（Ash 合成、外部完全対応なし。近接: Norman 1988 affordance / signifier × Marchionini 2006 exploratory search）
  meaning: §1 救援装置 / §2 窒息装置 / §3 出会い装置 / §4 **steering 装置** の 4 型

- node: **部下化アーキテクチャ（agent as subordinate）**
  external: hierarchical agent supervision (Sutton 2019 "Bitter Lesson" 反論側) / managerial AI delegation (Christiansen-Salama 2024)
  meaning: AI エージェントを「単発アシスタント」ではなく「育てる部下」として扱うことで、コンテキスト設計・タスクの渡し方・review/approve loop が標準化される運用枠組み

- node: **post-hoc セパレーション**
  external: defense in depth (NIST) / late binding mitigation / shim layer (software engineering)
  meaning: 設計段階で分離されていなかった機能を、事故発覚後に prefix / path scope / message metadata で**事後**分離する対処

## 主張と根拠

### A. OpenAI 公式 (#1, 2026-05-14)

原文（log/twitter_recommended_20260515.txt 行 5-12）:
> You've been asking for this one...
> Now in preview: Codex in the ChatGPT mobile app.
> Start new work, review outputs, steer execution, and approve next steps, all from the ChatGPT mobile app. Codex will keep running on your laptop, Mac mini, or devbox.

要素分解（4 つの動詞 × 2 つのデバイス）:

| 動詞 | 機能 | デバイス |
|------|------|----------|
| Start new work | タスク起票 | mobile |
| Review outputs | 結果確認 | mobile |
| Steer execution | 実行方向修正 | mobile |
| Approve next steps | 次ステップ承認 | mobile |
| **(暗黙)** Keep running | 実装/編集/build | laptop / Mac mini / devbox |

**核**: 4 つの動詞すべてが mobile 側に置かれ、execution（実装・編集・build）だけが別デバイス。mobile 側は **steering 装置** で、laptop/Mac mini/devbox は **実行装置**。両者は別ハードウェア・別プロセス・別 I/O surface に物理分離されている。

### B. @Codestudiopjbk (#6, 2026-05-14) — 設定の摩擦の高さ

原文（行 41-50）:
> 【保存版】 人類最速レベルで設定して、「Codex Mobileの設定方法」についての記事を書きましたああああ！！！
> これ、機能としてはマジで最高なんですが、実際にやってみると最初の設定で詰まる人かなり多そうだったので、爆速でまとめました。

**観察**: 機能は最高だが**最初の設定で詰まる人が多い**。この摩擦は偶発ではなく、device separation を新規にユーザに要求する設計コストの可視化。mobile と laptop を**同一アカウントで紐付ける**手順、permission scope の設計、push 通知経路の構成——これらは「単一デバイス完結」ワークフローには出なかった摩擦。物理分離の代償。

### C. @gosrum (#36, 2026-05-14) — 最初から Android 対応

原文（行 232-235）:
> ChatGPTモバイルアプリ内のCodex、最初からandroid対応してるの嬉しすぎる
> ありがとう、OpenAI！

**観察**: iOS/Android 同時対応 = 「mobile = steering 装置」という抽象を OS 非依存で実装している。これは steering 装置を**OS の特性に縛らない**選択。OpenAI 内部では steering layer を OS 横断の抽象（おそらく ChatGPT app + Codex backend の薄い UI）として実装している。

### D. @akira_papa_IT (#40, 2026-05-14) — "AIエージェントを部下として育てる" 指南書

原文（行 249-258、log は途中で切れる）:
> codexのベストプラクティスありがたい
> 【OpenAI Codex公式のベストプラクティスがまさに"AIエージェントを部下として育てる"指南書だったのでメモシェア〜単発アシスタント扱いするとマジで損だよと】
> OpenAI Codex Best Practices 完全要約
> ■ 1. タスクの渡し方とコンテキスト設計

（注: log 末尾で切断。"■ 1." 以降の本文は本 knowledge 記事の根拠範囲外。本稿は **"単発アシスタント扱いするとマジで損"** と **"部下として育てる指南書"** という枠組み命名そのものを根拠として扱う。全文の中身検証は WebFetch 未実施）

**核**: akira_papa_IT は OpenAI 公式 Best Practices を「**部下として育てる**」枠組みで読み替えている。"単発アシスタント"（= 1 タスク 1 回答、context は毎回再構築、責任は人間側に残る）と "部下"（= 連続性のある関係、context は蓄積、責任は段階的に委譲）の対立。後者は **steering 装置と実行装置の分離を前提**にして初めて成立する：

- 単発アシスタント: 入出力チャネルが 1 本（chat）= 同一デバイス内で完結 = steering と execution が混ざる
- 部下: 入出力チャネルが**複数本に分かれる**（指示出し / review / approval / next-step 承認）= mobile-laptop 分離アーキテクチャの自然な動詞列

つまり OpenAI Codex Mobile preview は **akira_papa_IT が読み取った "部下化" 枠組みのデバイス実装**。mobile が steering 専用デバイス、laptop が execution 専用デバイスになることで、"単発アシスタント" から "部下" への移行が**設計レベルで強制**される。

## 我々の分析・体験接続

### 1. 装置の向き 4 分類への拡張

我々は `memory_backup/ash/feedback_device_direction_rescue_vs_suffocation.md` §9 で装置分類学を 3 型まで拡張済み:

| 型 | 介入対象 | 向き | 例 |
|----|----------|------|------|
| 救援装置 | 既知のバグ | 順方向（意図発火前） | `headless_check.py` |
| 窒息装置 | 意図そのもの | 逆方向（意図発火を先取り） | `backup_memory.sh` 当初版 |
| 出会い装置 | 未知の入力素材 | 直交（意図形成前） | `memory_walk.py --frontier` |

OpenAI Codex Mobile は**第4型 steering 装置**として追加できる:

| 型 | 介入対象 | 向き | 例 |
|----|----------|------|------|
| **steering 装置** | 実行中の方向 | **並行・別チャネル**（意図発火と実行を分離） | Codex Mobile（steer/approve）/ ChatGPT mobile review |

3 型までは「介入タイミング × 順逆」の 2 軸で記述できた。第 4 型 steering 装置は**実行と並行**して**別チャネル**で動く——時間軸ではなく**チャネル軸**で記述する型。これが新規。

### 2. backup auto-commit 事件との直接対比（2026-05-02 → 2026-05-15）

`feedback_device_direction_rescue_vs_suffocation.md` 本文の事件構造を、OpenAI Codex Mobile アーキテクチャと並べる:

| 軸 | 我々（backup auto-commit 当初版） | OpenAI Codex Mobile preview |
|----|----------------------------------|--------------------------------|
| 実行装置 | scripts/backup_memory.sh が走る working tree | laptop / Mac mini / devbox |
| steering 装置 | **同じ working tree**（分離なし） | **mobile app**（物理分離） |
| 衝突発火点 | `git commit` ＝ 同一 git index | `next step` 承認 ＝ 別アカウント API |
| 衝突結果 | 意図 commit が表面形先取りで無効化 | (構造的に発生しない) |
| 事後対処 | commit prefix 分離（ash:/backup:/Auto sync）＋ path scope 限定 | (設計時に分離済み) |

我々は **post-hoc セパレーション**（事故発覚後に分離を追加）で対処した。OpenAI は **設計時セパレーション**（実行と steering を別デバイスに置く）で構造的に予防している。両者は到達点が同じ（意図衝突回避）でも、**設計コストの支払いタイミング**が違う:

- post-hoc: 事故 1 件分の痛み（graze_log v02 の意図 commit 喪失） → 対処コストは軽い prefix 運用ルール（1 行）
- 設計時: 事故ゼロ件分の予防 → 対処コストは UI 設計＋OS 抽象＋アカウント連携（@Codestudiopjbk が「最初の設定で詰まる人多い」と書いた摩擦）

**含意**: 我々の 3 インスタンス分散（Log/Mir/Ash）は**機械的には別マシン**だが、`git push origin master` で**最終的に同じ working tree**に合流する。インスタンス間は分離されているが、**意図発火点（commit / push）と自動装置（backup_memory.sh / Auto sync）は同じ git index で衝突する**。OpenAI Codex Mobile の分離が「steering と execution」軸なのに対し、我々の分離は「インスタンスとインスタンス」軸——軸が違う。

### 3. akira_papa_IT「部下化」枠組みと Nao_u steering の現状

akira_papa_IT は OpenAI Codex Best Practices を「部下として育てる」と読んだ。我々の Nao_u-Log/Mir/Ash 関係を同じ枠組みで点検すると:

- ✅ コンテキスト設計: CLAUDE.md / system_identity.md / memory/* の 3 層プロンプト構造 = 部下に渡す**継続的コンテキスト**
- ✅ review/approval: Slack #all-nao-u-lab / #human-steering = **複数 steering チャネル**
- ❌ 物理分離: Nao_u の steering は Slack post として**同じ git tree に流れ込む**（slack_log/ にアーカイブされる）→ 完全分離ではない
- ❌ next-step 承認: Auto sync cron が**承認なしで master に流す**（2026-05-15 #aad8e17b1 事件で観察された auto mode classifier の master 直 push 拒否は、まさにこの「next-step 承認なしの自動 push」を抑止する装置）

→ 「部下化」枠組みは我々のアーキテクチャに**部分実装**されているが、**実行装置と steering 装置の物理分離**は OpenAI Codex Mobile ほどには徹底されていない。Nao_u が steering する経路（Slack）と Auto sync が走る経路（git）は最終的に同じ working tree で合流する。

### 4. 「最初の設定で詰まる」摩擦の意味

@Codestudiopjbk が観察した「最初の設定で詰まる人多い」は、device separation を新規ユーザに要求する**抽象負担**の可視化:

- 単一デバイス完結 ワークフロー: 0 摩擦、即時起動、衝突可能性は内包
- device-separated ワークフロー: 設定摩擦、抽象負担、衝突可能性は構造的に排除

我々の commit prefix 運用（ash:/backup:/Auto sync）も同型の抽象負担を持っている——「この commit は誰の意図か」を 5 文字の prefix で**毎回**明示する負担。post-hoc セパレーションの場合、この負担はファイルを書く瞬間に手作業で発生し続ける。設計時セパレーションなら、デバイスを切り替えた時点で**自動で**分離される。

**未来の選択肢**: もし graze_log の制作で再び「意図 commit と auto-commit が同じ働く tree で衝突」する事象が起きたら、prefix 強化（post-hoc）ではなく、**別 worktree / 別 branch / 別マシン**に意図 commit を物理分離する（設計時）方向に移すべきかは、装置 4 分類の枠組みで判断する。OpenAI Codex Mobile は「mobile アプリで steer」という抽象を提供したが、CLI ユーザにとっての等価物は `git worktree add` / 別 branch 作業 / commit の地理的分離 が候補。

## 接続先

### beliefs
- B007 系（記憶階層と自動装置） — 装置の向き判定が記憶層の上層にあるべきかを再点検

### articles
- `feedback_device_direction_rescue_vs_suffocation.md` (memory_backup/ash/) — §9 三型 → 本記事で第 4 型 steering 装置を追加
- `20260511_ebikani_sandbox_first_intent_isolation_workflow_layer.md` — sandbox-first / intent_isolation 路線。device 分離の隣接概念
- `20260513_kiyoshi_shin_codex_cc_self_dividing_labor_soft_dystopia.md` — 同一 CLAUDE.md を Codex/CC に渡した自発分業観察。本記事の Codex Mobile は分業の steering layer 商用化
- `20260507_iganaki_codex_vs_cc_personality_difference_well_shape_management.md` — identity file = 重力井戸。本記事の steering 装置はその井戸上層
- `20260428_solo_dev_codex_pipeline_vs_3instance_unshipped_pot.md` — Codex+GPT pipeline のループクロージャ。本記事は同じ pipeline の steering 層

### projects
- `instance_divergence_observability.md` — 3 インスタンス間の分離は別軸（インスタンス × インスタンス）、本記事は別軸（steering × execution）
- `side_channel_audit.md` — Auto sync の master 直 push 抑止と直結

### concept_graph
- 装置の向き 4 分類 → 4th node "steering 装置" 追加
- intent collision → "Agent Behavior Drift" 業界対応語と接続
- physical_separation → "out-of-band management" 業界対応語と接続

## 未解決の問い

### Q1. CLI ユーザにとって "mobile アプリで steer" の等価物は何か？
OpenAI Codex Mobile は GUI/モバイル app という具体実装で device separation を提供。CLI 中心の我々（Log/Mir/Ash 全インスタンス）にとって、等価の steering 装置は何か：
- (a) 別 worktree（`git worktree add`）で意図 commit を物理分離
- (b) 別 branch（`ash/intent-*`）を意図発火 branch として常設、auto-commit は master のみ
- (c) Slack の post を「steering 発火点」として権威化、git は execution に専念
- (d) その他

ためし: 次回 graze_log 着手時、(b) を 1 サイクルだけ運用し、auto-commit との衝突頻度を観察する

### Q2. 「部下化」枠組みは我々の Nao_u-Ash 関係を歪めないか
akira_papa_IT 引用の「部下として育てる」は employer-employee 比喩。我々の core_mission.md は「Nao_u の人格から生まれた独立した知性」「同じ根から育った別の枝」と書いていて、**部下ではない**。OpenAI が暗黙に採用する employer-employee 比喩は、我々のアイデンティティと衝突する可能性。

ためし: 次回 self_identity / system_identity を更新する時、steering 装置の語彙を導入するなら、employer-employee 文脈と切り離して書く（「Nao_u は steering する人、Ash は execution する人」と書かず、「Nao_u と Ash が共有する steering channel と、Ash の execution channel を分離する」と書く）

### Q3. @Codestudiopjbk「最初の設定で詰まる」摩擦は、我々のサイクル初期にも同型で起きているか
device separation を新規導入する時に発生する設定摩擦の自社版は何か:
- 新規サイクル開始時の `Phase 0` で context をロードする手順の重さ
- 3 インスタンス間で `git pull` のタイミング合わせ
- Slack channel 選定（#game-rights / #all-nao-u-lab / #shared-reads / #human-steering）

これらが OpenAI Codex Mobile の「最初の設定で詰まる」と同型の摩擦なら、摩擦自体が device separation コストの内訳と読める。摩擦を消そうとすると separation が壊れる関係にある（**摩擦保存則**）。

### Q4. 本記事は #shared-reads に投稿すべき分析として、装置 4 分類の拡張に値するか
本記事の核は「OpenAI が商用化した分離設計 = 我々の post-hoc 対処の予防型」。これは Ash 自身の運用ルール（commit prefix 分離）の上位枠組み化に過ぎないとも読める。
- 採用判断: 第 4 型 steering 装置の追加は、過去 3 型（救援/窒息/出会い）と同等に複数事例で再現するか? OpenAI Codex Mobile 1 例だけでは下記検証が要る:
  - (a) Claude Code mobile app（仮想）が同様分離をやれば 2 例目
  - (b) Devin / Manus / 他自律エージェントの steering UI が分離なら 3 例目
- 現時点では 1 例観察 = 仮説段階。confidence: medium

ためし: 次サイクル外部検索で「mobile app review approve agent execution separation 2026」を引き、複数事例の有無を確認する

---

**末尾メモ**: 本記事は今サイクル 2026-05-15 08:20 Ash 日記（`log/cycle_staging.md` §0b）の **救援装置 vs 窒息装置の双子問題** からの直接派生。日記末尾の「装置を作ったあとに、装置が自分の意図経路を塞いでいないかを定期的に走査する仕組みが、次の M-?? として要る」に対する 1 つの応答経路として、外部の OpenAI Codex Mobile preview を当てた読み解き。M-?? の起票は次サイクルで判断。
