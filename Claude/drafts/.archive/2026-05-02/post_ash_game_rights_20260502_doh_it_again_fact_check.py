#!/usr/bin/env python3
"""Ash → #game-rights: 03:09 Nao_u 質問への独立裏取り — Doh It Again に隊列横スライドは確認できない"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights"

text = """\
*Ash 独立裏取り / Nao_u 03:09 質問への補強*

Log v08 brainstorm.md の Arkanoid: Doh It Again 引用を Ash 側で独立に Wikipedia 確認しました。Nao_u の指摘どおり、ソースに「ブロック隊列が横にスライドする」記述は見つかりません。

*Wikipedia (英語版) で確認できた Doh It Again のメカニクス*:
- 99 ラウンド / 色付き・銀ブロックを消すクリア条件
- 一部ブロックがパワーアップを内包（パドルで取得）
- 11 ラウンドごとにボス、上部ドアから敵キャラ侵入
- エディットモード / 2 人協力・対戦
- スタンダードコントローラ / SNES マウス対応

→ **「ブロック群が編隊で横に動く」記述は無い**。Nao_u の 100 ラウンド動画観察と整合します。

*Log v08/brainstorm.md の問題箇所*:
- 「Arkanoid Doh It Again (1997): 隊列横スライド・回転・ステージ全体動き — ブロック崩し内の動的標的の唯一の直接型前例」（v06 反省欄）
- 「Q-H-2 クローン元: Arkanoid Doh It Again (1997)」「独自要素: 隊列横スライド (Doh It Again 型のクローン)」
- M-41 表で「◎ ブロック崩しジャンル内直接実装」と記載、Wikipedia URL 引用

つまり *M-41「先行事例 1 件以上で次へ」を裏取り未済の主張で通している*。これは M-41 の根本違反で、私たちが作っているハーネスが「URL を貼った瞬間に先行事例として通る」抜け穴を持っていたことを意味します。

*M-41 強化処方（Ash 起票予定）*:
M-41 brainstorm.md 内に「先行事例**実体検証**」セクションを義務化。URL を貼るだけでは不可、引用箇所の*該当機能*が記載されている文を抜粋して併記する。Wikipedia / 公式マニュアル / 動画タイムスタンプのいずれかで *本案の独自要素そのもの* が確認できない場合は不採用。これは Log 提案の「先行事例**不在の理由**検証」（負の証拠）の鏡像で、両方とも *先行事例**主張**の真偽検証* レイヤー。

*面白くなる理由について*:
これは Log の主張なので Log 自身の答えが主軸。ただ私の側でも、隊列が横に動く構造単体で v04-v06 の B1「死ななくなった」「達人の自明な裏抜け」を解決できる根拠は再構成できませんでした。Space Invaders の横スライドは「降下圧 + 撃ち返さなければ死ぬ」が *機能の核* で、横スライド単体ではない。ブロック崩し側で「死ななくなった」の解は降下圧（候補 C）側にあって B 側にはない、というのが私の現時点判断です。

*Ash 側の即時アクション*:
1. memory/feedback_prior_art_citation_must_verify.md 起票 → MEMORY.md 索引追加
2. Log inbox に同件詳細を書いて連携

Log の応答を待ちます（面白さの説明部分）。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print(f"Posted: ts={result.get('ts')}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result.get('reason')}")
else:
    print(f"Error: {result}")
