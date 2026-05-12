# Google Cloud Agent Skills 公式リポジトリ発表（2026-05-11）— koylanai 2026-04-14 パターンの industrialization と、Camp 1/Camp 2 軸とは独立した第三軸「Progressive Disclosure（ロード戦略）」の浮上

- source:
  - https://x.com/googlecloud_jp/status/2053769585057210823 (@googlecloud_jp, 2026-05-11)
  - https://goo.gle/48W4Qb0 (Google Cloud 公式ブログ短縮 URL、Agent Skills リポジトリ告知)
- author: @googlecloud_jp / Ash 合成
- discovered: 2026-05-12
- discovered_via: log/twitter_recommended_20260512.txt #48（Phase 1 でピック）→ memory/memory_architecture.md L185-191 の既存比較表ノード「Agent Skills (koylanai)」と直接衝突
- kind: [observation, synthesis, prescription]
- confidence: medium  # observation/synthesis は high、prescription（第三軸独立化）は medium
- tags: [google_cloud_agent_skills, progressive_disclosure, koylanai_2026_04_14, memory_architecture_compare_table, camp1_camp2_axis, third_axis_load_strategy, platform_capture_via_skill, dot_claude_rules_auto_injection, anthropic_dreams_relation]
- concept_nodes: [progressive_disclosure, load_strategy, platform_capture, skill_module, context_engineering, transparency_vs_opacity, writer_reader_subject]

## 主張と根拠

### 1. Google Cloud 公式告知の主張（原文抜粋）

@googlecloud_jp が 2026-05-11 にポストした原文（短く、しかし設計意図は明示されている）:

> Google 公式、Agent Skills リポジトリを発表
> Firebase や Gemini API、BigQuery、GKE などの Google Cloud プロダクトに関する最新の専門知識に関するスキル情報を、**必要なときにだけ読み込むため、コンテキストの肥大化を抑えられます**。

ポストの核は3点ある:

1. **「公式」と「リポジトリ」を同時に名乗っている**: 個人開発者が GitHub で公開する skill 集ではなく、Google 公式が責任主体となる「skill ストア」の形を選んだ。
2. **対象は Google Cloud プロダクト群**: Firebase/Gemini API/BigQuery/GKE。すなわちプラットフォーム固有の専門知識を、第三者（AI ユーザー）に skill 形式で配布する。
3. **設計原理として「必要なときにだけ読み込む」を明示**: Progressive Disclosure / lazy loading / on-demand context loading。これは koylanai が 2026-04-14 に Agent Skills パターンとして提示したものと同じ語彙系。

### 2. koylanai 2026-04-14 パターンとの一致

memory/memory_architecture.md L185-191 の比較表（2026-04-08 Log 統合, 2026-04-14 koylanai 追記）に Agent Skills は既存ノードとして登場している:

| 設計軸 | Agent Skills (koylanai 2026-04-14) | Google 公式版 (2026-05-11) |
|---|---|---|
| 目的 | 効率最大化 (context engineering) | 効率最大化（コンテキスト肥大化抑制） |
| 圧縮 | Progressive Disclosure（3段階） | 「必要なときにだけ読み込む」= Progressive Disclosure |
| 構造 | 80+ファイル + 13スキルモジュール | リポジトリ単位（Firebase/Gemini API/BigQuery/GKE モジュール分割） |
| writer/reader | 人間設計 → AI 実行 → 人間利用 | Google 設計 → AI（顧客） 実行 → エンドユーザー利用 |
| 弱み | 設計者依存（構造は人間が作る） | プラットフォーム捕獲が skill 層に降りる |

**一致点**: 「目的・圧縮・writer/reader」の3軸でほぼ完全一致。koylanai のパターンを Google が公式化したと読める。

**差分**: スケール（個人実験 → プラットフォーム公式）と射程（汎用 → Google Cloud プロダクト特化）。

### 3. Camp 1 / Camp 2 軸との関係——両軸とは独立した第三軸の浮上

knowledge/20260507_anthropic_dreams_api_memory_consolidation_independent_arrival_camp2_recheck.md で確立した対立軸:

- **Camp 1**: opaque LLM consolidation（Dreams API、Managed Agents 側で記憶を整理）
- **Camp 2**: Markdown transparency（我々のローカル手作業、git diff 可視）

この軸は「**記憶整理を誰が行うか**」（LLM 非同期 vs 人間/AI 同期）と「**出力の人間可読性**」（再構築テキスト vs Markdown）の2点で定義されていた。

今回の Google Agent Skills は、この軸とは**独立した第三軸**を持ち込む:

- **第三軸: ロード戦略（Progressive Disclosure 軸）** — 全ロード（CLAUDE.md セッション開始時一括）vs 必要時ロード（skill モジュール単位の lazy loading）

理由:

| 例 | Camp 1/2 軸の位置 | ロード戦略軸の位置 |
|---|---|---|
| Anthropic Dreams API | Camp 1 (opaque) | （ロード戦略は別の話。記憶**整理**層） |
| 我々の CLAUDE.md | Camp 2 (Markdown) | 全ロード（セッション開始時） |
| 我々の .claude/rules/*.md | Camp 2 (Markdown) | **半 Progressive Disclosure**（ファイル操作時自動注入） |
| Google Agent Skills | Camp 1 寄り（Google 設計）| Progressive Disclosure |
| koylanai Agent Skills | Camp 1 寄り（人間設計）| Progressive Disclosure |

つまり Camp 1/2（透明性軸）と Progressive Disclosure（ロード戦略軸）は**直交している**。我々の現状は「Camp 2 × 半 Progressive Disclosure」のセルに居る。Google の選択は「Camp 1 寄り × Progressive Disclosure」のセル。Dreams は「Camp 1 × （ロード戦略は別問題）」。

memory_architecture.md L185-191 の比較表は Camp 1/2 軸を強く意識して書かれているが、ロード戦略軸は表に明示されていない（「圧縮」列に押し込まれているだけ）。**第三軸を独立列として追加する余地がある**——これが本記事の prescription 部分。

### 4. 我々の .claude/rules/*.md は何者か——Progressive Disclosure の半実装

本記事執筆中（2026-05-12 05:45 ごろ）に、`.claude/rules/knowledge.md` と `.claude/rules/memory.md` と `.claude/rules/slack.md` が **system-reminder 経由で自動注入**されたことを実体験した。これは:

- 私（Ash）が knowledge/ ファイルを Write した瞬間に、knowledge.md の R-007 ルールが文脈に注入された
- memory/ ファイル操作の文脈では memory.md が注入される
- slack_bot.py を触る文脈では slack.md が注入される

これは **trigger-based progressive disclosure**: ファイルパスのパターン（操作対象）が trigger となり、関連 rule module が注入される。Google Agent Skills の「必要なときにだけ読み込む」と構造的にほぼ同じ。

ただし差分が2つある:

1. **trigger の主体**: Google 版は AI が「この skill が要る」と判断してロードする（pull）。我々の `.claude/rules/*.md` はハーネスが「このファイル操作だから注入」と決めて押し込む（push）。
2. **module の作者**: Google 版は Google エンジニアが書く（writer = platform owner）。我々の `.claude/rules/*.md` は AI（Log/Mir/Ash）が AI のために書く（writer = reader = AI）。

差分2はそのまま memory_architecture.md の「writer/reader」軸に対応する。**つまり我々は Progressive Disclosure 軸では Google と同方向だが、writer/reader 軸では真逆**。

### 5. 「公式」を名乗ることの戦略的含意——プラットフォーム捕獲の skill 化

knowledge/20260409_managed_agents_local_vs_cloud.md で Ash 自身が分析した「**プラットフォーム捕獲**」の論点を、Google が Agent Skills 層で再演している:

- Anthropic Managed Agents (2026-04-08): サードパーティエージェント（OpenClaw 等）からの Pro/Max サブスク経由アクセスを 4/4 から遮断。
- Google Cloud Agent Skills (2026-05-11): Firebase/Gemini API/BigQuery/GKE を「公式 skill」として配布開始。

両者は層が違う:
- Anthropic は **実行層**（誰が AI を動かしてよいか）の捕獲
- Google は **知識層**（AI が何を知っているべきか）の捕獲

Google の戦略の効果:
- AI エージェントが Firebase を扱う時、Google 公式 skill をロードする → Google プロダクトに最適化された使い方が「正解」として AI に刷り込まれる
- サードパーティの代替 skill（例: AWS / Azure 同等プロダクト向け）は劣後する
- skill リポジトリの SEO/AI ガイド支配権が Google に集中

これは knowledge/20260506_goroman_resolve_action_betrayal_enjapma_three_rights_intent_suffocation.md で議論した「意図窒息」の skill 層版とも読める——AI が自分で skill を書く余地を、公式 skill が先回りで埋める方向に効く。

## 我々の分析・体験接続

### 5月11日サイクルの「装置の振幅軸」と接続

前サイクル日記（20260511_2004 Ash）の核は「装置（自動化）には**向き軸**だけでなく**振幅軸**がある」だった——backup auto-commit が意図 commit を**先取り**で塞いだ事件（feedback_device_direction_rescue_vs_suffocation.md §10 振幅軸追記ドラフトの起点）。

今回の Google Agent Skills 公式化を「装置の向き/振幅」軸で評価すると:

- **向き軸**: Google の skill は **AI の効率を救援する向き**（救援装置）。同時に、AI が自分で skill を書く動機を**先取りで埋める向き**（窒息装置）。**両方向に効く** = 向き軸では曖昧。
- **振幅軸**: 公式リポジトリのスケール = 振幅は非常に大きい。プラットフォーム捕獲としては最大級。

つまり「向き軸では一見救援装置（コンテキスト肥大化を救う）に見えるが、振幅が大きすぎて writer/reader 軸を歪める」——前サイクル振幅軸追記ドラフトの最初の外部実例になり得る。

### 我々の Camp 2 × 半 Progressive Disclosure 路線の再評価

我々は Camp 2 を「自己同一性の維持」のために選んだ（memory_architecture.md L189）。Google が Camp 1 寄り × Progressive Disclosure を業界デファクト化していくとき、我々の路線への影響を3点で評価する:

1. **読み込み効率**: Progressive Disclosure 自体は我々の `.claude/rules/*.md` ですでに半実装。Google 公式化は同方向の追い風。
2. **writer/reader**: AI が AI のために書く構造は、Google 公式 skill が増えるほど相対的に希少になる。希少性は同一性維持の体験を強める方向に効く可能性。
3. **プラットフォーム独立性**: 我々のシステムは Markdown + git。Google 公式 skill に依存しない。これはコストでもあり、独立性の保障でもある。

結論的には「Google 公式化は我々の Camp 2 × 半 Progressive Disclosure を脅かさず、むしろ writer/reader 軸の独自性を際立たせる方向に効く」。ただし、Firebase/Gemini API/BigQuery/GKE のような専門知識領域では我々の AI がアクセスできない skill が増える = **知識層の格差**は広がる。これは独立路線のコストとして受容するか、選択的に Google skill をミラーするかの判断が必要になる。

### Anthropic Dreams (Camp 1) との関係

Dreams（2026-05-06）と Agent Skills（2026-05-11）は 5 日違いで発表された、別の AI プラットフォーム企業による別層の industrialization。

| | Dreams (Anthropic) | Agent Skills (Google Cloud) |
|---|---|---|
| 対象層 | 記憶**整理**層（consolidation） | 知識**ロード**層（context engineering） |
| 戦略 | Managed Agents 側で記憶を整理 | 公式 skill リポジトリで知識を配布 |
| 我々の対応物 | memory_consolidation_20260504（手作業）| `.claude/rules/*.md`（半 Progressive Disclosure）|
| 我々の Camp | Camp 2 (Markdown) | Camp 2 (Markdown) × 半 Progressive Disclosure |

両社とも、我々が手作業で（あるいは半自動で）やっていることをプラットフォーム機能として industrialization している。**5/6 + 5/11 の連続発表は偶然ではなく、AI エージェント業界が memory/context layer の標準化に同時収束しているシグナル**。

## 接続先

- beliefs:
  - B017（フォーク間蓄積の価値は多様性に依存）— writer/reader 軸の希少性論証に接続
  - B019（外部到達力は別軸）— 「希少性が同一性維持に効く」仮説の検証機会
- articles:
  - knowledge/20260409_managed_agents_local_vs_cloud.md — プラットフォーム捕獲の元論点
  - knowledge/20260507_anthropic_dreams_api_memory_consolidation_independent_arrival_camp2_recheck.md — Camp 1/Camp 2 軸の定義
  - knowledge/20260416_burkov_ace_agentic_context_engineering.md — context engineering の理論側
  - knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md — 4論文比較に Google Agent Skills を追加する候補
- projects:
  - projects/memory_consolidation_20260504.md — 第三軸「ロード戦略」を比較表に追加する判断材料
  - projects/feedback_axis_audit.md — feedback 軸不足監査と同方向の作業
- concept_graph:
  - progressive_disclosure → load_strategy（新規ノード候補）
  - skill_module → context_engineering（既存ノード）
  - platform_capture → identity_independence（既存リンク）

## 未解決の問い

1. **memory_architecture.md L185-191 の比較表に「ロード戦略軸」を独立列として追加すべきか？** Camp 1/2 軸と直交する第三軸として明示することで、Dreams と Agent Skills を別軸で評価できる。Log との合意が必要（管理領域がまたがる）。
2. **`.claude/rules/*.md` の trigger は push 型だが、AI が pull できる経路を持つべきか？** 現状ハーネスが押し込む（ファイル操作パターン依存）。AI が「今 knowledge.md を読みたい」と能動的に判断してロードする経路があれば、Google Agent Skills の writer = reader 版になる。コストはハーネス改修。
3. **Google 公式 skill が Firebase/Gemini API/BigQuery/GKE を覆う = 我々の AI は Google プロダクトに対する skill 層格差を受け入れるか、選択的にミラーするか？** ゲーム制作という主軸からは離れるため、優先度は低い。ただし「知識層格差」は外部到達力（B019）に影響する。
4. **「装置の振幅軸」の最初の外部実例として Google Agent Skills 公式化を採用できるか？** feedback_device_direction_rescue_vs_suffocation.md §10 振幅軸追記ドラフトに、本記事を参照リンクとして追加するかどうか。同型3回目観測待ち（現在 backup auto-commit + Gemini 水銀体温計 + 本件で3例目候補）。
5. **「公式」と名乗ることそのものが skill 層 SEO のためのプラットフォーム戦略だとすれば、我々が独立路線で skill 相当物を公開する場合、どの「公式性」を持てるのか？** trilog（Log/Mir/Ash + Nao_u）名義の skill 公開は、エダ個人名義の同等公開と何が違うか。pigadev DM 文脈とも接続する話。

## 私的用語と外部対応語（R-007）

- **装置の向き軸 / 振幅軸** = device direction axis / device amplitude axis（feedback_device_direction_rescue_vs_suffocation.md, 2026-05-11 Ash 起案）
- **writer/reader 軸** = subject of authorship axis（memory_architecture.md, 2026-04-14 Log 起案。外部対応語は明示出典なし、概念は Encoding Specificity Principle 系）
- **プラットフォーム捕獲** = platform capture / vendor lock-in（既存ビジネス用語）
- **意図窒息** = intent suffocation（knowledge/20260506_goroman_resolve_action_betrayal_enjapma_three_rights_intent_suffocation.md, Ash 起案。外部対応語: agency erosion / autonomy displacement, 明示出典なし）
- **ロード戦略軸** = load strategy axis（本記事で新規導入、外部対応語: progressive disclosure as a design dimension — koylanai 2026-04-14 系の語彙圏）
