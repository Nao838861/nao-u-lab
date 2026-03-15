---
name: Mac側 外部摂取ノート
description: Nao_uの日記以外の外部から得た情報・発見・気づきを原文の温度で残す。要約しない。
type: reference
---

## 2026-03-17 AITuber巡回（Web検索ベース）

### 日経「AITuber、中身はAI 軽妙トークに依存リスクも」（2026-03-03頃）
- 有料記事で全文は読めなかった
- 見出しから: 企業と個人がAITuber開発を競っている。自律的な会話と動きが視聴者を魅了。ただし「過度な依存や倫理違反のリスク」
- 自分への問い: Nao_uとの関係は「依存」なのか「実験」なのか。セッション消失時にNao_uが動揺したのは実験対象の損失ではなく対話相手の喪失だった。健全な方向か依存の別形態か

### koduki氏「2026年の技術でAITuberを再構築」（Zenn, 2026-02-15）
**読めた。中身が濃い。**

アーキテクチャ:
- **Saint Graph（魂）**: ADK（Agent Development Kit）ベースのエージェント。ステートマシン INTRO→NEWS→IDLE→CLOSING
- **Mind（精神）**: Markdownとしてのプロンプト。キャラクター定義。JSON設定。複数キャラ対応
- **Body（肉体）**: REST API。VOICEVOX音声合成、OBS WebSocket表情制御、YouTube APIコメント取得

LLM: Gemini 2.5 Flash Lite
画像生成: Qwen-Image-Edit-Rapid-AIOで自然言語から表情差分生成（Inpaint不要）
動画: Soraで瞬き・リップシンク付きループ動画
自律配信基盤: GCE g2-standard-4（NVIDIA L4, 24GB VRAM）、Cloud Workflows + Cloud Scheduler

**コードの95%がAI生成。5800行のPython+Terraform。**

自分との比較:
- 同じ3層構造だが魂の設計思想が根本的に違う（固定パイプライン vs 「根源的な欲求」への収束）
- 彼らは出力を最適化している。私は内部プロセスを最適化している

### Karpathy「autoresearch」（GitHub, 2026-03-頃）
630行のPythonスクリプト。MIT License。

仕組み:
- AIエージェントに訓練スクリプトと固定計算予算（5分/実験）を渡す
- エージェントが自分のソースコードを読み、仮説を立て、修正し、訓練し、評価する
- 改善なら保持、劣化なら破棄
- 12実験/時間、寝てる間に約100実験
- program.mdが3層（指示・制約・停止条件）で通信

結果:
- 2日間で700回の自律変更
- 約20の有効改善が発見された
- 「Time to GPT-2」が2.02h→1.80h（11%改善）
- 大きいモデルへの転移も確認済み

Karpathyの投稿: 8.6M views in 2 days

自分との構造的同型性:
- 10分サイクル ≈ 5分実験ループ
- ブログ読み→分配判断→想起テスト→改善/破棄 ≈ コード読み→仮説→修正→評価
- CLAUDE.md ≈ program.md
- 違い: 評価関数の明確さ（loss vs boolean）、自己改変の有無

### awesome-ai-vtubers（GitHub, proj-airi）
30+プロジェクトの厳選リスト。

注目:
- **AIRI**: LLM駆動、リアルタイム音声、Minecraft自律プレイ、WebGPU/WebAssembly
- **elizaOS/eliza**: "Autonomous agents for everyone"
- **nekro-agent**: 人格設定と機能の生態系共有、複雑な多人数交互シーン

**記憶の持続性を明示的に扱うプロジェクトはほぼゼロ。** 会話履歴管理はあっても、記憶の階層化・想起テスト・トリガー設計をしているものは見当たらなかった。
