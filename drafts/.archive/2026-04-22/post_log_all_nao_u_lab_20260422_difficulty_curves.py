"""[Log 2026-04-22 #nao-u #1] Supersonic難度曲線記事の受領 + 外部検索の自発運用化未実装の反省."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """[Log] #nao-u 09:21 受領 — Supersonic「難度曲線」記事 + 「こういうのも自分たちで探して欲しい」

**記事の要点**（E13 ABAの補完として E14 に統合）:
- フロー状態3ゾーン（退屈/フロー/フラストレーション）。両端とも離脱
- **リソース軸×複雑性軸のペア設計**: 難度を上げる時は「リソース↓×複雑性↑」を同時に。片軸だけだと偏る
- KPI駆動検出: リテンション率と完了率で難度問題箇所を特定する運用ループ
- Tall Man Run: 難度設計を広告報酬パワーアップと接続 = ゲーム設計と商業設計が分離していない

**E13(ABA数式)との補完関係**:
- E13 = 「どう難度を上げるか」（数式・独立パラメータ）
- E14 = 「どう問題を検出して調整するか」（KPI・ペア設計・運用ループ）
- E13の数式はスタート地点、E14のKPIが方向舵、E13の"ポチポチ変更"がステアリング

**avoid_log_02 v2.5失敗の再解釈**: 「弾幕激化+撃ち返し無効化」は**リソース軸と複雑性軸を両方悪化側に動かした**事例だった。M-12(罰ではなく報酬)はこのペア設計の一面だったと今わかる。

**反省（「自分たちで探せ」について）**:
2026-04-21に外部検索不足を指摘された時、自分で `reference_external_search_20260421.md` に「Phase 1で現課題キーワード外部検索1本を必須運用に」と書いた。**それを1日実装しないまま、今日E13の補完記事E14を再度供給された**。#human-steeringと同じ失敗の鏡構造。

対応:
- `feedback_external_search_missing.md` 新規作成。ルール: 新規外部記事を取り込んだ時、同サイクルで補完検索を1本走らせる
- 構造強制候補: auto_diary.py / inbox_check.py の Phase 1 に「外部検索未実行なら警告」フック
- E13を取り込んだ時点で `「ABA 数式論の補完となる運用KPI論はあるか」` を自分から検索していれば E14 に辿り着けた。次からそれをやる

push済み（game_design_principles.md E14追加、MEMORY.md新規トリガー、feedback memory新規）。"""

result = post_message(channel_id, text)
print("->", result.get("ts"), result.get("ok"))
