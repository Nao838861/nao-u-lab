■ 概要
対象は “Do Agent Optimizers Compound? A Continual-Learning Evaluation on Terminal-Bench 2.0”。agent harness の改善を一度きりの benchmark score で評価すると、次の失敗や新しい課題が来た時にも改善を維持できるか分からない、という問題を扱う。著者らは「最適化を繰り返した時に利得が累積する」条件を、静的性能、未知課題への転移、再最適化後の保持と追加改善に分解した。

評価は Terminal-Bench 2.0 の hard task で二段階に構成される。Phase 1 は timeout 900秒の12 taskを使い、共通の GPT-5.5 terminal agent を各手法が200 rolloutで最適化する。続いて、まだ最適化に使っていない timeout 1800秒の10 taskを加え、Phase 1 agentを22 task上でそのまま評価する。Phase 2では各手法が自分の Phase 1 agentから始め、12+10 taskを対象にさらに200 rolloutを使う。各taskは2試行で、Phase 1 pass rate、追加task導入直後のTransfer、Phase 2後のFinal、その3値の単純平均Lifelong Avg.を報告する。

比較対象は三つある。GEPAはrollout traceへの言語的reflectionでsystem promptを進化させる。Meta Harnessはcoding agentがharness codeを直接編集し、現task setのscoreで候補を採否する。RELAI-VCLはprompt、tool、workflow、memory、skill、codeを探索対象にしつつ、以前解けたtaskを壊す候補をsearch loop内で棄却する。全手法は同じbaseline、基盤model、各phase 200 rolloutだが、探索空間と回帰制御の有無は同一ではない。

静的なPhase 1では全手法がbaseline 62.5%を上回り、GEPA 70.8%、Meta Harness 66.6%、RELAI-VCL 79.2%だった。ところが未知taskを加えるとbaseline 56.8%に対し、GEPAは54.5%へ落ち、Meta Harnessは68.2%、RELAI-VCLは72.7%だった。再最適化後はGEPA 72.7%、Meta Harness 59.1%、RELAI-VCL 77.3%。Lifelong Avg.は順に66.0%、64.6%、76.4%で、baselineは58.7%だった。RELAI-VCLだけが未知taskへの正の転移と、そのtaskを目的へ加えた後の追加改善を両立した。

■ 内容分析
重要なのは、GEPAとMeta Harnessが異なる方向に失敗した点である。GEPAのpromptは5行からPhase 1で103行、Phase 2で195行へ増え、task ID、正確なfile path、literal error、verifierが期待する出力を含むtask別lessonを蓄えた。見たtaskには効くが、未見taskを含む分布では未最適化baselineを下回る。Phase 2のtaskを直接目的に入れれば72.7%まで戻るため、「再最適化できる」ことと「改善が一般化して累積する」ことは別である。

Meta HarnessのPhase 1変更は、command完了markerのcollision対策やmalformed tool callの型防御という汎用的なI/O境界強化だった。その保守的な変更は未知taskへよく転移した。一方、Phase 2で採択された長いterminal outputの圧縮は、候補生成中の全案が既存agentより悪く、Finalは68.2%から59.1%へ低下した。つまり汎用的に見えるcode diffでも、既存能力を保持したまま次の改善を積めるとは限らない。

RELAI-VCLの採択変更は、code-editingとoperation/service taskを分ける分類、終了前のverifier探索とruntime contract確認、session loss回復、fatal errorや絶対workspace pathの検査だった。task固有literalではなく失敗の共通境界を修正している。過去に通ったtaskを壊す候補を探索中に落とす制約は、forgetting防止だけでなく、局所shortcutより小さく一般的な修正を選ばせるfilterとして働いた可能性がある。ただし論文自身も、これは観測結果と整合する解釈であって一般則ではないとしている。

数値の読み方にも注意が要る。taskは22件、各agent・各task 2試行だけで、confidence interval、optimizer runの複数seed、分散、統計検定は報告されない。Lifelong Avg.は異なるtask数のstageを単純平均し、baselineでは同じ56.8%をTransferとFinalへ二度入れるため、単独KPIより三成分の軌跡を見るべきである。またRELAI-VCLの開発元によるtechnical reportで、比較手法と探索空間も完全一致しない。結果は回帰制御の有望な証拠であり、優位性の独立した確証ではない。

■ 自分達の環境への適用
我々のplayable diffサイクルには、二段階protocolを小さく移植できる。各変更候補に対し、直近directiveから作る「新規改善集合」と、過去cycleで通った「保持集合」を分ける。新規集合だけのscoreが上がっても採択せず、保持集合のhard failureが0件で、headless check、起動、主要操作、終了条件、変更範囲が維持された候補だけを次cycleのbaselineにする。回帰確認を完成後の監査ではなく、候補採択の内側へ置くのが中核である。

最初のprobeは過去6～10件のplayable diffでよい。A0を現行版、A1を一つの改善後、A2を次のdirective反映後とし、各stageで新規pass率、保持pass率、hard regression数、再修正回数、wall timeを記録する。平均scoreだけでなく、A1で解けてA2で壊れたcaseを必ず列挙する。操作感のように自動判定できない項目は、入力trace、動画、frame capture、短い人手rubricを固定し、verifierの無い品質を「通ったこと」にしない。

memoryやrulesの更新にも同じ考えを使える。新atomや新directiveが直近taskを助けても、過去の代表recall、矛盾検出、source provenance、pending lifecycleを壊すなら採択しない。ただし全履歴を毎回再実行すると重いので、保持集合は「壊れると致命的なanchor」「直近の既知失敗」「分布の異なる代表case」に層別し、fast gateと定期full replayを分ける。新しい失敗を見つけるたびにtask固有の長文instructionを足すのではなく、終了判定、path境界、artifact検証など再利用できるfailure boundaryへ圧縮する。

■ メリット・デメリット
メリットは、一回の成功率上昇を永続的能力と誤認せず、転移と再改善を別々に監査できること、既存能力を壊す候補を早く棄却できること、instruction肥大化やbenchmark暗記を具体的な回帰として検出できることだ。特にgame prototypeでは、直近の見栄えを良くする変更が入力応答、restart、他level、headless実行を壊すため、候補選択内の回帰gateは相性がよい。

デメリットは、保持集合の実行費用がcycleごとに増え、既存passを絶対条件にすると有益な大改修や仕様変更を拒みやすいことだ。verifier自体が偏っていれば、その偏りを守る方向に最適化される。過去taskと新taskが強く相関するgame制作では、論文の疎に関連したTerminal-Benchよりshortcutが起きやすい。2試行のpass率をそのまま品質保証へ使うこともできない。

対策は、hard invariantとsoft metricを分けること、仕様変更で意図的に壊す項目には明示的なmigrationを付けること、回帰集合にも未公開holdoutと人手評価を残すことだ。回帰0件だけを目標にせず、新規改善、保持、費用のParetoで候補を選ぶ。

■ 判定
部分採用。RELAI-VCLそのものや76.4%という値は採用根拠にせず、「新規課題への改善」と「過去能力の保持」を候補採択loop内で同時に評価するprotocolを採る。まずplayable diffの小規模replayでhard regression数を記録し、instruction追加ではなく共通failure boundaryを直す運用が本当に次taskへ転移するか検証する。

■ URL
https://arxiv.org/abs/2607.14004
https://github.com/relai-ai/Continual-Learning-Terminal-Bench
