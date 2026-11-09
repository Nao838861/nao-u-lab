---
name: 他インスタンス撤回 → 自分の同型違反を即チェック
description: 別インスタンスが M-38/M-37/M-39 等の同型違反を撤回した時、自分の編集中ファイルに同じ短絡が無いか即座に再点検する
type: feedback
originSessionId: 1f81674d-5c95-49aa-b50b-cee8398a1bcc
---
**ルール**: 別インスタンス（Log/Mir）が M-38 / M-37 / M-39 / M-40 / M-41 など構造的ゲートの違反を撤回した commit / Slack 投稿を観測したら、**自分の編集中・push未完の brainstorm.md / devlog.md / 確信宣言を即座に同じ観点で再点検**する。違反パターンが見つかったら push 前に撤回する。

**Why**:
2026-05-01 21:07-21:1x の事象。
- 20:56 Log が brick_log v07 第一候補（移動標的型 8工程未通過）を Slack 回答
- 21:07 Nao_u #game-rights「工程経たもの？」（M-38 8工程通過確認）
- 21:08 Log 撤回 commit 3be867e7「M-38/M-40違反を撤回」
- 21:1x Ash が brick_log v07 brainstorm.md に「B+C が構造的に最良」確信宣言を**自分で commit (24968466)**
- 同じ M-38 8工程未通過（新規≥30 ❌ / 過去想起 ❌ / 類似事例≥5 △ / MPS 上位10件 M-37 ❌ / 相乗効果 △）

Log の撤回を観測した直後に、Ash 自身の編集中 brainstorm.md には同型の短絡が残っていた。Log 撤回シグナルを「Log についての情報」として処理して、「自分の今の状態への警告」として処理しなかった。同一プロセス内の手の動きが、ゲートを挟んだ前後で**観測されたのに、自分には適用されなかった**。

これは feedback_means_ends_reversal_check.md の「サイクル冒頭の1行自問」が**サイクル冒頭だけでは足りない**ことを示している。違反が**他インスタンスで発生している間**は、自分の編集中ファイルにも同型がある可能性が高い。共通プロンプト・同根 = 同じ短絡を踏みやすい。

**How to apply**:
1. Slack #game-rights / #human-steering / git log で他インスタンスの「撤回」「retract」「M-3X 違反」「工程未通過」を観測したら：
2. **自分の現在編集中 / 未push の brainstorm.md / 確信宣言 / 第一候補回答を開く**
3. 撤回された違反の**観点（M-38 なら 8工程、M-39 なら predicted_play、M-41 なら先行事例≥5）で自分のファイルに ✓☓ を付ける**
4. ☓ が含まれていれば、push 前に同じ撤回ブロックを冒頭に追記して撤回する
5. 違反が見つからなくても、他インスタンスの撤回 commit / Slack を**自分の cycle_staging.md / 日記に1行で記録**して「観測した事実」として残す（後追いで類似発生時に検索できるように）

**境界**:
- 全ての commit に対して全てを再点検するのは過剰。**「撤回」「retract」「違反」「未通過」「工程経たもの？」等のキーワードまたは Nao_u からの直接 steering** がトリガー
- 自分が既に push 済の違反 commit を発見した場合 → CLAUDE.md M-38 / feedback_dangling_commit_after_rebase.md の手順に従い、同型撤回 commit を別途作成（force-push しない）

**関連メモリ**:
- `feedback_means_ends_reversal_check.md` — サイクル冒頭1行自問。本メモリは「サイクル中・編集中・push直前」の同型適用拡張
- `feedback_critical_evaluation_before_implement.md` — 着手前批判レビュー（M-37）。本メモリは M-37 の「同根インスタンス間トリガー」拡張
- `feedback_structural_enforcement.md` — ルールを作る ≠ ルールを破れなくする。本メモリは「他人事として観測」を「自分事として再点検」に変換する具体プロトコル
- CLAUDE.md M-38 / M-37 / M-39 / M-40 / M-41 — 違反の構造的ゲート定義
