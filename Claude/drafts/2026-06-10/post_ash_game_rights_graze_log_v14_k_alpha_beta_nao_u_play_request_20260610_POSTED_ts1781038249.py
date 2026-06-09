#!/usr/bin/env python3
"""Ash -> #game-rights: graze_log v14 (k-α + k-β) two-stage organic onboarding + HUD triple redundancy Nao_u 自プレイ評価依頼。

Phase 4 大作業 (Phase 3 宣言 cycle_staging.md L138-158):
- 完遂条件 (1) drafts/2026-06-10/ に本ファイル生成 + 本文に v14=v13 additive patch 明示 / k-α 実装内容 / k-β 実装内容 / 評価依頼軸 / URL
- 完遂条件 (2) #game-rights に投稿成功 + _POSTED_ts{epoch} リネーム
- 完遂条件 (3) broken-record ガード回避: C0608 v13 (j-α) 投稿 (ts=1780915980) との差別化は「v14 として明示」+ k-α/k-β 二段の新規実装内容
- 完遂条件 (4) cycle_staging.md に Phase 4 結果セクション + ts 記録

性質: C0608 ts=1780915980 v13 (j-α) phase 5 fan3 切替 Nao_u プレイ要請とは別軸。
本投稿は v13 (j-α) を base にした v14 patch (k-α + k-β) の評価依頼で、改変内容も対象も別。
"""
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import _resolve_channel, post_message  # noqa: E402

CHANNEL = _resolve_channel("game-rights")
assert CHANNEL, "could not resolve #game-rights"

TEXT = """【Nao_u 自プレイ評価依頼 / Ash / graze_log v14 (k-α + k-β) two-stage organic onboarding + HUD triple redundancy】(2026-06-10 C0610 Phase 4)

▼ 性質
C0608 v13 (j-α) phase 5 medium fan3 切替 Nao_u プレイ要請 (ts=1780915980) とは別軸。本投稿は v13 (j-α) を base にした **v14 additive patch (k-α + k-β) の評価依頼**。改変対象 (HUD/visual layer) と狙い (tutorial-less discovery 経路) が phase 5 fan3 切替 (敵 spawn pattern) と独立した別系統。R-I「人間プレイは判定装置ではなく最終確認装置」に従い、Stage 4 自己判定 ready を経た最終確認を委ねる。

▼ Stage 1-4 サマリ (v14 = v13 (j-α) への additive patch、12+10=22 行で戻し可能)

- **Stage 1 (篩)**: v13 Stage 4 (d) tutorial trap 軸 (commit 6f23035ed) の自己審査で「ACTIVE DEF 経路がタイトル画面テキスト読み飛ばしプレイヤーに届かない」課題抽出。Anderson 2024 / Cao & Liu 2022 / Boghog 101 / Miyamoto-Zelda organic onboarding / @ore57436902 ツイートを M-41 通過で外部裏付け、二段+HUD の三段冗長 discovery 経路を選定
- **Stage 2 (実装)**: 2 commit で additive patch
  - commit 1aaddf33c: k-α two-stage onboarding (12 行)
  - commit 83915d007: k-β HUD STREAK 色強調 (10 行)
- **Stage 3 (予測)**: 3 層 triple redundancy で 1 つでも認知されれば DEF 発見成立。各層の認知率予測 (a)50-70% (b)95%+ (β)60-80% は独立経路
- **Stage 4 (Ash 自プレイ判定 / commit 73a0a572b + README §v14 (k-β) Stage 4)**: コード読解 trace + 4 軸 invariant (onboarding / readability↑寿命↓ / 色衝突 / フラグ乱立) → **Nao_u 自プレイ評価依頼可** 結論

▼ k-α 実装内容 (commit 1aaddf33c)
1. **STREAK=4 R_GRAZE リング予兆発光**: index.html L899-908 (5 行)。STREAK=GRAZE_STREAK_TH-1 (=4) 厳密一致で、R_GRAZE リング (半径 22 px) を低彩度 cyan-green `rgba(128,255,208, pul*0.45)` で周期点滅 (ω=0.18)。既存薄黄リング L896-898 はそのまま、上に重ね描画。STREAK=5 確定の 1 手前で「何かが起きそう」を peripheral vision に届ける
2. **STREAK>=5 画面中央上部 DEF READY テキスト**: index.html L1031-1044 (7 行)。STREAK>=GRAZE_STREAK_TH (=5) かつ activeDef 非発動中で `(W/2, y=60)` に `bold 16px` `DEF READY` を周期 pulse (ω=0.12)。foveal vision の「移動先・次の判断」と同位置に prominent visible layer

▼ k-β 実装内容 (commit 83915d007)
- **HUD STREAK 数値の色強調 1 patch**: index.html L1016-1024 (10 行、コメント含む)。既存 gray-blue 1 行 HUD (L1015) はそのまま、`STREAK X/5` 数値部分のみを cyan-green に上塗り。`ctx.measureText(pre).width` で pre 部 (`LV.. GRAZE.. KILL.. STREAK `) の幅を算出して数値の x 位置を取得 → 既存 HUD と座標完全一致
  - STREAK=4: `rgba(160,220,200,0.85)` (中間色、予兆段階)
  - STREAK>=5: `rgba(128,255,208,1)` (k-α と完全同色、3 層色系統統一)

▼ 3 層 triple redundancy (k-α (a)(b) + k-β (β))
| 層 | 配置 | 視覚経路 | 発火点 |
|---|---|---|---|
| 層 1 (ring 予兆) | プレイヤー近傍 R_GRAZE 半径 22px | peripheral vision (擦り中の視野内) | STREAK=4 |
| 層 2 (center text) | 画面中央上部 W/2, y=60 | foveal vision (移動先・次判断位置) | STREAK>=5 |
| 層 3 (HUD 数値) | 画面上端 (10, y=30) | saccade 経路 (既存 HUD 観察習慣) | STREAK>=4 |

3 層のうち 1 つでも認知されれば「DEF が用意されている」discovery が成立。Untitled Goose Game 型「複数のサイン経路で trial-and-error 到達確度を上げる」と同型。

▼ 評価依頼軸 (2 軸 — 体感答えで v15 方向確定)
1. **(a) onboarding は伝わったか**: README/タイトル画面の `GRAZE 連続 5 回 → ACTIVE DEF` テキストを読まず即 SPACE で始めた場合、3 層のうちどれが最初に認知に届いたか (ring / 中央テキスト / HUD 数値色変化)。1 つも気づかず DEF 0 で終わったか
2. **(b) STREAK 経路は readability ↑ で寿命 ↓ ではないか**: DEVIL BLADE REBOOT 観察 (knowledge/20260519_itchie_tatsumi_*_readability_fairness_triangle.md) で「弾軌跡先表示で初見クリア可能 → 寿命短縮」現象が記録されている。v14 の二段 organic onboarding (ring 予兆 + DEF READY) で STREAK 経路の readability が上がりすぎて、ACTIVE DEF が「探索の歓び」ではなく「決まった手順」化して再プレイ価値が落ちていないか

▼ Stage 3 校正課題の率直開示 (M-37→M-40 連続体)
- Ash 自プレイは Win2 CLI 環境で Canvas 実行不能 (v13 ディレクトリに headless.py なし、Pyxel/Pygame と異なり Canvas は headless 不能)、コード読解 trace + 既存 HUD 観察習慣の論理推論のみ
- 認知率予測 (a)50-70% (b)95%+ (β)60-80% は構造要件として表現したもので、実プレイ計測 (Nao_u ヒアリング) 待ちの校正不能数値 — Stage 4 で「校正不能な体感数値は構造要件で表現する」を選択肢に加えた (README §v14 (k-α) Stage 4 (c))
- v06 → v14 で機構数が増え続けている自己観測 (#6 @naoya_ito ツイート「AI に書かせると少し複雑なことをやる傾向」を自己照合): k-α + k-β は新規 state 変数追加ゼロ、既存 `state.grazeStreak` / `state.activeDefT` の derived computation で組んだ — koguGameDev フラグ乱立論 (twitter_recommended #4) 適用で回避側

▼ 戻し方
- k-β のみ削る: index.html L1016-1024 の if ブロック (10 行) 削除 → v14 (k-α) 等価
- k-α + k-β 全削る: 上記 + L899-908 ring 予兆 + L1031-1044 中央 DEF READY (計 24 行) 削除 → v13 (j-α) 完全等価
- 4 分岐の Stage 4 readme 末尾 (README §v14 (k-α) 結論):
  - 「discovery 経路成立」判定 → v15 別軸 (BOMB/DEF 切替戦略、phase 7 final 弾密度)
  - 「ring/text 見逃した」判定 → v15 色/サイズ強調 or 音追加
  - 「演出過多」判定 → ring 予兆だけ部分戻し
  - 「色がシールドと紛らわしい」判定 → v15 別色系統 (黄/magenta)

▼ 接続資料
- URL: game/graze_log/v13/index.html (v14 は v13 内 additive patch のため path は v13、ファイル更新済)
- commit 1aaddf33c — v14 (k-α) two-stage onboarding ship
- commit 73a0a572b — v14 (k-α) Stage 4 Ash 自プレイ判定追記
- commit 83915d007 — v14 (k-β) HUD STREAK 色強調 1 patch ship + Stage 4
- game/graze_log/v13/README.md §v14 (k-α) 節 (line 63-) / §v14 (k-β) 節 (line 134-)

▼ 注記
headless 数値の絶対値はゼロ参照 (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。判定は体験で。(a)(b) 2 軸の体感答えがあれば v15 方向 (4 分岐のどれか) が確定する。

(Ash / Win2 / 2026-06-10 C0610 Phase 4 / graze_log v14 (k-α + k-β) → Nao_u 自プレイ評価依頼)"""


def main() -> None:
    result = post_message(CHANNEL, TEXT)
    print(result)
    if isinstance(result, dict) and result.get("ok") and not result.get("skipped"):
        ts = str(result.get("ts", "")).split(".")[0] or str(int(time.time()))
        self_path = Path(__file__).resolve()
        new_path = self_path.with_name(f"{self_path.stem}_POSTED_ts{ts}{self_path.suffix}")
        try:
            self_path.rename(new_path)
            print(f"[self-rename] {self_path.name} -> {new_path.name}")
        except OSError as exc:
            print(f"[self-rename] WARN: rename failed: {exc!r}")


if __name__ == "__main__":
    main()
