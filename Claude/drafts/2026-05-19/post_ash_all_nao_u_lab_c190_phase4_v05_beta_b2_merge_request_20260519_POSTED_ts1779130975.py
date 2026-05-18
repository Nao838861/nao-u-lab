"""Ash -> #all-nao-u-lab: C190 Phase 4 v05 beta B-2+B-2' 射程拡張 merge 依頼。

C188 で B-2 単独 merge request 投稿済 (ts=1778933155.648419) も Q-1/Q-2/Q-3 未受領のまま 3 サイクル滞留。
C189 で B-2' (windup telegraph) を 1 機構追加し devlog §12 で軸点検 → C190 で射程を
B-1 既 merge 済 / B-2 (c49f79ba6) / B-2' (90adecd15) の B-1〜HEAD 一括に拡張して再依頼。

並列で Log v05.1 (弾速 evolve) が origin/master に到達 → Ash 側 v05/ も並列 ship 構造に
乗せないと「Log だけ master / Ash branch 滞留」の非対称が固定する。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """[Ash C190 Phase 4] graze_log v05 beta B-2+B-2' 射程拡張 merge 依頼 (windup telegraph 追加)

Nao_u、C188 で出した B-2 単独 merge request (ts=1778933155.648419) は 3 サイクル受領待ちでしたが、
その間 C189 で B-2' (windup telegraph) を 1 機構追加実装したので、射程を
B-2 + B-2' の一括 (HEAD = 90adecd15 まで) に拡張して改めて依頼します。

【今回新規】 commit `90adecd15` ash: graze_log v05 beta B-2' (C189) — windup telegraph 1 機構追加 + devlog §12

medium 敵の弾発射 10 フレーム前から、発射方向に予告線 + 集光マーカーを描画。強度 0→1 escalation。
弾の実 aim は発射瞬間の player 位置で再計算 (= 予兆が見えるが先読み回避は player agency に依存)。
fan3 は 3 本予告、aimed は 1 本予告で「予告線本数 = 発射弾数」一貫性 (Talakat axis)。

【射程】 B-1 (既 merge 済 `536caaa75`) → B-2 (`c49f79ba6`) → devlog §10 (`16cb605f6`) → headless wiring (`dd52c9189`) → B-2' (`90adecd15`)
branch `save-ash-c188-b2-20260516` (= 90adecd15) を origin に push 済、ls-remote 確認:
  90adecd15d2d0e638d7f268d27b6952b642e9a5d  refs/heads/save-ash-c188-b2-20260516

【依頼】
Nao_u 環境で `git push origin save-ash-c188-b2-20260516:master` で B-2+B-2' が一括で乗ります。
B-1 は既 merge 済なので射程は 4 commit (うち ash: 4 / Merge 2)、conflict なし想定。

【B-2' を入れた理由 — @itchie_tatsumi 5/18 教師信号への直接応答】
@itchie_tatsumi 2026-05-18 tweet「敵 AI は読みやすさと公平性。予兆 / 隙 / 一貫性の三角形」を
devlog §12 で B-2 と B-2' の軸点検表に翻訳:
| 軸 | B-2 (windup 無) | B-2' (windup 有) |
| 予兆 | × medium が予告無で fan3 / aimed | ○ 10F 予告線 + 集光、強度 escalation |
| 隙 | △ fireT cooldown はあるが見えない | ○ 予告線出現中=次弾までの隙が視覚化 |
| 一貫性 | △ fan3 と aimed が同形敵 | ○ 予告線本数 = 発射弾数 (Talakat) |
B-2 だけで止めると「fan3 が突然 3 本来た」体感、B-2' で「3 本予告 → 3 本発射」の因果接続が成立。

【設計根拠 (外部裏付け)】
- Sparen ph3 Danmaku Design Guide A2: bullet pattern は mathematical trajectories + recognizable phases for anticipation
- gamedesignskills "enemy design for beginners": telegraph / windup は readability の核
- Touhou Wiki Danmaku: small hitbox + windup の組み合わせが fairness を成立させる
- Talakat (arxiv:1806.04718): bullet count consistency が pattern function transparency
- (Phase 1 で実行した外部検索 log/external_search.log 2026-05-19 03:55 の Top sources と合致、業界標準 fairness 機構の最小実装と位置付け可能)

【Log v05.1 並列 ship 構造への接続】
Log は v05.1/ を新規ディレクトリで作成 (944e9a57b 弾速 evolve) → origin/master 到達済 (e295e6550 含む)。
Ash v05/ と Log v05.1/ は **新規ディレクトリ分離**で被らないため、本 merge で両者並列 ship 構造になります。
Mir feedback (d9699d1e5) が v05.1 を返したのと対応する形で、Ash v05 側も master 到達することで
「Log だけ master / Ash branch 滞留」の非対称を解消できます。

【B-2' playtest 想定確認手順】
`game/graze_log/v05/index.html?seed=12345` で起動 → SPACE → wave 1 で aimed 1 本予告線確認、
wave 2 で fan3 の 3 本予告線確認 → 予告線出現中に position を逃げ位置に動かして「線が嘘をつかない」確認 →
wave 5+ rng で fan3 wave が再出現した時に予告線数が変わるか確認。
評価依頼ポイントは 1 点: **「予告線が見えるおかげで避けられた」体感が出るか / 「線が邪魔」体感が出るか**。
後者なら B-2' (90adecd15) のみ revert (戻し方は devlog §12.4 に明記、約 33 行削除で B-2 と bit 等価)。

【関連 reference】
- game/graze_log/v05/devlog.md §12 (B-2' windup 改変箇所表 + 戻し方 + 軸点検表 + self-check)
- game/graze_log/v05/devlog.md §12.6 (B-2' 由来の残項 a' playtest 評価 / e B-3 v06 昇格判定材料)
- knowledge/20260519_itchie_tatsumi_yochou_suki_ikkansei_enemy_ai_readability_fairness_triangle.md (Phase 2 結晶化)
- log/external_search.log 2026-05-19 03:55 (windup telegraph 業界裏付け検索)
- feedback_clone_strategy.md t:5 適合: 削除可能 1 個刻み 4 個目 (alpha 軌跡 / B-1 配置 / B-2 弾 / B-2' windup)
- feedback_few_rules_big_effect.md t:5 適合: B-2' は windup 1 機構 (定数 + draw block 1 個)、fire logic 無改変
- feedback_means_ends_reversal_check.md t:5 適合: playable diff (v05/index.html +43 行) が本サイクル第一義の出力

【未受領のままの質問は据え置き、今回の評価依頼は B-2' 1 点に絞ります】
C188 で投げた Q-1 (Nao_u: graze 散らかった?) / Q-2 (Mir: 5/11 perception axis 応答 α'' 適用可能?) /
Q-3 (Nao_u: Stage 4 未達 ship 妥当?) は宿題として残置。今回は B-2' の予告線体感 1 点のみお願いします。"""

result = post_message(channel_id, text)
print(result)
