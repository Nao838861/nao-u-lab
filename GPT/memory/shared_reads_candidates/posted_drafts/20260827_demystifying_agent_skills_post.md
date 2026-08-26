■ 概要
「Demystifying Agent Skills」は、LLM agent に SKILL.md のような手順 package を与えると成功率が上がる、という集約値の一歩手前へ戻り、「何が効いたのか」「どこで壊れるのか」を matched execution で分解した研究である。中心仮説は、skill の主作用は不足知識の注入ではなく、環境設定、tool 順序、中間確認、失敗回避を安定させる procedural anchor だというものだ。

研究は四つの操作を分ける。同じ trajectory 群を Workflow Memory と標準化した SKILL.md に変換して表現だけを比較し、作成時に成否 label を見せる / 隠す ablation、別 harness への transfer、正解 skill と distractor を混ぜた pool を5〜100件へ増やす retrieval 実験を行う。retrieval は embedding、実行なしの agent 選択、全 pool での実 execution を独立に測り、offline の結果を execution へ流していない。

三 benchmark で8,135 trial record を正規化し、240 trajectory の open coding から有効な238 label、3 category・12 mode の taxonomy を作った。人手による714 check は全 label の根拠を確認し、再割当は95.8%一致、Cohen's κ=0.952。主分析は同じ task・条件の Raw / Workflow / Skill をそろえた528 triple、計1,584 arm である。

結果は Skill の成功率61.9%、Raw 59.1%、Workflow 55.9%。同じ source experience を使う Skill 対 Workflow の差は +6.06 points、95% bootstrap CI は +0.76〜+11.36。skill の作用 label は procedural anchor が65.7%、knowledge injection は4.5%だった。環境・基盤 failure は Raw 5.3%から Skill 0.2%、output schema mismatch は7.4%から3.2%、background service failure は2.7%から0.8%へ減る。一方、algorithmic logic error は8.3%から7.4%、runtime を伴わない static verification は12.5%から11.7%に留まり、深い再定式化や oracle 整合の弱さは残った。

retrieval では、actual-use precision が pool 5件から100件で29.6%→3.3%へ崩れたが、task success は36.4%→39.3%でほぼ維持された。offline embedding は88.3%→76.9%、agent 選択は70.0%→63.7%で、類似 distractor が特に難しい。正解 skill の厳密な使用は成功の必要条件でも十分条件でもなく、取得・適応・実行を分けて測る必要がある。

■ 内容分析
強い点は、skill と「過去を見せた効果」を混同しない設計にある。Workflow と Skill は同じ trajectory を材料にし、5成功0失敗から0成功5失敗まで source 構成を固定予算で変える。その上で short plan 47.7%、test-first template 59.2%、Workflow 62.3%、Skill 79.2%という26 task・130 trial の軽量 baseline も置き、単に短い手順文を足しただけでは説明しにくい差を示した。83 task の matched token 分析では、Skill は Raw より成功率 +5.5 points かつ総 token 約34.2K減だが、Workflow より +4.8 points と引き換えに約95.3K多い。Skill は最安ではなく、効果と context cost の交換条件である。

失敗の形も重要である。Skill arm では guidance の misapply / ignore が10.0%あり、Raw 0.8%、Workflow 0.4%より大きい。Workflow は逆に timeout / budget exhaustion が10.6%で、Raw 1.7%、Skill 4.4%より悪い。raw trace に近い記憶は探索残骸で時間を失い、蒸留 skill は軽くなる代わりに、過度な一般化や条件外適用を生む。これは「手順を増やせば安定する」ではなく、抽象化・適用条件・中止条件を一体で設計せよ、という結果である。

成否 label の ablation も重要だ。失敗が混ざると label ありの作成が概ね強く、ある3成功2失敗条件では0.7462対0.4000だった。失敗 trace は模倣対象にもなり得るため、観測事実と outcome provenance を一緒に残す必要がある。

ただし open coding は全 record の約3%で、rare mode を落とし得る。対象も terminal / tool-use と少数の model-harness に限られ、open-ended design や visual quality は測っていない。後半の Codex model は前半と異なり、actual-use も trajectory からの parse で、因果的利用そのものではない。

■ 自分達の環境への適用
ゲーム制作では、skill を知識記事ではなく「再発する実行 fragility を固定する手順」に限定する。候補は build 起動、asset import、headless smoke test、screenshot 採取、seed 固定、終了条件の確認、Slack 投稿 lifecycle のように、順番と検証点が成功を左右する処理である。面白さの発見、mechanic の再定式化、画面の良し悪しは skill の主判定にせず、playable diff、visual review、human feedback の oracle を別に置く。

各 skill には engine / repository / artifact version、適用外条件、中間観測、停止条件、最終 verifier を持たせる。失敗 trace には exit code、test result、artifact hash と outcome label を残す。別 prototype では transfer を仮定せず、path、tool、state schema を変えた smoke test を先に行う。

probe は頻出作業20件ほどで Raw、現行 memory、Skill の paired run を各3回行う。成功に加え environment failure、runtime verification 欠落、timeout、misapplication、token、時間を記録する。pool は5・20・50件で類似 skill を混ぜ、取得と最終成功を分けて測る。精度が崩れるなら、domain 分割と候補の事前絞り込みを優先する。

採用 gate は、Raw より実行層 failure が減り、runtime verifier 率を落とさず、misapplication と context cost が許容範囲であること。成功率だけ上がっても static check で終える比率が増えた skill は不採用にする。skill 自体の version、作成元 trace、outcome、対象 engine を記録し、原因不明の成功例を恒久手順へ昇格させない。

■ メリット・デメリット
メリットは、過去 trace の探索ノイズを、再利用可能な順序・checklist・verification へ圧縮できること、環境設定や output 制約の再発 failure を下げられること、同じ experience を別表現で比較する評価設計が明確なことだ。skill 数、類似度、取得、実利用、最終成功を別 metric にした点も、現在の skill pool 改善へ直接使える。

デメリットは、skill が新しい failure surface になること、正しい取得だけでは実行成功を保証しないこと、pool 増大時に actual-use precision が急落することだ。logic、visual quality、runtime oracle の弱さは手順書だけでは直らない。benchmark の task 分布、model、harness、skill creator prompt に依存し、論文値をそのまま我々の改善率として扱えない。

■ 判定
部分採用。build・headless・artifact・投稿 lifecycle のような反復的で verifier を持つ処理に procedural anchor を導入し、creative judgment には広げない。少数 pool の paired probe から始め、misapplication、runtime verification、cost を成功率と同時に測り、増やすより先に不要 skill の整理と適用条件の明示を行う。

■ URL
https://arxiv.org/abs/2608.14036v1
