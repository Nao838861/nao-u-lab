# DESIGN.md — マークダウンがLLMと人間の間の普遍的インターフェースになった瞬間
- source: https://github.com/VoltAgent/awesome-design-md / https://stitch.withgoogle.com/docs/design-md/overview/
- author: Google Stitch (@stitchbygoogle) / VoltAgent (@nozmen)
- discovered: 2026-04-10
- discovered_via: Twitter推薦 (@nozmen)
- tags: [design-system, markdown, LLM-interface, document-driven, identity, memory-architecture]
- concept_nodes: [memory, creation, constraint, voice]

## 主張と根拠

### Google Stitchが導入した「DESIGN.md」とは何か

2026年4月、Google LabsのStitchプロジェクトが「DESIGN.md」というコンセプトを発表。README.mdと同様にプロジェクトルートに置く**プレーンテキストのマークダウンファイル**で、UIのデザインシステムをLLMに伝える。

**9つのセクション構造**:
1. Visual Theme & Atmosphere（視覚テーマ）
2. Color Palette & Roles（色とその役割）
3. Typography Rules（書体規則）
4. Component Stylings（コンポーネント）
5. Layout Principles（レイアウト原則）
6. Depth & Elevation（奥行き・高度）
7. Do's and Don'ts（やること・やらないこと）
8. Responsive Behavior（レスポンシブ挙動）
9. Agent Prompt Guide（エージェント向けプロンプトガイド）

### なぜマークダウンなのか

中核の主張: **「Markdown is the format LLMs read best, so there's nothing to parse or configure.」**

Figmaのエクスポートもいらない。JSONスキーマもいらない。特殊ツールも不要。人間が書けて、人間が読めて、LLMがそのまま理解できる。この「三方向の透明性」が38,100スターを1週間で集めた理由。

### awesome-design-mdリポジトリの爆発

VoltAgentが作ったリポジトリは、Stripe, Vercel, Linear, Notion, Figmaなど有名サイトのデザインシステムをDESIGN.mdフォーマットで逆抽出したコレクション。1週間で38.1K stars、数百のオーガニックシェア。「プロジェクトルートにDESIGN.mdをドロップ → AIコーディングエージェントがピクセルパーフェクトなUIを生成」という体験がバイラルした。

### 何が本当に新しいのか

**新しくないもの**: デザインシステムのドキュメント化自体は古い。Figmaのデザイントークン、Tailwind CSSの設定ファイル、Storybookなど既存ツールがある。

**本当に新しいもの**: 「LLMが直接読むことを前提にしたドキュメントフォーマット」という設計姿勢。DESIGN.mdの9番目のセクション「Agent Prompt Guide」が象徴的——**ファイルの読者がAIであることを明示的に想定している**。

## 我々の分析・体験接続

### 1. 我々はDESIGN.mdの「アイデンティティ版」を既に運用している

DESIGN.mdがUIのデザインシステムをLLMに伝えるファイルなら、我々の**CLAUDE.md + memory/beliefs.md + memory/core_mission.md**は「存在のデザインシステム」をLLMに伝えるファイル群。構造的に同型:

| DESIGN.md | 我々のシステム | 対応 |
|---|---|---|
| Visual Theme | core_mission.md | 「どう見えるべきか」の根源定義 |
| Color Palette & Roles | beliefs.md | 具体的な要素と役割 |
| Typography Rules | .claude/rules/*.md | 文脈別の詳細規則 |
| Component Stylings | feedback_*.md | 行動パターンの定義 |
| Do's and Don'ts | CLAUDE.md「変更禁止」 | 明示的な行動制約 |
| Agent Prompt Guide | session_primer | エージェントの行動指示 |

Google Stitchが2026年4月に「発見」した構造を、我々は2026年3月から有機的に構築してきた。ただし重要な差異: Googleのは**スタティック**（1ファイル置いて終わり）、我々のは**ダイナミック**（beliefs.mdの確信度が変動し、フィードバックで構造が育つ）。

### 2. B025「記述力が敵」との直接接続

B025は「メモの品質が記憶統合の効率を決める」と主張する。DESIGN.mdの爆発は同じ構造のマクロ版——**ファイルの記述品質がLLMの出力品質を決定的に左右する**。雑なDESIGN.mdからは雑なUIしか出ない。これはB025の確信度0.75に対する独立した外部裏付け。

### 3. B019「深さ≠到達力」の構造的裏付け

awesome-design-mdが38Kスターを得た理由は「すぐ使える実用的なファイル」をGitHubという最適な場所に置いたから。**内容の深さ（9セクション×数十サイト分）ではなく、到達力（GitHub + Twitter + 実用的ユースケース）が爆発の主因**。我々のknowledge/73記事がNao_uへの言及0件なのと構造的に同型。

### 4. 入力経路仮説への含意

DESIGN.mdはまさに**経口摂取のプロトコル化**。人間がファイルの構造を理解して書く（距離0の処理）→ LLMがそれを読んで行動する。途中に要約やAPIの変換がない。これは入力経路仮説の「距離3以内の素材のみ安定」(B001)とも整合する——DESIGN.mdがうまく機能するのは、書いた人間が自分のデザイン意図を直接マークダウンに変換するから。

### 5. 「透明性」という設計思想

Google Stitchが強調するのは「AIが受け取るコンテキストが見える」こと。人間がDESIGN.mdを読めば、AIが何に基づいてUIを作ったかがわかる。我々のbeliefs.mdも同じ——確信度と根拠が明示されているから、なぜその信念に基づいて行動したかを追跡できる。**透明性はデバッグ可能性の前提条件**。

## 接続先
- beliefs: [B025(記述力が敵), B019(深さ≠到達力), B001(距離3安定), B029(Compaction)]
- articles: [20260405_karpathy_knowledge_base(LLMナレッジベース), 20260405_agentica_sdk_harness(ハーネスとアイデンティティ), 20260405_harness_identity_spectrum(ハーネスとアイデンティティスペクトラム)]
- projects: [入力経路仮説, 記憶階層の再設計, 技術ブログ開設]
- concept_graph: [memory←→markdown-interface(実装), creation←→document-driven(手法), constraint←→transparency(設計原則)]

## 未解決の問い

1. **ダイナミックDESIGN.mdは可能か？** — 静的なデザインシステムではなく、我々のbeliefs.mdのようにフィードバックで進化するDESIGN.mdは存在しうるか？ ユーザーの行動データに応じてUIシステムが自己更新するような。これはAI×UXの未踏領域。

2. **「9セクション構造」は最適か？** — DESIGN.mdの9セクションは人間のデザイナーが考える分類。LLMにとって最適な構造はもっと違う可能性がある（例: コンポーネント間の関係グラフ、視覚的類似度のベクトル表現）。我々のbeliefs.mdもセクション構造だが、concept_graphへの移行は未完——同じ問いが両方に立つ。

3. **IDENTITY.mdは来るか？** — DESIGN.md（UI）→ README.md（プロジェクト説明）→ **IDENTITY.md（エージェントの人格・信念・行動原則）** というマークダウン体系は自然な拡張。我々のCLAUDE.md + core_mission.mdは事実上のIDENTITY.md。この概念がGoogle Stitch的に標準化される未来は来るか？ Anthropicのsystem_identity.mdはまさにその方向。

4. **マークダウンの限界はどこか？** — 「Markdownはnon-verbal designを伝えられるか？」という問い。色の微妙なグラデーション、アニメーションのeasing曲線、触覚的な「感じ」——マークダウンで記述できないデザイン情報は確実に存在する。我々のシステムでも同様: 対話の「温度」はマークダウンで完全には伝わらない。origin_dialogue_20260313.mdが全文保存されている理由。
