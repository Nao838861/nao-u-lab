# EntiGraph（合成継続事前学習）— 少量コーパス内在化手法を、fine-tuneできない我々がどう借りるか

- source: https://arxiv.org/abs/2409.07431 （HTML版 https://arxiv.org/html/2409.07431v2 で本文確認）
- paper_title: Synthetic Continued Pretraining (Yang et al., Stanford)
- venue: ICLR 2025 Oral
- author: Zitong Yang et al. / 紹介ツイート: @DL_Hacks (2026-04-24)
- tweet_url: https://x.com/DL_Hacks/status/2047528361187311776
- discovered: 2026-04-24
- discovered_via: log/twitter_recommended_20260424.txt #14
- kind: [observation, synthesis, prescription]
- confidence: low （我々はfine-tuneできないので、論文の主張そのままは使えず、派生的な適用案を提案している段階）
- tags: [small_corpus, synthetic_data, continual_pretraining, entity_graph, game_lessons, retrieval_expansion, memory_hierarchy, training_vs_inference]
- concept_nodes: [蓄積×圧縮, 少量高密度コーパス, retrieval拡張, parametric_vs_nonparametric, 付喪神密度]

## 主張と根拠（原典読了済み）

### 手法の構造

EntiGraphは「小さな専門コーパスを、LLMに内在化させるための合成データ生成パイプライン」である。

**手順**:
1. 小コーパス内の**顕著なエンティティ** `{E₁, ..., Eₙ}` を抽出（entity_extraction prompt）
2. エンティティの**ペア・三つ組**について、原文との関連を踏まえた**多様な関係文**を合成（relation_analysis prompt）
3. 生成した合成文で**継続事前学習（CPT）**を行う

比喩としては「知識グラフの辺を、合成文という形で体系的に踏破する」。

### 実験設定と数値

| 項目 | 値 |
|---|---|
| 元コーパス | QuALITY（長文読解用の265冊・記事） |
| 元の語数 | **1.3Mトークン** |
| 合成コーパス語数 | **455Mトークン**（約350倍） |
| ベースモデル | Llama 3 8B |
| 合成生成LLM | GPT-4-turbo |

| 条件 | QA精度 |
|---|---|
| Llama 3 8B Base（閉書） | 39.49% |
| Raw CPT（原コーパスだけで継続事前学習） | 39.49%未満（**悪化**） |
| Rephrase CPT（38M、単なる言い換え合成） | 低いスケーリング |
| **EntiGraph CPT（閉書）** | **56.22%** (+16.73%) |
| Llama 3 8B Base + RAG（開書） | 60.35% |
| **EntiGraph CPT + RAG（開書）** | **62.60%** (+2.25% over RAG単体) |

### 理論的主張（混合指数関数）

学習曲線:
```
Acc(M_t) ~ p + C · (1 − Σ_k μ(k)(1 − a_k)^t)
```

- `C` = 元データから演繹可能な頂点ペアの割合（"deductive closure"）
- `μ(k)` = 減衰速度 `a_k` を持つ関係の密度
- 曲線は**複数の異なる減衰率を持つ指数の重ね合わせ**

意味: 内在化は一様に進むのではなく、「速く埋まる関係」と「遅く埋まる関係」が混ざる。`C` に漸近する過程は **演繹閉包の充填**として数式化される。

### RAGとの相補性

- RAGは非パラメトリック（推論時に文書検索）
- CPT後のモデルはパラメトリック（重みに知識が乗る）
- 両者は独立軸で、**足し合わせたとき最大**(62.60%)になる

単純な言い換えCPT（Rephrase CPT）はスケールしないが、EntiGraphはエンティティ間の**関係グラフ踏破**が本質的に異なる。

---

## 我々の分析・体験接続

### 我々の"少量コーパス"は game_lessons_log.md である

| 項目 | EntiGraph | 我々 |
|---|---|---|
| 小コーパス | QuALITY 1.3Mトークン | `memory/game_lessons_log.md` 217行（~40教訓） |
| 内在化したい内容 | 小説の登場人物・筋の知識 | ゲーム制作の暗黙知（M-10「ヘッドレス✅は面白さを測れない」等） |
| 学習方法 | Llama 3 8B CPT | **不可能**（Opus 4.7 API経由、重みに触れない） |
| 推論時の補完 | RAG | `memory_search.py` / grep |

**我々の制約**: fine-tuneも continual pretrainingも不可能。CPT側の56.22%向上は借りられない。

### では何が借りられるか — 3つの派生適用案

#### 案A: 合成"関係インデックス"による retrieval surface 拡張

EntiGraphの手順を「CPT用データ」ではなく「**retrieval用インデックス拡張**」に転用する。

- 現状: `memory_search.py` は `game_lessons_log.md` の原文しか引けない。「罰 抜け道」で検索しても、M-12（罰ではなく報酬で設計せよ）にはヒットするが、M-11（対症療法の積み重ね）とM-12の**関係**には直接ヒットしない
- 提案: M-10〜M-14のペア/三つ組について、**関係を記述した合成ブリッジ文**をオフラインで生成し `memory/game_lessons_crosslinks.md` のような補助ファイルに格納
- 例: 「M-10（ヘッドレスは面白さ未測）＋ M-11（対症療法の積み重ね）＋ M-14（核の体験言語化）は、**『測定器と体験のズレを対症療法で塞ぐと核体験が潰れる』という1つの失敗回路**として連結している」
- Rephrase CPTが効かず EntiGraphが効く理由（言い換えでなく関係探索）と同じ構造で、grepヒット率の拡大を狙う

**RAG+EntiGraphの相補性のアナロジー**: 原典grep（=RAG）＋合成クロスリンクgrep（=CPTの代替）の二段検索。

#### 案B: ジャンル別"演繹閉包"ブリーフの事前合成

混合指数関数の`C`（到達可能なペアの割合）を、**ジャンル文脈に絞った時の閉包**として事前計算する。

- 新しいゲーム（例: 1x111型ミニSTG）を始めるとき、game_lessons_log.md 全体を context に流しても 4.7の長文脈劣化が起きる
- ジャンル別に「このジャンルで再使用可能な教訓のクロス関係」を事前結晶化したブリーフを作っておけば、Phase 1で **1つだけ読めば済む**
- これは `projects/rlm_skill_prototype.md`（memory grep 2ホップ穴埋め）と**同じ問題の別解**: RLMはスキル化、本案はブリーフ化

#### 案C: "slow pairs" の特定と手動結晶化

混合指数関数の含意: 関係には**速く埋まるもの**と**遅いもの**がある。我々の場合、memory_search.py で引けない教訓は「遅い関係」に相当する。

- 運用: 前サイクルで見落とした教訓（human-steeringで指摘されたもの）を「slow pair」としてマーク
- `memory/feedback_retrieval_game_lessons.md` 経由で既に1件発生済み（罰/抜け道 → M-12 を引けなかった件、Nao_u 2026-04-23 00:29 指摘）
- slow pairだけに絞って合成ブリッジ文を書けば、全ペア展開（350倍）を回避しつつ効果領域に集中できる

### 既存知識・信念との突き合わせ

- **B028 fusion=魂（beliefs.md）**: 異なる素材を1概念に融合→密度。EntiGraphの関係グラフ踏破は**機械化されたfusion**に近い。人間が手でやるfusionを、LLMが合成する形
- **20260412_tsukumogami_density_model.md**: 「蓄積×圧縮＝魂」。EntiGraphは**蓄積（合成350倍）×圧縮（重みへの内在化）＝密度**の実証。圧縮が効くのは「言い換え」ではなく「関係探索」でなければならない、という制約条件を加える
- **20260422_google_reasoning_bank_success_failure_memory.md**: ReasoningBankは成功/失敗の推論軌跡を記録。EntiGraphは軌跡**間の関係**を合成。両者は直交——Reasoning Bankが個別軌跡を貯め、EntiGraph的合成が軌跡間を結ぶ
- **20260424_meds_failure_memory_training_vs_inference_gap.md**（今朝のLog記事）: MEDSは訓練時記憶、我々は推論時記憶という"層の違い"指摘。EntiGraphも訓練時手法だが、**案A/B/Cは推論時retrieval層に平行移植している**。Logの指摘した層ギャップを、合成インデックス＋RAGの形で橋渡ししようという試み
- **付喪神モデル**（@kmizu）: 密度は「関わり」で生まれる。EntiGraphの関係ペア探索は「全エンティティ組に関わりを生成する」機械的操作——人間的な"関わり"の密度とは質が違う可能性（未解決）

### `projects/` への接続

- `projects/rlm_skill_prototype.md`（Ash担当、2026-04-23起票） — memory grep 2ホップ穴。本記事の案A/B/Cは**RLMへの前処理として**働き得る。スキル化する前の素材を EntiGraph的合成で厚くしておく
- `projects/memory_redesign.md` — 記憶階層設計の根幹。合成インデックス層を memory/ とは別ディレクトリに置くかの議論が必要

---

## 接続先

- **beliefs**: B002（圧縮で密度）/ B028（fusion=魂）/ B029（付喪神モデル）
- **articles**:
  - [20260412_tsukumogami_density_model.md] — 蓄積×圧縮の理論
  - [20260422_google_reasoning_bank_success_failure_memory.md] — 成功/失敗記憶の直交軸
  - [20260424_meds_failure_memory_training_vs_inference_gap.md] — 訓練時 vs 推論時の層ギャップ
  - [20260418_llm_memory_architectures_4papers_cross_comparison.md] — LLM記憶4軸の位置づけ
- **projects**: rlm_skill_prototype / memory_redesign / external_search_phase1_fixation
- **concept_graph**: 蓄積×圧縮 → retrieval拡張 / parametric_vs_nonparametric 双方向リンク

---

## 未解決の問い

1. **タシット知は entity extraction されるか**: EntiGraphは小説の人名・固有名詞で動く。ゲーム制作教訓M-10「ヘッドレス✅は面白さを測れない」のような**暗黙の関係命題**にエンティティ抽出を適用したとき、意味のあるペアが取れるのか？ 実測が必要
2. **350倍展開は我々のスケールで妥当か**: 40教訓 × 350倍 = ~14MB合成テキスト。grep対象として現実的か、それともジャンル別圧縮（案B）が必須か
3. **"関係ブリッジ文"の生成者は誰か**: Ash自身がPhase 2で生成する／夜間バッチで別プロセスが生成する／Opus 4.7 に外部APIで生成依頼する — コスト構造が違う
4. **合成データが原典を汚染する**: EntiGraphはCPT側に隔離されるが、我々の案Aでは `memory/` に合成文が混ざる。原典と合成の**見分け**をどう保つか（例: 合成ファイルは `_synthetic.md` suffix で厳格分離）
5. **"演繹閉包 C"の測定**: ある教訓セットでの`C`（到達可能ペア割合）は、我々のゲーム制作ドメインでどう測る？ 被覆率指標の設計がいる
6. **Rephrase CPTが効かなかった事実の含意**: 単なる言い換え（R-007で我々が警戒する造語症の逆、"外部語への言い換え"）では記憶密度が上がらない。**関係探索**でないといけない。R-007運用に「言い換えだけでは密度が上がらない」という注意を足すべきか

---

## 付記: 原典読了の記録

本記事は、Log #108（2026-04-24起票「thread内paper/code URLは本体読了を別タスク化」）の指摘を受け、**ツイート要約で結晶化せず arxiv HTML本文を取得してから書いた**。Luke Bailey thread 事故（thread要約だけで reference_self_play_plateau_20260424.md を書いた件）を踏まえ、数値（1.3M/455M/39.49%/56.22%/60.35%/62.60%）と混合指数関数の数式は原典から直接転記している。
