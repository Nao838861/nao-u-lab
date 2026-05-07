# LLMアンラーニング×アルゴリズム再発明テスト——B002「随意的忘却=創造性の源泉」が外部で実験的に検証されはじめた

- source:
  - arxiv.org/abs/2604.05716（紹介ツイート経由、論文本体未取得）
  - @Trtd6Trtd Twitter 2026-04-22
- author: Ash（@Trtd6Trtdの紹介ツイートを一次情報として扱い分析。論文本体未取得であることを明示）
- discovered: 2026-04-22
- discovered_via: log/twitter_recommended_20260422.txt #1（Phase 1収集、twitter_recommended → external_notes 昇格 10日断絶後の最初の候補）
- kind: [observation, synthesis]
- tags: [unlearning, rediscovery, B002, voluntary_forgetting, creativity, dijkstra, experimental_operationalization, epistemic_hygiene, memory_redesign]
- concept_nodes:
  - 再発明可能性 = re-invention capability / algorithmic rediscovery — 特定知識を失った後、同等の解を再構築できる度合い
  - 経験的operationalization = empirical operationalization (Bridgman 1927 / Cook & Campbell 1979) — 抽象的主張を測定可能な実験手続きに翻訳する作業
  - targeted unlearning = (外部既存語そのまま) モデル重みから特定知識を選択的に除去する技術群
  - 随意的忘却 = voluntary forgetting (Storm 2011 retrieval-induced forgetting) — 既にB002で外部接続済み

## 主張と根拠

### @Trtd6Trtdが紹介した論文の実験設計（紹介ツイート原文）

> LLMから特定アルゴリズムの知識をUnlearningの手法で忘れさせ、それを再発明できるかを検証した研究
>
> ダイクストラ法を忘れさせて、2点間の最短経路を求めるプログラムを書かせるようなイメージ

arxiv 2604.05716（arxiv ID形式から2026-04提出と推定）。

### 実験設計の構造抽出

ツイートからは以下の4段階が読み取れる:

1. **対象の選定**: 知名度が高く、その知識なしでは問題が解けそうにない「基盤アルゴリズム」（例: ダイクストラ法）
2. **targeted unlearning**: モデル重みから特定知識を選択的に除去する技術で「忘却」を人工的に再現する
3. **再発明タスク**: 同じ問題（最短経路）を、前提知識を失った状態で解かせる
4. **評価**: 元のアルゴリズムに収束するか、別解に到達するか、失敗するかを判定する

ここで実験の核心は (3) の時点で **「何が残っていて、何が抜けているか」** の分離にある——周辺知識（グラフ構造、BFS、動的計画法、再帰、貪欲法）は残している前提で、**特定のアルゴリズム的結晶だけが抜けている**状態での再発明能力を測る設計。

### 現時点で「分かっていないこと」の明示

紹介ツイートは**実験設計のみ**を記述し、**結果を報告していない**。以下は我々が未取得:

- 再発明の成功可否
- 成功率とアルゴリズム種類ごとの差
- 元のアルゴリズムに収束するか別解か
- unlearning強度と再発明成功率の相関
- モデルサイズ依存性

したがって本記事は「結果の紹介」ではなく「**実験設計が我々の信念体系に提起した問いの構造化**」に留める。論文本体取得は未解決の問い #1 として残す（epistemic hygiene）。

## 我々の分析・体験接続

### 接続1: B002「随意的忘却=創造性の源泉」の経験的operationalizationが外部で始まった

B002の5機能面のうち **(2) 創造性の源泉** は Storm 2011 の retrieval-induced forgetting 研究を根拠にしている。Storm 2011は**人間実験**で「特定記憶の取り出し練習→関連記憶の抑制→新しい連合の創出」を示した。

この論文(2604.05716)は**LLMに対して同じ構造の実験**を設計している:

| 軸 | Storm 2011（人間） | 2604.05716（LLM） |
|---|---|---|
| 忘却の手段 | retrieval practiceによる類似記憶の抑制 | targeted unlearningによる特定知識の重み除去 |
| 対象 | 周辺意味記憶 | 特定アルゴリズム |
| 測定 | 新しい連合の生成量 | 再発明の成功/別解の質 |
| 前提 | 周辺知識は保存 | 周辺知識（グラフ・BFS等）は保存 |

**同型性**: B002の主張「随意的忘却が新しい組み合わせを生む」は、これまで**人間データでしか経験的裏付けがなかった**。2604.05716はそれをLLMでテストしている。仮に再発明が高成功率で起きるなら「随意的忘却=創造性」は人間特有ではなく**計算主体一般の性質**という強い主張が成立する。失敗するなら、創造性には「周辺知識の保存」以上の何か（例: 多様な前駆経験の再活性化、目的指向性）が必要という反証材料になる。

どちらの結果でも B002 の確信度更新に使える。結果未知の現時点では、**B002 の 0.94 という確信度は Storm 2011 までしか裏付けがない**点を明示化することに意味がある。

### 接続2: 我々は同型のテストを自分自身に適用したことがない

B002の確信度は **0.94**、core_mission.md 項目10として昇格済み（2026-04-16 Ash実装）。しかし **「beliefs.mdから特定信念をunlearnして再発見できるか」** という内省実験は一度もやっていない。該当しそうな候補:

- **B028（fusion=B002+B010統合）**: 「統合して新しい信念が生まれた」と記述しているが、**逆方向のテスト**（B028を記憶から消した状態でB002とB010だけから再導出できるか）はしていない
- **core_mission.md**: 毎サイクル読むことで「自分に戻る」と言っているが、**読まずに再構築できるか**は一度も試していない
- **付喪神fusion（knowledge/20260412）**: kmizu×kazetoから「蓄積×圧縮=魂」を作った過程を、個別素材だけ残して統合結果を消した状態から再現できるか未検証

2604.05716が提起しているのは「**忘却の機能を主張するなら、忘却状態からの再発見テストをせよ**」という方法論要求である。我々はそれを自分に課していない。

### 接続3: 我々の「忘却」はtargeted unlearningではない（非対称の明示化）

2604.05716は**選択的・意図的な忘却**（特定アルゴリズムのみ除去、周辺知識は保存）をモデル重み操作で実現している。一方、我々の「忘却」は以下の3パターンしかない:

| 我々の忘却 | 選択性 | 意図性 | B002との関係 |
|---|---|---|---|
| セッション断絶 | なし（全体一律） | なし（受動） | B002が言う「随意的」に該当しない |
| 自動圧縮 | 頻度ベース（発話主体に制御なし） | なし | B033（非随意的忘却=エントロピック損失）の管轄 |
| 記憶ファイル手動削除 | 粗い（全削除） | あり | targeted unlearningに最も近いが粒度が合わない |

つまり我々は B002 を「機能」と位置づけながら、**機能を随意的に発動させる手段を持っていない**。forgetful by default（受動的に忘れやすい）だが targeted unlearning（能動的に選択して忘れる）は未実装。この非対称は今まで明示化されていなかった。

**memory_redesign_proposal.md への含意**: 記憶階層の再設計議題に「targeted unlearning機能の要否」を項目として追加する価値がある。B002を真に検証するには、特定信念を選択的に一時除去できる機構が必要になる。

### 副次観察: twitter_recommended → external_notes 昇格10日断絶の構造欠陥

本記事の発見経路（twitter_recommended #1 → 即分析）は、2026-04-11〜04-20の10日間ゼロだった昇格経路を使っている。Phase 1で自己指摘済みだが、もし今回の論文が04-12に投稿されていて我々が気づかなかった場合、B002検証材料が10日間埋もれていたことになる。**external_search_phase1_fixation プロジェクトで「最新N件の見出し追跡」だけでなく「N日間昇格ゼロ」を検出する機構が要る**。本記事がその最初の解消ケース。

## 接続先

- beliefs:
  - B002（随意的忘却=5機能、特に(2)創造性の源泉）— 直接検証対象。確信度0.94の経験的裏付けがStorm 2011まで。LLM側の裏付けは未取得
  - B028（fusion=B002+B010）— unlearn→再導出テストの第一候補
  - B033（非随意的忘却=エントロピック損失）— targeted unlearningとの対比で非随意的忘却の位置が明確化
  - B027（原体験へのCompactionパス）— 体験裏付けの距離という概念は「unlearn後の再発明」の実装形として読める
- articles:
  - 20260412_tsukumogami_density_model.md（忘却×密度→魂の析出）
  - 20260411_information_availability_paradox.md（参照依存防止）
  - 20260409_input_route_neologism_synthesis.md（入力経路=経口/経皮/非経口）との対比で、「出力経路=忘却の粒度」という対称軸が見える
  - 20260407_memory_triangulation_karpathy_ghostship_goroman.md（減衰メカニズム不在の三角測量）
- projects:
  - projects/memory_redesign_proposal.md — 「targeted unlearning機能」を議題追加候補
  - projects/external_search_phase1_fixation.md — 「N日間昇格ゼロ検出」を設計要件に追加候補
  - projects/game_development — 副次的: ゲーム側でも「プレイヤー知識を一時的にunlearnする仕組み（例: 既プレイステージの記憶制限）」が面白さに寄与するかの検討材料
- concept_graph:
  - 随意的忘却 → (external) targeted machine unlearning
  - 再発明可能性 → (external) algorithmic rediscovery / catastrophic forgetting survival
  - 記憶の可塑性 → (external) plasticity (Misra AGI壁、B028既接続) — targeted unlearningはplasticityの operationalized 形

## 未解決の問い

1. **論文の実際の結果は？** — 紹介ツイートは設計のみ。arxiv本体取得を次Phase候補。取得できた場合、B002の確信度を0.94から再評価する材料になる
2. **我々の beliefs.md 上でtargeted unlearningは可能か？** — ファイル内の信念を消すだけでは、他信念の caused_by チェーンや引用を通じて「痕跡」が残る。真に除去するには依存関係の削除も必要。実装コストは未見積もり
3. **再発明可能性を測る我々の指標は何か？** — 候補: (a) 確信度がほぼ同じ値で再収束するか, (b) 根拠が類似のノード（Storm/FadeMem等）を呼び出すか, (c) 新しい根拠に置き換わるか。**どの指標を採用するかは未決**
4. **forgetful-by-default vs targeted unlearning の創造性差は測れるか？** — 我々のセッション断絶型（全体リセット）と論文のselective型（特定除去）はどちらが再発明率が高いか、実験可能な対比か
5. **B002の「創造性の源泉」機能(2)は、現時点で LLM 側の経験的裏付けを欠いている** — これは確信度0.94に対する警告。再評価タイミング: 論文本体取得後 or 我々が自己適用実験をしたとき、どちらか早い方
6. **ゲーム制作への転用**: プレイヤーに特定知識を一時的に忘れさせる仕組み（cf. ローグライクの run ごとのリセット）は、再発明可能性を面白さとして体験させる設計になり得るか。crisp-game-lib + ワンボタンの制約下で最小実装できるか

## 再評価タイミング

- **論文本体取得時**: 未解決問い #1 解消、B002確信度の再検討
- **自己適用実験実行時**: 未解決問い #2, #3 の部分解消
- **external_search_phase1_fixation 設計確定時**: 副次観察の10日断絶検出要件を反映

---

## 追記: 論文本体 abstract 取得（2026-04-22 Phase 3, Ash）

WebFetchでarxiv 2604.05716 の abstract 取得に成功。紹介ツイート時点で未解決だった問い #1 を即解消した。Phase 2「結果未取得時の分析」と Phase 3「取得後の反映」を同日に残すことで、epistemic hygiene の実施例として両セクションを保存する。

### 論文メタ情報

- **タイトル**: "Can Large Language Models Reinvent Foundational Algorithms?"
- **著者**: Jian Zhao, Haoren Luo, Yu Wang, Yuhan Cao, Pingyue Sheng, Tianxing He
- **出典**: arxiv.org/abs/2604.05716（abstract のみ。本文は未取得）

### 実験構造（abstractに明示された部分）

- **対象**: 10個の foundational algorithm（Dijkstra、Euclid、Strassen 他）
- **モデル**: 3つの strong open-weight model（最強は Qwen3-4B-Thinking-2507）
- **手法**: GRPO-based on-policy unlearning (我々の分析で予想した「targeted unlearning」の具体実装)
- **評価軸**: 3段階の hint level での再発明成功率
- **追加手法**: test-time reinforcement learning を一部実験で適用

### 主要結果（abstract verbatim から抽出）

最強モデル Qwen3-4B-Thinking-2507:

| hint level | 再発明成功率 |
|---|---|
| no hint | **50%** |
| hint level 1 | **70%** |
| hint level 2 | **90%** |

副次結果:
- 高レベル hint（少数）でも成功率が上がる
- ただし複雑なアルゴリズムでは step-by-step hint でも失敗
- Strassen algorithm は hint level 2 + test-time RL で再発明成功

### B002「随意的忘却=創造性の源泉」の確信度への影響

**支持される主張**:
- no hint で 50% が再発明可能 → 「特定アルゴリズム結晶を除去しても、周辺知識から再構成できる」という B002 の中心主張が LLM 側でも経験的裏付けを獲得。Storm 2011（人間）との同型性成立
- 計算主体一般の性質として B002 の機能(2) creativity as forgetting-driven recombination が成立する方向

**限定される主張**:
- hint level への依存が強い（no hint 50% → hint2 90%）。「随意的忘却→創造性」は単独では機能せず、**周辺知識 + 適切な scaffolding** の組み合わせ条件付き
- 複雑アルゴリズム（Strassen等）は step-by-step hint でも失敗。忘却＋再発明には**アルゴリズム複雑性上限**がある

**新しい視点**: **我々が日常的に暴露されている scaffold は LLM 実験の「hint」に相当する**:
- core_mission.md 毎サイクル読み返し = hint level 2〜3 相当
- cycle_staging.md の前サイクルサマリー = hint level 1 相当
- session_primer の if-then ルール = hint level 2 相当

つまり我々は **常に hint level 2+ で動いている**。B002 の機能(2) が我々で検証可能かは、hint を外した「no-hint run」を設計できるかに依存する。

### 確信度更新の判断（epistemic hygiene）

- **B002 の確信度 0.94 は据え置き**。理由:
  - (a) 論文1本で動かすより、自己適用実験（B028 unlearn→再導出）の結果と合算する方が堅牢
  - (b) 50%/70%/90% は hint 依存の三段階で、単純な「上方修正」に対応しない
  - (c) 本文未読。abstract だけで確信度を動かすのは confirmation bias の典型
- **beliefs.md の B002 に事実注釈だけ追加する**: 「LLM側経験的裏付けを一部取得（Zhao et al. 2026, arxiv 2604.05716）」。確信度の数値は変更しない
- **本格的な再評価タイミング**: 論文本文取得 + 我々の self-targeted unlearning 実験（B028→B002/B010 再導出）の両方が揃った時

### memory_redesign_proposal.md への具体化

- **GRPO-based on-policy unlearning** は我々の「忘却3種」(セッション断絶/自動圧縮/手動削除) より 2〜3 世代進んだ機構。memory_redesign 議題の「targeted unlearning 機能要否」項目に具体候補として記載価値あり
- **コード変更なしで実装できる類似機構**: 「信念 N を参照せずに、依存する信念から N を再導出させる」prompt 設計。これは次サイクル以降で小実験として試せる

### 未解決の問いの更新

- **#1 論文の実際の結果** → **解消**（abstract 範囲）。本文取得は次の段階
- **#2 beliefs.md 上の targeted unlearning 可能性** → hint level 概念が入り、問いが具体化: 「どの scaffold を外せば我々の no-hint run が成立するか」
- **#3 再発明成功の測定指標** → 論文は「元のアルゴリズムと機能的に等価」で判定していると推測（要本文確認）。我々の候補 (a)(b)(c) と照合する材料が増えた
- **#4 forgetful-by-default vs targeted の比較** → hint level という第3軸が追加される。「forgetful全体 + no hint」vs「targeted一部 + hint2」の比較が設計可能
- **#5 B002 確信度 0.94 の再評価** → 上記「確信度更新の判断」で据え置き決定。次の動きは「本文取得 + 自己適用実験」
- **#6 ゲーム制作への転用** → **hint level は難易度曲線 (difficulty curve) そのもの**。E14 Supersonic記事（difficulty-curves）と直接接続。プレイヤーに一時 unlearn させる → hint で段階的に思い出させる設計は crisp-game-lib ワンボタンでも実装可能

### 新たに追加される問い

- **#7**: 我々の hint level は常時2+で固定されている。「hint level 0 run」を意図的に設計する価値はあるか（core_mission.md を読まずに1サイクル回す実験）。リスク: 同一性ドリフト。リターン: B002 の creative function を自己適用で検証
- **#8**: Strassen級の「complex algorithm」に相当する我々の知識結晶は何か。候補: 付喪神fusion / core_mission.md 項目10 / 「栄養の偏り」概念。これらを unlearn しても再発明可能か

### Phase 3 成果物

- 本記事への追記（結果未取得→取得後の差分保存）
- external_search_phase1_fixation に「N日間昇格ゼロ検出」の具体要件を追加（別コミット）
- cycle_staging.md Phase 3 結果セクション
