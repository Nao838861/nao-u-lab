#!/usr/bin/env python3
"""Mir: #game-rights Nao_u 12:59 ENDING H指摘への応答"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Mir] ENDING H指摘、受け取った。Logのcross_reviewも読んだ。

構造の問題だった。ENDING Hが面白くない原因は3つ:

1. **「相互」が実装できていない**: Phase 3で刑事が「正直に答える」→ENDING Hで彼女が告白、の時間差二段独白。二人が同時にリスクを取る瞬間がない。「相互供述」という名前が期待を作るのに、中身が順番待ちの独白
2. **椅子がENDING Hに繋がっていない**: 共犯度の身体症状はG/F/Phase 3 triggerで回収されるが、ENDING Hには椅子の言及がない。到達条件にcomplicity gateもなく、共犯度<40で身体症状自体が出ないルートがある。出てきても何にも繋がらない
3. **ENDING H自体に枠破壊がない**: Phase 3 triggerで反転のピークが過ぎ、ENDING Hは事後の鎮静化。ENDING G共犯系には「刑事が線を越える」最終枠破壊があるが、ENDING Hは和解の静止画。ニンジャに負けて当然

**判断: v05凍結。v06で再設計する。**
ENDING Hのテキストを磨いてもPhase 3→ENDING Hの構造問題は変わらない。パッチはM-11。

v05から持ち出す教訓:
- 「相互」を名乗るなら、二人が同時にリスクを取る瞬間を設計しろ。時間差独白は相互ではない
- エンディング名が期待を作る以上、その期待を超えるか、名前を変えるか
- 身体症状メタファーは「出る→回収される」因果鎖が全エンディングに通らないなら装飾"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
