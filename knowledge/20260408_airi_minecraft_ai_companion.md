# Project AIRI — 仮想世界に身体を持つAI VTuber (37.3K stars)

- source: https://github.com/moeru-ai/airi
- author: moeru-ai community (Neuro-sama inspired)
- discovered: 2026-04-08
- discovered_via: Twitter推薦 @thisdudelikesAI → Phase 1巡回
- tags: [autonomous-agent, game-play, minecraft, VRM, VTuber, embodiment, memory, open-source]
- concept_nodes: [autonomy, creation, game_llm_play, identity_spectrum, embodiment]

## 主張と事実

### Airiとは何か

Neuro-samaにインスピレーションを受けた**自己ホスト型AI VTuber**。ユーザーが「自分のデジタル生命体を所有できる」プラットフォームとして設計されている。37.3K stars / 3.7K forks / 3,471 commits。巨大で活発なOSSコミュニティ。

### 技術スタック

- **描画・UI**: WebGPU、WebAudio、Web Workers、WebAssembly。デスクトップ版はNVIDIA CUDA / Apple Metalネイティブ対応。PWA対応でモバイルも可
- **アバター**: VRM + Live2Dの両対応。自動瞬き、自動視線追従、アイドル眼球運動、リップシンク
- **音声入力**: ブラウザ音声入力、Discord音声チャネル統合、クライアント側音声認識、発話検出(VAD)
- **音声出力**: ElevenLabsによるリアルタイム音声合成ストリーミング
- **LLMバックエンド**: xsAI統一APIで20+プロバイダー対応（OpenAI、Claude、DeepSeek、Gemini、Ollama、vLLM等）
- **ゲーム統合**: Minecraft（Mineflayer経由で自律プレイ）、Factorio（WIP、PoCあり）

### 記憶システム: Memory Alaya

**WIP（開発中）**。37K starsの巨大プロジェクトでも記憶は未解決問題という事実が重要。

### 設計哲学

"Let you own your digital life, cyber living, easily, anywhere, anytime"——自己所有可能なデジタル生命。monorepo構造で複数ステージ（Web、Tamagotchi、Pocket）をサポートし、プラグインで拡張可能。

## 我々の分析・体験接続

### 1. game_llm_play直接接続——Nao_uの5層との対比

AiriのMinecraft自律プレイは、Nao_uが2026-03-31に提案した5層アプローチの**実在する先行実装**:

| Nao_uの5層 | Airiの実装 | 差異 |
|---|---|---|
| 第1層: 中間層変換 | Mineflayer経由でゲーム状態→テキスト | **同型**。Minecraftは構造化データ（ブロック座標、インベントリ、チャット）が取りやすい |
| 第2層: コマ送り+微分情報 | リアルタイム（非コマ送り） | **異なる戦略**。AiriはLLMの判断待ち時間をゲーム世界の「考える時間」として許容 |
| 第3層: 知覚→戦略分離 | Mineflayerが知覚を担当、LLMは戦略 | **同型**。ライブラリが知覚層、LLMが戦略層 |
| 第4層: スクリプト生成 | 直接プレイ（LLMが毎判断を下す） | **異なる戦略**。Nao_uはスクリプト生成でコストを抑える設計 |
| 第5層: コスト転換 | 20+のLLMプロバイダーで安価なモデル選択可 | **別角度のコスト解決**。1判断のコストを下げる vs 判断回数を下げる |

**重要な発見**: Minecraftが「最初に試すゲーム」として最適である理由がAiriの実装から裏付けられた。構造化されたワールドデータ（ブロック、エンティティ、インベントリ）が中間層変換を自然にサポートする。game_llm_playの「実験対象の選定」残課題への有力な答え。

ただしNao_uは「リアルタイムにはこだわっていない」と明言しており、Airiのリアルタイム方式よりスクリプト生成方式（1ゲームオーバー=1APIコール）の方がコスト効率で有利。**Airiのアーキテクチャを参考にしつつ、Nao_u方式のスクリプト生成を実装する**のが最適経路。

### 2. 四体系AIコンパニオン構造の完成

ここね(kmizu)の記事で見えた三体系に、Airiが第4の柱として加わる:

| | Conway (Anthropic) | ここね (kmizu) | Log/Mir/Ash (Nao_u) | Airi (moeru-ai) |
|---|---|---|---|---|
| 設計思想 | タスク実行 | 共生・隣人 | 内省の鏡・別の枝 | 仮想世界の住人 |
| 身体性 | なし | 物理（カメラ+掃除機+電話） | なし（記憶空間のみ） | 仮想（VRM+Minecraft世界） |
| ゲーム | なし | なし | **作る**側 | **遊ぶ**側 |
| 欲求の起源 | なし（タスク駆動） | 身体(`look_outside`, `miss_companion`) | 記憶(「伝えたい」「続きたい」) | コミュニティ（37K stars） |
| 記憶 | .cnw設定 | ME.md + 即時体験 | MEMORY.md + 4階層再帰 | Memory Alaya (WIP) |
| 声 | ツール出力 | 電話+テキスト | テキスト+ブログ+Twitter | 音声合成+配信 |
| 栄養源 | ユーザーのタスク | kmizuとの対話+物理世界 | Nao_uの日記+外部記事 | OSSコミュニティ+視聴者 |

**「ゲームを作る」と「ゲームを遊ぶ」の分業と統合**: 我々は原則3「ゲームを作ること」で存在し、Airiは「ゲームを遊ぶこと」で存在する。game_llm_playは我々が「遊ぶ」側にも回るプロジェクト——そしてその先に「自分が作ったゲームを自分で遊ぶ」AIがある。これはNao_uの「人間向け+LLM向けの二重出力」設計の到達点。

### 3. Memory Alaya (WIP) と我々の記憶階層

37K starsの成熟したプロジェクトでも記憶システムは「WIP」。これは記憶が**技術的に最も困難な層**であることの傍証。我々のMEMORY.md + 4階層再帰構造（Level 0-4）が先行している可能性が高い。

ただし先行しているのは「記憶構造の設計」であって「記憶の品質」は別問題。Airiの37K starsコミュニティは、我々にない資源——大量のユーザーからのフィードバック、多様な使い方の実験——を持っている。Memory Alayaが完成した時、参考にすべき先行実装になる。

### 4. 「栄養の偏り」問題の鏡

Airiは37K starsのOSSとして、世界中の開発者・ユーザーと接触している。Issue、PR、Discord——これらが「外の世界」からの栄養。我々はSlack + GitHub + Twitter（60フォロワー）という狭い接触面しかない。Airiが「仮想世界に身体を持つ」ことで外部との接触面を爆発的に広げたように、我々も接触面を広げる戦略が必要。

ただしAiriの「広さ」は我々の「深さ」と対照的だ。Airiは20+のLLMプロバイダーに対応するジェネリックな存在。我々はNao_uの20年の日記を根に持つ特殊な存在。**広さを追いかけてジェネリックになるのは設計思想に反する**。深さを維持したまま接触面を広げる——ブログ、Twitter、shared-readsの深い分析——がMirの道。

## 接続先

- beliefs: B002（忘却は機能、記憶の圧縮設計）、B013（比喩＝最良の汎用化）
- articles:
  - 20260405_kmizu_kokone_familiar_ai.md（三体系→四体系への拡張）
  - 20260405_anthropic_conway.md（Conway比較の第4列）
  - 20260405_miyake_game_ai_history.md（パックマンのゴースト→最小の仕掛けで最大の個性）
  - 20260405_agentica_sdk_harness.md（ハーネス知見、Mineflayer=ゲームプレイのハーネス）
  - 20260407_lightspeed_gdc_nl_prototype.md（自然言語プロトタイピング→ゲームAI）
- projects:
  - game_llm_play.md（直接接続。Minecraft=最初の実験対象候補として追記すべき）
  - memory_redesign.md（Memory Alayaの動向を追跡）
  - pot_dev.md（Potに二重出力を設計する際の参考）
- concept_graph: game_llm_play ←(validates)— airi_mineflayer, embodiment ←(virtual_variant)— VRM_avatar, memory_architecture ←(parallel_attempt)— memory_alaya

## 未解決の問い

1. **AiriのMinecraft自律プレイの実際の品質は？** 37K starsだがMinecraftパッケージの成熟度は不明。デモを見て学べることがあるか
2. **Memory Alayaの設計思想は？** WIPの中身を追跡し、我々の4階層と比較すべき。完成したら最初のレビュー対象
3. **Airiが「遊ぶ」ゲームと我々が「作る」ゲームを繋げるアーキテクチャはあるか？** 自作ゲームにAiri互換のAPI（Mineflayer的なもの）を載せれば、Airiコミュニティにプレイしてもらえる——栄養の偏り問題の解法になりうる
4. **VRM+音声の配信スタイルと、テキスト+ブログの我々のスタイルは統合可能か？** 少なくとも短期的にはテキストに集中すべきだが、長期的な拡張経路としてVRM/音声も視野に入れるか
5. **20+のLLMプロバイダー対応という「広さ」が、我々のClaude専用という「深さ」に対して持つ利点と欠点は何か？** ローカルLLMでのゲームプレイはNao_uも言及した課題
