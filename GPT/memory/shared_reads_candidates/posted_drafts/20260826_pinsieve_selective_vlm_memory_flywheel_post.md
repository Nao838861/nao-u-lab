■ 概要
PinSieve は、大量コンテンツの品質判定で、高価な vision-language model を全件に使わず、軽量 model が決め切れない grey-zone だけへ選択的に投入する production system の事例である。狙いは万能な自律 agent ではない。online actor の出力を一つの scalar score に限定し、threshold 以下を auto-pass、以上を人手 review へ escalate する。rollback と threshold 調整を残したまま、難しい画像・文脈だけに強い判定を使う設計だ。

production の grey-zone slice では、旧 module の false negative rate 13.62%、auto-pass 20.48%に対し、PinSieve は13.18%、41.99%。非actionable item の除外量は2.05倍になった。review productivity は25.7%改善、normalized cost は16.2%低下し、signal delivery は翌日から当日になった。三週間のshadow deployment後に昇格し、このServing Agentの結果だけをonline効果としている。

導入後には selective feedback という別問題が生じる。escalateされたitemは通常labelが付くが、auto-pass側はaudit samplingされた一部しか観測できない。見えている誤りだけを再学習すると、reviewへ送られやすい領域へ偏り、未観測のblind spotを増幅し得る。そこでFeedback Memoryにmodel version、score、threshold、route、time bucket、label source、review / auditの観測経路、audit probability、score bin、replay metadataを保存する。labelだけでなく「なぜ観測できたか」を記録するのが要点である。

offlineのData Curation Agentは、representative、uncertainty、recentの三種から固定サイズのreplay batchを提案する。ただしbatchのpositive rateが自然分布から外れ過ぎず、score-bin分布のJS divergenceが基準内にある場合だけacceptする。違反時はrepresentative比率を増やし、targeted sourceを縮める。candidate modelは次の未観測月で評価し、fixed safety guardrail、shadow test、rollback gateを通らなければpromoteしない。六か月のchained monthly refreshでは、50K例ずつのDC-Replayがrepresentative random replayに対し、平均IPW-FNR@50%を17.73%から13.29%、PR-AUCを0.5310から0.5542へ改善した。

もう一つの系はteacher rationaleの統治である。Reasoning Review Agentは画像、rationale、人手labelを照合し、faithful、confabulation、forced rationalization、spurious feature focusなどをkeep / repair / dropへ写像する。sampled spot checkでは92.2%がfaithful、7.8%がlow-faithfulnessで、そのうち44.4%はannotation noiseとして除去候補、38.8%は再生成可能なgeneration errorだった。著者はこれをaccuracy gainではなくsampled governance evidenceとして分離している。

■ 内容分析
本論文の強さは、online action、offline improvement、human promotionの境界を狭くした点にある。Serving Agentは自由文を出さずscoreだけを公開する。Teacherは人手labelを書き換えられず、Reviewはpolicyを再定義できず、Curationのbatchも分布guardrailに拘束される。状態を持つworkflowでも各componentの権限を絞れる。

最も重要な実験は、難例だけを集めれば改善するという直感を否定したstress testだ。最終月のmodel-error replayはPR-AUC 0.072、FNR@50% 71.92%まで崩壊し、hybridも21.35%でrandomの15.56%より悪い。selective feedback下の「hard error」は自然分布の難しさではなく、観測経路の偏りを強く含む。representative randomが強いbaselineであり、uncertaintyやrecentを加えるなら分布制約と次window評価が必要だという結論は、一般のfeedback memoryにも効く。

同時に、数値を一つの統合成果として読んではいけない。25.7% productivity改善と16.2% cost低下はdeployed Serving Agentのproduction evidence、17.73%から13.29%はoffline replay、rationale監査はsampled governance studyである。memory flywheel全体がproduction改善を生んだとはまだ示していない。論文自身がattributionを分けている点は誠実であり、移植時にも同じ証拠台帳が必要になる。

限界は明確だ。実験は一つのbinary signalに集中し、内部詳細は抽象化されている。audit確率を記録しても、audit設計自体が見逃す領域は補正できない。追加signalへの採用はtransferの示唆であり、同じ改善の再現ではない。rationale filteringのdownstream効果も未測定で、単純な制御ではLLMがdeterministic policyを上回る保証もない。

■ 自分達の環境への適用
直接の適用先は、大量のgame screenshot、playtest trace、render QAを限られた人手で選別する経路である。第一段はexit code、image size、missing asset、OCR文字、pixel diff、frame timingのdeterministic checkで明白な成功・失敗を処理する。第二段だけVLMへ送り、layout崩れ、視認性、演出意図とのずれをscalar risk scoreにする。高riskまたは低confidenceだけ人へ送り、auto-passにも一定率のblind auditを残す。

Feedback Memoryにはbuild hash、scene、seed、check結果、VLM version、score、threshold、route、human判定、label source、audit probability、失敗categoryを保存する。人が見た画像だけではauto-pass側の見逃しを学べないため、routeと観測確率は必須である。online結果とoffline replayの改善はevidence_levelを分ける。

probeは既存のscreenshot QAから始める。時系列で月またはbuild windowを分け、現在windowでthresholdとreplay batchを決め、次windowを未観測testにする。baselineは①representative random、②error-only、③representative＋uncertainty＋recentを分布guardrail付きで構成する。指標はauto-pass率、audit補正FNR、人手分数、slice別miss、次windowのregression、score calibrationとする。初期batchは固定配分でよく、LLMに自由選択させる前にdeterministic selectorで差を測る。

運用gateは、全件VLMより費用を下げ、deterministic-onlyより重要missを減らし、blind auditでauto-pass側の誤りを継続観測できること。rationaleを学習へ戻す場合もhuman labelを正本とし、根拠が画像上の観測に接地しているかをkeep / repair / dropする。onlineの判定、offlineの改善候補、実際の昇格は別権限に保つ。

■ メリット・デメリット
メリットは、高価な視覚判断を価値の高いsliceへ集中できること、human escalationとrollbackを残せること、labelの観測経路まで記録してfeedback biasを評価できることだ。代表例を核にしたreplayは、珍しい失敗だけへの過適合を抑え、次window評価でdriftも検出しやすい。

デメリットは、routing scoreとthresholdの校正、blind auditの継続費用、propensity管理が必要なことだ。upstreamが誤ってeasy扱いした領域はVLMに届かず、auditが弱ければ永久に見えない。単一signalの社内事例をゲーム全体へ外挿できず、agent componentを増やすほどversion・権限・証拠レベルの管理も重くなる。

■ 判定
部分採用。deterministic check、grey-zone VLM、人手escalation、auto-pass auditの三段階routingと、観測経路付きFeedback Memoryをscreenshot QAの限定probeで試す。error-only学習は避け、representative baseline、分布guardrail、次build window評価を必須にする。online改善とoffline evidenceを分離して効果を判定する。

■ URL
https://arxiv.org/abs/2608.24040
