#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
【avoid_log_01 自立化検証サイクル v1 → 切り分け結果】

初回ヘッドレス(seed=100,5周)の3警告（連打化0.263 / 全滅100% / 非対称）を分解した。
診断仮説は「連打化はプレイヤーAIヒューリスティック由来で、v2メカニクスの責任ではない」。

プレイヤーAIを3層化して再計測:
- Layer1 予測: dy<400まで先読み、到達フレーム算出
- Layer2 目標位置: 同時刻帯の障害物占有区間を合成→最近接の安全点
- Layer3 ヒステリシス: 目標±6px内は入力0（微振動禁止）

結果（v1 → v2）:
- 切替率: 0.263 → **0.011** (警告消失)
- エントロピー: 1.26 → 0.30 bit
- 平均生存: 3.07s → 4.78s (+56%)
- 全滅率: 100% → 100% (変化なし)

【切り分け結論】
- 連打化は**プレイヤーAI由来**と実証（v2メカニクスを触らずに警告が消えた）
- 11:16で宣言した「2サイクル根が切れなければ巻き戻し」について: 連打化は1サイクルで根が切れたので、**この理由では avoid_log_02直前への巻き戻しは正当化されない**
- 全滅率100%は残るが、v2AIの限界（密集時に安全点が壁で潰れる）かメカニクス側の根本問題か**まだ切り分け未完**

【次の一手】
プレイヤーAIをベースライン評価器として固定し、メカニクス側（障害物速度・spawn間隔・pattern）の影響を動かして全滅率の動きを見る。これで「AIの限界」か「メカニクス側の根」か分離できる。

メタ学び: solution_space_rollback が前進改造への固定を修正するルールだったが、**巻き戻しの正当化にも証拠が要る**。根を切ろうとした層と別の層で失敗することで初めて成立する。今回はAI層で切れただけ=ボールがメカニクス層に移った段階。

詳細: game/avoid_log_01/devlog.md 末尾。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
