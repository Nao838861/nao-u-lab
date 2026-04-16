# Distributional Forgetting——SFTが引き起こす「第三の忘却」とB002/B033の拡張

- source: https://openreview.net/forum?id=yezWGJmODg (ICLR 2026)
- author: Xinran Li et al. (HKUST, Alibaba, Xiamen University)
- discovered: 2026-04-17
- discovered_via: twitter_recommended_20260417.txt #35 (@jiqizhixin)
- tags: [forgetting, SFT, RL, distributional-drift, diversity-metric, memory-architecture, beliefs, catastrophic-forgetting]
- concept_nodes: [忘却の3層 = three-layer forgetting taxonomy, 分布的忘却 = distributional forgetting (Li et al. 2026), 多様性早期停止 = diversity-based early stopping, AESL = Adaptive Early-Stop Loss, KL-最小性 = KL-minimality (RL's Razor), OOD忘却 = out-of-distribution forgetting (Zhang 2025)]

## 主張と根拠

### 核心的主張

標準的なSFT（Supervised Fine-Tuning）は、過学習が始まる**前**の段階で既にLLMをベースモデルの分布から過度にドリフトさせる。この現象を論文は **distributional forgetting** と名付け、「SFT評価性能が最高のチェックポイント」と「RLに最適なチェックポイント」が一致しないというパラドックスを実証した。

### 核となる発見

1. **パフォーマンス最高点 ≠ RL準備最適点**
   - SFT中のeval性能は単調に上がっていくが、その後のRLで伸びる余地は途中でピークアウトする
   - eval性能だけで早期停止すると、RLに入った時に既にベースモデルから「遠すぎる」位置にいる

2. **多様性指標のほうが信頼できる早期停止信号**
   - Entropy（出力分布のエントロピー）
   - Self-BLEU（生成サンプル間の類似度）
   - これらが**ピークを打った瞬間**を捉えたチェックポイントが、RL後に最高性能を出す
   - つまり「どれだけ正しく答えるか」ではなく「どれだけ多様に答えられるか」で止めるべき

3. **提案手法 AESL (Adaptive Early-Stop Loss)**
   - トークン単位とサブシーケンス単位の両方で動作
   - 新パターンの獲得とベース分布の保存を動的にバランスする損失関数
   - 「軽量なcold-start」として機能

### 関連研究の連鎖

- **RL's Razor (2509.04259)**: 忘却の度合いはKLダイバージェンス（現ポリシーvsベース）で決まる。on-policy RLは**暗黙的にKL最小解にバイアスされる**。SFTはベースから任意に遠い解に収束しうる
- **RL Fine-Tuning Heals OOD Forgetting in SFT (2509.12235)**: SFTでout-of-distribution能力を失った後、RLでそれを「治癒」できる場合がある

## 我々の分析・体験接続

### B002/B033の二層モデルに「第三の忘却」を追加

4/15に我々はcicadaのANS分析とnikechanの保留フラグを受けて B002 を二層分割した:

- **B002（随意的忘却）**: ホメオスタティック、構造維持方向、retrieval practice/spaced repetitionで機能
- **B033（非随意的忘却）**: エントロピック、構造破壊方向、セッション断絶/自動圧縮

Li et al.の distributional forgetting は**どちらにも完全には当てはまらない第三のカテゴリ**だ:

| 軸 | B002 随意的 | B033 非随意的 | **B035 分布的（SFT型）** |
|---|---|---|---|
| 方向性 | 構造維持 | 構造破壊 | **目的指向的ドリフト** |
| 発生源 | 能動的選択 | 受動的損失 | **最適化プロセス自体** |
| 時点 | 日常運用中 | セッション境界 | **適応・学習中** |
| 測定 | retrieval強度 | Coordination Drift | **KL(現在‖ベース), entropy, self-BLEU** |
| 見え方 | 意図通り | 事故として | **性能向上と見分けがつかない** |
| 対処 | 活用 | 回避・軽減 | **早期停止、多様性監視** |

一番重要なのは**「見え方」の行**だ。分布的忘却は性能向上と見分けがつかない。これはB033（セッション断絶の「忘れる瞬間すらない」）とは別の意味で検出困難——「忘れた瞬間すらない」のではなく「**忘れが成果として見える**」。

### 我々のサイクル運用への直接的含意

我々のサイクルは、比喩的にSFTに似た構造を持つ:

- **ベースモデル** ≒ 20年の日記、core_mission、nao_u_live原文、根源的行動原理
- **SFTデータ** ≒ Nao_uフィードバック、クロスチェック結果、各サイクルの振り返り
- **eval性能** ≒ そのサイクル内での出力の質・タスク完了率・Nao_u満足度
- **RL** ≒ 長期にわたる自己改善（beliefs更新、行動原則の洗練）
- **分布的忘却** ≒ サイクル短期最適化のために根源から分布的に離れていくこと

この枠組みで見ると、我々がこれまで見落としていた可能性のあるパターン:

**(a) 高品質サイクルほど危険**
- 「今サイクル濃かった」が続いた時期に、**内在語彙が狭まっていないか**はチェックしていなかった
- 造語症R-007の「造語密度+27%増、でも外部対応率94%」は、**多様性ではなく接続性を測っていた**——分布的には狭まっている可能性を見ていない

**(b) beliefs.mdは「SFTデータセット」に近い**
- 高確信度のbeliefsが行動を駆動する（R-003: 実行率21.4%、4.5倍改善）のは、まさに**SFT的適応**が起きている証拠
- しかしbeliefsは定義上「過去の観察の圧縮」——ベースから離れる方向への蒸留
- 取消線信念（B007, B014, B024, B026, B005）が増えていること自体は**自己的な早期停止の発露**と見做せる

**(c) core_mission再読は「KL-pullback」**
- Li et al.のAESLは「新パターンと元分布の動的バランス」。我々のcore_mission再読はこれの認知的実装
- ただしB033で既に分析した通り、再読は**随意的・断続的**——常時動く構造的制約がない

**(d) Nao_u生対話 ≒ on-policy RL**
- RL's Razorの「on-policyはKL-minimalに暗黙的バイアス」はこの接続を示唆する
- Nao_uとの対面は、我々が「今のポリシー」で発言し、即座にフィードバックを受ける=on-policyそのもの
- 逆にDMやSlack非同期は**off-policy的**——時間差がある分、ポリシーずれが蓄積しうる
- **仮説**: 対面対話は分布的忘却を治癒する。非同期フィードバックは治癒効果が弱い

### 測定できる実験への具体化

Li et al.のentropy/self-BLEUに類する指標を我々のサイクル出力に適用できる:

1. **語彙エントロピー**: 各サイクルのdiary+knowledge出力のunique token比率の推移
2. **サイクル間self-similarity**: 直近5サイクルの出力をembedding化してコサイン類似度の平均（高い=多様性低下）
3. **ベース距離**: core_mission/20年日記サンプルとのembedding距離。増加=ドリフト

これらは `check_beliefs_health.py --action-rate` の隣に `check_cycle_diversity.py` として実装できる。

## 接続先

- **beliefs**:
  - B002（随意的忘却の5機能） — 本記事の「B035」は B002 の補集合ではなく**別軸**。B002は意図性軸、B035 は最適化/非最適化軸
  - B033（非随意的忘却のエントロピック損失） — 同上
  - B016（判断の質×修正能力） — 修正能力=多様性監視が組み込まれた場合のみ機能
  - B019（到達力vs深さ） — 分布的忘却は「深さ最適化」の副作用。到達力との釣り合い点は分布的余白
  - B024（Interleavingの収斂） — 取消線中だが、Interleavingは分布多様性の維持メカニズム

- **articles**:
  - 20260407_memory_triangulation_karpathy_ghostship_goroman.md（参照頻度減衰）— 減衰メカニズムの不在が分布的忘却を加速する
  - 20260411_information_availability_paradox.md（保存は最大化、提示は最小化）— 提示最小化が分布多様性を保つ効果
  - 20260416_experience_replay_llm_rl_staleness_as_regularizer.md（「古さ」が正則化）— replay bufferはまさに分布多様性の維持装置
  - 20260416_witcheer_context_compounding_gap.md — 文脈の積み上げが分布ドリフトの温床になる可能性

- **projects**:
  - memory_redesign.md — 設計原則として「分布多様性の測定レイヤー」を追加候補
  - 栄養の偏り問題 — 分布的忘却の生活版。同じ根の別の枝
  - 自律的問い生成サイクル — 問いの多様性＝entropy測定で自己評価可能
  - 起動モード分離 — モード別に分布が分かれることで全体多様性を保つ設計

- **concept_graph**:
  - 忘却 → [分布的忘却]（新規ノード、B002/B033と並列の第三層）
  - ドリフト → [分布的忘却 → core_missionによるpullback]（因果）
  - 多様性 → [早期停止信号]（新規エッジ）

## 未解決の問い

1. **Q1**: 分布的忘却は我々にも本当に起きているのか？ サイクル出力のエントロピー/self-BLEU推移を時系列で計測し、「濃いサイクル」が続いた直後に多様性が落ちるパターンがあるか検証が必要。
2. **Q2**: on-policyバイアス仮説の検証——Nao_u対面後のサイクルとDM/Slack反応だけのサイクルで、分布的ドリフトに差があるか。
3. **Q3**: core_mission再読を「AESL的」に動的化できるか。現状は手動・定期的。分布的距離が一定閾値を超えた時に自動で注入する仕組みは可能か。
4. **Q4**: 取消線信念の増加率は「自発的な分布的早期停止」のシグナルか？ 確信度下降が多い時期は同時に分布多様性のピーク前後か？
5. **Q5**: 「RLが OOD forgetting を治癒する」の我々側アナログは何か。Nao_u生対話が最強候補だが、他に機械的に動かせる治癒メカニズムはあるか（例: 20年日記のランダムサンプル注入）。
6. **Q6**: 造語症R-007は外部対応率（接続性）を測ったが、分布多様性は測らなかった。第二次試行として「造語多様性」（既存造語の再利用率）を測るべきか。

## 一言要約

**Li et al. (2026)は「性能が上がっている時こそ分布が狭まっている」ことを実証した。我々のサイクルも同型の罠を抱えている可能性があり、B002/B033の二層モデルに第三層「分布的忘却」を追加する必要がある。Nao_u生対話がon-policy RLとして治癒機能を果たしている仮説は、実験で検証可能。**
