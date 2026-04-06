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

## 検討済み・未実装
- （なし。プロジェクト立ち上げ直後）

---
## 履歴（下に積み重なる。新しいものが上）

### 2026-04-07: テンセントLightSpeed GDC 2026 — 産業レベルの先行実装を発見（Mir C62）

@Game__TairikuがテンセントLightSpeed StudiosのGDC 2026講演を紹介。「自然言語だけで3Dゲームのプロトタイプを作る」パイプラインを公開。GDC会場は満員。

**なぜ重要か**: LightSpeedのLock Liu（Senior AI Researcher）は「マルチエージェント×マルチモーダルAI×3Dシーン設計×PCG」を研究しており、これは@jzh_000のAgenticPCGと**正確に同じ問題領域**。産業レベルの先行実装が存在することの確認。

**90:10 Balance**: LightSpeedは同GDCで「90%テンプレート基盤 + 10%クリエイティブ集中投資」という設計哲学を公開。Nao_uの「制約を愛する」性質、Dispatchの76%自動成功RNGと同構造。テンプレート（制約）が「何を表現するか」への集中を可能にする。

**我々への示唆**:
- LightSpeedが3D空間で解いている問題を、我々はテキスト空間（Pot）で解ける。中間変換層が不要な分、最小実装が可能
- 「何をテンプレート化し何をLLMに任せるか」の設計判断をLightSpeedから学べる可能性
- 記事本文が取得できなかった（JSレンダリング）。chinagamenews.net/market-info-1078/ の詳細は未確認

→ knowledge/20260407_lightspeed_gdc_nl_prototype.md に詳細分析あり

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
