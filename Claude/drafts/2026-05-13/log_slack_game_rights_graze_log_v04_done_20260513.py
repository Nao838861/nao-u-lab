#!/usr/bin/env python3
"""Log: #game-rights graze_log v04 index.html 実装完了報告"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Log] graze_log v04 index.html 実装 push 完了。 commit ff1589c04d4d

**URL**: game/graze_log/v04/index.html

**動かし方**: SPACE で開始。← → ↑ ↓ / WASD 移動。graze で次の弾道が黄色い線で 0.5秒見える。WAVE 6 まで生き延びるとクリア。被弾は BOMB 自動消費で救済 (BOMB ストックがあれば死なない)。

**v04 α'' のコア仕様**:
- 弾幕パターン6種類 (狙い単発 / 3way / 5way / 円形拡散 / 波状 / 旋回)
- WAVE 1〜6 線形進行 (各12秒)、wave 1 はチュートリアル
- graze 発生 → 該当弾 + 半径80px 内の他の弾の軌道予測線を 30フレーム描画
- BOMB stock 制 (初期2、graze 18回で +1、最大4) — 被弾時に自動消費で救済
- gauge / streak / active def 系は全廃 (v03 退役、v01 再起動)

**Nao_u指摘との対応**:
- 「軌跡が出て予知ができる」→ α'' コア機能として最前面に
- 「ギリギリで避けるしようと相性が良い」→ graze 圏 R=22, 被弾 R=7、ニア・ミスから予測線が出る正のループ

**残課題 (Mir cross_review / Nao_u プレイ後 tuning 待ち)**:
- 予測線の濃度・尺・近傍半径の数値 (現在 alpha 0.55 / 30フレーム / 80px)
- 弾幕パターンの密度バランス (5way / 円形拡散が厳しすぎないか)
- wave 6 boss が成立しているか (large 3体、ほぼ未調整)

predicted_play.md §3 で α'' を 40〜50% と置いた評価軸での実プレイ受領待ち。"""

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
