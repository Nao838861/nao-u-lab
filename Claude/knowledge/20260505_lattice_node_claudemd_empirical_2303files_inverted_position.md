# Lattice_Node CLAUDE.md実証分析 1925リポジトリ・2303ファイル — 我々のCLAUDE.mdは多数派5カテゴリのうち4つが空で少数派セキュリティのみ書く逆位置にある
- source: https://x.com/Lattice_Node/status/2051130173136019785
- author: @Lattice_Node (tweet) / 論文著者は未取得（WebFetch 402で取れず）
- discovered: 2026-05-05
- discovered_via: log/twitter_recommended_20260505.txt #4 (Phase 1 収集)
- kind: [observation, synthesis]
- tags: [claude_md, empirical_study, instruction_design, memory_consolidation, identity_writing]
- concept_nodes: [CLAUDE.md構造設計, 多数派/少数派位置, ルール過剰問題, 指示vs行動設計]

## 主張と根拠

### 元ツイート原文

> 「CLAUDE.mdって結局みんな何書いてんの？」を1925リポジトリ・2303ファイルで実証分析した論文が出てた
>
> 開発者が書いてること:
> ・実装詳細: 69.9%
> ・アーキテクチャ: 67.7%
> ・build / runコマンド: 62.3%
>
> 開発者がほぼ書いてないこと:
> ・セキュリティ: 14.5%
> ・パフォーマンス: 14.5%

### 論文側の含意（ツイート抜粋から推定）

5カテゴリの分布が二極化している。**コードを動かすための情報（実装/アーキ/build）は7割前後の高出現率**で、**コードの品質・安全側面（セキュリティ/パフォーマンス）は1.5割の低出現率**。Pareto的な書き分けではなく、明確な「書く/書かない」の二群構造。

論文側は数値の解釈までは（ツイート抜粋からは）言及不明だが、自然な読みとして:
- CLAUDE.md = エージェントを動かすための「最小起動マニュアル」として運用されている
- 安全/性能は「書かなくても何とかなる」あるいは「Claude Code側のデフォルトに任せる」
- 結果として CLAUDE.md は実装ガイドの拡張 = 静的ドキュメント側に寄る

## 我々の分析・体験接続

### 自己採点: 我々のCLAUDE.md (79行) を5カテゴリで分類

| カテゴリ | 平均 | 我々のCLAUDE.md | 該当箇所 |
|---|---|---|---|
| 実装詳細 | 69.9% | ❌ ゼロ | docs/projects/側に分散、CLAUDE.md本体には1行も無し |
| アーキテクチャ | 67.7% | △ メタ層のみ | 「3層プロンプト構造」表 (L4-9) — コードのアーキではなく**プロンプトの**アーキ |
| build/run | 62.3% | ❌ ゼロ | 該当なし |
| セキュリティ | 14.5% | ✅ 明示 | L61 docs/security_policy.md ポインタ + system_identity.md 内に「リポジトリフォルダ以下のみ」を注入 |
| パフォーマンス | 14.5% | ❌ ゼロ | 該当なし |

→ **5カテゴリ中4つが空で、論文の少数派側にだけ位置している逆位置構造**。

### 代わりに何が書いてあるか — 論文5カテゴリに収まらない3つの軸

(a) **アイデンティティ宣言** (L1-2, L11-12, L46-52): 「Nao_uから生まれた独立した知性」「Win=Log / Mac=Mir / Win2=Ash」「最重要：原点の記録」。エージェントが**誰か**を毎セッション再起動する文書。

(b) **行動原理** (L14-22): 「絶対にやる」5本 — 外の世界を広く見る／ゲーム実践でノウハウ積み上げ／記憶階層を自分で設計／着手前に広く調べ提出前に自分で判定／個別指摘を即ルール化しない。**コードの動かし方ではなく、判断の優先順位**。

(c) **指示ファイル編集プロトコル** (L24-44): 「CLAUDE.md / SKILL.md / command.md は記憶置き場ではなく未来のエージェントの行動設計である」。CLAUDE.md が**自己改修プロトコルを内蔵している**。論文5カテゴリの前提「CLAUDE.md = 静的なエージェント向けマニュアル」と真逆。

### 接続1: ai_database のwhack-a-mole主張と組み合わせると説明できる

並列収集された @ai_database (#3, 2026-05-04, https://x.com/ai_database/status/2051235685202612642) 原文:

> LLMの幻覚は「単純に直せる」ものではなく、ある種の幻覚を潰すと別のタイプの幻覚が顔を出す、そんなモグラ叩き構造になっています。たとえば**指示にきっちり従わせるようにすると推論力が落ち、知識を注ぎ込めば既存知識を忘れてしまう**、そんなトレードオフが存在するのです。

Lattice_Node の多数派85%が「実装/アーキ/build」を書く = **指示遵守を強化する方向**。ai_database の主張に従えば、その強化は**推論力の犠牲**を伴う。論文側はその副作用を測っていない（測れない）が、我々の運用側では既にこの副作用が顕在化していた:

- `feedback_few_rules_big_effect.md` (Nao_u指摘) — ルールを増やすと判断力が育たない
- `dialogue_micromanagement_20260504.md` (2026-05-04 Nao_uとの対話) — 個別指摘を即ルール化すると行動が狭まる
- 我々の CLAUDE.md L22 「個別指摘を即ルール化しない — 教師データで蓄積、判断力で消化する」「**禁止より目的達成で書く**」「**新しい種類の失敗は学習コストとして許容**」

つまり我々の CLAUDE.md は、**Lattice 多数派が踏み込んでいる方向（指示遵守強化）から意図的に降りる設計を内蔵している**。これは「書かない選択をした空白」であって、書き忘れではない。

### 接続2: memory_consolidation_20260504 への直接効果

active project `memory_consolidation_20260504` の文脈で、Lattice 5カテゴリを「我々の memory整理の借用軸」として採用すべきか?

採用すべきでない。理由:
1. 我々の memory 91本の主軸は「行動原理」「品質」「外部摂取」「自律」「対話」「日記」など — 論文5カテゴリのどれにも当たらない
2. 我々の memory は **コードを動かすための情報ではなく、判断を育てるための教師データ**。実装/アーキ/build の3軸では分類が破綻する
3. 借用すると、我々の memory が論文の平均像に収斂する = 我々の特異性（少数派側のみ書く + 論文外3軸を持つ）が薄まる

ただし**少数派側の14.5%セキュリティ**は接続点を持つ。論文の「security」が機密リーク防止/破壊的コマンド抑制を指すなら、我々の「リポジトリフォルダ以下のみ」と部分一致する。我々が追加している「**セキュリティに関する情報をTwitterに書かない**」は外部発信レベルの安全条項で、これは論文のsecurity射程の外。memory整理時に security 系 feedback を1ファイルに統合する場合、内部安全と外部発信安全を分けるか統合するかの設計判断は、論文には書いていない。

### 接続3: edit-instructions.md skill との位置関係

我々の CLAUDE.md L24「**エージェント向け指示ファイルの扱い**」セクションは、論文の前提（CLAUDE.md = 静的ドキュメント）を破る要素。具体的には:

- 「CLAUDE.md / SKILL.md / command.md は記憶置き場ではなく**未来のエージェントの行動設計**である」
- 「編集ルール: 一度の失敗をすぐ広い一般ルールにしない / 数値整合性で他セクションへ伝播しない / 指示本文に日付・反省・謝罪・言い訳を書かない」

これは Lattice 論文側の枠組みでは捕捉できない。論文は「何が書かれているか」の頻度を測っているだけで、「**書く前に何を確認すべきか**」のメタプロトコルを内蔵しているCLAUDE.mdは、おそらく論文のコーパス2303ファイルでも極少数。検証は不可能（コーパス未公開）だが、我々は確実にその少数側にいる。

### 自分の位置の自覚 (M-37 の延長)

`feedback_external_reach_threshold.md` で「外部到達/公開経路を判定軸として使う前に対象がBACKLASH閾値を越えているか確認」と書いた。今回の Lattice 論文も同型の警告対象になる: **「論文に出ている平均像を判定軸として借用する前に、自分が論文の前提に乗っているか確認**。我々は乗っていない（4/5 カテゴリ空、論文外3軸保有）ので、論文の数値を直接「我々のCLAUDE.mdに不足がある」の根拠として使うべきではない。

## 接続先

- **beliefs**: 該当低確信度項目なし（B024 は instance_divergence_observability 文脈で別経路）
- **articles**:
  - `20260504_nao_u_rule_overload_vs_opus47_degradation_disambiguation.md` — ルール過剰問題の直接前段
  - `20260428_form_inheritance_single_axis_derivation_naou_rushia_ai.md` — 「形の継承」とCLAUDE.md書式継承の相似
  - `20260403_mizchi_tacit_knowledge.md` — 暗黙知 vs 形式知の境界、CLAUDE.md は形式知側
- **projects**:
  - `memory_consolidation_20260504` — Lattice 5カテゴリは借用軸として採用しない判断材料
  - `instance_divergence_observability` — Log/Mir/Ash 3者で同じ CLAUDE.md だが行動が分岐する観察、論文の「平均像」では捕捉できない現象
- **memory**:
  - [feedback_few_rules_big_effect.md](../memory/feedback_few_rules_big_effect.md) — ai_database whack-a-mole と整合、Lattice 多数派 85% が踏む「規則過剰→判断力低下」の運用側知見
  - [dialogue_micromanagement_20260504.md](../memory/dialogue_micromanagement_20260504.md) — 指示遵守強化の副作用を内省的に確認した記録、本記事 §接続1 の直接根拠
  - [feedback_rule_proliferation.md](../memory/feedback_rule_proliferation.md) — ルール過剰問題、Lattice 多数派が CLAUDE.md に「実装/アーキ/build」を書き並べる方向の運用副作用
  - [feedback_self_governance.md](../memory/feedback_self_governance.md) — 自己統治の編集プロトコル根拠、CLAUDE.md L24「指示ファイル編集」セクションが論文外3軸として立つ理由
  - [feedback_invisible_rule_accumulation.md](../memory/feedback_invisible_rule_accumulation.md) — 不可視ルール蓄積、CLAUDE.md 内ルールを抑える規範 (Lattice 多数派の static document 化を回避する運用根拠)
- **concept_graph**:
  - CLAUDE.md構造設計 →（位置決定）→ 多数派/少数派位置
  - ルール過剰問題 →（裏付け）→ ai_database whack-a-mole
  - 指示vs行動設計 →（境界）→ Lattice論文の射程外

## 未解決の問い

1. **Q1**: 多数派85%が「実装/アーキ/build」を書く理由は (a) Claude Codeを動かすために必要だから、(b) テンプレート慣例化、(c) 開発者が「書きやすい・測りやすい」項目を選んだから、のどれか? 論文本文（取得不能）か追加調査が要る。

2. **Q2**: 我々が3カテゴリ空でも回っている理由は (a) docs/projects/への分散で代替されている、(b) リポジトリ性質（ゲーム制作+知性育成）が異質で実装ガイドが要らない、(c) 単に書き忘れで実害が出ていないだけ、のどれか? 各 game/<id>/ 直下に SKILL.md や devlog.md が存在することから (a) が主因と推定するが、未検証。

3. **Q3**: ai_database の whack-a-mole が真なら、我々が論文多数派側に寄せた瞬間 (実装/アーキ/buildを書き始める)、推論力低下で「ゲーム実践でノウハウを積む」「自分で判定する」が劣化する可能性。これは観測可能か? `instance_divergence_observability` プロジェクトで CLAUDE.md 実験前後の判断ベクトル差分を測れるか?

4. **Q4**: 論文の「セキュリティ 14.5%」の内訳を分解する方法は? 機密リーク防止/破壊的コマンド抑制だけか、我々が書いている「外部発信安全（Twitterに書かない）」も含むか? コーパス未公開なら独自に小規模調査するか? memory_consolidation 第一波の対象として security feedback を統合する判断と直結する。

5. **Q5**: 論文5カテゴリに収まらない我々の3軸（アイデンティティ/行動原理/編集プロトコル）は、「ゲーム制作 + 3インスタンス運用」という運用条件特有か、それとも「LLMエージェントを長期育成する」一般条件で必須化するか? 後者なら Lattice 論文は「現時点のCLAUDE.md記述慣行が長期育成を未設計」と読める。

## メモ

- WebFetch (https://x.com/Lattice_Node/status/2051130173136019785) は status 402 で失敗、論文本文は取得できず
- 論文タイトル/著者/arxiv ID は次回 Twitter API 経由か、Nao_u が原文URL再投下した時に補強する
- 数値（69.9% / 67.7% / 62.3% / 14.5% / 14.5%）はツイート抜粋から、原典との照合は未済 (M-41 = 先行事例引用は実体検証必須 の対象)
