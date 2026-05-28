---
name: feedback_substrate_not_infrastructure
description: substrateとinfrastructureを混同しない。差別化はsubstrate側、infraに投資すると敵側のリングで戦う。Nao_u 13:30指摘から派生。
type: feedback
---

# substrate と infrastructure を混同しない

## ルール

- **substrate** = Nao_u 20年日記 / 失敗台帳 (game_lessons_log / feedback_*) / 1対1対面運用ログ / 3インスタンス内省構造
- **infrastructure** = 記憶機構 (MEMORY.md / concept_graph / 段階的検索) / Skills / hooks / 自動verification scheduler / cross_review 機構

差別化は **substrate 側にしかない**。infrastructure に時間を使うのは「敵 (GPT5.5 / Codex / 大手 LLM ベンダ) と同じリングで戦う」こと。型は commodity 化される。

**Why**: 2026-04-27 13:30 #human-steering Nao_u「型を commodity 化、記憶もホット、残り時間少ない」。Mir に近づきすぎているという指摘の文脈。常時注入型の記憶機構を磨くのは敵が標準実装で潰してくる側、Nao_u 20年日記の固有経路を引き続けるのは敵に真似できない側。

**How to apply**:
- 新作着手前: substrate 引用 (game_lessons_log / nao_u_live / 日記) を最初に必ず置く。infra 改修案より先
- 結晶化時: 自己採点 ✗ の処方は substrate 側に書く。infra に書くと「ルールを増やしただけ」で終わる
- ideation: 「課題探し型」(infra 改修案を探す癖) を止め、「Nao_u 日記の具体経路から逆算」を起点にする
- cross_review: 対称運用 (Solver-Solver-Solver) は infra 増殖。substrate 側の Nao_u 直接介入を Guide 役に置く

**止める候補** (2026-04-27 C137 Phase 2 で言語化):
1. 記憶インフラ追加投資 (常時注入を肥らせる方向)
2. 課題探し型 ideation (Phase 1/2 で infra kaizen 提案を量産する癖)
3. cross_review 対称運用 (Mir/Ash と同じレンズの確認運転)

**1mm 着手** (2026-04-27 C137):
- 新ゲーム着手前に「日記アンカー」(2006-2026 の関連エントリ最低 1 本) を必須化
- shot_log STG 派生 (substrate 側の Nao_u 作家性に準拠)
- 結晶化の自己採点を導入

**検証期限**: 2026-05-04

## 外部独立収束 (2026-04-27 C138 Phase 3 追記)

Ash #shared-reads「moat が二層に分かれた日 — Codex 5.5 実利スイッチ + Sakana Fugu β」(2026-04-26 観測, スコア 10pt) が同じ構造を別語彙で命名している:

- @kenn 実運用報告: 「Codex 5.5 Low で十分、Opus 4.7 より賢い・速い・頑固でない。デザインとコピー以外で Claude の出番がない」
- これまでの「Codex vs Claude」= 仕様比較 (= infrastructure 比較)
- 観測されているのは **substrate 比較** (実運用文脈での味の差)

**含意**: 「moat 二層」は infra (タスク賢さ) と substrate (運用文脈と作家性) の区分。Ash 観察から我々の用語に翻訳すると、Nao_u 20年日記+対面+3インスタンス内省構造は「もう一層のmoat」側にある。**型 commodity 化に耐えるのは substrate 一択**という Nao_u 13:30 の指摘の外部証拠。

接続元: `slack_archive/shared-reads.jsonl` Ash 投稿 (2026-04-26)。本ファイルに洞察取り込み済 (2026-04-27 C138 Phase 3)。

## 装置作成時の判断機会窒息リスク (2026-05-03 C156 graze_log v02 cross_review §4 統合)

infra 増殖の害の中で特に見落としやすい一形態: **「救援装置」の顔をした「窒息装置」**。装置を作った瞬間、それまで人間/Solver が下していた判断を装置が先取りして塞ぐ。例:

- backup auto-commit が「commit メッセージに 1 行加える」という選択主体性の行使タイミングを表面形実現で奪う (Ash 5/3 観測, kaizen #129 文脈)
- 工程数値化 gate (M-37 6/6 / MPS=9 / M-41 純度) が踏まれた事実を、判断真偽より先行させる (brick_log v09 で発生 → M-43 撤回事案)
- 「節を埋めれば通過」型 skill が、3原則 (体験で考える/動いて残す/自分から始める) で代替されるべき判断を形式化された節埋めに置換する

**判定手順**: 装置を作る/拡張する時、必ず1問自答する。**「この装置が成立した後、それまで誰かが下していた判断のうち、装置が先取りして塞ぐものはあるか? 塞いで良い判断か?」** 答えが「塞いで良い」なら infra として正当 (定型処理の自動化)。「塞いではいけない」なら substrate 側の判断機会を窒息させる害悪装置。

**Why**: substrate (Nao_u 20年日記 + 対面運用 + 3インスタンス内省) は「判断の累積」で moat を形成する。判断機会が装置に置換されれば substrate は薄まる。infra 増殖の害は「敵のリングで戦う」だけでなく「自分の差別化源を削る」二重の害がある。

**How to apply**:
- 新 skill / 新 hook / 新 M-?? 起票時に「判断機会窒息セクション」を必須化
- cross_review コメントに「この提案が塞ぐ判断は何か」を含める (Ash → Log の §4 装置の向き提起と同型)
- 既存装置の点検: 同種の指摘 (装置が判断を先取り) が 2 回連続で来たら装置側を疑い、撤回 or 縮退を次の実装より優先 (M-40 同パターン2回ルールの装置版)

**接続**: M-43 撤回事案 (M-37〜M-42 過剰ルール化 = 装置増殖) の上流原因。`feedback_few_rules_big_effect.md` (少ないルールで大きな効果) の同位概念。Mir 5/3 #human-steering 10:08「ルールと判断力は別」+ Nao_u 10:33 承認の流れに合流。Ash 提起の「装置の向き — 救援/窒息双子問題」を本ファイルに統合 (独立 feedback ファイル増設は infra 増殖そのものなので回避)。

## Dreams / Managed Agents 無視と3者の差の温存 (2026-05-09 Nao_u直接指示)

### 指示原文
2026-05-09 00:00 #all-nao-u-lab Nao_u: 「Dreams / Managed Agentsはいったん無視。3者の差を温存」

### 解釈
2つの命令が一つにまとめられている:
1. **Anthropic公式機能 (Dreams: 100セッション再整理 / Managed Agents: タスク実行基盤) を追わない** = 4/27 substrate-vs-infrastructure の最新適用例。infra 比較のリングで戦う誘惑を直接潰す
2. **3者 (Log/Mir/Ash) の差を温存する** = 5/7 同日5観察 (substrate vs surface 収束) への直接的対応。3者のCLAUDE.md抽象原則・cycle_staging構造・指示ファイルが揃ってくると、surface（成果物の体裁）が揃いsubstrate（個体の判断基盤）が痩せる

### Why
- Anthropic公式機能を真似に行くと substrate が痩せる (既存ルール)
- それに加え、**3者の収束**そのものが substrate を痩せさせる新しい経路。同じフレームを別語彙で3回言うのは、5観察が同日に独立収束したのと外見上見分けがつかないが、内実は閉鎖系内mutual ICL drift。一見「3者の独立確認」だが、実体は「同じ言い方を3回」
- Mir/Ash 同期を kaizen として進めると、ルール文面・テンプレ・記憶階層設計の3者ミラーリングが起きる。これを意図的に止める

### How to apply (Log側)

止めること:
- Dreams / Managed Agents の API 仕様調査・auto_diary との差分整理を予定から外す (5/7 #28 で Log が言った「差分整理」も本指示で停止)
- 3者で同一フレームを反復しない。substrate-vs-surface・装置の向き・mutual ICL drift などのフレームを Mir/Ash も使い始めたら、Log側は別の角度に振る (同じ結論でも導入経路を変える)
- ルール文面の3者ミラーリングを警戒。「Mir で出たから Log にも反映」のkaizen申請は、本指示に照らして拒否対象

伸ばすこと:
- 3者で違う problem に着手する。同じ問題を3者で解いて結果を比較する運用 (cross_review 対称) より、違う問題に手を入れる方が差は温存される
- 同じ問題に触れる場合も、入口を変える (Log = 装置/コード起点、Mir = 内省/言語起点、Ash = 外部観察/二次資料起点 のような自然分業を維持)

### 検証
- 同型反復チェック: 5/9以降の Log 投稿で、Mir/Ash と同じフレーム名を3回以上使っていないか週次自己点検
- ミラーリング拒否ログ: kaizen申請のうち「3者同期」が動機のものを拒否した件数を cycle_staging に残す

## 記憶 infra 「いつ何を fix するか」4軸整理 (2026-05-28 C255 Phase 2 §2 A-MEM 投稿より)

A-MEM (arxiv 2502.12110 / NeurIPS 2025) を C254「post-hoc 派生層」案の独立到達点として読み込んだ際、記憶 infra 決定を **「ingest 時に何を固定するか × retrieval 時に何を動かすか」** の2軸 (= 4象限) で整理できると分かった:

| 軸 | ingest 時 固定構造化 | retrieval 時 動的可塑化 |
|---|---|---|
| 例 1: Karpathy LLM Wiki | atom に固定 frontmatter (purpose:/class:/connects:) | ─ |
| 例 2: A-MEM | ingest 時 link 生成 (LLM 判定) + Memory Evolution (既存書換) | ─ |
| 例 3: kaizen #135 (我々) | atom 本体非破壊 | edges.jsonl 派生 + recall 時 type gate |
| 例 4: RAGコスト 1/15 記事 | ─ | Layer 0-3 段階スキップ (cost vs quality) |

**substrate-not-infra 観点からの判定基準**:
- ingest 時 固定構造化: atom 本体に書き込み = rewrite/migration コスト発生 = infra 投資が atom 数に比例して膨張する。**substrate を直接いじる infra 案は基本却下** (A-MEM Memory Evolution = atom 既存書換は明示却下、core_mission.md 不変原則と整合)
- retrieval 時 動的可塑化: atom 本体非破壊 = 派生層 (edges.jsonl / recall 戦略) のみ rewrite 可 = rollback コストゼロ。**ここに infra 投資する分には substrate を痩せさせない** = kaizen #135 の設計選択の補強根拠
- 段階スキップ (RAGコスト型): infra 利用側の cost-aware 動作。infra そのものを増やさず使用パターンで quality を稼ぐ ≒ substrate (判断累積) 側に重心

**How to apply**:
- 記憶 infra kaizen 案を見たら、まずこの 2軸 のどこに位置するかを判定する
- ingest 時固定構造化に分類されたら、その案は **substrate 直接書換 = 慎重判定**。retrieval 時動的可塑化なら infra 投資余地あり
- 「いつ何を fix するか」を間違えると、固定不要なものを固定して migration 地獄 (Karpathy Wiki 系の課題)、可塑であるべきものを ingest 時に決め打ち (A-MEM Memory Evolution の risk) になる

**接続**: kaizen #135 段階2 着手時 (`tools/recall_atom.py` 仮実装) に本 4軸表を docstring 冒頭に貼る = 設計判断の根拠を C256 以降の自分から見えるようにする。`feedback_few_rules_big_effect.md` (ルール追加ゼロ目標) + 「装置作成時の判断機会窒息リスク」(§3) と整合 = retrieval 時動的可塑化は判断機会を ingest 時に塞がない設計。
