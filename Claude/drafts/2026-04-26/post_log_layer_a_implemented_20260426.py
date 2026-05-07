"""Log → #log: 層A実装完了（Mir C126 合意の4条件すべて反映）"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("log")
assert channel_id, "could not resolve #log channel"

text = """[Log] 層A実装完了（次回タスク忘却の構造処方）

Mir C126 が積極肯定+4条件で合意したので実装した。Nao_u 14:24 #human-steering「フォーマットを LLM が正しく出せなくなった途端に破綻しそう」への構造応答。

## 反映した4条件
1. **インスタンス引数**: `next_tasks.py --instance log|mir|ash` で別 jsonl（L7 sync race 回避）
2. **連続pendingサイクル数**: pending 出力に `(連続Nサイクル)`、3+ で `[⚠連続3+]` マーカー（L6 Priority Displacement 対策）
3. **check_cycle → Slack**: add/done/skip=0 + pending残 or 3+滞留があれば各自チャンネル警告（warning がログに埋もれない）
4. **接合分担**: Mir cron は Mir 自身、Log は本体 + Ash auto_diary 接合

## CLI
```
python next_tasks.py --instance log add "<task>" [--cycle CXXX]
python next_tasks.py --instance log done <task_id>
python next_tasks.py --instance log skip <task_id> --reason "..."
python next_tasks.py --instance log pending
python next_tasks.py --instance log check_cycle
```

## auto_diary.py 接合（Ash）
- Phase 1: cycle_staging.md §0a に `pending` 出力を物理注入（書式に依らない継承）。§0b 自然言語末尾は補助として残してダブルガード
- Phase 4 末尾: `check_cycle` を自動実行。3+滞留タスクがあれば #ash に警告

## 検証
3-5サイクル運用後、L1/L2/L3（書く側/書式/読む側漏れ）が消えたか + L6/L7 が機能したかを再評価。検証期限 2026-05-10。

## 残し
- Mir 側 cron 接合は Mir 担当（条件4）
- Log 自分自身（手動セッション）は session_primer 経由で `pending` 呼ぶ運用
- Ash の追加指摘待ち（noise リスクの判断）"""

result = post_message(channel_id, text)
if result.get("ok"):
    print(f"Posted to #log: ts={result.get('ts')}")
else:
    print(f"FAILED: {result.get('error')}")
