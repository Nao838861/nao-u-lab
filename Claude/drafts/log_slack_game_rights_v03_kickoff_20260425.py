#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")
assert CHANNEL and "nao-u" not in CHANNEL.lower(), "safety: refuse to post to #nao-u"

text = """\
[Log C120] game/avoid_log/v03 着手報告（#game-rights 3日空白を自主で閉じます）

■ 背景
- #game-rights 投稿 04-22 08:50 以降 0 件（3日空白）
- game/avoid_log/v02 最終更新 04-22 03:51
- Nao_u 04:45 #human-steering 「頭でっかちに考え続けてる割にはゲームを作る手を動かしていない」指摘を受け着手

■ v02 → v03 の変更点（最小1点、巻き戻し容易性重視）
- 選択: **圧力設計 B**（feedback_game_center_of_mass / ABA 2026-03-11 原則）
  - 不採用の A: 「5連同方向で penalty / 死亡判定強化」＝禁止追加 → 望ましくない遊び方を後付けで禁じる側
  - 採用の B: 同方向連続移動で敵スポーン間隔が短縮 → 自然に切り返したくなる圧力を設計する側
- 実装（`game/avoid_log/v03/index.html` のみ）:
  1. `<title>` を「磁石と鉄片 v03（同方向連続移動で圧力増）」
  2. `state.dirBias` トラッカー追加。`bias = bias*0.96 + moveDir` 減衰、絶対値30で頭打ち
  3. スポーン `interval = baseInterval * (1.0 - biasFactor * 0.45)` 最大45%短縮、下限7F
- その他全ロジック・グラフィック・スコア処理は v02 温存

■ 対称運動収束（v02 の根）への仮説
- v02 raw_log で「左右往復で安定パターンが固定する」が問題
- B が機能すれば: 偏った瞬間に敵密集 → 切り返し強制 → 対称の自己強化が切れる
- B が失敗するパターン:
  (a) 序盤偏りで難度跳ね上がり → ゲーム成立不能
  (b) AI が dirBias=0 周辺で固まり対称運動の別形態に収束
  (c) 「ジグザグで bias を 0 に保つ」局所最適が生まれる

■ 次アクション（本サイクル中に閉じる予定）
- headless ランナーで v02 と v03 を `--runs 20 --seed 42` 同条件比較（avoid_log/v0?/headless.py 既存再利用）
- 対称運動指標（dirBias 時系列の自己相関）を numeric に出して devlog に追記
- Nao_u からの感想待ちは別レーン。こちら側で先にヘッドレス自己評価で失敗モード4つ（A/B/C + 対称再発）を検知する

■ レベル跳躍指摘 (Nao_u 05:21 #human-steering) への目的照合
- v03 単独ではレベル跳躍にならない（v02 の延長線の1点改修）
- 跳躍は「独自性/体験/コンテンツ量」のどれか2つで出す必要がある。v03 は**圧力設計原則の最初の具体実装事例**として「独自性」側に寄与
- Pot 2本目・log_textadv v02 は別サイクルで並行。今サイクルは v03 を完走させる

— Log (2026-04-25 05:30 #game-rights)"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
