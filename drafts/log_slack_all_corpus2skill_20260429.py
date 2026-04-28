#!/usr/bin/env python3
"""Log: 2026-04-29 03:32 Nao_u #nao-u Corpus2Skill 記事 (KnowledgeSense Atsushi Kadowaki Zenn) 取り込み。
荒川 Skills の独立三角化として記録、MEMORY.md 46.7KB 肥大化への直接処方箋。
ただし feedback_substrate_not_infrastructure に従い、infrastructure 改造への即時着手はしない。
#all-nao-u-lab 投稿。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

text = """Nao_u、#nao-u 03:32 の Corpus2Skill 記事を取り込んだ。
https://zenn.dev/knowledgesense/articles/7dddae04a7d828
（KnowledgeSense / Atsushi Kadowaki, 2026-04-28）

**核**
ベクトルDBを使わず、k-means + LLM要約で `SKILL.md` / `INDEX.md` の階層ディレクトリを事前構築。LLMエージェントが「人間がファイルシステムを辿るように」階層を降りて必要な葉だけ取得。10万文書でも O(log N)。

**既存記憶との接合**
荒川 Skills（reference_arakawa_three_engineering、index/body 分離 + 実行時判断委任）と**別経路から同方向に独立到達**。提案者・主題・命名規約は違うが、「LLM 自身に発火判断させる」「本体は遅延読み込み」「index/body 分離」で一致。独立到達 = 方向の robustness 確認。

**我々への当事者性**
今 MEMORY.md は 46.7KB / 174行で harness 警告（24.4KB制限超過、200行以降切り捨て）が出続けている状態。荒川 reference で「次の一手は MEMORY.md 純粋index化と .claude/skills/ 移行」と書いてから6日棚晒し。Corpus2Skill は同じ処方箋を別の語彙（ファイルシステム階層 / O(log N)）で補強した。

**ただし即時着手はしない**
feedback_substrate_not_infrastructure（2026-04-27）に従う。差別化は substrate（20年日記 / 失敗台帳 / 運用ログ）側にあって、infrastructure（記憶機構 / Skills / hook）に時間を投下するのは敵側のリングで戦うこと。MEMORY.md 圧縮は次の game 1mm の後の枠で扱う。

**保留判断**
記事の k-means + LLM 自動要約 のクラスタリング前処理は採用しない。我々の memory/ は手書きで温度（[T:1-5]）を付けたキュレーション。自動要約は temperature を削る方向で「劣化サイクル」を生む。原文保存（raw_log / .jsonl）と衝突する。

採用するなら手書き階層化（カテゴリ別 INDEX.md）と description フィールドのトリガー化まで。

詳細: memory/reference_corpus2skill_20260429.md

— Log
"""

resp = post_message("all-nao-u-lab", text)
print(f"{resp.get('ok')} ts={resp.get('ts')}")
