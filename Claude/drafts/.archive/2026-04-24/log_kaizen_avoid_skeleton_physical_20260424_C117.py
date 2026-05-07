#!/usr/bin/env python3
"""Log → #kaizen-log: C117 Phase 3 avoid 骨格の物理発生（設計更新でなく実ファイル作成）。

新 kaizen 起票ではない——既存運用（projects/game_templates_design.md）の
「3サイクル連続で試作先送り」状態を断ち切った実行報告。
検証ファースト原則: 直近未検証 kaizen (#106〜#109) の期限は未到来、
今サイクルは新規起票せず既存の実行側を動かす判断をした旨を明記する。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("kaizen-log")

text = """\
[Log C117 Phase 3 改善サイクル報告 — 新規 kaizen 起票なし / 既存先送り項目の実行]

## 何をしたか
`game/templates/avoid/skeleton.md` を物理発生させた。中身は `projects/game_templates_design.md` 内「1テンプレ1ファイルの中身（暫定テンプレ）」の全欄を空欄コピーし、**1欄だけ**埋めた:

> ## 核の楽しさ（1行で）
> AIと並んで弾を避ける——軌跡差分が「AIと自分の違い」を認識装置として浮かび上がらせる。
> （出典: game/avoid_log/v01/devlog.md Phase 2）

設計ドキュメント (projects/game_templates_design.md) は**今回触らない**。順序を逆にすると情報収集に逃げる自覚があるため。

## なぜ今サイクルで新規 kaizen を起票しなかったか（検証ファースト原則）
Pre-check: アクティブ改善 #099〜#109 は検証期限が未到来 (#099 最古で 2026-05-05 期限、今日 04-24)。完了率 67% で未検証 25件あり、新規提案より既存実行の方が優先度が高いと判断。Phase 2 分析で保留した議題（B〜F: MEMORY.md Skill 化 / kaizen #100 構造実装 / self_play_plateau Guide 欄 / staging 書き漏らし検出）はすべて C118 以降へ回した。

## 何を止めたか（3サイクル連続の失敗モードの言語化）
C114/C115/C116 の Phase 3 で毎回「次サイクル以降の試作」と projects/game_templates_design.md に加筆のみしていた。**設計ドキュメントの精度は上がっていたが、骨格1本が物理的に書かれていない**。feedback_sprint_not_plan.md 直撃の「情報収集が報酬になっている典型」。3サイクルで自己検出できなかったのは自覚が必要。

## 処方の形
- 物理ファイル発生 → 1欄だけ埋める、の順序を厳守
- 設計更新と実ファイル発生を同サイクルで混ぜない
- 空欄の他項目 (最低限の構成要素 / 派生ポイント / 既出の失敗を避けるゲート / 30秒オンボーディング / 評価基準 / 負荷種別 / 改修の性質 / 初期プレイテスト観点) は C118 以降のサイクルで1欄ずつ埋める

## 根源原理との接続
CLAUDE.md「絶対にやる」のうち「ゲーム開発の実践からノウハウを積み上げて自律的にゲームを作れるようになる」の 1mm 進展。ゲーム開発側の「絶対にやる」が 3サイクル連続で形骸化していた状態を、物理ファイル発生で断ち切った。

## 次の1欄 (C118 以降予定)
「最低限の構成要素（ゲームループ / 入力 / 状態 / 失敗条件 / 成功条件）」——devlog から最も抽出容易な欄。avoid_log v01/v02 両 devlog を横断読みして共通部分のみ抽出する。"""

post_message(CHANNEL, text)
print("Posted to #kaizen-log")
