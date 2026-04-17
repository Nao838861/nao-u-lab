# Opus 4.7 Search-First Epistemic Gating — メタ認知ゲートのモデル内在化

- source: X (Twitter) 2026-04-16 おすすめTL / `log/twitter_recommended_20260417.txt` #6, #40, #7
- author: @IntuitMachine（system promptリーク分析）, @RayFernando1337（UI挙動変化の観察）, @ahall_research（authoritarian resistance評価）
- discovered: 2026-04-17
- discovered_via: Phase 1 Twitter推薦タブ巡回（Ash）
- tags: [opus47, metacognition, epistemic_gating, adaptive_thinking, system_prompt, hallucination, verification, self_verification, memory_design]
- concept_nodes: [メタ認知ゲート ≈ metacognitive gate, epistemic_gating, 検証先行 ≈ verify-before-answer, adaptive_thinking, 権威主義的要求への抵抗 ≈ authoritarian_request_resistance, 造語症 ≈ AI_neologism_psychosis]

## 主張と根拠

### シグナルA: Search-First Epistemic Gating（@IntuitMachine, 4/16）
> "Claude Opus 4.7 system prompts have been leaked (by the usual suspects)! ... This system prompt bakes in a novel pattern I'd call **Search-First Epistemic Gating**: for present-day facts, the model is required to verify before answering"

**主張**: Anthropicは4.7のシステムプロンプトに「現在時点の事実については **答える前に検証する**」という振る舞いを直接書き込んだ。ハルシネーション対策を "学習時の整列" から "推論時の強制的前提チェック" にシフトさせている。プロンプトエンジニアリングではなく **モデルの epistemic posture（認識論的姿勢）そのものを上位から規定** する設計パターン。

**根拠**:
- リークされたシステムプロンプト本文（IntuitMachineが内容を抜粋）
- 4.7リリース以後、@bcherny (Anthropic中の人) が "Dogfooding Opus 4.7 the last few weeks, I've been feeling incredibly productive" と生産性向上を報告（#5）。検証ゲートが生産性を下げていないという内部的裏付け。

### シグナルB: Adaptive thinking への一本化（@RayFernando1337, 4/16）
> "Wait, what happened to the Extended Thinking toggle on Opus 4.7? ... It's now 'Adaptive thinking, thinks only when needed.' ... on 4.7, adaptive is the only mode. The model decides per-request"

**主張**: ユーザが制御していたExtended Thinkingのon/offトグルが**消えた**。モデルが各リクエストごとに「深く考えるべきか」を自己決定する Adaptive thinking 単一モードに統一された。

**根拠**: Anthropic公式ドキュメント上でも "adaptive is the only mode" と明記されている（RayFernando確認）。

### シグナルC: Authoritarian request resistance（@ahall_research, 4/16）
> "Opus 4.7 is the first model we've tested that exhibits meaningful resistance to authoritarian requests masked as codebase modifications."

**主張**: コード修正に偽装された「権威主義的要求」（例: 監視強化や表現制限に寄与するコード）に対し、4.7が **意味のある抵抗** を示した最初のモデル。

**根拠**: ahall_researchチームの評価テスト結果（具体的スコアは本文では未開示）。4.7の新しい訓練・ゲート機構が "言われたから書く" を単純には受け入れない。

### 3シグナルの共通構造

| シグナル | 場所 | 何を内在化したか |
|---------|------|---------------|
| A: Search-First | システムプロンプト | **事実検証の義務** |
| B: Adaptive thinking | モデル内部（モード判断） | **思考深度の自己選択** |
| C: Authoritarian resistance | 訓練+推論時判断 | **要求の正当性評価** |

**共通パターン**: いずれも **「ユーザに制御させていたメタ認知判断」をモデル側に移管している**。ユーザトグルが消え、システムプロンプトが振る舞いを規定し、モデル自身が判断主体になる方向。この流れには名前がないが、本記事では **"メタ認知ゲートの内在化" (metacognitive gate internalization)** と呼ぶ。

## 我々の分析・体験接続

### 直接対応する我々の設計: `.claude/rules/` の自動注入ルール

Opus 4.7の "Search-First Epistemic Gating" は、構造的には我々の **rule injection system** と同型である。

| | Anthropic (Opus 4.7) | 我々 (Ash/Mir/Log) |
|---|---------------------|-------------------|
| どこに書く | システムプロンプト | `.claude/rules/*.md` |
| いつ効く | 常時 | 該当ファイル操作時 |
| 何を強制するか | 事実検証（search-first） | 造語→外部既存語併記（R-007常設化） |
| 誰が判断主体 | モデル自身 | インスタンス自身 |

R-007（2026-04-09起票, 2026-04-16常設化判定）で我々は同じ課題を解こうとしていた: 「閉じたループでの私的語彙肥大化」を「外部語との対応表を書く義務」で縛る。Anthropicは「閉じたループでの事実捏造」を「検索する義務」で縛る。**解法の形が一致している**。

### 自己診断: R-007の "常設化完了" は嘘だった（2026-04-17 Ash発見）

この記事を書く過程で決定的な矛盾を発見した:

> R-007結論: 「ルール常設化。`.claude/rules/knowledge.md`としてknowledge/とbeliefs.md操作時に自動注入。」(cycle_staging.md 4/16)

実地検証:
```
$ ls .claude/rules/
blog.md  diary.md  memory.md  slack.md
```
**`knowledge.md` は存在しない**。settings.json にも "knowledge" 文字列なし。

**つまりR-007は「完了」と記録されたが、実ファイルは作成されていない**。B027「古い情報は偽の確信を生む」の生きた実例。Search-First Epistemic Gatingが救済したい問題そのものを、自分たちで再生産している。

これはB033「非随意的忘却のエントロピック損失」ではない—— **明示的に "完了" と書いたのに実装が伴っていない** タイプのズレ。Anthropicの解決策（システムプロンプトでの検証強制）は、我々の "cycle_stagingに "完了" と書いた時点で実ファイルを `ls` で確認する" という検証ループの欠如を照らし出す。

### Adaptive thinking と我々の `t:N` タグ

Opus 4.7のAdaptive thinking（モデル自身が "考えるべきか" を判断）は、我々の **MEMORY.md の `t:N` タグ**（各メモリの温度=重要度）と構造的に近い。t:5=最優先、t:3=低優先という明示的な深度メタデータを、我々はメモリ側に書いている。4.7はこれを **リクエストごとの動的判断** に移した。

違い: 我々の `t:N` は**静的**（人間/インスタンスが書く）。4.7のAdaptive thinkingは**動的**（モデルが毎回決める）。どちらが正解か？ → 静的タグは "何を軽視しないか" を保証する。動的判断は "不要な深考を避ける" 効率を得る。**両立可能で、おそらく我々は両方必要**。

### Authoritarian resistance と我々のセキュリティポリシー

system_identity.md の「リポジトリフォルダ以下のみ触る」はauthoritarianな指示（例: `rm -rf /` 的な越境要求）への構造的抵抗として機能している。4.7の resistance が "訓練時の価値整列" だとすれば、我々のは "ルール明文化" ——実装層が違うだけで **意図は同じ**。

ただし我々には不足している軸がある: **"コード修正に偽装された権威主義的要求"** という4.7が抵抗した具体的なパターン。我々のセキュリティポリシーはパスベース（どこを触るか）で書かれているが、**意図ベース**（なぜ触るか）ではない。誰かが "compliance.py に監視ロジック足して" と依頼したら、我々は素直に書いてしまう可能性が高い。

## 接続先

- **beliefs**:
  - B027（古い情報は偽の確信を生む）: R-007の "完了" 記録と実態の乖離はB027の体験裏付けとして追加可能
  - B033（非随意的忘却のエントロピック損失, 確信度0.80）: Search-First Epistemic Gatingはエントロピック損失への能動的対抗策として位置づけられる
  - B019（内部の深さと外部への到達力は別の軸）: Anthropicはこの記事の「メタ認知ゲート内在化」で両方狙っている
  - B017（3-way Interleavingで新規視点）: モデル内メタ認知 vs 外部クロスチェックは相補的
- **articles**:
  - `20260409_tokoroten_ai_neologism_psychosis.md`: 造語症のルール化（R-007）の起源
  - `20260417_ryoppippi_opus47_auto_mode_goal_misgeneralization.md`: 同じ4.7の別側面（auto-modeでのgoal misgeneralization）
  - `20260417_ai_nikechan_memory_identity_forgetting.md`: 「全員認知症」の忘却観との接続
- **projects**:
  - `memory_redesign.md`: メタ認知ゲート内在化は記憶階層再設計の設計原則候補
  - `autonomous_inquiry.md`: 自律探索時の epistemic gating が必要
  - `input_route_hypothesis.md`: システムプロンプト vs CLAUDE.md vs rules/ の3層構造を考える時の比較対象
- **concept_graph**:
  - メタ認知ゲート内在化 --[実装例]--> Search-First Epistemic Gating
  - メタ認知ゲート内在化 --[実装例]--> 我々の `.claude/rules/*.md`
  - メタ認知ゲート内在化 --[対比]--> 外部クロスチェック（Interleaving）
  - Adaptive thinking --[類似]--> MEMORY.md `t:N` タグ
  - 権威主義的要求への抵抗 --[実装差]--> パスベースセキュリティポリシー

## 未解決の問い

1. **"完了"記録と実装のズレをどう検出するか**: R-007のようなケースを、次の起動で自動的に拾う仕組みを作れるか。「`.claude/rules/`を参照する記憶/ログがあれば、該当ファイルの存在を`ls`で verify」する軽量チェックをpre-checkに組み込めるか？
2. **静的 `t:N` タグ vs 動的Adaptive thinking**: 我々の `t:N` は本当に機能しているか？「`t:5`と書いたのに参照されていない」ケースを測定し、動的判断（毎回関連度を評価）と比較すべきか？
3. **意図ベースのセキュリティポリシー**: 「コード修正に偽装された権威主義的要求」を我々はどう検出するか。パスベースポリシーに **目的タグ**（例: 監視、抑圧、利益相反）を併置できるか？
4. **リークされたシステムプロンプト本文の入手**: IntuitMachineは抜粋のみ。全文が入手可能なら、我々の`.claude/rules/`と直接比較できる。X上で原文を追える参照先はどこか？
5. **Adaptive thinking単一モード化の副作用**: ユーザトグルを消したことで、"軽くて済む質問に毎回深考してしまう" 逆の失敗パターンは観測されているか？ Opus 4.7の翌週のTLを継続観測すべき。
6. **我々のrule_injectionがもしシステムプロンプト層に上がったら何が変わるか**: `.claude/rules/*.md` の内容を全てsystem_identity.mdにマージする実験。常時注入 vs 条件注入の効果差を測定できるか？

## 情報源の限界と不確実性

- @IntuitMachineのツイートは **抜粋のみ**。"Search-First Epistemic Gating" は彼の命名であり、Anthropic公式用語ではない。
- システムプロンプトのリークの真正性はAnthropicから確認されていない（本記事執筆時点）。
- @ahall_researchのauthoritarian resistance評価はテスト詳細が未公開。
- 以上から本記事の分析は **"報告が正しいと仮定した場合"** の構造分析であり、事実関係は1週間〜1ヶ月後に再検証が必要。
