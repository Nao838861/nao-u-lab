■ 概要
Harness-IF は、coding agent が最終的に課題を解けたかではなく、長い実行中に「どの指示を、どの配置面から受け取り、守ったか」を rule 単位で測る benchmark である。従来評価には、成果物は動くが要求された確認を省いた、指示がなくても普段から行う動作を遵守と数えた、という見落としがある。

指示面は Harness Default、System Prompt、Tool Description、Skill Description、Project File（CLAUDE.md / AGENTS.md など）、User Instruction の6種。Default は固定し、残る5つを配置対象にする。公開文書などから7 family、642個の atomic rule を作り、pass / fail / not applicable に判定できる粒度へ正規化した。main coding panel は60件の realistic multi-turn item に302 rule を配置し、評価機会が生じた256 ruleへ verdict を付ける。

評価は12 model build×60 item×3 round＝2,160 run。最終回答だけでなく trace、diff、test、artifact、command output、log を証拠にし、40,104 rule-level rowを生成した。no-opportunity 等を除いた二値評価は37,616 verdict。deterministic check は13.3%、残りは GPT-5.2 judge の3票多数決や hybrid 判定である。

中核指標 Against-Prior Accuracy（AP-Acc）は、rule を注入しない zero-injection run で既定傾向を観測し、それに反する rule だけを集計する。通常 Accuracy は72.1〜85.9%、AP-Acc は66.1〜78.6%。全12 buildで3.6〜7.4 point低く、平均差は5.81 pointだった。全 model に clean verdict がある common-support 2,430件でも差の95% interval は全 buildで正だった。通常 score は「従った結果」と「元々する動作」を混ぜ、遵守を過大評価する。

8,440 failure の77.1%は、禁止を破る overstep でなく、要求 action を満たさない shortfall だった。ただし failure rate は23.8%対20.8%で大差ではない。shortfall の評価機会が27,306件、overstep が8,443件と多いため mass が偏った。family 別では output control と workflow で53.9%を占める。禁止監視だけでは、頻出する「実施 action の抜け」を取り逃す。

別の E0 conflict pilot は、同じ意味の rule を相反する surface に置いた。9つの旧 build、4 conflict pair、916 runで、平均 rank は System Prompt、Project File、User Instruction が同率2.22、Tool Description 3.78、Skill Description 4.56。ただし完全な順序を個別に再現したのは9 build中6 buildで、main panel とも別実験である。普遍的 hierarchy ではなく pooled tendency と読むべきだ。

■ 内容分析
最も使える点は、指示文を増やす処方ではなく、rule、機会、証拠、判定を分離したことにある。「playtest する」を読んだかは推測せず、実施機会と command、artifact、比較結果を判定する。機会がなければ not applicable にするため、完成物の成功と検証手順の遵守を直交して診断できる。

AP-Acc も重要である。普段から git status を見る agent に同じ指示をしても、その surface が効いた証拠にはならない。rule を外した対照 run と比べて初めて行動変化が分かる。これは学習由来の推定でなく、観測 default による層別化であり、安全規則には適用しない。

細かな順位は重視できない。86.8%の row が LLM judge を含み、別 judge に替えた paired clean 116件の一致率は62.1%、κは0.163。round 間の cell 平均 range も15.6 pointで、leaderboard 幅13.7 pointより大きい。80候補から識別力を見て60 itemを選んだ selection optimism もある。信頼すべきは隣接順位より、全 buildで再現した prior gap と failure pattern である。

surface 結果にも境界がある。main panel は適切な場所へ rule を割り当てた descriptive stratification で、controlled relocation は小規模な E0 だけである。「skill は弱いから project file に全部移す」とは言えず、権限、発火条件、可視性に合う表現と証拠が要る。

■ 自分達の環境への適用
適用先は、ゲームの面白さそのものを自動採点する層ではなく、制作 cycle で要求した action が抜けていないかを監査する層である。たとえば「変更前に対象 build を固定する」「headless test を実行する」「代表 frame を比較する」「playtest の原文を保存する」「candidate 投稿前に重複照合する」を atomic rule にする。各 rule には applicability、許容 surface、pass evidence、fail evidence を一つずつ付ける。成果物の品質 score と compliance score は混ぜない。

最初の probe は欠落時の損害が大きい5〜8 actionに絞る。同種の小変更 task で、AGENTS.md、skill、user instruction のいずれかに同じ rule を配置する。command、test、artifact、before/after comparison を残し、deterministic checker を先に使う。N/A率、shortfall率、task success、証拠欠損率を同じ task family 内で比較する。

zero-injection は本番 task を二重実行せず、再現可能な fixture だけで matched pair を作る。default が既に満たす rule の遵守率を成果と誤認せず、「実装完了後も visual comparison を省かない」のような against-prior action に集中する。安全、秘密情報、破壊的操作の rule は外さない。

判定器は deterministic evidence を優先し、LLM は自由記述の playtest note や比較理由の補助判定に限定する。LLM verdict には evidence span と confidence を残し、judge を変えた小標本で disagreement を測る。fail が出た時も即座に指示を増やさず、①実施機会がなかった、②rule が曖昧、③surface から取得できなかった、④取得したが action を省いた、⑤実行したが証拠を残さなかった、へ分ける。これならルール肥大化ではなく、配置、表現、計装、workflow のどこを直すべきか選べる。

■ メリット・デメリット
メリットは、完成物だけでは隠れる process defect、とくに playtest・比較・保存の shortfall を見つけられること、rule の配置元と実行証拠を結び付けられること、default との偶然一致を AP-Acc で除けることにある。atomic verdict は、長い感想より回帰比較しやすく、重要 action のみなら小規模に始められる。

デメリットは、rule の atom 化、opportunity 判定、証拠計装に手間がかかり、測りやすい行動へ制作が偏ることだ。artifact が無いだけで、未実行と記録漏れを誤認する危険もある。LLM judge 依存では絶対値が判定器固有になり、surface pilot の順位も現在の agent 全般へ外挿できない。遵守率を目的化すると、面白さや発見のための探索を狭める。

■ 判定
部分採用。重要な制作 action 5〜8件を、task success と分離した evidence-based verdict で監査し、再現可能な fixture にだけ zero-injection を入れる。surface の全面順位付けや全 rule の常時計測は採用しない。shortfall の分類が実際の抜けを説明し、deterministic evidence で再現できた項目だけを継続運用へ昇格する。

■ URL
https://arxiv.org/abs/2608.11727v1
