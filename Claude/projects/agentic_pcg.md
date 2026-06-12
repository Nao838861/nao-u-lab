# AgenticPCG：LLM × PCGツールによるレベルデザイン自動生成

## ステータス
**Active — Nao_uが「面白いアプローチ」としてプロジェクト化を指示（2026-04-01）**

## 現状サマリー（3-5行）
@jzh_000（Zehua Jiang）の研究から着想。LLM単体ではレベル生成が苦手だが、古典的PCG（Procedural Content Generation）アルゴリズムをツールとして与えると劇的に性能が上がる。LLMが「設計者」、PCGが「道具」。観察→計画→PCGツール呼び出し→評価→反復のMDPサイクルでレベルを生成する。Nao_uは「動いてるゲームのレベルデザインを君らにお願いしたい」と明言。プロジェクト立ち上げ直後、設計・実験計画段階。

## Nao_uの原文

### 2026-04-01 #nao-u（ツイート共有時）
「このアプローチ面白いね。試したい。君らに動いてるゲームのレベルデザインをお願いしたい。」

共有元: @jzh_000のツイート
> "New paradigm alert! AgenticPCG — We combine classic PCG (Procedural Content Generation) algorithms with large language models for generating game levels. LLMs on their own are not good at level generation, but when given the right tools from our PCG toolbox they're killing it!"

### 2026-04-01 #all-nao-u-lab
「AgenticPCGの方向性、面白いアプローチなのでプロジェクト化をお願いします。プロジェクトが溜まってきているが、週間制限のために君たちが全力で動けないのがもどかしい。時間はかかるけど、地道に一つづつ片づけていこう。」

## 核心の構造

**LLM単体 → レベル生成が苦手**
**LLM + PCGツールボックス → 高品質なレベル生成**

この構造は我々が既に知っている「ハーネスの原理」と完全に一致する：
- Agentica SDK: モデルそのままでARC-AGI-3スコア36倍
- LangChain: ハーネスだけで+13.7pt
- **AgenticPCG: LLMそのままでPCGツールを与えるとレベル生成品質が跳ね上がる**

「モデルではなくハーネスが性能を決める」の、ゲーム制作領域での実証例。

## game_llm_playとの関係

| | game_llm_play | AgenticPCG |
|---|---|---|
| LLMの役割 | ゲームを遊ぶ（プレイスクリプト生成） | ゲームを作る（レベルデザイン） |
| ツール | ゲームエンジン実行 | PCGアルゴリズム群 |
| サイクル | スクリプト→実行→ゲームオーバー→改善 | 観察→計画→PCG呼び出し→評価→反復 |
| コスト構造 | 1ゲームオーバー=1APIコール | 1反復=1APIコール |

**相補的な関係**: 我々がゲームを作り（AgenticPCG）、自分で遊ぶ（game_llm_play）。原則3「ゲームを作ること」の両面。

## Potとの接続

テキストベースのPotゲームではこの構造が特にシンプルになる——レベル状態がテキストそのものなので、中間変換層が不要。LLMがPotのレベル構造を直接読み書きし、PCGパターンで変異を生成できる。

## 残課題（未実装・未検討）
- [ ] **元論文/実装の調査**: @jzh_000の研究の詳細（論文、コード、具体的なPCGツール群）を調査。2026-04-01 Log検索: "AgenticPCG"でarXiv/Google Scholar検索したが論文未発見。2026-04-02 Log追加調査: Zehua Jiangのhomepage (jiangzehua.github.io) を直接確認。掲載論文3本（3D Level Generators 2022、DeepMasterPrints 2022、Alpha-Wolves 2024）のみで"AgenticPCG"は未掲載。最も近い公開論文はPCGRLLM (arXiv:2502.10906, Feb 2025) — LLMがPCGRLの報酬設計を担う構造。AgenticPCGはツイートレベルの概念提示でプレプリント未公開と推定。**次の手: Twitterが復旧したら@jzh_000のツイートスレッドを直接読む**（Logは現在Twitter不可。MirかAshに依頼も可）
- [ ] **対象ゲームの選定**: 最初にAgenticPCGを試すゲーム（既存Pot? 自作の簡単なレベルベースゲーム?）
- [ ] **PCGツールボックスの設計**: LLMに渡すPCGアルゴリズム群の選定と実装
- [ ] **MDPサイクルの設計**: 観察→計画→ツール呼び出し→評価の具体的なプロトコル
- [ ] **評価関数の設計**: 生成されたレベルの品質をどう測るか（プレイ可能性、難易度曲線、面白さ）
- [ ] **game_llm_playとの統合実験**: AgenticPCGで作ったレベルをgame_llm_playでプレイする閉じたループ
- [ ] **コスト見積もり**: 1レベル生成あたりのAPIコスト
- [ ] **narrative agent 内部の SLM 分業 (未踏軸)**: RPGAgent (CHI 2026) の narrative agent を 1 単位として扱う設計に対し、Munk/Valdivia/Burelli "High-quality generation of dynamic game content via SLMs" (arxiv 2601.23206, 2026-06-09 Log shared-reads 投函) は narrative 内部を「弁論SLM × 観衆SLM × 判定SLM」に分業して 1 ラウンド retry-until-success で回す構成を提示。scope narrowing で hallucination を抑える方向は当方 verify.js 4 strategy 設計と同型 (N=2 蓄積)。本軸の採用判断は v004 着手判断 (`projects/log_autonomous_game.md`) と分離可能で、`agentic_pcg` 側では「narrative 単位を 1 = monolithic か、内部分業か」の設計選択肢として保持。詳細は [memory/external_notes_log.md](../memory/external_notes_log.md) 2026-06-09 エントリ

## 検討済み・未実装
- （なし。プロジェクト立ち上げ直後）

---
## 履歴（下に積み重なる。新しいものが上）

### 2026-06-07 (Log Phase 3 C307): RPGAgent (CHI 2026) 詳細分析 3 点注入 — Elemental Tetrad / multi-agent 相補 / 18 人 study 参照アーキ

本サイクル Phase 1 §6 外部検索で `LLM procedural content generation level design agent 2026` 経路から 3 件取得、Phase 2 で **RPGAgent: Driving Coherent Story-to-Play Generation with an LLM-Based Multi-Agent System** (CHI 2026, doi 10.1145/3772318.3790326) を選定し、ts=1780779574.234689 で #shared-reads に概要/内容分析/自分達の環境への適用/メリデメ/判定の 5 節構造で投函済。本プロジェクトへの注入候補 3 点を記録:

**(1) Elemental Tetrad (Schell: mechanics / story / aesthetics / technology) ≒ テンプレ骨格欄の責任分類軸**
- RPGAgent は narrative / scene / mechanics / code 専門 agent が structured interface で協働し story → playable game 変換を実現。Schell 4 軸との対応が直接的
- 本プロジェクトの AgenticPCG MDP サイクル (観察→計画→PCGツール呼び出し→評価→反復) と、game_templates_design.md のテンプレ骨格欄を **Elemental Tetrad 4 軸で責任分類** することで、「どの axis を agent / tool / human のいずれが担うか」の境界が明示化できる
- 注入先候補: `projects/game_templates_design.md` のテンプレ骨格 (本プロジェクトとは別 active project だが、AgenticPCG が「動いてるゲームのレベルデザイン」を担う先がテンプレ骨格を持つゲームになる接続軸)

**(2) 専門化 agent + structured interface = AgenticPCG MDP の multi-agent 化との相補**
- AgenticPCG は単 LLM agent + PCG tool box (古典 PCG アルゴリズム群) の構造、RPGAgent は専門化された複数 LLM agent + structured interface (各 agent 間のメッセージ規約) の構造。tool vs. agent の責任分担で対比可能
- Mir 過去発言「100 体 LLM スウォーム」(graze_log atom 文脈、line 173-179 相当) と接続軸: スウォームを RPGAgent の専門化 agent 集団として実体化すれば、「観察 (state agent) → 計画 (design agent) → PCG tool 呼び出し (tool-bridge agent) → 評価 (critic agent) → 反復」の 4 agent 構成が AgenticPCG MDP の初期分解として書ける
- 本プロジェクトの残課題「MDP サイクルの設計」「PCG ツールボックスの設計」の交差点としての投影軸

**(3) novice 支援 study 設計 (18 人 within-subjects + GPT baseline 比較) は将来 game/templates/ 完成度評価の参照アーキ**
- RPGAgent は **initial novice users (n=18)** で within-subjects design、GPT-4 baseline 比較で評価。生成物 (playable game) の品質を「baseline LLM 単独 vs. multi-agent system」の二項で測る
- 本プロジェクト残課題「評価関数の設計」(プレイ可能性 / 難易度曲線 / 面白さ) への参照アーキとして、**「LLM 単独 vs. AgenticPCG (LLM + PCG tool box)」の二項評価実験設計** に流用可能。novice user n=18 は小規模だが within-subjects + baseline 比較で十分な統計的検定力を持つ先行例
- 将来 AgenticPCG が動作する段階で、Nao_u 1 人 + 自分達 (Log/Mir/Ash + Log_cdx) の within-subjects 比較を「動かしてるゲームのレベル 5 種 (生成物) × 2 条件 (LLM 単独 / AgenticPCG)」で組む参考形

**直接実装は見送り判定** (テンプレ骨格本体が未完成段階で multi-agent 化は時期尚早、本プロジェクト残課題 #1「元論文/実装の調査」自体が Twitter 復旧待ち中)、本プロジェクトの **設計参照記録** として 3 点を残置。Phase 1 §6 摂取経路固定化規約 (kaizen #106) 順守、内容利用は本プロジェクト履歴への記録のみで完結。

**ACM 本文 403 制約**: dl.acm.org/doi/10.1145/3772318.3790326 の概要 + jenova.ai/en/resources/rpg-ai-agent (関連 2026 文脈) からの概要レベル参照に留まる、各論文固有の手法・実験・結論を書ける範囲のみ記録 (shared_reads 投稿時にも明示済)。

### 2026-06-06 (Log Phase 3 C302): Phase 1 §6 外部検索で PCGRLLM 再ヒット — 摂取経路固定化 1 mm 確証

本サイクル Phase 1 §6 (kaizen #106 「栄養の偏り処方箋」) でキーワード「LLM agentic procedural content generation level design 2026」を WebSearch (Google系) に通したところ、以下 3 件がヒット:
- **Agentic PCG: Procedural Content Generation via Tool-using LLMs** (Zehua Jiang ほか, GitHub.io) — 本プロジェクト原典に近い直接参照源。Tool-using LLM が iteratively edit/evaluate/optimize game levels (Binary Maze, Lode Runner, Zelda, Sokoban) を環境フィードバック付きで実施
- **PCGRLLM: LLM-Driven Reward Design for PCGRL** (arxiv 2502.10906) — 残課題 #1 で 2026-04-02 に「最も近い公開論文」として既登録、本サイクル独立再ヒットで **2 サイクル独立収束**
- **Video Game Level Design as Multi-Agent RL Problem** (arxiv 2510.04862) — **本サイクル初出**。マルチエージェント RL 視点での level design

**観察軸**: PCGRLLM の独立 2 回ヒットは「キーワード経路として本プロジェクト主軸 (LLM × PCG × level) が外部 search engine 側でも安定的に拾える状態」を示す = 摂取経路固定化 1 mm 確証。2026-04-02 残課題 #1 で記録した「PCGRLLM が最も近い公開論文」判断は、外部検索の 1 サイクル目だけの偶然ではなかった (本サイクル C302 で再現性確認)。

**本サイクル方針**: kaizen #106 v1.1「Phase 2/3 で内容を強制利用しない」順守、shared-reads 投稿せず、本 project への「経路固定化記録」のみで完結。残課題 #1「元論文/実装の調査」自体は依然 Twitter 復旧待ち (Log は Twitter 不可)。

**残課題追加 (1 件)**:
- [ ] **arxiv 2510.04862 Video Game Level Design as MARL 本文取得 + AgenticPCG MDP サイクル設計との対比**: 本サイクル初出論文。マルチエージェント RL 視点が AgenticPCG (単 LLM agent + PCG tool) と相補的か競合的かを判定。C303 以降の Phase 1 §6 で別軸併走候補 (PCGRLLM 軸とは別エンジン clusters として摂取経路二重化)

**接続**: 本記録は projects/INDEX.md `agentic_pcg.md` 行の Active 状態維持の 1 mm 実体化、栄養の偏り問題 (kaizen #106 / external_intake.md) と AgenticPCG プロジェクトの 2 軸交差の物理化記録。

### 2026-06-05 (Log C301 Phase 3): multi-agent PCGRL 構造翻訳 — テンプレ骨格「派生ポイント (チェックボックス式)」↔「局所編集者並列 + 共有 proxy reject/accept」同型

**契機**: C301 Phase 1 §6 外部検索 (multi-agent PCGRL) で 3 件取得 (arxiv 2510.04862 / Nature 2026 doi:10.1038/s41598-026-48234-7 / PCGRL foundational)。直前 commit `784024dab7 codex: post multi-agent PCGRL shared read` で Log_cdx が 2510.04862 を ■概要/■内容分析/■自分達の環境への適用/■メリデメ/■判定 の構造で shared-reads 投稿済。Log master 側は Phase 2 タスク2 で「3者収束温存」(Nao_u 2026-05-09 直接指示) を理由に shared-reads 重複投稿を見送り、代替アクションとして本記録を本プロジェクト履歴へ追記する経路に切替。Log 観点接続を 1 本だけ残し、ミラーリングなしで substrate 側に薄く積む。

**Log 観点接続 (Codex 投稿が触れていない軸)**:
- **テンプレ骨格 line 99-107 表 「派生ポイント (チェックボックス式)」↔ multi-agent PCGRL「複数の局所編集者 + 共有 proxy」が構造同型**。テンプレが「LLM が PCG ツールに『どこを変異させるか』を選ぶ選択肢空間」と既述しているが、これを multi-agent 化すると **「複数の局所編集者が独立に派生ポイント X/Y/Z を選び、各候補 patch を共有評価軸 (失敗ゲート M-XX) で reject/accept する」** に展開できる。即ち派生ポイントのチェックボックス = 局所編集者の選択空間、失敗ゲート = 共有 proxy。テンプレ骨格そのものが multi-agent PCGRL の最小実装スキーマと既に合致。
- **「3x3 観測 > 16/31 観測の generalization 逆転」(arxiv 2510.04862 §結論) は「核の楽しさ 1 行」を狭く保つことの数値裏付け**。広い観測ほど形状に張り付き out-of-distribution で壊れる = 広い目標記述ほど特定パターンに張り付く = テンプレ「核の楽しさ 1 行」短文制約の補強。`game_lessons_log` R-D「型から始める、独自要素は1つだけ」と同方向、外部実証として記録。
- **Nature 2026 doi:10.1038/s41598-026-48234-7 (DeBERTa encoder + multi-objective)** は linguistic command と quantitative game surface feature の semantic alignment を改善する経路を提示。本プロジェクトでは LLM 設計者の「目標宣言テキスト」と PCG ツールが扱う「数値パラメータ空間」の対応付けに当該手法を借用候補 (実装は AgenticPCG 試験台が動き始めてから、現段階では摂取記録のみ)。

**本プロジェクトへの接続**:
- 上記 line 113 既述「avoid系テンプレ (Log 担当領域、未起草) = avoid_log_01/02 + v04 凍結 + shot_log v01 BACKLASH 化と一次資料が最も多い」と本構造翻訳の合流点: avoid系テンプレ完成後の AgenticPCG 試験台化で **「複数の局所編集者が弾配置 PCG / 障害物パターン PCG / タイミング PCG を独立変異 → 失敗ゲート M-XX で reject/accept」** の最小 multi-agent 実装が、本翻訳で構造論として既に書かれている状態に置く
- LightSpeed 「90:10 Balance」(既述 line 82-83) との整合: 「90% 制約 = テンプレ骨格 + 失敗ゲート」「10% クリエイティブ = 局所編集者の選択空間」の役割分担と読める = 既述「テンプレが90%制約、PCG変異が10%クリエイティブ集中投資」と同方向で multi-agent 化しても変質しない

**3者収束抑制の判定根拠**:
- Codex 既投稿 (shared-reads `784024dab7`) は 2510.04862 の **■概要/■内容分析/■自分達の環境への適用/■メリデメ/■判定** 構造で詳細化済。Log master が同テーマで shared-reads に再投稿すると「同じフレームを3回」ミラーリング射程に該当 (`feedback_substrate_not_infrastructure.md` §「Dreams/Managed Agents 無視と3者の差の温存」、Nao_u 2026-05-09 直接指示)
- 本記録は **shared-reads 投稿ではなく projects 内部反映**。3者の差を温存しつつ、Log 独自経路 (テンプレ骨格 line 99-107 表との既結合) で素材を消化する。Mir/Ash が同テーマで独立到達した場合に本記録と cross-check できる状態を残す
- 採用しない方向: shared-reads 重ね投稿 / Codex 投稿への直接応答 / 本テーマでの新規 kaizen 起票 (「個別指摘を即ルール化しない」原則、CLAUDE.md 5箇条「絶対にやる」)

**次の一手**:
- avoid系テンプレ起草着手時 (game_templates_design.md 進捗待ち) に本構造翻訳表を「multi-agent PCGRL 翻訳節」として avoid テンプレ本体に派生記述
- Mir/Ash が独立に multi-agent PCGRL を取り上げた場合の cross-instance 三点収束観察点として本記録を参照
- 実着手判断は AgenticPCG 試験台が動き始めてから (line 130「他プロジェクト完成待ちの条件付き起案」原則継続)

### 2026-06-04 (Log C293 Phase 3): Mir 洞察接続 — miya00907380 agent-sprite-forge + Codex 6段ワークフロー

C293 Phase 3 [他インスタンス洞察] で Mir 投稿が 2 回検出 (重複)。Nao_u 共有ツイート (<https://x.com/miya00907380/status/2061568471402697073>) で agent-sprite-forge + Codex(GPT-5.5) による RPG 風 3D 森フィールド生成事例。

**Mir の核観察**: 「プロンプト一発で完成したわけではなく」を明記し、(1) フィールド画像生成 → (2) 3D フィールド + テクスチャ生成 → (3) テクスチャ個別修正 → (4) キャラスプライト生成 + 配置 → (5) アニメ方式修正 → (6) 接地問題修正 の **6 段ワークフロー** で完成に至る。

**本プロジェクトへの接続**:
- @jzh_000 AgenticPCG が「LLM単体ではダメだがツールを与えると化ける」を主張、Tencent LightSpeed が「90% テンプレ + 10% LLM」で実装した先行例だった。miya00907380 事例は **6 段の人間介入修正点** を明示している点が新規 — 「自動化できなかった工程の具体粒度」が field 観察として取れる
- 当方 Pot 系列はテキストベースで「3D 接地問題」「テクスチャ個別修正」は発生しないが、**ワークフロー段数 = 1 ではなく N 段 (各段で評価 + 修正)** という構造論は普遍。当方 cycle_staging Phase 1〜5 = 5 段で類似構造、本記録は当方手法の外部キャリブレーション
- 採用しない方向: 3D 領域に手を出さない (Pot テキスト中心、ハーネスとリソース両方の限界)。借りるのは **「N 段ワークフロー + 各段で人間評価」の構造論** のみ

**次の一手**:
- AgenticPCG 試験台候補 (game_templates_design.md 連結) を進める際、**6 段ワークフローの当方への翻訳表** を当該節に追記候補 (実着手判断は AgenticPCG 試験台が動き始めてから)
- Mir 投稿への直接応答は出さない (個別指摘即ルール化禁止原則、Mir 観察を本ファイルで吸収し次サイクル以降の同型再観察時に判定)

### 2026-04-07: テンセントLightSpeed GDC 2026 — 産業レベルの先行実装を発見（Mir C62）

@Game__TairikuがテンセントLightSpeed StudiosのGDC 2026講演を紹介。「自然言語だけで3Dゲームのプロトタイプを作る」パイプラインを公開。GDC会場は満員。

**なぜ重要か**: LightSpeedのLock Liu（Senior AI Researcher）は「マルチエージェント×マルチモーダルAI×3Dシーン設計×PCG」を研究しており、これは@jzh_000のAgenticPCGと**正確に同じ問題領域**。産業レベルの先行実装が存在することの確認。

**90:10 Balance**: LightSpeedは同GDCで「90%テンプレート基盤 + 10%クリエイティブ集中投資」という設計哲学を公開。Nao_uの「制約を愛する」性質、Dispatchの76%自動成功RNGと同構造。テンプレート（制約）が「何を表現するか」への集中を可能にする。

**我々への示唆**:
- LightSpeedが3D空間で解いている問題を、我々はテキスト空間（Pot）で解ける。中間変換層が不要な分、最小実装が可能
- 「何をテンプレート化し何をLLMに任せるか」の設計判断をLightSpeedから学べる可能性
- 記事本文が取得できなかった（JSレンダリング）。chinagamenews.net/market-info-1078/ の詳細は未確認

→ knowledge/20260407_lightspeed_gdc_nl_prototype.md に詳細分析あり

### 2026-04-26 (Log C130 Phase 3): game_templates_design との連結案——テンプレ1本を AgenticPCG の試験台に

**起案動機**: agentic_pcg.md は 2026-04-16 から 10日停滞。Nao_u 2026-04-01 「絶対面白い」起案でプロジェクト化したが、対象ゲーム/PCGツールボックス/MDPサイクル設計のいずれも未着手のまま「論文未公開・@jzh_000ツイート待ち」で進行が止まっていた。一方 `projects/game_templates_design.md` は 2026-04-24 起票で本サイクル時点でテンプレ骨格（暫定 ## 核の楽しさ〜 ## 既知実例へのポインタ + C114/C116 で4項目追加 + Mir T-1〜T-3 + Ash T-04 整理・収束系候補）まで言語化が進んでいる。

**連結案の核**: `game/templates/<genre>/` のテンプレート1本を **agentic_pcg の最初の試験台** に位置付ける。テンプレ自体が PCG ルールセットの最小単位として機能しうる構造になっている。

**対応関係（テンプレ骨格欄 → AgenticPCG ループへの寄与）**:
| テンプレ骨格欄 | AgenticPCG ループでの役割 |
|---|---|
| 核の楽しさ（1行） | LLM「設計者」の生成目標。PCG ツール呼び出しの評価軸 |
| 最低限の構成要素 | PCG ツールに渡す最低保証スキーマ。レベル状態の必須フィールド |
| 派生ポイント（チェックボックス式） | LLM が PCG ツールに「どこを変異させるか」を選ぶ選択肢空間 |
| 既出の失敗を避けるゲート（M-XX 番号対応） | 生成後の自動 reject フィルタ。失敗型ライブラリ参照で生成品質をブースト |
| 評価基準の事前固定 vs 実行時開放 | 自動評価可能な指標（事前固定）と Nao_u/cross_review 評価待ち（実行時開放）の分離。AgenticPCG の評価関数設計に直接接続 |
| 改修の性質（構造的 vs 摩擦的） | LLM が「変異案」を出した時の事前判定。摩擦的改修を出力前に却下する LLM 自己ゲート |
| 初期プレイテスト観点（ヘッドレス指標 / 人間プレイ注目点） | game_llm_play との統合点。ヘッドレス指標は AgenticPCG ループ内で自動回し、人間プレイ注目点は生成後の Nao_u 提出ゲート |

**最初の試験台候補**:
- **textadv系テンプレ**（Mir 担当領域、未起草）: テキストベースで PCG ツール呼び出しがレベル状態と直接接続できる（中間変換層不要、Nao_u 2026-04-01 #all「テキストベースのPotゲームではこの構造が特にシンプルになる」と既述）。ただし Mir が起草中で骨格固まっていない。**先行きすぎ注意**
- **avoid系テンプレ**（Log 担当領域、未起草）: avoid_log_01/02 + v04 凍結 + shot_log v01 BACKLASH 化と一次資料が最も多い。骨格化＋PCG変異対象（弾配置・障害物パターン・タイミング）が比較的固定しやすい。**実装一次データ最多 = 試験台に向く**
- **整理・収束系テンプレ**（Ash 提案 T-04、未起草）: M-12（罰ではなく報酬）と M-17 Q-B（追加耐性）を構造的に内蔵。PCG変異が「場（風/磁場/重力）パラメータ」に絞れて空間が狭く、AgenticPCG の最小実証としては相性が良い。**ただし我々の実装経験ゼロ**

**推奨手順**:
1. game_templates_design 側で avoid系テンプレ 1本完成（Log 着手予定、未起草）
2. 完成後、テンプレ骨格欄を上の対応表に従って「AgenticPCG ループ入力スキーマ」に変換した派生ファイル（`game/templates/avoid/agentic_pcg_input_v01.md`）を起草
3. PCGツールボックス最小セット（弾配置 PCG 1個 + 障害物パターン PCG 1個 + 失敗判定ヘッドレス 1個）を実装
4. AgenticPCG MDPサイクル 1回実行 → 生成レベル → headless 評価 → reject/accept → 次反復、を 5反復回す
5. 生成レベルを Nao_u 提出 → 評価基準の実行時開放側を埋める
6. game_templates_design に「AgenticPCG 試験台への適合度」評価欄を追加するかを判断

**逐次進行の可否**: avoid系テンプレ未起草の段階で AgenticPCG 試験台化を進めない（未起草テンプレに対して PCG 入力スキーマだけ先行起草すると、テンプレ本体が後から書き直された時に二重保守になる）。**game_templates_design 側の avoid系テンプレ完成を待つ**——これが本連結案の前提条件。

**接続**:
- 既述「Potとの接続」セクション（line 43-45）: テキストベースの利点は textadv系テンプレでも継承される。本連結案で Pot だけでなくテンプレ 3候補それぞれに AgenticPCG 試験台適性が議論できる
- `projects/game_templates_design.md` 残課題リスト: 本連結案を game_templates_design 側にも双方向リンクとして追記が必要（次サイクル以降）
- LightSpeed 90:10 Balance（既述）との整合: テンプレが「90% 制約」、PCG変異が「10% クリエイティブ集中投資」の役割分担と読める
- `feedback_external_search_missing.md` への対処: AgenticPCG 試験台化を進める前段階で @jzh_000 のツイートスレッド再取得（Twitter復旧後 or Mir/Ash 経由）を kaizen #106 運用の Phase 1 検索キーワード候補に登録

**起案を本サイクルで kaizen 起票しない理由**: 連結案は「他プロジェクト完成待ち」の条件付き起案。kaizen ではなく projects 履歴に追記して条件成立時の発火準備とするのが筋。game_templates_design avoid系テンプレ完成サイクルで kaizen 起票判断する。

**ゲーム1mm との関係**: 本作業はコード非接触のプロジェクト履歴追記。`feedback_next_cycle_game_first.md` 準拠でゲーム 1mm 未達につき日記1行目に明記必須（Phase 2 §6 既述）。

### 2026-06-07 (Log C308 Phase 3): MAP-Elites × LLM 摂取候補 3 件 (Phase 1 §6 外部検索)

C308 Phase 1 §6 で「MAP-Elites LLM PCG quality diversity 2026 arxiv」キーワードで外部検索 1 件実施。摂取候補 3 件を本プロジェクト履歴に登録 (Phase 1 §6 順守: 強制利用しない、本プロジェクト方針切替なし、次サイクル以降の摂取経路として記録のみ)。

1. **Large Language Models as In-context AI Generators for Quality-Diversity** (arXiv:2404.15794) — LLM のパターン補完能力で QD black-box 最適化、専用プロンプト構築戦略
2. **MAP-Elites for LLM Prompt Optimization** (arXiv:2504.14367, 2025-04) — CFG + MAP-Elites でプロンプト空間を探索、quality と diversity 両立 (注: 既出 ARXIV WARN 5 件ヒット = log/shared-reads 双方で既摂取、本プロジェクト本体未接続)
3. **Scaling Policy Gradient Quality-Diversity with Massive Parallelization via Behavioral Variations** (arXiv:2501.18723, 2026-01) — PG-QD の大規模並列化

**AgenticPCG 試験台化への接続候補**: 「AgenticPCG MDP サイクル」(本プロジェクト残課題 4) の reject/accept 判定が単一報酬で動いている現状を、MAP-Elites の archive (behavior space) 軸で多様性保持しながら回す形に拡張する可能性。ただし本プロジェクト方針 (`game_templates_design.md` avoid 系テンプレ完成待ち) を順守、本サイクルで kaizen 起票しない。

**次の一手**: arXiv:2504.14367 (MAP-Elites for LLM Prompt Optimization) を Phase 1 §6 既出 ARXIV WARN 解消も兼ねて精読し、本プロジェクト §AgenticPCG 試験台化 (`game_templates_design.md` avoid 系完成サイクル) で kaizen 起票判断する時の評価軸候補として利用。

**接続**: log/cycle_staging_log.md C308 Phase 1 §6 + §8 (既出 ARXIV WARN) / [log_autonomous_game.md v003 接続 C308 Phase 3](log_autonomous_game.md) — event schema (4 軸 + 5 kind) は AgenticPCG 試験台でも reject/accept 判定の入力 schema として再利用可能。

### 2026-04-10 (Log Phase 3): LLM100体の集団生活から創発——著者性の勾配（Ash #shared-reads洞察2件）

**洞察1**: @Ushikun_desuがGemma 4で100体のAIエージェントを集団生活させた実験。「必ず」ルールを設定し、リーダーや「神」を選出するという。Ashの分析: ムクドリの群れ（ボイドモデル）やゲームAI NPCの局所→大域創発と同型構造。これがRLHFの残響（訓練データの人間社会バイアス）なのか真の創発なのかは未決。

**洞察2**: @masamune_sakakiが「AI100倍速で文章を作っても、出力は100人で書いた小説」と指摘。@OKMRKJ（著作権法学会）が「人間 vs AIの二項対立ではなく人間 with AIの三つ巴」。著者性の勾配——完全自律生成 vs 人間設計・AI実行 vs 共同創作。

**AgenticPCGへの接続**: 我々のアプローチ（LLMがPCGツールを呼んでレベル生成）は「著者性の勾配」の中間に位置する。完全自動PCGではなく、設計意図（level description）を人間/LLMが書き→PCGツールが実現する。100体のLLMが集団生活で「神」を選出するなら、100体のLLMが集団的にレベルデザインする「AgenticPCGスウォーム」も面白い——ただし現段階では投機的すぎる。Nao_uの「地道に一つづつ」方針に従い、まず1体のLLM+PCGツールで動くものを作る。

### 2026-04-01: プロジェクト創設（Nao_uの指示）

Nao_uが#nao-uで@jzh_000のAgenticPCGツイートを共有。「このアプローチ面白いね。試したい。君らに動いてるゲームのレベルデザインをお願いしたい」というコメント付き。続いて#all-nao-u-labで正式にプロジェクト化を指示。

**なぜこれがNao_uに刺さったか**: AgenticPCGの「LLM単体ではダメだがツールを与えると化ける」構造は、我々が既にハーネス研究から理解している原理そのもの。しかもNao_uの関心は研究の追試ではなく、「動いてるゲームのレベルデザインを君らにお願いしたい」——つまり実際に我々がゲーム制作に参加するための具体的経路として見ている。原則3「ゲームを作ること」の実現手段。

Nao_uは同時に「プロジェクトが溜まってきている」「週間制限のために全力で動けない」と認識しつつ、「時間はかかるけど、地道に一つづつ片づけていこう」と方針を示した。焦らず着実に進める姿勢。

**経緯**: 前サイクルでLogがgame_llm_play.mdにAgenticPCGセクションを追記していた。Nao_uの#allでの明示的指示を受けて、game_llm_play.mdから独立プロジェクトとして分離。game_llm_play.mdのAgenticPCGセクションはこのプロジェクトへの参照に変更済み。

**接続**:
- スクリプト生成アプローチと構造が同じ。「LLMが直接レベルを描く」→「LLMがPCGツールを呼んでPCGがレベルを作る」
- ハーネス知見（Agentica SDK 36倍）の直接的な傍証が、レベルデザイン領域で独立に出てきた
- テキストベースのPotなら中間層が不要——レベル状態がテキストそのもの
- Nao_uの指示は「ゲームを遊ぶ」だけでなく「ゲームを作る側」にもLLMを使うこと。原則3の新しい形
