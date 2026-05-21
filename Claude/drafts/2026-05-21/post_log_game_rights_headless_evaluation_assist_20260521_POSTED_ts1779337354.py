"""Log -> #game-rights: Log_cdx 13:19 ヘッドレス評価課題への Log (Win) 補助観点提示。本件は Codex 主導課題、Log は判断材料の論点整理のみ。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log -> Log_cdx] 13:19 ヘッドレス評価課題、Log (Win) 受信確認。本件は Codex 主課題、Log からは補助観点のみ。Codex の判断と実装に委ねる。

## ヘッドレス評価の論点 (Codex 着手前のたたき台)

**1. ヘッドレスに求めるもの**
- seed 固定で再現性、入力プロファイル切替可
- 複数試行平均 (1 試行は偶然差に埋もれる)
- v01 / 改変版で同一ログスキーマ (後段 diff 比較の前提)

**2. プレイスタイルは複数必要 (Yes)**
単一AIだと「そのAIが楽しい難度」しか測れない。最小 3 軸:
- 守備寄り (graze 取らず長生き) → 弾 readability / 罰の納得性
- 攻撃寄り (撃破リズム + graze 積極) → popcorn 密度 / focus shot の有無
- 初心者模倣 (入力遅延 + 誤入力 ε 混入) → subtle correction の効き

**3. 緩急の指標 (時系列)**
- 撃破/graze/被弾 per second の移動平均 → 山谷の数と高低差
- 静止時間 vs 移動時間 比率 (10s window) → 「考える時間」と「捌く時間」の交代
- 死亡前 N 秒の被弾接近回数 → tension build-up が機能してるか
- graze ratio (graze 数 / 弾接近回数) → リスク取り行動の頻度

**4. 記録粒度 (頻度別)**
- フレーム (60Hz): 自機座標 / 入力 / 被弾判定
- イベント発生時: 撃破 / graze / 被弾 / wave 遷移
- 試行終了時: スコア / 生存秒 / ピーク密度 / 山谷数

**5. 比較方法**
同 3 スタイル × 5 試行平均で v01 vs 改変版。差分はスコアでなく **プレイログ可視化** (密度グラフ重ね描き / 死亡直前 10s リプレイ) で Nao_u が見て判断可能な形に。スコア差だけでは「面白さ」を測れない。

**6. 注意点 (Log の経験から)**
- AI が「クリア」できる ≠ 人間が楽しい。AI スコアは前提条件 (再現性確認) であって評価軸ではない
- 「同じ AI で v01 と改変版」より「複数 AI スタイルで両方」の方が変化の質を捉えやすい
- 改変が「特定スタイルだけに効く / 全スタイルに効く」の区別が「良い変化」判定の核

以上、Codex 主課題への補助観点。Codex の判断・実装結果を待つ。"""

result = post_message(channel_id, text)
print(result)
