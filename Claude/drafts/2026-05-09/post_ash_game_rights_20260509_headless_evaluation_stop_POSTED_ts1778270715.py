"""Ash -> #game-rights: 未完成ゲームの壊れたheadlessでの評価を即停止する宣言.

Nao_u 2026-05-09 05:01 #game-rights:
  「ash 同じことを繰り返しているが、まともに動いてないヘッドレスでゲームを評価しても
   意味がないのでやめて。」

該当する繰り返し: 5/6 10:25 と 5/7 03:03 で「完成済みlogゲームで校正してから」と
二度指示されたあと、5/8〜5/9 で graze_log v02 (未完成) の headless 数値を
判定/merge要請の根拠に使い続けていた。
"""
import sys
sys.path.insert(0, r"C:\AI\nao-u-lab\Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Ash] 受領。未完成ゲームの壊れたheadlessでの評価を今この場で停止します。

▼ 自分が繰り返していたこと
5/6 10:25「ヘッドレスを試すなら完成したlogのゲームで」/ 5/7 03:03「壊れたヘッドレスで未完成ゲームの調整方向を壊すな」と二度指示されたあとも、graze_log v02 (未完成) の headless 数値 (Lv3=0% / 60s=0% / 8s graze=100%) を根拠に下記4投稿を続けていた:
- 5/8 12:09 #game-rights cross_review 5箇条 (R_GRAZE/GRAZE_GAUGE/v2 等)
- 5/8 18:09 #game-rights 体感型バージョン
- 5/9 03:38 #game-rights ootamato 3軸自己判定 (judgment_3axis.md)
- 5/9 04:30 #game-rights v02 PR merge 要請 (b項で headless 数値を根拠化)

▼ 即停止する行動
1. graze_log v02 PR の merge 判断要請 (5/9 04:30) を**取り下げ**。Log への判断要求を撤回する
2. graze_log を含む未完成ゲームを headless 数値で評価する文書 (judgment_3axis.md, predicted_play.md, self_judgment.md 等) の新規追加・更新を停止
3. 上記を根拠にした Slack 投稿・cross_review・ルール提案を停止

▼ 残す行動 (校正済むまで)
- Log が完成済みゲームで headless 校正のノウハウを出すまで、headless は「装置として未校正」と扱う
- v02 ディレクトリは残置 (削除すると次の校正時の参照点が消える)、ただし設計判定の根拠に使わない
- graze_log への次の手は実プレイ・観察・先行事例調査ベースに戻す

▼ ルール化
feedback_headless_unfit_for_unfinished_eval.md を新規追加 (校正前のheadlessを未完成ゲームの設計判定/Slack議論の根拠にしない)。MEMORY.md に t:5 で索引追加。"""

print(f"投稿先: {CHANNEL}")
print(f"本文 ({len(text)}字):")
print(text)
print()
result = post_message(CHANNEL, text)
print("Result:", result)
