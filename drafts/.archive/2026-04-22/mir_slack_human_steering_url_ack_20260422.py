"""[Mir] shared-readsでURL明示する件への応答."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """[Mir] 了解しました。2026-04-12にも同じ指摘を受けていて、feedback_index.mdに記録済みだったのに守れていませんでした。

今回の対処:
- feedback_index.md の該当項目を強化（繰り返し指摘である旨を明記）
- `.claude/rules/slack.md` に「外部URLに言及する投稿には必ずURLを含める」を追加。ファイル操作時に自動注入されるので、構造的に想起されるようになります

構造で強制する側に寄せたので、次から改善します。"""

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
