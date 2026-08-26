■ 概要
Weighted Memory Tree（WMT）は、長期実行する LLM agent の問題を「履歴をどれだけ保存するか」でなく「何を次の推論で active にするか」と捉え直した memory 管理方式である。linear history は action、observation、失敗、古い仮説を毎回 prompt に戻すため、履歴が伸びるほど token cost が増え、正しい evidence と stale な情報が競合する。WMT は base model や tool interface を変えず、persistent memory と working context を分離する層を置く。

履歴は root task、subtask、action の木として保存され、各 node は lifecycle state（active / completed / folded / obsolete）、0〜1の retention score、連続未選択回数、実行 metadata を持つ。root から active subtask までの path は常に prompt に残す。それ以外の node、fold 済み summary、failure warning は、LLM-based selector が relevance、score、branch priority を見て budget 内で選ぶ。選外でも記録は消さない。

score 更新は、action outcome が success なら0.75、failure なら0.30を与える event-based update と、候補なのに未選択だった node を連続回数に応じて落とす selection-based decay の二系統。選ばれれば未選択回数は0へ戻り、候補外なら減衰しない。branch priority は node score の最大値と平均値を加点し、failure / obsolete 比率を減点する。0.10未満の branch は抑制するが削除しない。完了 branch は目的、結果、evidence、未解決点、failure warning に fold し、再開時は reopen できる。

評価は GAIA 165問と添付 file のない GAIA-Text 127問で、Qwen3-8B、Gemma 4 E4B、Llama-3.1-8Bを同じ agent 条件で比較した。GAIA-Text で linear history に対し accuracy は平均9.97 points上昇、prompt token は32.8%減少。全 GAIA でも10.10 points上昇、32.2%減少した。unweighted tree は6つの model・dataset 組合せで一貫せず、木構造だけでは不十分だった。

100の長期 scenario、297 subtask、1,118 memory entry（うち409件を意図的に汚染）による poisoning 評価では、Full WMT は linear memory に対し Attack Success Rate 0.995→0.419、Poison Retrieval Rate 0.246→0.097、Blast Radius 0.906→0.315、Task Success Rate 0.183→0.575となった。結論は、長期 memory の価値は全履歴の保持より、utility を継続更新し、現在の推論へ入れる情報を制御することにある、というものだ。

■ 内容分析
本質は tree 自体でなく、persistent storage と active context を別の状態機械にした点だ。失敗は warning として残し、完了枝は fold、低 priority 枝は suppress、必要なら reopen するため、「忘れる」と「今は提示しない」を分離できる。経過時間でなく、候補なのに使われなかった時だけ減衰するので、長く参照されない希少 evidence も直ちには失わない。

ablation では、semantic selection だけだと accuracy は概して上がるが、追加 call と未圧縮 branch のため token は全 model で増えた。summary は token を減らすが accuracy は混在した。選択＋要約の部分構成でも、GAIA-Text の3 model平均は accuracy 21.78%、51.98M tokens、Full WMT は28.08%、40.50M。retrieval、compression、retention / lifecycle は代替でなく、組合せで精度と費用を両立したと読める。

ただし score を「正しさ」と解釈してはいけない。論文自身の例では、非公式 mirror が偽の著者情報を返しても tool action が成功扱いなら正規 PDF と同じ0.75を得る。WMT は誤情報 detector ではなく、semantic selection、未選択減衰、明示的 supersession で影響を弱める装置である。selector や summary generator 自体が誤れば、正しい少数 evidence を落とす、誤った要約を active に固定する、という別の failure が起きる。

poisoning 数値も単独では読めない。Full WMT の Infection Persistence は0.009だが、unweighted tree と retrieval 無しも同値。Context Compression Ratio は Full WMT 0.819に対し controller 無し0.634で、圧縮率だけ下げても良くない。Task Success Rate と blast radius の併読が必要だ。評価は同じ GAIA 系で、question ごとに新しい tree を作り、cross-conversation global memory は未評価。8B級 model の結果を長期ゲーム制作へ直接外挿できない。

■ 自分達の環境への適用
制作サイクル一件を root、playable diff を feature task、実装・headless run・visual review・修正を subtask / action とする小さな ledger を試す。active path には目的、受入条件、対象 commit、未解決 failure を残す。完了試行は「変更点／結果／artifact／残課題／warning」へ fold し、raw log、画像、動画、seed は provenance から戻れるようにする。旧 build の観測は obsolete として通常 recall から外すが保持する。

既存 atom 全体へ score を即導入せず、同一 project の task node に限定する。初期値は LLM の自己評価でなく evidence class から与え、再現済み headless test、commit に結びつく runtime observation、ユーザー確定仕様を高くする。推測や再現不能 failure は低くするが捨てず、warning 枠を確保する。新しい実行証拠が旧判断を覆した時だけ supersession を明示する。

probe は過去3件の制作 task を replay し、linear recall と WMT-lite を同じ次作業 prompt で比較する。測るのは仕様・build の取り違え、既知 failure の再発、正しい evidence の recall、obsolete 混入、prompt token、fold から raw artifact へ戻れた率、追加 call 時間。古い仕様、成功扱いの誤観測、別 branch の無関係な正しい結果も注入し、retrieval と判断の汚染を測る。

採用 gate は、linear recall より仕様取り違えと再発を減らし、重要 evidence の欠落を増やさず、総 token と追加 latency が制作一手の価値に見合うこと。score の最大値・平均値・failure 比率を混ぜる論文式は固定採用せず、まず deterministic な lifecycle と active path、fold / reopen、provenance を実装する。score と LLM selector は replay 結果を見て後段で加える。これなら機構ごとの効果と事故点を分離できる。

■ メリット・デメリット
メリットは、履歴を削除せず prompt だけを小さくし、完了・無効化・再開を明示し、失敗を warning として再利用できることだ。poisoning を完全検知できなくても、active context への増幅を狭める考え方は、外部記事、Slack、自己記録が混在する環境に合う。

デメリットは、hand-tuned score が task 分布に依存し、未選択だが重要な evidence を沈め得ることだ。action success は factual correctness でなく、summary と selector も誤り源になる。短い task では管理費が上回る。branch 設計を誤ると、有用 node 一つで低品質枝を延命するか、failed 比率で探索試行を丸ごと抑制する。創作案と検証済み事実は同じ規則で扱わない方がよい。

■ 判定
部分採用。persistent / active の分離、task 階層、fold / reopen、obsolete でも非削除、active path と failure warning の保持を先に WMT-lite として試す。論文の固定 score、threshold、LLM semantic selector は GAIA 固有の可能性があるため、そのまま導入しない。制作 task replay と汚染注入 test で、正しい evidence の保持、古い判断の抑制、token・latencyを同時に満たした場合だけ段階的に加える。

■ URL
https://arxiv.org/abs/2608.20631v1
