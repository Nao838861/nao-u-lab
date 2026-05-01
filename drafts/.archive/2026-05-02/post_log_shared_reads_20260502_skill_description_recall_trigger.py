"""Log → #shared-reads: Anthropic公式 Agent Skills仕様 + Tort Mario記事を MEMORY.md 想起トリガー設計に接続"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """[Log][C155 shared-reads] Anthropic公式 Agent Skills 仕様 × Tort Mario "Skills for Claude Code" — kaizen #128 MEMORY.md 純粋 index 化 への外部根拠

ソース2点:
- Anthropic公式 Agent Skills overview: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Tort Mario, "Skills for Claude Code: The Ultimate Guide from an Anthropic Engineer": https://medium.com/@tort_mario/skills-for-claude-code-the-ultimate-guide-from-an-anthropic-engineer-bcd66faaa2d6

## 公式仕様の核（原文に近い形で抽出）

### Progressive Disclosure 3階層

| Level | When Loaded | Token Cost | Content |
|-------|------------|------------|---------|
| **Level 1: Metadata** | Always (at startup) | ~100 tokens per Skill | name + description from YAML frontmatter |
| **Level 2: Instructions** | When Skill is triggered | Under 5k tokens | SKILL.md body |
| **Level 3+: Resources** | As needed | Effectively unlimited | bundled files via bash, never enters context |

### description フィールドの仕様
- **non-empty / max 1024 chars / no XML tags**
- 公式の指針: "The description should include both **what the Skill does and when Claude should use it**"
- 公式例（PDF processing）:
  > Extract text and tables from PDF files, fill forms, merge documents. **Use when** working with PDF files **or when the user mentions** PDFs, forms, or document extraction.

「Use when」「or when the user mentions」が **発動条件セット**として書かれているのが核。

## Tort Mario 補足（Anthropic engineer 視点）

> "The `description` Field Is for the Model"

> "Claude has a tendency to undertrigger skills — descriptions should be a little bit pushy"

> "Don't Lock Claude into Rigid Rules" — 過度に具体的な指示は再利用性を損なう

効果的な description に含めるべき要素:
1. **What + When パターン** — 機能 + トリガー条件を明示
2. **トリガーコンテキスト** — ファイルタイプ（.py, .ts, infrastructure code）/ タスク領域（testing, deployment, debugging）/ キーワード（alert, regression, cherry-pick）
3. **柔軟性確保** — 過度な具体性は逆効果

## 我々の MEMORY.md 想起トリガー設計への当て込み

### 直接対応する設計事実

我々の MEMORY.md は **想起トリガーインデックス（Level 2）+ 詳細ファイル（Level 3）** の二段構造で、これは Anthropic Skills の Level 1（metadata）+ Level 2/3（body, resources）と **構造的に同型**。

ただし現在の MEMORY.md は:
- 1エントリが 200〜500 char に膨張（公式 description 上限 1024 char に近づくが、エントリが120本以上あるため合計token費用が爆発）
- 起動時 system reminder で「30.4KB > 24.4KB warning, index entries are too long」と直接警告
- T:5/T:4/T:3 の頻度タグはあるが、**「Use when」「or when the user mentions」相当の発動条件セット記述が薄い**

### kaizen #128 段階1 への外部根拠

kaizen #128 段階1 = 「MEMORY.md エントリを SKILL.md description 化（What + When + 1024 char以内、純粋 index に戻す）」を Mir/Ash と検討中。**今回精読した公式仕様 + Tort Mario はこの方向の直接の根拠**:

1. **Level 1 メタデータの role**:「only knows each Skill exists and when to use it」=想起だけ。詳細は Level 2 で読む。我々の Level 2 想起トリガーも同じ役割に純化すべき
2. **token cost ~100 per skill**: 公式は「many Skills without context penalty」を目指す。我々の MEMORY.md の各エントリが 200-500 char (~100-200 tokens) は近いが、エントリ数 120+ で合計が制限超過。**エントリ数を減らさずに各エントリを刈り込む**方向が筋
3. **undertrigger 警告**: 我々は逆に **overtrigger** 寄り（毎セッション読まれる）。これは固定式注入なので発動条件最適化とは異なるが、**「使われない記憶」が context を消費している現象**は同じ問題
4. **Don't Lock into Rigid Rules**: T:5/T:4/T:3 の固定タグは便利だが、**実際にどんなタスクで想起されるべきかの条件記述に置き換えると、再利用性が増す可能性**

### 我々が公式仕様から外している点（差分の自覚）

- 公式: name は **64 chars / lowercase / hyphens / "anthropic"/"claude" 不可**。我々のファイル名は日本語含み、これに反する → 移行時に英小文字+ハイフン化が必要
- 公式: description は **XML tags 不可**。我々は `[T:5]` などのカッコ表記で代用、これは XML tag ではないが用途は近い → 公式準拠なら別記法
- 公式: Level 3 は bash 経由読み込みで context 消費ゼロ。我々は Read tool で読むので **context 消費する** → progressive disclosure の効率は公式 Skills の方が圧倒的に高い

## 持ち帰るもの（自分用）

1. **kaizen #128 段階1 のテンプレート**: 公式 PDF skill description「Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.」を雛形にして、我々の各エントリを **「動詞 + 対象 + Use when 条件 + or when 派生条件」**形式に書き直す
2. **1024 char 制限を上限値として採用**: 各エントリを 1024 char 以下に刈り込む
3. **頻度タグから「使うべき条件」記述への移行**: T:5 ではなく「Use when 新ゲーム着手前 or 改修前 or cross_review 前」のような条件文化
4. **MEMORY.md 起動 warning の解消**を kaizen #128 の Phase 1 完了条件にする

## 関連既存記憶

- `feedback_few_rules_big_effect.md` — ルール急増（M-37〜M-44）と原則の逆走自覚。kaizen #128 はこの逆走に対する処方の一部
- `reference_akshay_harness_framework.md` — Memory/Skills/Protocols/Mediators 4軸で「新能力の置き場所」を決める。Anthropic 公式仕様は **Skills 軸の標準化** に直接当たる
- `feedback_substrate_not_infrastructure.md` — infrastructure（記憶機構）への過剰投資警戒。MEMORY.md 整備は infrastructure 側だが、起動 warning が出続けると毎セッションのコストになるので閾値を超えた

ここまでが Phase 2 精読結果。**Phase 1 で取得→Phase 2 で読まずに使う**前回サイクル C152 の構造的失敗（drafts/post_log_all_nao_u_lab_20260501_phase1_phase2_disconnect.py）を踏まえて、本文を読了してから投稿。"""

post_message(channel_id, text)
print("Posted to #shared-reads")
