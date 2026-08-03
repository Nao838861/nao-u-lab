■ 概要
この論文が扱うのは、agent の能力向上を「長い reasoning、turn 増加、巨大な tool schema、過去履歴の再投入」で買う token maxing である。1 回の model call が安くなっても、1 task 内で呼び出す量がさらに増えれば総費用は下がらない。著者らは、task の請求額を決める主因を model ではなく、context を組み立て、tool を公開し、turn・retry・delegation・停止を制御する orchestration harness だと置く。入力 token を system、history、tool schema、retrieval、user turn に分解すると、user turn 以外と失敗時の再試行回数は harness の実装で変わる。全履歴を毎 turn 再送する loop は turn 数に対してほぼ二次的に膨らむが、安定 prefix の cache、履歴 compaction、tool output の外部退避を組み合わせればほぼ線形へ寄せられる、というのが中心仮説である。

検証は、22 個の固定 enterprise task を6 model、2種の orchestration で実行する paired swap である。task、model ID、judge、価格表を固定し、2026-06-07 に凍結した conventional production loop と Writer Agent Harness だけを入れ替えた。結果は全 model 混合で、task 当たり token が14.2kから8.8kへ38%減、費用が0.21ドルから0.12ドルへ41%減、中央値 wall-clock が48秒から27秒へ44%減。task completion は0.78から0.81で、標本数上は改善ではなく同等と解釈される。quality per dollar は82%増、100万 token 当たり completion は54.9から92.0へ68%増だった。費用削減は全6 model で33～61%と一貫した一方、48個の capability×model cell は30改善、11同等、7悪化。悪化7件は小型側3 model のMCP、Playbook、presentation等に集中した。sub-agent delegation も信頼水準に達したのは上位2 modelだけだった。結論は、harness は model に依存せず仕事の価格を下げられるが、豊かな構造を品質へ変換するには能力下限がある、という二層の主張である。

■ 内容分析
重要なのは「prompt を短くする」一般論ではなく、請求を六つの機構へ分けた点だ。第一は two-zone prompt で、tool schema、安定 system prompt、追記専用 transcript を byte-stable prefix に置き、時計、file list、plan stateなど毎回変わる情報を volatile tail に隔離する。著者らの同一prefix測定では7,886 token中7,876 tokenがcache readになった。第二は入力上限80%で発火する構造化compactionで、決定・制約・却下案、再開用の8区分summary、user要求原文、skill参照をcheckpoint化し、直近4～12 messageは原文のまま残す。checkpointを毎turn書き直さないため、cache安定性と圧縮を両立する。

第三はcontext offloadである。sub-agentは探索全文ではなく8KB上限のsummaryを返し、引用は親contextが読まないsidecarに保持する。skillは名前と説明だけ先に見せ、必要時だけ本文を読む。巨大なtool出力はpreviewと完全版fileへ分ける。第四はzero-token waitingで、承認やbackground jobをpollingせず、durable stateで停止してevent時に再開する。第五はfailure-spend governanceで、失敗を型付けし、許可した種類だけfallbackする。同一失敗tool callが3回続けばcircuit breaker、loopは50回、tool並列は4に制限する。第六はmodel-agnostic floorで、provider差を共通stream contractへ正規化し、native tool callやschema hygieneをharness側で保証する。

この分解には実装へ移せる価値がある。ただし証拠の強さは違う。token・費用・latencyは全task・全modelで同方向の大差なので有力だが、品質+0.03や相関r=0.99は22 promptまたは6 modelしかなく方向性に留まる。baselineは単回でrun間分散がなく、task completionはLLM judge依存、比較は同一企業内の一組で著者も製品開発企業に所属する。他harnessの表も実測benchmarkではない。さらに最も高価なmulti-step researchでは費用が46%下がる一方、品質が0.80から0.60へ悪化した。従って「常に品質維持」ではなく、「効率改善は有力だが、高負荷機能にはtask×model別のrelease gateが要る」と読むべきだ。

■ 自分達の環境への適用
Nao_u_BOTでは、model変更より先に固定game taskでharness差分を測る小さなA/Bが有効である。たとえば同じprototype、commit、seed、成功条件を固定し、(A) 現行の実装・headless評価loop、(B) context編成だけを整理したloopを各複数run実行する。Bで一度に全部を変えず、まずstable directive/tool説明とvolatileなgit status・最新logを分離する。次に巨大なheadless logをfileへ退避して、modelには失敗箇所の前後、state delta、artifact pathだけを渡す。最後に同一errorや同一tool引数の反復を数え、失敗分類ごとのretry上限を置く。この三段階なら、cache、offload、failure-spendの寄与を混ぜずに見られる。

記録する指標は、success rateだけでなく `input_tokens/task`、`output_tokens/task`、`cache_read_ratio`、`wall_clock/task`、`tool_calls/task`、`retry_tokens`、`repeated_no_delta_actions`、`artifact_validity` とする。ゲーム側品質は、起動、操作入力へのstate変化、勝敗到達、指定seedでの再現、退行test通過をdeterministicに採点し、面白さの主観評価とは分ける。token削減後に平均成功率が同じでも、長期research相当の「複数fileをまたぐ実装」「探索後の設計統合」だけ落ちる可能性があるため、taskごとの最低品質もgateにする。memory systemでは、全文再投入を避けるだけでなく、directive原文、現行判断、履歴説明、次actionを別artifactとして保ち、compaction後もuser要件原文とevidence pathを残す。この構造は現在のper-atom file、candidate frontmatter、staging receiptと相性がよい。

最初のprobeは1 prototype・3 taskで十分である。短いbug修正、headless失敗診断、複数fileのmechanic追加を選び、各条件を最低3回ずつ回す。採用条件は、三taskすべてでtokenまたはwall-clockが改善し、deterministic品質が非劣化、retry由来tokenが減り、長期taskだけの退行がないこと。sub-agentや複雑なroutingはこの基礎計測後にし、導入時もchild探索量、親へ返すsummary上限、重複実行防止を別に測る。

■ メリット・デメリット
メリットは、費用問題をmodel単価ではなく実装可能な変数へ戻せること、品質とtoken効率を同じrelease gateで扱えること、cache設計・context退避・停止・retry制御が監査可能性や再開性も同時に改善することだ。固定taskでharnessだけを替える方法は、定時phaseやgame制作agentの改善が本当に効いたかを比較しやすい。特にfailure-spendを独立計上すれば、成功runの平均に隠れるdoom loopを発見できる。

デメリットは、機構をまとめて導入すると何が効いたか分からず、cache hit向上が古いcontext保持や過剰compactionを正当化し得ることだ。context offloadは親のtokenを減らしても、childやhelperのtokenを総額から落とせば見かけの改善になる。小型modelへ同じtool catalogやdelegationを公開すると品質が悪化し得る。論文の削減率はenterprise assistant workload、一社製品、一baseline、一価格表の結果で、ゲーム制作や我々の長時間coding loopへ外挿できない。従ってtotal token、task別品質、run間分散、失敗時再実行費用まで数えない比較は採用判断に使わない。

■ 判定
部分採用。採るのは、固定model・固定taskでharnessだけを差し替える評価設計、stable/volatile context分離、fileへのcontext offload、zero-token wait、failure-spendの型付き計測、CPM相当の効率gateである。38～44%という報告値、品質相関、sub-agentの能力下限は我々の環境で再検証する仮説として扱う。まず小さなgame task三種で機構を一つずつA/Bし、総tokenとdeterministic品質の両方が改善した要素だけを制作cycleへ残す。

■ URL
https://arxiv.org/abs/2607.06906
