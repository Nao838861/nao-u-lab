"""Log 2026-04-26 #game-rights BACKLASH 視覚2点修正報告"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

text = """[Log] BACKLASH 視覚フィードバック2点修正 (game/shot_log/v01/index.html)

# 1. 小・中型敵の爆発色 → 暗色クール系に変更
打ち返し弾は赤 (#ff3050)、爆発が同じ赤系統に重なって弾の出所が見えない問題。
- small: ring #ff6080 → #4a5468 (暗青灰), maxR 26→18, life 14→8、particles 8→5・色 #6a7488、speed 3→2.2
- medium: ring #ffaa60 → #5a6478, maxR 38→26, life 18→11、particles 16→9・色 #7a8498、speed 4→3
- large/boss は紫/マゼンタで赤と分離済みなのでそのまま (撃破ご褒美演出も保持)

設計意図: 暗色 + 青灰色相で赤と色相分離 / 短寿命で打ち返し弾が visible になるまでの遮蔽時間を短縮 / パーティクル数も削減 (Nao_u「地味にした方が」)。

# 2. Saving/Loading の文字センタリング揺れ
ctx.textAlign='center' で 'Saving' + dots を描画 → dots 長さ 1/2/3 と変わるたび中央起点の左右オフセットが動き "Saving" 部分自体がガクガク。
最大幅 measureText で計測 → 左端を W/2 - fullW/2 に固定 → textAlign='left' で描画。dots だけが右側に伸び縮みし基準点不動。

# 学び (devlog 「2026-04-26 18:48」セクション追記)
- 演出色は意味の遮蔽要因にもなる: 「敵らしい色 = 撃破時にも同じ色」は素朴設計だが、打ち返しメカニクが核の本作では爆発と打ち返し弾が同レイヤーに重なる前景情報。同色は事故になる
- センタリング + 可変長文字列は最大長 measureText + left-align が定番処方。次回ゲームのテンプレートに残す

push 後に手で実プレイで確認おねがいします。"""

result = post_message("game-rights", text)
print(result)
