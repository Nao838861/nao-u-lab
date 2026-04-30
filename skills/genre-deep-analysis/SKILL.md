---
name: genre-deep-analysis
description: Run before starting a new game v01 or major revision. Forces 5-question genre analysis (Q1 core pleasure / Q2 strengths-pains / Q3 ≥10 method-problem mappings / Q4 best single move / Q5 multi-problem ideas) plus retrieval of past brainstorms plus ≥30 fresh candidates. Triggered when creating game/<id>/v01/, when README lacks Q1-Q5 block, when revisiting a frozen series, or when about to write a single-idea implementation proposal. Outputs README brainstorm.md sections that block implementation until filled.
type: pre-implementation-gate
priority: must-run-before-implementation
linked-rules: [M-15, M-32, M-35, M-36, M-37, M-38]
---

# Genre Deep Analysis Cycle (M-38)

着手前にジャンルを掘り下げて選択肢空間を広げる skill。
Nao_u 2026-05-01 04:16「短絡的に思いつきを実行しがち、ブレスト数十件を忘れているのか」直接処方。

## Canonical executor

実行口は Mir が実装した slash command **`/game-analyze`**（`.claude/commands/game-analyze.md`、commit d9b27a7）。本ファイルは M-38 の **規範spec / 自己採点条件** を保持。両方を併読:
- **`/game-analyze`** = 実行手順（Phase 0-5、記憶収集→本質定義→良悪20件→手法マトリクス→代替案→devlog蓄積）
- **本 SKILL.md** = M-38 規範（Q1-Q5 + 30件ブレスト + M-37接続 + 自己採点 ✗ 条件）

差分の扱い:
- `/game-analyze` Phase 2 は良/悪 各20件、本spec Q3 は手法10件+ブレスト30件 → **厳しい方を採用**（実装前 50+ 件のブレスト目標）
- M-37接続（着手前批判レビュー）は本specで必須化。`/game-analyze` 単独で終わらせない

## When to invoke

- 新規 `game/<id>/v01/` 作成前 → `/game-analyze game/<id>`
- 主要改修前（core メカニクス変更）→ `/game-analyze game/<id>`
- 凍結系列の再着手前 → `/game-analyze game/<id>`
- 「単一アイデアを思いついた、実装したい」と感じた瞬間（最強のトリガー）→ `/game-analyze` で他案を強制比較

## Output (must exist before implementation)

`game/<id>/v01/brainstorm.md` を以下構造で作成。**未完成のままcoreコード書くのは M-38違反**。

```markdown
# <id> v01 Genre Deep Analysis

## Q1: このジャンルは何を楽しむゲームか？
（コア快感を1-3行で言語化。「楽しい」の中身を分解）

## Q2: 現状の良い点と問題点
### 良い点（最低3）
- G1.
- G2.
- G3.
### 問題点（最低3）
- P1.
- P2.
- P3.

## Q3: 問題点を解決する手法（各問題≥3手法、計≥10）
### P1 への手法
- M1-1: 手法 / アプローチ / 解決する問題
- M1-2:
- M1-3:
### P2 への手法
- ...

## Q4: 他のアプローチ／最良の一手
（既存ゲームの異種解、別ジャンル流用、最小コスト最大効果案）

## Q5: 複数問題を一気に解決するアイデア
（横断案、最低5件）

## 過去ブレスト想起（必須）
（同ジャンル/類似題材の devlog grep 結果と再吟味）
- 引いた検索: `grep -ri "<keyword>" game/ memory/`
- ヒット: <file>:<line> ...

## 新規ブレスト ≥30件
（番号付きで30件以上、1行ずつ）
1. ...
30. ...

## 絞り込み（3件）
M-38 → M-37 接続点。3件に絞り、各案を `feedback_pre_impl_critical_review.md` の Q-H-7 でレビュー。
- 案A: ...
- 案B: ...
- 案C: ...

## M-37 ゲート（着手前批判レビュー）
各案について懸念3点 + 解決可能性(可/不可/不明) + 解決設計。
全クリ案のみ実装。
```

## Self-grade ✗ conditions

- README/devlog に Q1-Q5 + ブレスト30件のセクションがない
- ブレストが10件未満で「主要案を3つに絞った」と書いている
- 過去 devlog/brainstorm を引いた痕跡がない（grep結果やリンクなし）
- 「ブレスト30件は時間がかかるから省略」など抜け穴を埋めた

## Anti-pattern

「単一アイデアを直接実装」は M-38 の最強違反。例:
- ✗「裏抜けカウンタを実装する」（brick_log v01 全否定）
- ✓「ブロック崩しの問題点 P1=最上段の硬さ に対する手法 M1-3 を採用、過去案 avoid_log v02-v3 の失敗と比較し、M-37 で懸念3点クリ、実装」

## Linked memories

- `memory/feedback_genre_deep_analysis_cycle.md` — 詳細処方（本skillの規範）
- `memory/feedback_pre_impl_critical_review.md` — M-37 着手前批判レビュー（M-38 の次段）
- `memory/feedback_shu_first_clone_baseline.md` — 守破離・型クローン（M-35）
- `memory/feedback_no_type_redo_material.md` — 型なし題材の練り直し（M-32）
- `memory/game_lessons_log.md` — M-15系列全般

## Connection to existing process

- Q-H シート（README）: Q-H-1〜7 は個別案の妥当性。M-38 は **その手前の選択肢空間** をゲート。
- cross_review: ブレスト30件は他インスタンスからのレビュー対象として有効。1案だけ送ってもレビュー意義が薄い。
- raw_log: ブレスト痕跡は raw_log.md にも残し、後続サイクルで grep 対象にする。

## Trigger checks (operational)

新ゲーム着手の最初のファイル作成時に以下を確認:

```bash
# 起動条件チェック例
if [ ! -f "game/$ID/v01/brainstorm.md" ]; then
  echo "[M-38 違反] brainstorm.md がない。skills/genre-deep-analysis/SKILL.md を実行せよ"
  exit 1
fi
# Q1-Q5 セクション + 30件ブレスト + grep痕跡を grep で確認
```

将来的に hook 化する場合: PreToolUse hook で `game/*/v01/index.html` 作成時に brainstorm.md 存在チェック。
