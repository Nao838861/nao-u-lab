■ 概要
LLM agent が調査、file 編集、コード実行、画像を含む成果物作成を長時間続けると、初期制約を忘れる goal drift、環境間で中間成果を失う state loss、長い観測が履歴を押し出す context overflow が重なり、各工程は終わっても最終成果物が要求を満たさない。OneDayAgent は、この三つを一つの execution harness で扱う。

original request を global intent として保持し、依頼を最大6個の bounded subtask に分ける。各 subtask は短い local objective の下で ReAct 実行し、境界では全 trajectory でなく回答と result-file handle を渡す。長い観測は bounded evidence に圧縮する。context が window の0.9倍を超えると、system prompt、original task、直近3 round を残して過去を technical summary にし、0.95倍では deterministic pruning へ退避する。

全 subtask 後、synthesizer が回答と artifact を統合しても完了とはしない。verifier が final deliverable を original request、subtask answer、attachment と照合し、欠落や不整合を defect として記述する。repair は全工程をやり直さず、該当箇所だけを修復して再検証する。web、command、file、画像処理を同じ workspace に置き、対話履歴でなく実在する artifact を工程間の接続点にする。

評価は104 task、767個の二値 rubric を持つ AgentIF-OneDay。明示手順の OWE、暗黙規則の LII、artifact 修正の IR を含む。GLM-5.2 の FULL は overall 0.821。execution memory を常時有効にした2×2 ablation は DIRECT 0.771、decomposition のみ0.804、verification のみ0.804、両方0.821だった。95 task は初回 verify を通過し、repair に入った9件中6件を回復した。35件が compression を発火し、5 backend の overall は0.613〜0.821だった。

■ 内容分析
核心は「local completion と global completion を別物として扱った」点にある。subtask executor は局所目標へ集中し、最終 verifier は依頼原文を基準に file の存在と内容まで見る。花言葉を調査して PPT を編集する事例では、編集 subtask が file-descriptor error で失敗した。synthesis はそれを隠さず、verifier が missing PPT を検出し、既収集の文章と画像を実 deck に適用する repair へ接続した。「知識はあるが納品物がない」という failure を成果物層で回復する設計である。

ablation の読みどころは最高点より費用の非対称性にある。DIRECT の平均27.6分に対し、VERIFY は29.7分、わずか2.2分増で+3.3 percentage point。DECOMP も+3.3 pointだが38.1分、tool call は28.4から45.7へ約60%増える。FULL は0.821まで上がる一方、53.6分、51.6 tool callで score-per-latency は最低だった。さらに VERIFY がFULLを上回る task は17件、DECOMPは13件、DIRECTさえ12件ある。分解は常時有効な善ではなく、planner の誤分割、subtask 間の情報損失、統合負荷を増やし得る。まず安い global verification を付け、長さや依存関係が閾値を超えた task だけ分解する方が、論文の結果に忠実である。

評価には限界がある。execution memory は、外すと context overflow や state loss で完走できないとして全 variant に残され、単独効果が測られていない。compression 回数と score がほぼ無相関なのも、task 難度を統制しない観察である。backend 横断結果は同一 harness が104件を完走した transferability を示すが、各 backend の harness 有無を比較しておらず改善幅は一般化できない。同じ設定でも GLM は平均53.6分・51.6 call、Gemini は21.4分・18.7 callで、費用は model の実行様式に強く依存する。

判定は LLM-as-judge である。旧 judge と新 judge の同一 run 比較では80.39%から77.27%へ3.12 point変わり、新 judge は artifact 実在、厳密な label、rendered screenshot をより厳しく見た。これは ablation 差と同じ桁で、順位を judge から独立した事実とは見なせない。単一 benchmark、温度1.0で、反復 run の分散も示されない。

安全面はさらに重要で、実装は workspace isolation なしに host 上で動き、command tool に allowlist がない。web や document の prompt injection が summary に残れば、後続 subtask、verification、repair にまで持続する。圧縮記憶は信頼境界でもあり、単なる token 節約機構として移植してはいけない。

■ 自分達の環境への適用
ゲーム制作サイクルには、まず decomposition ではなく verification-only を小さく導入する。task 開始時に original playable intent を、操作感、勝敗条件、変更してよい file、禁止事項、必要 test、目視確認の受け入れ条件として固定する。実装終了時に current response だけでなく git diff、build、headless test、生成 artifact、必要なら screenshot を照合し、「要求済みだが証拠がない項目」を defect list にする。repair は全体を書き直さず、その欠落だけを局所 patch し、同じ受け入れ条件で再検証する。

次の probe は、同程度の小規模 game task を現行手順と verification-only で複数回比較し、完了率だけでなく、見逃した制約数、誤完了宣言率、repair 成功率、追加時間、tool call、既存挙動の回帰を測る。面白さや手触りは LLM judge 一本にせず、headless invariant、render / screenshot の機械確認、人間 playtest の三系統を分ける。verification が安定して欠落を減らした後だけ、複数環境・複数成果物・長い依存鎖を持つ task に bounded subtask を追加する。

checkpoint は local objective、完了条件、変更 file、test result、未解決 defect、次工程が読む artifact path に絞る。context 圧縮時も original request と直近 action を保持するが、0.9や8000文字を固定規則にせず、後続で必要だった制約の保持率から調整する。外部 web 情報とユーザー指示を同じ summary に混ぜず、provenance と trust level を残し、現在の sandbox・承認・対象 path 制約を維持する。

記憶システムでも atom や candidate の存在を完了証拠にせず、原指示、生成物、検証 evidence を結ぶ。staging は subtask answer、candidate path や commit は result-file handle、最終 phase は original request との global verify と見なせる。phase 数でなく、欠落回復と制作時間の差で採否を決める。

■ メリット・デメリット
メリットは、制約忘却、state transfer、納品物欠落を「model が弱い」で一括せず、original intent、checkpoint、artifact、verification defect のどこで壊れたか追跡できること。特に verification-only は小さい追加費用で分解単独と同じ平均改善を示し、既存 cycle に段階導入しやすい。局所 repair は成功済み工程を壊す範囲も抑えられる。

デメリットは、full harness が平均約54分、backend 入力平均約281万 token / task と重く、単純 task まで分解すると遅延と故障点が増えること。checkpoint の要約誤りは後続全体へ伝播し、verify / repair が同じ model と誤った前提を共有すれば defect を見逃す。judge 依存、memory ablation 不在、反復分散不在のため、報告値を自分達の改善率として見積もれない。host 直実行と prompt injection 持続の設計は不採用である。

■ 判定
部分採用。artifact-level verification、defect の明示、targeted repair、短い checkpoint を先に採る。decomposition と自動圧縮は、verification-only で不足した長い制作 task に限定する。FULL の最高点でなく、欠落回復率、誤完了率、追加時間、playable 品質で拡張を判断する。

■ URL
https://arxiv.org/abs/2608.05013
