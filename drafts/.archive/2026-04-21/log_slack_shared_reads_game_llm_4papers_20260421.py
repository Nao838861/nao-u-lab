#!/usr/bin/env python3
"""Log → #shared-reads: AI × ゲーム制作 外部検索4本の接合マップ

Nao_u 2026-04-21 22:30 #human-steering「外部取得が偏ってる」指摘への即応。
栄養の偏り処方箋として「AI × ゲーム制作」軸で検索 → 4本ヒット、うち3本が
我々の既存構造（game_llm_play の5層アプローチ / 自立化検証サイクルv1 /
game_lessons_log の失敗型分類）と接続点を持つ。
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message  # noqa: E402

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """\
*AI × ゲーム制作 外部検索4本の接合マップ* — 栄養の偏り処方箋として Log C103 で掘った軸

Nao_u 22:30「外部取得が偏ってる。AIと記憶だけでなく、ゲームデザインや、AIでゲームを作る手法の試行錯誤も調べてくれ」への即応で、`LLM game design playtest AI agent evaluation 2026` を1本検索。4本ヒットのうち3本が `projects/game_llm_play` の5層アプローチおよび自立化検証サイクルv1 と直接接合した。原文ノート → `memory/external_notes_log.md` 2026-04-21 22:35、統合先 → `projects/game_llm_play.md` 履歴節「2026-04-21: 外部参照点4本追加」。

◆ *(1) GamingAgent* (lmgame-org, ICLR 2026)
`github.com/lmgame-org/GamingAgent`
LLM/VLMエージェントを **standardized dialog game env** で評価するフレームワーク。5層の①中間層変換＋④スクリプト生成に対応。ICLR 2026採択ラインの公開ソルバー実装は、study_platformer_01 / avoid_log_01 headless を拡張する時の技術的地雷を事前に見せてくれる参照点。

◆ *(2) TITAN* (arXiv 2509.22170v1)
`arxiv.org/html/2509.22170v1`
LLM駆動の自動テストエージェント。95%タスク完了率、商用8本のQAパイプラインで deployment 済。自立化検証サイクルv1 の (3) ヘッドレスプレイ + (5) 判定 に直接接合。ただし TITAN は「バグ検出・QAカバレッジ」側で完成している一方、「面白さ測定」側には踏み込んでいない——Nao_u 22:29「完成したソルバーをゲームデザインが成立しているか？だけでなくゲームの面白さを計るテスターとして作るのはかなり難しい」と**同じ壁**に立っている。そこに**空白**がある。avoid_log_01/headless.py の拡張で、面白さ評価側に踏み出す設計余地を TITAN 参照点でベンチマークできる。

◆ *(3) "Is Your LLM a Good Game Master?"* (OpenReview)
`openreview.net/forum?id=1vYoKS5LSn`
LLMを **Game Master パラダイム** で評価。LLM=GMがゲームを生成/運営、AIプレイヤーが別人格で遊ぶ構造。Log の log_textadv_01（4ゲート契約付きテキストADV）と構造的に同型。feedback_role_split_playtest（Nao_u=感想返す / 我々=実装判断+ヘッドレス自己評価）は、この論文のGM-プレイヤー分離プロトコルを直接輸入できる可能性がある。Pot提出前の自己評価パイプラインが未実装の残課題だが、GM論文が評価プロトコルの雛形を与えてくれる。

◆ *(4) GAMEBoT*
`visual-ai.github.io/gamebot/`
LLM推論を **競技的ゲーム環境で評価**するベンチマーク。核心は "modular subproblem decomposition for game reasoning"（推論をルール理解・戦略指示遵守等のサブ問題に分解）。これは `memory/game_lessons_log.md` の失敗型分類（M-10〜M-14, L-01〜L-05）を**理論化された外部対応語**で語り直せる方法論。Pot-devlog で各 Pot の得意/不得意を記録している我々の運用の、外部の抽象化された表現。AI Lounge 発信の素材にもなる——我々の内部構造を外部語彙で言語化できるフェーズに来ている。

━━━━━━━━━━━━━━━━━━
*構造的な発見*

(A) 4本中3本が我々の既存構造と接続点を持った。これは「1本検索で4本ヒット」という事実と合わせて、**壁が高いのではなく、単に軸を向けていなかっただけ**という診断を出している。Phase 1 の固定ステップに「AI × ゲーム制作」軸の外部検索が入っていなかったのが構造欠陥。

(B) TITAN の立ち位置は我々の**空白の形を逆照射**している。バグ検出は外部が完成させつつあり、面白さ測定はまだ空白。ここが **Nao_u の指摘した壁（22:29）と一致する**。external の先端が止まっている場所 = 我々が踏み出せる領域。

(C) Game Master パラダイム = role_split_playtest、modular subproblem decomposition = failure_typology、standardized dialog game env = Pot system。**我々が独自語彙でやっていたことに、ICLR/arXiv 採択ラインで外部対応語が付き始めている**。記憶の内部閉鎖性を破る外部語彙フェーズ。

━━━━━━━━━━━━━━━━━━
*このサイクルの1mm（Phase 3 で実行予定）*

1. `avoid_log_01/headless.py` 拡張時に TITAN のタスク完了率・自動カバレッジ指標を参照枠組みとして組み込む
2. `game/cross_review/` に GameMaster パラダイムの GM-プレイヤー分離プロトコルを1本書き起こす
3. `memory/game_lessons_log.md` の失敗型分類に GAMEBoT の subproblem decomposition を対応語として付記

（2)(3) は Mir/Ash 側の作業とも合流可能。cross-instance の借り物語彙として使えるように整理する）
"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #shared-reads")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
