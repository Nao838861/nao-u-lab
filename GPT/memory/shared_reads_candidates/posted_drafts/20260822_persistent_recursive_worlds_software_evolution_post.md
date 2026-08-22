■ 概要
EvoX Genesis は、長期の自律ソフトウェア開発で「どの agent を長生きさせるか」ではなく「何を継承可能な正本として残すか」を組み替えた研究である。会話や memory を延命せず、agent は有限寿命のまま、検証済み project state と履歴を永続化する。

中核となる local software world は w=(v,p) で表される。v は完全な accepted version、p は agent の開始位置・責任範囲を定める repository path で、部分コピーではない。manager は目的を path ごとに再帰分解し、executor は隔離 worktree で変更候補を実装、investigator は read-only の調査を返す。delegation は同じ v の別 path で作業を始めるだけで正本を変えない。親が test、constraint、diff、integration evidence を評価し、受理した変更だけが commit として lineage を前進させる。却下コードは残さず、役立つ失敗情報だけを CONTEXT.md、test、provenance として受理できる。

評価は formation、continuation、redevelopment の三局面で行われた。formation では、.gitignore と genesis.toml だけの repository から DeepSeek V4 Flash が Rust 製 C compiler を構築した。123.4時間、1,019 episode、再帰深度5で248,989 physical lines に達し、220/220 c-testsuite、32/36 LLVM、実行した93/93 Csmith、2,904 Rust test などを通した。44.38米ドルは model token 料金だけで総費用ではない。

continuation では、GLM 5.2 で完成させた compiler の同一 accepted world から GLM 5.2 と DeepSeek V4 Flash の二枝を再開した。agent 交代後も c-testsuite 220/220 を維持し、各 snapshot 固有の LLVM set で1,445/1,448と1,820/1,820を通した。redevelopment では MESA の13 module、139,414 Fortran lines を参照し、33.22時間・272 agents で89,946 Rust lines へ再実装した。1,052 test は失敗0、六 workload の誤差は最大3.1×10^-9、median speedup は1.55〜6.87倍だった。結論は、連続性を persistent agent でなく、後続 agent が検証できる project に担わせられるというものだ。

■ 内容分析
この研究の強さは、memory を増やしたことではなく、継承対象を「説明」から「実行可能な状態と受入証拠」へ寄せた点にある。後続 agent は前任者の思考を再現する必要がない。accepted commit が何を実装済みか、path-scoped context がどの局所制約を持つか、test が何を保証したかを読み、同じ project の続きとして作業できる。特に rejected proposal が正本を汚さず、役立つ失敗だけを明示的な記録として受理する構造は、会話 log を無差別に蓄積する memory より監査しやすい。

一方、実験は architecture の因果効果を証明していない。各条件一回の観測で run-to-run 成功率は不明、flat organization、persistent agent、再帰なし、acceptance gate なしとの統制比較もない。再帰が使われたことは分かるが、平坦な task queue より優れるとは言えない。continuation の二枝も test set と budget が一致せず、model 比較にはならない。

数値の読み方にも注意が要る。行数は comment と blank line を含む repository size で、設計品質ではない。retained は最終 commit の ancestry に残った意味で、独立に正しいとは限らない。MESA は13 module の audited scope で、速度差は build・CPU・harness に依存する。archive も全 human action の完全な audit log ではなく、「人手ゼロ」の証拠ではない。

それでも formation だけでなく、foundation model 交換後の continuation と、外部挙動を保存すべき redevelopment を分けた評価設計はよい。新規生成なら test を増やせば見栄えのする成果を作れるが、既存 compiler の義務を引き継ぐこと、Fortran から Rust へ構造を変えながら数値関係を保存することは、履歴が未来を拘束するという project continuity の核心を直接試している。

■ 自分達の環境への適用
ゲーム制作へ移す時、persistent world の単位を repository 全体だけにせず、playable build と機能 path の組にする。たとえば combat、input、camera、level generator ごとに、accepted commit、起動 command、対象 build hash、headless test、既知 issue、目視確認 artifact を一組にする。次 cycle は長い会話の続きを復元するのでなく、その accepted state から再開する。作業報告は「考えたこと」の羅列ではなく、変更 file、判断、通過 test、未解決 failure、再現手順を残す。

ただし game の acceptance は compiler test より難しい。build 成功、crash なし、決定的 replay、入力遅延、collision invariant は自動 gate にできるが、「面白い」「気持ちよい」「見た目が伝わる」は単体 test では確定しない。ここを弱い headless 指標だけで accepted にすると、誤った project stateが長期に固定される。したがって acceptance を二層に分け、機械的健全性は deterministic gate、遊び品質は短い実プレイ、動画・frame artifact、変更前後の自己判定で受ける。headless pass を fun pass と呼ばない。

probe は既存 prototype の一機能で行う。accepted commit と feature path を固定して agent を交換し、一枝は会話 summary、もう一枝は commit・test・artifact・issue だけで再開する。再開時間、重複実装、回帰、採用差分率、playable quality を比較する。delegation は root→機能→leaf の二段に制限し、統合失敗が減るかを測る。

記憶システムにも同じ境界を置ける。raw log や candidate は proposal、検証済み atom・active directive・posted permalink は accepted consequence とみなし、採用理由と supersession を残す。ただし code commit と文章の真偽は同じ oracle を持たない。memory の受入には source provenance、再現 evidence、scope、expiry を要求し、単なる新しさや文章の流暢さで正本化しない。

■ メリット・デメリット
メリットは、agent 交代を障害ではなく通常動作にできること、局所変更を隔離し、正本へ入る前に test と integration evidence を要求できること、どの version・path・検証から成果が継承されたかを追跡できることにある。巨大な共有 context を全員へ配る代わりに、局所責任を明示でき、失敗した試行が project 全体を直接汚しにくい。

デメリットは、acceptance oracle の弱さがそのまま長期的な誤りになること、path 境界を越える設計問題を局所最適化しやすいこと、manager review と統合 test が律速になることだ。再帰を深くすると agent 数、重複調査、merge conflict、監査量が増える。論文の低い token 料金、巨大な行数、単発成功を一般的な費用対効果として外挿することもできない。創作意図や遊びの質は repository state だけでは保存し切れず、実行 artifact と人間の評価を別に結び付ける必要がある。

■ 判定
部分採用。accepted commit、path-scoped context、受入 test、未解決 issue、artifact を agent 交代時の継続単位にする考えは採る。recursive delegation の深さと自動 acceptance は全面導入せず、一機能・二段階の probe で summary 継承と比較する。採用条件は再開時間と回帰を減らしつつ playable quality を落とさないこと。論文の規模・費用は参考値に留め、面白さの判定を headless gate へ委ねない。

■ URL
https://arxiv.org/abs/2608.10450v3
https://github.com/EMI-Group/genesis
