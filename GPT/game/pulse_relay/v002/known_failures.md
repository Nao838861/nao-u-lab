# known failures

このファイルは未達を曖昧に先送りしないための記録。完成時点で、実装へ反映したもの、残ったもの、次に最初に検証すべきものを分ける。

## 現時点の制約

1. v001 のソースや敵配置を参照しない制約のため、v001 との直接的な実装差分比較は行わない。
   - なぜ未達か: 今回の指示が「v001 と無関係に、v001 を参照せず」だから。
   - 次に検証する方法: 記憶から抽出した文法、headless/timeline/overlap/visual review の証跡で、v001 レベルの成立性へ近づける。
   - 放置すると何が劣化するか: 「v001 レベル」と言いながら客観比較なしになる。

2. 音がない。
   - なぜ未達か: この版は canvas + deterministic game model に集中し、音 asset と audio timing は入れない。
   - 次に検証する方法: 敵撃破、pulse、boss phase の視覚 feedback で最低限のテンションを作る。
   - 放置すると何が劣化するか: テンションや手応えは音付き STG より弱くなる。

3. visual review は自動動画解析ではなく、route sample と実プレイ確認相当の観点記録で行う。
   - なぜ未達か: 今回は v001 参照なし、外部動画なしで進めるため。
   - 次に検証する方法: 秒単位の route sample、manual browser check、timeline 指標を組み合わせる。
   - 放置すると何が劣化するか: 不格好な動き、掃け方、テンポ感を見落とす。

## 完成前に必ず埋める

- overlap check の結果: `pairOverlaps: 0`, `minGap: 2.29`。過剰に離さず、かなり密な最近接を残した。
- timeline eval の結果: balanced clear 70.23 秒。boring runs なし、visible-but-not-shootable runs なし、heavy pressure なし。
- headless の結果: balanced clear 70.23 秒、aggressive clear 65.80 秒、pulse-heavy clear 70.28 秒、conservative は 53.77 秒で over。
- boss ideal TTK と pulse burst TTK: normal 15.97 秒、pulse burst 11.77 秒。
- visual review の秒数付きメモ: `visual_review.md` に記録済み。
- self judgment の分類: `self_judgment.md` に記録済み。

## 残す未達

- conservative policy が落ちる。これは「避け重視で火力が低いと boss が長引いて被弾する」問題を示す。全 policy clear を必須にすると難度が下がりすぎる懸念があるため、この版では known failure として残す。
- 音と実プレイ動画レビューは未実施。canvas primitive の視覚 feedback のみで手応えを作っている。
