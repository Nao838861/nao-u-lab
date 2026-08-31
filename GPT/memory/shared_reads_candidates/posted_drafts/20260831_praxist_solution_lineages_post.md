■ 概要
Praxist は、自律 R&D agent の成果を「最も点の高い最終 artifact」だけで扱うと、どの変更が改善を生み、その根拠が後続の検証に耐え、別の知見と再結合できるかが失われる、という問題を扱う。長期 campaign の状態を score 順の artifact 集合や生の transcript として持つのではなく、Artifact → Finding → Frontier → Agenda → Lineage という変換を世代ごとに行い、評価済みの経験を役割付き evidence として継承するのが中核である。

各世代の前には Deep Innovation Gate（DIG）が、試す mechanism、変更箇所、親 lineage、支持・反証となる evidence signature、validation / ablation hook、同時に変えてはいけない条件を design contract として固定する。Quantified Diversity（QD）は cohort を mechanism family × intervention surface × intent の異なる cell に配り、全員が現在の首位案へ集中するのを防ぐ。各 peer は再実行可能な artifact を作り、自己採点ではなく task 固有の外部 evaluator にかける。結果は positive / negative / diagnostic / uncertain / procedural の finding と、reuse / validate / avoid / diagnose / preserve / archive の次行動へ変換される。さらに confirmed / candidate / diagnostic / validation の frontier、次世代の continue / stop / validate / explore agenda、長期知見を圧縮する Gems を作る。重要なのは高 score と evidence maturity を分離し、予備評価だけの好成績が完全評価済み artifact を押し流さない設計である。

75 件の MLE-bench では Praxist が 60 medal（80.0%、gold 49）、Claude Code baseline が 55 medal（73.3%、gold 34）。記録された model spend は約 3,054 米ドル対 38,370 米ドルだった。4 件の case study では、rocket landing の固定 protocol、walk-forward quantitative trading、LiDAR-inertial-visual SLAM、tokamak magnetic control に同じ系譜化を適用し、改善だけでなく survival と precision の trade-off、timestamp confound、固定 bank への適応といった境界も lineage に残す。論文の結論は、長期研究では score そのものより、検証段階と由来を持つ evidence を選択的に継承すべき、というものだ。

■ 内容分析
最も使える着想は graph の採用そのものではなく、「次の試行へ渡してよい知見」を型で制限した点にある。artifact と数値だけでは、改善が意図した mechanism によるのか、偶然混ざった変更によるのか分からない。DIG が実装前に介入面と禁止変更を固定し、後段の finding が attempted intervention・outcome・evidence・maturity・inheritance action を持つことで、仮説と結果の対応を監査できる。失敗も diagnostic evidence として残すため、同じ無効条件を世代ごとに再発見する無駄を減らせる。local な artifact 構築と cohort 全体の synthesis を分けた点も重要で、個々の worker が全履歴を読むのではなく、世代境界で evidence を昇格・圧縮して context を制御している。

ただし MLE-bench の数字は「Praxist の lineage 機構だけの因果効果」を示さない。Praxist は deepseek-v4-pro、baseline は Claude Opus 4.8 で、同じ H100 pool と task cap を使っていても基盤 model、agent harness、価格体系が異なる。両 arm は各 task 一回の campaign で seed 平均でもない。70 件の双方 score 済み task では raw score 勝敗が baseline 36、Praxist 33、tie 1 で、優位は主に leaderboard threshold を越えた medal grade に現れる。約 12 分の 1 という model spend も、token 単価と cache-hit 価格の差を含み、系譜化による探索効率だけへ帰属できない。architecture ablation が主要 75 task 比較にないため、DIG、QD、frontier、Gems のどれが寄与したかも未分離である。

case study は mechanism と限界が詳しい一方、標準化された cross-system comparison ではない。rocket の bank は campaign 中に反復利用された固定分布で selection overfitting が残り、実機信頼性を意味しない。SLAM の 72.4% は visual path の処理時間削減であり end-to-end latency ではなく、pose timestamp の規約差もある。fusion は survival を伸ばしても full-horizon precision では一方向に勝たない。これらを隠さず evidence の境界として記録していること自体が、本手法の価値を最もよく示している。

■ 自分達の環境への適用
全面的な evidence graph を先に作るのではなく、playable diff 単位の小さな lineage ledger として導入する。各 build receipt に、親 commit / build、今回だけ変える mechanism、intervention surface、禁止する同時変更、期待する観測、headless evaluator の生値、画面・操作を含む人間確認、evidence stage、finding type、次行動を持たせる。たとえば敵 spawn 制御を変える試作なら、勝率だけでなく「序盤の圧迫を増やす」という仮説、変更した parameter、固定 seed と変動 seed の結果、破綻した敵構成、次に validate すべき条件を同じ receipt に結ぶ。

frontier は四つの軽量 lane で十分である。confirmed は複数 seed と playable review を通過、candidate は単一条件の改善、diagnostic は crash・停滞・不正な抜け道、validation は高 score だが動的条件や人間確認が不足したもの、とする。Phase 2 は finding を抽出し、Phase 3b は一つの probe へ落とし、Phase 4a は再利用可能性と期限切れを整理する。これにより memory atom は感想ではなく、artifact と evaluator evidence に辿れる claim になる。

最初の検証は 3 世代 × 各 3～4 build 程度に限定する。通常ログ方式と比べ、同じ失敗条件の再発数、過去 mechanism を再利用できた回数、candidate が confirmed になるまでの評価回数、記録に要した時間を測る。改善 score だけでなく lineage 記録コストを併記し、再利用が生まれないなら schema を縮小する。PI / Chair の役名や大規模 multi-agent 編成を移植せず、世代境界で一度だけ synthesis する運用から始める。

■ メリット・デメリット
メリットは、成功理由と失敗条件を build から切り離さず、後続試作が検証済み mechanism を選んで継承できること、予備的な高 score と成熟した evidence を区別できること、探索の多様性を design contract で意図的に確保できることにある。最終成果と同時に「なぜ信用できるか」を渡せるため、headless 評価と制作記憶の接続にも向く。

デメリットは、細かい graph と role をそのまま導入すると記録・synthesis が制作速度を上回ること、evaluator の誤判定を confirmed として継承すると誤りが長寿命化すること、型を埋める作業が事後的な物語づくりになる危険があることだ。また論文の cost と medal 差は system component の ablation ではないため、同等の改善を期待して組織構造まで模倣する根拠にはならない。

■ 判定
部分採用。採るのは typed finding、evidence maturity、親 artifact、validation hook を結ぶ最小 ledger と、世代境界の synthesis である。大規模 role 編成、全履歴 graph、論文既定の lane 数は採らない。3 世代の probe で再発失敗と検証待ちを実際に減らせるか測り、記録コストを含めて残す範囲を決める。

■ URL
https://arxiv.org/abs/2608.25955
