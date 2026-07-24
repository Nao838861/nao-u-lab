■ 概要

LLM agent の実行 trace には「なぜ失敗したか」が残るが、生ログは長く、個別文脈に埋まり、run をまたいで比較する安定語彙がない。成功率は蓄積しやすい反面、失敗理由を失う。free-form reflection は理由を書けても、その場で診断を作り直して捨てるため再利用しにくい。AdaMAST はこの間に「証拠に接地した system 固有の failure taxonomy」を置き、永続的な失敗語彙を共有 interface として使う。

固定するのは code ではなく介入先を表す3軸だけである。A は harness や orchestration など system-level、B は solver や checker など role-specific、C は task knowledge に関わる domain-specific の失敗を表す。code 名、定義、role label、evidence pattern は対象 system の trace から生成し、人手の事前定義や trace ごとの人手 annotation を要求しない。単一 agent でも B 軸は実行 phase を role とみなせる。

生成は ANALYSIS、CURATION、CONSOLIDATION、INTER-ANNOTATOR AGREEMENT の4段階で行う。最初の3段階は、trace から domain、role、反復挙動を抽出し、軸別候補を作り、重複や根拠のない code を除く8回の LLM call である。次に4つの独立 annotator が held-out trace を分類し、最大5 round、各5 trace で、平均 pairwise Cohen’s κ が0.75以上、coverage が0.70以上になるまで merge、add、relabel を行う。ただしこの gate が保証するのは適用の一貫性であり、分類の正しさではない。

用途は事後分析に閉じない。第一に agent-system search では、失敗した親候補へ発火 code、根拠箇所、問題横断 pattern を返して mutation の介入先を明確にする。同じ AdaEvolve backbone、seed、計算量で比較した5 benchmark すべてで、post-search accuracy は free-form より3.4～7.5ポイント高く、OlympiadBench では87.9%から91.9%となった。

第二に runtime checkpoint で現在の trace を code に照らして点検し、submit 前に修復する。SWE-bench Verified Mini では、Claude Code が base 64.0%、固定14 code の MAST 67.3%、AdaMAST 70.7%。SWE-agent は base 50%、free-text reflection 60%、MAST 68%、AdaMAST 70%だった。第三に completed trajectory の選択へ使う。Terminal-Bench 2.0 の best-of-5 では、Pass@1 に対して3 harness で8.1～14.9ポイント改善し、非飽和の2 harness では MAST より3.4、4.5ポイント高い。論文の結論は、taxonomy を単なる報告用分類表ではなく、search、runtime repair、trajectory selection が共用する feedback infrastructure として扱える、というものだ。

■ 内容分析

重要なのは「賢い批評 prompt」ではなく、失敗診断を再利用可能な中間表現にした点である。3軸は分類学上の美しさより、修正責任の切り分けに効く。A が発火すれば workflow や harness、B なら役割設計、C なら task knowledge を直すため、code がそのまま mutation の探索方向になる。OlympiadBench では coordinator aggregation mismatch が、verification を二値 gate から score boost へ変える設計変更に接続した。長文の反省より短い code が効いた理由は圧縮だけでなく、同じ失敗名を複数 run と複数 consumer が共有し、介入箇所を固定できたからだと読める。

artifact 自体の検証も厚い。117本の expert-annotated TRAIL trace で panel と prompt を固定すると、手作り20分類の area-level κ=0.516に対し、29個の誘導 code は0.682、full protocol は0.725だった。6 domain 間の code 集合の平均 Jaccard は0.14。223本の SWE-bench trace では約18倍圧縮しつつ、89%が固有の code signature を保持した。Terminal-Bench では約1.2K token の taxonomy が114K token の trace pool と同等の予測材料になった。

ただし、強い主張と弱い主張を分ける必要がある。TRAIL の細粒度 leaf-level κ は約0.34で、良い一致は broad な Reasoning / Planning / System area での値である。held-out gate も複数 LLM の一貫性を測るだけで、共有された盲点を排除しない。検索実験は比較条件を揃えているが、30～40問の小規模 benchmark や single run も含み、著者自身が一部を directional replication と位置付ける。Terminal-Bench の selector は taxonomy 以外に learned feature selection と regex heuristic を持ち、wrong-domain taxonomy や5 code への切詰めでも成績が大きく落ちない。token-matched 比較では prose や raw excerpt も同程度であり、ここは「taxonomy 文言単独の勝利」ではなく、failure-oriented selection pipeline 全体の実証である。また code-by-code の強制監査は成功 run まで失敗と予測する bias を生み、精度を0.13～0.24落とした。taxonomy は常に前面へ出せばよいのではなく、consumer と提示方法まで含めて設計すべきだ。

■ 自分達の環境への適用

適用先は、面白さを分類表で決めることではなく、制作 agent と AI playtester の反復失敗を次の一手へ接続する補助 index である。20～40本の実装・headless playtest trace から、A を計測不足や harness 不一致、B を設計・実装・playtest 各 phase の役割固有ミス、C を操作予測の破れや戦略の単調化などの介入先として誘導する。例示語を固定 code にせず、evidence span を持つ反復だけを採用する。

導入は既存の raw log、Nao_u のフィードバック原文、成功事例を置換しない。各 code から根拠 trace と修正 diff へ戻れる sidecar index とする。held-out trace では複数回の独立 annotation で一致率、未分類率、根拠 span 率を測る。下流効果は、次の制作 run で同型失敗の再発率、headless 指標、修正までの call 数が改善したかで判定する。未分類率が上がった時だけ code を編集し、自動増殖は避ける。

小さな probe は、同じ5件の失敗 trace から一方は free-form reflection、他方は evidence 付き3軸 code を作り、次の改修案の具体性、介入層の正しさ、再発防止 test の有無を blind に比較する形がよい。trajectory 選択へ進むのは、その差が出てからでよい。ゲーム固有の快感、驚き、読み合いは「失敗が少ないほど良い」とは限らず、意図的な摩擦や例外が面白さを作る。したがって taxonomy は操作不能、検証漏れ、workflow 停滞の診断には使うが、創造的価値や最終的な面白さの判定器にはしない。成功 trace と Nao_u の教師情報を別系統で残すことで、失敗語彙だけが制作判断を支配するのを防ぐ。

■ メリット・デメリット

メリットは、長い trace を捨てずに横断比較でき、同じ診断を search、runtime repair、候補選択へ再利用できること、code が A/B/C の介入先を持つため「反省したが何を直すか不明」を減らせること、system の変化に応じて語彙を更新できることにある。既存の記憶システムに対しても、raw atom を削らず、再発 pattern と実装 diff を結ぶ軽量 index として相性がよい。

デメリットは、taxonomy 生成よりも検証と保守が重いこと、LLM annotator 間の一致を真実と誤認しやすいこと、稀だが重大な failure が頻度ベースの整理で消えること、code の増殖が既存の「個別指摘を即ルール化しない」原則と衝突し得ることだ。特にゲームでは、観測可能な失敗だけを最適化すると、測りにくい面白さや新奇性を削る。固定 MAST が runtime でかなり接近し、selection では heuristic の寄与が大きい結果も、全面導入の根拠を弱める。

■ 判定

部分採用。3軸、evidence grounding、held-out 適用性 gate、raw trace を残す sidecar という4点だけを小規模 probe に導入する。taxonomy を恒久ルールや面白さの採点表へ昇格させず、同型失敗の再発率と改修案の具体性が free-form reflection より改善した場合に限り、headless 評価と候補選択へ広げる。

■ URL
https://arxiv.org/abs/2607.16387
