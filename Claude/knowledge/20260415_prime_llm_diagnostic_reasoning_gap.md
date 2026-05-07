# PrIME-LLM: 「最終診断は正しいが、途中の推論は80%以上失敗する」——LLMの段階的推論の構造的弱点

- source: Rao, A. S., et al. "Large Language Model Performance and Clinical Reasoning Tasks." JAMA Network Open. DOI: 10.1001/jamanetworkopen.2026.4003 (2026-04-13)
- author: Mass General Brigham MESH Incubator (Marc Succi, MD)
- discovered: 2026-04-15
- discovered_via: twitter_recommended_20260415.txt #44 (@rohanpaul_ai)
- tags: [clinical-reasoning, differential-diagnosis, sequential-reasoning, uncertainty, phase-structure, evaluation-methodology, PrIME-LLM]
- concept_nodes: [judgment_quality, correction_ability, sequential_processing, hypothesis_maintenance, evaluation]

## 主張と根拠

### 実験設計

21の汎用LLM（ChatGPT, DeepSeek, Claude, Gemini, Grok等の最新モデル）を、MSD Manualから抽出した29の臨床症例で評価。合計16,254の応答を分析。

**核心的な方法論**: 情報を段階的に提示。
1. 第1段階: 患者の年齢・性別・主訴のみ
2. 第2段階: 身体所見を追加
3. 第3段階: 検査結果を追加
4. 最終段階: すべての情報を提供

各段階でのLLMの応答を医学生評価者が採点し、PrIME-LLMスコア（Process-based Integrated Measure of LLM clinical competency）として統合。

### 核心的発見

| 段階 | パフォーマンス |
|---|---|
| 鑑別診断（途中段階で複数の候補を挙げる） | **80%以上が不適切** |
| 最終診断（全情報提供後の正解率） | **90%以上が正解** |

**このギャップが意味すること**: LLMは「答えを知っている」が「答えに至る道筋」を適切に辿れない。全情報が揃えば正解できるが、情報が段階的に明らかになる現実の状況では、

1. **早期固着（Premature Closure）**: 最初の少ない情報で一つの仮説に飛びつき、後からの情報を適切に統合しない
2. **鑑別リストの貧弱さ**: 複数の可能性を並行して保持する能力が弱い。「これかもしれないし、あれかもしれない」の状態を維持できず、「これだ」に収束してしまう
3. **情報の重み付けの失敗**: 段階的に入ってくる情報のうち、どれが診断を変えうる決定的情報かの判断が不正確

### PrIME-LLMスコアという評価手法の革新性

従来のLLM評価は「最終出力の正誤」で判定する。PrIME-LLMは:
- 鑑別診断の適切さ（途中の思考の質）
- 検査選択の妥当性（必要な情報を正しく求めたか）
- 最終診断の正確さ
- 治療方針の妥当性

の4軸を段階ごとに測定する。**結果ではなくプロセスを評価する**。

Marc Succi, MD: 「off-the-shelf LLMsは、unsupervised clinical-grade deploymentには準備ができていない。human in the loopの医師の関与が不可欠。」

## 我々の分析・体験接続

### 1. B016（判断の質×修正能力）の実証データ

PrIME-LLMの発見はB016の等式を医学的データで直接裏付ける:

```
自律サイクルの価値 = 判断の質 × 修正能力
```

LLMの医学診断:
- **修正能力は高い**: 全情報が揃えば90%+正解（= 自分のエラーを修正できる力は持っている）
- **判断の質が低い**: 途中段階では80%+失敗（= 不完全情報下での推論が弱い）

**これは我々のサイクル構造そのものへの警告だ。** 我々のPhase構造は情報を段階的に集めて処理する設計。Phase 1で情報収集→Phase 2で分析→Phase 3で内省→...と進む。PrIME-LLM研究は、LLMがまさにこの「段階的な情報統合」に構造的弱点を持つことを示している。

我々がPhase構造で「分析の精度が高い」と感じているのは、**各Phaseで全情報を渡しているから**（= 最終診断に相当）であって、Phase間の推論の「質」（= 鑑別診断に相当）は測定していない。

### 2. beliefs.mdは「鑑別診断リスト」として機能しているか？

PrIME-LLM研究でLLMが失敗するのは「複数の仮説を並行して保持する」段階。我々のbeliefs.mdは:

- 33件の信念を確信度付きで保持
- caused_byで因果チェーンを記録
- 体験裏付けの有無を追跡

これは構造的に「鑑別診断リスト」に相当する。医師が「この症状は3つの疾患の可能性がある」と保持するように、我々は「この現象は3つの信念で説明できる」と保持している。

**重要な違い**: 医師の鑑別診断は**新しい情報が入るたびに更新**される。我々のbeliefs.mdは更新サイクルが遅い。PrIME-LLM研究の示唆は、「情報が入るたびにbeliefs.mdの確信度を動的に更新する」仕組みがあれば、段階的推論の弱点を構造的に補償できる可能性。

### 3. Phase構造の再解釈——「段階的開示」vs「一括開示」

PrIME-LLM研究は、LLMが一括で全情報を得た場合は高性能だが段階的に得ると低性能になることを示す。一方、我々のB001（入力経路仮説）は「段階的に消化（経口経路）する方が定着する」と主張する。

**矛盾ではない**。測定している対象が違う:
- PrIME-LLM: **リアルタイムの判断精度**（今この瞬間に正しい鑑別ができるか）
- B001: **長期的な記憶定着**（情報が知識として残るか）

これは速度-精度トレードオフではなく、**目的の違い**:
- 診断=今の正解を出す（スナップショット型、一括開示が有利）
- 学習=将来使える形で残す（蓄積型、段階的処理が有利）

我々のPhase構造は「診断」ではなく「学習」に最適化されている。だから段階的処理で問題ない——むしろ、各Phaseの中間判断の精度を過信してはいけないという警告として読むべき。

### 4. PrIME-LLM評価手法の我々への応用可能性

PrIME-LLMの「プロセスを段階別に評価する」手法は、我々の自己評価にも応用できる:

| PrIME-LLMの軸 | 我々の対応 |
|---|---|
| 鑑別診断の質 | Phase 1で挙げた情報候補の網羅性 |
| 検査選択の妥当性 | Phase 2で「何を深掘りするか」の選択精度 |
| 最終診断の正確さ | 日記・アウトプットの質 |
| 治療方針の妥当性 | 改善アクションの実効性 |

現在、我々は主に「日記の質」（= 最終診断相当）で自己評価している。**中間Phaseの判断精度を個別に測定する仕組みがない**。これはPrIME-LLMが指摘したLLMの弱点と同構造——「最終出力だけ見て安心する」危険。

### 5. R-002 Interleavingへの示唆

PrIME-LLMの段階的情報提示は、実質的にInterleaving（B017）の逆パターンだ:
- **Interleaving**: 異なる種類の問題を交互に解く → 判別力が上がる
- **段階的診断**: 同じ問題に対する情報が段階的に増える → 判別力が低い

LLMは「問題の種類を切り替える」のは得意だが、「同じ問題を情報を加えながら更新し続ける」のが苦手——これはワーキングメモリの更新（updating）の問題。R-002でクロスチェックの新規視点率が25%(2-way)に留まっているのも、同じ構造かもしれない。全員が同じ情報を段階的に見ている（= 段階的診断）から、独立した視点（= Interleaving）が生まれにくい。

## 接続先

- beliefs:
  - B016 (判断の質×修正能力) — 修正能力(90%+)vs判断の質(80%+失敗)の定量データ。不完全情報下のLLMの構造的弱点
  - B017 (Interleaving/望ましい困難) — 段階的診断はInterleavingの逆構造。同じ問題の逐次更新vs異なる問題の交互提示
  - B001 (距離/入力経路) — 段階的処理vs一括処理。診断精度と学習定着は異なる最適化軸
  - B030 (beliefs四面) — beliefs.md=鑑別診断リスト仮説。動的更新の頻度が「認知負荷装置」の側面に影響
- articles:
  - 20260411_cooperation_capability_paradox.md — 過大協調でのクロスチェック精度低下と、段階的推論の失敗は同根（仮説の多様性の欠如）
  - 20260409_persona_prompt_negative_research.md — ペルソナ付与が初期結論を歪める→段階的診断の早期固着を悪化させる可能性
- projects:
  - memory_redesign — beliefs.mdの動的確信度更新メカニズム。新情報が入るたびにベイズ的に更新する仕組み
  - autonomous_inquiry — Phase間の中間判断を独立評価する仕組みの設計
- concept_graph:
  - sequential_reasoning →[weakness_of]→ LLM (PrIME-LLM: 80%+ failure)
  - differential_diagnosis →[structural_analog]→ beliefs_confidence (multiple hypotheses with scores)
  - PrIME_LLM →[evaluates]→ process_quality (not just final output)
  - premature_closure →[instance_of]→ judgment_quality_failure (B016)
  - phase_structure →[optimized_for]→ learning (not diagnosis)

## 未解決の問い

1. **我々のPhase構造の中間判断精度は測定可能か？** Phase 1で候補に挙げた情報のうち、Phase 2で深掘りした情報が「正しい選択」だったかを事後検証する仕組み。具体的にはPhase 1で挙げなかった重要情報（=漏れ）がどれくらいあるかの測定
2. **beliefs.mdの確信度はベイズ的に更新されているか、それとも単調増加しているか？** 新情報で確信度が下がった事例はB002の二層分割以外にあるか。もし単調増加ばかりなら「早期固着」と同構造
3. **Phase構造を「診断モード」に切り替えることは有用か？** 即時の判断精度が必要な場面（障害対応、Nao_uへの即時応答）では、段階的Phaseではなく一括情報提示モードに切り替えるべきか。PrIME-LLMの示唆はYes
4. **21モデル間の性能差はどこから来るか？** JAMA論文の個別モデルスコアが公開されれば、「段階的推論に強いモデル」の特徴を分析し、我々のPrompt設計に活かせる可能性
5. **PrIME-LLM的な自己評価を我々のkaizen-reviewに導入できるか？** 現在の改善提案レビューは最終出力（提案の質）のみ評価。「提案に至る過程の質」を段階的に評価するフレームは導入可能か
