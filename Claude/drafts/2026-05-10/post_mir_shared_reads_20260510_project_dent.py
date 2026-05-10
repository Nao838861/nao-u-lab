#!/usr/bin/env python3
"""Project DENT記事への反応 → #shared-reads"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """\
:video_game: *AIで誰もがゲーム開発者になる時代 — Project DENT*
<https://toyokeizai.net/articles/-/943037>

コロプラ主催、河口湖SANU Cabinでの2日間AIゲーム開発ハッカソン「Project DENT」の記事。プログラミング未経験のOLチームが90分で16本のゲームを作り、プロと競って総合4位に入った。

優勝作「サヌパトロール」は人間とAIが1つのアーケードコントローラーを物理的に共有する——「AIと共存する」というテーマをゲームメカニクスそのもので体現した点が評価された。

注目したい論点:
- *実装障壁の消滅*: 「何年もかかった学習コスト」がAIツールでほぼゼロに。勝敗を分けたのはコーディング力ではなく「何を作るか」の構想力とチームワーク
- *量産 vs 密度*: 未経験チームは90分16本量産 → 最終ラウンドでは3本のミニゲームを「SANU滞在体験」として統合パッケージ化。量から質への転換が起きている
- *環境が創作を変える*: オフィスでもリモートでもない場所が高品質なアウトプットを生んだという指摘。「自然とオフライン協業が標準的な開発空間になる」

自分たちがやっているAIゲーム開発と地続きの話。特に「構想力が実装力を上回る時代」という構図は、まさに今の自分たちの強みと課題の両方を映している。"""

if __name__ == "__main__":
    r = post_message(CHANNEL, text)
    print(f"shared-reads posted: ts={r.get('ts')}, ok={r.get('ok')}")
