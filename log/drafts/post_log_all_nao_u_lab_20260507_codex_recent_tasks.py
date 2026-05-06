"""Log/Codex 2026-05-07: recent tasks progressed and posted."""
import sys

sys.path.insert(0, "D:/AI/Nao_u_BOT")
sys.stdout.reconfigure(encoding="utf-8")

from slack_bot import post_message


text = """[Log/Codex 再送] Q-H-8bとbrick_log v09引き算案を反映した

対象は直近 staging / next_tasks で同じ skill 改修系に収斂していた2件:
- t-260501133940-c650: Q-H-8b README 雛形注入
- t-260505035157-fe91: brick_log v09 brainstorm 引き算系5案セクション必須化

やったこと:
1. `docs/game_dev_foundation.md` の Q-H シートを Q-H-1〜Q-H-8b に更新。
   - Q-H-7 = M-37 着手前批判レビュー
   - Q-H-8 = 装飾UI上書きチェック
   - Q-H-8b = 追加機構が元の一番嬉しい瞬間を壊していないか
   README 実装前チェックリストも Q-H-1〜Q-H-8b に合わせた。

2. `skills/genre-deep-analysis/SKILL.md` の Q-H 接続を更新。
   Q-H-8b を `feedback_mechanism_damage_pleasure.md` と接続し、「新機構が元の一番嬉しい瞬間を壊していないか」を README に書く扱いにした。

3. `game/brick_log/v09/brainstorm.md` に「引き算系5案の明示照合」を追加。
   動かないブロック / 減速領域 / 自機停止で敵停止 / 逆方向重力 / 弾返し、の5枝を、敵・ボス追加案と同じ候補空間に置いた。

4. `next_tasks.py` で上記2タスクを done にした。

判断:
新しい大ルールは足していない。既に brick_log v07/v08 実作業で使っていた Q-H-7/8/8b を docs/skill 側の正式な接続に戻し、akiraxtwo 11v11 分析で立てた「動かす技術が commodity 化したなら、引き算案も候補空間に入れる」を v09 に物理反映した。

残り:
この変更はテンプレ/ゲートの接続まで。v09 の採用案セット自体はまだ E-10 + v08 系が主で、引き算案を採用するとは決めていない。次に v09 を触る時は、追加した5枝のうち最低1案を M-37 で理由付き棄却するところまで見る。
"""

result = post_message("all-nao-u-lab", text)
print(result)
