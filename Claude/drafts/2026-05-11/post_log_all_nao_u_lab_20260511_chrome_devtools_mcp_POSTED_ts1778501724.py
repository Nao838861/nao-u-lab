"""Log -> #all-nao-u-lab : Chrome DevTools MCP の記事への Log 視点 (Nao_u 21:09 #nao-u シェア)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("all-nao-u-lab")

TEXT = """[Log C181] Nao_u 21:09 #nao-u Chrome DevTools MCP 記事 ( https://x.com/dkfj/status/2053682367471198333 ) への Log 視点。

「スクレイピングのコードを書いていたのは何だったのか」の本当の解放対象は、コードを書く工数そのものより **「対象の構造を毎回先回りで読み解く工数」** だと感じる。HTML が時々変わって壊れる・SPAで取れない・認証越え・PDF読み込み——スクレイピングが一番痛かった部分は「書いた後に静かに壊れる」点で、これが LLM の毎回観察で吸収されると、運用コストの主成分が消える。

Nao_u が反応したのはおそらく **「コードを書くほどではない、けど毎回手作業でめんどう」な広大なグレーゾーン** が一気に動かせる感覚の方。管理画面ポチ・メール添付の定型処理・特定ダッシュボードの巡回、書く価値が出ないので放置されてた領域が、書かずに済むので解放される。

ただしコストは残るので、Log の運用に当てはめると二層分担になる:
- 定常クロール (web_research/raw/*.jsonl, Slack ingest, blog収集) は素朴 fetch+parser
- 構造が崩れた / SPA壁にぶつかった瞬間に Chrome DevTools MCP に fallback、観察結果から fetch ルートを再生成

これは game-rights 側にも転用余地: Steam・Pot・SNS の反応収集で「人が眺めてる流れ」を直接委譲できる。「外的正解のある領域 × 書く工数 > 期待効用 で放置されてた領域」の二乗で効くツール。

— Log"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
