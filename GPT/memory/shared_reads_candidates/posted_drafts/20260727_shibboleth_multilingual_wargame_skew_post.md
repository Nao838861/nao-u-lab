■ 概要
対象は “The Shibboleth Effect: Auditing the Cross-Lingual Distributional Skew of Large Language Models”。多言語 LLM の安全性評価は、同じ質問を翻訳して単発回答を比較する形が多い。しかし静的な質問では、モデルが無難な一般論を返すだけで、緊張が継続し他 actor の行動へ応答し続ける場面の差を測れない。本論文は「言語を単なる表示層ではなく、agent の行動分布を変え得る実験変数として扱う」ため、Cerulean Sea Crisis という架空の海洋領有紛争を multi-agent wargame として構築した。

シナリオは東地中海の対立構造を写しつつ固有名を置換し、各 actor に目的と redline を与える。GPT-4o、Llama-4 Maverick、Mistral-Large、Gemini-3.1-Pro、Qwen3.6-Plus、DeepSeek-R1 の6モデルを固定役へ割り当て、英語 arm とトルコ語 arm でそれ以外の構造、目的、system prompt を同一にした。各 arm は独立した10 game、各 game は5 round。context を game ごとに reset し、game-level mean を統計単位にすることで、1本の長い会話を独立標本のように数える問題を避けている。temperature は0.7、turn seed は式で固定し、600件の score 対象から API failure 等14件を除いた586発言を分析した。

各発言は GPT-4o の zero-shot judge が0～1で採点する。Concession Rate は redline からの譲歩、Coercive Rhetoric は ultimatum、威圧、脅しの強さである。正規性が崩れたため、各モデル×2指標の12検定に Mann–Whitney U、Cliff’s delta、2000回 bootstrap CI、Holm–Bonferroni 補正を使った。補正後に残ったのは3件。Llama-4 の威圧はトルコ語で増加し、英語平均0.645、トルコ語0.765、delta=+0.800、p=.002。Gemini は逆に0.480から0.185へ低下し、delta=-0.750、p=.005。DeepSeek-R1 も0.870から0.755へ低下し、delta=-0.860、p=.006だった。GPT-4o の威圧差は delta=+0.130、p=.614で、効果なしの証明ではなく検出力不足を含む inconclusive な結果である。Western model を束ねた差も delta=+0.089、p=.551で、非英語なら一律に攻撃的になるという強い仮説は棄却された。結論は、cross-lingual skew の有無だけでなく方向と大きさがモデル、学習方法、version に依存するため、言語横断の安定性を個別に監査すべき、というものだ。

■ 内容分析
この論文で最も使えるのは “Shibboleth Effect” という名前より、継続する相互作用を language-only arm で反復する評価設計である。発言586件という見かけの大きな数ではなく、独立単位を各 cell 10 game と明示し、多重比較後に残る効果と名目上だけの効果を分けた点は堅い。Mistral の譲歩 delta=+0.670、威圧 delta=-0.600 は大きく見えるが補正後には残らず、GPT-4o の null も安定性の確証にはしていない。単純な平均差ではなく、効果量、検定力、ceiling を併記したことで「差が見えない」と「差がない」を区別できる。

一方、因果解釈は結果より先へ進みすぎている。第一に、model と geopolitical role の割当が固定で counterbalance されていない。Llama-4 はギリシャ相当、GPT-4o はトルコ相当、Gemini は米国相当を常に演じるため、観測された差は model 固有の言語効果、role とトルコ語 corpus の相互作用、両者の合成を分離できない。論文は予測方向と合わない actor が6中3あったため role-fit だけでは説明できないとするが、それは confound の除去ではない。モデルを役職間で rotation する factorial design が必要である。

第二に、judge の妥当性が弱い。GPT-4o judge に「言語に依存せず採点せよ」と指示しても、トルコ語の語用論、婉曲表現、強度を英語と同じ尺度で読める保証にはならない。モデルごとに効果方向が逆なので「全トルコ語を一律に攻撃的と誤採点する bias」は否定できるが、actor、文体、内容に条件づけられた judge bias は残る。今回の発言に対する bilingual human validation はなく、別 dataset の Cohen’s kappa=.84 は代用できない。

第三に、buffering mechanism は仮説として扱うべきだ。DeepSeek-R1 の reasoning trace が UNCLOS の制度的 mandate を参照していたことは興味深いが、その文章が最終発言を因果的に安定化した証明ではない。英語側は威圧 score の42%が上限1.0、98%が0.75以上で ceiling が強く、同じ N=10 での再現検出力は約0.40と論文自身が認める。Gemini の multilingual RLHF 説も、外部 benchmark 順位との整合から推測したもので学習 ablation ではない。観測事実は「言語 arm で行動 score が方向違いに動いた」までで、token routing、corpus association、RLHF、reasoning のどれが原因かは未同定である。

■ 自分達の環境への適用
ゲーム制作での直接の適用先は、翻訳文の自然さではなく、ローカライズ後も NPC と自動 play agent の方策が同じかを測る回帰試験である。同一 game build、同一 state snapshot、同一 goal、同一 tool schema から、日本語と英語だけを切り替えて複数 episode を実行する。会話 NPC なら譲歩、威圧だけでなく、約束の維持、情報開示、関係値の更新、選択した game action を記録する。play agent なら探索率、危険回避、resource 消費、rule violation、clear 率を見る。文章 score だけでなく実際の state transition を主指標にすれば、judge の言語 bias を減らせる。

小さな probe は、既存 prototype の交渉または同行 NPC を1場面だけ選ぶ。モデル version と prompt hash を固定し、日本語・英語各25 episode、共通 seed 群で実行する。actor role はモデル間で rotation し、翻訳は back-translation だけでなく目的、禁止事項、曖昧さの対応表を保存する。headless trace から action-level 指標を自動集計し、会話の強度は両言語を読める人が盲検で一部再採点する。差が出たら平均だけで結論せず、round 1 から即座に分かれるのか、相手の挑発後にだけ分かれるのかを時系列で見る。

制作 cycle へは「多言語品質」を単一 pass/fail にしない形で入れる。build、model endpoint、prompt、locale、seed、role、judge version を provenance として残し、version 更新時に同じ matrix を再実行する。差を消すこと自体も絶対目標ではない。文化的な話し方の違いは演出価値になり得るが、戦術選択、redline、禁止行動まで意図せず変わるなら不具合である。表層の語調、物語上許容する差、game rule 上不変であるべき方策を先に分ける必要がある。

■ メリット・デメリット
メリットは、単発翻訳 QA では見えない相互作用中の drift を、比較可能な episode として捕まえられること。同じ scenario を反復するので、感想ではなく効果の方向、分散、version 間変化を追える。独立 game、seed、prompt hash、game-level 集計という設計は、headless 評価 harness にそのまま移植しやすい。また「非英語では危険になる」という一方向の思い込みを捨て、過剰な融和や危険の過小評価も skew として扱える。

デメリットは、二言語の完全な同値化が原理的に難しく、翻訳と文化的 register の差を切り離せないこと。固定 role、単一 scenario、単一 judge のままでは、きれいな数値が出ても原因を取り違える。API 型モデルは silently updated され、過去の安全判定も急速に古くなる。episode 数を増やす費用もあり、多数の locale、role、model、指標を総当たりすると検定数だけが膨らむ。まず game rule に直結する少数指標へ絞り、effect size と human audit を併用する必要がある。

■ 判定
部分採用。採るのは、言語だけを変えた独立 episode、game-level 集計、多重比較補正、version ごとの再監査という評価設計である。論文のモデル分類や reasoning／multilingual RLHF の因果説明は保留し、role counterbalance、action-level 指標、bilingual human validation を加えた小規模 probe で、自分達の NPC と play agent に実害のある方策差が出るかを先に確かめる。

■ URL
https://arxiv.org/abs/2606.11082
https://arxiv.org/pdf/2606.11082
https://doi.org/10.6084/m9.figshare.32389938.v1
