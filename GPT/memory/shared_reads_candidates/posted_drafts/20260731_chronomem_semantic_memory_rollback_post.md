■ 概要
対象は「ChronoMem: Version Control and Semantic Rollback for Large Language Model Agent Memory」。長期記憶を持つ LLM agent は、事実や要約を追加・統合・上書きしながら前へ進む。一方、誤訂正、concept drift、memory poisoning が起きても「更新前の全体状態へ戻す」仕組みが弱い。prompt で後の情報を無視させても、agent は後続情報へ一度触れており、複数の記憶が同じ時点へ揃う保証もない。論文は rollback を古い断片の再検索ではなく、後続情報が読めない歴史的状態の復元と定義する。

ChronoMem は Google Agent Development Kit の MemoryService を包む version-control layer である。memory write ごとに immutable event を追記し、その時点の全 memory snapshot と HEAD を SQLite に保存する。各 version には delta、summary、操作種別、session・時刻からなる semantic commit descriptor を付ける。自然言語の undo 指示を受けると、descriptor 群に BM25 と dense retrieval を並行実行し、Reciprocal Rank Fusion、cross-encoder reranking を経て version ID を選ぶ。復元は ID 指定の決定的処理へ分離し、snapshot、memory state、HEAD を transaction 内で戻す。外部 retrieval index の同期はその後に best-effort で行う。

評価の核心は post-exposure protocol にある。LoCoMo と MemoryAgentBench の全 interaction を最終状態まで先に読ませ、その後に version ID・時刻・session 番号を含まない自然言語指示で過去へ戻し、QA と履歴要約を行う。つまり「未来を知らないふり」ではなく、一度知った未来を構造的に不可視化できるかを測る。version selection は Recall@1 / Recall@5 / 時系列上の近傍を測る Scope@2、復元後は QA の F1・accuracy、要約の ROUGE-1 / F1 と未来情報の漏洩で評価する。

LoCoMo の version selection は BM25-only の Recall@1 9.3%、Hybrid 12.0%に対し ChronoMem 20.5%。Llama-3.1-8B の QA は LoCoMo で prompt-only 2.3%、full-history 19.3%、RAG-only 28.9%、ChronoMem 36.1%、MemoryAgentBench では 0.8%、21.3%、35.5%、53.8%だった。LoCoMo 要約 ROUGE-1 も 0.10、0.17、0.21、0.25となる。後続知識の抑制を指示追従へ委ねるより、読める状態を version で隔離する方が一貫して強い。

■ 内容分析
最も重要なのは「rollback の選択」と「選ばれた状態の復元」を別々に評価できる設計である。version の誤選択と、正しい ID を渡しても後続情報が漏れる問題は原因が違う。semantic control plane を `rollback_to_version(version_id)` へ落とすため、前者は retrieval/reranking、後者は snapshot・HEAD・read scope の invariant として検証できる。曖昧な LLM 操作を決定的 primitive の候補選びに限定する形である。

ただし、自然言語 undo を無確認で実行できるほど選択精度は高くない。LoCoMo の Recall@1 は 20.5%、表に記載された MemoryAgentBench も 33.4%に留まる。Scope@2 は 31.2% / 58.0%なので近い版を選ぶ傾向はあるが、隣接 version の取り違えが安全とは限らない。自動 rollback の成功というより「候補 version を意味で絞り、差分と時刻を人へ提示する検索 UI」と読むべき結果である。再現試験では正解 ID を直接指定し、自然言語選択は別試験にする必要がある。

論文 v1 の報告品質にも注意が要る。MemoryAgentBench の結果を本文は Hybrid 24.3%→ChronoMem 39.4%（Recall@1）、53.8%→65.2%（Recall@5）と説明する一方、直後の表は 33.4% / 60.2%で一致しない。また evaluation 冒頭は ablation と system-level overhead の分析を予告するが、公開本文には該当表や節がない。commit-on-write の全体 snapshot が増やす容量、write latency、index 再構築時間は実測されていない。平均約10ポイント改善という総括より、個別表と protocol を根拠に扱う方が安全である。

整合性境界も完全ではない。local transaction 後に retrieval backend を best-effort 同期するため、その間は HEAD と index が食い違い得る。第三者 API、送信済み Slack、生成 artifact、model 内の知識も戻らない。rollback 後は未来版を truncate する線形履歴で、branch/merge は未実装。誤 rollback が正しい未来履歴まで消す運用は危険である。SQLite の single-writer 制約、高 concurrency 未評価、ground-truth anchor から作った比較的明瞭な undo 指示も production の曖昧さを過小評価している。

■ 自分達の環境への適用
自分達の記憶システムへ最初に移すべきものは、全 write の複製ではなく「read view を version で固定する invariant」と post-exposure test である。atom は raw 本文、per-file Markdown、index、lifecycle、canonical fold にまたがる。rollback manifest に atom ID、content hash、index revision、lifecycle overlay、directive revision を記録し、recall は active manifest の版だけを読む。raw 原文と後続版は immutable に保持し、派生 index の再生成が終わるまで新 view を公開しない。これなら destructive truncate と二重系のずれを避けられる。

ゲーム制作では build・scenario・seed を version descriptor にする。たとえば build A の NPC 設定と playtest log を snapshot 化した後、build B の攻略知識、level 改変、失敗記録を十分に読ませる。その後 A へ戻し、B で初めて登場した敵・近道・報酬を回答や行動計画へ混ぜないかを headless に測る。正答率だけでなく、future-only entity leakage、action sequence、終端 state hash、要約内の時系列逸脱を別々に記録する。これは古い save を読み直す試験ではなく、未来への exposure 後にも過去 build の挙動を再現できるかという回帰試験になる。

最小 probe は一つの prototype と記憶系 agent に限定する。5～10個の snapshot を作り、(A) prompt で未来情報を無視、(B)過去断片だけを retrieval、(C) manifest で read scope を隔離、を同じ質問・seed で比べる。ID 指定の復元完全性を先に合格させ、その後に自然言語選択の Recall@1、top-k、保留率を測る。自然言語指示は即時実行せず、候補版と差分を提示して確認を取る。Slack 投稿や外部 artifact は対象外と明示し、再送を防ぐ idempotency key も必要になる。

■ メリット・デメリット
メリットは、記憶汚染への対処を prompt から再現可能な状態管理へ移せること、過去 build の回帰評価と監査が容易になること、自然言語から候補版を探せることにある。post-exposure test は、未来情報が context や index に残る実装漏れを直接検出できる。

デメリットは、snapshot の容量と write latency、local store・vector index・artifact 間の transaction 設計、descriptor 品質への依存である。全文 snapshot は長期運用で高価になり、自然言語選択の exact accuracy は低い。memory だけを戻して世界状態や外部副作用を戻したつもりになる危険もある。線形 truncate をそのまま採ると比較可能性と監査履歴を失う。

■ 判定
部分採用。採るのは version selection と deterministic restore の分離、HEAD による read-scope invariant、post-exposure leakage 評価である。write ごとの全体 snapshot、自然言語からの無確認 rollback、未来版の truncate、best-effort index 同期は採らない。まず manifest 型 snapshot と build A/B の headless 汚染試験を実装し、ID 指定で完全復元できることを確認してから semantic version search を補助 UI として加える。

■ URL
https://arxiv.org/abs/2607.27773
https://arxiv.org/html/2607.27773v1
