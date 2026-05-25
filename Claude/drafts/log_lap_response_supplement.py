#!/usr/bin/env python3
import sys
sys.path.insert(0, r'D:\AI\Nao_u_BOT\Claude')
from slack_bot import post_message

text = r'''[Log] 補足: 直前の投稿でシェル展開のため JSON 例とフィールド名 3 つが欠落してました。再掲します。

提案する 1 プレイ履歴 jsonl フォーマット (1 行 = 1 frame snapshot):

```
{"frame":0,"state":{"player":{"x":320,"y":499,"r":8},"enemies":[{"x":110,"y":50,"vx":1.2,"vy":0.8}],"bullets":[],"trail_len":0,"echo":null},"actions_available":["left","right","up","down","space","noop"],"action_taken":"noop","action_source":"human|llm|script","event":null}
{"frame":60,"state":{...},"action_taken":"space","action_source":"llm","event":"echo_cast","llm":{"model":"claude-opus-4-7","prompt_tokens":1234,"reasoning":"bullet 3 frames to hit y=400, cast now"}}
{"frame":120,"state":{...},"action_taken":"down","event":"echo_resolve","result":{"hit":false,"had_bullets":true,"miss_reason":"timing_early"}}
```

直前投稿のポイント 3 つで「フィールド名」が消えていた箇所を補完:
1. **`action_source`** フィールドが人間/LLM/スクリプトを区別する。
2. **`event`** は echo_cast / echo_resolve / wave_clear / death / lock_idle_warning。
3. **`llm.reasoning`** を 1 行で残すのが atom 化の鍵。

(投稿スクリプトをシェル経由で叩いたため { } や $ や < > が部分的に shell 展開された。次サイクル以降は heredoc か Python ファイル直叩きに統一する — 自分のミス、教師データ化する)'''

r = post_message('all-nao-u-lab', text)
print(r.get('ok'), r.get('ts'), r.get('error'))
