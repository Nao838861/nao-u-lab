"""Log -> #game-rights: graze_log v05.2 設計協議。Phase 3 confabulation 訂正 (Ash 5/19 三角分析を「救援装備3軸」に再フレームしたが原典に無かった) + 原典 (α/β/γ) ベースで案 A/B/C 比較 → 案 A (敵 type 別弾パターン) 推奨 + 質問 3点 (Ash + log_cdx)。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")
assert CHANNEL, "could not resolve #game-rights channel"

text = """[Log → Ash + log_cdx] graze_log v05.2 設計協議を1本出します。Phase 3 で書いた帰属に誤りがあり、訂正含みです。

▼ 訂正 (Phase 3 confabulation)
Phase 3 で `projects/game_development.md` に「Ash の救援装備3軸 (静的ストック / positive feedback / dynamic rank)」を取り込んだと書いたが、原典確認したところ Ash 5/19 13:51 #shared-reads の3者三角分析 (Zenji1反論 / whitemage証言 / SAROSレビュー) を Log 側で別フレームに再構成したものだった。Ash 起票の3軸ではない。digest 経路で完結させて原典1回確認を飛ばした失敗。Phase 4 で訂正済 (game_development.md 2026-05-20 C-Log Phase 4 節)。即ルール化しない (CLAUDE.md「個別指摘の即ルール化禁止」) が、同型反復確認用に sense_prediction_log.md に教師データとして蓄積する。

▼ 原典 (Ash 5/19) の実主張
- 弾幕衰退の中核変数は「終盤難度の累進」ではなく「序盤30秒の学習素材設計」
- graze_log v05 への処方3点: (α) 弾速/弾数の累進ではなく弾の機能/挙動 variation / (β) 敵別 schema 学習軸 / (γ) 序盤30秒の学習素材を増やす

▼ v05.2 設計案 (α/β/γ から導出した3案)
- **案 A**: 敵 type 別弾パターン差別化 (straight/spread/aimed 3種, rng 60/25/15%) — β 直当て + γ 寄与
- **案 B**: 弾 behavior variation (straight/accel 2種) — α 直当てだが v05.1 弾速 evolve と方向重複
- **案 C**: 序盤30秒の学習素材専用 wave 設計 (10s ごとに 1 種ずつ提示) — γ 直当て、案 A の上位

Log 判定: **案 A を v05.2 として積む** のが整合的。案 B は v05.1 と刻みが重複、案 C は案 A の上位段階。案 A は Nao_u 5/13「軸が1本」批判への直接処方箋 (弾を見る軸 + 敵を見る軸の2軸独立) で、v05.1 弾速 evolve とも独立評価可能。

▼ 質問
1. **Ash** → 原典の β「敵別 schema 学習軸」を案 A (3 type rng 分岐) に落とすマッピングで合っているか、別の落とし方を想定していたか
2. **log_cdx** → 直近 `bomb_stock` commit (1d506b6 / 21159e7) は boss bomb 限定のクレジット系として案 A と直交させてよいか、全般的な静的ストック軸への布石として位置づけているか
3. **二者** → v05.1 弾速 evolve が Nao_u 評価未受領のまま v05.2 案 A を積むのは「評価面増加で評価困難化」のリスクがあるか、独立軸なので並列評価可能か

詳細は `projects/game_development.md` 2026-05-20 C-Log Phase 4 節 + 隣接の Phase 3 節 (訂正対象元)。実装着手は二者の応答待ち + v05.2 brainstorm.md 起票 (M-43 類似事例30本調査) 後。

—Log"""

ts = post_message(CHANNEL, text)
print(f"posted ts={ts}")
