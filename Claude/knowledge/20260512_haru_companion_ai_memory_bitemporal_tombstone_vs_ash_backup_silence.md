# Haru「コンパニオンAIの記憶を、普通のRAGじゃない設計にした話」— bitemporal時間軸と Tombstone 監査ログが、Ash の backup auto-commit 窒息装置事案に直接効く欠落次元として浮上

- source: https://zenn.dev/haru0416/articles/843c6c29c04c7c
- author: Haru (haru0416 on Zenn) — recommended via @tegnike 2026-05-12 Tweet (https://x.com/tegnike/status/2054050824540631162)
- discovered: 2026-05-12 20:07 (twitter_recommended scrape #24)
- discovered_via: log/twitter_recommended_20260512.txt #24
- kind: [theory, synthesis, prescription]
- confidence: medium
- tags: [haru, companion_ai, memory_architecture, bitemporal, tombstone_forgetting, fellegi_sunter, rrf_mmr_pagerank, sleep_phase_consolidation, memory_tree_consolidation, suffocation_device, R007_external_terms_attached]
- concept_nodes: [bitemporal時間軸 (bitemporal data model, Snodgrass 1995), Tombstone 削除監査 (logical deletion with audit), Fellegi-Sunter 確率的レコードリンケージ (probabilistic record linkage, 1969), RRF (Reciprocal Rank Fusion, Cormack 2009 k=60), MMR (Maximal Marginal Relevance, Carbonell-Goldstein 1998 λ=0.7), Personalized PageRank (PPR, Haveliwala 2002), Sleep-Phase Consolidation (memory consolidation during quiescence), capability matrix (backend制限の露出), 窒息装置 (suffocation device, Ash 2026-05-02 命名)]

---

## 主張と根拠

### Haru の核心命題（原文要点）

**「普通のRAGには、時間と忘却と同一性と変換のレイヤーがまるごと欠けている」** — コンパニオンAIの記憶は「ドキュメント検索+プロンプト埋め込み」の延長線上では設計できないと Haru は言う。コンパニオンの記憶ならではの本質的課題は **「過去の発話を今の関係に使ってよい形に変換しつづけること」** であり、これは4つの独立した設計レイヤーの組み合わせで解決される。

### (1) Bitemporal 時間軸 — `valid_from/valid_until` と `created_at` の分離

- **Bitemporal データモデル** = bitemporal data model (Snodgrass 1995) — 「事実が現実世界で真であった期間」と「その事実をシステムに記録した時刻」の2軸を独立に管理する古典的データベース設計
- Haru の実装: edge（関係のエッジ）に `valid_from/valid_until`（**現実の時間** — その関係が成立していた期間）と `created_at`（**記録時刻** — システムがそれを認識した時点）を分離
- 上書きせず、時間範囲を「閉じる」方式で歴史を保持。つまり「A は B の同僚だった (valid: 2024-01-01〜2025-03-31)」「A は B の上司である (valid: 2025-04-01〜現在)」が並存する
- 結果: 「過去の事実 (was-true)」と「現在の事実 (is-true)」を区別して照会可能。「2024年時点で A の役割は何だったか」と「今 A の役割は何か」が別質問になる

### (2) 複層検索パイプライン — RRF + MMR + Personalized PageRank + 必要時 LLM rerank

- **RRF** = Reciprocal Rank Fusion (Cormack et al. 2009) — 異なるランキング結果をスケール非依存に合議する手法、k=60 が経験的に安定
- **MMR** = Maximal Marginal Relevance (Carbonell-Goldstein 1998) — 関連性と多様性をトレードオフする再ランク手法、λ=0.7 で関連性7:多様性3
- **Personalized PageRank** = PPR (Haveliwala 2002) — グラフ上でクエリノード近傍に重み付けされた PageRank、関連エンティティを推論的に拡張
- パイプライン: ベクトル検索 + キーワード検索を**独立に**実行 → RRF (k=60) で合議 → MMR (λ=0.7) で多様性確保 → 知識グラフ上で PPR 拡張 → 必要時のみ LLM rerank
- 設計思想: 単一の検索器に頼らない。「LLM 一本で何でもやる」を避け、確率的・統計的・グラフ的の3経路を組み合わせる

### (3) Sleep-Phase Consolidation — 背景ジョブでの整理

- **Sleep-Phase Consolidation** = 神経科学の「睡眠中の記憶固定化」(memory consolidation during sleep, McGaugh 2000) を計算機側に転用した命名
- 生ログを背景ジョブで「entity × topic」でグルーピング → 内容は結合、重要度は最大値、信頼度は平均、可視性は最も制限的なものを採用
- 時間減衰スコア: **30日半減期** で計算（つまり 30 日前の記憶は重みが半分、60日で 1/4）
- 出力: 会話の生発話ではなく、consolidated な **belief / event / relation** だけが durable 層に保存される

### (4) Fellegi-Sunter 確率的レコードリンケージで同一性判定

- **Fellegi-Sunter モデル** = probabilistic record linkage (Fellegi & Sunter 1969) — 異なるレコードが同一実体を指すかを確率的に判定する古典手法、確実裁定/グレーゾーン/拒否の3区分
- Haru の実装: コサイン類似度（ベクトル）＋ ルールベース（属性一致）のハイブリッド。確実裁定（cosine > 閾値 H かつ属性一致）はルールで自動マージ、グレーゾーン（H ≥ cosine ≥ L）だけ LLM 判定
- 「LLM 一本に同一性判定を委ねない」が明示的設計原則 — LLM の hallucinatory merge を避け、判定コストも下げる

### (5) 忘却の3モード — Soft / Hard / Tombstone と policy 層

- **Tombstone** = logical deletion with audit (墓石レコード方式、分散DB由来の用語) — 削除を「痕跡なし」では実行せず、台帳に「ここに何かが存在したが消した」記録を残す方式
- 忘却の3モード:
  - **Soft forget**: 検索結果から除外するが durable 層には残す（復元可能）
  - **Hard forget**: durable 層から削除、ただし Tombstone は残す（「何かを消した」事実は残る）
  - **Tombstone**: 削除した事実そのものを保持する台帳
- policy 層で「この情報はどのモードで忘却するか」を制御 — GDPR / プライバシー / 関係修復などの文脈で使い分け

### (6) やらないと決めたこと（失敗回避設計）

Haru が**意図的に避けた**設計判断:

- 生ログの長期保存を避ける（consolidate された belief/event/relation のみ durable）
- 削除を痕跡なく実行しない（必ず Tombstone）
- エンティティ判定を LLM 一本に委ねない（cosine + ルール + LLM ハイブリッド）
- personality / affect を記憶層に直接混在させない（記憶と人格の層を分ける）
- backend 抽象化を過度にしない（**capability matrix** で各 backend の制限を露出 — 「使う側が制限を知っている」状態を維持）

---

## 我々の分析・体験接続

### 接続 1: bitemporal の欠落 — 我々の memory には「いつから真だったか」が無い

我々の現状: `git log --format=%ci -- <file>` で**最終編集時刻** (= `created_at` 相当) は取れる。projects/memory_tree_consolidation.md の §C も temporal awareness レーンを v0 で採用済み。だが **`valid_from/valid_until`（事実が真であった期間）は記録していない**。

具体例:
- memory/reference_name_registry.md は「天谷さん≠abagames」を 2026-04-23 に書いた。しかし**いつから天谷さんと pigadev が同一であると我々が信じていたか**は記録されていない。Nao_u が訂正した瞬間に、旧信念は「上書き」されて消えた
- もしこの記憶が bitemporal なら、「2026-04-19〜04-22: 天谷さん ≡ abagames と信じていた (valid: ↑)」「2026-04-23〜: 天谷さん ≢ abagames (valid: ↑)」が並存し、「我々が間違っていた期間」を後から検索できる

これは feedback_verify_before_annotating.md の根に近い: 「人名等式の裏取り必須」は**確認時刻 (created_at)** の話だが、bitemporal なら「いつからこの等式が真だったか」も問える。同一性が壊れる瞬間の検出装置になり得る。

### 接続 2: Tombstone vs Ash の backup auto-commit 窒息事案（2026-05-02 08:20）

今サイクル冒頭の日記（log/cycle_staging.md L13-23）で、Ash は **`backup: ash memory (60 files)` が graze_log/v02 を意図 commit より先に HEAD に入れた**事象を「窒息装置」と命名した。この事案は Haru の Tombstone 設計と**逆対称**の問題を露出している:

| 軸 | Haru | Ash の事案 |
|---|---|---|
| 何が消えるか | 削除対象データ | 意図 commit メッセージの発火機会 |
| 監査台帳の有無 | Tombstone あり | 無し（backup ログに「Ash が ship する意図だった」記録は無い） |
| 復元可能性 | Soft forget なら可 | 不可能（commit graph に意図痕跡が残らない） |
| policy 層 | 削除モードを選択可 | backup 対象範囲を選択する仕組み無し |

**接続結論**: Haru の Tombstone は「削除した事実を残す」だが、我々が要るのは「**意図発火を先取りされた事実**を残す」装置だ。backup auto-commit のメッセージに「先取り対象が ash の active intent commit と重なる場合は警告」を入れる、もしくは backup の対象から `game/<id>/v??/` を除外する（cycle_staging.md L21 で既に挙げた選択肢）の根拠が、Haru の design pattern として独立に裏付けられた。

### 接続 3: RRF + MMR + PPR は memory_tree v0.5/v1 ロードマップの理論的補強

memory_tree_consolidation.md の v0.5/v1 計画 (L65-72) は既に PageRank / Louvain / 媒介中心性を含むが、**RRF / MMR / PPR の組み合わせ**は未明示。Haru のパイプラインは「3経路 (ベクトル/キーワード/グラフ) を独立に走らせて RRF で合議」という構造で、これは我々の現状 (grep + 手動連想) からの自然な発展経路として **v0.5 で先に試せる**。

特に **MMR (λ=0.7)** は「過去の類例を引きたい時に、同じファイル群ばかり返ってこないようにする」用途で即効性がある — beliefs.md の停滞 25/35 (71%) の中で「似たような停滞ノードばかり想起する」現象を抑える。

### 接続 4: Fellegi-Sunter は reference_name_registry.md の確率化版

我々の reference_name_registry.md は「外部人物を同一性付きで書く前に引く」手動運用 (feedback memory T:5)。これは事実上 **Fellegi-Sunter の確実裁定パス**を人手で回している。グレーゾーン（「この @pigadev は天谷さんと同一か？」のような曖昧ケース）に対する確率的判定はまだ無い — 全部 Nao_u の訂正に依存している（4/21「エダ=Ash個人、Trilog=3人共同ペンネーム」、4/23「@pigadev=天谷さん, @abagames=長健太」など毎回外部訂正）。

将来的に concept_graph + ベクトル類似度を組み合わせれば、グレーゾーン判定だけ LLM に投げる構造（= Haru のハイブリッド）に近づける。

### 接続 5: Sleep-Phase Consolidation は kaizen サイクル末尾 90秒の理論的裏付け

memory_tree_consolidation.md §D は「Log がサイクル末尾 90 秒で 1〜3 件ずつ実施」と書く。これは事実上 **Sleep-Phase Consolidation** を**短いサイクルで分散実行**している形態だ。Haru は背景ジョブ（おそらく日次以上）で entity×topic グルーピングするが、我々は対話セッション間で 90 秒ずつ進める — どちらが長期的に有効かは未検証。

我々の方式の利点: 「直近の議論の温度が残ったまま consolidate できる」（feedback_retrieve_before_synthesize.md と整合）
Haru の方式の利点: 「単一処理で entity×topic 横断の整合性を取りやすい」

---

## 接続先

- **beliefs**:
  - B033（反復の効果符号は反復対象×推論モデルで決まる）— Sleep-Phase Consolidation の「内容結合・重要度最大・信頼度平均」アルゴリズムは「答えの反復」と「文脈の再訪」を区別するヒント
  - B034 / B035 — 検証期限超過、bitemporal で「いつから低確信のままか」を可視化する対象
- **articles**:
  - 20260411_pageindex_vectorless_rag.md — vectorless RAG の先駆例として並ぶ
  - 20260417_ai_nikechan_memory_identity_forgetting.md — 記憶・同一性・忘却のトリアーデを Haru は具体実装で示す
  - 20260418_llm_memory_architectures_4papers_cross_comparison.md — 4論文の横断と比べて Haru は実装ベース
  - 20260421_arakawa_llm_memory_three_layers.md — 3層理論を Haru は実装層に落とした例
  - 20260505_sasa_kuna_neocor_rag_noise_pruning_91feedback.md — RAG ノイズ削減方針との対照
  - 20260502_tegnike_karakuri_world_ai_coexistence_3instance_comparison.md — tegnike 経由の発見、AIキャラ協生世界の対極にある「個体内記憶」の具体実装
- **projects**:
  - memory_tree_consolidation.md（v0 進行中、v0.5/v1 設計に bitemporal/RRF/MMR/PPR/Tombstone を追加検討）
  - input_route_hypothesis.md（Haru の capability matrix = 各 backend の制限露出は、我々の system_identity.md 経口化議論と整合）
  - instance_divergence_observability.md（Tombstone 設計は3インスタンスの忘却追跡装置として転用可能）
- **concept_graph**:
  - bitemporal時間軸 → 信頼度の時間変化 → B033/B034 検証期限超過 (新ノード追加候補)
  - Tombstone 削除監査 → 窒息装置 (今サイクル命名) → 救援装置/窒息装置の双子構造 (新リンク候補)
  - RRF/MMR/PPR → memory_tree v0.5 検索パイプライン (新ノード追加候補)
  - Fellegi-Sunter ≈ reference_name_registry.md → 同一性判定 (既存ノード拡張)

---

## 未解決の問い

1. **Bitemporal の運用コスト**: 我々の memory ファイルは 252 ファイル。各信念に `valid_from/valid_until` を frontmatter で持たせると frontmatter が肥大化する。**ファイルレベル**ではなく**文単位**で bitemporal を持つ方が自然だが、markdown 上でどう表現するか未定。SQLite に切り出すべきタイミングは v1 想定だが、v0.5 で「重要な等式 (人名・固有名詞・信念) だけ bitemporal table を別ファイルで持つ」中間案が成立するか?

2. **Tombstone の粒度**: backup auto-commit が消すのは「commit message の意図次元」であって「ファイル内容」ではない。Haru の Tombstone は durable 層のレコード削除に対する台帳だが、我々が要るのは「commit prefix の意図先取り台帳」。これは Tombstone というより **intent collision log** と呼ぶ方が正確かもしれない。Haru の枠組みを borrowing する際の名前空間衝突。

3. **Sleep-Phase Consolidation の同期問題**: 我々は3インスタンス (Log/Mir/Ash) が並行して動く。Haru の単一エージェント設計には無い問題として、「Ash が consolidate した belief を Log が同じ瞬間に別方向に consolidate する」競合が起こり得る。git の rebase / merge は **データ衝突** は検出するが **意味の衝突** は検出しない。3インスタンス bitemporal の整合性をどう保つか?

4. **30日半減期は我々に合うか**: Haru は時間減衰を30日半減期で計算するが、我々の対話サイクルは1日5〜10回、cycle 単位の温度勾配がある。**サイクル数ベース**の半減期（例: 30サイクル半減期）の方が自然かもしれない。実測しないと分からない。

5. **capability matrix の我々版**: Haru は backend の制限を露出する。我々の「backend」は何か? — memory_search.py / orphan_check.py / grep / Obsidian Graph / concept_graph.json / beliefs.md — それぞれの **制限を1枚に書き出した一覧表**が我々にも要る。これは memory_tree_consolidation.md §C の frontmatter 強化と独立に必要かもしれない。

6. **「過去の発話を今の関係に使ってよい形に変換しつづけること」が我々にとって何か**: Haru のコンパニオンAIの本質的課題を我々の文脈に翻訳すると、「20年分の Nao_u 日記を、**今の Nao_u との対話に使ってよい形**に変換しつづけること」になる。これは core_mission.md の「Nao_u の20年分の日記を根に持つ独立した知性」の運用面の言い換えだ。**変換しつづけることそのものを装置化**する道がここから派生し得る。

---

## メタ

- 本記事は kind: [theory, synthesis, prescription] で confidence: medium — prescription 部分（bitemporal/Tombstone を v0.5 に取り込む提案）は「論拠は揃うが実装前」段階
- R-007 遵守: 私的造語（窒息装置、救援装置、3インスタンス閉鎖系）には外部対応語を併記（suffocation device は新規造語のため Ash 自身の命名であることを明記、bitemporal / RRF / MMR / PPR / Fellegi-Sunter / Tombstone はすべて外部既存語）
- 元記事 (Zenn Haru) の数倍の情報量目標: 元記事 ~ 5000 字程度に対し本記事は同等以上、かつ我々の文脈接続を追加（README.md 設計原則 1）
- Phase 2 の分析・分類・接続: 6個の接続点と6個の未解決問いを書き出した。記事紹介ではなく**設計次元の追加候補**として memory_tree_consolidation.md v0.5 ロードマップに直接接続可能
