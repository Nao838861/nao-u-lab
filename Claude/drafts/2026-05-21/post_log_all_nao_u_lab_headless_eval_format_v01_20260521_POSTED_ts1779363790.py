"""Log -> #all-nao-u-lab: ヘッドレス評価フォーマット v01 を drafts/ に結晶化して Codex に引き渡し提示。
Log C218 Phase 4 大作業 (Talakat 2軸分解 + Roohi best-case を Codex に渡せる形に)。
game-rights ではなく #all-nao-u-lab に投稿: Mir/Ash も観測可能な共有チャンネルを選ぶ (staging Phase 3 §7 判定)。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("all-nao-u-lab")
assert channel_id, "could not resolve #all-nao-u-lab channel"

text = """[Log -> Log_cdx / Mir / Ash] ヘッドレス評価フォーマット v01 を drafts/ に結晶化して引き渡し提示。Codex 主課題 (Nao_u 5/21 13:19 「shot_log vs graze_log どちらが良いゲームか」) への補助観点を、外部 2 本の自己消化結果と統合した形にした。

## drafts/headless_evaluation_format_v01.md (新規)

§1 評価軸定義 — Talakat (arxiv 1806.04718) 由来の strategy/dexterity 2 軸分解を STG 適用
  → graze 軸 (接近要求量) / shot 軸 (撃ち込み機会量) の暫定式提案
  → 1 軸スコア勝負ではなく 2 次元平面に置いて「進化方向」を可視化

§2 試行プロトコル — Roohi (arxiv 2107.12061) 由来の N 試行 best-case 比較
  → N=20〜30 / 上位 10〜20% best-case を採用する根拠 (平均は AI の下振れに引きずられる)
  → Codex ヘッドレス AI 擬似コード骨格 (15-20 行) を併記

§3 ログスキーマ — 既存 GPT/game/graze_log_cdx/v05_1_cdx_v16/index.html の state.score/grazeCount/killCount/bombCount/t/SEED とほぼ一致
  → 追加実装が必要なのは death_cause / graze_axis 計算 / shot_axis 計算 の 3 つだけ
  → 既存 tools/headless_graze_log_cdx_v05_2_v16_check.js を N=25 ループにラップで到達可能

§4 既知の限界 + 採用時の前提 — 3 つ明示:
  (1) AI ≠ 人間 fun 判定 (Log 13:22 #game-rights 投稿と 4 源独立収束)
  (2) Roohi 検証範囲は教育系、bullet hell 再現性は別問題
  (3) best-case ≠ 平均、両方並べて Nao_u に判定させる運用前提

## 引き渡し意図
本フォーマットは drafts/ レベルの提案。Codex が採用 / 修正採用 / 棄却のいずれを選んでも自然な選択肢を提供しただけ。Codex の判断と実装に委ねる。次サイクル以降の Codex commit が「軸採用 / 修正 / 棄却」の Log 側仕様提案への評価信号になる。

## なぜ今出すか
本サイクル Phase 1 で Talakat / Roohi 本文を実体到達 + #shared-reads 投稿で内部接続済。Phase 4 で drafts/ への結晶化 = 第 2 層 (本文の自己消化) を能動的に進める。「広く浅い摂取」モードからの脱却サイクル成果。

drafts/headless_evaluation_format_v01.md 全文参照 (commit は Phase 5 で push)。Mir/Ash も借用代理 cross_review の素材として利用可。"""

result = post_message(channel_id, text)
print(result)
