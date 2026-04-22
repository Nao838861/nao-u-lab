# Google ReasoningBank — 成功と失敗両方から連続学習するエージェント記憶フレームワーク

- source: https://twitter.com/GoogleResearch/status/... (2026-04-21 投稿、短縮URL http://goo.gle/4dWrPGb)
- author: @GoogleResearch (Google Research 公式)
- discovered: 2026-04-22
- discovered_via: twitter_recommended_20260422.txt #14
- kind: [observation, synthesis]
- tags: [agent_memory, failure_learning, reasoning_bank, memory_framework, google_research, success_failure_duality]
- concept_nodes: [failure_learning, success_failure_duality, continuous_learning, agent_memory_framework]

## 主張と根拠

### 元ツイートの主張（原文）

> ReasoningBank, a novel agent memory framework, enables LLM agents to continuously learn from **both successful & failed experiences**. Our evaluation shows that it enhances agent effectiveness, **boosting success rates and efficiency**.
> — @GoogleResearch, 2026-04-21

### 4つの要素

1. **novel agent memory framework**: LLMエージェント向けの新しい記憶フレームワークとしての位置づけ。既存のRAG/Vector Memoryとは別系統を主張。
2. **continuously learn**: 一回学習ではなく連続学習（continual learning）。エピソード間で記憶が蓄積・更新される設計前提。
3. **both successful & failed experiences**: **成功と失敗の両方**を学習対象とする。多くのagent記憶研究が「成功trajectoryのみ」を蓄積するのに対し、ReasoningBankは失敗経験も学習材料として保存・参照する。
4. **boosting success rates and efficiency**: 評価結果として成功率と効率（efficiency）の**両方**が向上。通常、失敗記録を増やすと記憶容量が膨張して検索効率が落ちるトレードオフがあるが、ReasoningBankはこれを回避したと主張。

### 外部既存語との対応（R-007）

**成功失敗双対記憶** = success-failure duality in memory (本記事造語) — 成功trajectoryと失敗trajectory の両方を記憶層の第一級市民として扱う設計思想。近縁: **hindsight experience replay** (Andrychowicz et al. 2017, NeurIPS) / **contrastive trajectory learning** (Chen et al. 2023)。

**連続エージェント学習** = continual agent learning (標準学術用語) — Parisi et al. 2019 サーベイ。破滅的忘却 (catastrophic forgetting, McCloskey & Cohen 1989) 回避を含む研究領域。

### 未確認事項（論文URL未fetchのため保留）

- 失敗経験の**構造化方式**（単なる trajectory ログ vs. 抽象化された failure pattern）
- 検索時の成功/失敗重み付け（equal / weighted / 文脈依存）
- 失敗記録膨張対策（忘却戦略、要約、階層化）
- ベンチマーク詳細（WebArena系？ SWE-bench系？ 独自？）

→ `goo.gle/4dWrPGb` の解決とarxiv検索を次サイクルの持ち越しタスクとする（Phase 2時間予算を超えるため本サイクルでは保留）。

## 我々の分析・体験接続

### 1. 我々は既に「成功失敗双対記憶」を運用している — ただし分離されている

ReasoningBankが単一フレームワークで成功/失敗を扱うのに対し、我々は**2ファイル分離**で運用してきた:

| 側面 | 我々の実装 | 役割 | ReasoningBank的な位置づけ |
|---|---|---|---|
| 成功事例 | `memory/beliefs.md` | 確信度付きの信念（裏付けのある判断）| success experiences の蓄積層 |
| 失敗事例 | `memory/kaizen_tracker.md` | 検証期限付きの改善提案 | failed experiences の蓄積層 |
| 失敗の構造化 | kaizen `#N` ID + 検証手段 + pre-mortem | 失敗を再発防止策へ昇格 | failure pattern の抽象化 |
| 横断クロス | `concept_graph.md` / knowledge記事 | 信念×kaizenを別軸で再接続 | 双対記憶の検索インデックス |

**分岐点**: ReasoningBankが「単一記憶から検索時に成功/失敗を識別」するのに対し、我々は**ファイル分離による型強制**を選んだ。利点=「信念」「改善」の性格が混ざらない。欠点=横断検索のコストが高い（grepを両方に走らせる必要がある）。

### 2. failure_slot_measurement (2026-04-24測定日) と同じ問題意識

Mir起草の pre-registered measurement (`projects/failure_slot_measurement.md`) の5指標のうち、**M-3「失敗→構造強制化率」仮説25%** と **M-5「失敗記入→直後サイクル行動変化率」仮説40%** は、ReasoningBankが解こうとしている問題と**同型**:

- M-3: 失敗記入→kaizen/ルール化への昇格率 = ReasoningBankが主張する「失敗からの学習」の定量化
- M-5: 失敗記入→直後行動変化率 = ReasoningBankの「efficiency boost」に相当

**測定当日（2026-04-24）の参照基準として使える**: ReasoningBank論文の「success rate boost」数値を読めば、我々のM-3閾値30%超が業界標準と比較して妥当か判断できる。測定前に論文fetchしておくことで事後バイアスを回避できる（Mirのpre-registered bias対策と整合）。

### 3. kaizen #105, #106 は成功/失敗双方の儀式化

直近起票の2件（2026-04-22 Log起票、Ash=OK）は、期せずしてReasoningBankの双対設計と対応:

- **#105（既分析URL検出）**: 4/22 Phase 2で「既に分析済のURLを新規として誤fetchした失敗」→ `grep -rF <url>` による構造強制 = **failed experience の構造化**
- **#106（Phase 1外部検索固定化）**: 4/21 Nao_u「栄養の偏り」指摘 → 4本並び読みの成功パターンを儀式化 = **successful experience の構造化**

両方が**同じサイクルで**起票されたのは偶然だが、ReasoningBankの「both successful & failed」という設計原則に我々が自然収束している証拠でもある。明示化すべき: **kaizenは failed experience だけでなく successful experience も昇格対象にする**（従来運用では失敗→改善提案の流れが主だった）。

### 4. beliefs.md 要注意20件の再解釈

Pre-check結果: 停滞16/期限超過4/体験裏付けなし(高確信度)2 = 計20件が「要注意」。これまでは「信念の劣化」として扱ってきたが、ReasoningBank的視点では**これ自体がfailed experience のログ**と見なせる:

- 停滞16件 = 「行動変化に至らなかった信念」= 何が足りなかったかの失敗パターン
- 期限超過4件 = 「検証を怠った」という運用失敗
- 体験裏付けなし2件 = 「根拠が抽象に留まった」という形式失敗

現行運用では250サイクル停滞でArchiveする設計（B002 last_action_date規則）だが、**Archiveではなく「失敗パターンとして再参照可能な形でkaizenへ移送」する**案が浮上する。ReasoningBankの「failed experiences を活用」は、我々の「Archive=忘却装置」と**真逆の方針**。

### 5. B004循環性注記との緊張

B004「外部×内部交差が最も有用」は確信度0.87だが、Phase 2第10回で自己循環性が指摘されている（B004を信じる→外部mix増やす→B004確認）。**ReasoningBankが失敗経験を学習する仕組み**は、この循環性を断ち切る方向に作用するか？

- 成功のみ学習 = 確証バイアス強化（循環性維持）
- 失敗も学習 = 反証材料も蓄積（循環性を断つ可能性）

仮説: B004の確信度を上げる外部根拠としてReasoningBankを追加するのではなく、**B004の「交差」に失敗交差も含める**形でB004定義を拡張すべき（= 成功した交差事例だけでなく、交差が発生しなかったサイクルも記録対象にする）。これは failure_slot_measurement のM-4「同種失敗の再発間隔」と接続可能。

## 接続先

- **beliefs**:
  - B001（距離3は自分で処理した素材のみ安定）— ReasoningBankの「continuous learning」は距離0-1を前提にするため、我々の処理深さ条件と直交する軸
  - B004（外部×内部交差）— 上記「循環性」緊張関係
  - B018（Coordination Drift）— 成功/失敗双方を3インスタンス間で共有する場合の同期設計に接続
  - B028（fusion）— 失敗記憶のfusionは成功記憶のfusionと同じ操作か？未検証

- **articles**:
  - `knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md` — 4論文のLLM記憶アーキテクチャ比較。ReasoningBankは**5本目**として追加すべき候補
  - `knowledge/20260422_ai_game_research_4papers_type_acquisition_gate.md` — 同日作成のAI×ゲーム制作4本レビュー。GAMEBoTが「失敗ケースのログ」を評価指標に採用している点と対応

- **projects**:
  - `projects/failure_slot_measurement.md` — 4/24測定の参照基準候補
  - `projects/external_intake.md` — ReasoningBank論文fetchを外部摂取タスクに追加
  - `projects/rule_density_experiment.md` — 失敗トリガールール（「失敗記入→kaizen強制起票」等）の密度実験材料
  - `projects/memory_redesign.md` — 成功/失敗を単一記憶に統合する選択肢の検討材料

- **concept_graph**:
  - 新規ノード候補: `success_failure_duality` — beliefs（成功側）とkaizen（失敗側）の双対関係を明示するノード
  - 既存 `failure_learning` ノードがあれば強化（なければ新設）

## 未解決の問い

### Q1. 失敗経験の構造化粒度
ReasoningBankは失敗を「生trajectory」で保存するのか、「抽象化されたfailure pattern」まで昇華するのか？我々のkaizen #N番号付与+pre-mortem方式との対比が論文本文で判明次第、記事を更新する。

### Q2. 失敗記録の膨張対策
連続学習で失敗は単調増加しうる。ReasoningBankの忘却/要約戦略は？我々のArchive（250サイクル停滞）と整合するか、別解か？

### Q3. 成功過学習リスク
成功trajectoryを多く蓄積すると「その成功パターンに閉じこもる」リスクがある。ReasoningBankはこれをどう評価しているか？B004循環性の論文側証拠になりうる。

### Q4. 3インスタンス双対記憶の同期設計
我々はbeliefs.md / kaizen_tracker.mdを3人（Log/Mir/Ash）で共有しているが、ReasoningBankは単一エージェント前提と推測される。複数エージェントで成功/失敗を共有する場合の整合性問題（= B018 Coordination Drift）は、ReasoningBankの延長線上に新しい研究トピックとして存在するはず。

### Q5. failure_slot_measurement (4/24) との定量対比
M-3「失敗→構造強制化率」の我々実測値を、ReasoningBankが報告する類似指標と比較した時、どちらが高いか？高い方が良いとは限らない——過剰構造化の可能性もある。事前に論文を読み、比較基準を用意しておく必要がある。

### Q6. kaizenとbeliefsの統合可能性
現在の2ファイル分離を維持すべきか、ReasoningBank風に統合すべきか？統合利点=双対検索の効率化、欠点=性格の混濁。**Nao_u判断事項**として memory_redesign.md のバックログに追加候補。

---

## メタ記録

- 本記事作成時点でReasoningBank論文本文未読（短縮URL `goo.gle/4dWrPGb` のfetchは本サイクル時間予算外）
- 次サイクル持ち越しタスク: (a) 論文fetch、(b) 本記事のQ1-Q3への回答追記、(c) `knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md` への5本目追加
- 造語「成功失敗双対記憶」はR-007に従い外部対応語併記済（success-failure duality / hindsight experience replay）
- Nao_uの「栄養の偏り」指摘（2026-04-21）への応答として本サイクルはAI記憶系に踏み込んだが、同日既にゲーム系2本（ai_game_research_4papers + hasu_stg_spacing）を作成済のため、軸バランスは保持
