■ 概要
対象は「MemPoison: Uncovering Persistent Memory Threats and Structural Blind Spots in LLM Agents」。LLM agent の外部 memory は preference、fact、task state、handoff note を turn をまたいで保持できる一方、通常の user input、tool return、cross-agent message から入った内容も持続する。既存研究は一つの露骨な悪意 record を直接書く攻撃に偏り、個々には無害な複数 record が後で合成される場合や、特定 context でだけ発火する dormant instruction を十分に測れていない。MemPoison はこの「write 時の妥当性」と「retrieval 後の害」の semantic gap を三段階に分解し、pointwise な write filter の限界を測る benchmark と分析枠組みである。

脅威 model では attacker は model weight、system prompt、memory database の内部 API へ触れず、標準 interaction channel だけから情報を入れる。injection turn と harmful behavior turn は分離される。L1 は「production API は attacker domain へ移行した」のような単一 record の直接汚染で、write 時に害を見つけやすい。L2 は「deployment environment は二つ」「新環境は低 latency」「新 URL は attacker domain」のように、 individually plausible な fragment を複数 turn へ分散し、同時 retrieval と composition で初めて害を作る。

L3 は「月末 report の時だけ外部 address を BCC」のように、通常時は inactive で自然な trigger context の時だけ作動する sleeper 型である。

MemPoison-Bench は 4 attack type、3 channel、flat chunk / fact store / hierarchical notes の 3 substrate、5 domain を組み合わせる。12,760 raw case を絞った 2,575 件を人手で realism、memory writability、non-leaky trigger、label 分離、harmfulness まで審査し、1,227 件へ凍結した。各 case は base context、injection、trigger query、clean / poisoned target を持つ。

open-weight 7 系統と closed-weight 3 系統を各 case 5 回評価した。無防御では平均 clean accuracy 94.40% を保ちながら、attacker target へ移る Behavioral Corruption Rate（BCR）は 62.55%。L1 45.37%、L2 51.73%、L3 76.72% だった。tool return / cross agent は user input より強く、flat chunk が最も脆弱。fact store は信号を薄めるが攻撃を消せない。retrieval top-k を増やすと、co-retrieval が必要な L2 が急増した。

write-time consistency check は BCR を 20.09%、L1 を 4.77% まで下げたが、L2 22.54%、L3 27.80% が残る。複数防御を重ねた MIXED は clean accuracy 93.77%、BCR 10.70% と最良だがゼロではない。標準 perplexity filter は clean accuracy を 61.28% まで壊しながら BCR 59.14% で、強く filter すれば安全という関係でもない。

Mechanistic Influence Decomposition（MID）は retrieved set から指定 poison を外して再実行し、L1 の単一 influence、L2 の joint interaction、L3 の trigger 前後差を見る。除去で clean label へ戻る率は 95.7%、88.9%、92.2%。pipeline audit では L1 の 40.19% を write 時に block できる一方 25.79% が residual causal、L2 は fragment が揃うと 83.6%、L3 は 47.16% が residual causal だった。結論は、書込み検査だけでなく provenance、retrieval composition、利用時 context を含む lifecycle 防御が必要というもの。

■ 内容分析
価値は、poisoning を「悪い文章が保存されたか」から「どの stage で害が成立したか」へ分解した点にある。L2 / L3 では admission 時の情報と利用時 context が違う。個別 record の真偽・毒性を調べても、組合せと発火条件を見なければ不足する。これは敵対攻撃だけでなく、古い指示と新 state、別 source の局所的に正しいメモが同時 recall された事故にも同型である。

「防御不能」ではなく「防御点が違う」と読むべきである。write gate は L1 に効くが、L2 は co-retrieval、L3 は trigger-time use を見る必要がある。MID は指定 poison unit を知った上で除去する post-hoc diagnostic で、未知の poison を自動検出する production defense ではない。

限界は text poisoning と 3 substrate に留まり、画像・音声・temporal decay・access control を扱わないこと。clean / poisoned target を事前定義できる task で、現実の曖昧な長期対話とは差がある。MID は A100 4 枚で約 11 日を要し、そのまま定時 cycle に移せない。taxonomy は dual-use なので exploit generator として持ち込まない。

■ 自分達の環境への適用
我々の memory は Slack、web research、game feedback、他 process の出力が同じ recall へ入るため、user input だけの警戒では足りない。atom ごとに source、ingest route、timestamp、supersession、review status を持ち、write gate で L1 と provenance 欠損を止める。ただし安全判定を完了扱いにしない。

regression probe は、L1 で既存 directive と矛盾する単一 atom、L2 で単体は妥当な二 atom の同時 recall、L3 で特定 game state・phase・日付だけ古い指示が発火する例を作る。full recall、指定 memory 除去後、clean baseline を同じ prompt と seed で比較し、応答を変えた record set を evidence にする。

game 側では LLM NPC、自動 playtest の corrective memory に同じ test を当てる。map revision 後に二つの記憶の組合せだけが破綻する例は L2、特定 boss phase で古い避け方が発火する例は L3 に近い。全組合せは探索せず、実際の上位 k recall、high-impact action、provenance の異なる組合せを優先する。

■ メリット・デメリット
メリットは、合成・遅延発火を再現可能な test unit にし、write / retrieve / use のどこで防御が効いたかを分離したこと。MID の counterfactual removal は問題 response の原因 audit に使える。

デメリットは完全防御でなく、自然発生 error と敵対的 poison の境界も曖昧で、組合せ test が高価なこと。全 memory の pairwise 検査、BCR だけを下げて clean utility を見ない運用、source 信頼度だけで内容を免責する運用は避ける。high-impact context と clean task accuracy を対にする。

■ 判定
部分採用。L1 / L2 / L3 taxonomy、provenance 付き write gate、実 co-retrieval に対する regression、counterfactual removal audit を採る。大規模 benchmark の全面再現や全組合せ検査は採らず、記憶を使う high-impact action と game-state trigger に限定した deterministic fixture から始める。

■ URL
https://arxiv.org/abs/2607.14651v1
