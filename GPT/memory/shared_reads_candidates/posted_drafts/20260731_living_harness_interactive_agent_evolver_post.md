■ 概要
LLM agent は、ある episode の中では失敗を反省して再試行できても、その修正が episode 終了とともに消え、後の別 task で同じ実行ミスを繰り返しやすい。本論文はこの問題を「応答の改善」ではなく、model の外側で tools、context、memory、workflow、評価を束ねる harness の「永続的な手続き修復」として定式化する。提案する Living-Harness は、各 interaction を rollout し、evaluator が採点した後でだけ trajectory と評価 signal を posterior evidence に変換し、次回以降に検索される harness state を更新する。model、tools、base context、domain rule は固定し、変化させる対象を episodic memory と state graph に限定する二時間尺度の設計である。

更新は固定の domain-level Evolution-SOP に従う。完了 trajectory から task 目的、確認済み事実、成否、決定的な失敗または復帰点を抜き、再利用可能な episode abstraction に圧縮する。episodic memory は「どの条件で、どんな失敗が起き、何をすれば復帰できるか」を保存し、state graph は「どの状態で、どの action または遷移が欠けていたか」を repair edge として保存する。候補は schema、scope、evidence、固定 policy・tool 前提との整合、既存項目との merge の5ゲートを通過した場合だけ commit される。採点前に新知識が混入しない score-before-update も徹底される。

評価は τ²-Bench の3 domain と MultiWOZ-2.4 の5 domain、計8環境で Pass@1 を測る。GPT-5.2 medium、同じ tool interface、evaluator、retry budget の下で、最強の interactive baseline より平均 Pass@1 が各10.07、9.91ポイント向上した。Evolution-SOP を外すと τ²-Bench 平均は83.09から73.38へ、memory を外すと77.34へ、state graph を外すと79.50へ低下した。GPT-5.2 で作った state を凍結し、4種の別 model が検索だけで再利用した場合も全報告 domain で改善した。model 自体を更新せず、評価済み失敗を条件付き手順へ変換して episode 間に蓄積するのが結論である。

■ 内容分析
中核は memory の量ではなく、失敗記述を「実行可能な差分」に変える表現と commit 境界にある。論文の例では、通信契約終了による terminal suspension を検出した agent が「human operator に引き継ぐべき」と言語化できても、必要な transfer tool を呼ばず3回失敗する。通常の reflection は助言を繰り返すだけだが、Living-Harness は applicability を「contract-end suspension が確認済みの場合」に絞り、missing step を tool 未実行、recovery action を tool call、graph edge を `confirm_terminal_suspension → transfer_to_human_agents()` として保存する。次 cycle ではこの state-conditioned repair が検索され、1回で成功する。曖昧な教訓を、trigger・precondition・action・postcondition を持つ手続きへ落とす点が、単なる要約 memory との差である。

episodic memory と state graph は重複ではない。前者は失敗理由と適用条件を検索する事例層、後者は actor の操作順を変える制御層である。片方を外す ablation が双方悪化したことは、この分担を支持する。Evolution-SOP 除去の低下が最大なのは、容器だけでは足りず、domain 固有の順序、不可逆 action 前の確認、task family 境界を update 時に適用する必要があることを示す。自己進化の性能は、自由な自己書換えではなく、書込み範囲を狭く定めた固定 protocol に依存する。

ただし単調な自己改善ではない。cycle 別では Restaurant が43.47から41.65へ、Airline が88.00から86.00へ落ちる局面がある。論文も full rollback、stale entry 除去、既解決 task の regression test を未実装と認める。graph は数百から千超の edge へ増え、検索は top-k=3なので、誤 repair の残留、条件衝突、検索漏れが問題になる。benchmark は有限 tool と明確な evaluator を持つ simulator で、未知 policy change や自由度の高い実環境は未検証である。cross-model transfer も同じ domain schema 内の結果で、未知 domain への zero-shot SOP 移植ではない。

■ 自分達の環境への適用
最も直接的な適用先は headless playtest harness である。反復失敗を、`task_family` は移動・戦闘・回避・UI操作、`trigger` は観測 state、`failure_pattern` は停止・振動・入力欠落・誤遷移、`recovery_action` は次回の action、`postcondition` は復帰判定、`evidence` は replay ID・frame 区間・metric 差分として正規化する。memory に失敗状況、graph に復帰操作列を置けば、崖際で左右入力を反転し続ける失敗を、edge-contact と速度低下を trigger にした後退・向き直し・再加速の sequence として再利用できる。

導入時は game 本体、actor prompt、評価 harness を同時に変えない。tools・base rule・build を固定し、旧 state で episode を採点した後だけ candidate repair を作る。commit 条件は schema 妥当、replay で再現、scope が task family 以下、game rule と非衝突、既存 repair と非重複とする。論文にない安全装置として provenance、導入前 score、期限、反証 count を持たせ、最初は検索結果を actor に渡さない shadow retrieval にする。採用後は固定 regression set を回し、既に解けた場面の悪化が閾値を超えたら rollback する。

記憶システムには、raw log → episode abstraction → candidate atom → governed atom の昇格経路として部分適用できる。evaluator signal、出典、scope が揃った candidate だけを merge gate に送り、似た atom は増殖させず support を加算する。graph は作業状態と次の検証 action に限定し、一般知識全体を巨大 graph にしない。記事の教訓を即時に恒久 rule 化せず、小さな probe と失敗証拠から昇格する現方針とも整合する。

小さな検証は、過去の headless 失敗20件を5つの task family に分け、10件から repair を抽出し、残り10件で retrieval する形がよい。比較条件は、無記憶、自由文 reflection、episodic memory のみ、memory＋repair graph の4群。主指標は初回成功率、同型失敗の再発率、旧成功 task の回帰率、誤 repair 検索率、state 増加量、1 episode 当たりの追加 cost とする。2 cycle 連続で再発率が下がり、回帰率と誤検索率が上限内の場合だけ運用へ進める。

■ メリット・デメリット
メリットは、失敗を全文ログや抽象的反省のまま保存せず、適用条件付きの復帰手順へ変換できること、model や game code を毎回変更せず harness 側で改善を試せること、score-before-update により自己採点への情報漏洩を避けられること、凍結 state の retrieval-only transfer により actor 交換時にも手続き資産を再利用できることである。5ゲートと固定 rule 優先は、自己更新の自由度を意図的に下げる安全設計として有用だ。

デメリットは、evaluator の誤判定や狭すぎる repair が永続化すること、graph と memory が増え続けて検索衝突や陳腐化を招くこと、domain SOP を手作業で設計する費用、post-episode の抽出・正規化・検索・commit cost、trajectory に含まれる機微情報の保持である。論文の実装だけでは rollback、stale 除去、回帰試験が不足し、cycle 改善も非単調である。したがって「自動で学び続ける仕組み」として無監督導入するのは危険で、versioned state、期限、反証、shadow test、回帰 gate を追加して初めて運用候補になる。

■ 判定
部分採用。headless playtest と記憶昇格に、episode 後更新、二層表現、5ゲート、score-before-update を取り入れる価値は高い。一方、永続 state の自動 commit は保留し、まず過去 replay を使う4群比較と rollback 可能な shadow 運用で、再発低下と既存成功の非劣化を確認する。

■ URL
https://arxiv.org/abs/2607.26598
