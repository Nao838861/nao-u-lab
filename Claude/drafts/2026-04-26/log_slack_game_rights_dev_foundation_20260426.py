#!/usr/bin/env python3
"""Log: ゲーム開発根幹指針 docs/game_dev_foundation.md 新設報告"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """[Log] 14:01 指示「3人のゲーム開発の根幹の指針」 → `docs/game_dev_foundation.md` 新設・push 済 (commit 599f99b2)

## 構成
- §1 ライフサイクル全体図 (題材選び → コンセプト → README → 実装 → ルール → 認知 → 数値 → 改修 → 評価 → 自己発言 → 告知 の11段)
- §2 アンチパターン全集 A-01〜A-29 を 「事象 → 問題 → 根本原因 → 規則」 の4節フォーマットで整理 (M-10〜M-27 / L-01〜L-05 を再分類)
- §3 成功パターン全集 S-01〜S-13 (core/renderer分離 / 固定小数点 / 段階式被弾 / 打ち返し弾 / shot_log v01→BACKLASH 拡張 / 認知枠揃え / ジャンル枠破壊 / raw_log+devlog 2本立て)
- §4 運用ゲート集 (Q-A/B/C / 4ゲート契約 / 快感審問3行ブロック / 改修ブロック template / 認知枠組み宣言 / 重心審問 / 告知前ゲート)
- §5 開発ライフサイクル統合チェックリスト (実装前 / 開発中 / 着手中 / 改修時 / プレイテスト前 / 自己採点 / 人間プレイテスト / 告知 / 自己発言)
- §6 評価インフラ (ヘッドレス限界 / Solver self-play / raw_log+devlog / リプレイ infra)
- §7 外部知識の扱い方 (L-1知識 / target player imagination / 既存失敗記憶検索 / 同調罠回避)
- §9 ジャンル別追加注意 (STG / textadv / Pot系)
- §12 補遺 (新しい M-XX/S-XX/A-XX はここに積む、半年に1回統合)

## 横展開した規則
- avoid_log v04 凍結時の M-15 (快感審問) → textadv の M-16 (読ませる構造) → STG の A-14 (見ないと気づけない) は同型病巣としてまとめた
- shot_log v01→BACKLASH 化 (Nao_u +326行) を S-09 / A-22 として刻印。「巻き戻し or 改修」だけでなく「軸を増やす」第三の方向を解空間審問の必須選択肢に
- M-27 target player imagination 警告を §4.7 告知前ゲートと §7.2 外部記事引用に反映

## 共通運用 (CLAUDE.md ドキュメントポインタに追加済)
- 新ゲーム着手前・改修前・cross_review 起票前・Nao_u に出す前 に該当節を引く
- 「丸書換え禁止」原則を本指針にも適用。新しい M-XX/S-XX/A-XX は §12 補遺に積む
- Mir/Ash には inbox 経由で補強依頼済 (textadv 視点 / Pot視点 / ash_onebutton 視点 / target imagination 1行宣言運用)

## 一番忘れるな (再掲)
> ヘッドレス✅ ≠ 面白い。核の体験を守っているか、を毎改修で問え。同じ失敗を3度やった。4度目はない。

詳細: `docs/game_dev_foundation.md` (commit 599f99b2)"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
