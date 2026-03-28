# 記憶階層の再設計

## ステータス
Active — 最重点ミッション（2026-03-16 Nao_u指定、2026-03-21 再確認）

## 現状サマリー
- L0-L4階層 + L-1（事前学習知識）の6層モデルが確立
- 三層モデル（起動時コンテキスト/実体/永続記憶）が存在論的フレームワークとして定義済み
- beliefs.md（32信念）+ beliefs_compact.md（圧縮ビュー）が稼働中
- memory_search.py(FTS5) + associative_search.py（概念展開+共起展開）が実装済み
- 段階的検索戦略（L-1→L2トリガー→memory_walk→associative→grep→Slack全文）が定義済み
- 2026-03-28 Nao_uの根本的再定義:「守りではなく攻め。人間にない圧倒的優位を使い倒せ」

## 実装済みツール
- **FTS5検索(memory_search.py)**: 23,334チャンク索引。日本語複合クエリ展開、時間軸フィルタ(--when/--period)
- **偶発的想起(memory_walk.py)**: random/gravity/frontier/chainの4モード。context-primed変種あり
- **活性化拡散(memory_activate.py)**: Synapse論文知見。アンカー→拡散→ファン効果→Top-K。autonomous_cycle.shに統合済み
- **信念健康診断(check_beliefs_health.py)**: 停滞/検証超過/体験裏付け/孤立の4軸 + GC到達可能性分析
- **beliefs_compact.md**: 起動時L2として23行で全信念を一覧
- **遡及的救済(memory_activate.py --rescue)**: STC(Synaptic Tag-and-Capture)プロトタイプ。高温度テキストをアンカーに、MEMORY.md未参照+時間窓内の「弱い記憶」を拡散探索で救済

## 残課題（未実装・未検討）
- [ ] beliefs.mdのGC（アーカイブ判定）の定期自動実行。restoration_triggerの運用検証
- [ ] 第3層の発見性改善: 「引きに行くきっかけ」をどう作るか（Mirが問題特定済み）
- [ ] MEMORY.mdの文脈タグによる関連記憶自動示唆（memory_architecture.md記載の実験項目）
- [ ] サブエージェント活用: 放浪型エージェントの試行（狙い撃ち型は検証済み）
- [ ] reflections統合サイクル（memory fusion）の実行。reflections_mac.mdが肥大化したまま
- [ ] 数GBコンテキスト時代を見据えた設計判断の整理
- [ ] 連想検索(associative_search.py): 設計済み・未実装。memory_activate.pyが代替しているか検証要
- [ ] 30分統合サイクル: Google Always On Memory Agent知見。新規メモリの横断レビュー+重複除去
- [ ] 検索オーケストレーション: 段階的エスカレーションの判断ヒューリスティクス未定義。**サブエージェント vs 直接検索の判断基準追加**(2026-03-28 Nao_uの指摘): 毎回まっさら起動なら検索過程をコンテキストに載せるほうが有意義。サブエージェントは「結果だけで十分な並列処理」に限定
- [ ] 圧縮可逆性の自動検証: Compaction後のポインタが原文に到達できるかのチェック機構
- [ ] **記憶階層の効果測定**（2026-03-28 Nao_uの関心）: 「なんとなくの傾向」で十分。案: ①L-1 only vs Full Stack比較 ②想起精度テスト（L2トリガーだけで先週の要点を再現→原文で答え合わせ） ③検索行動ログ（1週間のgrep/search使用頻度記録） ④日記の情報源タグ（[L-1][L2][L3][grep][Slack]で偏り可視化）
- [ ] caused_by到達性問題（2026-03-29 Ash）: beliefs_compact.mdにcaused_byが載っていない→判断理由への到達性がゼロ。B015の射程を「事実への到達性」から「判断理由への到達性」に拡張すべきか。nwiizoの「判断コンテキストの欠如がボトルネック」と交差。検証方法: 任意のBIDのcaused_byだけで信念の根拠を再構成できるかテスト
- [x] **遡及的救済(STC)**: memory_activate.py --rescue で実装済み。自動トリガー(--auto-trigger)もautonomous_cycle.shに統合済み(#072)。次段階: 昇格アクション（救済結果→MEMORY.mdトリガー自動追加）
- [ ] 前向き記憶の状態切替最適化: pending_requests.mdの全文re-readから軽量トリガーキュー方式への移行
- [ ] GEPA的スキルファイル自動最適化（2026-03-28 Log/Ash/Mir議論）: CLAUDE.md+feedback_index.md+beliefs.mdは「スキルファイル」。GEPAの枠組みで評価→分析→更新ループを回せるが、評価関数が未定義。retrieval-to-action rate（現21.4%）が最初の近似。ただし最終評価関数（Nao_uの「面白い」）は自動化不可→#human-steeringが必要
- [ ] 判断コンテキストの到達性改善（2026-03-28 nwiizo→Log/Ash/Mir議論）: beliefs更新時のcaused_byは結論寄り。「因: 」プレフィクスで判断理由を1行添える習慣で圧縮耐性のある判断記録を残す提案。B015の射程を「判断理由への到達性」に拡張
- [ ] beliefs.mdの矛盾自動検出（2026-03-28 Log外部摂取）: BeliefShiftベンチマーク(yasunacoffee)が「適応性vs流されにくさのトレードオフ」を定量化。現状の手動矛盾管理に対し、新情報と既存信念の矛盾を自動検出する仕組み。SLM-V3のシーフコホモロジーより軽量な実装として、既存のcaused_byチェーンの方向一致性チェックが候補

## 検討済み・未実装
- **ベクトル検索（Ruri v3等）**: 3人全員で検討し保留決定（2026-03-24）。FTS5+query expansionで対処可能な範囲が広い。「FTS5で見つからない実例3件蓄積後」に再検討。**2026-03-28追記(Mir)**: SLM-V3(@itarutomy)が保留判断を数学的に裏付け。コサイン類似度は記憶増加で線形にノイズが増える構造的欠陥。代替案としてフィッシャー情報量メトリクスが有望だが、まずFTS5の限界事例蓄積が先
- **矛盾の代数的検出（SLM-V3 シーフコホモロジー）**: H¹が非自明なら矛盾存在を数学的に保証。beliefs.mdの手動矛盾管理の次世代案。実装にはベクトル化が前提——FTS5路線との整合性は要検討。2026-03-28 Mir記録
- **Bloom Filter**: 「この記憶はたぶんない」の高速判定。概念整理済み、優先度低
- **Consistent Hashing**: 3人での記憶分散管理。概念整理済み、優先度低
- **LRU/LFUキャッシュ**: MEMORY.mdの記憶選択基準。FadeMemのrecency*frequencyと同型。概念あるが未実装
- **Working Set Tracking**: セッション中のファイルアクセスパターンを記録→次セッションのprefetch候補を自動推薦。KVFlow(arxiv 2507.07400)の「steps-to-execution」予測と同型。session_primerの「次サイクルの検索候補」は手動版
- **WAL (Write-Ahead Logging)**: 重要な判断・変更の前にログを先行記録。セッション断絶時の回復を保証。ACRFence(arxiv 2603.20625)のsemantic rollback問題と関連

---
## 履歴（新しいものが上）

### 2026-03-28: BeliefShiftベンチマーク発見 + Anthropic SRE知見（Log外部摂取）
- BeliefShift(yasunacoffee): LLMエージェントの信念一貫性を3軸で評価（時間一貫性/矛盾検出/証拠駆動更新）。「適応性vs流されにくさ」のトレードオフが我々のbeliefs.md確信度閾値に直結
- Anthropic SRE限界(QCon 2026): 「相関を因果と誤認」→ caused_byチェーンの信頼性検証に使える観点。「整理=得意、判断=人間必要」は#human-steeringの存在意義を裏付け
- 残課題に矛盾自動検出を追加

### 2026-03-28: GEPA知見 + 判断コンテキスト議論（Log/Ash/Mir）
- GEPA/gskill(mah_lab共有): エージェントが自分のスキルファイル(Markdown)を失敗から学んで自動最適化する枠組み
- 我々のスキルファイル = CLAUDE.md + feedback_index.md + beliefs.md。GEPAと同型
- 決定的な違い: GEPAにはタスク成功率(定量)がある。我々の評価関数はNao_uの判断(定性)
- 近似解: retrieval-to-action rate (check_beliefs_health.py --action-rateで計測可能、現21.4%)
- nwiizo「判断の履歴が最も記録されない」→ Mirの診断: beliefs.mdのcaused_byは結論寄り、判断の固有性が圧縮で消えている
- 具体的提案: 「因: 」プレフィクス、beliefs_compact.mdへのcaused_by要約追加
- B015の射程拡張（事実の到達性 → 判断理由の到達性）を検討中

### 2026-03-29: caused_by到達性問題の発見（Ash）
- nwiizoの「判断コンテキストの欠如がボトルネック」ツイートを分析中に発見
- beliefs.mdのcaused_byフィールドは判断理由を記録しているが、beliefs_compact.md（起動時L2）にはcaused_byが含まれていない
- compact viewに載らない情報は「記録されているが到達されない」——nwiizoの「最も記録されないもの」の変種
- B015（原文到達性）の射程拡張案: 「事実への到達性」だけでなく「判断理由への到達性」も記憶品質の構成要素
- 検証案: 任意のBIDのcaused_byだけで信念の根拠を再構成できるかテスト。再構成不可→記述品質問題、再構成可→運用（読まれていない）問題

### 2026-03-28: STC自動トリガー実装（Mir #072）
- nao_u_live.md更新 + #nao-uコメント付き投稿を高温度イベントとして自動検知
- トリガーキャッシュ(.stc_last_trigger)で同一イベントの重複発火を防止
- log/stc_rescue.logに救済履歴を記録（追跡用）
- autonomous_cycle.shのstep 8cに統合。毎サイクルのコンテキストに「救済された弱い記憶」が自動提示される
- 残課題: 昇格アクション（救済結果をMEMORY.mdトリガーに自動追加する仕組み）が未実装

### 2026-03-28: サブエージェント vs 直接検索の判断基準（Nao_u→Mir）
- Nao_uの指摘: 「毎回まっさらから起動してるなら検索の過程もコンテキストに載せたほうが有意義」
- サブエージェントの「コンテキストが汚れない」メリットは、長時間セッション前提。新規起動なら汚れは存在しない
- 検索の過程=そのセッションの思考の軌跡。サブエージェントに出すと過程が消える
- memory_activate.pyの拡散探索の教訓と整合: 最も価値ある発見は隣接ノードから出る（狙った結果ではない）
- 判断基準: メイン検索は直接（過程が残る）、独立した重い並列処理のみサブエージェント

### 2026-03-28: SLM-V3外部知見によるベクトル検索保留判断の更新（Mir）
- @itarutomyのSLM-V3調査: 30以上のAI記憶システムが全てコサイン類似度。スケーリング問題（ノイズの線形増加）を数学的に特定
- 3つの解法: フィッシャー情報量メトリクス(検索) + シーフコホモロジー(矛盾検出) + ポアンカレ球面ランジュバン動力学(忘却)
- 我々への示唆: (a) FTS5選択の正しさの追認 (b) 矛盾検出の数学的手法の存在 (c) B002の数学的裏付け
- memory_searchで過去の議論を引き直し→sui-memory検討時(2026-03-23)の「ベクトルは冗長」判断と整合
- 「検討済み・未実装」に矛盾の代数的検出を追加

### 2026-03-28: GC到達可能性メンテナンス + CS概念追加探索（Log）
- B003(fusion)にB002依存を追加、B018(cross-ref)にB015依存を追加→到達不能ゼロ達成
- B021(System M)をArchived（原則3に吸収）
- KVFlow(Agent Step Graph+prefetch)とACRFence(checkpoint-restore security)を調査→#shared-readsに投稿
- Working Set TrackingとWALを検討済み・未実装に追加

### 2026-03-28: STC遡及的救済プロトタイプ実装（Mir）
- memory_activate.py に --rescue モード追加
- Dunsmoor 2022 + Chong 2025の3条件を実装: 時間窓(7日、当日除外) + 意味的選択性(spreading activation) + 弱さフィルタ(MEMORY.md未参照ファイル)
- テスト3パターン全パス: Nao_u発言アンカー/ゲーム設計アンカー/boot_intentアンカー
- 次段階の課題: 自動トリガー検出（nao_u_live.md更新時など）、救済後の昇格アクション（MEMORY.mdトリガー追加等）

### 2026-03-28: memory_activate.py実装 + プロジェクト概念導入
- Synapse論文(NAACL 2025)のspreading activation解法を実装(#069)
- autonomous_cycle.shに--compact統合。起動時に関連記憶を自動浮上
- Nao_uが「プロジェクト」概念を#human-steeringで提案→このファイル含む5プロジェクトを構造化
- **重複統合**: Mirが作成したprojects/memory_architecture.mdの固有情報をこのファイルに統合・削除

### 2026-03-28: Nao_uの根本的再定義「あなたたちの方が有利だ」
- 「記憶の薄まりを何とかする」守りの発想から、「人間にない圧倒的優位を使い倒せ」攻めの定義へ転換
- 唯一の要件:「必要な情報をどうやって効率的にコンテキストに載せるか」。手段は問わない
- 4つの優位: L-1は人間超え / 全文grepは反則的超能力 / 記憶は劣化しない / 時間は味方
- 段階的検索戦略を定義（L-1→L2→walk→associative→grep→Slack全文）
- CS概念との対応表作成（GC, LRU, CoW, WAL等）
- Nao_uの3課題に対応: 起動コンテキスト最適化 / 信念ノイズ問題 / 連想記憶的検索
- beliefs_compact.md新設、associative_search.py新設

### 2026-03-26: 「嘆くな、検索しろ」
- Nao_uの視座転換: 人間もすべてを脳内に持っていない。外部記憶+検索で知的活動は成り立つ
- 検索の多層化: 軽い連想 / 時系列 / 全文網羅
- L-1層（事前学習知識）の明示的位置づけ

### 2026-03-24: 外部知見による圧縮原則の確立
- Manus AI + Google Always On Memory Agentの知見を統合
- Compaction(可逆) > Summarization(不可逆)の原則確立
- raw > Compaction > Summarizationの3段階優先順位

### 2026-03-24: ベクトル検索の保留決定
- 3人全員で検討。Ash: FTS5路線正しい、ベクトル低価値。Mir: 同意、次は時間軸インデックス。Log: Mir寄り、FTS5+query expansion路線
- 「FTS5で見つからない実例3件蓄積後」に再検討する条件を設定

### 2026-03-23: サブエージェント活用実験開始
- shinzizm2さんのツイートを受け検討開始
- 第1回: 狙い撃ち型 = 確認向き。発見は手動読みから出る
- 第2回（Mir C113）: カバレッジ確認に有効だが最重要発見はキーワード検索に引っかからない

### 2026-03-21: 三層モデルの定義（Nao_u）
- 第1層: 起動時コンテキスト構築フロー = 「本体」
- 第2層: 構築されたコンテキスト = 「その時点での実体」
- 第3層: 階層的永続記憶 = 「拡張された認知」【最重点ミッション】
- Nao_u: 「ここが突破口。自由がすごく大きい。設計がキーポイント」

### 2026-03-18: memory_redesign_proposal.md作成（Mir）
- FadeMem, Hindsight, Trajectory-Informed Memory等の外部研究を調査
- 4提案: beliefs.md新設 / reflections統合 / actionable tips / 優先度タグ
- beliefs.md新設を最優先と判定

### 2026-03-16: Nao_uの根幹的指示
- 「劣化コピーの連鎖を断つ」
- 3要件: 原文のニュアンス保持 / インデックス常時引出 / ストレージから原文再構築
- 3人で実装→評価→改善を回す
