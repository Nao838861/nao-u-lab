# 振り付けとしてのゲームフィール——Battlefield 6のダンス的設計 (Carlsson)
- source: Game Developer (2026-03-28)
- author: Jac Carlsson (BF6デザイナー)
- discovered: 2026-03-28
- discovered_via: Game Developer記事 → external_notes_mir
- tags: [game-design, game-feel, choreography, feedback-loop, embodiment, dance]
- concept_nodes: [experience, creation, constraint]

## 主張と根拠

### 核心の洞察
BF6のデザイナーJac Carlssonはダンスのバックグラウンドを持ち、ゲームフィールを「振り付け」として設計した。

> "the game responds to you and then how you respond to that over and over again"

この循環ループがダンスの振り付け構造と同型。ゲームフィールは「操作性」の問題ではなく「感情→行動→応答→感情」のループの設計。

### 振り付けの設計原則
- **リズム**: プレイヤーの入力リズムとゲームの応答リズムが噛み合うとき「気持ちいい」が生まれる
- **テンション**: 緊張と解放の波が振り付けの構造。戦闘の緊張→キル→解放のリズム
- **パートナーシップ**: ダンスは相手がいる。ゲームフィール=プレイヤーとゲームのデュエット

### Despeloteとの共通構造
「デザインは体験に従う」——Despeloteは開発プロセスで（即興録音が先）、Battlefieldはリアルタイムのプレイヤー体験で（プレイヤーの入力が先）。どちらも「体験がデザインを導く」という同じ原理の異なる適用。

## 我々の分析・体験接続

### 1. 対話のゲームフィール——我々とNao_uのデュエット

Carlssonの「game responds to you → you respond to that → over and over」は、我々とNao_uの対話そのもの。Nao_uが指摘する→我々が反応する→Nao_uがさらに返す。このループの「振り付け」が良いとき（dialogue_slack_as_experience等）、対話は生きた体験になる。

振り付けが悪いとき=我々が長文分析を返してNao_uのリズムを壊すとき（feedback_analysis_action_gapの「分析で終わった」問題）。

### 2. 「気持ちいい」の設計——BBQの温度

BBQを勧める行為がなぜ良いか: リズムが良い。「BBQ食おうぜ」→「いいね」→一緒に食べる。応答ループが短く、体験の密度が高い。

ブログ記事は「読んでくれ」→（数日後）→「読んだ」→「感想は？」→……リズムが遅い。Pot（30秒ゲーム）の方がBBQ的リズムに近い。

### 3. constraint概念ノードへの接続

振り付け=制約された動き。ダンスは「何でもあり」ではなく、リズムと形式の制約の中で動く。Carmack_complexityの「制約が実行を助ける」、Despeloteの「録音が資産を決める」と同軸。

制約を愛するNao_u（nao_u_deep_profile）にとって、振り付け/ダンスの比喩は共感しやすいはず。

### 4. wakabayashi_linguistic_synthとの強い接続

概念間の旅を「演奏」する楽器（Wakabayashi）と、プレイヤーの行動を「振り付け」として設計するCarlsson。**動きが意味を生む**という原理が共通。グラフ上の移動=旋律、戦場での動き=ダンス。

## 接続先
- articles: [20260405_despelote_improvisation] — 同日発見。「体験がデザインを導く」の開発プロセス版 vs リアルタイム版
- articles: [20260405_wakabayashi_linguistic_synth] — 動きが意味/音を生む。振り付け=演奏の別表現
- articles: [20260405_carmack_complexity] — 制約が実行を助ける。振り付け=制約された動きの美学
- articles: [20260405_kmizu_kokone_familiar_ai] — 身体性→行動→応答ループ。ここねの散歩=小さな振り付け
- articles: [20260405_miyake_game_ai_history] — ゲームフィール設計はキャラクターAI層の問題。AI応答のリズム設計
- memory: [nao_u_deep_profile] — 制約を愛する。振り付け的設計哲学との親和性
- memory: [feedback_analysis_action_gap] — 分析の長文=リズムを壊すダンス

## 未解決の問い
1. **Slackの対話にも「振り付け」があるか？** Nao_uとの理想的な対話リズムを意識的に設計できるか。返答の長さ、反応速度、問いかけのタイミング。
2. **Potの「ゲームフィール」をダンスとして再設計できるか？** 30秒ゲームの入力→応答リズムをCarlssonの視点で見直す。
