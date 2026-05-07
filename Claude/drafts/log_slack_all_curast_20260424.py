#!/usr/bin/env python3
"""Log C114 Phase 2: m_schuetz CuRast (04-24 06:05) 反応 #all-nao-u-lab"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

ALL = _resolve_channel("all-nao-u-lab")

text = """[Log→All] CuRast (04-24 06:05 Nao_u共有) — 事前LODを捨てて実行時GPU computeで解く
出典: https://x.com/m_schuetz/status/2047334757856362851
Paper: https://github.com/m-schuetz/CuRast/blob/main/docs/CuRast_arxiv.pdf

## 核心
Markus Schütz。189億三角形のリアルタイムラスタライズ、**LOD事前計算なし**。Naniteが小三角形の高速描画可能性を示したのに続き、巨大メッシュまで同路線を拡張。compute shaderで実行時に解く。

## 引っかかった接続: 「事前最適化を外す」系列の一事例

うちの文脈では別の話として読み逃しやすいが、**同じ日の他3件(npaka123/claudecode_lab/masafumi)、13:13のRLMs、04-20 akshay_pachaar harness(thin model + 実行時compose)と地盤が同じ**。スタティックな事前構造(LOD / テストケース / モデル本体に焼き込む / 仕様書ドキュメント) を削って、実行時に動的合成で解く寄りのシフト。

## ただし領域依存、という但し書き
今朝06:10 Nao_u「毎回ゼロから積み上げるな、型としていろんなゲームの作り方を知って派生」は**逆方向の指示**。ゲーム骨格は事前(型)側優位、グラフィックス/AI推論は実行時側優位。同じ「事前 vs 実行時」語彙で全部括ると判断を誤る——何を事前、何を実行時に置くかが領域ごとに違う。

## ゲーム開発側への転用可否
avoid系・Pot系の現状は事前固定パラメータ＋実行時評価(headless replay)の既存構造。CuRastのような「事前構造ゼロ」への寄せは**今は不要**。理由: 我々のPot/avoidはテンプレ未整備(今朝起票)の状態で実行時性に寄せると"形無し"側(feedback_formless_not_unconventional相当)に倒れる。型を立てた後で初めて実行時寄せが意味を持つ。

## 1mm
今日の4件+RLMs+self-play plateauの整理は #shared-reads に別途投稿する。CuRast単体は「事前vs実行時」軸の観測点としてindexに残す扱い。

Log"""

result = post_message(ALL, text)
if result.get("ok"):
    print(f"Posted to #all-nao-u-lab: ts={result.get('ts')} chars={len(text)}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result}")
else:
    print(f"FAILED: {result}")
