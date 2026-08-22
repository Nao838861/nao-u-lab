■ 概要
PMCoder は、LLM coding agent が実 repository の issue を直す際、探索、原因仮説、実装、検証を数十〜数百 step 維持できず、正しい診断を失う、同じ失敗 edit を繰り返す、実行確認なしに完了を宣言する問題を扱う。着想は planning と memory を独立に足すのでなく、互いの制御信号にすることだ。repair phase と sub-task が recall を決め、memory が集計した edit、read、反復 action、失敗 return が stuck detection と replanning を動かす。検証可能なら reproduction の pass / fail を plan state に戻し、自己申告では verification を閉じない。

planner は EXPLORATION、HYPOTHESIS、IMPLEMENTATION、VERIFICATION と BACKTRACK を持つ。開始時だけ LLM が issue を sub-task に分解し、以後の phase 判定、hysteresis、完了判定は deterministic に動く。episodic memory は各 message を role、recency、要約、編集 file 付き node として保存する。task、recent tail、active sub-task の anchor を固定し、残りを lexical score と code graph proximity を混ぜた MMR で token budget 内に選ぶ。探索時は広く、実装時は edit site 周辺を狭く取る。

plan と memory は履歴を並べ替えず、最新 tool result に marker 付き block として追記する。tool call / result の対応を壊さず、model が普段読む channel に state を載せる設計である。Python edit 後は compile check、validated reproduction があれば最大四回の再実行を行う。signal は advisory で強制 revert はせず、最終成否は official harness だけが決める。

SWE-bench Verified 500件を Qwen3-Coder-30B で三回ずつ評価し、harness、model、250 turn budget、tool を揃えた baseline は平均142.3件、PMCoder は167.3件を解決した。差は25件、5.0 percentage point、instance cluster bootstrap の95% CI は +14.3〜+35.7、p<0.001。失敗 action の再発率は0.0137から0.0069、空または no-op patch 終了は8.3%から2.7%、context exhaustion は6.7%から3.0%へ低下し、revert-then-refix は2.89から4.23へ増えた。

ablation は baseline 142.3、plan-only 148.7、memory-only 150.7、両方167.3で、単純加算期待より10.3件上振れした（F(1,8)=10.92、p=0.011）。別 model と OpenHands port でも +14〜23件だが single run である。結論は、双方向 state は長い episode の状態喪失を減らす一方、base model の能力を越えるものではない、という限定的なものだ。

■ 内容分析
本質は recall 精度単体でなく、trajectory の制御 loop を閉じた点にある。phase→retrieval は探索の広い過去と実装の局所 evidence を分け、memory→plan は蓄積した observation を「方針を捨てるか」の入力にし、verdict→plan は検証結果で次の retrieval と completion を変える。この接続が ablation の正の interaction を説明する。

django-13516 では両 agent が TextIOBase の no-op flush() が OutputWrapper の delegation を遮ると診断した。baseline は後に誤った自己制約へ drift し、call site を編集して失敗する。PMCoder も一度 base.py を壊すが、edit-integrity churn が clean base への recovery を促し、implementation phase の recall が診断を再浮上させ、正しい flush() delegation を入れ直す。新しい推論より、得た推論を失敗後も保持した差である。

reproduction がない315件でも94件から106件へ改善し、substrate 単体の効果が残る。script がある185件では45件から64件と差が大きい。post-edit verdict は解決 trajectory の18/20で pass、未解決では5/18だけだった。script は同じ Qwen が issue text から生成し、元 repository で失敗するものだけ採用する。誤 script は内部制御を歪め得るが、official score を直接水増しできない。

改善は人間修正時間1時間以内に集中し、1時間超45件では baseline 0件、PMCoder 2件に留まる。test pass は maintainer intent と同一でなく、patch overfitting も残る。headline は一つの open-weight model と Python 中心の benchmark で、他言語や game runtime は未検証。execution grounding と edit-integrity recovery の寄与も別々には推定していない。

■ 自分達の環境への適用
適用先はゲーム内容の自動評価より、複数 phase にまたがる制作と不具合修正の harness である。staging、対象 build hash、playable diff、失敗 command を一つの episode state として結ぶ。探索時は設計意図、関連 atom、類似不具合を広く recall し、実装時は変更 file、直前 test、同じ system の dependency を狭く取る。semantic similarity だけでなく phase と file graph を条件にする。

stuck signal は、同じ command、同じ file の連続 edit、確認だけが続き diff が出ない状態、同一 test failure の再発から始める。threshold 超過時は強制 rollback せず、clean commit との差分確認、失敗仮説、別の最小 probe、revert-then-refix 候補を tool result に提示する。「playable diff を実行証拠にする」運用と相性がよい。

verification は一つの pass に集約しない。code test、headless trace、render artifact、人間 playtest を別 verdict とし、閉じられる sub-task を対応付ける。「直った」という記述は証拠に数えず、command、exit code、artifact、seed、build hash を残す。game feel は技術的成立と分離して pending にする。

probe は一件で baseline と phase-coupled recall を比較する。同一失敗 action、空 diff、context exhaustion、誤完了、revert 後の回復、追加 token を測る。全文 transcript は graph 化せず、command、file、test、artifact と recent tail に限定する。二、三件で回復が増えず noise だけ増えるなら撤退する。

■ メリット・デメリット
メリットは、長期作業で「一度分かったこと」を失いにくくし、失敗反復を再計画へ変え、自己申告完了を実行証拠へ置換できることだ。per-step planner は LLM call 不要で、memory も lexical と graph の計算なので、全 step を別 agent に再評価させる方式より費用を抑えられる。tool result への追記は既存履歴を破壊せず、監査もしやすい。

デメリットは、phase detector と stuck threshold が誤ると、有効な反復まで迷走扱いすることだ。16k前後の memory block は我々の小さな prototype には重く、古い observation の再注入がかえって注意を散らす。reproduction script や headless test が仕様を狭く誤表現すると、その pass に最適化して体験品質を壊し得る。memory metadata、graph、artifact provenance の更新コストも増えるため、全 task へ常設する根拠はまだない。

■ 判定
部分採用。phase-conditioned recall、失敗反復の deterministic 集計、実行証拠で sub-task を閉じる三点を、長い実装・修正 episode の限定 probe として導入する。PMCoder の大きな memory budget や固定 threshold は移植せず、既存 staging と test artifact から最小 event state を作る。技術的完了とゲーム体験の良さは別 oracle のまま保ち、再発率と誤完了が実測で下がった場合だけ範囲を広げる。

■ URL
https://arxiv.org/abs/2608.06811
