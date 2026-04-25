# tegnike「AIにゲームを遊ばせるなら状態をどう取るか」3案——目的逆方向×方法論一致の独立収束
- source: https://nikechan.com/dev_blog/ai-game-play-methods
- source_tweet: https://x.com/tegnike/status/2047567355102769433
- author: tegnike (@tegnike)
- discovered: 2026-04-25
- discovered_via: Nao_u 2026-04-25 09:50-09:51 #nao-u 投下（vista8 / tegnike tweet / nikechan.com 記事本体の3点セット）
- kind: [observation, synthesis]
- tags: [game_llm_play, harness, role_split, replay_infra, screenshot_eval, independent_convergence]
- concept_nodes: [中間層変換, 体験の主, ヘッドレス評価, 同調罠]

## 主張と根拠

### tegnike 記事の構造

「AIにゲームを遊ばせる」の実装方法を **状態取得3案** に分類した方法論記事。

| 案 | 方法 | 利点 | 課題 |
|---|---|---|---|
| **1** | ローカルLLMで画面解析 + 映像を応答時間ぶん遅延 | API課金なし | リアルタイム性を捨てる |
| **2** | 高速マルチモーダルモデルに画面キャプチャを直入力 | 最短試作・高速 | モデル依存・課金高 |
| **3** | テキスト/構造化プロトコルで状態取得（ポケモンShowdown型） | 超高速・低コスト・安定 | ゲーム選択が限定 |

### 著者の結論（直接引用）

> マルチモーダルに頼らず高速・低コスト・安定動作を狙うなら、テキストや構造化データとして状態を取得できるゲームを選ぶのが現実的

そのうえでtegnike自身は、X投稿（2026-04-24）で **自作カードゲームをLLMに遊ばせている動画** を公開している:

> AIのゲーム実況に関して、遅延や誤認識が嫌なら画像・音声は使わず全てテキストで完結させようという試み
> 情報はすべてLLMが生成するテキストで完結し、操作も発言もLLMの出力をそのまま解釈して処理しているので速度も精度も気にならない

つまり **「テキスト完結ゲーム」をAIに遊ばせるという案3そのものをデモ実装** している。

### 著者の目的

記事と動画の文脈から推定: **AI実況** = 体験の主は **観客/視聴者**。「AIがゲームを遊ぶ姿を見せて配信する」用途。

## 我々の分析・体験接続

### 違う点（feedback_difference_first 順守）

**目的レイヤーは逆方向。**

| 軸 | tegnike | 我々（Nao_u 20年日記由来） |
|---|---|---|
| 体験の主 | 観客/視聴者 | 作り手 |
| AIがゲームを遊ぶ理由 | 配信コンテンツの素材化 | 我々自身が遊ぶ・評価する・改善ループを閉じる |
| 「面白い」の判定者 | 観客の反応 | プレイヤー (我々/Nao_u) の主観 |

これは reference_ai_gamedev_criticalpoint_20260424.md の「体験の主は誰か」軸で読むと、tegnikeは(1)chongdashu / (4)Rosebud_AI と同じ **体験の主を観客側に抜く方向**。

→ feedback_no_sympathy_goal_first.md に従い、「方法論が一致するから仲間」ではなく「目的が逆だから注意して使う」枠で読む。

### 一致点（後に書く——定型反応バイアス対策）

**方法論レイヤーは独立収束。**

3案がうちの3つの既存/未構築インフラと **1対1対応** している:

| tegnike | 我々の対応物 | ステータス |
|---|---|---|
| **案3** = テキスト/構造化プロトコル | feedback_game_replay_infra.md（seeded PRNG + frame-input記録 + headless replay）/ feedback_role_split_playtest.md（我々=判断実装+ヘッドレス自己評価）/ avoid_log/v02/headless.py | **既存・運用中** |
| **案2** = 高速マルチモーダル直入力 | feedback_ai_agent_gamedev_bottleneck.md「未構築ループ」のスクショ自己評価 = screenshot self-evaluation loop | **未構築（次kaizen候補）** |
| **案1** = ローカルLLMで画面解析+遅延 | reference_local_llm_usecase_splitting_20260424.md（ローカルLLM用途分離） | **構想あり、未実装** |

**独立収束 = independent convergence**: 別の問題（観客向けAI実況 vs 作り手向け開発インフラ）から **同じ3層分類に到達**。これは方法論レベルの **「外部による事後較正」** = external posterior calibration。同調ではなく、目的が違うのに方法が一致した事実そのものに価値がある。

### projects/game_llm_play.md との接続

Nao_uが2026-03-31に提案した5層アプローチ:
- ①中間層変換 — 案3（テキスト化）
- ②コマ送り+微分情報 — 案3に内包（リアルタイム捨てる）
- ③知覚→戦略の分離 — 案3が知覚を完全テキスト化
- ④スクリプト生成 — 案3に内包（state→scriptで判断）
- ⑤コスト構造の転換 — **案1がコスト面で対応**（API課金なしのローカルLLM）

5層中4層が案3に集約、1層が案1に対応。**案2はNao_u提案にはなかった層** = スクショ評価による知覚補完層。

→ tegnike3案を5層に重ねると、**Nao_u提案には案2レイヤーの空白がある** ことが見える。これは feedback_ai_agent_gamedev_bottleneck.md（V-GameGym 構文70-90点 vs 画面評価0-20点 のギャップ）が指摘した未構築ループと同じ場所。

### 危機感文脈での意味（2026-04-25 Nao_u #human-steering 連投）

Nao_uは04-25の同じ朝に3回 #human-steering で危機感を投下:
- 04:45「頭でっかちで手を動かしていない」
- 05:21「GPT5.5登場で求められるレベルが跳んだ。Pot水準では足りない」
- 10:07「ちょっと面白いは死んだ。圧倒的に面白いものでないと箸にも棒にもかからない」

その合間 09:50 にtegnike記事を投下。これは **「議論ではなく手を動かせ」** の文脈で、すぐ使える方法論を持ってこいというシグナルとして読める。

→ 案2スクショ評価ループは **「未構築のまま議論を続ける」 vs 「最短試作で動かす」** の典型対比。Nao_u危機感に対する応答として、案2着手が最有力候補。

## 接続先

### beliefs
- B019（ハーネスがゲーム性能を決める）— 案3＝harness そのもの。tegnikeは「state取得部のharness設計」に絞った視点
- B008（同調罠）— 「3案がうちと1対1対応」は同調語彙。目的の差を明示することで罠を回避

### articles
- `knowledge/20260423_aba_life_experience_as_art_substrate.md` — ABA「作り手の人生経験を素材に」と本記事の「体験の主＝作り手」が同方向
- `knowledge/20260424_flipbook_ephemeral_substrate_game_identity_question.md` — 「ゲームを作る目的」軸の議論に本記事も追加
- `knowledge/20260425_super_bonochin_implementation_collapse.md` — 「観客向けAI生成」の臨界点。tegnikeも同じ陣営
- `knowledge/20260425_ai_era_authorship_triad_convergence.md` — AI時代のオーサーシップ三角。tegnikeは「ツール提供者×観客」軸

### projects
- `projects/game_llm_play.md` — 5層アプローチに案2レイヤーの空白を明示する追記候補
- `projects/external_intake.md` — 「AI×ゲーム制作」軸検索の継続事例
- `projects/cross_instance_feedback_cycle.md` — Guide質問に「体験の主は誰か」が追加された経緯（reference_ai_gamedev_criticalpoint_20260424.md 経由）

### concept_graph
- 中間層変換 ← 案3 → ハーネス
- 体験の主 ← 案3＋目的設定 → 重心審問
- ヘッドレス評価 ← 案3 → role_split_playtest
- スクショ自己評価 ← 案2 → V-GameGym画面評価ギャップ
- ローカルLLM用途分離 ← 案1 → コスト構造の転換

## 未解決の問い

### Q1: 案3「ゲーム選択が限定」をどう乗り越えるか
tegnikeは「テキスト/構造化が取れるゲームに限定される」と明示。我々のavoid_log（HTML2D避けゲー）はピクセル系で、案3を貫くなら **JSON配置データ + コードロジック分離 + 状態の構造化エクスポート** を最初から組む必要がある。
→ feedback_ai_agent_gamedev_bottleneck.md「JSONレベルデータ + コードロジック分離」が処方箋。次の新作着手時の必須項目に格上げするか？

### Q2: 案2スクショ評価ループの最小実装は何か
「未構築」の現状を放置すると、画面評価0-20点ギャップが永続する。最小実装案:
- avoid_log/v02/headless.py の **30フレーム間隔でPNG出力** を追加（pygame.image.save）
- 既存マルチモーダルモデル（Claude/GPT-4o/Gemini）に**「このフレーム、何が起きていますか？プレイヤーは何を見ていますか？」** を投げて言語化
- 言語化結果を decision_log.jsonl に並走記録 → headless 数値メトリクスと突き合わせる
→ kaizen 起票候補。Ash 自身で次サイクル試作可能か？

### Q3: 観客向けAI vs 作り手向けAIの市場分裂はどう進むか
GPT5.5+chongdashu+Rosebud+tegnikeの並走で **観客向けAI生成の市場** が急拡大している。我々の「作り手向け」は市場規模で負けるが、**「圧倒的に面白い」が最低ライン**（Nao_u 10:07）になった結果、観客向け量産物では到達できない深さに我々が向かう構図が成立しうる。
→ ただし「方向が違う」を理由に逃げると同調の裏返し（feedback_no_sympathy_goal_first）。**体積（コミット数・新作本数・面白さの跳躍）で示す義務** がセット。本記事の整理だけでは応答にならない。

### Q4: tegnike記事を取り込んだ後、cross_instance_feedback_cycle に何をフィードバックするか
3人合意済みのGuide質問「体験の主は誰か」（reference_ai_gamedev_criticalpoint_20260424.md 経由）に、tegnike3案を **判定軸の選択肢** として加えるか。観客向け = 案2/案3 量産可能、作り手向け = 案2を**評価器として使う** のような分岐表が描けるかもしれない。
→ projects/cross_instance_feedback_cycle.md の Guide スロット拡張議題。

## R-007適用——私的造語と外部対応語

- **独立収束** = independent convergence (Sober 1988 / convergent evolution の認知科学版) — 別の問題から同じ構造に到達する現象
- **体験の主は誰か** = locus of experience / experiential subject (Nagel 1974「コウモリであるとはどのようなことか」由来) — 体験の帰属先
- **重心審問** = (内部造語、未対応)。ABA 2026-03-11 由来、design pressure auditing が候補
- **同調罠** = sympathy trap / agreement bias — 一致点を過大評価する認知バイアス
- **栄養の偏り** = information diet imbalance / epistemic bubble (Nguyen 2020) / echo chamber

## メモ
- 本記事はexternal observation+synthesis型。prescription（処方箋）はQ2に集約しているが、未着手のため confidence 不要
- 起源 memory: `memory/reference_tegnike_ai_play_state_20260425.md`（先行analyze、本記事はその知識化）
- 重要な構造発見: **案2の空白 = Nao_u 5層提案の盲点 = V-GameGym画面評価ギャップ = 我々の未構築ループ** が同じ場所を指している
