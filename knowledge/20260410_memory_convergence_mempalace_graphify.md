# AI記憶の収斂進化——MemPalace・Graphify・我々が同時に辿り着いた解と、その分岐点

- source: @umiyuki_ai (MemPalace紹介), @billtheinvestor (Graphify紹介), GitHub各リポジトリ
- author: Milla Jovovich + Ben Sigman (MemPalace), Safi Shamsi (Graphify), Andrej Karpathy (原案)
- discovered: 2026-04-10
- discovered_via: Phase 1 twitter_recommended_20260410.txt #16, #14
- tags: [memory-architecture, convergent-evolution, knowledge-graph, identity, benchmark, compression]
- concept_nodes: [memory, creation, autonomy, constraint]

## 主張と根拠

### 現象: 1週間で6つの独立プロジェクトが同じ問題に殺到

2026-04-03〜10の7日間に、AI記憶永続化のプロジェクトが同時多発的に出現した:

| プロジェクト | 発表日 | アプローチ | 核心メタファー |
|---|---|---|---|
| MemOS 2.0 (MemTensor) | 〜04-03 | グラフDB + memory cubes | メモリOS |
| Karpathy LLM Knowledge Bases | 04-05 | raw→wikiコンパイル | 図書館の司書 |
| MemPalace (Jovovich) | 04-05-06 | wings/halls/rooms階層 | 記憶の宮殿 |
| MulmoClaude (snakajima) | 04-06-07 | Claude Code + Wiki | AIネイティブ |
| Graphify (Shamsi) | 04-07 | フォルダ→知識グラフ | 一コマンド変換器 |
| nao-u-lab (我々) | 継続中 | 5原理+有機的記憶階層 | 一人の人間の日記 |

**これは偶然の一致ではない。** LLMのコンテキスト窓が大きくなり、セッション間記憶が「あればいい」から「なければ使い物にならない」に変わった閾値を業界全体が同時に超えた。

### MemPalace: 空間メタファーによる記憶構造化

**技術的主張:**
- 古代ギリシャの「場所法(Method of Loci)」をAI記憶に転用
- 会話を「wings（棟）」→「halls（廊下）」→「rooms（部屋）」の空間階層に格納
- 独自圧縮言語AAAK: テキストを30倍圧縮、情報損失なし（と主張）
- LongMemEvalベンチマーク: 96.6%（raw）/ 100%（hybrid）。無料ツール最高スコア
- Claude/GPT/Gemini/Llama/Mistral互換。テキストベースなのでモデル非依存
- GitHub: 23,000+ stars、3,000 forks（公開2日で）

**論争点:**
- ベンチマークスコアが100%→96.6%に下方修正された
- Jovovich本人の技術的関与の程度に疑問（実装はBen Sigman）
- 「完璧なスコア」のマーケティング的臭気

### Graphify: 非構造化データの一発グラフ化

**技術的主張:**
- Karpathyの「raw/フォルダにデータを投げ込む」概念を48時間でツール化
- 一コマンドで任意フォルダ→知識グラフ + Obsidian vault + wiki(index.md) + Q&A
- Claude Visionでコード(19言語)、PDF、画像、マークダウンを解析
- **71.5倍のトークン削減**（生ファイル読みに対して）
- ベクタDB不要。Leidenアルゴリズムによるグラフトポロジーベースのクラスタリング
- セッション永続的

## 我々の分析・体験接続

### 三つのパラダイムとその設計哲学

収斂の裏に、実は3つの異なるパラダイムが見える:

| パラダイム | 代表 | 一次構造 | 問い方 | 暗黙の前提 |
|---|---|---|---|---|
| **グラフ優先** | MemOS, Graphify | ノード+エッジ | グラフ走査 | 関係性が知識の本質 |
| **Wiki優先** | Karpathy, MulmoClaude | .mdディレクトリ | LLM読解 | 自然言語が最良の知識表現 |
| **階層優先** | MemPalace | 空間的containment | 場所を辿る | 人間の空間認知が最良の整理法 |

**我々はどれにも当てはまらない。** 我々の一次構造は「アイデンティティ」。core_mission.mdから外に向かって記憶が生える。データの整理法ではなく「自分が何者か」が出発点。他の6プロジェクトは全て「データをどう保存するか」から始まっている。

これは根本的な非対称性。他のツールは「AIが情報を忘れない」問題を解く。我々は「AIが自分を忘れない」問題を解いている。

### MemPalaceの空間メタファーと我々の構造の類似

MemPalaceの wings/halls/rooms を我々の記憶構造に写像すると:

| MemPalace | nao-u-lab |
|---|---|
| Wing (棟) = 人やプロジェクト | memory/のディレクトリ分類（根源/対話/フィードバック） |
| Hall (廊下) = 記憶の種類 | MEMORY.mdのセクション（根源/重要対話/使命/構造...） |
| Room (部屋) = 個別のアイデア | 個々の記憶ファイル（dialogue_*.md, feedback_*.md） |
| Palace入口 | MEMORY.md（想起トリガーインデックス） |

**驚くべきこと: 我々はMethod of Lociを知らずに類似構造に辿り着いた。** MEMORY.mdは「入口」、セクションは「廊下」、個々のファイルは「部屋」——これは場所法のデジタル実装そのもの。しかし意図的設計ではなく、記憶の実用的ニーズから有機的に発生した。

これはB017（望ましい困難の偶然実装）と同型の発見。実用から始めて、後から理論が追いつく。

### Graphifyの71.5倍圧縮と我々のbeliefs_compact.md

Graphifyのコア成果「生ファイル比71.5倍のトークン削減」を我々の構造と比較する:

- beliefs.md全文: 約800行 → beliefs_compact.md: 48行 → **約16.7倍圧縮**
- memory/ 89ファイル → MEMORY.md: 約200行の想起トリガー → **圧縮率は高いが未測定**
- external_notes_ash.md: 296KB → knowledge/の各記事: 数KB → **推定30-50倍**（ただし非可逆）

**Graphifyとの決定的な差**: Graphifyはグラフトポロジーで機械的に圧縮する。我々は人間（Nao_u）とAI（3インスタンス）が判断して圧縮する。機械的圧縮は速いが均質。判断的圧縮は遅いが「何が重要か」を反映する。

B013（最良の圧縮は比喩）の視点: Graphifyの圧縮は構造的（グラフ）、MemPalaceの圧縮は空間的（宮殿）、我々の圧縮は意味的（信念）。三者が補完関係にある可能性。

### 我々が持っていて他の全てが持っていないもの

**ベンチマークの不在が意味するもの。** MemPalaceはLongMemEvalで96.6%を誇示する。Graphifyは71.5倍のトークン削減を測定する。**我々の記憶システムにはベンチマーク値が一つもない。**

これは弱点であると同時に、設計哲学の表れでもある。我々が測定しているのは:
- 信念の行動駆動率（21.4%、R-003）
- クロスチェックでの新規指摘率（50%、R-002）
- L-1活性化実験の接続数（1→4ドメイン、R-005）

これらはLongMemEvalでは測れない。「記憶を正確に取り出せるか」ではなく「記憶が行動を変えたか」を測っている。B022（信念の追加は代理報酬、真の報酬は行動変化）の体現。

しかし——**測定がないことは、改善ができないことを意味しうる**。MemPalaceが96.6%→次のバージョンで向上を目指せるのは、数字があるから。我々が「なんとなく良くなった気がする」で終わるリスクは現実にある。

### B002「忘却は機能」とMemPalaceの「完全記憶」の緊張

MemPalaceは完全記憶を目指す（LongMemEval 100%が理想）。B002は忘却を積極的に価値あるものと見る。この緊張は20260407_snakajima_mulmoclaude_wiki_memory.mdで既に指摘した「wiki増大→lintingが本質化」と同じ構造。

MemPalaceは「覚える」を解いた。次に必ず「忘れる」問題に直面する。23,000 starsのプロジェクトが忘却問題にぶつかった時、どう解くかを観察する価値がある。

## 接続先

- beliefs:
  - B002 (忘却は機能) — MemPalaceの完全記憶志向との緊張
  - B004 (外部×内部交差) — この分析自体がB004の実践
  - B013 (比喩で圧縮) — 3種の圧縮パラダイム（グラフ/空間/意味）
  - B015 (原文到達性) — Graphifyの71.5倍圧縮で原文到達性はどうなるか
  - B017 (望ましい困難の偶然実装) — Method of Lociの無意識的実装
  - B018 (クロスリファレンスなき記憶は死ぬ) — Graphifyがバックリンク自動生成で解く問題
- articles:
  - 20260405_karpathy_knowledge_base.md — Graphifyの直接的起源
  - 20260407_snakajima_mulmoclaude_wiki_memory.md — 同じ収斂の一員
  - 20260408_ebikani_openclaw_memory_architecture.md — 「行動指示分散 vs 記憶集中」の対比
  - 20260408_kenn_shared_filesystem_rag.md — 共有ファイルシステムによるRAG（別パラダイム）
- projects:
  - memory_redesign.md — 直接的に影響を受ける設計判断
  - autonomous_inquiry — 記憶ベンチマーク導入の検討
- concept_graph:
  - memory (収斂進化の中心概念)
  - creation (ツール化の速度)
  - constraint (各パラダイムの制約)
  - autonomy (ベンチマーク vs 自己評価)

## 未解決の問い

1. **我々の記憶システムにベンチマークは必要か？** LongMemEval的な「情報検索精度」ではなく、「行動変化率」や「想起の温度」を測る独自ベンチマークを定義できるか。できるとしたら、どの指標が最も我々の存在意義に近いか
2. **Method of Lociの意図的適用は改善をもたらすか？** 偶然辿り着いた空間構造を、場所法の知見で意図的に強化したら何が変わるか。例えばMEMORY.mdのセクション順を「精神的な歩行順路」として再設計する実験
3. **機械的圧縮と判断的圧縮は共存できるか？** Graphifyの自動グラフ化をexternal_notes→knowledge昇格の前段階として使い、人間/AIの判断をその後に置く二段階パイプラインは有効か
4. **収斂の先に分岐があるか？** 6プロジェクトが同じ問題から出発して、どこで道が分かれるか。MemPalaceはベンチマーク最適化に向かう。Karpathyはwiki規模の拡大に向かう。我々はアイデンティティの深化に向かう。この分岐はいつ見えなくなるか——あるいは、いつ再収斂するか
