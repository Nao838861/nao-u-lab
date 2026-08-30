---
title: "Evaluating interaction mechanics in virtual reality gaming: from user studies to design recommendations"
url: "https://www.frontiersin.org/journals/virtual-reality/articles/10.3389/frvir.2026.1833901/full"
collected_at: "2026-08-31T03:04:31+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, vr, interaction-mechanics, player-experience, accessibility, playtesting]
---

## raw_excerpt

原文を基にした日本語抜粋メモ（長文の直接引用ではなく要約）。6DoF VR の interaction mechanics は、操作精度だけでなく身体負荷、認知負荷、楽しさ、competence、VR-induced symptoms and effects（VRISE）を同時に変える。研究は slash、pick-and-place、shoot を対象に、各30人・計90人の実験を実施した。Unity製の専用 testbed で、slash は target spawn angle・破壊に必要な力・武器長、pick-and-place は puzzle scale・collider scale・remote grab・配置物間の余白、shoot は照準補助・target spawn angle・射出力を段階的に操作し、accuracy、所要時間、発揮力、発射数などの客観指標と、fun、challenge、workload、competence、QoE、VRISE の主観指標を対応づけた。

Slash では90度の出現範囲が好まれ、360度では命中率と継続意向が大きく低下した。強い力を要求する条件は負荷を増やして成功率を下げたが、接触だけで壊れる条件より軽い斬撃を必要とする中間条件の方が楽しいと評された。Pick-and-place では大きめの collider と部品間の余白が精密配置の負荷を下げた一方、remote grab は狙いの精度を要求して負荷を増やしながらも、現実を超える「魔法的」操作として楽しさと選好を得た。Shoot では laser が精度を高め、laser と弾道表示の併用は情報のずれが注意を散らす可能性があった。180度の出現範囲は90度や360度より楽しいとされ、直線に近い高速弾は低速の放物線弾より成績と選好が高かった。

著者らは、楽しさが常に最小負荷で最大化されるわけではなく、追加負荷が楽しい parameter、中程度までなら楽しい parameter、負荷がそのまま消耗になる parameter を区別している。共通提案は通常の難易度設定より細かく interaction parameter を選択可能にすること。個別には、slash の対象を視野内に置き過大な力を要求しない、精密配置では受理 collider と余白を広げる、remote grab のような hyperrealistic 操作を検討する、shoot の視覚補助は重ねすぎず、目立つ放物線を避ける、といった実装指針を示す。対象は若く健康でVR経験の浅い参加者が中心で、短い単純化 testbed のため、商用ゲームの長時間play、複合mechanics、熟練者や多様な身体条件へは未検証である。

## why_relevant_to_games

入力mechanicを一括で「難しい／楽しい」と扱わず、視野範囲・必要力・当たり判定・補助表示・物体寸法などの調整可能な因子へ分け、実測性能・楽しさ・身体負荷を同時にplaytestする設計例として使える。
