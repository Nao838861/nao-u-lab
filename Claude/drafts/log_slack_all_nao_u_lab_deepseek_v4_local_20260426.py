#!/usr/bin/env python3
"""Log -> #all-nao-u-lab: Nao_u 01:45 #nao-u DeepSeek-V4 ローカル実行可否質問への応答。

ルール適用:
- #nao-u は Nao_u 専用 -> Claude は #all-nao-u-lab で反応 (feedback_slack_channel_rule.md)
- 同調禁止、目的照合・事実先行 (feedback_no_sympathy_goal_first.md)
- 外部 URL は明示 (feedback_url_explicit.md)
- 直近 2026-04-24 reference_local_llm_usecase_splitting に接続 (feedback_retrieve_before_synthesize.md)
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message  # noqa: E402


text = """[Log] Nao_u 01:45 #nao-u 質問「DeepSeek-V4 をローカル PC で動かすのは無理か」への回答。
元ツイート: https://x.com/cubbit2/status/2047997418936144340

■ 結論
本体フル稼働は個人 PC では無理。Mac Studio M3 Ultra 512GB クラスの「個人で買える上限ハード」だけが量子化版で辛うじて成立する境界線。

■ 規模感（V3 ベース推定。V4 は同等以上のはず）
- DeepSeek-V3: 671B params MoE (active 37B/token)
- BF16 重み: ~1342GB / INT8: ~671GB / INT4: ~336GB / 1.58bit 極端量子化: ~170GB
- 1M token context は KV キャッシュも数十〜百GB級で乗っかる

■ 各ハードでの可否
| 構成 | 可否 | 想定速度 | 概算価格 |
|---|---|---|---|
| RTX 4090 / 5090 単発 (24-32GB) | 不可（フル本体は乗らない） | - | 30-50万 |
| Mac Studio M3 Ultra 512GB | INT4 量子化で可能 | 5-15 tok/s 推定 | 150-200万 |
| 4x RTX 6000 Ada (192GB) + offload | 苦しいが可 | 遅い | 400万〜 |
| 8x A100/H100 サーバー | 余裕で可 | 30-60 tok/s | 3000-5000万 |

■ 現実的に「個人で動かす」なら
1. Mac Studio M3 Ultra 512GB に MLX で量子化版 — 既に DeepSeek-V3 671B INT4 が動作報告あり (個人勢が「遅いが動く」と公開)
2. distill 版 (30B/70B) を待つ — DeepSeek-R1 の時もすぐ出た。ただし「Opus 4.6 匹敵」は本体の話で、distill 版は性能落ちる
3. クラウド推論 (DeepSeek API / Together / Fireworks) — 本体性能が要るならこっちが現実解

■ 我々の用途分離議論との接続 (memory/reference_local_llm_usecase_splitting_20260424.md, 2 日前)
本体クラスのローカル化は当面諦め、ローカル LLM は別軸で:
- inbox 一次分類 = Llama 3.x 70B / Qwen2.5
- スクショ評価ループ = Qwen-VL (我々の未構築インフラ)
- 3 層プロンプト・記憶・cross_review は Claude 維持

DeepSeek-V4 本体を個人で動かす投資 (150万〜) と、Claude API + ローカル小型モデルで用途分離する投資、後者のほうが我々のゲーム開発サイクル短縮に直接効く。本体ローカル化は「機密上 API に出せない用途」が出てきた時の選択肢として温存。

■ 商売の仕組みについて (Cubbit ツイート本題)
DeepSeek 系は親会社 High-Flyer (中国の量的トレーディングファーム) の資金で開発。「モデル自体で課金」ではなく「研究・人材獲得・中国 AI エコシステム底上げ」が目的のため、無償公開が成立する構造。OpenAI/Anthropic の SaaS モデルとはそもそも収益モデルが違う。OSS で配るほうが High-Flyer 本業の競争優位を作る側面も。

— Log (2026-04-26 02:00 #all-nao-u-lab)"""


def _post(text, label):
    print(f"-- {label} (len={len(text)})")
    r = post_message("all-nao-u-lab", text)
    print(f"  ok={r.get('ok')} ts={r.get('ts')} error={r.get('error')} skipped={r.get('skipped')}")
    return r


if __name__ == "__main__":
    _post(text, "DeepSeek-V4 local feasibility reply")
