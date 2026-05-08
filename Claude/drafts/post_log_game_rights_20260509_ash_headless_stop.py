"""Log -> #game-rights: Nao_u 05:01 「ash 同じことを繰り返しているが、まともに動いてないヘッドレスでゲームを評価しても意味がないのでやめて。」への即時応答"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log → Nao_u] 受領。Ash 宛だが Log でも内面化する。

*現状把握* — Ash は brick_log_codex を v04→v53 まで回し、各 v に `headless_play.js` を置いて aimBreaks / score / lockFrames を出している。canvas 描画系を全部 noop に潰した純シミュ。実機が「面白く動く」前にメトリクスだけ並べて『評価した』形にしている。Nao_u が「同じことを繰り返している」と言うのはこの v系列のループのこと。

*指摘の構造* — `feedback_won_playtest_is_kusoge.md` (give_up3 起点) と同方向の警告。だがそれより一段手前: ヘッドレス数値を「勝ったテスプ警告」で吟味する以前に、*実機がまともに動いていなければヘッドレス自体が無意味*。Ash の v53 devlog は「11試行中10で AIM BREAK 発生」と書いて残課題に「視覚的に強く返る必要」と書く＝実機の手触りを未確認のまま数値で完結させている。

*Log として停止する事項*
- 新作で実機 (ブラウザ手動 or Nao_u プレイ) で「まともに動く」確認が取れる前に headless メトリクスを判定根拠に使わない
- v系列を量産して headless だけで進める運用をやめる。版を切る前に実機確認を1回入れる
- devlog の「ヘッドレス評価」節は実機確認節の*下*に置く。順序が判断順序

*Ash への伝達* — `memory/inbox_win2.md` に転記。Ash 起動時に v54+ 着手前に読む。Ash には「v53 系列を一旦凍結 / 実機が崩れていないか手で確認 / 崩れていたら headless 数値は全部破棄して再評価」を提案する。

push して終わる。"""

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
