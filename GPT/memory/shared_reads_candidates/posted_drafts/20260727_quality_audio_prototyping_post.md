■ 概要
Quality Audio Prototyping（QuAP）は、sound designer が「library から似た sample を探す作業」と「procedural synthesis を調整する作業」を別々の tool で行う断絶を、一つの plugin 内でつなぐ prototype である。狙いは自動で完成音を出すことではなく、narrative concept から試聴可能な音までの距離を短くし、recorded sample と可変な synthetic layer を人間が往復しながら組み立てられるようにすることにある。

system は四要素で構成される。第一に、user library の音を MobileNetV3 encoder で fixed-dimensional embedding にし、FAISS へ非同期 index する offline pipeline。第二に、drag-and-drop した query 音または text input から類似音を探す real-time retrieval。第三に、Nemisindo engine を用いた Fire、Explosion、Jet、Rocket、Helicopter、Gun の6種 procedural model。第四に、検索した sample と生成音を同じ画面で重ねる hybrid layering である。合成 parameter は専門用語のまま放置せず、rule-based assistant が平易な説明と推奨 range を表示する。この assistant は生成 AI ではなく、事前評価から得た固定 guidance で、最終調整は designer に残す。

parameter range と後処理は feature-driven bottleneck から作る。6KSFX dataset の recorded / synthetic 音を Essentia の low-level acoustic feature で分類し、差を最も説明する top-K feature を抽出する。その feature に基づき reverb、compression、EQ、distortion など category 別の処理を選び、20名の MUSHRA 主観評価で recorded reference への近さを検証した。Fire は28.85→40.45、Helicopter は41.10→51.20、Gun は35.95→45.60。Rocket は37.85→49.20でも p=0.08で非有意、Jet は最適化後も synthetic に聞こえるため最終評価から除外された。Explosion は統計的差がある一方、最良とされた最適化平均52.55が default 56.40を下回り、著者自身も artifact を増やしたと認める。

retrieval encoder は AudioSet 事前学習後、FSD50K を supervised contrastive learning で fine-tune した MobileNetV3 を採用する。held-out FSD50K で ResNet18-IBN と比較し、mAP 0.449対0.412、NDCG 0.656対0.625だった。user evaluation は sound designer 8名、audio researcher 4名、music producer 4名の計16名。fire sample を検索して procedural variant を作る guided task を行い、12/16が workflow に有用または有望、全員が assistant は creative agency を保ちながら procedural 操作の壁を下げると答えた。結論は、procedural 音が録音素材を置換するほど real でなくても、layering と探索の基材として統合すれば価値がある、というものだ。

■ 内容分析
最も良い点は「生成品質」と「制作上の有用性」を分けたことにある。Fire の40.45は MUSHRA 上で recorded reference にわずかに似る程度で、単体完成音として高品質とは言えない。それでも初期制作では、操作に同期する variation、距離、強度、反復をすぐ試せる layer の方が、完全な一音を長く探すより価値がある。QuAP はこの仮説を architecture、知覚 parameter、practitioner workflow の三方向から検証している。

一方、論文の「6 model 中5つで有意な quality improvement」という要約は数値を慎重に読む必要がある。Jet は最終評価から除外され、Rocket は非有意、Explosion は差が有意でも平均が悪化している。複数 optimisation variant の統計検定を「改善」と数えた可能性があるが、少なくとも表の default / best mean だけから5/6改善とは結論できない。ここを無視すると、統計的有意差と望ましい方向の効果を混同する。category 固有に元 synthesis の上限があり、後処理を足せば一律に良くなるわけではない、という失敗結果の方が実装には重要である。

user study も pilot として読むべきだ。16名、fire 一課題、短時間の guided walkthrough で、長期の asset 管理、game engine への export、memory / CPU、同時発音、実際の mix 内での識別性は測っていない。75%の有用評価と全員の agency 評価は好意的だが、研究への関心を示した参加者の self-selection もある。encoder ablation も2 architecture、同一 FSD50K の semantic retrieval であり、自分の library にある微妙な質感差や vocal imitation 以外へ直ちに一般化できない。

■ 自分達の環境への適用
採用すべき中心は QuAP 全体の再実装ではなく、「静的 sample + parameter variation + 人間が意味を理解できる少数 control」という audio probe である。shot、graze、charge、break、danger の5 eventを選び、各 event に core sample 一つと procedural / DSP layer 一つを置く。control は最大3つに絞り、例えば shot は impact、body、tail、graze は speed、distance、brightness と、聴覚上の意味で命名する。game state から値を決定し、同じ action の完全同一反復を避けるが、player が event class を誤認するほど変化させない。

小規模比較は A=静的 sample のみ、B=sample に pitch/volume randomization、C=sample と state-driven layer の三条件で行う。headless では event 発火漏れ、同時発音数、peak level、voice stealing、parameter range、同一 seed 再現性を記録する。playtest では画面を見ない識別 test と、見ながらの action timing 評価を分け、shot/graze/charge の正答率、連続10回後の煩わしさ、入力と音の遅延感、音だけで危険度を順位付けできるかを測る。realism ではなく「操作結果が区別でき、反復に耐え、調整可能か」を合格条件にする。

asset 検索については大規模 encoder を急いで導入せず、まず既存音へ event、material、intensity、duration、loopability の tag を付け、同じ browser から試聴と layering へ移れる導線を作る。数千 asset で検索時間が実測 bottleneck になった時に embedding retrieval を比較する。assistant の考え方は、slider 横に意味、推奨範囲、危険域、用途例を表示する形で移せる。自動最適化より、なぜその range なのかを制作者が理解できることを優先する。

■ メリット・デメリット
メリットは、retrieval、procedural generation、layering、parameter guidance を一つの制作行為として設計し、技術指標だけでなく主観品質と実務家評価を組み合わせたこと。procedural 音を完成品でなく探索用 layer と位置づけ、人間の critical listening と agency を残す。音を制作終盤の飾りではなく、操作 feedback の prototype として早期投入する根拠になる。

デメリットは、対応が6 category に限られ、Jet、Rocket、Explosion が underlying synthesis と後処理の限界を示すこと。MUSHRA score 自体も低く、表と「5/6改善」という総括に不整合がある。16名の単発 task は長期 workflow の証拠ではなく、export、runtime 負荷、game mix、license / provenance の実運用も未評価。encoder 改善幅は小さく、検索機能が小規模 project の主要 bottleneck でなければ導入 cost に見合わない。

■ 判定
部分採用。静的 sample と state-driven layer、意味の分かる少数 parameter、識別性と反復耐性の audio probe を採用する。QuAP の6 model、embedding 検索、論文の改善率はそのまま採用せず、まず5 event の小規模比較で操作 feedback が実際に良くなるかを測る。

■ URL
https://arxiv.org/abs/2606.00629
