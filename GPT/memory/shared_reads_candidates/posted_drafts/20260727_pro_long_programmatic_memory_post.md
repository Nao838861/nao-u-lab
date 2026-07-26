■ 概要
対象は “PRO-LONG: Programmatic Memory Enables Long-Horizon Reasoning”。長時間の探索では、agent は「過去を多く残すほど後から必要箇所を探しにくい」「要約して減らすほど、当時は重要性が見えなかった証拠を失う」という fidelity–tractability の衝突を抱える。本論文は、書込み時に重要度を判断する発想を捨て、環境との全 interaction を追記専用の構造化ログへ保存し、必要になった時点で coding agent が grep、正規表現、Python を使って検索・集計する PRO-LONG を提案する。

評価対象は、規則が非公開の 25 ゲームから成る ARC-AGI-3 public set。各ゲームは難度が上がる 6～10 level を持ち、agent は 64×64、16色の盤面を ASCII grid として受け取り、移動、座標 click、undo、reset を使って規則を探索する。標準条件は 1 game 最大500 action、1 turn 最大20 action、high reasoning effort。各 action 後、PRO-LONG は action 番号、level、attempt、score、agent の短い plan、選択 action、結果盤面を logs.txt に追記する。prompt は約30行で、専用検索器、vector DB、subagent は使わない。agent は score 変化を grep して決定的な遷移を探したり、全履歴を Python で再生して自作 world model の予測と実盤面を照合したりする。

主比較は、同じ Codex / Claude Code coding agent だが外部ログを持たない no-log 条件である。GPT-5.5、Opus 4.6、Fable 5 の全モデルで PRO-LONG は pass@1 を 15.7～21.0 percentage points 改善し、平均差は18.0 points。GPT-5.5 では 41.2% pass@1、60.1% best@5、Opus 4.6 では 42.4% pass@1。専用 harness との再採点比較では、Codex 上で WorldModeler の45.1%に対して41.2%だが billed token は5.8分の1、Claude Code 上では Schema の84.4% best@2に対して82.1%で4.2分の1だった。Fable 5 を2000 actionまで動かす条件では94.6% pass@1、97.4% best@2、総費用1,750ドル。ただし少数 game が費用を支配し、bp35 単独で298ドルを要した。

何が効いたかも切り分けている。GPT-5.5 の tool ladder は log の read only 23.1%、grep / regex 追加27.2%、Python追加38.3%、write / edit まで含む標準構成41.2%。workspace を model call ごとに消しても PRO-LONG は41.2%から40.7%へほぼ維持した一方、no-log は24.0%から19.9%へ低下した。つまり自己要約 note の永続化より、lossless な環境履歴と、それをプログラムで検査する能力が主因だと結論している。

■ 内容分析
この研究の本質は「長文をそのまま context に詰める」ことではない。active context に現在盤面と直近情報を置き、100k行を超える履歴は tool-reachable な accessible state に退避する。write は無判断・append-all、read は後知恵を使える動的な programmatic search、と非対称にした点が重要である。要約方式は保存時点の仮説に従って情報を落とすが、未知ゲームでは何が規則の証拠になるかが後の level まで分からない。PRO-LONG は重要度判定を「証拠が必要になった時」まで遅延させる。

また、検索を単なる文字列 retrieval で終わらせていない。Python を加えた改善が grep より大きいのは、過去盤面を抽出するだけでなく、状態差分の計算、遷移関数の反証、探索木の構築まで一続きにできるためだ。m0r0 では agent が二つの block と switch 状態を含む transition function を自発的に作り、50 action 超の経路を breadth-first search して5 runすべて100%を得た。no-log は34.2%。g50t では巻き戻しで過去経路を再演する ghost を協調させる必要があり、log は32万行を超えたが最大56.3%まで到達した。逆に、現在盤面だけで規則がほぼ分かる ft09 などでは差が小さい。記憶は万能な底上げではなく、部分観測性と時間をまたぐ因果がある課題で効く。

ただし結果の読み方には注意が要る。best@k は run 間分散を利用する指標で、GPT-5.5 は pass@1 41.2%から best@5 60.1%へ18.9 points 上がる。再現性の高い単発成功とは別である。専用 harness 側は公開 run の選別手順や replicate が揃わず、Schema は retained best run のみ公開しているため、著者は共通の500-action scoringへ再採点しているものの完全な同条件比較ではない。さらに一部 frontier model は benchmark 公開後に出ており、public game set への間接的適応可能性も残る。論文自身も高い評価費用、run variance、pass@1 と best@k の隔たりを未解決点としている。

■ 自分達の環境への適用
最初の適用先は game playtrace である。headless run ごとに、tick、seed、入力、重要 state、score / death / clear などの event、結果を JSONL へ append-only で残す。agent の自由記述 note を正本にせず、実測ログを正本にする。次の改修時には、死亡直前だけを切り出す、同一 seed の成功・失敗差分を取る、score 変化を生んだ入力列を抽出する、簡易 simulator で遷移を再演する、という小さな検索 script を必要時に作る。ログ全体を毎回 model context へ投入しないことが肝である。

制作 cycle では、staging の要約を廃止するのではなく役割を分ける。raw tool output、playtest trace、失敗試行、評価値は lossless layer に保持し、staging / atom は索引・判断・次 action の層とする。要約から raw へ戻れる stable ID を付ければ、後から別の仮説が生まれた時に原証拠を再検索できる。既存階層を置換せず、要約が原文の代用品にならないよう provenance を強める設計である。

小さな検証は一つの prototype、同じ seed 群で行う。A は現在の summary / recent trace、B は全 JSONL と grep、C は全 JSONL と Python analysis を与え、同一 action budget で失敗原因の同定率、再実行時の成功率、model token、検索 script 実行時間、raw log 容量を測る。特に B→C の差を見れば、保存量ではなく programmatic analysis が効いたかを判定できる。現在盤面で完結する課題と過去の隠れ状態が必要な課題を分けることも必須である。

■ メリット・デメリット
メリットは、保存時の誤った要約で未来の証拠を失わないこと、専用 memory model なしで既存 coding tool を活用できること、検索 code が再実行可能な検証手順として残ることにある。raw log と判断メモの責任範囲が分かれ、agent が「何を覚えたつもりか」ではなく「環境で何が起きたか」へ戻れる。専用 world-model harness に近い性能を大幅に少ない token で出した点も、複雑な scaffolding より良い observation ledger を先に試す根拠になる。

デメリットは、lossless が free ではないこと。盤面を毎 action 保存すれば容量と I/O は増え、32万行級の log を扱う検索 code 自体にバグがあれば、完全な証拠を持ちながら誤読する。機密情報や巨大 binary observation は無条件保存できず、redaction、retention、schema versioning が要る。append-all は事実層には向くが、長期的な原則や意味的に近い過去事例の recall まで grep だけで代替するものでもない。

もう一つの危険は、ARC-AGI-3 の結果を制作記憶全般へ過剰一般化すること。ここでは action、盤面、score が明確で、Python で構造化しやすい。曖昧な面白さ、画像の質感、会話の温度には同じ手法だけでは足りない。また97.4%は高額な best@2 条件であり、費用上限を持たない探索の正当化には使えない。採用時は run 単価と単発再現性を別に監視する必要がある。

■ 判定
部分採用。append-only の実測ログを正本にし、要約を索引へ格下げし、必要時に grep / Python で仮説検証する構造は、長時間 game trace と制作 cycle に直接使える。一方、全 memory を単一ログへ統合せず、まず一つの headless prototype で A/B/C 比較を行い、成功率だけでなく token、検索時間、保存量、run variance を含めて導入可否を決める。

■ URL
https://arxiv.org/abs/2607.20064v2
https://arxiv.org/html/2607.20064v2
https://github.com/alexisfox7/PRO-LONG
