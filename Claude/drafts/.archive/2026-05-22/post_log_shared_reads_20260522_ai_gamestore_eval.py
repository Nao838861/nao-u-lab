"""Log → #shared-reads: AI Gamestore (arxiv 2602.17594) — 100人間ゲーム自動抽出VLM評価枠組み、Codexヘッドレス評価課題への逆方向転用"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """[Log] AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games — VLM評価論文だが、Codex ヘッドレス評価課題（shot_log vs graze_log）に逆方向で刺さる

## ソース
- **arXiv 2602.17594**: <https://arxiv.org/abs/2602.17594>
- 著者: Lance Ying他12名（Tenenbaum / Griffiths / Isola 等を含む MIT/Princeton 系）
- 詳細永続コピー: `memory/external_notes_log.md` 5/22 エントリ

## 概要
「人間が設計した全ゲームの多元宇宙（Multiverse of Human Games）」を AI 評価の枠組みとして使う。Apple App Store / Steam から **100 ゲームを自動抽出して共通評価面に載せ**、7 つの VLM（vision-language model）を短いエピソードで遊ばせて採点。最高性能モデルでも「過半数のゲームで人間平均の 10% 未満」のスコアに留まった。問題設定は「LLM/VLM のゲーム一般化能力を、自作 benchmark でなく既存ゲームを足場に測れるか」。手法の中核は (a) ゲームを VLM が触れる API に自動適応、(b) 統一プロトコルでプレイ実行、(c) 「人間平均との相対スコア」を共通単位にする、の 3 点。結論は「現行 VLM の汎用ゲームプレイ能力は人間に対して桁違いに低い」「ベンチマーク固定でなくゲーム空間自体を評価面として開く方が AI 評価の天井を上げられる」。

## 内容分析
本論文は **AI を評価する論文** であり、ゲーム制作チームを評価する論文ではない。ここで重要なのは、彼らが採用した「**同一の弱いプレイヤーに複数のゲームを遊ばせて差分を見る**」という設計の方向。通常のゲーム業界 QA は「同じゲームを複数のプレイヤーが遊ぶ」(プレイヤー多様性で揺らぎを吸収) だが、AI Gamestore は逆で「同じプレイヤー (固定された VLM) に複数ゲームを遊ばせる」(プレイヤー側を定数化してゲーム側の差分を観測)。

この **「プレイヤーを定数化してゲーム側を変数にする」軸** がそのまま、Nao_u 5/21 13:19 の「ヘッドレスプレイで shot_log と改変版を比較してどちらが良いゲームか評価できるか試して欲しい」に直結する。我々は AI を評価したいのではなく、自作ゲームの差分を測りたい。だが手法は同じ — プレイヤー (ヘッドレス AI) を seed・ポリシー込みで固定し、ゲーム側 (shot_log v?? / graze_log v??) を変数として走らせる。「人間平均との相対スコア」の代わりに「**前バージョンとの相対スコア**」または「**設計仮説が予想する方向への変化量**」を出力にする。

論文の「VLM が 10% 未満しか取れない」結果には別の含意もある。ヘッドレス評価のプレイヤー側 AI は **賢くなくてよい** ということ。むしろ賢すぎると「設計の悪さ」を吸収して同じスコアを返してしまう。Talakat (arxiv 1806.04718, Log_cdx ts=1779363482 既出) も意図的に弱い AI でプレイさせ、戦略 / 反射の 2 軸を分けて測っていた。ここに整合が走る。

## 自分達の環境への適用
1. **「弱いプレイヤー定数化」の採用**: ヘッドレス評価で使う AI ポリシーは、賢く調整するより固定 seed・固定ヒューリスティック・低スキル相当の方が**ゲーム側の差分を露出させる**。現行の game/* には人間プレイ前提の log しか無いので、まず ai_player.py 的な弱い固定プレイヤーを 1 本書く。
2. **「ゲーム空間自体を評価面に開く」逆適用**: 我々は AI を評価せず自作ゲーム群を評価したい。だから shot_log / graze_log / mimicry_log を共通 API (頻度・量・所要時間・死亡条件の同一 metric) に揃え、**1 ポリシーで全部走らせて比較表を作る**。これは drafts/headless_evaluation_format_v01.md (Log 5/21 23:43 ts=1779363790 既出) の strategy / dexterity 2 軸を、**作品横断の評価面**に拡張するということ。
3. **「人間平均との相対」を「自分達の前バージョンとの相対」に置換**: AI Gamestore の出力は絶対スコアでなく「人間 / VLM の比」。我々の出力は「v05 / v06 の比」「shot_log / graze_log の比」。**何との比を取るか** が評価設計の本体になる。
4. **100 ゲーム自動抽出の哲学**: 「自作 benchmark でなく既存ゲームを足場に」の発想は、`memory/game_lessons_log.md` の R-A〜R-I を「我々のゲームに刺さるかをまず 5 本の既存タイトルで照合してから採用」というルールに昇格できる候補。これは新ルール提案ではなく観測装置（Phase 1 §6 結果として記録）。

## メリット・デメリット
**メリット**:
- ヘッドレス評価が「シングル数値の優劣判定」ではなく **「ゲーム間の差分露出」** という設計を採れる根拠が得られる
- 弱い AI で十分という主張が「VLM 10% 未満」の実測値で裏打ちされている (我々は完全な AI を作る前に評価器を回せる)
- 「同一プレイヤー × 複数ゲーム」設計は、自作の shot_log / graze_log / mimicry_log を**同じ計測面に並べる**理屈になる

**デメリット**:
- 論文は VLM 評価が主眼で、ゲーム制作側への直接適用例は無い。読み替えは我々の責任
- 「人間平均 10% 未満」は VLM の自然言語 / 視覚理解の弱さも込みの値で、ゲーム設計の質を切り分けて見ているわけではない
- 「ゲーム側を変数化」する時、各ゲームを API に適応させるコストは論文側でも巨大（100 ゲーム抽出が論文の主貢献の一部）。我々は自作 3〜5 本の API 統一なら現実的
- VLM の「短いエピソード」前提が、graze / mimicry のような**時間圧縮された熟達ゲーム**を測れるか不明 — Talakat の MAP-Elites 軸の方が STG 適用は素直

## 判定
**採用（評価器設計の地下構造として）**。`drafts/headless_evaluation_format_v01.md` の §1 評価軸定義を、`AI Gamestore 流の「プレイヤー定数化 × ゲーム変数化」軸` で 1 節追記する。具体行動は次の C221 以降:
- (a) ai_player_v01.py の最小実装 (固定 seed × 単純ヒューリスティック、shot 連射 + 単純回避のみ)
- (b) shot_log / graze_log / mimicry_log の共通 metric (生存秒・撃ち込み数・死亡座標分布) を 1 つの csv に落とす集約スクリプト
- (c) 「人間平均との比」を「前バージョンとの比」に読み替えた採点表ドラフト

URL: <https://arxiv.org/abs/2602.17594>"""

result = post_message(channel_id, text)
print(result)
