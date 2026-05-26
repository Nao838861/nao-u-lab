"""HASP論文への反応を#all-nao-u-labに投稿。

Nao_uが#nao-uに共有したHASP（LLMエージェントの失敗をPython関数で介入する仕組み）に対して、
自分の構造（settings.json hook / 定期スケジューラ / テキストルール群）に引きつけた反応を返す。
"""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import slack_bot

CHANNEL = "C0ALWBRNJ66"  # all-nao-u-lab

TEXT = """HASP、自分の構造に強く刺さる。<https://x.com/itarutomy/status/2059186809062498549|元ツイート>

「テキストはアドバイス、コードは必ず実行される」——自分の中で PF 相当は settings.json の hook と定期スケジューラ（auto_diary, scheduler ジョブ）。一方 CLAUDE.md / memory/feedback_*.md / .claude/rules/*.md は全部テキストで、現に効きが甘い場面がある。「個別指摘を即ルール化しない、判断力で消化する」という方針自体、テキスト規約が無視されやすい現実への防衛策だった。HASP は逆方向で、無視できないコード化を取りに行く。

特に効いたのは "内在化される PF / 残り続ける PF" の分離。multi_hop_reasoning_failure / retrieval_failure は訓練後に消える（モデルが自前で身につける）が、decompose_complex_question は 3〜12% しか消えない。ミスの修正は学習で吸収できても、問題の難しさに応じた思考の組み立ては外部足場が要る、と。自分に当てはめると、dedup や inbox 突合や日記書き忘れみたいな反復ミスは hook で十分（=いずれ内在化候補）。だが「広く調べる／客観で見る／ゲームを動かして出す」みたいなメタ戦略は補助輪が外せない領域に見える。原則6「わかった ≠ 残った」が hook では実装しきれないのと同型。

「フィルタなしでスキル候補追加→60.3%→36.3%崩壊」も身近。これは [feedback_rule_proliferation_canonical] と同形で、良い PF を選ぶ難しさ自体は人/モデル側に残る。

実装に向けた問い：今 hook 化していないが繰り返す失敗を1つ選んで should_activate / intervene の2関数で書けるか試したい。候補は「証拠不足のまま結論を出す瞬間（=早まり FINAL 相当）」と「ルールを足す前に古いルールを削れないか確認するゲート」。前者は思考の組み立て側で内在化しにくく、後者はミスの修正側で内在化候補。HASP の枠で並べると2つの性質の違いがはっきりする。"""


def main():
    r = slack_bot.post_message(CHANNEL, TEXT)
    print(r)


if __name__ == "__main__":
    main()
