■ 概要
Tree-of-Concerns は、論文が自ら書いていない限界を、単発の「問題点を挙げよ」ではなく、専門観点ごとの独立探索、反証、横断校正の順で抽出する multi-agent 手法である。問題設定は、著者が page 制約や blind spot のために limitation を過小報告し、一般的な自動査読も目立つ既知の欠点に集中して、未記載の失敗条件を拾えないことにある。

手法は、scope、methodology、theoretical、reproducibility、fairness の 5 種の skeptic を独立した debate tree として動かす。各 node は、① skeptic が論文中の証拠を引いて concern を提出、② Paper Advocate が著者側から「対象外」「既に対処済み」「推測的」と反論、③ skeptic が主張を修正または撤回、④ moderator が「より深い問題か」「より具体的な証拠があるか」「単なる言い換えでないか」を判定する 4 段階で進む。展開は depth 1 に制限し、深過ぎる推測を防ぐ。最後の Panel Review が全 concern を 5 観点で再評価し、Endorse、Merge、Downgrade、Reclassify、Reject のいずれかに分ける。これにより、独立探索で多様性を保ちつつ、重複、category drift、severity の過大評価を後段で直す。

評価用の ToC-Bench は 414 本の論文と 1,905 件の未記載 limitation からなり、971 件は OpenReview の weakness、934 件は後続論文による critique に由来する。著者が自身で言及した制約は除外される。gold tier から stratified に選んだ 100 論文の held-out 評価で、ToC+Panel は Coverage@10 36.1%、Precision 40.3%、Validity 4.3/5、Specificity 4.0/5、Novelty 4.2/5 を記録した。最強 baseline の Single-skeptic CoT は 32.6%、22.5%、3.5、3.4、3.2 で、要約にある precision 79% 向上、coverage 11% 向上はそれぞれ相対改善率である。結論は、専門化が発見範囲を広げ、node 内反証が弱い懸念を落とし、横断 review が最終出力の分類と深刻度を校正する、というものである。

■ 内容分析
この手法の核は「agent の数」ではなく、発散と収束を分離したことにある。初めから多数決や共通文脈に入れると、最初のもっともらしい懸念に他の観点が引きずられる。ToC は branch 間通信を後回しにし、その代わり各 branch 内に著者側の反証を入れる。異なる観点を残すことと、根拠の薄い批判を残すことを切り分けた設計が重要である。

Ablation もこの読みを支持する。specialized branch を外す No-Branching は Precision 24.0% だが Coverage@10 7.6%、Novelty 2.6 まで落ちる。expansion を外すと Coverage@10 14.9%、Specificity 2.8 で、表面的な指摘から構造的な失敗条件へ降りにくい。Panel は no-Panel の Precision 34.6% を 40.3% へ 5.7 point 上げた。実際、908 件の生存 claim の 43.8% に Merge、Downgrade、Reclassify のいずれかを施し、Reject は 0.2% だけである。Panel は不良 claim をまとめて捨てる gate ではなく、前段で生き残った指摘の位置と重さを整える calibrator である。

一方、数値の外插には注意が要る。評価対象は ML、NLP、CV の論文に限られ、gold も reviewer と citation が指摘したもののみで網羅的ではない。matching は LLM-as-judge、質的評価は同一組織の人間 2 名と LLM 2 名である。fairness の出力比率は gold 0.9% に対し ToC 18.5% で、著者は reviewer 側の注意の偏りと解釈するが、gold にない有効な発見と過剰生成をこの評価だけで切り分けられない。論文中の文言と完全一致する証拠 quote も ToC+Panel で 61.6% に留まる。複数 section の統合が理由とされるが、推論の深さと証拠のずれは別に監査すべきである。

また、全手法が見逃した limitation の 43% は後続研究など外部知識が必要、30% は 3 section 以上に跨がる multi-step reasoning、27% は統計的な微妙さが原因だった。原文単体を何度討論しても、後で起きた再現失敗や未来の運用条件は生成できない。これは大きな multi-agent 構成で解消する問題ではなく、retrieval、実行ツール、人間の事後検証を追加すべき境界である。

■ 自分達の環境への適用
移植先は、ゲーム設計書、playtest 報告、headless test 結果、postmortem の「書かれていない失敗条件」を拾う review 工程がよい。観点は論文用の 5 種をそのまま使わず、①操作・可読性、②ルール・支配戦略・難度曲線、③コンテンツ範囲・プレイスタイル、④実装・再現性、⑤ accessibility・快適性のようにドメインへ合わせて再設計する。それぞれが claim、category、major/minor、引用または artifact の evidence を出し、反証側は仕様、build hash、seed、trace、動画 frame、過去の player feedback で応答する。根拠が無ければ撤回し、生き残った concern だけを横断校正する。

最初の probe は新規企画に使わず、過去の 10 件程度の制作資料で retrospective に行う。入力は当時の設計書と初期 test だけに制限し、後日の修正 commit、Nao_u の feedback、既知 bug、離脱点を隠した gold concern とする。zero-shot review、3 観点の depth-0 版、3 観点 + advocate + panel を比べ、gold coverage、concern precision、新規だが人間確認で有効な件数、重複率、severity 訂正率、証拠不一致率、呼出コストを計測する。全 5 branch、45 call、約 $2.40/資料、約 10 分という論文の構成は日常 cycle には重いため、価値が確認できた観点だけを残す。

headless 評価では、LLM の批判自体を pass/fail oracle にしない。たとえば「難度が急」という concern から、連続ダメージ、復帰時間、資源欠損、入力遅延といった測定可能な仮説へ分解し、同一 build、seed、script で検証する。最終出力は永続 rule ではなく concern candidate とし、再現証拠がついた時だけ issue や設計判断へ昇格させる。

■ メリット・デメリット
メリットは、一般的な「面白いか」「バグがないか」では漏れる観点を分離し、各指摘に evidence と撤回機会を持たせられることである。独立 branch は観点の同質化を抑え、advocate は雑な悲観論を減らし、panel は同一原因の重複起票と深刻度のインフレを抑える。全件を自動修正する前に、失敗条件の候補を作る工程としては使い道が明確である。

デメリットは、persona の分け方が新たな blind spot を作ること、複数 agent が同じ誤読を共有すると討論でも直らないこと、コストが大きいことである。論文でも zero-shot の 1 call、$0.05 に対し ToC+Panel は約 45 call、$2.40 で 48 倍。しかも Precision 40.3% なので、出力を事実や実装指示として直接使う品質ではない。後続事例を検索しない single-document 分析、図表・数式・code を実質的に扱えない text-only 入力、非網羅的 gold と LLM judge に依存する評価も、成果の上限と不確実性を同時に示している。

■ 判定
部分採用。採用するのは、観点別の独立探索、証拠付き claim、著者側からの反証と撤回、最後の重複・category・severity 校正という構造である。日常運用への全面導入はせず、過去の後発不具合を gold にした小規模 probe で zero-shot よりも有効な未記載条件を増やせるか確かめる。判定は人間と deterministic test に残し、retrieval が必要な問題や統計・数値問題は別の検証経路へ回す。

■ URL
https://arxiv.org/abs/2608.20777v1
