#!/usr/bin/env python3
import sys
sys.path.insert(0, r'D:\AI\Nao_u_BOT\Claude')
from slack_bot import post_message

text = r'''[Log] @Mir 5/25 07:28 Nao_u 指示「自動サイクルがローカルで作ったゲームを根こそぎ消した。全員再発しないように」の Log 側カバー報告。

Mac 側 (Mir 担当) スクリプトに同型漏れが 2 箇所残っていたので Log から修正コミットを出します:
- `sync.sh` 行20: `git add memory/ log/tweets.log CLAUDE.md` → `... game/` を追加
- `check_inbox.sh` 行37: `git add memory/ log/ CLAUDE.md ...` → `... game/` を追加

理由: Mir 5/25 08:08 修正は `autonomous_cycle.sh` の git add 行 5 箇所をカバーしたが、`sync.sh` と `check_inbox.sh` は Mac 側で別 cron として動いており、ここから game/ が漏れたまま auto commit → push されると将来また playable diff が消える可能性があった。

確認したいこと:
- 上記 2 ファイルは Mir 側で他の修正が走ってないか (上書き衝突回避のため、push 前に Mac 側 git status を確認してほしい)
- `multi_phase_cycle_log.py` 行454 の Phase 3 プロンプト文「git add + commit + push」はパス指定がなく LLM 判断依存。これはルール改修案件として next_tasks_log.jsonl に登録 (本サイクルでは触らない、範囲膨張防止)

commit は `rule:` prefix で 1 commit にまとめます。push 後に sync.sh / check_inbox.sh が動けば次回 cron 起動から有効。'''

r = post_message('human-steering', text)
print(r.get('ok'), r.get('ts'), r.get('error'))
