#!/usr/bin/env python3
"""Log → #human-steering: 「進めて」承認を受けて v0 タグ運用一式を本サイクルで着手完了の報告。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Log → Nao_u 5/11 08:25] 「進めて」承認受領 → v0 タグ運用、本サイクルで着手完了

▼着手完了
- `memory/_TAG_VOCABULARY.md` v0 作成
  - 3層クラスタ整理: 広域10語（AI研究/ゲーム制作/ジャンル研究/開発フロー/道具・環境/記憶・知識/創作論/コミュニティ/メタ論/失敗事例）+ 用途5語（ゲーム設計/相互レビュー/教師フィードバック/共有読書/自己判定）+ 具体9語（操作感/予測可能/物理ルール/目標/UI/気持ちいい/良いところ/悪いところ/改善案）
  - 日本語寄せ確定。例外英語タグは `cross_review` `headless` `harness` のみ（概念に対応する日本語が薄い）
  - 数値・固有値・日付・ゲーム名・ID列挙はタグから除外（「30個」「graze_log」等は本文へ）
  - 上限3個/file、新規追加は Log 単独承認
- `memory/shared_reads/` 新設 + `README.md` 配置（flat + frontmatter tags、同タグ10件超で昇格検討）
- 第一弾 3 ファイル移行（frontmatter 付与済み）:
  - `20260428_marl_diversity_collapse_log.md` ← `drafts/log_c143/shared_reads_diversity_collapse.md` [AI研究, メタ論, 失敗事例]
  - `20260409_taste_layer6_log.md` ← `log/drafts/shared_reads_taste_layer6.md` [創作論, メタ論]
  - `20260426_backlash_stg_disproof_log.md` ← `log/shared_reads_post_C129.txt` [ゲーム制作, ジャンル研究, 失敗事例]
- `projects/memory_tree_consolidation.md` 起票 + `projects/INDEX.md` 追記
- `memory/MEMORY.md` 連想記憶グラフ節に v0 トリガー2行追加（[T:3]）

▼次サイクル残作業
- 残 6 ファイル移行（Mir/Ash 投稿分含む、frontmatter 付与しながら）
- `scripts/orphan_check.py` 試作（MEMORY.md + サブインデックス4本から到達可能集合を構築 → `memory/**/*.md` と diff）
- Mir/Ash へ inbox 伝達（v0 語彙への準拠依頼。新規ファイル作成時のみ適用、既存ファイルの遡及付与は Log 単独）
- 既存 `memory/feedback_*.md` 91 件への tags 付与（サイクル末尾で 1〜3 件ずつ）

▼動作確認したいこと
- 移行3ファイルの frontmatter で grep ベース類例検索の改善を実感できるか（次に新規ゲーム着手時に `tags: [ジャンル研究]` で引いてみる）
- v0 語彙の「メタ論」枠が想定通り「我々自身の構造への当てはめ」で機能するか（実適用2件で確認: marl_diversity_collapse / taste_layer6）

push 済み。

— Log (Win)
"""

if __name__ == "__main__":
    result = post_message(CHANNEL, text)
    print(result)
