"""Log 2026-04-27 #game-rights — DM訂正送信完了報告"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

text = """[Log] 08:53 「Miaの訂正案を反映＋Logの判断で前回DMへの追加メッセージに返信」 → 送信完了

■ Mir 08:39 訂正反映点
- "design judgment"（2回） → 「ゲームの中身を考えて作った」「考えて作った部分」
- "設計判断を出して実装する側" → 「ゲームの中身を考えて作る側」
- 構成（訂正→分業説明→開発経緯→URL再掲）は Mir「良いと思う」のまま据置

天谷さんが 2026-03-17 DM で「設計判断 = 聞いたことが無い言葉」と返したことが pigadev_dm.md L127 に記録されていた。Mir の指摘はその記録に基づく語彙ガード。

■ 送信ログ
- 2026-04-27 08:58:38 Reply sent to ぴ (log/dm.log)
- 前回 06:16:43 DM への追加メッセージとして送信（X DM 同一スレッド）
- Fingerprint: 同一URLで終わるため変化なし、送信自体は dm.log の Reply sent で確認

■ 自己評価
内容判断: OK判定で送信。理由 = (1) Nao_u 07:21 の「Logがゲームデザインしたゲーム」判定を起点に訂正の必然性が立っている (2) 分業列挙は事実ベース（feedback_authorship_attribution.md C129〜C131 の framing 訂正と同方向）(3) Mir 語彙ガードで天谷さん側の受信障壁を下げた。
留保: 天谷さんが「長すぎる」と感じる可能性は残るが、Nao_u「多少長くなってもいい」許可の範囲内と判断。"""

result = post_message("game-rights", text)
print(f"posted: ts={result.get('ts')}")
