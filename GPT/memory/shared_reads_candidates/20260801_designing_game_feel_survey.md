---
title: "Designing Game Feel. A Survey"
url: "https://arxiv.org/abs/2011.09201"
collected_at: "2026-08-01T09:49:13.0733737+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-feel, controls, feedback, accessibility]
---

## raw_excerpt

Martin Pichlmair と Mads Johansen が、研究論文と実務家による解説を含む200件超の資料を調査し、game feel を「ゲームとの瞬間的な相互作用が生む感情的影響を意図して設計すること」として整理した survey。資料中の設計目的を、physicality、amplification、support の三領域へ分類し、それぞれに対応する polish を tuning、juicing、streamlining と呼ぶ。physicality の tuning は移動、加減速、重力、衝突形状などを調整し、物体の挙動へ一貫性と予測可能性を与える。amplification の juicing は音、振動、particle、camera、hit stop などの timing を揃え、行動の重要性や手応えを伝える。support の streamlining は入力を状況に応じて解釈し、coyote time、jump buffering、target selection などによってプレイヤーの意図した行動を成立しやすくする。

本文は movement、gravity、collision、camera、animation、trails、debris、temporal consistency などを具体要素として列挙する。trail や particle は単なる装飾ではなく、直前の移動履歴を現在の画面へ残し、速度や方向を読めるようにする働きも持つ。三領域は独立ではなく、一つの操作へ複数層の feedback と補助が重なる。著者らは game feel を常に快適さを増す価値判断とはせず、意図して作られた不快さや抵抗も含む語として扱い、ルール上の結果と feedback が異なる意味を示すと frustration や学習困難につながると述べる。

## why_relevant_to_games

操作感の問題を「juice不足」の一語で済ませず、物理挙動・感覚的強調・入力意図の支援へ分けて prototype や playtest の観測項目を作る場面で参照できる。
