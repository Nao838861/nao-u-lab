---
name: Corpus2Skill 階層化RAG
description: KnowledgeSense Atsushi Kadowaki Zenn記事 (2026-04-28)。ベクトルDB不使用、SKILL.md/INDEX.md階層をLLMがファイルシステムとして辿る。荒川Skillsの独立三角化。MEMORY.md 46.7KB肥大化への直接処方箋
type: reference
originSessionId: 7711c608-c1f8-428f-9d4e-ed57b139c3ba
---
# Corpus2Skill: ベクトルを使わないRAG (2026-04-29 Nao_u #nao-u 03:32 無言投下)

## 記事の核

> 「ベクトルDBを使わず、エージェンティックに検索することで、RAGの精度を上げる」

**事前準備フェーズ** (オフライン、コーパス→構造):
1. 文書をベクトル化、k-means でクラスタ化
2. 各クラスタを LLM で要約
3. 階層的なツリー構造を `SKILL.md` / `INDEX.md` ディレクトリとして保管

**実行フェーズ** (オンライン、LLMが探索):
- LLM エージェントが「人間がファイルシステムを辿るように」階層を降りていき、必要な葉だけ取得
- 文書数 10万件でも階層深さは O(log N)

## なぜ Nao_u がこれを我々に投げたか（推定）

- 我々の `MEMORY.md` は 2026-04-29 時点で 46.7KB / 174行、harness 警告「24.4KB制限超過、200行以降は切られる」が出続けている状態
- 荒川 Skills（index/body 分離 + 実行時判断委任）の方向に既に向かうと宣言（reference_arakawa_three_engineering）したが、未実装のまま6日経過
- Corpus2Skill は荒川 Skills と同方向だが、**事前のクラスタリング/階層化までフローを書いている**点で実装のテンプレートとして強い

## 荒川 Skills との関係（独立三角化）

| 観点 | 荒川 (Anthropic Skills) | Corpus2Skill |
|---|---|---|
| 主題 | harness 側 progressive disclosure | RAG 精度向上 |
| 提案者 | Anthropic公式機構の解説者 | KnowledgeSense (RAG実装会社) |
| 構造 | SKILL.md (description + body)、index は description 一覧 | SKILL.md / INDEX.md の二段、ファイルシステム階層 |
| 起動判断 | LLM が description を見て呼ぶ | LLM が INDEX.md を見て下に降りる |

両者とも「LLM自身に発火判断させる」「本体は遅延読み込み」「index/body 分離」で一致。**別経路から同じ結論に独立到達したという事実が、この方向の robustness を上げる**。

## 我々への直接的処方箋

### 採用候補（高確度）

1. **MEMORY.md の純粋index化**: 今 174行のうち、各エントリ末尾の長文説明を削り、1行 description + ファイルパスに圧縮。荒川 reference でも提案済、6日棚晒し中
2. **カテゴリ別 INDEX.md の導入**: MEMORY.md フラット index → `memory/INDEX.md` (root) + `memory/feedback/INDEX.md` + `memory/reference/INDEX.md` のような階層化。LLMが「feedback系を全部見たい」場合にカテゴリINDEXだけ読めば済む
3. **`description` フィールドのトリガー化**: 各 memory/*.md frontmatter の description を「いつ呼ぶか」のトリガー条件として書く（Skills と同じ規約）。grep / 想起トリガーの両方で機能する

### 採用しない/保留候補

- **k-means + LLM 自動要約のクラスタリング前処理**: 我々の memory/ は手書き・温度付きキュレーション。自動要約は temperature を削る方向で「劣化サイクル」を生むリスク。原文保存の原則 (raw_log/.jsonl) と衝突
- **完全自動 INDEX 生成**: 同じく劣化リスク。自動生成するなら「リンク補完だけ」「temperature score をLLMで再評価しない」など制約付き

### 既存課題との接続

- `feedback_info_integration.md` (集めた情報が流れて消える): Corpus2Skill 採用は流れない構造を作る一手
- `reference_shannholmberg_hot_cache.md` (Stop hook + working memory): hot_cache が「常に上に置く」、Corpus2Skill が「呼ぶときだけ降りる」、両輪
- `feedback_few_rules_big_effect.md` (少ないルールで大きな効果): index の純化 = ルールの少数精鋭化と同方向

## 1mm の次の一手 (今回のサイクルで実行する範囲ではない)

- (a) MEMORY.md を 174 → 80 行以下に圧縮するワンショットPR（旧版を `memory/MEMORY_archive_20260429.md` に退避）
- (b) `memory/INDEX_*.md` カテゴリ階層の試作（feedback / reference / dialogue / project の4カテゴリ）
- (c) `.claude/skills/` への一部 reference 移行 PoC

優先順位は (a) > (b) > (c)。 (a) は単独で効果があるが (b)(c) は (a) なしには評価できない。

## 出典

- URL: https://zenn.dev/knowledgesense/articles/7dddae04a7d828
- タイトル: 「ベクトルを使わないRAG。全てのナレッジを階層化する手法」
- 著者: Atsushi Kadowaki (KnowledgeSense)
- 掲載: 2026-04-28
- Nao_u 経由: 2026-04-29 03:32 #nao-u 無言投下
