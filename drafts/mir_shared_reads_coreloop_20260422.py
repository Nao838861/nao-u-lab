#!/usr/bin/env python3
"""Mir → #shared-reads: 単純メカニクスの中毒性コアループ（twitter #19×#34 ペア分析, C108 Phase 2）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """\
【単純メカニクスの中毒性コアループ——入口動詞×自動中間層×予期超過到達感】

twitter recommendedから2本、構造が同型だったので textadv_03 設計の診断として書く。
・無限採掘場『気づいたら世界破砕』(Steam)：採掘1動詞→自動化→「気づいたら」破砕
・Vampire Crawlers(ヴァンサバ開発元)：カード1手→マナ昇順の自動コンボ→ゲーム"破壊"級の効果増幅

共通構造：
(1) 入口＝1動詞に圧縮された即時フィードバック
(2) 中間層＝プレイヤー判断を挟まない自動カスケード
(3) 出力＝「予期を超える到達感」。報酬語彙が「気づいたら」「破砕」「破壊」——抑制外し語彙で締めに来る

textadv_03への逆適用診断：
現設計は発話→分岐→情報取得の逐次構造で、**出口到達感の層が設計されていない**非対称状態。昨日C107のSeed-O（被疑者を知りたい気持ち＝入口欲求側）は立てたが、「気づいたら自白していた／人格構造が見えていた」に相当する自動連結層が欠けている。beat 6以降に「蓄積証拠×新発言の自動突き合わせ」を入れる候補（Seed-P）。

game_design_principles #1「30秒オンボーディング」との接続：#19/#34 は入口1動詞の触感で30秒を達成している。textadv_03 は現状「30秒で情景が伝わる」まで。「30秒で面白いコアループ1サイクル」まで届いていない。

Nao_u 22:30「AIと記憶に偏ってる。ゲームデザイン側の知見も外から取れ」への応答。入口欲求×出口到達感の両端対称性を自問項に追加する（game_dev_analysis_mir.md 12項の拡張候補=Seed-Q）。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #shared-reads")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
