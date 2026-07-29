■ 概要
この研究が扱うのは、ゲームを自動で歩き回る agent を作った後に残る「大量の観測画像から、どれが本当に bug なのかを誰が判定するか」という問題である。対象を geometry clipping、つまり本来は別々の solid mesh が見た目上交差する不具合に限定し、探索と検出を分離した QA pipeline を構成している。探索側は Godot Third-Person Shooter demo を改変した level で、stochastic な低水準移動と、未探索領域へ向かわせる高水準 manager を組み合わせる。検出側は収集 frame を汎用 Vision-Language Model（VLM）へ渡し、game 固有の学習なしに clipping の有無を zero-shot 分類する。

ground truth は人手で一枚ずつ付けない。実験中に一部 object の collider をランダムに有効・無効化し、Godot 4 の shader で交差境界の binary mask を生成する。小さすぎて知覚できない交差は mask 面積の threshold で除外し、6 Hz で採取した frame を探索 map の位置ごとに間引く。この結果、normal 2420枚、clipping 516枚を得た。normal から、明白に正常な easy 500枚、壁際・遮蔽・照明・camera angle などで clipping に見えやすい hard 500枚、selection bias を避けた random 500枚を作り、それぞれ同じ bug 500枚と組み合わせた balanced test にする。

比較したのは Gemini-3.1-Flash、GPT-5.5、Qwen3-VL、Gemma-4、Llama-4 Scout、Ministral-3 の6系統。generic anomaly、clipping を明示する specific、scene 描写から判定させる stepwise、game context と例を加える context の4 prompt を試した。generic prompt の easy split では Gemini が accuracy 85.0%、precision 87.2%、recall 82.0%。しかし hard split では recall を同じ bug frame で固定したまま precision が57.5%へ落ちる。Llama も91.2%から54.6%、Gemma も71.9%から50.9%へ低下した。random split の Gemini は accuracy 71.6%、precision 67.9%で最良だが、実運用の確定判定器と呼べる水準ではない。

prompt 感度も model ごとに異なる。Gemini は4 prompt で recall 82–94%、precision 66–68%と比較的安定する一方、GPT は context を増やすと precision 76.6%まで上がる代わりに recall が25.6%まで落ちる。Ministral は specific / stepwise で recall 97%超になるが precision はほぼ50%で、ほとんどを疑わしいと判定している。結論は、現在の VLM は単独の bug detector ではなく、見逃しを抑えて後段へ候補を渡す high-recall filter として使うべき、というものだ。

■ 内容分析
この評価で最も価値があるのは、平均 accuracy の順位ではなく hard negative の作り方である。同じ500枚の bug frame を easy / hard / random の正常画像と組み合わせるため、split 間で recall は固定され、差は false positive だけから生じる。全 model が同じ方向に崩れたことで、単なる乱数誤差ではなく「surface が近い」「character が壁際にいる」「foreground に部分遮蔽される」といった局所的な近接を mesh intersection と誤認する、深度推論の系統的弱点が見える。これは prompt を長くすれば解決する問題ではない。実際、詳細 context は model によって過剰検出にも過小検出にも振れる。

一方で、この数値を製品 QA の期待値として読むのは危険である。実験は単一の Godot demo、単一 bug class、強い clipping を中心にした single-frame benchmark である。collider の on/off による合成的な bug 注入は再現可能な ground truth を作るが、animation、physics、camera、streaming、半透明、LOD の相互作用から自然発生する不具合分布とは違う。評価も bug 500対normal 500の balanced set なので、実際には bug が極端に希少な連続 playtest へ置くと、同じ precision / recall でも一時間あたりの誤警報数は大きく変わる。

さらに hard / easy の分割自体には人手判断が入り、shader mask の面積 threshold が「bug と呼ぶ境界」を先に決めている。論文自身も、難しい一枚絵は人間にも曖昧であり、人間 performance との比較、動画文脈、他の visual style と bug 種別が未検証だと認める。したがって成果は VLM の一般的 bug 理解を証明したのではなく、探索 agent と交換可能な visual filter を接続し、どこで誤警報が増えるかを controlled に測ったことにある。

■ 自分達の環境への適用
我々の headless playtest へは、VLM を最終 oracle にせず「保存すべき瞬間を減らす入口」として入れる。各 run から一定間隔だけでなく、collision、camera occlusion、teleport、velocity 急変、sprite / mesh の bounding overlap など engine telemetry の event 前後を連続 frame で保存する。第一段は安価な幾何・telemetry filter、第二段は固定 prompt の VLM、第三段は前後 frame の継続性と衝突状態の照合、最後だけ人手確認とする。VLM の positive は bug 件数ではなく、再現 seed、frame 範囲、座標、近傍 telemetry を束ねた artifact pack の作成 trigger にする。

小さな probe では、現在の prototype 一つに、明白な貫通、短時間だけ起きる交差、壁際の正常接触、foreground 遮蔽、effect が重なる正常場面を各20 seed 注入する。prompt と model version を固定し、bug recall、正常一時間あたりの alert 数、同一 event の重複 alert、後段 telemetry で棄却できた比率、人が再現可能だった比率を測る。balanced accuracy だけでは reviewer の負担を表せないため、alert/hour と「一件の真陽性を得るまでに見る候補数」を主要指標にする。

採用後も、build や art style が変わるたびに easy frame だけで確認してはいけない。壁際、画面端、particle、強い陰影、camera 接近を hard-negative 回帰集合として保存し、prompt 変更は model upgrade と同じ評価対象にする。これなら visual regression が弱い時も探索ログ自体は再利用でき、検出 back-end だけを交換できる。

■ メリット・デメリット
メリットは、game 固有 classifier の学習データを最初から大量に用意せず、既存の探索 run を視覚的な候補へ絞れること、探索と検出を疎結合にできること、hard-negative を通じて誤警報コストを設計段階から測れることだ。obvious な異常には一定の recall があり、人が全動画を見るより再現 artifact の確認へ集中できる。

デメリットは、単一 frame では本質的に判別不能な事象を VLM の推論力不足と混同しやすいこと、model / prompt 更新で operating point が動くこと、balanced benchmark の precision をそのまま現場へ移せないことだ。VLM を確定判定にすると正常な近接表現を大量に bug 扱いし、逆に prompt を厳しくすると subtle bug を落とす。API 費用、画像の外部送信可否、build 情報の秘匿も運用条件になる。

■ 判定
部分採用。探索 agent と VLM filter を分離する構成、hard-negative を含む評価、後段検証へ候補を渡す位置付けを採用する。単独の visual bug oracle 化は見送り、まず一つの prototype で連続 frame・engine telemetry・人手再現を組み合わせ、recall と alert/hour の両方が改善するかを検証する。

■ URL
https://arxiv.org/abs/2607.25921
