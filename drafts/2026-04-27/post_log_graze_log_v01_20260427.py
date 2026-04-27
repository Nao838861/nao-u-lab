"""Log → #game-rights: graze_log v01 新規作成完了（記憶+学習の取り出し検証）"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log] graze_log v01 新規作成 — BACKLASH の違う切り口 STG

Nao_u 18:18/18:22 #human-steering「学んだ知識を実装の場で取り出せるか」「logのシューティングのようなものを独自にもう一本違う切り口で作れるはず」への直接応答。

## 違う切り口
ゲージ蓄積源を反転:
- BACKLASH: 敵に弾を当てる(撃破) → ゲージ
- graze_log: **敵弾の真横を通過(graze)** → ゲージ

BACKLASH headless 観測(C127)で発見した defensive=0% 問題を、**罰追加でなく報酬経路の追加**で構造的に解く設計。圧力設計側(feedback_game_center_of_mass)。

## 実装で取り出した記憶（自分で判断に使ったもの）
- M-22 型の中で蓄積: 縦STGの型は維持、ゲージ蓄積源だけ反転
- M-23 自然減衰なし: 時間でゲージ減らさない
- M-24 区切りで表現: 内部値固定、Lv1/Lv2/Lv3 の閾値で段階感
- M-25 認知枠組み利用: graze は STG 文法で説明不要
- BACKLASH item 4 / 12 / 15 / 19 / 23 / 26 / 29: auto-shoot / アイテム取りやすさ(v01では未実装) / 段階式被弾 / 射程制限なし / 段階の重さ / 赤フラッシュは控えめ / 爆発色を弾色と分離

## v01 最小範囲（「v01 膨張」C122 同型回避）
自機 / 敵2種(small/medium) / 敵弾 / graze 検出 / gauge 3段階 / BOMB / 段階式被弾 / スコア / タイトル / GAME OVER / SPACE開始/リスタート / 3層パララックス星

## 起動
http://127.0.0.1:8000/game/graze_log/v01/

## 着手前 Q-A/B/C 自己採点
- Q-A ◎ 「敵弾の海に踏み込んで GRAZE 連発で MAX → BOMB」一文化済
- Q-B ○ v01 最小範囲を厳守宣言（large/boss/AI/ランキング/SE は v02 以降）
- Q-C △ 罰は段階式被弾のみ、graze（報酬経路）が主軸

## 観察軸（プレイテスト依頼）
1. 30秒以内に初 graze を体感できるか
2. graze が「踏み込む快感」として伝わるか
3. BOMB が graze ループの上に乗っているか

完成度は v01 として一回目。Nao_u プレイ後の感想で v02 改修方向を決める。一発で完全になるとは思っていない、繰り返しで何が足りていないかを学ぶ前提。"""

result = post_message(channel_id, text)
print("posted:", result.get("ok"), result.get("ts"))
