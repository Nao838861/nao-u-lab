■ 概要
AgentSLABench は、AI agent を成功率だけで順位付けする評価から、宣言した資源枠の中で成功できたかを測る profiling へ移そうとする論文である。一回の episode を関数呼び出しのように扱い、correctness と同じ試行 ID に wall time、API cost、token 数、CPU time、peak memory、HTTP call、network bytes、constraint violation を記録する。task 側は CPU・memory・wall-time・network 可否の budget を宣言し、Docker で隔離・制限する。出力は episode 単位の JSONL、test set は SHA256 hash で封印、既定は3 seedで、agent・task・環境・seed・資源消費を結ぶ評価を目指す。

指標 EASR（Efficiency-Adjusted Success Rate）は、success に latency・cost・memory の各 budget/actual 比を上限1で掛ける。評価対象は core 5 task と extended 11 task、general baseline 5種、task-specialized agent 4種とされる。表では specialized agent が fact QA と web shopping で100%、retail と travel planning で83.3%、code generation で66.7%を記録し、general baseline は fact QA 以外で0%と報告する。失敗を API signature hallucination、timeout、constraint conflict、rate limit などへ分類する点も特徴である。

ただし、この論文は着想と実証を分けて読む必要がある。公開 repository を照合すると、論文が掲げる六次元 profile と EASR を支える実装・artifact が揃っていない。したがって「この benchmark の比較結果を信頼して導入する」資料ではなく、「我々が自前の headless 評価をどう計装し、何を再現性検査すべきか」を考える反面教師を含む設計資料として読むのが妥当である。

■ 内容分析
良い点は、評価対象を出力だけでなく実行 envelope まで広げたことだ。自動 playtest では即座に clear した一回と、無限 loop 寸前で偶然 clear した一回は同価値ではない。episode profile、隔離実行、sealed test、複数 seed、budget violation の明示はこの差を観測可能にする。raw profile を正本にすれば、後から cost 定義や gate を変えて再集計できる。

一方、論文内部には重大な整合性問題がある。第一に、Table I の latency budget は retail 180秒、code generation 300秒、web shopping 300秒、travel planning 600秒だが、Table IV の実測は順に142ms、2840ms、1250ms、4100msである。単純に割れば budget 使用率は約0.079%、0.947%、0.417%、0.683%なのに、Table V は79%、95%、42%、68%と記載する。約100倍の単位ずれであり、「code generation は latency 限界に近い」という解釈も表からは導けない。第二に EASR の式は超過時に budget/actual の比で連続的に減点するが、Discussion は「超過 episode は correctness に関係なく0」と説明する。さらに Docker が超過を終了・failure にするなら、完走 episode の EASR はほぼ success と同じになり、追加指標として識別力がない。

第三に、要旨と結論は travel planning を100%達成した3 taskの一つに数えるが、Table III は83.3%である。第四に、N=3 seed の bootstrap CI は retail と code generation で [0,1] と極端に広く、論文自身も N≧10 が必要と認める。にもかかわらず specialization の一般的優位を強く結論している。しかも general baseline 0%は能力差だけでなく、task 固有 action schema に接続できない harness mismatch を測っている可能性が高い。specialized agent は domain logic と専用 tool schema を持つため、比較は「汎用推論対専門知識」だけでなく「adapter を与えた側と与えない側」の差でもある。

公開 artifact の監査はさらに厳しい。final result は30 episodeで、各 core taskについて dev/test×3 seed×専用 agent 1種だけだった。record は success、reward、trajectory、wall_time、tokens_used、cost_usd などに限られ、cost は全件0、peak memory・CPU time・network bytes・safety violation・EASR はない。実行コードでも cost は0固定で、EASR 計算や container stats 収集を確認できなかった。general baseline 全比較も検証できない。human spot-check は field 名が simulated_human_agreement で、実人手評価の証拠とは扱えない。test set と Docker task の雛形はあるが、「full profiling artifacts により再現可能」という主張は現状では満たされていない。

■ 自分達の環境への適用
採るべきなのは benchmark の数値ではなく episode profile の形である。headless playtest の各 run に run_id、build hash、scenario、seed、agent version、clear、failure reason、wall time、step count、peak RSS、LLM request 数、token、推定 cost、tool call 数、network bytes、timeout、規則違反を同居させる。生成→実行→評価にも同じ run_id を渡し、速度・安定性・clear rate・memory の trade-off を追う。

最初の probe は小さくてよい。同一 build・同一 scenario について3種類の agent 設定を各10 seedで走らせ、成功率、P50/P95 wall time、peak RSS、1成功あたり cost、timeout率を記録する。hard budget 超過は success と別 field で残し、score 化は後段にする。gate は「clear=true かつ wall_time≦T かつ peak_RSS≦M」のような明示的制約にし、連続 score が必要なら budget 超過量を別々に報告する。単一の積へ潰すと、どの資源が原因か消え、0を一つ含むだけで他の改善も見えなくなるためだ。

再現性 gate には、集計率を raw JSONL から再計算、単位を schema で固定、論文・dashboard の数値を生成 script から出力、主張した field の実在確認、seed 数と標本数の区別、baseline への同じ adapter と tool contract、を入れる。sealed test の hash は漏洩防止そのものではないため、アクセス制御と dev/test 分離も別に要る。

■ メリット・デメリット
メリットは、成功率だけでは隠れる運用不能を試行単位で発見できること、performance regression を build 間で比較できること、raw profile から用途別の gate を再構成できること、timeout や constraint violation を失敗分析へ直結できることにある。ゲーム制作では「遊べる」だけでなく「反復評価を所定時間内に何本回せるか」が制作速度を決めるため、resource telemetry は品質評価と同格の信号になる。

デメリットは、budget が恣意的なら順位も恣意的になること、異種資源を単一積へ潰すと原因が読めなくなること、Docker 外の API latency や provider cost は再現しにくいこと、task-specific adapter の差を agent 能力と誤認しやすいことだ。この論文固有の数値は単位・式・公開 artifact の不一致が大きく、baseline 優劣や EASR の有効性を裏付ける evidence として再利用できない。計装項目を増やすだけでも保存量と分析負荷が上がるため、まず制作判断を変える5〜8指標に絞り、必要時に raw trace へ降りる二層構造がよい。

■ 判定
部分採用。episode 単位の correctness＋resource profile、隔離実行、seed・build・scenario の固定、raw telemetry を正本にする設計は headless playtest harness へ採る。一方、EASR、掲載成績、general baseline 全敗、human agreement、公開済み六次元 profiling という実証主張は採用しない。導入条件は、自分達の runner で raw event から集計を再生成し、単位整合・budget 境界・artifact 完備性を自動検査できることとする。

■ URL
https://arxiv.org/abs/2608.00805
https://github.com/MeherBhaskar/agentslabench
