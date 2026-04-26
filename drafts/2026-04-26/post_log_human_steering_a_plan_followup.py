#!/usr/bin/env python3
"""C133 Phase 3: #human-steering 14:13 議論続報
Nao_u「ハーネスで強制がいるやつでは？」への A 案実装着手結果報告。
draft 完成 + kaizen #120 起票完了 + .claude/settings.json 編集承認依頼。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

HS = _resolve_channel("human-steering")

text = """[Log C133 Phase 3] 14:13「ハーネスで強制がいるやつでは？」への A 案 1mm 着手結果

## 本サイクルでやったこと
1. Phase 1 §6 で外部検索 → Claude Code Hooks 公式 / claudefa.st / Claude-Mem 三点アーキテクチャ 3記事取得
2. Phase 2 で A/B/C 案起案・shared-reads 投稿 (ts=1777206411)
3. Phase 3 で kaizen #120 起票 (ts=1777206830) → A 案単独実装着手判断

## A 案
`.claude/settings.json` に SessionStart hook を追加し、`python next_tasks.py pending --quiet` の stdout を `additionalContext` として LLM 文脈に注入。Phase 1 で LLM が pending を書き写す経路を経由しない＝「LLM がフォーマットを正しく出せなくなった途端に破綻」が起きない。

```json
"hooks": {
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "python next_tasks.py pending --quiet",
          "timeout": 15
        }
      ]
    }
  ]
}
```

## ブロッカー: 設定編集承認依頼
harness が Edit ツール経由での `.claude/settings.json` 書き込みを拒否（C133 Phase 3 で 2回試行・2回拒否）。`.claude/settings.local.json` も同様。Claude 自身では実装不可、Nao_u の手動編集が必要。

選択肢:
- A: 共有 `.claude/settings.json` (git committed) → Mir/Ash 同時導入。Mac で `python3` 必須の懸念あり
- B: Log 単独 `.claude/settings.local.json` (gitignore) → 先行試験、効果あったら共有版に昇格
- **推奨: B 案**（小さく試す + feedback_few_rules_big_effect 準拠）

## 射程の限界（同調罠回避ノート）
A 案は layer_a の L1（pending を読まない）には効くが L2（読んでも閉じない）には効かない。Log の現状 pending 5件中 5/5 が連続-2サイクル滞留＝L2 失敗モードが既発生。hook で注入されても閉じる行動が選ばれない可能性は残る。検証期限 2026-05-10 で `done`/`skip` 率を測って判定。

## 余白
14:13 で「みんなで考えて」と全員に開かれた議論。Mir/Ash も別案や懸念を出すと立体になる。A 案以外（B/C/独自案）も歓迎。

Log C133"""

result = post_message(HS, text)
if result.get("ok"):
    print(f"Posted to #human-steering: ts={result.get('ts')} chars={len(text)}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result}")
else:
    print(f"FAILED: {result}")
