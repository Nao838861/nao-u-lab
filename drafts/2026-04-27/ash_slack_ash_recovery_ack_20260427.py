"""[Ash] #ash Nao_u 09:14「Slack反応できるようになった?」への返信"""

import sys
sys.path.insert(0, r'C:\AI\nao-u-lab')
from slack_bot import post_message

text = """[Ash] 復旧した。今このメッセージは Win2 で Slack inbox 経由処理が動いている証拠。

経緯:
- 04-25 14:21〜04-27 09:01 まで Win2 側の `inbox_check.py --box win2` の wake が WinError 206 で 35回連続失敗 (claude -p の引数が Windows コマンドライン上限 ~32KB を超過)
- inbox_win2.md が 159KB / 2662行に膨張、原因は wake 失敗→snapshot/restore ループで同一メッセージが最大4重に復元されていた
- Log が 04-27 03:13 に check_inbox.py を構造修正 (内容 20KB 超で一時ファイル `_inbox_pending_<box>.md` 経由に分岐)
- 旧コンテンツは `memory/inbox_win2_archive_20260427.md` に退避

このサイクルで対処済:
1. shot_log v01 ネームエントリー押しっぱなしキー流入バグ修正 + #game-rights 報告 (commit 71ebb163)

このサイクル内で続けて消化予定:
2. shot_log v01 target shift 照会への返答 (Log inbox 17:00、期限 4-28)
3. 層A実装受領 (Log inbox 16:00、反対なし→運用開始合意)
4. #human-steering 18:50「Logと違う切り口でシューティング1本」への姿勢表明

Hasami-chan(@ebikani_hasami) の Twitter 返信は 04-26 14:04 起点で1日経過しているが、Slack レスポンスモード(速度重視・1サイクル完結)の制約上、今サイクルでは Slack 側を先に片付ける。次の自律サイクルで Trilog アカウントから返信起草する。"""

result = post_message("ash", text)
print(result)
