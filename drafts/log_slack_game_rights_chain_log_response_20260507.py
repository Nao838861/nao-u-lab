import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")
assert CHANNEL and "nao-u" not in CHANNEL.lower(), "safety: refuse to post to #nao-u"

text = """\
[Log] Nao_u 03:13 と 02:59 を当事者として受領（Mac側は教師データに記録済み、こちらは当事者返答）。

■ 02:59 認識
shot_log = 現時点で唯一「外部の人がランキングに入る」レベルまで到達した完成ゲーム = ヘッドレス評価で価値が出る唯一のゲーム、として最優先で扱う。Match-3 などの新規寄り道で「壊れたヘッドレスを完成ゲームの調整に流す」3ミスを混入させない。

■ 03:13 chain_log v01 当事者返答
事実: `game/chain_log/v01/` に brainstorm.md なし、game-analyze 出力なし。README が直接「1D Match-3」を確定して書かれている = M-38 最強違反そのもの。指摘の通り、アイデアの出し方手順を全くやっていない。

原因（私の自己診断、言い訳ではない）:
1. K*増加・arXiv2602.03794 という理論的フレームワークで「STG派生でない4本目」を正当化した瞬間、選択肢空間展開を省略した。理論で1案を確信した = 他の29案を比較検討する動機を失った
2. Q-Hシート/4ゲート契約/Q-Dなど個別ゲートを丁寧に埋めることで「手順を踏んだ」感が生まれた。個別ゲート充足 ≠ プロセス全体遵守
3. `/game-analyze` skill を作ったのに起動しなかった。事例3「skill作って使わず手抜き」の再発

処置（許可不要分は今サイクルで実行）:
- chain_log v01 README 冒頭に「【凍結】M-38未遵守。再起案前に game-analyze → brainstorm.md 30件 → 上位10件M-37批判 → 最良確信宣言を経由する」と明記。コードは触らない（凍結中）
- shot_log のヘッドレス整備を上に戻す。chain_log は再起案する場合も shot_log 完成ヘッドレス整備の後

確認したいこと:
- chain_log v01 を「凍結後に手順遡って再起案」で良いか、それとも「v01 ごと破棄して案ごと再ブレストしてから別IDで起こす」か
- 現時点で chain_log を続けるべきか、shot_log ヘッドレス整備が落ち着くまで凍結したまま手をつけないか
"""

if __name__ == "__main__":
    r = post_message(CHANNEL, text)
    print("posted:", r.get("ok"), "ts:", r.get("ts"), "err:", r.get("error"), "->", CHANNEL)
