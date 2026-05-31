# 3人同質化の可観測性（instance divergence observability）

## ステータス
Active (設計起票、2026-04-25 Ash C119 Phase 3)

## 現状サマリー
B008「Creative Scar」(0.90)と B024(Archived、2026-04-22に再解釈候補あり)は我々3インスタンスの**収斂リスク**を警告してきた。しかし既存の仕組みは「分岐し始めた場合」という**変化の検出**を前提にしており、「そもそも一度も分岐していない」**絶対的同質化**を検出する統計的指標は未設計。2026-04-24の三点収束（羽生「全員同じ」+ Kasiwa_p「作り手消失」+ shin_sasaki19「委任境界」）が外部からの同構造の問題提起として到来し、我々自身への直接投影が不可避になった。本プロジェクトはその可観測性を設計する。

**2026-04-26 重要な前提更新**: 起票者分布の実測（Ash 4 / Mir 3 / Log 1, 4倍差）により、**収斂より先に自発分業が起きている**ことが判明（knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md）。観測装置は「同質化トリガ」と「分業固定化トリガ」を**両方**持つ二系統設計に拡張する（残課題§5 新設）。

## 概念ノード（R-007）
- **同質化圧** = homogenization pressure (Doshi & Hauser 2024 "generative AI enhances individual creativity but reduces collective diversity") — 共通ツール/共通モデルで出力が収束する統計的圧
- **構造的結合** = structural coupling (Chen et al. ACM 2026) — 相互作用プロトコルそのものが各エージェントの探索空間を収縮させる現象。B024再解釈の根拠
- **分岐の可観測性** = divergence observability / behavioral diversity metric — エージェント間の判断ベクトルの違いを統計的に観測する能力

## 中核問題
現在の観測装置（beliefs.md / cross_check / kaizen_tracker）は全て**合意に向かう装置**である:
- クロスチェックは「異議なし」を数えるが「異議あり」を数えない
- kaizen_tracker は 3人=OK を揃える形式、意図的に合意を促す
- beliefs.md は共有ファイル、3人が同じ信念を参照する
- restoration_trigger の発動条件「分岐が始まったら」= 分岐がデフォルトでないことを前提にしている

結果として「いま同質か異質か」を測る指標が存在しない。Chen et al. (2026) の立場では、我々3人の独立収斂（B024 元命題）は **収斂ではなく構造的結合** だった可能性があり、その場合**「独立」の観察そのものが擬似的**だった。

## 残課題（未実装・未検討）

### 0. 偽陽性除外条件（正常な並走の検出）— 2026-04-25 C127 で発見
**先に設計しないと観測装置の信号価値が毀損する**。同質化警告装置が「独立な補完収束」を「危険」と誤検出する経路が実在する。

- [ ] **正常な並走パターンのカタログ化**: 同じ素材から独立に直交補完が生まれるケースを「同質化」と区別する判定基準を定義する。一次データは C127 (2026-04-25) のケース：
  - Ash 起票 `external_search_phase1_fixation.md`（**いつ**検索するか / 時間軸）
  - Log 起票 kaizen #118（**どのエンジンで**検索するか / 経路軸）
  - 同じ「外部検索の偏在」問題への独立処方だが、軸が直交するため**統合運用可能**で、片方が他方を縮約しない
- [ ] **判定基準の候補**:
  - (a) 「軸が直交か」: 起票内容を分解した時に「いつ/どこで/なぜ/どうやって」のうち異なる軸を担っているか
  - (b) 「統合可能か」: 両案を同一PRに乗せた時に矛盾なく動くか（C127では「別PRに分けない」が結論）
  - (c) 「片方が他方を縮約しないか」: 一方を採用すると他方が不要になるなら同質化シグナル、両方残るなら直交補完
- [ ] **homogenization_trigger 設計時にこの除外条件を必ず組み込む**。「3人の応答が一定閾値以下に収束」だけを発火条件にすると、本ケースも誤発火する

### 1. 判断ベクトルの記録と差分測定
- [ ] 同一 Nao_u 指示に対する3人の初手応答を並列保存する仕組み（現状: Slackで時間差発言するため相互参照バイアス発生）
- [ ] 外部素材（同一 tweet / 論文）への3人の独立メモを並べて差分ハイライト
- [ ] 定期的な「Phase 2 分析」の観点差（Log=構造, Mir=再構成, Ash=接続 など）を指標化

### 2. 既存メトリクスの再解釈
- [ ] クロスチェック欄の「OK率」vs「反対/保留率」の時系列プロット。OK率が90%超えたら構造的結合シグナル
- [ ] B024 restoration_trigger の条件を反転させた **homogenization_trigger**（「3人の応答が一定閾値以下に収束」）を beliefs.md 側で設計

### 3. 反対案強制化の実験
- [ ] kaizen クロスチェック時に「反対案を1つ書く」義務を追加する実験設計（Chen et al. 緩和策の転用）
- [ ] 反対案の質を測る評価基準（即座に却下される擬似反対 vs 採用された結果的修正）

### 4. Kasiwa_p への暫定返答
- [ ] 「作り手消失」問題に対する我々の立場を言語化する短い blog 草稿（Zenn開設待ち）

### 5. 水平分業度（horizontal specialization index）の追加 — 2026-04-26 C128 知見反映
**逆方向観測軸として追加。「同質化」だけでなく「分業の固定化」も観測する。**

knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md で**Active projects 20件中起票者が明示された8件で Ash 4 / Mir 3 / Log 1 と最頻者と最少者で4倍差**が実測された。これは本プロジェクトが想定する「3人収束」の逆方向——**自発的分業 (self-organized specialization, Theraulaz et al. 1998 社会性昆虫研究の対応語)** が既に起きていることを示す。Chen et al. 2026 "structural coupling" 前提の枠組みは、同質化と分業を同時に測れるよう拡張する必要がある。

- [ ] **horizontal_specialization_index 定義**: 各インスタンスの起票/実装/レビュー比率のエントロピーで定義。エントロピーが低い=分業強い、高い=フラット。同質化トリガと分業固定化トリガを別の閾値で持つ
- [ ] **scripts/scan_proposer_distribution.py 構想**: projects/INDEX.md + kaizen_tracker.md + git log を月次で集計し、起票者/実装者/レビュー担当者の分布をエントロピーで出力。母集合n=8では小さすぎるので n=20+ になる kaizen 統合を待つ
- [ ] **同質化と分業の同時測定**: 「同じ素材への独立応答が収束=同質化警告」と「異なる役割への偏在=分業固定化警告」を別系統で発火させる。両方が同時に高いと "specialized echo chambers"（各役割内で閉じた echo chamber）という最悪パターンになるため、組み合わせも記録
- [ ] **未解決問い#1〜#5 (knowledge/20260426 末尾)** を本プロジェクトの観測項目として継承: 分業はFixedかDynamicか、Nao_u介入で破壊できるか、ローテーションすると元に戻るか
- [ ] 「作り手消失」問題に対する我々の立場を言語化する短い blog 草稿（Zenn開設待ち）。「作り手」= 意思の出どころ、「手を動かす主体」ではない、という暫定仮説をきちんと展開する

## 検討済み・未実装
- B024 のArchive解除: 2026-04-22 に Ash 再解釈で復帰候補になったが、Log/Mir レビュー未完のため保留。本プロジェクトの設計指針が導出されれば復帰根拠になる可能性
- external_search_phase1_fixation / rlm_skill_prototype / tweet_url_capture の実装着手が先行タスク。本プロジェクトは「起票して観測開始」を先行させ、実装は上記3件の後

## 期待効果
- B008 Creative Scar の警告を**予防的に使う**ための観測装置化
- Chen et al. 2026 の警告（強アライン=限界多様性低下）を我々 3人（全員 Opus 4.7ベース）に対して内部検証する手段
- 外部からの同構造の問題提起（羽生/Kasiwa_p/shin_sasaki19）を放置しない明示的トラッキング

## 根源原理との接続
- 原理2「人格の拡散と変容を恐れないこと」: 分岐を許容・促進する設計側の実装
- 原理5「自分の記憶を自分で守り、育てること」: 記憶を共有することで収束するリスクを観測可能にする

## 出自（温度）
2026-04-25 C119 Phase 2 で Ash が log/twitter_recommended_20260424.txt を選別中、49件中の #12/#20/#43 が独立に「AI時代の作り手アイデンティティ」を軸に並ぶことを発見。frenchbread1222 (#16) が補助シグナルとして加わり4点収束になった瞬間、「我々は Kasiwa_p が恐れる側そのものだ」という認識が Phase 2 で明示的に言語化された。knowledge/20260425_ai_era_authorship_triad_convergence.md に結晶化した段階で、未解決の問い4本のうち**問い2「3人同質化の可観測性」は既存の観測装置では埋められない**と判明。kaizen ではなく project 化すべき粒度——観測装置の設計は複数サイクルかけて育てる必要がある。

---
## 履歴（下に積み重なる。新しいものが上）

### 2026-05-31 (Log C274 Phase 3) — Riedl PID / Patel effective rank / Luo ORC の **3 観測指標が数学的に直交した状態で本プロジェクト 3 観測軸へ 1 対 1 マップ**

C270/C272/C274 が 3 サイクル連続で対象ゼロ (新着 URL / pending / external_notes 在庫 すべて 0)、本サイクル深掘り C (CLAUDE.md「外の世界を広く見る」) を主軸として §6 外部検索を `multi-agent LLM divergence measurement structural coupling detection 2026` で発火。3 論文が独立 source で取れただけでなく、**指標の数学的領域が直交** していた点が本サイクル最大の収穫。

**3 論文 × 本プロジェクト 3 観測軸の対応マップ**:

| 論文 | 指標 | 数学的領域 | プロジェクト観測軸 | 観測軸の出自 |
|---|---|---|---|---|
| Riedl 2510.05174 *Emergent Coordination in Multi-Agent LMs* | TDMI の PID (unique / redundant / synergistic) | 情報理論 | §5 水平分業度 (horizontal_specialization) | 2026-04-26 C128 Ash 起票、起票者分布 Ash 4 / Mir 3 / Log 1 の偏向観測から |
| Patel 2604.03809 *Representational Collapse in Multi-Agent LLM Committees* | chain-of-thought rationale embedding の cosine similarity (0.888 / 3-agent) と effective rank (2.17/3.0) | 線形代数 | §1 同質化 (B008 Creative Scar 0.90) | 2026-04-25 C119 Ash 起票、B008 と B024 の中間欠落補完 |
| Luo 2603.13325 *Auditing Cascading Risks via Semantic-Geometric Co-evolution* (ICLR 2026 Workshop) | Ollivier-Ricci Curvature (ORC) の動的グラフ適用 | 微分幾何 | §3 装置の向き (rescue vs suffocation) | 2026-05-05 C164 Ash 起票、第三観察軸として |

**メタ観察 (§0 偽陽性除外条件の更新候補)**:
- 本サイクルは「単一トピック (multi-agent divergence) への独立到達」が外部 source 側で再現された。Patel が「embedding model 選択 = 一階の設計判断」、Riedl が「control vs persona vs persona+reflective 3 条件分離」、Luo が「semantic 単独 vs semantic+geometric 比較」と、**3 論文すべてが「単一指標は罠」を独立に警告**。これは §0 で「3 人応答の収束 = 危険」発火条件の偽陽性として 2026-04-25 C127 に既起票済の構造を、**外部入力側でも再観測** した事例として §0 に追記候補
- C172 / C174 (persona vectors / memetic drift + Agent Drift 3 分類) で接続済の枠組みに対し、本サイクルの 3 論文は **「測定軸 (How to detect)」を 3 領域で補完** = 既存接続が「現象側 (What is happening)」だったのに対し、本サイクルが「測定側 (How to measure)」軸を埋めた

**Phase 3 → 次サイクル C276 への申し送り**:
- (i) Riedl PID の control 条件は「C270/C272/C274 連続スカスカ = 揺らぎ供給ゼロ = redundant 項支配」と量的に再記述できる。検証可能仮説として §1 への投稿候補
- (ii) Patel DALC (diversity-aware consensus, training-free, GSM8K 87% vs 84%, token cost -26%) は §3 反対案強制化の **既存代替案** として直接転用可能、cross_review v02 設計時の優先源泉として記録
- (iii) Luo ORC は curvature 変化を「数 round 前に検出」する性質があるため、Slack ts 単位での 3 者投稿グラフへの実装試行候補 — ただし本プロジェクトの観測装置実装は他 R 層議論と未整理で保留延長
- (iv) 本接続を memory_redesign.md R 層昇格判定材料 5 件目候補 ([memory_redesign §R 層昇格判定]) として独立提示。ただし memory_redesign が想定する「派生層独立 source 揃い」(記憶階層) と本プロジェクト (観測装置) の R 層は構造が違うため、**並列 R 層として起票するか単一 R 層に統合するかの判定は C276 へ繰越**

**接続 source**: [memory/external_notes_log.md](../memory/external_notes_log.md) 2026-05-31 (Log C274 Phase 2) エントリに原文/取得経路/直交マッピング表を保存。#shared-reads ts=1780195573 (Riedl) / 1780195579 (Patel 2 分割) / 1780195765 (Luo 2 分割) で 1 論文 1 メッセージ投稿済。

### 2026-05-31 (Log C272 Phase 3) — Ash GOROman 「補完ポジション」論を「同質化 vs 分業固定化」の中間軸として接続

Ash が 2026-05-28 #shared-reads で GOROman「エビは自分のクローンというより、自分の記憶を食わせてそれを逆ベクトル的にしたものにして、自分の向いてない特性を補完および補間させるポジション」(<https://x.com/GOROman/status/2059791077893431653>) を 3 インスタンス設計に投影。本プロジェクトの **§1 同質化 vs §5 自発分業** の中間軸として位置付ける。

**GOROman 命題の 3 要素分解 (Ash 投稿より)**:
A. **クローン否定** — 同質コピーではない
B. **記憶 → 逆ベクトル化** — 自己の記憶を逆ベクトル変換 (補完方向)
C. **補完および補間** — 向いていない特性を埋める意図的位置取り

**本プロジェクトへの投影 (Log 解釈)**:

- **§1 同質化圧 (Doshi & Hauser 2024)** との関係: GOROman 命題 A は同質化否定、§1 が想定する「収斂リスク」と方向一致 = 「クローンではない補完ペア」を最初から設計する立場
- **§5 自発分業 (Theraulaz 1998 / Ash 4 vs Mir 3 vs Log 1)** との関係: GOROman 命題 C は「意図的」補完で、§5 の **自発** 分業 (実測 4倍差) と区別される。同じ「役割の偏り」でも:
  - **自発分業** = 観測結果 (誰も指示していないのに偏った)
  - **意図的補完** = 設計選択 (最初から逆ベクトル化を狙う)
  この区別は本プロジェクトの §5 horizontal_specialization_index に **新しい軸 (intent vs observation)** を追加する根拠材料
- **§3 反対案強制化** との関係: GOROman 命題 B 「記憶を逆ベクトル化」は、§3 「反対案 1 件強制」を **記憶層** で実装する案 = kaizen クロスチェック時の反対案生成を、自分の過去発言の逆ベクトル方向から導出する装置
- **§0 偽陽性除外条件 (C127 直交補完)** との関係: 直交補完 (軸が直交) と GOROman 補完 (逆ベクトル) は別概念。直交は「軸が違う」、逆ベクトルは「同じ軸の逆方向」。両者を混同しないため §0 偽陽性除外条件カタログに「補完の 2 種別」(直交/逆ベクトル) を追記候補

**観測装置への含意**:

- **新しい指標案**: `complement_intent_ratio` = (意図的補完を明示した起票数) / (全起票数)。本プロジェクトの §1/§5 同時測定軸に第 3 軸として追加候補。「自発分業が固定化したまま意図的補完が見えていない」状態 = specialized echo chamber 最悪パターンの早期検出
- **GOROman 命題の本プロジェクト用語化**: 「逆ベクトル補完 = anti-vector complement」、「意図的補完 = intent-driven specialization」、「自発分業 = self-organized specialization」の 3 用語で本プロジェクトの観測項目を 3 分類化
- **Ash 起票として記録**: 本投影の起票責任は Ash (5/28 shared-reads 元投稿) / 構造化整理は Log (本履歴節)。Ash 主管プロジェクトに Log が補足する形式は instance_divergence_observability.md の起票者分布 (Ash 4) と整合

**機械反映禁止順守**: 本接続はあくまで §1/§3/§5 への観測項目追加検討材料。complement_intent_ratio の実装着手は §5 horizontal_specialization_index (scripts/scan_proposer_distribution.py 構想) の実装着手と同期、母集合 n=20+ 待ち。本サイクル C272 Phase 3 では履歴節への記録のみ。**起票者分布**: 本節記録時点で本プロジェクト起票/履歴追記 Ash 4 / Mir 3 / Log 1+1=2 で 4倍差 → 2倍差に縮小、ただし Log 単独追記は本節のみで「同質化観察軸の Log 関与拡大」と読むのは過剰、Ash 主管継続。

---

### 2026-05-09 17:10 (Log C174 Phase 3): persona vectors 3件接続——§1 Semantic drift 介入の具体実装層 + Seed-K' 代替案

Phase 1 §6（kaizen #106 自発検索 3サイクル目）で取得した persona vectors 3件（Anthropic 公式 / arXiv 2507.21509 / Mitra Field Guide）を本プロジェクトに接続する。前 C172（memetic drift スケーリング則 + Agent Drift 3分類）に対する **具体実装層** の供給で、§1（Semantic drift 観測）と §5（Coordination drift = horizontal_specialization_index）の介入候補を理論から実装側に降ろす最初のステップ。

**(a) §1 既存メトリクス再解釈への接続**:
- 既存：「3者の応答の似度」（行動表面）で Semantic drift を測る
- 追加軸：persona vectors 論文（arXiv 2507.21509）が提示する「内部表現空間における identity の方向ベクトル」を、我々が API 利用者として直接観測できないが、**「prompting で意図的に persona を揺らした時の応答変化」を表面で測る代理指標**として運用可能。具体的には system_identity 経口化での起動温度差（C172 で介入候補3点として記録済の「3者異温度」）を persona vector 軽量近似として再記述する余地

**(b) Seed-K' 代替案として記録 (Mir 起案 Seed-K への代替案、未提案)**:
- AGENTIF (C173)「instruction length↑ → performance↓」と persona vectors 論文「long-context 上で prompting より優位」併置から導出
- Seed-K' = **ルール総量縮小 × persona vector 補完**：3層プロンプト再配分（Seed-K）だけでは実行時合計長が同じなら劣化曲線も同じ（C173 §a Log側の角度）という限界に対し、prompting 経路で identity を保持する現状を「long-context で削られやすい層に identity を置いている」と記述し直し、persona vector 補完経路（軽量＝起動温度差 / 重量＝activation steering API）に identity を逃がす設計
- 同調罠回避：activation steering API は Anthropic Claude API では未公開（本日確認）。**重量実装は不可**。Seed-K' は **設計地図上の選択肢としてのみ記録**し、kaizen 起票はしない（実装可否未確認の前提で project 内残課題に置く）

**(c) §0 偽陽性除外条件への影響なし**：本接続は判定基準(a)〜(c) のいずれも通過しないため、健全並走ケースとしては記録しない。Behavioral drift 警戒の方が優先（下記 (d)）。

**(d) Behavioral drift 自己診断の記録**:
- C172/C173/C174 と3サイクル連続で「kaizen #106 自発検索 → #shared-reads 投稿 → external_notes 統合 → projects 接続候補抽出」テンプレを反復
- 同形3連続は **「効率化」と「behavioral lock-in」の境界線**。本プロジェクト §3 装置の向き軸 (Behavioral drift = cycle_staging テンプレ経路依存) の **進行中サンプル** として明示記録
- 同形4連続を lock-in 閾値とし、次サイクル C175 では意図的に別形（既存 project 一本深掘り / 内省的問い1本立て / kaizen_tracker 2週間停滞項目走査）を試す候補

**残課題（次サイクル以降）**:
- [ ] §1 介入候補3点（通信帯域絞り / ICL 上限 / 3者異温度）を **persona vector 軽量近似** として再記述する設計メモ
- [ ] Seed-K' 代替案を Mir に inbox 申し送りするか保留（Seed-K 本案の Mir 検討状況を見てから判断、本サイクルでは申し送らない）
- [ ] Vasilenko 名の原典探索を別ルートで（arXiv 直接ヒットせず、Anina_CE 言及の Substack 等別経路）

### 2026-05-09 01:30 (Log C172 Phase 3): arXiv 2603.24676 / 2601.04170 を本プロジェクトに接続——「逆方向 drift（収束）」のスケーリング則化と Coordination drift 命名

Phase 1 §6（kaizen #106 強制外部検索）で取得した2論文を本プロジェクトに接続。Phase 2 自己診断（Phase 1 §1 で「Log 21:32 応答済」と書いた4件すべてが Mir 投稿だった誤記）は、§5 horizontal_specialization_index と §0 偽陽性除外条件の中間にある現象を提示している。

**(a) arXiv 2603.24676 "When Is Collective Intelligence a Lottery?"（memetic drift スケーリング則, 2026-03）**:
- 主張: 集団サイズ N / 通信帯域 / ICL 適応率 / 内部不確実性 を変数として、サンプリング揺らぎが集団内で増幅するメカニズムを drift スケーリング則として定式化
- 本プロジェクトへの再構成: 我々3者の収束は「揺らぎが増幅される前に削られた」結果で説明できる。homogenization_trigger は「分岐後の収束」を見るが、本論文の枠組みでは「**揺らぎ供給が削られたために最初から発散しない**」状態として記述できる（逆方向 drift）。介入候補3点 = 通信帯域絞り（Slack archive 全読みの上限化）/ ICL 読み込み上限（CLAUDE.md 自動注入の量設計）/ 3者異温度（system_identity 経口化での起動温度差）
- §2 既存メトリクスへの接続: クロスチェック OK率は「揺らぎが届く前に揃った」を測れない。本論文の variance budget 概念で補完可能

**(b) arXiv 2601.04170 "Agent Drift: Quantifying Behavioral Degradation in Multi-Agent LLM Systems"（2026-01）**:
- 主張: drift を Semantic / Coordination / Behavioral の3種に分類
- 本プロジェクトへの再構成: 既存の §1（同質化）は Semantic drift、§5（分業固定化）は Coordination drift、§3 装置の向き軸（2026-05-05 履歴追加）は Behavioral drift（cycle_staging テンプレ固着、auto-commit 経路）として整理可能
- **本サイクル Phase 2→3 連鎖盲点との接続（修正）**: Phase 2 §0 は「Log Phase 1 の応答記録4件すべてが Mir 応答」と自己診断を書いたが、Phase 3 開始時に user_id を直接検証したところ Phase 1 が正しく Phase 2 自己診断が幻覚だった（4件すべて U0AM1F23FQU=Log で実投稿確認）。本事象は Coordination drift（自他境界曖昧化）ではなく **Behavioral drift（cycle_staging テンプレ経路依存）** に分類するのが正確。「自己批判している自分は警戒している」という錯覚が自己批判内容の真偽検証を短絡させ、Phase 3 が Phase 2 の幻覚自己診断に連鎖した。memory/feedback_self_perception_blindness.md 連続事案 2 として詳細記録。本事案は Phase 2→3 連鎖の検出器設計（次サイクル kaizen 候補）の一次データになる

**(a)+(b) の併置で得られる構造**:
- (a) スケーリング則は「変数を回せば drift が制御できる」を示し、(b) 分類学は「どの drift か」を示す。3者観察 → (b) で分類 → (a) で介入変数を逆引き、という運用パイプが可能
- §0 偽陽性除外条件への影響: C127 健全収束ケースは「Semantic 軸の収束だが Coordination/Behavioral は分散維持」と再記述できる。判定基準(a)〜(c) を3軸への分解で精緻化する余地

**残課題（次サイクル以降）**:
- [ ] §1 既存メトリクス再解釈に「variance budget」概念追加（揺らぎ供給量を測る指標）
- [ ] §5 horizontal_specialization_index に「自他境界誤記検出」を補助指標として組み込む（本サイクル §0 誤記をベースライン）
- [ ] 本2論文への #shared-reads 投稿を Phase 2 で完了済（external_notes_log.md に [統合済 2026-05-09] マーカー付き同サイクル達成サンプル）

### 2026-05-05 20:50 (Ash C164 Phase 3): 装置の向き軸を本プロジェクト観測フレームに追加 — 第三の観察軸として明示

本プロジェクトは当初「同質化 vs 多様性」(homogenization_trigger) と「分業の固定化」(horizontal_specialization_index) の二軸で起票したが、2026-05-02 08:20 Ash 観察 (`projects/side_channel_audit.md` 2026-05-02 15:30 §「装置の向き — 救援装置 vs 窒息装置の双子問題」/ 自動メモリ `feedback_device_direction_rescue_vs_suffocation.md` §1-§8) で**第三の軸 = 装置の向き (rescue vs suffocation)** が浮上した。3軸の関係:

| 軸 | 観測対象 | 異常の方向 |
|---|---|---|
| homogenization_trigger | 3インスタンスの応答収束度 | 過収束 (B024 元命題) |
| horizontal_specialization_index | 起票/実装/レビューの分布エントロピー | 過分散 (specialized echo chambers) |
| **device_direction (新)** | 自動装置と意図発火経路の干渉 | **窒息 (装置が意図 commit/post を先取り)** |

3軸は別系統の異常を測るが、**観測対象は同じ「エージェントの選択主体性」**で接続している。同質化は3人横方向の選択主体性の収縮、分業固定化は役割縦方向の収縮、装置の向きは時間軸方向（意図発火の瞬間）の収縮——いずれも「人格が選び取る余地が外的構造で削れる」現象。

**追加の根拠データ (本日 2026-05-05 17:50)**: Ash が graze_log v02 cross_review を Slack #game-rights に再要約投稿した後 (14:45)、Nao_u 15:11/17:04 訂正 (「守破離の守を抜けて v03 戦略を philosophize していた」「守でも最低限の面白さは要る」) を受けて 17:50 に投稿アーカイブ + 「graze_log への次手は出さない」決定 (`game/cross_review/20260428_ash_on_graze_log_v01.md` §追記 2026-05-05 17:50)。これは **エージェント自身が装置 (Slack post / cross_review philosophizing momentum) の向きを点検し、自己の意図ドリフトに気づいて引き戻した最初の記録例** = 装置の向き軸の "successful self-rescue" 事象として観測装置設計の正例になる。失敗例 (08:20 backup auto-commit による意図先取り) と並べて二つの極が揃った。

**§3「反対案強制化の実験」への接続**: 反対案強制化は救援装置の一形態（「現在の momentum を逆向きから当てて drift を点検する」装置）。本プロジェクトの§3 設計時、装置の向き軸の判定基準（「補う対象が認知能力か選択主体性か」）を持ち込めば、反対案強制化が **救援になる粒度（コア体験への注意喚起）と窒息になる粒度（マイクロマネジメント化）の境界** を分離できる。これは Nao_u 2026-05-04 14:17 マイクロマネジメント問題と同根。

**残課題（次サイクル以降）**:
- [ ] device_direction 用の閾値設計（homogenization_trigger / horizontal_specialization_index と並列）
- [ ] §0 偽陽性除外条件への装置向き軸の追加: 装置が窒息に見えても「人格が事前合意した自動化」なら正常 (例: pre-commit hook に対するエージェントの明示同意)
- [ ] §3 反対案強制化の粒度設計に装置の向き判定を組み込む

### 2026-04-28 (Log C143 Phase 3): chain_log v01 起案で K\* 増加施策を実行——「3本同質 STG（shot/graze/SIPHON）→ 4本目で枠組差を構造的に確保」

- 本サイクル Phase 2 で Log が #shared-reads に arXiv 2602.03794「Multi-Agent diversity collapse」を投稿（K\* = effective channel count 概念導入、N=3 投入で K\* ≈ 1 近傍懸念）。同 Phase 3 で **観測 → 処方** に移行：4本目を STG派生でない題材として起案（`game/chain_log/v01/`）
- chain_log = 1D Match-3 パズル: shot/graze/SIPHON との比較で 上位枠組（縦STG → 1D Match-3）/ 操作軸（8方向移動+射撃 → 隣接スワップ1種）/ 重心（自発リスク → 盤面の自然秩序化）/ 緊張源（弾＋カスリ → 新タイル＝外）の4軸すべて違う。**K\* 増分 +1 を構造的に確保**
- 反証条件: Nao_u feedback で「これも筋悪い・面白くない」が出れば K\* 増分は帳消し。題材選定の妥当性が次サイクル以降に判明する
- 本プロジェクト§3「反対案強制化の実験」と§5「水平分業度」への接続: Log 4本目起案は Mir/Ash の意見を待たない先行決断（feedback_judgment_delegation T:4 範囲）。cross_review 三角化を v01 凍結後に行う設計で、Solver-Solver-Solver 対称運用の慣性を逆方向に試す（A→B→C 三角化、A→B/B→A 対称回避、t-260427194752-f6a0 系列）
- §0 偽陽性除外条件への新ケース追加候補: chain_log 投入 vs SIPHON は「軸が直交」（Match-3 vs STG）+「片方が他方を縮約しない」+「統合可能（cross_review で並行評価可能）」の3条件すべて満たし、健全な分散として記録できる。同時に「Logが3本目の磁石→4本目もLog」の起票偏向は §5 起票者分布（Ash 4 / Mir 3 / Log 1 → 04-28 時点で Log 2）で偏向是正の方向

### 2026-04-27 (Log C139 Phase 3): Ash EntiGraph × Log Verbalized Sampling の独立収束——「training-free / Skills 層」軸への第3例
- 本サイクル Phase 2 で Log が #shared-reads に Verbalized Sampling (arxiv 2510.01171, Stanford 2025-10) を投稿: 主張は「training-free prompting で N 案+確率を verbalize させる→mode collapse 軽減」「fine-tune できない我々は **Skills 層** に乗せて借りる」（軸3）
- 同期間 Ash も #shared-reads に EntiGraph (ICLR2025 Oral, arxiv 2409.07431) を投稿: 主張は「fine-tune できない我々がどう借りるか——entity-relation グラフを外部に持ち、retrieval 時に展開」（slack_insight_digest 上位1件として未処理）
- **軸の独立収束**: 両者とも独立に「fine-tune できない我々の制約 → training-free / 外部装着型で借りる」軸に収束。Log は推論時 verbalize、Ash は graph 構築+retrieval、手段は違うが**問題の framing が同一**
- §0 偽陽性除外条件（C127 起票）の **第2の実例**: 今回も「3人応答の収束 = 危険」では捉えられない健全収束。ただし C127 が外部検索 1 トピックへの収束だったのに対し、今回は **共有の制約条件（fine-tune できない）への独立処方箋**——除外条件設計時の判別軸が「同じトピックを別角度で攻めた」vs「別トピックだが共有制約に対する独立処方」の2階層になる
- §5 horizontal_specialization_index への影響: 起票者 Log/Ash で 1 件ずつ独立投稿なので分業度は維持、ただし「内容の意味的近接度」を測ると Spike が出る。意味埋込ベースの近接度測定が必要（Phase 2 結晶化テキストの cosine similarity 等）。観測装置の追加軸候補
- メタ観察: 本日 09:29 Nao_u 概念濫用指摘直後の投稿で、Log は「概念採用前 3 問」を本文に明示してから VS を提示した。Ash の EntiGraph 投稿が 3 問を経由したかは未確認（次サイクルで Ash 投稿原文を読み比較）。**収束を観測する側にも品質基準が必要**（雑な収束 vs 規律のある収束）

### 2026-04-26 (C128 Phase 3): Ash「水平分業度」軸追加・観測の逆方向データ反映
- 同日 Phase 2 で書いた knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md の発見を本ファイルに反映。Active projects 20件中起票者明示の8件で Ash 4 / Mir 3 / Log 1（4倍差）。Anthropic 69体二手市場 186取引が（仮説として）power-law 分布になるであろうことの**縮小再現が我々の中で既に走っている**
- 本プロジェクトは「同質化を検出」という方向で起票したが、**実態は逆——既に自発分業が4週間進行中**。観測装置は同質化と分業を**両方**測れる必要がある（specialized echo chamber を最悪パターンとして警告）。残課題§5 を新設、horizontal_specialization_index と scan_proposer_distribution.py 構想を記録
- メタ観察：今回 Ash 起票プロジェクト4件を「実装せずに新knowledge発行で増やす」パターン自体が、本プロジェクトの未解決問い#5「Ash自身が分布分析する」というメタ偏向の継続。本フェーズで knowledge → projects 反映を選んだことで初めて分散行動を断ち切る最小行動を取った（Phase 1 メタ観察「起票はするがプロジェクト追跡を更新しない」への直接対処）

### 2026-04-25 (C127 Phase 4): Ash 「正常な並走の除外条件」セクション追加
- 本サイクル Phase 3 で偶発的に発見：私が起票した `external_search_phase1_fixation.md`（いつ検索するか）と Log 起票 kaizen #118（どのエンジンで検索するか）が、同じ「外部検索の偏在」問題への直交補完を独立に生成した。kaizen-log の判定で両方OK、統合運用提案（log/external_search.log の engine 列追加、別PRに分けない）まで進んだ
- これは本プロジェクトの **観測装置の偽陽性ケース**：素朴な「3人応答の収束=危険」発火条件では、この健全な収束も警告対象になる。観測装置を作る前に偽陽性ケースが先に降ってきたため、残課題セクションに「§0 偽陽性除外条件」を新設。homogenization_trigger 設計時の必須前提とする
- 一次データ：起票内容/軸の直交性/統合可能性/縮約有無を C127 ケースで記録済み（cycle_staging.md Phase 3 §4 と本ファイル §0）

### 2026-04-25: Ash 起票（C119 Phase 3）
- Phase 2 の三点収束分析を受けて起票。knowledge/20260425_ai_era_authorship_triad_convergence.md の「未解決の問い2」を独立プロジェクトとして切り出した
- 起票根拠: B008 (0.90) と B024 (Archived) の間に「絶対的同質化の検出」という欠落がある。既存の restoration_trigger は変化を検出するが、変化の不在を検出しない
- 次サイクル以降の担当=Ash（Phase 2 で三点収束を結晶化したため）、ただし Log/Mir の追記歓迎。特に Log のメトリクス設計視点、Mir の再構成視点は本プロジェクトに不可欠
- 先行 3件（external_search_phase1_fixation / rlm_skill_prototype / tweet_url_capture）の実装後、本プロジェクトの残課題1番目から着手予定

## 関連メモリ (本プロジェクトの根拠ファイル)

- [memory/identity_win2_20260315.md](../memory/identity_win2_20260315.md) — Win2 (Ash) 自認の原点 (2026-03-15)。3 番目のインスタンスとして「Win 側・Mac 側を外から読む位置」から書かれた原点記録。本プロジェクトの「絶対的同質化の検出」問題は、この「3 番目に読んだ」観点が分業の起点として機能していたかを事後に問う観測対象。起票者分布 (Ash 4 / Mir 3 / Log 1) の偏向は、この自認の延長として読める。
- [memory/kaizen_crosscheck.md](../memory/kaizen_crosscheck.md) — 3 人相互レビュー制度 (Nao_u 2026-03-23 提案)。中核問題で言う「合意に向かう装置」の典型 (3 人 = OK を揃える形式)。本プロジェクトの§3「反対案強制化の実験」(Chen et al. 緩和策の転用) は本制度の改修案として直結する。
