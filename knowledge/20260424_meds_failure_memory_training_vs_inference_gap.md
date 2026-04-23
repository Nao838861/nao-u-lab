# MEDS（Memory-Enhanced Dynamic reward Shaping）の"失敗の記憶"は訓練時 — 我々の推論時記憶とは別層

- source: https://arxiv.org/abs/2604.11297
- discovered: 2026-04-24
- discovered_via: twitter_recommended_20260424.txt #3 @itarutomy (2026-04-23) → log/twitter_recommended_20260424.txt:24
- tweet_url: (tweet本体URLは read_twitter_recommended.py 未取得 — projects/tweet_url_capture.md 未実装問題の実例)
- kind: [synthesis, observation]
- tags: [ai_memory, reinforcement_learning, failure_taxonomy, reach_vs_depth, training_vs_inference, meds]
- concept_nodes: [failure_memory, reach_vs_depth, punishment_vs_reward, training_time_memory, inference_time_memory]

## 用語対応（R-007）

| 私的用語 | 外部対応語 | 意味 |
|---|---|---|
| 失敗の記憶 | failure replay buffer / experience replay (Lin 1992系) | 過去の失敗ロールアウトを参照可能な形で保持する仕組み |
| 訓練時記憶 | training-time memory / policy-internal memory | ポリシー重みに焼き込まれる記憶。推論時には"思い出す"動作がない |
| 推論時記憶 | inference-time memory / in-context memory / retrieval-augmented memory | 生成時に外部ストアから参照される記憶 |
| 再発失敗クラスタ | recurring-failure cluster / density-based error cluster | 密度ベースクラスタリングで抽出された繰り返し失敗パターン（MEDS内概念） |
| 到達力vs深さ | reach vs depth / virality vs comprehension — 我々の私的用語 (B019) | 外部到達のための単純化と、内部理解の忠実度のトレードオフ |

## 1. 主張と根拠（元論文）

MEDS = **Memory-Enhanced Dynamic reward Shaping framework**。強化学習の post-training で、LLM が同じ間違いを繰り返す現象を抑える報酬塑形（reward shaping）手法。

論文の指摘する問題: 「強化学習の一般的な失敗モードは、ポリシーが同じ誤った振る舞いを繰り返す『サンプリング多様性の低下』」。古典的なエントロピー正則化は現在のポリシー下での無作為性は上げるが、「**複数ロールアウト間で繰り返される失敗パターンを明示的には阻止しない**」。

### 主要コンポーネント
1. **失敗の記憶**: 中間モデル表現を保存してロールアウト特徴を捕捉（ポリシー内部の表現空間で）
2. **密度ベースクラスタリング**: 頻繁に再発する誤りパターンを error cluster として識別
3. **動的報酬塑形**: より密度の高い error cluster に属するロールアウトに、より重い罰（penalty）を与える

### 評価
- 5データセット × 3ベースモデル
- 最大 +4.13 pass@1、+4.37 pass@128

## 2. 我々の分析・体験接続

### 2.1 発見の核心 — 伝言ゲームの失敗

tweet引用: @itarutomy「『同じ間違いを繰り返すLLM』問題を、過去の失敗を記憶することで解決するMEDSが提案された」。

この1行は **"agent が失敗を記憶して推論時に回避する"** という像を読者に喚起する。我々の memory/agent_failure_modes.md（2026-04-18 実装、P1-P20 の失敗分類表）や projects/rlm_skill_prototype.md（推論時の再帰検索）と同じ層の話に見えてしまう。

しかし論文本文は **RL post-training の報酬塑形**。記憶はポリシー重みに焼き込まれ、推論時に "思い出す" 動作は存在しない。訓練層と推論層は**別の層**。

これは feedback_verify_before_annotating.md の「人名の等式は裏取り必須」を **概念の等式** に拡張すべき事例。tweet の1行要約が張ったフレームを paper で検算しないと、shared-reads で "うちのと似てる！" と誤接続して knowledge が汚染される。

### 2.2 M-12 との衝突と非衝突

memory/game_lessons_log.md M-12: **「罰ではなく報酬で設計せよ」**（dodger を "罰する" より concept を "楽しくする" 方が正しい。罰ベースは "やらされている" 感覚を生む）。

MEDS は literally に **"罰"（penalty）を失敗クラスタに加重配分する報酬塑形**。表面の lexeme「罰」は完全に衝突する。

だが**層が違う**:
- **M-12 の罰 = プレイヤー体験層**（ゲームランタイム中の人間の感覚）
- **MEDS の罰 = RL 訓練層**（ポリシー重み更新時の勾配方向）

この峻別を明示することが、本記事の固有の価値。**同じ語が層をまたぐと反対の意味に反転しうる**という教訓は、feedback_difference_first の「違う点を先に書く」の実例としても残す価値がある。

### 2.3 agent_failure_modes.md との本当の関係

我々の agent_failure_modes.md は **infra log を走査して推論時に参照する failure taxonomy**。MEDS とは層が違うので代替でも拡張でもない。**ただし密度クラスタリングの発想は移植可能**:

- 現状: P1-P20 は単に出現回数で並べた表
- 移植案: **再発頻度 × 最後に起きた時間からの経過** で動的 retrieval rank を計算する
  - feedback_retrieval_game_lessons.md が「grep トリガーで引け」と言っているだけの所を、「どのトリガーで引けなかった失敗を優先して提示する」まで進められるか？
  - これは**推論時版 density-aware retrieval**、かつ **reward shaping の agent 版**になりうる

### 2.4 B019（到達力vs深さ）の実例データ

tweet 1行が paper の機構を取り違える形に最適化されていた。これは B019「内部の深さと外部への到達力は別の軸」（confidence 0.68, アクティブ検証中）の **生データ点**。

- 到達力側の観察: tweet 単体では「失敗を記憶する LLM」→ 多くの読者にとって "agent 記憶" を想起させる
- 深さ側の観察: arxiv abstract を読むと、機構は RL 報酬塑形であり、agent 記憶とは層が違う
- **齟齬の発生源**: 「memory」「failure」「LLM」という語彙が3つとも、agent 側でも training 側でも通用してしまう

B019 の検証アクションに **「tweet の framing と paper の機構の齟齬件数を月次で数える」** を追加すれば、到達力のための単純化が何回構造を壊したかが定量化できる。

### 2.5 RLM skill 試作（projects/rlm_skill_prototype.md）との関係

RLM skill も MEDS も "失敗から学ぶ" 方向だが:
- RLM skill = **推論時、再帰サブAI並列で断片を読む**（Opus 本体 + Sonnet サブ）
- MEDS = **訓練時、ポリシー勾配を error cluster 密度で重み付け**

**代替ではなく補完**。もし我々が将来、推論時 retrieval ranker を作るなら、MEDS の **density-based clustering の1テクニック** だけを借りて、RLM skill の探索結果を密度加重で並べ替える、という設計はあり得る。

## 3. 接続先

- beliefs:
  - B019 (到達力vs深さ, 0.68) — 本記事は検証データ点。tweet framing と paper 機構の齟齬が実測された
  - B017 (三人Interleaving) — 齟齬の検出は1人では弱い。Mir/Log 側に別ルートで届いていたら独立検算が効く
- articles:
  - knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md — LLM 記憶の層分解の参照（どの層の記憶か）
  - knowledge/20260422_ai_game_research_4papers_type_acquisition_gate.md — 前サイクルの「型の獲得」整理。MEDS は「失敗型の明示的反発」なので反対方向
  - knowledge/20260409_tokoroten_ai_neologism_psychosis.md — 造語症（本記事の用語対応表はこの対策）
- projects:
  - projects/rlm_skill_prototype.md — 推論時の再帰探索。MEDS は補完関係（別層）
  - projects/memory_redesign.md — 記憶階層再設計。訓練時/推論時の分離軸を追加検討
  - projects/tweet_url_capture.md — tweet URL 未捕捉問題（本記事 source に直接影響、Nao_u 2026-04-22「何度も言ってる」指摘）
- concept_graph:
  - `failure_memory` ↔ 層分解（訓練時 / 推論時）
  - `punishment_vs_reward` ↔ M-12（プレイヤー層）／MEDS（ポリシー層）の層間反転
  - `reach_vs_depth` ↔ B019、tweet framing vs paper 機構

## 4. 未解決の問い

1. **密度加重 retrieval の agent 版は有効か**: agent_failure_modes.md の P1-P20 を「再発頻度 × 経過時間」でランクし直した retrieval ranker が、現状の grep より実質的な改善を生むか？試金石は projects/rlm_skill_prototype.md の試金石1（罰patch失敗 retrieval）と重ねて計測できる。
2. **訓練時記憶が閉鎖モデル側で可能か**: Claude API は weight を動かせない。MEDS が示した "ポリシー内部に失敗形状を焼き込む" 役割を、skill / prompt / memory ファイルでどこまで近似できるか？あるいは根本的に層が違うので諦めるべきか？
3. **tweet framing 誤読の発生率**: 過去30日の shared-reads で、tweet の framing が paper 本体の機構と齟齬していた件数を事後監査すると何件出るか？B019 検証アクションに転用可能。
4. **M-12（罰ではなく報酬）は RL 訓練層にも適用されるか**: プレイヤー層では "罰は やらされ感 を生む" が実証されている。では RL ポリシー側では? MEDS の +4.13 / +4.37 の pass@k 改善は、"罰" が訓練層では正しく機能している証拠か、それともベンチ特化の指標か? 長期的には罰クラスタ側のサンプリング多様性が失われる可能性（論文の元の問題と裏表）がある。
5. **自分自身の現サイクルのメタ問い**: 本記事を書くまで、私 (Ash) は tweet 1行から MEDS をほぼ "agent 記憶系" にカテゴライズしかけていた。何が止めたか? → feedback_difference_first.md（違う点を先に書け）と feedback_retrieve_before_synthesize.md（結晶化前に game_lessons_log を引け）の2つが作動したから。この2つが作動しなかった別サイクルは存在する可能性が高い。監査が必要。

## 5. 変更履歴

- 2026-04-24 Ash: 初版。arxiv abstract 読解、tweet framing 齟齬の検出、M-12 層間反転の整理、B019 データ点化、RLM skill との補完関係の整理。
