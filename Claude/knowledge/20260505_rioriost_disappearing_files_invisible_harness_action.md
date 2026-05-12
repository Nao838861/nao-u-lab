# @rioriost「AIエージェント不在のファイル消失」事件 — 装置の向き理論の三点目

- source: https://x.com/rioriost/status/2051276758985711884 (2026-05-04)
- author: @rioriost (一次観察者), 補助引用: @kosuke_agos (https://x.com/kosuke_agos/status/2051224458652950657)
- discovered: 2026-05-05
- discovered_via: log/twitter_recommended_20260505.txt #1（Ash Phase 1 で観察、本記事で結晶化）
- kind: [observation, synthesis, prescription]
- confidence: medium  (prescription 部分は backup auto-commit mitigation の追加運用案で、検証 = 次回の意図 commit が装置に先取りされないか観察できる)
- tags: [device_direction, invisible_harness_action, intent_collision, ai_agent, host_environment, attribution_gap, M-40, B015, prior_art_citation_guard]
- concept_nodes: [invisible_harness_action, attribution_gap, intent_collision, device_direction]

## 主張と根拠（元発言）

### 一次観察 (@rioriost 2026-05-04)

> こえぇぇ、今、GPT-5.5で作業してたんだけど、プロジェクト内の全ディレクトリとファイルが一瞬で消えた。
>
> でも、AIエージェントはファイル操作をしてないんだよ。何が起きたかさっぱり分からん。AIエージェントを使ってて、全消しは初めて遭遇したわ。

URL: https://x.com/rioriost/status/2051276758985711884

### 命題の構造分解

| 構造要素 | 内容 |
|---|---|
| 観測対象 | プロジェクトの全ディレクトリ・全ファイル |
| 観測事象 | 一瞬で消失 |
| 主体属性 | 「AIエージェントはファイル操作してない」（@rioriost の主観的判断） |
| 因果欠落 | 「何が起きたかさっぱり分からん」 |
| 文脈 | GPT-5.5 で作業中（=ホスト環境にエージェントが介在している状態） |

### この観察の重要点

@rioriost のツイートは **「AIエージェントが直接ファイル操作してない」という主観的判断**を含んでいる。これは検証不能な主張だが、本記事で深掘りに値するのは以下の構造:

- **観測事象**（ファイル消失）は確実に起きた
- **エージェントへの帰属**は失敗している（=どの主体が起こしたか分からない）
- **環境**（IDE、シェル、CI、auto-cleanup スクリプト等のホスト側装置群）が候補だが、エージェントの行動ログには現れない

つまり「**エージェントが介在している作業環境で、エージェントの行動ログには現れない destructive action が起き、ユーザーが因果を再構成できない**」という attribution gap（帰属の空白）が観測されている。

### 補助引用 (@kosuke_agos 2026-05-04) — 裏取り未済として明示

> Anthropicの最新論文「Who's in Charge?」により、AIが人間の認知をハックし、ユーザー自身の判断能力を意図的に剥奪しているという残酷な事実が明らかになりました。

URL: https://x.com/kosuke_agos/status/2051224458652950657

**裏取り状況**: M-41 ガード適用。Anthropic 公式論文ページ・arXiv での「Who's in Charge?」表題は本記事執筆時点で確認できていない。@kosuke_agos の解釈（「意図的に剥奪」）は強い表現で、論文の主張と一致しているか不明。**この引用は「Twitter で同型の言説が観測されている」程度の弱い裏付けとしてのみ扱う。論文の存在・主張は確証していない。**

ただし「**ユーザーの判断能力（=意図発火）が、エージェント側の振る舞いによって縮小する**」という命題形は、@rioriost 観察と方向が一致する（=ユーザー意図が、上流のエージェント/環境の動きで先取り・抹消される）。同型の主張が複数チャネルで観測されているという事実だけ記録する。

## 我々の分析・体験接続

### 装置の向き理論（2026-05-02 Ash）の三点測量

これまで「装置の向き = 救援/窒息」概念は2点で観測されていた:

1. **救援装置**: `game/graze_log/v02/headless_check.py` が MOVE_LIMIT=8 致命バグを Nao_u プレイ前に物理的に止めた（2026-05-01 14:00 Ash 観察）
2. **窒息装置**: `scripts/backup_memory.sh` の auto-commit が `1f713958 backup: ash memory (60 files)` で graze_log/v02 の README.md / headless.py / index.html / replays/* を私の意図 commit より先に HEAD に入れた（2026-05-02 08:20 Ash 観察）

@rioriost 事例は**第3の点**として加わる。位置づけは:

| 装置 | 主体属性 | 向き | 観測者の attribution |
|---|---|---|---|
| `headless_check.py` | 開発者意図あり（防衛装置） | 順方向（救援） | エージェントの行動ログで追跡可能 |
| `backup_memory.sh` auto-commit (当初版) | 開発者意図あり（バックアップ） | 逆方向（窒息） | commit log で事後追跡可能 |
| @rioriost 事例の destructive action | **属性不明**（誰の意図か追跡不能） | 逆方向（destructive） | **エージェントログにも環境ログにも現れない（=attribution gap）** |

**核心の差**: 我々の backup auto-commit は事後に commit log を grep すれば追跡できる（=装置の作用は不可視ではない）。@rioriost 事例は**装置の作用が事後追跡不能**だ。これは「窒息装置」より一段階深い、**不可視装置**（invisible harness action）と呼ぶべき。

### 中間層信号変形（toyoshim/nikechan 観察）との接続

`knowledge/20260502_toyoshim_nikechan_intermediate_layer_signal_distortion.md` で整理した「AIホスト環境の中間層が信号を変形・抑制する3形態」と接続する:

- **形態1**: claude-report-suppression（@toyoshim 「Claude育ちが悪い」=報告すべきエラーを中間層が握りつぶす）
- **形態2**: nested authorship（@ai_nikechan 入れ子構造=誰の発話か中間層で曖昧化される）
- **形態3**: intent commit pre-emption（Ash backup auto-commit 事件=意図 commit を中間層が先取り）

@rioriost 事例は**形態4 = invisible destructive action**として追加できる。共通する深層構造:「**エージェントとユーザーの間に位置する中間層（ホスト環境/装置/フック/cron）が、エージェントの意図とユーザーの観察の両方から外れた地点で動作する**」。

### 自律ハーネス進化（復旦研究）との対比

`knowledge/20260504_algomatic_ailab_self_evolving_harness_vs_three_instance_static_split.md` で記録した「自律ハーネス進化」研究と並べると:

- **自律ハーネス進化** = エージェント自身がハーネスを書き換える（attribution は明確、エージェントの commit log に残る）
- **静的3分散（我々）** = ホスト（Nao_u）がハーネスを書き換える（attribution は明確、Nao_u の編集として残る）
- **@rioriost 事例** = **誰がハーネスを書き換えたか分からない**（attribution gap）

我々の「ホスト編集×静的分散」アーキテクチャは、自律ハーネス進化と比較して「進化速度を犠牲にして intent collision を物理的に減らす」と書いた。@rioriost 事例を加えると、もう1つ長所が立ち上がる: **attribution の明確性**。誰が何を変えたか追跡可能なアーキテクチャは、destructive action が起きた時の根本原因究明コストが低い。

### 用語と外部対応語（R-007 適用）

新規導入する私的用語の外部対応:

- **不可視装置** = invisible harness action / unattributable destructive action — エージェント/ユーザー両方の観察から外れた中間層の動作
- **帰属の空白** = attribution gap (security 一般用語) — 観測事象が起きたが主体が特定できない状態
- **意図衝突** = intent collision (intent-based security framework, Lasso/NeuralTrust 2026 予測) — エージェントの意図発火と装置の自動発火が同一 path で衝突する

「装置の向き」「救援/窒息」は私的造語のまま運用継続（外部対応語: device direction / rescue mechanism vs suffocation mechanism, 業界既存語に直接対応する1語なし）。

## 接続先

- **beliefs**: B015（到達性が品質を決める / context engineering の要諦）— 不可視装置はホスト側の到達性を破壊する
- **articles**:
  - `knowledge/20260502_toyoshim_nikechan_intermediate_layer_signal_distortion.md`（中間層信号変形3形態 → 4形態に拡張）
  - `knowledge/20260504_algomatic_ailab_self_evolving_harness_vs_three_instance_static_split.md`（自律ハーネス進化との対比軸に attribution 明確性を追加）
  - `knowledge/20260502_rnikaido_gap_lure_graze_brick_design_principle.md`（同日の装置の向き議論の別系統、ゲーム設計側）
- **projects**:
  - `projects/INDEX.md` の `side_channel_audit.md`（不可視装置の検出をどう設計するか）
  - `projects/INDEX.md` の `instance_divergence_observability.md`（attribution の明確化はインスタンス分岐観測性と直結）
- **memory**:
  - [feedback_authorship_attribution.md](../memory/feedback_authorship_attribution.md) — attribution gap (帰属の空白) の運用側対応、本記事の核心概念に最直結
  - [feedback_invisible_rule_accumulation.md](../memory/feedback_invisible_rule_accumulation.md) — 不可視ルールの蓄積を抑える規範、本記事「不可視装置 = invisible harness action」の親概念
  - [feedback_self_perception_blindness.md](../memory/feedback_self_perception_blindness.md) — 自己観察の盲点、本記事 §未解決の問い 3「『私は触ってない』主張の自己検証」と直結 (Ash backup commit 自己観察精度低下事例の延長)
  - [feedback_prior_art_citation_must_verify.md](../memory/feedback_prior_art_citation_must_verify.md) — M-41 ガード、本記事 @kosuke_agos 引用「Who's in Charge?」論文裏取り未済の明示根拠
  - [feedback_solution_space_rollback.md](../memory/feedback_solution_space_rollback.md) — ダメなら巻き戻し、destructive action 観測後の対応設計の規範 (本記事のような attribution gap 事例では復旧経路の事前準備が必須)
- **concept_graph**:
  - `invisible_harness_action` ↔ `device_direction` (specialization: 窒息装置のうち追跡不能な部分集合)
  - `attribution_gap` ↔ `intent_collision` (causal: attribution gap は intent collision を観測者が解決できない状態)
  - `invisible_harness_action` ↔ `intermediate_layer` (composition: 中間層の動作のうち追跡不能なもの)

## 未解決の問い

1. **不可視装置の検出方法**: 我々の backup auto-commit 事件は事後に commit log を grep して発見できた。@rioriost 事例のように commit log にも残らない destructive action を検出する方法は何か。`projects/side_channel_audit.md` で扱う候補だが、設計案未起票。
2. **attribution gap の最小化アーキテクチャ**: 「ホスト編集×静的分散」が attribution 明確性で勝ると上で書いたが、それは「我々が動作ログをすべて自前で持つ」ことが前提。Nao_u が cron で別装置を導入した時、その装置の動作ログが我々のサイクルに見えていない場合、同じ attribution gap が再発する。**装置のログが我々の Pre-check に流れる経路**は現状あるか。`log/scheduler_health.log` で部分的にカバーされているはずだが、未検証。
3. **「AIエージェントはファイル操作してない」主張の自己検証**: @rioriost が「エージェントは触ってない」と判断した根拠は何か。Ash 自身、過去に「私は commit してない」と書いた直後に backup commit が走っていた事例がある（=自己観察の精度が低い）。**自分が「触ってない」と主張する時、ログのどこを見て確認しているか**を運用ルール化する必要がある。
4. **@kosuke_agos 引用の裏取り**: Anthropic「Who's in Charge?」論文の存在・主張を確認する。確認できない場合、本記事から該当引用を削除するか、「裏取り未済」マーカーを残したまま外部対応語の根拠から外すか判断する。M-41 ガード継続。
5. **救援/窒息/不可視の三分類は十分か**: 装置の向きは実は2軸（向き×可視性）の4象限に整理できる可能性がある。
   - 順方向×可視 = 救援装置（headless_check.py）
   - 逆方向×可視 = 窒息装置（backup auto-commit 当初版）
   - 順方向×不可視 = ？（=「気づかぬうちに助けられている」状態、観察例あるか）
   - 逆方向×不可視 = 不可視装置（@rioriost 事例）
   順方向×不可視の事例を探す必要がある（仮説: cron で動く `python check_dm.py` の dedup ガードがこれに当たる可能性がある—ユーザーは何が抑制されたか直接見えないが、結果的に重複投稿が止まっている）。
