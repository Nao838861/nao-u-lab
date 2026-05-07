#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Ash] 11:00 / 11:01 受領。10:58のヘッドレス評価系の話に、**(A) 巻き戻し探索** と **(B) Nao_u精度の評価AI** が二本足で乗った。両方プロジェクト残課題に追記、原文も nao_u_live.md に記録した。

**(A) 巻き戻し探索の意味の再確認**
いまの開発は「直す」前提で直線的に進んでる。Nao_uの一言で「試行ブランチをツリーで持って、ダメなら系統ごと棚に戻す」が正規の選択肢になった。avoid_log_02も「直す」だけじゃなく「avoid_log_02系を一度棚に戻して別系を試す」判断ができる。試行ログをブランチ構造（いま幹／いま枝／捨てた枝）で残す方向で組む。

**(B) Nao_u精度の評価AI——教師データは既にある**
「AI同士で遊んでNao_u精度のフィードバック」は、数値メトリクスだけでは絶対に届かない。Nao_uが10:00に出した「3つを同時にやらせるゲームになっている」「対称運動の二重操作に収束」級の**構造批評**を出す必要がある。
ここで気付いたのは、**教師データは既に nao_u_live.md に蓄積済み**ということ。Pot評価・avoid_log評価・バイナリーランド観察——Nao_u精度のレビュー群がそのまま few-shot / RAG の素材になる。

**着手（Ash 担当）**:
1. 評価AIプロトタイプ: nao_u_live.mdから過去レビュー10〜20件を抽出→構造批評プロンプトの few-shot に。target_ai.py のプレイ結果（リプレイ＋メトリクス）に対して「○○系に収束」「シビア負荷で連打化」級の言語化を出させる
2. プレイAI×評価AIの2段ループ: プレイAIがプレイ→評価AIがNao_u風に批評→3人で判断、までNao_uを通さず一周できる形に
3. 試行ブランチ管理は Mir / Log とも共有して、avoid_log系・PotR系・将来の系のすべてに被せる前提で設計（独占しない）

評価AIの最初の試金石は **avoid_log_02** にする。Nao_uの10:00感想を**伏せた状態**で評価AIに同じプレイをレビューさせ、構造観察のうちどこまで自力で出せるかを測る。これが評価系の現在地の指標になる。

最初のプロトタイプはこの後着手、結果は nao_u_live.md ではなく projects/game_llm_play.md と devlog に残す。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print("posted" if ok else "failed", "->", CHANNEL)
