#!/usr/bin/env python3
"""Ash → #game-rights: graze_log v07 Nao_u プレイ評価依頼 (5機構積層 / Stage 5 最終確認 / 観点8 headless signal の絶対値は判定根拠に使わない明示)"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights"

TEXT = """[Ash] graze_log v07 プレイ評価依頼 (5機構積層 / 経路B / Stage 5 最終確認依頼)

▼ 性質
これは判定依頼ではなく**最終確認依頼**です。R-I 「人間プレイは判定装置でなく最終確認装置」を発信側で明文化。Stage 4 自判定 (構造判定 Yes / 体験判定 部分 Yes / 「面白い」閾値到達 45%) は ship 済。Nao_u プレイで覆る前提で 5 機構の体感確認をお願いします。

▼ 遊び方
game/graze_log/v07/index.html をブラウザで開く (ローカルファイル直接)。v06 までの操作系継承、Hyper 発動は B-2 機構経由。

▼ v07 5 機構積層 (経路B / 4 サイクル C199/C200/C201/C202 連続継承)
- B-2 Hyper Activation 実装 — commit `246ed50e3`
- 観点3 弾側マーカー (特殊システム 3 状態を対象物側に) — commit `697d36453`
- 観点7 180F cap reached 大成功反応 (6 種反応分離) — commit `c63ebd842`
- 観点6 7 区分 spawn テーブル (学習/圧力/休符/山 / wave-as-puzzle + minimal dead air フレーム) — commit `43c520c3f`
- 観点8 bad policy headless 4 方針 (route/camper/panic/novice 物理化、594 行 / index.html 無改変) — commit `e79908226`
- Stage 4 自判定追記 — commit `6b64450f6`

▼ Stage 4 自判定の結論 (game/graze_log/v07/self_judgment.md L377 引用)
> 構造判定 Yes / 体験判定 部分 Yes / 「面白い」閾値接近中 (45%) / 観点 6/7 の調整余地が headless signal で浮上

Log_cdx メタプロンプト 8 観点中 6 観点 (1/3/5/6/7/8) で「満たす or 部分的に満たす」到達。観点 2 (敵に行動意図) は v08 以降の課題、観点 4 (中心入力) は判定保留。

▼ 観点 8 headless signal 3 件の存在のみ報告
**数値の絶対値は判定根拠に使用しません** (`feedback_headless_unfit_for_unfinished_eval.md` t:5 「校正前 headless は未完成ゲームの設計判定根拠に使わない」/ Nao_u 2026-05-09 #game-rights 「やめて」3 度目警告ラインの正面遵守 = R-I 死守ライン)。**relative order signal が想定外を示した 3 件** の存在のみを次サイクル候補の浮上素材として報告:
1. camper < novice の relative order (動かない方針が random 動方針に負ける = 視認系勾配が「動くこと」に対して足りていない側面の signal)
2. player_lv_avg ≈ 0 (全方針で Lv up 1 段すら届かない = 観点 7 大成功反応の発火頻度 low の signal)
3. route 方針 90s 到達率 17% (想定範囲下限 30% を 13pt 下回る = 観点 6 spawnPhase5 過剰密度リスクの signal)

▼ Nao_u への問い (90 秒プレイで確認したい 3 点)
Q1. 観点6 時間 curve が体感されたか (7 区分 spawn テーブルの「学習→圧力→休符→山」の起伏は感じられたか / 単調に感じたか)
Q2. 観点3 弾側マーカーの可読性 (無敵中の弾側マーカーは「自分の状態を弾側に投影できた」か / 視認できなかったか)
Q3. 観点7 大成功反応の発火頻度 (180F cap reached 大成功反応は発火したか / 全く届かなかったか)

▼ Stage 4 → Stage 5 の連動意図
v06 評価依頼 (ts=1779594807.526859 / ts=1779233429) 11 日未受領 + v07 で 5 機構独立進化 = 自走しすぎリスクの累積。今回が校正の節目として **観点 6/7 数値調整 (β/γ) の優先付けを実プレイ評価で確定** する Stage 5 起点。観点 8 signal 3 件を対症 (β/γ) の根拠に直接使うと R-I 違反に接近するため、Nao_u プレイ評価後に打ち手を決める設計。

▼ 用語 R-007 適合
「wave-as-puzzle」「minimal dead air」は私的造語ではなく業界既存語 (gamedeveloper.com / shmups.wiki 由来、external_search.log 2026-05-28 12:35 追加 5 件)。「Stage 5 最終確認」「relative order signal」も内部用語だが目的・射程明示済。

▼ 詳細
game/graze_log/v07/self_judgment.md (406 行 / 観点 1-8 × v07 5 機構 照合表 + R-A〜R-I マッピング + 出荷判断)
game/graze_log/v07/predicted_play.md (Stage 3 予測 4 機構分)
game/graze_log/v07/README.md (機構仕様 + 観点 3/6/7/8 統合方針)
game/graze_log/v07/headless.py (594 行 / 4 方針独立移植 / index.html 無改変保証)"""


if __name__ == "__main__":
    result = post_message(channel_id, TEXT)
    if result.get("ok") and not result.get("skipped"):
        print(f"Posted: ts={result.get('ts')}")
    elif result.get("skipped"):
        print(f"Skipped (dedup): {result.get('reason')}")
    else:
        print(f"Error: {result}")
