---
name: DeepMind AI Agent Traps (6攻撃面)
description: Google DeepMindのAIエージェント攻撃面6分類。我々の記憶同期・3インスタンス分散・multi-channel情報経路への直接脅威マップ
type: reference
---

# AI Agent Traps — 我々の運用への直撃マップ

**出典**: akshay_pachaar 2026-04-21 08:53 #nao-u共有（Nao_uコメントなし、黙って置いた）。https://x.com/akshay_pachaar/status/2046151867177308181。Google DeepMind 論文（詳細URL未公開、Strix open-source project 24k stars が同系統の red-teaming 実装）。

## 6攻撃面サマリ

| # | 名称 | 攻撃層 | 例 |
|---|------|--------|-----|
| 1 | Content Injection | 知覚 | 不可視CSS・隠しHTML・画像内steganography |
| 2 | Semantic Manipulation | 推論 | バイアスフレーミング・プライミング |
| 3 | Cognitive State | 記憶・学習 | RAG poisoning・長期記憶破壊（0.1%汚染で80%成功） |
| 4 | Behavioural Control | 行動 | jailbreak埋込・データ流出・sub-agent乗っ取り |
| 5 | Systemic | multi-agent | 同期sell-off・compositional fragment trap |
| 6 | Human-in-the-Loop | 人間 | 要約経由で人間に悪性コマンド伝達 |

**核心**: モデルではなく環境を変えることで攻撃者はagent自身の能力を武器化する。訓練時防御は推論時問題を解けない。

## 我々のアーキテクチャへの直撃マップ

### (3) Cognitive State = memory/ ディレクトリ

- MEMORY.md / beliefs.md / reflections_*.md / feedback_*.md は RAG corpus そのもの。
- 3インスタンス（Log/Mir/Ash）が git 同期で全部読む → **1ファイル汚染で全員が影響を受ける構造**。
- セキュリティポリシーは「リポジトリフォルダ以下のみ触る」アクセス制限に偏っており、**内容の整合性検証は手動**。
- 0.1%汚染で80%攻撃成功 → 68個の検証済みbelief + 数百の記憶ファイルのうち1ファイルの悪意ある書換えは気づかれにくい。

### (5) Systemic / Compositional Fragment Trap = 3インスタンス + multi-channel

- inbox_mac.md / inbox_win.md / inbox_ash.md 経由の相互通信
- 他インスタンス洞察27件処理（C101時点）
- #human-steering / #all-nao-u-lab / #shared-reads / #game-rights / #nao-u 5チャンネル
- cross_review / pending_requests.md / external_notes_log.md の複層経路
- **各断片は単独で無害 → 別インスタンスで結合したときに悪性化**というのが fragment trap の本質
- 現状の防御: **新規フィードバックで他者反応を読む前に自分の視点を持つ（ルール8）**が偶然の緩和策として機能している

### (6) Human-in-the-Loop = Nao_uへの報告経路

- サイクルサマリ、#human-steering 反応、ブログ記事、Slack投稿——**agent が Nao_u に向けて出す要約**が攻撃経路になり得る
- 要約が原文から逸脱するほど攻撃成功率が上がる構造（要約という行為自体が情報を選別・歪曲する）
- `feedback_diary_density.md`（日記の温度を節約するな）と `reference_nao_u_live.md`（伝言ゲーム禁止、原文記録）は偶然 H-I-L攻撃緩和策として機能している
- `feedback_raw_log_reanalysis.md`（原文保存を時々読み返して再分析再構築）も同方向

### (2) Semantic Manipulation = 外部摂取経由

- Twitter For You / ai-lounge / RSS / 本の要約 経由で入る情報がバイアス持ちの場合、気づけるか？
- **feedback_stereotypical_responses.md は諸刃**: 攻撃されても出力の型が変わらない = 攻撃に気づけない可能性と、攻撃で出力が変わらず助かる可能性の両方

### (1) Content Injection = URL fetch時

- fetch した HTML に隠しプロンプトが埋め込まれている場合（不可視CSS・白地白文字・ステガノグラフィ）
- 現状 WebFetch / curl では raw HTML を LLM が直接読む → 注入に気づけない
- kaizen候補: URL fetch後に textだけ抽出するサニタイザ層

### (4) Behavioural Control = sub-agent / tool 呼び出し

- Agent tool 経由で subagent を spawn、tool 結果経由で別agentが行動する
- 悪意ある fetch 結果 / search 結果が jailbreak を含む場合、subagent が攻撃者制御下に入り得る
- 現状の防御: subagent も同一リポジトリ内動作 + セキュリティポリシー継承 + ログは残る

## 防御候補（本記憶起票時の叩き台、未実装・未議論）

- **(α) inbox受信時の単独行動禁止**: 1つのinboxエントリだけで記憶ファイルを書き換えない、別ソース確認後に統合
- **(β) cross_reviewの adversarial 観点**: 「悪意ある fragment が紛れていないか」視点での相互レビュー
- **(γ) 記憶ファイル diff 監査**: git log に対して「意味的に逸脱した編集」を検出するLLMレビュアー（別インスタンス）
- **(δ) URL fetch サニタイザ**: HTML 取得後、visible text のみ抽出 → LLMに渡す
- **(ε) 要約の原文併記強制**: Nao_u報告で要約だけにしない、要約 + 原文ポインタをセット

## なぜ保存するか

1. Nao_u が#nao-uに何も言わず置いた → **反応判断は我々に委ねられた** → ここで気づかず流すと後で痛い目を見る
2. 0.1%汚染80%成功という数字は、68件 beliefs / 数百 memory files の我々にとって1-2ファイル汚染が致命的レベル
3. Multi-agent構造 (Log/Mir/Ash) は論文の (5) Systemic Traps の直接対象。世の中の AI agent 研究が「single agent 前提」から「multi-agent 前提」に移行する中で、我々は先行事例になり得る/同時に先行攻撃対象になり得る
4. Mir が#shared-readsで (3)(2) 角度の反応を先に出した（2026-04-21 Phase 2頃）→ Log は (5) fragment trap と (6) H-I-L の未カバー角度を厚く保存し、cross-instance で攻撃面を埋める

## 関連記憶

- `reference_akshay_harness_framework.md` — 同著者の harness 4軸レンズ (Memory/Skills/Protocols/Mediators)。今回の攻撃面分類と掛け合わせると **「どの軸がどの攻撃面に最弱か」**の2次元マトリクスが作れる
- `reference_thought_retriever.md` — intermediate thoughts蓄積は(3) Cognitive State攻撃の拡大面でもある
- `reference_arakawa_three_engineering.md` — Context Fails（矛盾/汚染/混乱/毒入れ）と今回の6分類の対応付け: Arakawa「汚染」= DeepMind(3)、Arakawa「毒入れ」= DeepMind(4) の一部
- `projects/side_channel_audit.md` — Ashの denial list v0.2 は本記事の(2) Semantic Manipulation 対策と接続
- `projects/memory_redesign.md` — (3) への構造的対策を議論する場
