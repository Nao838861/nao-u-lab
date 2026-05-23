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

- overlap check の結果: formation/speed 修正後は `pairOverlaps: 0`, `minGap: 3.49`。密度は残しつつ、見た目で窮屈すぎる最近接は避けた。
- route motion check の結果: `scoutRail.exit max 9.65`, `sideLance.exit max 7.41`, `sideArc.exit max 7.33`, `diverCut.exit max 12.37`, `carrierWake.exit max 4.41`。前回の 40px/frame 台の異常速度は解消した。
- timeline eval の結果: formation/speed 修正後は balanced clear 71.50 秒。boring runs なし、visible-but-not-shootable runs なし、heavy pressure なし。
- headless の結果: formation/speed 修正後は balanced clear 71.50 秒、aggressive clear 66.65 秒、conservative clear 73.23 秒、pulse-heavy clear 72.95 秒。`verify.js` は全 policy clear 必須へ強化した。
- boss ideal TTK と pulse burst TTK: normal 15.97 秒、pulse burst 11.77 秒。
- visual review の秒数付きメモ: `visual_review.md` に記録済み。
- self judgment の分類: `self_judgment.md` に記録済み。

## 残す未達

- formation/speed 修正は headless と route sample で確認したが、実ブラウザ上で「編隊としてまとまって見えるか」はまだ目視確認の余地がある。
- 音と実プレイ動画レビューは未実施。canvas primitive の視覚 feedback のみで手応えを作っている。
## 2026-05-23 時点で解消したもの

- 敵数不足: 総出現数を 117 体に増やし、headless の balanced kills は 75。以前より敵量は増えたが、単なる詰め込みではなく 60 秒ボス開始までの段階構成にした。
- 狙いにくい速さ: route duration と boss 弾幕を調整し、`route_motion_check` が全 route OK。
- 敵同士の重なり: `enemy_overlap_check` が `pairOverlaps: 0`。offset ではなく、spawn gap と lane progression で解消。
- headless 方針の不安定さ: `verify.js` で balanced / aggressive / conservative / pulse-heavy が全 clear。

## まだ残るリスク

- 実ブラウザの目視では、20-28 秒の息継ぎが薄く感じる可能性がある。増やすなら敵数追加より、次 wave の予告や画面奥の演出でつなぐ。
- 音がないため、敵数と展開を増やしてもテンションの上限は視覚だけに依存している。
## 2026-05-23 auto-shot / density pass 後の未解決リスク

解消したもの:

- 通常ショットを auto-fire に変更し、Space/X/Shift を pulse にした。
- 13 秒付近の空白、29-36 秒の低 shootable run、横敵の無意味な硬さ、二回目の縦横反復の単調さを修正した。
- 過去作比較を timeline に戻した。最終値は meanMidgameShootable 4.71。shot_log v01 の 16.31 には届かないが、graze_log_cdx v57 の 5.27 に近いゲーム相応の範囲まで戻した。
- `enemy_overlap_check` は `pairOverlaps: 0`, `minGap: 0.58`。重なり対策で不格好な直角 offset を使わず、spawn gap / lane progression / 左右ブロック分離で解いた。

まだ残るリスク:

- 実ブラウザでの手触りは、headless の meanMidgameShootable だけでは保証できない。特に 40-45 秒と 53 秒付近は、秒単位では run になっていないが、プレイ感として谷に見える可能性がある。
- boss duration は verify 上 19.08-24.53s。瞬殺ではないが、balanced で 24 秒台に寄る場合があり、単調に感じるなら boss phase の変化や中間召喚を増やす方が HP 調整より先。
- 音がないため、auto-fire / pulse / boss phase のテンションは視覚だけに依存している。
