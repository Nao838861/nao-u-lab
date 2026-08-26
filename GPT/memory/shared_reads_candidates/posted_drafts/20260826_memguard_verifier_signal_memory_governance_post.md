■ 概要
MemGuard は、LLM agent が数百の task をまたいで経験を再利用する時、関連性の高い記憶を検索するだけでは信頼性を維持できない問題を扱う。著者は故障を二つに分ける。第一は unreliable admission で、失敗 trajectory、偶然通っただけの成功、観測に裏付けられない一般化が有用そうに見えて memory へ入る。第二は memory drift で、長期運用中に重複、古い手順、互いに矛盾する記録が蓄積する。入口の filter だけでは、後から古くなった記憶や、別の証拠と衝突した記憶を直せない。

中核の着想は、verifier の出力を一回限りの合否判定で捨てず、memory record の全 lifecycle に残る metadata にすることだ。完了 trajectory を task completion、evidence consistency、execution validity、generalizability の四基準で採点し、reward、confidence、label、検証時点などを構造化 record に付ける。境界例は evidence-focused / risk-focused view で再検証する。低品質な候補は reject、低確信なら provisional、失敗経験は条件付き failure guard とし、active memory と分離する。

保存後も metadata は働く。retrieval は semantic relevance だけでなく品質、再利用実績、recency、conflict、staleness、verifier risk を考慮する。同じ task pattern・action category・tool scope・適用条件を持つ record は merge 候補にし、同じ scope で action または label が食い違えば conflict とする。active budget を超えた時や弱い記憶が古くなった時は、証拠と適用条件を保持した summary または archive へ移す。つまり memory を追記型の文章置き場ではなく、状態遷移する管理対象として扱う。

評価は Terminal-Bench 2.0、SWE-Bench Verified、WebArena、Mind2Web と、Qwen / Gemini 系四 backbone の16条件。No Memory、Synapse、AWM、ReasoningBank、verifier-only filter と、task順、step budget、retrieval budget、decoding を揃え、各条件を5 seedで比較した。MemGuard は全16条件で主要成功指標が最高、平均 action step が最少だった。最強の既存 memory baseline だった ReasoningBank に対し、WebArena は5.3～7.9 success-rate point、Mind2Web は3.5～5.6 step-success-rate point、terminal / software engineering は2.4～3.5 point改善した。2,294件の時系列 SWE-bench Full でも Resolve Rate が2.96 point上がり、後半ほど差が広がった。

■ 内容分析
重要なのは verifier の高性能化そのものではなく、判定結果を admission 後も使う因果を対照実験で切り分けた点だ。verifier-only は ReasoningBank より15/16条件で改善したが、MemGuard はさらに全16条件で成功率と step 数を上回った。Qwen-3.5-Plus の ablation では WebArena が full 58.4に対し governance 除去52.0、admission 除去52.8、semantic-only retrieval 50.1。Mind2Web も51.8に対し46.8、48.0、45.8となる。入口で良い候補を選ぶだけでなく、重複統合、衝突抑制、退役、failure guard 分離を続ける部分が主要因だと読める。

一方、verifier を信頼の正本にしてよい結果ではない。800件の著者監査で label agreement は Qwen-3.5-Plus 86%、Flash 83%。60件の false accept のうち governance が38件をactive昇格前に止めたが、22件はactiveになり、18件が後に検索され、12件が行動へ影響し、6件は downstream failure と結び付いた。lifecycle gate は誤りの伝播確率を下げるがゼロにはしない。systematic error や adversarial error には保証がなく、同系統 model の自己評価が共有する盲点も残る。

評価の読み方にも境界がある。全方式の runtime 条件は揃い、task単位 bootstrap ではFDR補正後16/16が有意だが、より厳しい Holm 補正では7/16。320の seed・metric・baseline 対応比較には11敗1分もある。固定 threshold と重みは小さな development stream で選ばれ、open-ended production より短い。大き過ぎる memory budget は marginal / conflicting record を残して精度と速度を少し悪化させる。さらに外部 memory の統治なので、base agent に欠けた推論能力や tool 能力は補えず、privacy redaction、access control、削除保証も未解決である。

■ 自分達の環境への適用
適用先は、ゲーム制作中の lesson、headless test 結果、build 修正履歴、shared-reads candidate のように、同じ情報を後の cycle で再利用する領域である。各 memory に少なくとも source artifact、build / commit、観測時刻、適用 scope、成功・失敗、証拠強度、confidence、conflict link、lifecycle state を持たせる。単に「playtestで良かった」と保存せず、実行 command、seed、スクリーンショット、終了 code、対象 build hash を証拠として結び、偶然成功と再現成功を区別する。

導入は verifier model の全面採用ではなく、小さな deterministic probe から始める。既存 atom から、古い build の成功、後に否定された操作則、重複 lesson、異なる branch では両立する記録、失敗から得た注意則を30～50件抽出する。semantic-only、保存時gateのみ、lifecycle metadata付きの三条件を比較し、正しい lesson の retrieval、stale injection、conflict誤抑制、必要 step、token、監査時間を測る。判定 signal は test pass、再現回数、artifact 有無、ユーザー feedback、source age を先に機械計算し、曖昧例だけ LLM review に送る。

検索では relevance の後に evidence と scope を掛け、古い record を削除せず active から provisional / superseded / archived へ移す。summary は元 record ID、適用条件、反証を落とさない。failure lesson は「この action を実行せよ」ではなく「この条件では現在観測を再確認せよ」という guard として別枠注入する。これなら失敗の有用性を残しつつ、古い画面状態や一度のクラッシュを普遍則にしにくい。

採用 gate は、stale / conflicting memory の誤注入を semantic-only より減らし、正しい別 scope の記憶を消さず、追加費用を回収できることとする。verifier agreement だけでなく、false accept が active化し、検索され、行動へ影響し、実害へ至る各段階を分けて計測する。この failure-path 分解が本論文から最も移植価値の高い評価法である。

■ メリット・デメリット
メリットは、保存時の品質を後の検索・統合・要約・退役まで一貫して利用できること、失敗経験を安全な guard として残せること、誤記憶の影響経路を監査できることだ。古い lesson を削除せず状態遷移で抑制するため、判断の理由と反証も保持しやすい。

デメリットは、verifier の偏りが metadata を通じて長期間伝播すること、schema・threshold・budget の校正が domain ごとに必要なこと、verification と管理用 token、storage、運用複雑性が増えることだ。誤った高confidenceは semantic similarity より危険になり得る。privacy、削除要求、base能力不足は別の仕組みで扱う必要がある。

■ 判定
部分採用。lifecycle state、証拠 provenance、conflict link、failure-path 監査を、ゲーム制作 lesson と headless 評価記憶の限定 slice へ入れる。verifier の数値を真実扱いせず、deterministic evidence と再現試験を優先し、false accept の実害率が下がることを確認してから範囲を広げる。

■ URL
https://arxiv.org/abs/2608.21867
