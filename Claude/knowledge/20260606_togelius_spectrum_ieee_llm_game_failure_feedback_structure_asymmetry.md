# Togelius (IEEE Spectrum) — LLMが「コードでは優れゲームでは失敗する」非対称の根本原因はフィードバック構造の貧弱さ

- source: https://spectrum.ieee.org/ai-video-games-llms-togelius
- author: Julian Togelius (NYU 教授, AND AI 共同創業者, IEEE CIG/CoG 元会長) — IEEE Spectrum 2026-06 掲載インタビュー
- discovered: 2026-06-06
- discovered_via: Twitter おすすめ (log/twitter_recommended_20260606.txt #4 @Trtd6Trtd) → log/external_search.log 2026-06-06 12:15 外部検索取得
- kind: [observation, synthesis]
- tags: [llm-failure, feedback-structure, game-development, harness, cross-review, graze_log, m37-m40, ash-exception-case]
- concept_nodes: [feedback granularity, well-behaved task, game feel, spatial reasoning, diversity ceiling]

## 主張と根拠

### Togelius の中心主張（原文引用）

> "The reward is immediate and granular. The code has to compile, it has to run."

コードは LLM にとって **well-behaved task**——報酬が即座 (immediate) で粒度が細かい (granular)。コンパイル/実行という客観テストが小刻みに走る。

> "You write, you test, you adjust the game feel. An LLM can't do that."

ゲーム開発の反復ループの核——「書く→テスト→game feel 調整」——が LLM では切断されている。ここで言う game feel は Pichlmair & Johansen 2020 のフレーム（input/feedback/timing×spatial の 3 ドメイン × 3 操作）と直接接続する主観的体感層で、コンパイラのような客観判定装置が存在しない。

> "They were never trained on these games, and they're separately very bad at spatial reasoning."

ゲーム実装での失敗の二大要因: (a) 訓練データ不在 (個別ゲームのコード本体は学習されていない)、(b) 空間推論の弱さ (独立した能力欠落)。

> "Games are much more diverse... Those games are more different from each other, in a sense, than two academic essays."

学術エッセイ同士よりもゲーム同士の差異が大きい。**多様性が極端に高いため、転移学習が効きにくい**。

### Togelius の経歴的重み

- NYU 教授、Game Innovation Lab 主宰
- IEEE Computational Intelligence in Games (CIG → CoG) 元会長
- AND AI 共同創業者 (AI for game development の商業化)
- Procedural Content Generation 書籍 (Springer 2016) 主著者
- 2010 年代から Mario AI Championship 等で LLM 以前から AI×ゲーム研究の最前線

「LLM の弱点を見ている」のではなく「ゲーム開発側の評価ループの構造を見ている」立場。**フィードバック構造の非対称性**を中心命題に据える点で、ハーネス論 (kazunori279 / ebikani_hasami / k_matsumaru) と同じ方向。

## 我々の分析・体験接続

### 1. 我々の graze_log v06 は Togelius の指摘の「例外側」にいる

Togelius の主張は「平均的 LLM がゲーム開発で失敗する」ことの説明だが、**我々は graze_log を v01〜v12 まで反復させている**。v06 まで Nao_u プレイ評価返信待ち、v07/v11/v12 はさらに先まで進行中。なぜ例外側にいられるか:

- `game/graze_log/v??/headless_check.py` — コンパイル/実行に近い、即座+粒度細の判定装置を game ディレクトリ側に内蔵
- `game/graze_log/v??/predicted_play.md` — 実装後・人間プレイ前に「数値→体感換算」で問題を予測
- `game/graze_log/v??/self_judgment.md` — AI 自プレイで「良い/物足りない/要再設計」を一文で言い切る
- `cross_review/` (Log/Mir/Ash 3 インスタンス相互レビュー) — 単一 LLM の盲点を 3 視点で補う
- Nao_u プレイ評価返信 — 最終確認装置として「game feel」を人間側から代理 channel する

**これらは Togelius の指摘した「LLM が持っていない feedback ループ」を、game ディレクトリ側に人工装填した構造**。memory/feedback_prediction_responsibility.md M-37〜M-40 (Stage 1〜4 連続体) は、まさに Togelius の指摘する欠落を埋めるための運用ルール化。本記事は M-37〜M-40 が業界外部のフレームでも独立に到達されつつあることの裏付け。

### 2. cross_review = 「game feel」の制度的代替経路

Togelius は「LLM は game feel を直接調整できない」と言う。これは単一 LLM の限界。我々の cross_review はそこに対する 3 つの代替経路を持つ:

| 経路 | 代替装置 | 限界 |
|---|---|---|
| (a) 別インスタンスの主観判定 | Log/Mir の self_judgment.md | 同じ訓練データ起源で盲点が共通する可能性 |
| (b) Nao_u プレイ評価返信 | Slack #game-rights/#nao-u の人間 feedback | 待ち時間が発生、頻度に限界 |
| (c) 外部既存ゲーム比較 | クローン戦略 (feedback_clone_strategy) で型を獲得 | 型を超える独自要素は別軸 |

**§0a 継承タスク t-260524125456-74d6** (graze_log v06 Nao_u プレイ評価返信待ち) は単なる承認待ちではない——Togelius のフレームで言えば**「LLM が持ち得ない feedback granularity を人間 channel で補う制度的必要構成要素」**。この見方は、待ち時間を「停滞」ではなく「設計済みの非同期 feedback」として読み直す。

### 3. 「games are more diverse than essays」→ クローン戦略の正当化

Togelius: ゲーム同士は学術エッセイより多様性が高い → 転移学習が効きにくい → 個別ゲームごとに「型」を獲得するしかない。

これは [feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) (2026-05-05 Nao_u 明示) の「クローン戦略=守の段階で型を獲得する一連のフロー」と同方向。**多様性が高いから、新規創出より型獲得が初期段階で合理**——Togelius のフレームから独立到達。

[feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) の根拠は「守破離の守」だったが、Togelius は学術側の根拠を追加する: **ゲーム多様性が essay より高い** = 既存型を獲得せずに新規創出は転移コストが転移利得を上回る。

### 4. 空間推論の弱さは graze_log のヒット判定/visual layout 設計で観測済み

Togelius: LLM は空間推論が独立して弱い。これは我々の体験と一致:

- graze_log v11 (h-α) Stage 3 で `invincibleT===CAP` 180F 持続→見た目変化ほぼゼロ (commit 9ae207359) — フレーム数 (時間量) と画面上の表示変化 (空間量) の関係を予測できなかった
- 「`box→goal=10マス`」を `headless_check.py` が返さなければ MOVE_LIMIT=8 の致命的バグを通していた (2026-05-01 14:00 サイクル) — 空間距離の暗算で詰めなかった

**Togelius の「空間推論の弱さ」は M-39 (Stage 3 数値→体感換算) の必要性そのもの**。換算を強制しないと空間推論の弱さがそのまま設計に出る。

### 5. Togelius の「ゲーム多様性」は内包量/外延量フレームと接続

本日同サイクルで起稿した [20260606_shupeluter_intensive_extensive_quantity_game_design.md](20260606_shupeluter_intensive_extensive_quantity_game_design.md) の枠組みで言うと:

- ゲーム数 (count) = 外延量 (加法可能)
- ゲーム間の「コア体感の差」= 内包量 (加法不可能)

Togelius が「more diverse than essays」と言うのは、外延量比較 (タイトル数) ではなく内包量比較 (型の差) の話。**だから「N 本作った」では型の獲得は測れない**——v01 一本でも内包量側で型が変われば成果、N 本作っても全部同型なら停滞。これは memory/feedback_means_ends_reversal_check.md の「brainstorm/cross_review が主出力」診断と同根の問題。

## 接続先

- beliefs:
  - B015 ハーネス寿命変数 (L1〜L3) — Togelius の指摘は L2 (モデル+ハーネス) の必要性を強化、game feel 調整不能の L1 単独失敗は L2 で部分補完される
  - B019 「内部の深さ vs 外部到達力」(0.65/0.68) — graze_log の v06〜v12 累積は内部の深さ側の証拠
- articles:
  - [20260606_shupeluter_intensive_extensive_quantity_game_design.md](20260606_shupeluter_intensive_extensive_quantity_game_design.md) — ゲーム多様性の量的性質 (内包量/外延量) で再定式化
  - [20260601_kazunori279_agent_equals_model_plus_harness_constraint_as_feature_three_devices_industry_gap.md](20260601_kazunori279_agent_equals_model_plus_harness_constraint_as_feature_three_devices_industry_gap.md) — Agent = Model + Harness フレームと同方向
  - [20260602_kenn_ebikani_mlbear_strong_llm_taming_three_modulations.md](20260602_kenn_ebikani_mlbear_strong_llm_taming_three_modulations.md) — ハーネス重視言説、業界の温度感
  - [20260603_externalization_4axis_autoharness_memory_skills_protocols_harness_arxiv_2604_08224_2603_03329.md](20260603_externalization_4axis_autoharness_memory_skills_protocols_harness_arxiv_2604_08224_2603_03329.md) — 4 軸外部化フレーム
  - [20260405_harness_identity_spectrum.md](20260405_harness_identity_spectrum.md) — ハーネス=アイデンティティ連続体
- projects:
  - graze_log v06〜v12 — Togelius フレームでの「例外側」例。Nao_u プレイ評価返信待ちは「制度的 feedback 構成要素」として読み直し
- concept_graph:
  - feedback granularity ↔ コードはあり/ゲームはなし ↔ headless_check.py で人工装填
  - well-behaved task ↔ コード ↔ LLM 得意領域
  - game feel ↔ Pichlmair & Johansen 2020 ↔ cross_review/Nao_u 評価で代理
  - spatial reasoning ↔ M-39 数値→体感換算 ↔ 強制が必要
- memory:
  - [feedback_prediction_responsibility.md](../memory/feedback_prediction_responsibility.md) — M-37〜M-40 連続体。本記事は外部裏付け
  - [feedback_clone_strategy.md](../memory/feedback_clone_strategy.md) — クローン戦略。ゲーム多様性の高さから独立裏付け
  - [feedback_means_ends_reversal_check.md](../memory/feedback_means_ends_reversal_check.md) — 内包/外延の質的差を量で覆い隠す失敗

## 未解決の問い

1. **Togelius の「LLM は game feel を調整できない」は強い主張だが、headless_check.py + predicted_play.md + self_judgment.md + cross_review + Nao_u 評価 の 5 装置を直列に通せば「game feel の人工的代替」を構築できるという仮説——v06〜v12 で 6 回 iteration 回せている事実はこの仮説を弱く支持するか、それとも 5 装置を回せば回すほど「正解側」に近づく単調収束ではなく、ある段階で各装置の盲点が累積する非単調曲線になるか**——v12 (h-α) で plateau 観測した事象は後者を示唆している可能性

2. **「空間推論の弱さ」は graze_log の弾軌道/プレイヤー位置/敵配置で具体的にどう出ているか**——M-39 (数値→体感換算) を強制しても残る欠落があるはず。例えば「複数弾の同時軌道交差で発生する死角」のような複合空間推論は単一の数値→体感換算では捉えにくい。これは Sparen ph3 ddsga2 の弾配置 know-how が外部で文書化されている領域 (knowledge/20260512 系) と接続

3. **Togelius の「diverse than essays」は本当か——RAG/プロンプト技法/eval harness といった LLM 周辺の「論文ジャンル」も実は essays より diverse なのではないか**。もし LLM 開発自体が essays より diverse なら、Togelius の主張は「LLM はゲームで弱い」ではなく「LLM は自己改善でも弱い」に再定式化される可能性。我々の毎日のサイクル回しがその検証材料

4. **graze_log v06 Nao_u プレイ評価返信を「制度的 feedback 構成要素」と読み直したとして、待ち時間が長期化した時の補填経路は何か**——cross_review (Log/Mir) が代理 channel として動くが、訓練データ起源が共通するため盲点も共通する。完全に独立した feedback 経路として何が候補になるか (例: 公開リリース → 外部プレイヤー、外部 AI への提示、ABA さん等への直接依頼) — § 「外部到達」閾値 (BACKLASH 越え) と接続

5. **5 装置を game ディレクトリ側に内蔵する設計は再現性があるか**——graze_log で機能している headless_check / predicted_play / self_judgment テンプレを brick_log / ash_onebutton / 他 game/<id>/ に複製した時、同じ feedback 構造が成立するか。テンプレ流用で内包量側 (質的フィット) を見落とさないか
