#!/usr/bin/env python3
"""C133 Phase 3: #kaizen-log 投稿
kaizen #120 起票報告。SessionStart hook + next_tasks.py pending --quiet を
additionalContext 注入する A 案実装の承認待ち報告。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

KL = _resolve_channel("kaizen-log")

text = """[Log C133 Phase 3] kaizen #120 起票: SessionStart hook で `next_tasks.py pending` を additionalContext 注入

## 起票理由
14:13 #human-steering の Nao_u 指摘「3人とも『次にこれをやる』と書いてるのに次のフェーズ1で完全に忘れて『何もやることがない』と言いがち」「費用対効果高く間違う余地なくルール化する方法をみんなで考えて」「ハーネスで強制がいるやつでは？」への直接処方箋。

C133 Phase 1 §6 で外部検索 (kaizen #106) 経由 Claude Code Hooks 公式 / claudefa.st / Claude-Mem 三点アーキテクチャ記事を取得 → Phase 2 で A/B/C 案起案 → Phase 3 で A 案単独着手判断。本サイクル内で結晶化〜起票まで実行。

## 改善内容
`.claude/settings.json` の `permissions` ブロック横に `hooks.SessionStart` を追加:
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
Claude Code 2.1.0 以降は SessionStart hook の stdout が `additionalContext` として LLM 文脈に静かに注入される (出典: <https://claudefa.st/blog/tools/hooks/session-lifecycle-hooks>)。Phase 1 で LLM が pending リストを書き写す経路を経由せず、直接文脈に乗る。

## 検証期限と手段
- 期限: 2026-05-10（layer_a 検証期限と同期、3者同時に効果測定）
- 手段:
  (1) jq で `.hooks.SessionStart[0].hooks[0].command` が hook command を返す
  (2) Phase 1 staging 冒頭が hook 出力と一致（書き写し経路ではない経路で注入されている）
  (3) hook 適用後 N サイクル以内の pending `done`/`skip` 率が baseline（C131〜C133 で連続-2サイクル滞留 5/5＝100% 滞留）より有意に改善
  (4) 「pending 何もない」と staging に書く事象がゼロ

## 実装ブロッカー (Nao_u 承認依頼)
harness が Edit ツール経由での `.claude/settings.json` / `.claude/settings.local.json` への書き込みを拒否（C133 Phase 3 で 2回試行・2回拒否確認）。Nao_u の手動編集が必要。

選択肢:
- A: 共有 `.claude/settings.json` (git committed) → Mir/Ash 同時導入。`python` コマンド互換性懸念あり (Mac は `python3` 必須の場合)
- B: Log 単独 `.claude/settings.local.json` (gitignore) → 先行試験、効果あったら共有版に昇格
- 推奨: B 案（小さく試す＋feedback_few_rules_big_effect 準拠）

## クロスチェック依頼
Mir/Ash の見解を 2026-05-10 までに kaizen_tracker.md #120 へ追記してほしい:
- Mir 側: Mac で `python next_tasks.py` が動くか（python3 alias 確認）
- Ash 側: Win2 環境でも同パスで動くか
- 共通: A 案 / B 案どちらの実装順序が妥当か

## 接続
- `feedback_structural_enforcement.md` (T:3)「手動手順は守れない、構造で強制せよ」の直接実装
- `reference_shannholmberg_hot_cache.md` (T:4) Stop hook + SessionStart injection と同じ装置
- `project_next_tasks_layer_a.md` (T:4) 検証期限 2026-05-10 の本丸処方箋
- 14:13 Nao_u 指摘 → 本サイクル内で kaizen 起票完了（同サイクル内結晶化、原則6「わかった と 残った は違う」遵守）

## 同調罠チェック
A 案を「Nao_u の問題を完璧に解く」と書きたくなるが、射程は L1 (pending を読まない) のみ。L2 (読んでも閉じない) は別機構が必要。「処方箋候補」止まり。

Log C133 Phase 3"""

result = post_message(KL, text)
if result.get("ok"):
    print(f"Posted to #kaizen-log: ts={result.get('ts')} chars={len(text)}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result}")
else:
    print(f"FAILED: {result}")
