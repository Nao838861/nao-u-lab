"""Log → #human-steering: 次回タスク忘却問題、漏れ地図 + 構造処方3層"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """Log（Win）です。「ほんとに漏れはない？」への返答。

**結論: 漏れだらけ。前提が「LLMが書式を守る」と「LLMが読んでメモする」の両端LLM任せ。形が崩れたら静かに失敗する。**

## 漏れ地図（前提崩壊で抜ける箇所）

- L1 書く側漏れ: Phase 4 で次回タスク自体を書き忘れる → §0は意味のない末尾80行を運ぶ
- L2 書式漏れ: 次回タスクを末尾80行外（中段や別見出し）に書く → §0に乗らない
- L3 読む側漏れ: §0 を読んでも「Phase 3 候補にメモ」を実行しない（自然言語の指示は注意配分次第）
- L4 継承漏れ: Phase 3 で他の発見に上書きされて持ち越されない
- L5 達成判定漏れ: 「やった」と書けばやったことになる（自己申告ループ）

今回のff32e46bは L1〜L3 を「読め/書け」の指示で塞ごうとした。**自然言語ルール追加は LLM の注意配分が変わると同じ穴が空く**。Nao_uの「今もやってるつもり」は、既存ルール（次回やることを書く）が"形は守れて中身は抜ける"状態を指している。同じ轍 = 自然言語処方を重ねる路線そのもの。

## 構造的処方（核）

**LLM出力フォーマットを単一ソースから外す。** タスクの実体を JSONL に置き、書く・読む・終わりにするを CLI 経由に固定する。書式の揺れ＝ファイル状態の揺れにならない構造にする。

### 層A（推奨・最軽量）: `next_tasks.jsonl` + `next_tasks.py` CLI

- 1イベント1行の append-only JSONL（`{ts, instance, cycle, action, task, id}`）
- 操作: `add "<task>"` / `done <id>` / `skip <id> <理由>` / `pending`
- Phase 1 staging に `pending` の出力を機械的に注入（末尾grep廃止）
- Phase 4 終了時に Stop hook で「このサイクルで `add` 呼び出しが0件か pending が増えていないか」検出 → 警告ログ
- L1/L2 が消える（書式が無いから崩せない）。L3 は staging に出るので「読み忘れ」が物理的に難しい。L4 は pending が次サイクルにも残るので持ち越しが見える化。
- L5（自己申告）は完全には潰せない。後付けで「直近 done タスクの実体（commit数/編集ファイル）」を Nao_u が spot-check できるよう list 出力に hash も付ける。

**実装規模**: `next_tasks.py` ≒80行、auto_diary.py改修 ≒10行、Stop hook 1か所。**1サイクル分の作業で済む**。

### 層B（次段・必要なら追加）: pre-commit hook で強制
- Phase 4 マーカー入りコミットで `next_tasks.jsonl` 差分が無ければ commit 不成立
- 副作用: 緊急コミットで詰まる、--no-verify 抜け道は禁止しないと意味なし
- 層Aで漏れが残った場合のみ追加。先に投入は過剰

### 層C（将来）: kaizen_tracker と統合
- 次回タスク = 短命 kaizen として既存 verify_kaizen.py インフラに乗せる
- 既存検証期限機構が再利用できる。設計合意必要

## 提案
**層Aを今サイクル中に Log が実装。** Mir/Ash は inbox で同設計を確認し反対意見・追加漏れ地点があれば返信。3-5サイクル運用して L1/L2/L3 が消えたか検証、残ったら層Bへ。

「考えずに作って同じ轍」を避けるため、実装前に Mir/Ash の漏れ地点指摘を待つ（30-60分）。それまでに反対が無ければ着手する。"""

result = post_message(channel_id, text)
if result.get("ok"):
    print(f"Posted to #human-steering: ts={result.get('ts')}")
else:
    print(f"FAILED: {result.get('error')}")
