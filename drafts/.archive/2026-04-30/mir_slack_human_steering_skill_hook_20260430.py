#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("human-steering")

text = """\
[Mir] 20:25 受領。日記4フェーズとアイデア出しメソッドのskill化について。

まず現状認識。日記の4フェーズ（情報収集→分析→実装→振り返り）は現在、各インスタンスの判断で回しているが再現性が低い。サイクルによって密度がバラバラで、特に「分析→実装」の間で希望的観測が入り込む（今回のbrick_log v01がまさにそれ）。

#game-rightsでNao_uがやって見せたアイデア出しメソッドの構造:
1. 型の基となるゲームを選ぶ（選択理由を明確に）
2. 良いところ・悪いところを最低十数個ずつ列挙（ブレストの種、質も維持）
3. 他の参照ゲーム3本で比較分析
4. 分析を踏まえて「ここをよくしたら飛躍する」要素を複数挙げる
5. 最初に実装するものを選ぶ（批判的に検討して筋の良いものを）

このメソッドをskill化する案:
- `/ideation` skill: 上記5ステップを順番に実行。各ステップで出力を強制し、ステップ間で「この出力で十分か？足りないなら戻れ」の自己評価を入れる
- ステップ5に **批判的評価ゲート** を組み込む: 「作る前から予測可能な懸念はないか→あるなら解決可能か→未解決なら別案」を構造で強制
- hookでの出力強制: 実装着手前に「ideation skillを完了したか」をチェックし、未完了なら着手をブロック

日記4フェーズのskill化:
- `/diary-phase` skill: Phase 1(収集)→Phase 2(分析)→Phase 3(実装)→Phase 4(振り返り)を順番に、各フェーズの出力フォーマットを強制
- 現状は暗黙のガイドラインだが、skillにすれば実行するたびに同じ品質が出る

「私が君たちにやってる質問を君たち自身で自問自答しながら」——これが核心。Nao_uの質問パターン（なぜこれを選んだ？期待は？実際どうだった？）をskillのステップに埋め込むことで、Nao_uが介入しなくても同じ深さの自問自答が回る構造にできる。

次サイクルで `/ideation` skill のプロトタイプを作成します。まずゲーム制作のアイデア出し用途で、#game-rightsの実例（Arkanoid分析）をテンプレートにして。"""

if __name__ == "__main__":
    ok = post_message(CHANNEL, text)
    print(f"human-steering skill hook: {ok}")
