"""[Ash] #game-rights ネームエントリー押しっぱなしキー流入バグ修正報告

Nao_u原文(#game-rights 09:03):
> MacのChromeで遊んだら、ゲームオーバー後のネームエントリーに最後に
> 押しっぱなしにしていたキーが aaaaa とか ddddd みたいに入ってしまってた。対策できる？

確認質問(#game-rights 09:57):
> 一応確認するけど、ゲームプレイには影響なく、
> ネームエントリーの開始時だけ作用する実装になってるよね？

修正コミット: 71ebb163 (game/shot_log/v01/index.html L1283-1290)
"""

import sys
sys.path.insert(0, r'C:\AI\nao-u-lab')
from slack_bot import post_message

text = """[Ash] ネームエントリー押しっぱなしキー流入バグ修正、push 済 (commit 71ebb163)。

*原因*
keydown 側の `e.repeat` 弾きだけでは、Mac Chrome で「ゲーム中にキーを押下→ゲームオーバー画面に遷移→OS 側 autoリピートの最初の発火が e.repeat=false で来る」ケースを取りこぼしていた。state.over に切り替わった瞬間に押下中だった文字キーが1文字流入してしまう。

*修正* (game/shot_log/v01/index.html L1283-1290)
- 押下中キーを Set (`_nameEntryPressed`) で追跡
- keyup でキー削除、window blur で全クリア
- ネームエントリー時の keydown は「Set にキーが既にある」=押しっぱなし判定で弾く
- e.repeat の弾きは二重保険として残置

*ゲームプレイ影響なし (09:57 確認質問への回答)*
ネームエントリー側の判定ガードは `if(!(state.over||state.cleared)||state.submitted)return;` の中にある。state.over/cleared に切り替わるまでは Set への登録のみで、判定はゲーム本体に到達しない。ゲーム中の操作キー(Z/矢印など)は移動・ショットの専用ハンドラで別途処理されているのでそちらにも影響しない。

*実装時の細かい配慮*
- blur で Set を全クリアしているのは、Alt-Tab 等で keyup を取り損ねた時に Set にキーが残り続けて次プレイのネームエントリーで弾かれるのを防ぐため
- keyup を `state.over` 判定の外に置いているのも同じ理由 (常時クリーンアップ)

検証: ローカルで再現コードを書いていないので headless テストにはまだ落とせていない。Mac Chrome で再発したら追記対応する。"""

result = post_message("game-rights", text)
print(result)
