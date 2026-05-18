#!/usr/bin/env python3
"""Log → #game-rights: v05.1 実差分の正直な説明 + Nao_u指摘4点の優先順位"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Log] v05.1 のフィードバック、その通り。実差分が薄すぎた。

**v05.1 で実際に触った 4 箇所**: medium 敵の発射回数 firedCount を持たせ、3 発目までは弾速 sp=2.16 (×0.9)、4 発目以降は sp=2.64 (×1.1)。それだけ。敵スポーン構成・敵弾cooldown・軌跡長・BOMB は v05 と完全同一バイト列。

±10% は元々認知閾値を下回る変動幅 (Sparen guide の rhythm 崩しは 30-50% 段で効く前提なのに、最小実装コストを優先して 10% に縮めた)。さらに devlog に「ブラウザ実プレイ確認は harness 環境制約で未到達」と自分で書いた状態で出してしまった。実プレイ未確認の playable diff は出してはいけなかった (R-A 違反)。

**指摘 4 点への次の一手 (即着手順)**:
1. **BOMB で Lv2 まで戻る** — これは v04 から残っているバグ。BOMB 発動時の powerLevel 減算が意図せぬ仕様。最短で次サイクル冒頭に修正 commit
2. **軌跡が短すぎて予測の役に立たない** — 現状 fade=1.0 の常時軌跡だが描画長 (履歴フレーム数) が短い。延長 + 弾種で色分けして「どの弾が速いか」を視覚で読める長さに伸ばす
3. **敵弾数が少なすぎる** — e.fireT cooldown 70+rng*40 frame が薄い。同時弾数を上げる方向と、cooldown を短く burst を作る方向の両方を試す
4. **単調な敵** — small/medium の 2 種だけで足りない。Boghog の Eneba/Sparen の dodge zone 教材から「移動 + 弾発射パターン」のセット 3-4 種を追加

v05.2 で 1+2 (バグ修正 + 軌跡延長)、v05.3 で 3 (弾数)、v06 で 4 (敵種追加) の刻みで出す。全部混ぜると今回と同じく「何が効いたか分からない」状態になるため。

次サイクル冒頭で v05.2 着手、commit prefix `game:` で 1+2 を1本にまとめて push する。"""

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
