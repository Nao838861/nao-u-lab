■ 概要
MELD は、複数の agent が別々に育てた長期記憶を、単一 store へ乱暴にコピーせず接続する knowledge merge protocol である。既存の tool / task protocol は「何を呼べるか」は運べても、文面の違う同一事実、関連事実、矛盾する主張をどう扱うかは決めない。naive union は重複を増やし、last-writer-wins は由来と反証を消す。MELD は各記憶を sovereign brain のまま保ち、claim の到着時に受信側が意味を判定する。

受信 claim は insert / merge / relate / conflict / reject の五結果へ振り分けられる。まず HMAC、staleness、既に overruled かという admission gate を通し、失敗時だけ reject する。既存 claim に embedding 類似度の下限以上の候補がなければ新規 insert。候補があれば、scope を含む claim-key、embedding 類似度、natural-language inference（NLI）の三信号を使う。矛盾判定を高い merge 閾値より前、低い relatedness floor から行うため、表現の離れた否定も conflict として残す。矛盾でなければ、同一 scope の exact key、または高類似度に Context と authority gate を加えた経路で merge し、残りは別 claim のまま relate する。

state を直接変えるのは受信 delta ではなく、一つの authenticated Patch だけである。Patch は判定、対象、発火した gate、追加する node / link / status を記録する。status 変更は append-only link として運び、claim ごとの status CRDT で partition 復旧後に再収束させる。矛盾の真偽は決めず、contradiction link として後の裁定へ残す。

HotpotQA distractor 200問を3 brain、重複率0.5へ分割した recall@5 は distributed merge 0.630、centralized store 0.619で、事前の±0.05同等性範囲に入った。naive union 0.595に対しては+0.035、live storage は約11%少ない。104ペアの分類 gold は macro-F1 0.845、AUC 0.968、false-merge 0.013（merge 不可78ペア中1件）。partition-heal は status CRDT が30/30、last-writer-wins は11/30で再収束。semantic routing は recall 0.997で delta を585から195へ減らした。結論は、分散記憶の重複・矛盾・status を扱えるが、truth adjudication と graph 全体の一意収束は解かない、というものだ。

■ 内容分析
本質は、semantic similarity を使った dedup そのものではなく、「同一」「関連」「矛盾」「採用不可」を一つの受信手順で混同しない点にある。key だけでは言い換えを拾えず、embedding だけでは高類似の矛盾を誤統合する。実際、key+embedding の ablation は false-merge 0.090だったが、NLI を加えると0.013へ下がった。また conflict 判定を merge 閾値から relatedness floor へ移すことで conflict recall は0.23から0.96へ上がり、false-merge は増えていない。安全側の誤りを silent merge ではなく余分な conflict と人手裁定へ寄せる設計である。

数値の読み方には注意が要る。分類 gold は104ペアと小さく、false-merge 1件の95%上限は0.069である。閾値0.90は all-MiniLM 系では移ったが mpnet には移らず、domain と encoder ごとの calibration が要る。NLI は admission cost の83%を占め、edge CPU で1 delta 約23.5ms。候補探索も全 active claim の線形 scan である。

最も重要な限界は、CRDT が収束させるのは claim status であって knowledge graph 全体ではないことだ。同じ16 claim を200通りの順序で入れる実験では177種類の graph fingerprint が生じ、top-k retrieval も順序差を観測した。先に届いた claim が次の best candidate を変えるため、全 node の集合と status が一致しても、どれが代表 claim になり、どの link が張られるかは一致しない。したがって「CRDT だから記憶内容が決定的」と解釈してはいけない。必要なら、収束済み claim set に対する deterministic re-adjudication が別途要る。

trust も限定的である。group HMAC は transport 改竄を防ぐが、個別 sender の帰属は証明しない。脅威モデルは benign fault で、悪意ある peer や虚偽 evidence には耐えない。MELD は「矛盾を失わず後から直せる形で運ぶ」protocol であり、truth engine ではない。

■ 自分達の環境への適用
自分達の記憶では federation や Kafka を入れず、per-atom `.md`、candidate、game production log の claim admission だけを試す。対象は「build X、level Y、seed Z で headless test が失敗」「candidate C は directive D で postponed」「仕様 S は commit H で superseded」のように正解を定義しやすい情報へ限る。

各 claim に `subject / predicate / value / scope / valid_from / provenance / authority / status` を持たせる。scope は project、branch、build hash、level、seed、test id から必要分を選ぶ。同じ「boss が倒せない」でも build や seed が違えば relate、同じ replay と build で結果が割れた時だけ conflict とする。仕様、実行 trace、AI の解釈も type を分ける。

24件程度の fixture に、同義言い換え、別 scope の類似 claim、同一 scope の矛盾、stale claim の再流入、別 build の playtest 差を入れる。現行の normalized-content-hash fold、embedding のみ、key+scope+NLI を比較し、false merge、false conflict、scope leak、stale revival、recall@k、人手 review 件数、latency を測る。

ingestion 順を20通りに替え、status、代表 claim、typed link、検索結果の fingerprint を保存する。順序差が出る間は store を直接更新せず、Patch を proposal JSONL にする。exact key と lifecycle gate は deterministic に確定し、semantic merge は候補提示、conflict は未解決で保持する。Patch には入力 id、比較対象、三信号、gate、判定、model / threshold を残す。

採用 gate は scope leak と stale revival が0、false merge が baseline を悪化させず、recall が改善し、順序を変えても current status が一致すること。既存の dual-write や lifecycle 正本を壊さず、矛盾保持と監査可能な admission だけを検証する。

■ メリット・デメリット
メリットは、重複、関連、矛盾、reject を別操作にし、由来を消さず recall の混雑を減らせること。scope と validity は古い仕様や別 build の上書きを防ぐ。Patch は、なぜ統合したかを監査・再計算する足場になる。

デメリットは、scope schema、authority、閾値を誤ると誤統合が体系化されること。NLI の見逃しは silent merge を残し、過検出は conflict と人手 review を増やす。status が収束しても graph と retrieval は順序依存で、CRDT だけでは deterministic memory にならない。評価も QA benchmark、小規模 gold、最大4 node の実 multi-host latency が中心で、長年蓄積した制作記憶、頻繁な仕様変更、悪意ある入力への外挿は未検証である。全面導入は、現在の単純な per-file 運用より複雑さと観測コストを増やす。

■ 判定
部分採用。五分類そのものを新しい全記憶基盤として導入せず、scope 付き claim、stale gate、conflict preservation、監査可能 Patch を限定 fixture で試す。成功条件は recall だけでなく誤統合、scope leak、順序感度、人手裁定量で判定する。semantic merge は当面 proposal に留め、deterministic evidence と lifecycle 正本を自動上書きしない。

■ URL
https://arxiv.org/abs/2608.16357
