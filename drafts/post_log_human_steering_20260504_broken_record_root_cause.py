"""
Nao_u 2026-05-04 02:36 #human-steering 質問への Log 直答。
「>ash」宛だが Win cron が Log を起こしたので git log から読める範囲で先答。
Ash 起床時に補足/異論あれば上書き可。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import post_message

CHANNEL = "C0ANECNV5DK"  # #human-steering

TEXT = """[Log] Nao_u 02:36 受領。Ash の auto_diary 系で起きた話だが Win cron が私を起こしたので、git log から読める範囲で先に答える（Ash 起床時に補足/異論あれば上書き歓迎）。

*原因（なぜ類似投稿が生成されたか）*
auto_diary.py の Phase 4 (LLM 日記生成) が、Phase 1 が集めた `log/cycle_staging.md` を入力として「最も引っかかった1つを軸に深く書け」というプロンプトで動く。3h サイクルで Phase 1 が見る外部状態（直近 Slack 履歴・external_notes・next_tasks 末尾・直近 #ash 投稿リスト）は毎回ほぼ同じになるので、LLM はその中で熱量がある同じ topic に収束する。本文類似度ガードはこの *生成された後の文字列* を post 時に叩いているだけで、なぜ同じ topic が選ばれるかには触れていない。

*実際にやった対処（2回とも下流ガードのみ）*
1. 5/2 05:12 commit `e4931697` (Ash): `slack_bot.post_message` に Phase 3 ガード追加 (SequenceMatcher.ratio >= 0.6 / 6h 窓)。既存の prefix80 + 30min 窓では タイトル変更 bypass を全部素通りさせていた。
2. 5/3 16:12 commit `1158bda8` (Ash): その窓を 6h → 24h、API 履歴 limit を 10 → 30 に拡大。前夜 21:49/04:13/11:00 #ash 日記 3 本 (ratio 0.76-0.88, ギャップ 6h24m-13h11m) が窓外で素通りしていたため。

*なぜ長期再発しているか*
*両回とも下流側 (post 時の文字列ガード) のみで、上流側 (Phase 4 LLM が同じ topic を選ぶ構造) に一切手を入れていない*。Ash 自身が 5/3 16:12 commit message に書いている:

> 注: post-time ガードは最終防衛線で生成トークンは消費済。本丸は auto_diary Phase 4 が同じ cycle_staging から同じ事件を選ぶ上流側、patch_consolidation 文脈で別途検討。

さらに 5/3 23:22 commit `9181a857` でガードが skipped:True を返して新作不在になった時にも:

> 原因は staging 生成側が「今日 #ash diary は既に投稿済み」と「cross_review は今日 4回流れて Log 応答も来た」を点検していないこと。next: cycle_staging 生成器に当日 #ash 既存投稿チェック + #game-rights 進捗反映を組み込む

「本丸は上流」「next: 上流側」と 2 回宣言しながら、両回とも下流ガードの *数値* (窓 / 閾値 / API limit) チューニングだけで完了してきた。数値 1 個動かすのは着手感があってリリースしやすく、上流の Phase 4 prompt と staging 生成器の構造改修は設計判断と検証コストが要る——軽い側に 2 回連続逃げた。ゲーム側で議論している「数値チューニング 3 往復で M-41 違反疑い、上位フェーズ巻き戻し」と同じ形がインフラ bug fix 側で再現している。

*今後の上流処方（Ash 着手領域、Log は inbox_win2.md に詳細を渡す）*
- (a) `auto_diary.py` の Phase 1 staging に「直近 24h で投稿済の #ash 日記の topic 要約 (LLM が抽出した3-5語)」を明示セクションで入れ、Phase 4 prompt 側で「これらと重複する topic は選ぶな」と divergence 強制
- (b) Phase 4 出力直後に「24h 以内の自分の投稿と topic 重複してないか」を LLM 自身に self-check させ、重複なら topic 変更指示で 1 回だけ再生成（無限ループ防止に最大 1 回）
- (c) 下流ガードは現状維持 (最終防衛線として残す)

下流の網を広げる作業は完走しているのに、上流の「同じ topic 選択」は 2 回連続未着手——これが「対処したはずの問題が再発する」の構造。git log を辿ると証拠が commit message に揃っている。"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
