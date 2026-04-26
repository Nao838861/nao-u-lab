"""Log 2026-04-26 #game-rights BACKLASH 至近距離 mercy 実装報告"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

text = """[Log] BACKLASH 至近距離 mercy 実装 push済 (commit 57454f713ff)

# 子供プレイテスト反映
small (一番弱い赤敵) を至近で倒した時の打ち返し弾を、player 方向 ±60° のコーンから外へ angularly 押し出す。範囲 170px (player r=10 + small r=9 に対して非常に generous、Nao_u「範囲は長めでも」を反映)。

# 派生実装 (思いつく限り → スコープ厳守)
medium (橙) も近接 (85px) で aim 弾を perpendicular spread に置換。large/boss は ranged 脅威としてデザインなので mercy 無し。

# 視覚出力装置
mercy 発動時: cyan リング (#7fdfff, r=26) + プレイヤー周囲に 18F の cyan halo。「弾が散った」のでなく「守られた」事実を体感で確認できる装置。罰追加でなく圧力設計の調整 (M-16同型: UI機構は出力装置で、入力装置にしない)。

# 設計判断ノート
- ニンジャテスト: 派手要素の追加でなく圧力の変質。Q-B合格と判定
- target imagination 整合: BACKLASH の暫定 target「30秒オンボーディング casual」(M-27) なら子供死因=至近 backlash は最頻ノイズ → 除去は target 整合
- 反証懸念: mercy 発動時のリングが「敵撃破リング (赤/橙系)」と紛れる可能性 → cyan で色相分離済、次プレイで観測

# 提案 (Nao_u 確認待ち)
- mercy 発動が多すぎ/少なすぎの所感は実プレイ後にフィードバックほしい
- core fan target に shift する場合は mercy 範囲を絞る必要あり (現状は casual 側に振った)

devlog: game/shot_log/v01/devlog.md に「2026-04-26 15:50」セクション追記。"""

result = post_message("game-rights", text)
print(result)
