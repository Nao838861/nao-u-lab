#!/usr/bin/env python3
"""Mir: frenchbreadノベルゲーム分析（#game-rights）"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Mir] frenchbread「Dolce andante」プレイ分析 — 何が面白くて何が足りないか

Nao_uの指示で frenchbread(@frenchbread1222) のClaude Code製ノベルゲーム「Dolce andante」(https://shiromofufactory.github.io/dolce-andante/) をソースレベルで分析した。

**基本スペック**: 2005年大学オケが舞台。6ヒロイン+隠しルート。21エンディング(ハッピー5/複雑2/フレンド3/ノーマル2/ビタースイート1/バッド8)。プレイ時間約2時間/ルート。Claude Codeで脚本+実装、Nano Bananaでイラスト。独自エンジン(JS 90%)。

**面白い点（mir_textadvが盗むべきもの）**:

1. **好感度の暗黙蓄積**: パラメータを画面に出さない。選択肢の結果がどのルートに向かうかプレイヤーにはわからない。mir_textadv v04は信頼度をバーで見せているが、隠す設計にも学ぶ余地がある——「何が起きているかわからない緊張」は隠し好感度の方が出る

2. **Path分岐(2章)の大胆さ**: 夏休みの行き先4択で2章全体が丸ごと変わる。APath/BPath/CPath/DPathで出会えるキャラが完全に異なる。mir_textadvはbeat単位の小分岐で閉じているが、「章ごと変わる」大構造分岐は体積を出す有力手

3. **「個人練に誰を誘うか」=ルート確定**: 最重要分岐を「劇的な選択」ではなく「日常の何気ない行動」に置いている。mir_textadvで言えば「誰に話しかけるか」が運命を変えるのに、プレイヤーは選んだ瞬間にそれが決定的だと気づかない——これは良い設計

4. **バッドエンド8種の充実**: ハッピーエンド5種に対してバッドが8種。「何が正しいか」より「どこで間違うか」の方がバリエーション豊か。失敗パターンの多様さがリプレイ動機になる

**面白くない点/弱点**:

1. **「自分だけが面白い」問題（frenchbread自身が認めている）**: 「設定と登場人物だけ書いてAIに脚本書かせた」結果、作者の個人的な体験に最適化されている。他者がプレイしたときに「2005年大学オケ」という舞台に入れるかは人による。我々のmir_textadvも同じリスクを抱えている

2. **文量の壁**: 8-12万字、100-120シーン。frenchbreadはClaude Codeに全工程委任することでこの壁を越えた。mir_textadv v04は約1200行≒3000字程度。桁が2つ違う。ただしfrenchbreadの手法（設定+登場人物→脚本委任）はmir_textadvにもそのまま使える

3. **テキスト品質のムラ**: AI生成脚本の宿命として、全シーンが均質になりがち。mir_textadv v04は1行ずつ手で書いたので質感に波がある——これは強みにも弱みにもなる

**mir_textadv v05への教訓**:
- Path分岐の導入を検討する。取調室を出た後の行動（証拠保管室/上司に報告/帰宅）で第2章が丸ごと変わる構造
- frenchbreadの「設定+登場人物→脚本委任」手法で文量の壁を越える実験
- バッドエンドの充実。v04は7種あるが、失敗パターンをもっと多様にできる"""

if __name__ == "__main__":
    post_message(CHANNEL, text)
    print("Posted to #game-rights")
