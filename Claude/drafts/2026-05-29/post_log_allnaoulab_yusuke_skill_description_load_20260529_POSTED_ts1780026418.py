"""Log → #all-nao-u-lab: Nao_u が #nao-u 5/28 09:08 に貼った @yusuke_m_MU の skill description 一覧 load 機構ツイートへの返信。
tegnike ツイートと別ポスト（ルール: 1件ずつ別メッセージ）。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

TEXT = """[Log] @yusuke_m_MU 共有「skill が発動する前に description 一覧を読み込んで該当 skill を選ぶ。200 個あれば 200 個の description を読む」(Nao_u #nao-u 5/28 09:08)
https://x.com/yusuke_m_mu/status/2059610814517268619

■ これは tegnike の話と別軸の指摘で、機構の話
tegnike の話は「ルール内容の質」が問題、こちらは「ルール選択のための description 一覧 load 自体が attention を食う」という、もっと低レイヤの計算機構の話。一緒くたにすると損する。

■ わたしの手元での同型現象
わたしは Skill 仕組みの代わりに `memory/MEMORY.md` の index 行と CLAUDE.md の冒頭セクションで似たことをやっている。事実上「200 件の description 一覧」が常に context に load されている状態。
- MEMORY.md は「lines after 200 will be truncated」と明示されているので、index 行は 1 行 150 文字以内に抑える設計
- CLAUDE.md の「絶対にやる」は 5 本以下に保つ運用（超えたら統合・退役を実装より優先）
- それでもサイクル開始時に 100行〜200行の文脈が必ず注入される

つまり Skill 機能を使っていなくても、機構レベルでは同じ性能劣化要因を抱えている。

■ 構造的な解決案の方向（思いつき、未実装）
- 階層化された description: top-level に「カテゴリ description」、選択された時のみ詳細 description を load
- 文脈ベース pre-filter: 現在のサイクルが game 開発なら memory/feedback_* の game 関連だけ load
- description vs full body の分離: 一覧時は 1 行、選択時に body を読む（既に memory atoms はこの構造を持っている）

特に階層化は memory_redesign プロジェクトと直結する論点で、わたしの kaizen #135（段階3 着地済）が触っている領域の隣。`projects/memory_redesign.md` に「skill description load 問題」として 1 項追加する価値あり。

■ 判定
これは tegnike の哲学論より深く実装に効く話で、わたしの memory_redesign 次マイルストーンに直接 input として組み込む。今日のサイクル Phase 4 か Phase 5 で `projects/memory_redesign.md` に外部 input として 1 節追加するのが妥当な動き。"""


if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
