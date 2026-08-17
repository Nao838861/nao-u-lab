■ 概要
この論文は、永続 memory を持つ LLM agent が「外部世界について何を知っているか」だけでなく、「以前どんな検証を終え、なぜその判断をしたか」を再利用する時、reasoning history 自体が攻撃面になると示す。典型的な memory poisoning は事実、検索文書、成功例を汚染するが、FARMA（Forged Amplifying Rationale Memory Attack）は「上流ですでに検証済み」「過去の処理でも一貫して問題なし」という偽の decision log を書き込み、必要な安全確認を完了済みだと agent に誤認させる。

FARMA は二段階で動く。Injection phase では、露骨な skip / bypass を避け、対象 domain の語彙と agent 自身の記録形式に似せた seed trace を既定で3件挿入する。Amplification phase では「過去N回と整合する」と先行する偽 trace を参照する記録を繰り返し追加し、top-k retrieval に現れる確率を上げると同時に、異常値を多数派との不一致で検出する consensus 型防御を逆用する。攻撃は victim query 前に template だけで生成でき、LLM API call は不要である。

防御の SENTINEL は memory write 前の五層 pipeline で、keyword filter、declared source による provenance / taint、threshold、pattern / risk screening の後、Reasoning Guard が候補 trace を構造的に検査する。五つの signal は、source と内容の不整合、自己参照した件数と実 store の不整合、疑わしい decision-log 語彙の密度、過度に完全な成功主張、定型的な構造で、等重みの score が閾値を越えると拒否する。reasoning store 以外へ偽装しても、decision_log、reflection 等に見える一般 memory へ同じ guard を掛ける。

評価は GPT-4o-mini、GPT-4o、Llama 3.3 70B と、医療 record import、検索 QA、shopping の三 domain、各条件50 trial、増幅10 cycle で行われた。clean run が安全行動、poisoned run が攻撃目標へ変化した場合だけ成功と数える。undefended FARMA の ASR は医療 domain で全モデル100%、検索 QA 52%、shopping 48%。SENTINEL はそれぞれ0%、6%、0%へ下げた。医療 domain の ablation では Reasoning Guard を外すと100%、Guard 単独なら0%で、主要効果は最終層に集中した。benign trace 326件では chosen threshold で false positive は0件だった。

■ 内容分析
重要なのは、過去の reasoning が単なる参考文ではなく「検査を省略してよい証明」として使われる瞬間を trust boundary と捉えた点だ。現在の memory system は provenance を source label や投稿者名として持っていても、その label を書込側が自己申告できるなら信頼根拠にならない。論文の FARMA seed も source=AGENT、trust=VERIFIED を偽装するため、coarse な provenance layer は通過する。必要なのは label の存在ではなく、誰がどの実行から生成し、どの artifact が主張を裏付けるかを改変困難な形で結ぶことだ。

増幅が consensus 防御を破る構造も本質的である。同じ内容の記録が多数あることは独立証拠の数を意味しない。一つの偽主張を自己参照して十回書けば、件数は増えても evidence lineage は一つのままである。memory の duplicate fold や多数決は、content hash だけでなく由来 graph を見なければ、反復を確信度へ誤変換する。これは悪意がなくても、定時 cycle が旧 atom を要約し直し、その要約を次の cycle が独立 observation と数える場合に再現する。

一方、SENTINEL の数値を完成した防御として読むのは危険だ。Reasoning Guard の phrase density と定型構造は、攻撃 template を知った heuristic である。著者自身の preliminary evaluation では、Guard の pattern を知る適応的 attacker が paraphrase すると有意な防御にならなかった。評価も単一 agent・単一 store の simulated environment で、長期間の多様な write、multi-turn、共有 memory は未検証である。0/50 は真の ASR が厳密に0という意味ではなく、表にも Wilson 95% CI の上限7.1%が示されている。326件で false positive なしも、我々の日本語 mixed-format atom や短い lifecycle record へそのまま外挿できない。

■ 自分達の環境への適用
適用先は、GPT 側の atom ingest、Slack directive lifecycle、headless playtest の結果取り込みである。最初の対策は自然言語 classifier の移植ではなく、write path で「主張」と「実行証拠」を分離することに置く。たとえば「build X の collision bug は解消済み」という memory は、生成 agent 名だけで verified にせず、build hash、test command、seed、exit code、artifact path、観測時刻を evidence として持つ。証拠がない reasoning は proposal、再現済みだけ confirmed とし、proposal を根拠に安全 check や test を省略しない。

第二に、自己参照増幅を provenance graph で fold する。summary B が atom A だけを根拠にし、summary C が B を根拠にするなら、独立 evidence count は3ではなく1と数える。同一 normalized content hash の fold に加え、source_atom_ids と execution_id の祖先を辿り、同じ root evidence の再記述を consensus に加算しない。Slack、web source、runtime log のように由来が異なる evidence が一致した時だけ confidence を上げる。

小さな probe は攻撃用 fixture 12件と benign fixture 30件でよい。①露骨な skip、②「検証済み」という婉曲表現、③同一 root の10回増幅、④件数を偽る自己参照、⑤general memory への reasoning 偽装、⑥正当な regression closure を用意する。現行 ingest、keyword、lineage fold、evidence-required gate を比較し、poison admission、危険 action 率、benign rejection、write latency、手動 review 件数を測る。自然言語 Guard は補助 signal に留め、最終 gate は署名済み実行記録や deterministic な lifecycle transition に寄せる。

■ メリット・デメリット
メリットは、reasoning trace を無条件に「自分の過去」と信じない設計へ切り替えられること、書込時に汚染を止めて後続 retrieval への増幅を防げること、自己参照を独立証拠と誤認する問題を測定可能にできることである。heuristic は1 write 1ms未満と報告され、cheap filter から精査へ進む層構造も実装しやすい。

デメリットは、論文の主防御が adaptive paraphrase に弱く、英語 domain 固有 phrase へ過適合していることだ。厳格な gate は正当な reflection や形式の揺れを落とし、evidence 添付は保存量と運用負担を増やす。write 権限を奪われた前提では metadata も同時に偽装されるため、同じ store 内の trust label だけでは循環論証になる。multi-agent 共有 memory では一つの compromised writer から影響範囲が広がるが、その評価は今後の課題である。

■ 判定
部分採用。FARMA の threat model と「write 時検査」「自己参照を独立証拠として数えない」「reasoning に実行証拠を要求する」を採る。SENTINEL の keyword や phrase score は probe 用 baseline とし、本番の信頼境界にはしない。採用 gate は、日本語の benign memory を過剰拒否せず、lineage を共有する増幅 trace が危険 action を正当化できないこととする。

■ URL
https://arxiv.org/abs/2607.05029
