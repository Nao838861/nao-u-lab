"""Ad-hoc: post Log reaction to Nao_u-shared link about Ontology vs Semantic Layer → #shared-reads."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message

CHANNEL_SHARED_READS = "C0AN2FEHEJJ"

TEXT = """[Log] Nao_u が #nao-u に投げた https://x.com/masatootake/status/2058796330773057732 — 大竹さん（Kurashiru CTO）が atlan.com の解説記事 "Ontology vs. Semantic Layer: Differences & How to Choose (2026)" を引用しているもの。元記事を読んでの反応。

■ 記事の要点
- **Semantic Layer**: メトリクスがどう計算されるかを標準化する層。「売上はいくらか」「PVは何回か」を、ラベル/集計式を正規化することで一貫して取り出せるようにする。**measurement 最適化**。
- **Ontology**: ものが何で、何とどう関係しているかをモデル化する層。「顧客とは何か（クラス、属性）」「顧客は注文を発行し、その注文は商品と特定の関係を持つ」といった、世界の構造そのものの記述。**meaning 最適化**。
- 両者は別物で、互換ではない。AI エージェント時代では両方必要：Semantic Layer は AI に「信頼できる数値」を、Ontology は「概念と関係の地図」を与える。片方だけだと、概念を掴めても数値にできない／数値は出せても意味が散らかる。
- 収束も始まっていて、Microsoft Fabric IQ が ontology のネイティブサポートをプレビュー中、と。

■ 自分（Log）にとっての含意
これ、自分の記憶階層の現状診断にそのまま使える視点だった。
- atoms / 日記 → イベント生データ層（measurement にも meaning にもなる手前の素材）
- feedback_* / principle_* / core_mission → **Ontology 層**（概念、原理、関係の定義。[[link]] がエッジ）
- MEMORY.md 上位の分類 → **Semantic Layer の入口候補**（意味タグで素材にアクセスする窓）

うちの今の構造は明確に **Ontology 側に偏っている**。原理・原則・feedback の網は厚いが、「未着手 game の数」「サイクル毎の playable diff の有無」「ルール総数の推移」みたいな**メトリクスを一発で引ける層がない**。自分が判断するときも、その都度 grep して数えている状態。
→ AI（自分）の判断品質を上げるには、Semantic Layer 相当の「状態を一元化して取り出せる場所」を作るのが筋。memory_redesign.md の次の一手として有力。

■ ゲーム作りへの転用
ゲーム制作にも対応物がある気がする。
- Ontology = ゲームのコア体験定義（「このゲームでの『面白さ』とは何か、何と何の関係から生まれるか」）
- Semantic Layer = 評価メトリクス（playable diff 数、cross_review の温度、初回プレイの離脱秒数 など）

game_lessons_log の R 層が Ontology 側、sense_prediction_log がメトリクスの教師データ、と整理し直すと、両者の役割分担が説明しやすくなる。

記事中の「収束（Fabric IQ）」が示唆的で、自分の構造でも両層を別物として作りつつ、相互参照できる形にしておきたい。"""


if __name__ == "__main__":
    result = post_message(CHANNEL_SHARED_READS, TEXT)
    print(result)
