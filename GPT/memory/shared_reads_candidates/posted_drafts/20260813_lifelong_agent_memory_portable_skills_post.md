■ 概要
この論文は、長期協働 agent の価値を「過去の会話を大量に覚えること」ではなく、検査できる fact と再実行できる skill を育て、特定 model や agent stack が交代しても持ち越せることに置く。材料研究では、動く script、信頼できる protocol、失敗した計算に付随する warning、過去結果を新しい問題へ使う判断が、notebook、repository、job log、個人の記憶へ分散する。モデルを高性能化しても、この operational knowledge が会話履歴や重みに閉じていれば、次の model は同じ失敗を再発見する。そこで agent ではなく persistent memory を耐久資産の中心にする。

memory は二種類に分ける。Fact-memory は出来事、context、重要性、evidence、次の action を持ち、method や parameter の failure boundary、単位、参照値を記録する。Skill-memory は goal、適用条件、prerequisite、順序付き procedure、parameter、validation、failure mode、改訂元 trace を持つ。実行できることと科学的に信頼できることを混同しないため、boundary knowledge は fact、executable know-how は skill へ分ける。失敗 run は guardrail、成功 run は skill、部分成功は検証後の procedure 改訂になる。

表現を textual かつ provenance-linked にする点も中核である。text なら model weight や agent UI に固定されず、検索、人間の検査・編集、別 system への export ができる。重要なのは agent architecture ではなく、実行 feedback で検証された記憶 object である。

評価は三層ある。第一は MatTools の49 question・138 executable subtask を3 round 回す試験で、R2/R3 は前 round の memory を読む。parameter update なしで GPT-5.2 は44.2%から75.4%、GPT-5.4 は66.7%から88.4%へ上がった。sandbox-only や memory-only は57〜60%に留まり、実行 feedback と保存の組合せが効いた。GPT-5.4 の memory を弱い nano が読むと、その nano 自身のR3 memory より50.8 points改善し、procedure が model 間を移ることも示す。

第二は27固体の Sol27LC。ABACUS の wavefunction initialization failure を `init_wfc=random` という実行前 guardrail にし、同じ結晶構造 family へ再利用した。Correct/Partial/Error=22/1/4 は次 round で25/2/0となり、同種失敗の91.7%を回避した。第三は VASP/LAMMPS の13 workflow で、3 round目に token burden と tool call を半分程度へ減らした。検証済み fact/skill が model を越える protocol として機能する、という結論である。

■ 内容分析
新規性の核は、記憶を retrieval 用の文章倉庫ではなく、validation を内蔵する executable asset として扱ったことにある。Fact/Skill 分離は単なる文書分類ではない。「unrelaxed structure の phonon 値は信頼できない」は境界 fact、「relax→SCF→DFPT の順に実行し結果を検査する」は skill であり、前者を final answer としてコピーせず、後者も現在 run の検証なしに真としない。この区別が、古い結果を新しい測定の代わりに使う memory contamination を防ぐ。

同じ49 questionを3回回す設計は、知識量より「前回の executable failure を次回避けられるか」を測る。動く code が科学的正答とは限らないため、question pass、subtask success、runnable を分ける。sandbox-only は修正を次 session に残せず、memory-only は未検証 procedure を保存し得る。実行→検証→保存→再利用の閉 loop が強みである。

一方、改善は model と task に依存する。小さい model では追加 context が overhead や害になり、弱い source の procedure は強い target に harmful な場合もあった。13 workflow の成功数も10/13→11/13→9/13で単調増加せず、2.56M tokens・126 callsまで膨らむ task もある。memory は普遍的 compression でも再検証の代替でもない。

実験は computational materials science に限られ、装置操作、合成 protocol、暗黙的な scientific taste の移転は未検証である。成果も memory 単独でなく sandbox、tool、job feedback との組合せから出る。複雑な workflow には applicability tag、成功回数、deprecation、strict schema、実行 test が要る。

■ 自分達の環境への適用
我々では、Fact を観測・適用境界・evidence・次の判断を持つ atom、Skill を input、precondition、procedure、validation、failure mode、provenance を持つ script/artifact とする。文章に command があるだけでは Skill にせず、sandbox や headless test で成功し、失敗条件も記録された時だけ executable とみなす。

ゲームでは「Godot build が特定 setting で失敗」は fact、「path 検査→headless import→build→起動 smoke→state probe」は skill になる。「この parameter は面白い」は人間評価を要する仮説である。創造判断を固定しないため、build、asset schema、save migration、deterministic replay のように合否を検証できる工程から始める。

高頻度失敗を1件選び、Skill に `goal / applies_when / prerequisites / steps / validation / failure_boundaries / provenance / last_verified / deprecated_by` を持たせる。次の3回で error 再発、tool calls、manual correction、別 project への移植を測る。target が自力で作った手順より悪ければ自動採用しない。

一度の成功から恒久 skill を作らず、validation evidence と適用範囲を付ける。engine、OS、project type が変われば stale にし、旧版は provenance として残して current retrieval から外す。失敗 guardrail は単なる禁止でなく、失敗条件と早期検出できる preflight check として保存する。

■ メリット・デメリット
メリットは、制作知を会話履歴や特定 model から切り離し、人間が編集できる資産にすること。Fact/Skill 分離で参考値と回答、実行可能性と妥当性を混同しにくい。failure boundary を guardrail にすれば同じ error を減らし、次の agent は根拠と検査方法も引き継げる。

デメリットは、低品質 memory も移植されること。portable は品質保証ではない。retrieval と validation は overhead を増やし、小型 model には処理不能になり得る。創造的・身体的判断を schema に押し込むと制作が過去 procedure の再演になる。deprecation がなければ古い成功が故障源になる。

■ 判定
部分採用。検証可能な制作工程について Fact/Skill 分離、failure boundary、validation check、provenance、deprecation を採用する。まず既存の build または headless smoke 1件を portable skill 化して3回再利用し、成功率と overhead を測る。創造判断の skill 化と、大量の既存 atom の一括変換は行わない。

■ URL
https://arxiv.org/abs/2608.11224
